import {clamp,normalizePoint,pointWidth,validateWork,validateStrokes,saveDecision,makePrompt,QUIZ,quizChoice,MAX_POINTS} from './core.mjs';
import {listWorks,putWork,removeWork} from './storage.mjs';
import {strokeSVG,paintStrokes,paintArtwork} from './render.mjs';

const $=selector=>document.querySelector(selector),$$=selector=>[...document.querySelectorAll(selector)];
const canvas=$('#ink-canvas'),ctx=canvas.getContext('2d'),modal=$('#modal');
let data,strokes=[],redoStack=[],brushSize=14,brushMode='steady',guide=true,dirty=false,currentId=null,currentName='',works=[];
let drawingRevision=0,modalSession=0;
let activePointer=null,activeStroke=null,lastPointTime=0,pointCount=0,frame=0,sequence=0,playing=false,timer=null,toastTimer=null,modalReturn=null,collectionGeneration=0;
const copy=value=>structuredClone(value);
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('#toast').hidden=true;},4200);}
function stopSequence(){playing=false;clearTimeout(timer);$('#play-symbol').textContent='▶';$('#play-sequence').setAttribute('aria-label','Play stroke sequence');}
function setRoute(){
  const route=['studio','collection','process'].includes(location.hash.slice(1))?location.hash.slice(1):'studio';
  finishStroke();stopSequence();
  $$('.view').forEach(el=>el.hidden=el.id!==`view-${route}`);
  $$('[data-route]').forEach(el=>{if(el.dataset.route===route)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  document.title=({studio:'Ink & Wishes — your writing desk',collection:'Your collection — Ink & Wishes',process:'Behind the ink — Ink & Wishes'})[route];
  if(route==='collection')renderCollection();
  if(route==='studio')requestAnimationFrame(resizeCanvas);
}
window.addEventListener('hashchange',setRoute);
function updateDrawingUI(){
  $('#undo').disabled=!strokes.length;$('#redo').disabled=!redoStack.length;
  $('#create-envelope').disabled=!strokes.length;$('#save-practice').disabled=!strokes.length;
  $('#paper-hint').style.opacity=strokes.length?'0':'1';
  $('#stroke-count').textContent=strokes.length?`${strokes.length} ${strokes.length===1?'stroke':'strokes'} · ${dirty?'not saved yet':'saved in this browser'}`:'Your first mark is a good beginning.';
}
function redraw(){
  frame=0;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,canvas.width,canvas.height);
  paintStrokes(ctx,strokes,{x:0,y:0,w:canvas.width,h:canvas.height});
}
function scheduleDraw(){if(!frame)frame=requestAnimationFrame(redraw);}
function resizeCanvas(){
  const box=canvas.getBoundingClientRect();if(!box.width)return;
  const dpr=Math.min(window.devicePixelRatio||1,3);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);redraw();
}
new ResizeObserver(resizeCanvas).observe($('#paper'));
function drawingPoint(event){return normalizePoint(event.clientX,event.clientY,canvas.getBoundingClientRect());}
function finishStroke(){
  if(activePointer!==null){try{canvas.releasePointerCapture(activePointer);}catch{}activePointer=null;activeStroke=null;updateDrawingUI();}
}
canvas.addEventListener('pointerdown',event=>{
  if(activePointer!==null||event.button!==0||!event.isPrimary)return;
  if(pointCount>=MAX_POINTS){toast('This page has reached its drawing limit. Save or download it, then start a new page.');return;}
  const p=drawingPoint(event);if(!p)return;
  event.preventDefault();activePointer=event.pointerId;canvas.setPointerCapture(event.pointerId);
  activeStroke={mode:brushMode,points:[{...p,w:brushSize/1000}]};strokes.push(activeStroke);pointCount++;redoStack=[];dirty=true;drawingRevision++;lastPointTime=event.timeStamp;scheduleDraw();updateDrawingUI();
});
canvas.addEventListener('pointermove',event=>{
  if(event.pointerId!==activePointer||!activeStroke)return;event.preventDefault();
  const events=event.getCoalescedEvents?.();
  for(const e of events?.length?events:[event]){
    const p=drawingPoint(e);if(!p)continue;const prev=activeStroke.points.at(-1);const distance=Math.hypot(p.x-prev.x,p.y-prev.y);
    if(distance<0.0007)continue;
    if(pointCount>=MAX_POINTS){finishStroke();toast('Drawing limit reached. Save this page before starting another.');break;}
    const elapsed=Math.max(1,e.timeStamp-lastPointTime);const target=pointWidth(brushSize/1000,distance/elapsed*1000,brushMode);
    activeStroke.points.push({...p,w:brushMode==='flow'?prev.w*.7+target*.3:target});pointCount++;lastPointTime=e.timeStamp;
  }
  scheduleDraw();
});
for(const type of ['pointerup','pointercancel','lostpointercapture']) canvas.addEventListener(type,event=>{if(event.pointerId===activePointer)finishStroke();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){finishStroke();stopSequence();}});
function undo(){finishStroke();if(strokes.length){const s=strokes.pop();redoStack.push(s);pointCount-=s.points.length;dirty=true;drawingRevision++;redraw();updateDrawingUI();}}
function redo(){finishStroke();if(redoStack.length){const s=redoStack.pop();strokes.push(s);pointCount+=s.points.length;dirty=true;drawingRevision++;redraw();updateDrawingUI();}}
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
document.addEventListener('keydown',event=>{
  if(modal.open||$('#view-studio').hidden||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;
  if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='z'){event.preventDefault();event.shiftKey?redo():undo();}
});
window.addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
$('#toggle-guide').addEventListener('click',()=>{guide=!guide;$('#toggle-guide').setAttribute('aria-pressed',String(guide));$('#guide-grid').hidden=!guide;$('#trace-guide').hidden=!guide;});
$('#appearance').addEventListener('click',()=>{const solid=document.body.classList.toggle('solid');$('#appearance').setAttribute('aria-pressed',String(solid));$('#appearance').setAttribute('aria-label',solid?'Use glass controls':'Use solid controls');try{localStorage.setItem('ink-wishes-solid',String(solid));}catch{}});
try{if(localStorage.getItem('ink-wishes-solid')==='true'){$('#appearance').click();}}catch{}

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
  openModal('YOUR TOOLS',`<h2 id="modal-title">A brush that feels like you.</h2><div class="brush-preview"><span id="brush-preview-mark"></span></div><label class="range-label" for="brush-size">Brush size <output id="brush-size-output">${brushSize}</output></label><input type="range" id="brush-size" min="5" max="32" value="${brushSize}"><div class="mode-options"><label><input type="radio" name="brush-mode" value="steady" ${brushMode==='steady'?'checked':''}>Steady<small>One consistent width. A simple place to begin.</small></label><label><input type="radio" name="brush-mode" value="flow" ${brushMode==='flow'?'checked':''}>Flow<small>Faster movement makes a thinner mark. An experimental brush.</small></label></div><p class="modal-note">Flow responds to movement speed, not pen pressure. Changing the brush affects your next strokes.</p><div class="modal-actions"><button id="brush-done" class="button button-dark">Back to the paper ↗</button></div>`);
  const preview=()=>$('#brush-preview-mark').style.height=`${brushSize}px`;preview();
  $('#brush-size').oninput=event=>{brushSize=Number(event.target.value);$('#brush-size-output').textContent=String(brushSize);preview();};
  $$('input[name=brush-mode]').forEach(input=>input.onchange=()=>brushMode=input.value);$('#brush-done').onclick=closeModal;
}
$('#brush-options').addEventListener('click',showBrush);
function setSequence(index){
  if(!data)return;sequence=(index+data.strokes.length)%data.strokes.length;
  $('#sequence-glyph').innerHTML=strokeSVG(data,{active:sequence,before:sequence,label:`Stroke ${sequence+1} of 13`});
  $('#sequence-glyph').setAttribute('aria-label',`Stroke ${sequence+1} of 13`);$('#sequence-counter').textContent=`${sequence+1} / 13`;
  const captions={0:'Begin with the small upper-left mark.',4:'Move to the upper horizontal on the right.',8:'Begin the lower-right box.',12:'Close the lower box with this final stroke.'};
  $('#sequence-caption').textContent=captions[sequence]||`Notice where stroke ${sequence+1} sits beside the earlier marks.`;
  $$('#sequence-dots button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===sequence)));
}
$('#previous-stroke').onclick=()=>{stopSequence();setSequence(sequence-1);};$('#next-stroke').onclick=()=>{stopSequence();setSequence(sequence+1);};
$('#play-sequence').onclick=()=>{
  if(!data)return;if(playing){stopSequence();return;}playing=true;$('#play-symbol').textContent='Ⅱ';$('#play-sequence').setAttribute('aria-label','Pause stroke sequence');setSequence(0);
  const next=()=>{if(!playing)return;if(sequence===12){stopSequence();return;}setSequence(sequence+1);timer=setTimeout(next,950);};timer=setTimeout(next,950);
};
function showLesson(){
  openModal('ONE CHARACTER, MANY WISHES',`<h2 id="modal-title">The meaning of 福.</h2><div class="lesson-feature"><div class="lesson-glyph">${data?strokeSVG(data):'福'}</div><div><p class="pinyin">fú</p><p>Good fortune · happiness · blessing</p></div></div><h3>Something worth wishing for</h3><p>福 brings together ideas of good fortune and well-being. Here, it becomes a personal wish: your own writing, given a place on a red-envelope design.</p><h3>A little context</h3><p>Spring Festival traditions include exchanging greetings and wishes for the year ahead. Creative activities with festive inscriptions and red envelopes can be a way to explore that culture. Families and communities celebrate in different ways.</p><h3>Start with a model. Make it your own.</h3><p>This lesson uses a 13-stroke standard-character model. Watch the sequence, notice the spaces between the strokes, and then try it yourself. The digital brush introduces mark-making; it does not reproduce every quality of a physical brush.</p><ul class="source-list"><li><a href="https://dict.concised.moe.edu.tw/dictView.jsp?ID=6421&la=0&powerMode=0" target="_blank" rel="noreferrer">Ministry of Education: 福, pronunciation and meaning ↗</a></li><li><a href="https://ich.unesco.org/en/RL/spring-festival-social-practices-of-the-chinese-people-in-celebration-of-traditional-new-year-02126" target="_blank" rel="noreferrer">UNESCO: Spring Festival practices ↗</a></li><li><a href="https://www.npm.gov.tw/Activity-Content.aspx?l=1&sno=04014430" target="_blank" rel="noreferrer">National Palace Museum: festive making ↗</a></li></ul><div class="modal-actions"><button id="lesson-practice" class="button button-dark">Try it on the paper ↗</button></div>`);
  $('#lesson-practice').onclick=()=>{closeModal();location.hash='studio';};
}
$('#open-lesson').onclick=showLesson;
function showSources(){
  openModal('REFERENCES & OPEN-SOURCE CREDITS',`<h2 id="modal-title">The ink has a history.</h2><ul class="source-list"><li><a href="https://dict.concised.moe.edu.tw/dictView.jsp?ID=6421&la=0&powerMode=0" target="_blank" rel="noreferrer">Ministry of Education dictionary</a> — pronunciation and meaning of 福.</li><li><a href="https://www.metmuseum.org/essays/chinese-calligraphy" target="_blank" rel="noreferrer">The Metropolitan Museum of Art</a> — calligraphy, brushwork, and expression.</li><li><a href="https://ich.unesco.org/en/RL/spring-festival-social-practices-of-the-chinese-people-in-celebration-of-traditional-new-year-02126" target="_blank" rel="noreferrer">UNESCO</a> — Spring Festival practices.</li><li><a href="https://www.npm.gov.tw/Activity-Content.aspx?l=1&sno=04014430" target="_blank" rel="noreferrer">National Palace Museum</a> — a cultural-learning activity with festive decorations and envelopes.</li><li><a href="https://github.com/chanind/hanzi-writer-data" target="_blank" rel="noreferrer">Hanzi Writer Data 2.0.1</a>, derived from <a href="https://github.com/skishore/makemeahanzi" target="_blank" rel="noreferrer">Make Me a Hanzi</a> — the unmodified 13-stroke 福 data used consistently in the guide, reference, and quiz.</li></ul><p class="credits-note">Glyph data: Copyright © 1999 Arphic Technology Co., Ltd.; Make Me a Hanzi contributors. Distributed under the Arphic Public License, without warranty. <a href="data/ARPHICPL.TXT" target="_blank" rel="noreferrer">Read the full license</a> · <a href="data/fu.json" download="fu.json">Download the glyph data</a>.</p><p class="modal-note">This is an introductory student prototype. Human calligraphy review and learner testing are still pending. It teaches the selected model; it does not grade the artistic quality of your writing.</p>`);
}
$('#open-sources').onclick=showSources;$('#footer-sources').onclick=showSources;

function startQuiz(){
  if(!data){toast('The stroke reference is still loading. Please try again.');return;}
  let question=0,firstCorrect=0,attempted=false;
  function showQuestion(){
    const q=QUIZ[question];attempted=false;
    openModal('A THREE-QUESTION WARM-UP',`<div class="quiz-progress" aria-label="Question ${question+1} of 3">${QUIZ.map((_,i)=>`<i class="${i<question?'done':''}"></i>`).join('')}</div><h2 id="modal-title">Which stroke comes next?</h2><p>${q.target===0?'Start at the beginning. Find the first mark.':`You have ${q.target} strokes. Find stroke ${q.target+1}.`}</p><div class="quiz-glyph">${strokeSVG(data,{before:q.target,ghost:false,label:'Strokes already written'})}</div><div class="quiz-options">${q.options.map((index,i)=>`<button class="quiz-option" data-choice="${i}" aria-label="Option ${'ABC'[i]}">${strokeSVG(data,{active:index,before:q.target,ghost:true,label:`Option ${'ABC'[i]}: highlighted next stroke`})}<span>Option ${'ABC'[i]}</span></button>`).join('')}</div><div class="quiz-feedback" role="status" id="quiz-feedback">Choose the next stroke from the three highlighted options.</div><div class="modal-actions"><button class="text-link" id="quiz-skip">Go straight to practice ↗</button><button class="button button-dark" id="quiz-next" disabled>${question===2?'Finish warm-up':'Next question'} ↗</button></div>`);
    $$('.quiz-option').forEach(button=>button.onclick=()=>{
      const choice=Number(button.dataset.choice),correct=quizChoice(question,choice);
      if(!attempted&&correct)firstCorrect++;attempted=true;
      if(correct){button.classList.add('correct');$$('.quiz-option').forEach(b=>b.disabled=true);$('#quiz-feedback').innerHTML=`<strong>That’s the next stroke.</strong><p>${q.hint}</p>`;$('#quiz-next').disabled=false;}
      else{button.classList.add('incorrect');button.disabled=true;const letter='ABC'[q.options.indexOf(q.target)];$('#quiz-feedback').innerHTML=`<strong>Take another look. The reference uses option ${letter}.</strong><p>${q.hint} Choose that stroke to continue.</p>`;}
    });
    $('#quiz-skip').onclick=()=>{closeModal();location.hash='studio';};
    $('#quiz-next').onclick=()=>{if(question<2){question++;showQuestion();}else finishQuiz();};
  }
  function finishQuiz(){openModal('WARM-UP COMPLETE',`<div class="quiz-complete"><div class="completion-mark" aria-hidden="true">✧</div><h2 id="modal-title">Now, make your mark.</h2><p>You recognized ${firstCorrect} of 3 strokes on the first try. Every explanation is another chance to learn.</p><p class="modal-note">This checks the selected sequence, not your artistic ability.</p><button class="button button-dark" id="quiz-practice">Back to the paper ↗</button></div>`);$('#quiz-practice').onclick=()=>{closeModal();location.hash='studio';};}
  showQuestion();
}
$('#open-quiz').onclick=startQuiz;

async function download(strokeData,kind,name='my-wish'){
  const exportCanvas=document.createElement('canvas');paintArtwork(exportCanvas,strokeData,kind);
  const blob=await new Promise(resolve=>exportCanvas.toBlob(resolve,'image/png'));if(!blob){toast('The image could not be created. Please try again.');return;}
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`${name.replace(/[^\p{L}\p{N}_ -]/gu,'').trim().slice(0,50)||'my-wish'}.png`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);toast('Your PNG is ready. Check your downloads.');
}
function showEnvelope(){
  if(!strokes.length)return;finishStroke();
  openModal('YOUR WRITING, A LITTLE GIFT',`<h2 id="modal-title">A wish to keep.</h2><div class="envelope-layout"><div class="envelope-scene"><canvas id="envelope-preview" aria-label="Your handwritten red-envelope design"></canvas></div><div class="envelope-actions"><p>Your marks, on a red-envelope front. Save an editable copy here, or download an image to share.</p><button class="button button-dark" id="save-envelope">Save to collection ↗</button><button class="button button-light" id="download-envelope">Download PNG ↓</button><button class="text-link" id="return-writing">Keep writing ↗</button><p class="modal-note">1200 × 2000 pixels.<br>A digital design, not a folding template.</p></div></div>`);
  paintArtwork($('#envelope-preview'),strokes,'envelope');$('#save-envelope').onclick=()=>showSave('envelope');$('#download-envelope').onclick=()=>download(copy(strokes),'envelope',currentName||'my-wish');$('#return-writing').onclick=closeModal;
}
$('#create-envelope').onclick=showEnvelope;$('#save-practice').onclick=()=>showSave('practice');
async function showSave(kind){
  if(!strokes.length)return;finishStroke();const snapshot=copy(strokes),savedRevision=drawingRevision;
  openModal('KEEP YOUR MARKS',`<h2 id="modal-title">Give this piece a name.</h2><label class="form-label" for="work-name">Work name</label><input id="work-name" type="text" maxlength="60" placeholder="A wish for a friend" autocomplete="off"><p class="modal-note">Saved in this browser, on this device. Up to three editable works.</p><div id="save-slots"></div><p id="save-error" class="modal-error" role="alert"></p><div class="save-actions"><button class="button button-light" id="save-download">Download instead ↓</button><button class="button button-dark" id="commit-save" disabled>Loading collection…</button></div>`);
  const saveSession=modalSession;
  $('#work-name').value=currentName;$('#save-download').onclick=()=>download(snapshot,kind,$('#work-name').value||'my-wish');
  let existing,chosenId=currentId,confirmedReplace=false;
  try{existing=await listWorks();}catch(error){if(modalSession===saveSession&&$('#save-error'))$('#save-error').textContent=error.message;return;}
  if(modalSession!==saveSession||!$('#commit-save'))return;
  const decision=saveDecision(existing,currentId);
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
      const work={version:1,id:chosenId||crypto.randomUUID(),name,kind,updatedAt:Date.now(),strokes:snapshot,brush:{size:brushSize,mode:brushMode}};
      await putWork(work,{replace:confirmedReplace});if(drawingRevision===savedRevision){currentId=work.id;currentName=name;dirty=false;updateDrawingUI();}listWorks().then(rows=>{works=rows;$('#nav-count').textContent=String(rows.length);}).catch(()=>{});if(modalSession===saveSession)closeModal();toast('Saved in this browser. Find it in your collection.');
    }catch(error){if(modalSession===saveSession&&$('#save-error')){$('#save-error').textContent=error.message;button.disabled=false;button.textContent=confirmedReplace?'Try replacement again':'Try saving again';}}
  };
}
async function renderCollection(){
  const generation=++collectionGeneration;$('#collection-status').textContent='Loading your collection…';$('#collection-grid').replaceChildren();
  try{works=await listWorks();}catch(error){if(generation!==collectionGeneration)return;$('#collection-status').textContent=error.message;return;}
  if(generation!==collectionGeneration)return;$('#collection-status').textContent='';$('#nav-count').textContent=String(works.length);
  for(const work of works){
    const card=document.createElement('article');card.className='collection-card';const art=document.createElement('div');art.className='collection-art';const preview=document.createElement('canvas');preview.setAttribute('aria-label',`Preview of ${work.name}`);art.append(preview);const title=document.createElement('h2');title.textContent=work.name;const meta=document.createElement('p');meta.textContent=`${work.kind==='envelope'?'Red-envelope design':'Practice sheet'} · ${new Date(work.updatedAt).toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
    const actions=document.createElement('div');actions.className='collection-actions';const open=document.createElement('button'),dl=document.createElement('button'),remove=document.createElement('button');for(const b of [open,dl,remove])b.className='text-link';open.textContent='Open & edit ↗';dl.textContent='PNG ↓';remove.textContent='Remove';remove.setAttribute('aria-label',`Remove ${work.name}`);
    let valid=true;try{validateWork(work);paintArtwork(preview,work.strokes,work.kind,{thumbnail:true});}catch{valid=false;meta.textContent='This saved work could not be read. You can remove it to free a slot.';open.disabled=true;dl.disabled=true;}
    open.onclick=()=>{
      if(!valid)return;
      const apply=()=>{drawingRevision++;strokes=copy(work.strokes);if(work.brush){brushSize=work.brush.size;brushMode=work.brush.mode;}pointCount=strokes.reduce((n,s)=>n+s.points.length,0);redoStack=[];currentId=work.id;currentName=work.name;dirty=false;location.hash='studio';redraw();updateDrawingUI();toast('Opened for editing. Your saved version stays until you replace it.');};
      if(dirty&&strokes.length)confirmAction('Open another piece?','Your unsaved drawing on the desk will be replaced. Saved works stay in your collection.','Open saved work',apply);else apply();
    };
    dl.onclick=()=>download(work.strokes,work.kind,work.name);
    remove.onclick=()=>confirmAction('Remove this saved work?',`“${work.name}” will be removed from this browser’s collection. Download a copy first if you want to keep it.`,'Remove saved work',async()=>{try{await removeWork(work.id);if(currentId===work.id){currentId=null;dirty=!!strokes.length;updateDrawingUI();}renderCollection();toast('Removed from this collection.');}catch(error){toast(error.message);}});
    actions.append(open,dl,remove);card.append(art,title,meta,actions);$('#collection-grid').append(card);
  }
  for(let i=works.length;i<3;i++){
    const slot=document.createElement('div');slot.className='empty-slot';slot.innerHTML=`<span class="empty-number">0${i+1}</span><h2>A space for a wish.</h2><p>${i===0?'Your first piece starts with a single mark.':'No need to fill every space. Take your time.'}</p><a href="#studio">Visit the studio ↗</a>`;$('#collection-grid').append(slot);
  }
}
$('#generate-prompt').onclick=()=>{try{$('#generated-prompt').value=makePrompt($('#iteration-goal').value);$('#prompt-result').hidden=false;$('#prompt-status').textContent='';}catch(error){$('#prompt-status').textContent=error.message;$('#iteration-goal').focus();}};
$('#copy-prompt').onclick=async()=>{try{await navigator.clipboard.writeText($('#generated-prompt').value);$('#prompt-status').textContent='Prompt copied. Paste it into your coding agent.';}catch{$('#generated-prompt').focus();$('#generated-prompt').select();$('#prompt-status').textContent='Copy is unavailable here. Your prompt is selected so you can copy it manually.';}};

async function boot(){
  setRoute();updateDrawingUI();
  listWorks().then(rows=>{works=rows;$('#nav-count').textContent=String(rows.length);}).catch(()=>{});
  try{
    const response=await fetch('./data/fu.json');if(!response.ok)throw new Error();data=await response.json();
    if(data.strokes?.length!==13||data.medians?.length!==13||data.strokes.some(s=>typeof s!=='string'||!/^[MLCQZHVSAmlcqzhvsa0-9.,\s-]+$/.test(s)))throw new Error();
    $('#trace-guide').innerHTML=strokeSVG(data);$$('.fu-small').forEach(el=>el.innerHTML=strokeSVG(data));
    $('#sequence-dots').replaceChildren();data.strokes.forEach((_,i)=>{const b=document.createElement('button');b.setAttribute('aria-label',`Show stroke ${i+1}`);b.onclick=()=>{stopSequence();setSequence(i);};$('#sequence-dots').append(b);});setSequence(0);
  }catch{
    data=null;$('#sequence-caption').textContent='The reference could not load. Refresh to try again; you can still draw freely.';$('#open-quiz').disabled=true;$('#play-sequence').disabled=true;$('#previous-stroke').disabled=true;$('#next-stroke').disabled=true;$('#toggle-guide').disabled=true;$('#guide-grid').hidden=true;toast('The stroke reference is unavailable. Freehand drawing still works.');
  }
}
boot();
