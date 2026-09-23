import {clamp,normalizePoint,pointWidth,validateWork,validateStrokes,saveDecision,makePrompt,quizChoice,MAX_POINTS} from './core.mjs';
import {listWorks,putWork,removeWork} from './storage.mjs';
import {strokeSVG,animatedStrokeSVG,paintStrokes,paintArtwork} from './render.mjs';
import {inkWidth} from './brush.mjs';
import {LESSONS,DEFAULT_LESSON,getLesson,makeQuiz,checkGlyph} from './lessons.mjs';
import {setupCouplets} from './couplets.mjs';
import {setupJourney} from './journey.mjs';

const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const canvas=$('#ink-canvas'),ctx=canvas.getContext('2d'),modal=$('#modal');
let data,strokes=[],redoStack=[],brushSize=28,brushMode='ink',inkLoad=.78,guide=true,dirty=false,currentId=null,currentName='',works=[];
let drawingRevision=0,modalSession=0;
let lesson=getLesson(DEFAULT_LESSON),lessonRequest=0;
let coupletEditor=null,journey=null;
const drafts=new Map(),glyphCache=new Map();
let activePointer=null,activeStroke=null,lastPointTime=0,pointCount=0,frame=0,sequence=0,playing=false,timer=null,toastTimer=null,modalReturn=null,collectionGeneration=0;
const copy=value=>structuredClone(value);
const settledCanvas=document.createElement('canvas'),settledCtx=settledCanvas.getContext('2d');
let bakedStrokes=[];
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').hidden=true;},4200);}
function stopSequence(){playing=false;clearTimeout(timer);$('#play-symbol').textContent='▶';$('#play-sequence').setAttribute('aria-label','Play stroke sequence');}
function setRoute(){
  const route=['learn','studio','couplets','collection','process'].includes(location.hash.slice(1))?location.hash.slice(1):'learn';
  finishStroke();coupletEditor?.finish();journey?.finish();stopSequence();
  $$('.view').forEach(el=>el.hidden=el.id!==`view-${route==='learn'?'journey':route}`);
  $$('[data-route]').forEach(el=>{if(el.dataset.route===route)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  document.title=({learn:'Ink & Wishes — a little ink, a personal wish',studio:'Ink & Wishes — your writing desk',couplets:'春联工坊 — Ink & Wishes',collection:'Your collection — Ink & Wishes',process:'Behind the ink — Ink & Wishes'})[route];
  if(route==='collection')renderCollection();
  if(route==='learn')requestAnimationFrame(()=>journey?.resize());
  if(route==='studio')requestAnimationFrame(resizeCanvas);
  if(route==='couplets')requestAnimationFrame(()=>coupletEditor?.resize());
}
window.addEventListener('hashchange',setRoute);
function updateDrawingUI(){
  $('#undo').disabled=!strokes.length;$('#redo').disabled=!redoStack.length;
  $('#create-envelope').disabled=!strokes.length;$('#save-practice').disabled=!strokes.length;
  $('#brush-options span').textContent=brushMode==='ink'?'Ink brush':brushMode==='flow'?'Flow':'Steady';
  $('#paper-hint').style.opacity=strokes.length?'0':'1';
  $('#stroke-count').textContent=strokes.length?`${strokes.length} ${strokes.length===1?'stroke':'strokes'} · ${dirty?'not saved yet':'saved in this browser'}`:'Your first mark is a good beginning.';
}
function redraw(){
  frame=0;
  const complete=activeStroke?strokes.slice(0,-1):strokes;
  const prefix=bakedStrokes.length<=complete.length&&bakedStrokes.every((s,i)=>s===complete[i]);
  if(!prefix){settledCtx.clearRect(0,0,settledCanvas.width,settledCanvas.height);bakedStrokes=[];}
  if(complete.length>bakedStrokes.length){
    paintStrokes(settledCtx,complete.slice(bakedStrokes.length),{x:0,y:0,w:canvas.width,h:canvas.height});
    bakedStrokes=complete.slice();
  }
  ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.drawImage(settledCanvas,0,0);
  if(activeStroke)paintStrokes(ctx,[activeStroke],{x:0,y:0,w:canvas.width,h:canvas.height});
}
function scheduleDraw(){if(!frame)frame=requestAnimationFrame(redraw);}
function resizeCanvas(){
  const box=canvas.getBoundingClientRect();if(!box.width)return;
  const dpr=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);settledCanvas.width=canvas.width;settledCanvas.height=canvas.height;bakedStrokes=[];redraw();
}
new ResizeObserver(resizeCanvas).observe($('#paper'));
function drawingPoint(event){return normalizePoint(event.clientX,event.clientY,canvas.getBoundingClientRect());}
function finishStroke(){
  if(activePointer!==null){const id=activePointer;if(activeStroke?.mode==='ink')activeStroke.finished=true;activePointer=null;activeStroke=null;try{canvas.releasePointerCapture(id);}catch{}scheduleDraw();updateDrawingUI();}
}
canvas.addEventListener('pointerdown',event=>{
  if(activePointer!==null||event.button!==0||!event.isPrimary)return;
  if(pointCount>=MAX_POINTS){toast('This page has reached its drawing limit. Save or download it, then start a new page.');return;}
  const p=drawingPoint(event);if(!p)return;
  event.preventDefault();activePointer=event.pointerId;canvas.setPointerCapture(event.pointerId);
  activeStroke={mode:brushMode,points:[{...p,w:brushMode==='ink'?inkWidth(brushSize/1000,0,event.pointerType==='pen'?event.pressure:null):brushSize/1000}]};
  if(brushMode==='ink'){activeStroke.ink=inkLoad;activeStroke.finished=false;activeStroke.seed=crypto.getRandomValues(new Uint32Array(1))[0];}strokes.push(activeStroke);pointCount++;redoStack=[];dirty=true;drawingRevision++;lastPointTime=event.timeStamp;scheduleDraw();updateDrawingUI();
});
function extendStroke(event){
  if(event.pointerId!==activePointer||!activeStroke)return;event.preventDefault();
  const events=event.getCoalescedEvents?.();
  for(const e of events?.length?events:[event]){
    const p=drawingPoint(e);if(!p)continue;const prev=activeStroke.points.at(-1);const distance=Math.hypot(p.x-prev.x,p.y-prev.y);
    if(distance<0.0007)continue;
    if(pointCount>=MAX_POINTS){finishStroke();toast('Drawing limit reached. Save this page before starting another.');break;}
    const elapsed=Math.max(1,e.timeStamp-lastPointTime);const speed=distance/elapsed*1000;const target=brushMode==='ink'?inkWidth(brushSize/1000,speed,e.pointerType==='pen'?e.pressure:null):pointWidth(brushSize/1000,speed,brushMode);
    activeStroke.points.push({...p,w:brushMode==='steady'?target:prev.w*.6+target*.4});pointCount++;lastPointTime=e.timeStamp;
  }
  scheduleDraw();
}
canvas.addEventListener('pointermove',extendStroke);
canvas.addEventListener('pointerup',event=>{if(event.pointerId===activePointer){extendStroke(event);finishStroke();}});
for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,event=>{if(event.pointerId===activePointer)finishStroke();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){finishStroke();stopSequence();}});
function undo(){finishStroke();if(strokes.length){const s=strokes.pop();redoStack.push(s);pointCount-=s.points.length;dirty=true;drawingRevision++;redraw();updateDrawingUI();}}
function redo(){finishStroke();if(redoStack.length){const s=redoStack.pop();strokes.push(s);pointCount+=s.points.length;dirty=true;drawingRevision++;redraw();updateDrawingUI();}}
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
document.addEventListener('keydown',event=>{
  if(modal.open||$('#view-studio').hidden||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}
});
window.addEventListener('beforeunload',event=>{if((dirty&&strokes.length)||[...drafts.values()].some(d=>d.dirty&&d.strokes.length)||coupletEditor?.hasUnsaved()||journey?.hasUnsaved()){event.preventDefault();event.returnValue='';}});
$('#toggle-guide').addEventListener('click',()=>{guide=!guide;$('#toggle-guide').setAttribute('aria-pressed',String(guide));$('#guide-grid').hidden=!guide;$('#trace-guide').hidden=!guide;});
$('#appearance').addEventListener('click',()=>{const solid=document.body.classList.toggle('solid');$('#appearance').setAttribute('aria-pressed',String(solid));$('#appearance').setAttribute('aria-label',solid?'Use glass controls':'Use solid controls');try{localStorage.setItem('ink-wishes-solid',String(solid));}catch{}});
try{if(localStorage.getItem('ink-wishes-solid')==='true'){$('#appearance').click();}}catch{}

const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let reducedChoice=false;try{reducedChoice=localStorage.getItem('ink-wishes-reduced-motion')==='true';}catch{}
function motionPreference(){const reduced=systemMotion.matches||reducedChoice;document.body.classList.toggle('reduce-motion',reduced);$('#motion-toggle').setAttribute('aria-pressed',String(reduced));$('#motion-toggle').textContent=systemMotion.matches?'Reduced motion · system':reduced?'Motion reduced':'Reduce motion';$('#motion-toggle').disabled=systemMotion.matches;}
$('#motion-toggle').onclick=()=>{reducedChoice=!reducedChoice;try{localStorage.setItem('ink-wishes-reduced-motion',String(reducedChoice));}catch{}motionPreference();};systemMotion.addEventListener('change',motionPreference);motionPreference();

function openModal(eyebrow,html){modalSession++;finishStroke();stopSequence();$('#modal-eyebrow').textContent=eyebrow;$('#modal-content').innerHTML=html;if(!modal.open){modalReturn=document.activeElement;modal.showModal();}modal.scrollTop=0;}
function closeModal(){modal.close();}
$('#close-modal').addEventListener('click',closeModal);
modal.addEventListener('close',()=>{modalSession++;modalReturn?.focus();});
modal.addEventListener('click',event=>{if(event.target===modal){const r=modal.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeModal();}});
function confirmAction(title,description,label,action){
  openModal('A MOMENT BEFORE YOU GO',`<h2 id="modal-title"></h2><p id="confirm-description"></p><div class="modal-actions"><button class="button button-light" id="confirm-cancel">Keep it</button><button class="button button-dark" id="confirm-do"></button></div>`);
  $('#modal-title').textContent=title;$('#confirm-description').textContent=description;$('#confirm-do').textContent=label;
  $('#confirm-cancel').onclick=closeModal;$('#confirm-do').onclick=()=>{closeModal();action();};
}
function newPage(){drawingRevision++;strokes=[];redoStack=[];pointCount=0;dirty=false;currentId=null;currentName='';redraw();updateDrawingUI();toast('A fresh page.');}
$('#new-page').addEventListener('click',()=>{if(strokes.length)confirmAction('Begin again?','This clears the drawing on your desk. Saved works stay in your collection.','Clear this page',newPage);else newPage();});

function showBrush(){
  openModal('INK & BRISTLE · 笔墨',`<h2 id="modal-title">Find your brush’s rhythm.</h2>
    <div class="brush-preview"><canvas id="brush-preview-canvas" width="800" height="160" aria-label="Preview of the selected brush and ink load"></canvas></div>
    <div class="mode-options brush-modes">
      <label><input type="radio" name="brush-mode" value="ink" ${brushMode==='ink'?'checked':''}>Ink brush <span lang="zh">毛笔</span><small>A soft belly, tapered tips, and fine bristle texture.</small></label>
      <label><input type="radio" name="brush-mode" value="steady" ${brushMode==='steady'?'checked':''}>Steady<small>A smooth, even line for simple practice.</small></label>
      <label><input type="radio" name="brush-mode" value="flow" ${brushMode==='flow'?'checked':''}>Flow<small>A smooth line that follows your movement speed.</small></label>
    </div>
    <label class="range-label" for="brush-size">Brush size <output id="brush-size-output">${brushSize}</output></label>
    <input type="range" id="brush-size" min="5" max="60" value="${brushSize}">
    <div id="ink-load-control"><label class="range-label" for="ink-load">Ink load · 墨量 <output id="ink-load-output">${Math.round(inkLoad*100)}%</output></label>
    <input type="range" id="ink-load" min="15" max="100" value="${Math.round(inkLoad*100)}"><div class="ink-scale"><span>Dry · 飞白</span><span>Full · 浓墨</span></div></div>
    <p class="brush-tip" id="brush-tip"></p>
    <div class="modal-actions"><button id="brush-done" class="button button-dark">Back to the paper ↗</button></div>`);
  const preview=()=>{
    const c=$('#brush-preview-canvas'),cx=c.getContext('2d');cx.clearRect(0,0,c.width,c.height);
    const points=Array.from({length:85},(_,i)=>{const t=i/84;return{x:.08+t*.84,y:.1+Math.sin(t*Math.PI*2)*.024,w:brushMode==='ink'?inkWidth(brushSize/1000,.2+Math.pow(Math.sin(t*Math.PI*2),2)*1.9):pointWidth(brushSize/1000,t*1.8,brushMode)};});
    paintStrokes(cx,[{mode:brushMode,ink:inkLoad,seed:31,finished:true,points}],{x:0,y:0,w:800,h:800});
    $('#ink-load-control').hidden=brushMode!=='ink';
    $('#brush-tip').textContent=brushMode==='ink'?'Move slowly for a fuller mark; move quickly for a fine stroke. Less ink reveals the paper. A compatible pen can also vary width with pressure.':'Your settings apply to the next strokes. Existing marks stay as you made them.';
    updateDrawingUI();
  };
  $('#brush-size').oninput=event=>{brushSize=Number(event.target.value);$('#brush-size-output').textContent=String(brushSize);preview();};
  $('#ink-load').oninput=event=>{inkLoad=Number(event.target.value)/100;$('#ink-load-output').textContent=`${Math.round(inkLoad*100)}%`;preview();};
  $$('input[name=brush-mode]').forEach(input=>input.onchange=()=>{brushMode=input.value;preview();});
  $('#brush-done').onclick=closeModal;preview();
}
$('#brush-options').addEventListener('click',showBrush);
function setSequence(index){
  if(!data)return;sequence=(index+data.strokes.length)%data.strokes.length;
  $('#sequence-glyph').innerHTML=animatedStrokeSVG(data,sequence,{animate:!systemMotion.matches&&!document.body.classList.contains('reduce-motion'),label:`${lesson.char}: stroke ${sequence+1} of ${lesson.count}`});
  $('#sequence-glyph').setAttribute('aria-label',`${lesson.char}: stroke ${sequence+1} of ${lesson.count}`);$('#sequence-counter').textContent=`${sequence+1} / ${lesson.count}`;
  $('#sequence-caption').textContent=lesson.captions[sequence];
  $$('#sequence-dots button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===sequence)));
}
$('#previous-stroke').onclick=()=>{stopSequence();setSequence(sequence-1);};$('#next-stroke').onclick=()=>{stopSequence();setSequence(sequence+1);};
$('#play-sequence').onclick=()=>{
  if(!data)return;if(playing){stopSequence();return;}playing=true;$('#play-symbol').textContent='Ⅱ';$('#play-sequence').setAttribute('aria-label','Pause stroke sequence');setSequence(0);
  const next=()=>{if(!playing)return;if(sequence===lesson.count-1){stopSequence();return;}setSequence(sequence+1);timer=setTimeout(next,1500);};timer=setTimeout(next,1500);
};
function showLesson(){
  openModal('A CHARACTER TO EXPLORE',`<h2 id="modal-title">The meaning of ${lesson.char}.</h2><div class="lesson-feature"><div class="lesson-glyph">${data?strokeSVG(data,{label:lesson.char}):lesson.char}</div><div><p class="pinyin">${lesson.pinyin}</p><p>${lesson.meaning}</p></div></div><h3>A little context</h3><p>${lesson.context}</p><h3>Try this on the paper</h3><p>${lesson.practice}</p><p>This lesson uses a ${lesson.count}-stroke standard-character model. Watch the sequence, notice the spaces, and try it yourself. The digital brush introduces mark-making; it does not reproduce every quality of a physical brush.</p><ul class="source-list"><li><a href="${lesson.source}" target="_blank" rel="noreferrer">Ministry of Education: ${lesson.char}, pronunciation and meaning ↗</a></li><li><a href="${lesson.connection.url}" target="_blank" rel="noreferrer">${lesson.connection.title} ↗</a></li></ul><div class="modal-actions"><button id="lesson-practice" class="button button-dark">Try it on the paper ↗</button></div>`);
  $('#lesson-practice').onclick=()=>{closeModal();location.hash='studio';};
}
$('#open-lesson').onclick=showLesson;
function showSources(){
  openModal('REFERENCES & OPEN-SOURCE CREDITS',`<h2 id="modal-title">The ink has a history.</h2><ul class="source-list">${LESSONS.map(l=>`<li><a href="${l.source}" target="_blank" rel="noreferrer">Ministry of Education: ${l.char} / ${l.pinyin}</a> — pronunciation and meaning.</li>`).join('')}<li><a href="https://www.metmuseum.org/essays/chinese-calligraphy" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a> — calligraphy, brushwork, and expression.</li><li><a href="https://ich.unesco.org/en/RL/spring-festival-social-practices-of-the-chinese-people-in-celebration-of-traditional-new-year-02126" target="_blank" rel="noreferrer">UNESCO</a> — Spring Festival practices.</li><li><a href="https://www.npm.gov.tw/Activity-Content.aspx?l=1&sno=04014430" target="_blank" rel="noreferrer">National Palace Museum</a> — a cultural-learning activity with festive decorations and envelopes.</li><li><a href="https://github.com/chanind/hanzi-writer-data" target="_blank" rel="noreferrer">Hanzi Writer Data 2.0.1</a>, derived from <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noreferrer">Make Me a Hanzi</a> — the unmodified data for all six characters, used consistently in each guide, reference, and quiz.</li></ul><p class="credits-note">Landscape background: generated for this project with OpenAI image generation. Glyph data: Copyright © 1999 Arphic Technology Co., Ltd.; Make Me a Hanzi contributors. Distributed under the Arphic Public License, without warranty. <a href="data/ARPHICPL.TXT" target="_blank" rel="noreferrer">Read the full license</a> · <a href="data/${lesson.id}.json" download="${lesson.id}.json">Download ${lesson.char} glyph data</a>.</p><p class="modal-note">This is an introductory student prototype. Human calligraphy review and learner testing are still pending. It teaches the selected model; it does not grade the artistic quality of your writing.</p>`);
}
$('#open-sources').onclick=showSources;$('#footer-sources').onclick=showSources;

function startQuiz(){
  if(!data){toast('The stroke reference is still loading. Please try again.');return;}
  const quiz=makeQuiz(lesson);
  let question=0,firstCorrect=0,attempted=false;
  function showQuestion(){
    const q=quiz[question];attempted=false;
    openModal(`${lesson.char} · A ${quiz.length}-QUESTION WARM-UP`,`<div class="quiz-progress" aria-label="Question ${question+1} of ${quiz.length}">${quiz.map((_,i)=>`<i class="${i<question?'done':''}"></i>`).join('')}</div><h2 id="modal-title">Which stroke comes next?</h2><p>${q.target===0?'Start at the beginning. Find the first mark.':`You have ${q.target} ${q.target===1?'stroke':'strokes'}. Find stroke ${q.target+1}.`}</p><div class="quiz-glyph">${strokeSVG(data,{before:q.target,ghost:false,label:'Strokes already written'})}</div><div class="quiz-options" style="--choices:${q.options.length}">${q.options.map((index,i)=>`<button class="quiz-option" data-choice="${i}" aria-label="Option ${'ABC'[i]}">${strokeSVG(data,{active:index,before:q.target,ghost:true,label:`Option ${'ABC'[i]}: highlighted next stroke`})}<span>Option ${'ABC'[i]}</span></button>`).join('')}</div><div class="quiz-feedback" role="status" id="quiz-feedback">Choose the next stroke from the highlighted options.</div><div class="modal-actions"><button class="text-link" id="quiz-skip">Go straight to practice ↗</button><button class="button button-dark" id="quiz-next" disabled>${question===quiz.length-1?'Finish warm-up':'Next question'} ↗</button></div>`);
    $$('.quiz-option').forEach(button=>button.onclick=()=>{
      const choice=Number(button.dataset.choice),correct=quizChoice(question,choice,quiz);
      if(!attempted&&correct)firstCorrect++;attempted=true;
      if(correct){button.classList.add('correct');$$('.quiz-option').forEach(b=>b.disabled=true);$('#quiz-feedback').innerHTML=`<strong>That’s the next stroke.</strong><p>${q.hint}</p>`;$('#quiz-next').disabled=false;}
      else{button.classList.add('incorrect');button.disabled=true;const letter='ABC'[q.options.indexOf(q.target)];$('#quiz-feedback').innerHTML=`<strong>Take another look. The reference uses option ${letter}.</strong><p>${q.hint} Choose that stroke to continue.</p>`;}
    });
    $('#quiz-skip').onclick=()=>{closeModal();location.hash='studio';};
    $('#quiz-next').onclick=()=>{if(question<quiz.length-1){question++;showQuestion();}else finishQuiz();};
  }
  function finishQuiz(){openModal('WARM-UP COMPLETE',`<div class="quiz-complete"><div class="completion-mark" aria-hidden="true">✧</div><h2 id="modal-title">Now, make your mark.</h2><p>You recognized ${firstCorrect} of ${quiz.length} strokes on the first try. Every explanation is another chance to learn.</p><p class="modal-note">This checks the selected sequence, not your artistic ability.</p><button class="button button-dark" id="quiz-practice">Back to the paper ↗</button></div>`);$('#quiz-practice').onclick=()=>{closeModal();location.hash='studio';};}
  showQuestion();
}
$('#open-quiz').onclick=startQuiz;

async function download(strokeData,kind,name='my-wish',options={}){
  const exportCanvas=document.createElement('canvas');paintArtwork(exportCanvas,strokeData,kind,options);
  const blob=await new Promise(resolve=>exportCanvas.toBlob(resolve,'image/png'));if(!blob){toast('The image could not be created. Please try again.');return;}
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${name.replace(/[^\p{L}\p{N}_ -]/gu,'').trim().slice(0,50)||'my-wish'}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Your PNG is ready. Check your downloads.');
}
function showEnvelope(){
  if(!strokes.length)return;finishStroke();
  openModal('YOUR WRITING, A LITTLE GIFT',`<h2 id="modal-title">A wish to keep.</h2><div class="envelope-layout"><div class="envelope-scene"><canvas id="envelope-preview" aria-label="Your handwritten red-envelope design"></canvas></div><div class="envelope-actions"><p>Your marks, on a red-envelope front. Save an editable copy here, or download an image to share.</p><button class="button button-dark" id="save-envelope">Save to collection ↗</button><button class="button button-light" id="download-envelope">Download PNG ↓</button><button class="text-link" id="return-writing">Keep writing ↗</button><p class="modal-note">1200 × 2000 pixels.<br>A digital design, not a folding template.</p></div></div>`);
  paintArtwork($('#envelope-preview'),strokes,'envelope');$('#save-envelope').onclick=()=>showSave('envelope');$('#download-envelope').onclick=()=>download(copy(strokes),'envelope',currentName||'my-wish');$('#return-writing').onclick=closeModal;
}
$('#create-envelope').onclick=showEnvelope;$('#save-practice').onclick=()=>showSave('practice');
async function showSave(kind,editor=null){
  if(!editor&&!strokes.length)return;finishStroke();const snapshot=copy(editor?editor.payload:strokes),savedRevision=editor?editor.revision:drawingRevision,savedLesson=editor?.lesson??lesson.id,savedDedication=editor?.dedication?copy(editor.dedication):undefined,savedBrush=copy(editor?editor.brush:{size:brushSize,mode:brushMode,ink:inkLoad}),savedId=editor?editor.id:currentId;
  openModal('KEEP YOUR MARKS',`<h2 id="modal-title">Give this piece a name.</h2><label class="form-label" for="work-name">Work name</label><input id="work-name" type="text" maxlength="60" placeholder="A wish for a friend" autocomplete="off"><p class="modal-note">Saved in this browser, on this device. Up to three editable works.</p><div id="save-slots"></div><p id="save-error" class="modal-error" role="alert"></p><div class="save-actions"><button class="button button-light" id="save-download">Download instead ↓</button><button class="button button-dark" id="commit-save" disabled>Loading collection…</button></div>`);
  const saveSession=modalSession;
  $('#work-name').value=editor?editor.name:currentName;$('#save-download').onclick=()=>download(snapshot,kind,$('#work-name').value||'my-wish',{dedication:savedDedication,lesson:savedLesson});
  let existing,chosenId=savedId,confirmedReplace=false;
  try{existing=await listWorks();}catch(error){if(modalSession===saveSession&&$('#save-error'))$('#save-error').textContent=error.message;return;}
  if(modalSession!==saveSession||!$('#commit-save'))return;
  const decision=saveDecision(existing,savedId);
  if(decision==='full'){
    chosenId=null;$('#save-slots').innerHTML='<p>Your collection is full. Select the work you want to replace.</p><div class="work-slots"></div>';
    existing.forEach(work=>{const b=document.createElement('button');b.className='slot-option';b.textContent=work.name;b.setAttribute('aria-pressed','false');b.onclick=()=>{chosenId=work.id;confirmedReplace=true;$$('.slot-option').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));$('#commit-save').disabled=false;$('#commit-save').textContent='Replace selected work';};$('.work-slots').append(b);});
    $('#commit-save').textContent='Choose a work to replace';
  }else{
    $('#commit-save').disabled=false;$('#commit-save').textContent=decision==='replace'?'Replace saved version':'Save this work';
    if(decision==='replace'){$('#save-slots').innerHTML='<p class="modal-note">This will replace the saved version of the work you opened.</p>';confirmedReplace=true;}
  }
  $('#commit-save').onclick=async()=>{
    const name=$('#work-name').value.trim();if(!name){$('#save-error').textContent='Give your work a name first.';$('#work-name').focus();return;}
    const button=$('#commit-save');button.disabled=true;button.textContent='Saving…';$('#save-error').textContent='';
    try{
      const work={version:1,id:chosenId||crypto.randomUUID(),name,kind,updatedAt:Date.now(),brush:savedBrush,...(kind==='couplet'?{couplet:snapshot}:{lesson:savedLesson,strokes:snapshot,...(savedDedication?{dedication:savedDedication}:{})})};
      await putWork(work,{replace:confirmedReplace});if(editor){if(editor.saved)editor.saved(work,savedRevision);else coupletEditor.saved(work,savedRevision);}else if(drawingRevision===savedRevision){currentId=work.id;currentName=name;dirty=false;updateDrawingUI();}listWorks().then(rows=>{works=rows;$('#nav-count').textContent=String(rows.length);}).catch(()=>{});if(modalSession===saveSession)closeModal();toast('Saved in this browser. Find it in your collection.');
    }catch(error){if(modalSession===saveSession&&$('#save-error')){$('#save-error').textContent=error.message;button.disabled=false;button.textContent=confirmedReplace?'Try replacement again':'Try saving again';}}
  };
}
async function renderCollection(){
  const generation=++collectionGeneration;$('#collection-status').textContent='Loading your collection…';$('#collection-grid').replaceChildren();
  try{works=await listWorks();}catch(error){if(generation!==collectionGeneration)return;$('#collection-status').textContent=error.message;return;}
  if(generation!==collectionGeneration)return;$('#collection-status').textContent='';$('#nav-count').textContent=String(works.length);
  for(const work of works){
    const card=document.createElement('article');card.className='collection-card';const art=document.createElement('div');art.className='collection-art';const preview=document.createElement('canvas');preview.setAttribute('aria-label',`Preview of ${work.name}`);art.append(preview);const title=document.createElement('h2');title.textContent=work.name;const meta=document.createElement('p');meta.textContent=`${work.kind==='couplet'?'春联 · Spring couplet':`${getLesson(work.lesson??DEFAULT_LESSON)?.char??''} · ${work.kind==='keepsake'?'Personal keepsake':work.kind==='envelope'?'Red-envelope design':'Practice sheet'}`} · ${new Date(work.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
    const actions=document.createElement('div');actions.className='collection-actions';const open=document.createElement('button'),dl=document.createElement('button'),remove=document.createElement('button');for(const b of [open,dl,remove])b.className='text-link';open.textContent='Open & edit ↗';dl.textContent='PNG ↓';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${work.name}`);
    let valid=true;try{validateWork(work);paintArtwork(preview,work.kind==='couplet'?work.couplet:work.strokes,work.kind,{thumbnail:true,dedication:work.dedication,lesson:work.lesson});}catch{valid=false;meta.textContent='This saved work could not be read. You can remove it to free a slot.';open.disabled=true;dl.disabled=true;}
    open.onclick=()=>{
      if(!valid)return;
      if(work.kind==='couplet'){coupletEditor.openWork(work);return;}
      if(work.kind==='keepsake'){journey.openWork(work);return;}
      const apply=async()=>{if(await chooseLesson(work.lesson??DEFAULT_LESSON,{work})){location.hash='studio';toast('Opened for editing. Your saved version stays until you replace it.');}};
      const target=drafts.get(work.lesson??DEFAULT_LESSON);
      if(((work.lesson??DEFAULT_LESSON)===lesson.id&&dirty&&strokes.length)||(target?.dirty&&target.strokes.length))confirmAction('Open this saved piece?','This opens the saved version on its character’s desk. Any unsaved draft for that character will be replaced.','Open saved work',apply);else apply();
    };
    dl.onclick=()=>download(work.kind==='couplet'?work.couplet:work.strokes,work.kind,work.name,{dedication:work.dedication,lesson:work.lesson});
    remove.onclick=()=>confirmAction('Remove this saved work?',`“${work.name}” will be removed from this browser’s collection. Download a copy first if you want to keep it.`,'Remove saved work',async()=>{try{await removeWork(work.id);coupletEditor.removed(work.id);journey.removed(work.id);if(currentId===work.id){currentId=null;dirty=!!strokes.length;updateDrawingUI();}for(const draft of drafts.values()){if(draft.currentId===work.id){draft.currentId=null;draft.dirty=!!draft.strokes.length;}}renderCollection();toast('Removed from this collection.');}catch(error){toast(error.message);}});
    actions.append(open,dl,remove);card.append(art,title,meta,actions);$('#collection-grid').append(card);
  }
  for(let i=works.length;i<3;i++){
    const slot=document.createElement('div');slot.className='empty-slot';slot.innerHTML=`<span class="empty-number">0${i+1}</span><h2>A space for a wish.</h2><p>${i===0?'Your first piece starts with a single mark.':'No need to fill every space. Take your time.'}</p><a href="#learn">Make your first keepsake ↗</a>`;$('#collection-grid').append(slot);
  }
}
$('#generate-prompt').onclick=()=>{try{$('#generated-prompt').value=makePrompt($('#iteration-goal').value);$('#prompt-result').hidden=false;$('#prompt-status').textContent='';}catch(error){$('#prompt-status').textContent=error.message;$('#iteration-goal').focus();}};
$('#copy-prompt').onclick=async()=>{try{await navigator.clipboard.writeText($('#generated-prompt').value);$('#prompt-status').textContent='Prompt copied. Paste it into your coding agent.';}catch{$('#generated-prompt').focus();$('#generated-prompt').select();$('#prompt-status').textContent='Copy is unavailable here. Your prompt is selected so you can copy it manually.';}};

function rememberDraft(){
  drafts.set(lesson.id,copy({strokes,redoStack,dirty,currentId,currentName,brushSize,brushMode,inkLoad}));
}
function applyDraft(draft){
  ({strokes,redoStack,dirty,currentId,currentName,brushSize,brushMode,inkLoad}=draft);
  pointCount=strokes.reduce((n,s)=>n+s.points.length,0);drawingRevision++;bakedStrokes=[];
  settledCtx.clearRect(0,0,settledCanvas.width,settledCanvas.height);redraw();updateDrawingUI();
}
function updateLessonUI(){
  $('#lesson-pinyin').textContent=lesson.pinyin;$('#lesson-meaning').textContent=lesson.meaning;
  $('#lesson-gloss').textContent=lesson.gloss;$('#paper-character').textContent=`PRACTISING · ${lesson.char}`;
  $('#open-lesson').textContent=`The story of ${lesson.char} ↗`;
  $('#open-quiz small').textContent=`A ${makeQuiz(lesson).length}-question warm-up`;
  $('#trace-guide').innerHTML=strokeSVG(data,{label:lesson.char});$$('.fu-small').forEach(el=>el.innerHTML=strokeSVG(data,{label:lesson.char}));
  $$('#character-picker button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.lesson===lesson.id)));
  $('#sequence-dots').replaceChildren();data.strokes.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Show stroke ${i+1}`);b.onclick=()=>{stopSequence();setSequence(i);};$('#sequence-dots').append(b);});
  for(const selector of ['#open-quiz','#play-sequence','#previous-stroke','#next-stroke','#toggle-guide'])$(selector).disabled=false;
  $('#guide-grid').hidden=!guide;$('#trace-guide').hidden=!guide;setSequence(0);
}
async function chooseLesson(id,{work=null,initial=false}={}){
  const next=getLesson(id);if(!next)return false;
  const request=++lessonRequest;stopSequence();
  $('#character-status').textContent=`Opening ${next.char}…`;$('#character-picker').setAttribute('aria-busy','true');
  try{
    let glyph=glyphCache.get(id);
    if(!glyph){const response=await fetch(`./data/${id}.json`);if(!response.ok)throw new Error();glyph=checkGlyph(await response.json(),next);glyphCache.set(id,glyph);}
    if(request!==lessonRequest)return false;
    if(work)validateWork(work);
    finishStroke();if(!initial||strokes.length||redoStack.length)rememberDraft();
    let draft=drafts.get(id);
    if(work)draft={strokes:copy(work.strokes),redoStack:[],dirty:false,currentId:work.id,currentName:work.name,brushSize:work.brush?.size??28,brushMode:work.brush?.mode??'ink',inkLoad:work.brush?.ink??.78};
    if(!draft)draft={strokes:[],redoStack:[],dirty:false,currentId:null,currentName:'',brushSize,brushMode,inkLoad};
    lesson=next;data=glyph;drafts.delete(id);applyDraft(copy(draft));updateLessonUI();
    $('#character-status').textContent=`${next.char} · ${next.count} strokes. Drafts stay while you switch; save to keep them after a reload.`;
    return true;
  }catch{
    if(request===lessonRequest){$('#character-status').textContent=`Could not open ${next.char}. Your current drawing is still here. Select the character to try again.`;if(!data){$('#sequence-caption').textContent='The reference is unavailable. You can still draw freely.';for(const selector of ['#open-quiz','#play-sequence','#previous-stroke','#next-stroke'])$(selector).disabled=true;}}
    return false;
  }finally{if(request===lessonRequest)$('#character-picker').setAttribute('aria-busy','false');}
}
async function boot(){
  LESSONS.forEach(l=>{const b=document.createElement('button');b.className='character-choice';b.dataset.lesson=l.id;b.setAttribute('aria-label',`${l.char} · ${l.pinyin} · ${l.meaning}`);b.setAttribute('aria-pressed',String(l.id===lesson.id));b.innerHTML=`<span lang="zh">${l.char}</span><span>${l.meaning}<small>${l.pinyin} · ${l.count} strokes</small></span>`;b.onclick=()=>chooseLesson(l.id);$('#character-picker').append(b);});
  setRoute();updateDrawingUI();listWorks().then(rows=>{works=rows;$('#nav-count').textContent=String(rows.length);}).catch(()=>{});
  await chooseLesson(DEFAULT_LESSON,{initial:true});
}
journey=setupJourney({toast,confirmAction,openModal,closeModal,onSave:editor=>showSave('keepsake',editor),download});
coupletEditor=setupCouplets({toast,confirmAction,openModal,closeModal,onSave:editor=>showSave('couplet',editor),download});
boot();
