import {drawingPad} from './drawing-pad.mjs';
import {getLesson,checkGlyph,makeQuiz} from './lessons.mjs';
import {strokeSVG,animatedStrokeSVG,paintArtwork} from './render.mjs';
import {dedicationText,nextEnvelopeState,recordAnswer} from './journey-model.mjs';
import {validateWork} from './core.mjs';

export function setupJourney({toast,confirmAction,openModal,closeModal,onSave,download}) {
  const root=document.querySelector('#view-journey');
  root.innerHTML=`
    <div class="journey-top"><p class="journey-kicker">A LITTLE PRACTICE. A PERSONAL WISH.</p><a href="#studio" class="text-link">Explore all characters <span aria-hidden="true">↗</span></a></div>
    <nav class="journey-progress" aria-label="Your first keepsake"><button data-journey-step="explore" aria-current="step"><span>01</span> Explore</button><i></i><button data-journey-step="learn" disabled><span>02</span> Learn</button><i></i><button data-journey-step="personalize" disabled><span>03</span> Personalize</button><i></i><button data-journey-step="keep" disabled><span>04</span> Keep</button></nav>
    <div id="j-return" class="journey-return glass" hidden><p>One small thing to remember.<span>Revisit the character you practised last time.</span></p><button id="j-review" class="text-link">Try a quick recall →</button><button id="j-dismiss-review" aria-label="Dismiss recall suggestion">×</button></div>
    <div class="journey-layout">
      <div class="journey-story">
        <p id="j-eyebrow" class="eyebrow">YOUR FIRST BRUSHSTROKE</p>
        <h1 id="journey-heading" tabindex="-1">A little ink.<br><em>Begin here.</em></h1>
        <p id="j-intro" class="journey-description">Learn your first Chinese character, then make a keepsake in your own handwriting.</p>
        <div id="j-explore-panel"><p class="journey-instruction">Start at the dot. Move slowly, then lift.</p><p class="journey-small">This is your scratch paper. These marks stay out of your finished piece.</p><button id="j-demo" class="text-link">Watch a brushstroke <span aria-hidden="true">↻</span></button></div>
        <div id="j-learn-panel" hidden><div class="journey-word"><span lang="zh">安</span><div><strong>Peace or safety</strong><span>ān · 6 strokes</span></div></div><p class="journey-small">A small wish for someone to feel at ease.</p><div class="journey-modes glass" role="group" aria-label="Learning guide"><button data-guide="trace" aria-pressed="true">Trace</button><button data-guide="watch" aria-pressed="false">Watch</button><button data-guide="free" aria-pressed="false">Try myself</button></div><div class="journey-lesson-control"><p class="journey-step-count" id="j-stroke-label">Stroke 1 of 6</p><p id="j-instruction"></p><div class="journey-reference-controls"><button id="j-prev-stroke" class="icon-button" aria-label="Previous lesson stroke">←</button><button id="j-replay" class="text-link">Watch this stroke ↻</button><button id="j-play-all" class="text-link">Play all ▶</button></div></div><details class="journey-culture"><summary>A little meaning behind the ink</summary><p>安 can describe calm, stability, or safety. In 安心 (ān xīn), it carries the idea of feeling at ease. Your dedication is a personal wish, rather than a literal translation of a traditional saying.</p><a href="https://dict.concised.moe.edu.tw/dictView.jsp?ID=39684&la=0&powerMode=0" target="_blank" rel="noreferrer">Meaning & pronunciation source ↗</a></details><button id="j-ready" class="text-link" disabled>I’m ready to personalize →</button></div>
        <div id="j-check-panel" hidden><p class="journey-step-count" id="j-question-count"></p><h2 id="j-question"></h2><div id="j-answers" class="journey-answers"></div><p id="j-feedback" class="journey-feedback" role="status"></p><button id="j-skip-check" class="text-link">Skip this check →</button></div>
        <div id="j-personal-panel" hidden><div class="journey-dedication-modes" role="group" aria-label="Who is your keepsake for?"><button data-recipient-mode="someone" aria-pressed="true">Someone else</button><button data-recipient-mode="myself" aria-pressed="false">Myself</button></div><label id="j-recipient-label" class="journey-field" for="j-recipient">For <span>optional</span><input id="j-recipient" maxlength="40" autocomplete="off" placeholder="Someone on your mind"></label><label class="journey-field" for="j-message">Your little wish <span>optional</span><textarea id="j-message" aria-describedby="j-message-count" rows="3" maxlength="160" placeholder="I hope this brings you…"></textarea><small id="j-message-count" aria-hidden="true">0 / 160</small></label><label class="journey-field" for="j-sender">From <span>optional</span><input id="j-sender" maxlength="40" autocomplete="off" placeholder="Your name"></label><button id="j-no-note" class="text-link">Keep it without a dedication →</button></div>
        <div id="j-keep-panel" hidden><p id="j-envelope-copy" class="journey-instruction"></p><p class="journey-small">Inspired by red envelopes, made as a digital keepsake. Your handwriting and words are yours.</p><div class="journey-keep-actions"><button id="j-save" class="button button-dark">Save my keepsake ↗</button><button id="j-download" class="button button-light">Download image ↓</button><button id="j-replay-ink" class="text-link" hidden>Watch my handwriting appear ↻</button><a href="#collection" id="j-view-saved" class="text-link" hidden>See it in my keepsakes →</a></div><p id="j-save-state" class="journey-small" role="status"></p><p class="journey-small">Editable saves stay in this browser. A download is a still image; it does not include the opening animation.</p></div>
        <p id="j-load-status" class="journey-error" role="status"></p><button id="j-retry" class="text-link" hidden>Retry loading the lesson ↻</button>
        <div class="journey-actions"><button id="j-back" class="text-link" hidden>← Back</button><button id="j-primary" class="button button-dark">Meet my first character →</button></div>
        <p id="j-action-note" class="journey-small">No experience needed. No need to be perfect.</p>
      </div>
      <div class="journey-desk">
        <div class="journey-paper-meta"><span id="j-paper-label">SCRATCH PAPER</span><button id="j-clear" class="text-link" disabled>Fresh paper ＋</button></div>
        <div id="j-paper" class="journey-paper"><div class="journey-paper-texture" aria-hidden="true"></div><div id="j-warmup" class="journey-warmup" aria-hidden="true"><svg viewBox="0 0 400 400"><path class="warmup-path" d="M105 205 C150 180 240 186 292 171"/><circle cx="105" cy="205" r="4"/><path class="warmup-demo" pathLength="1" d="M105 205 C150 180 240 186 292 171"/></svg><span id="j-start-label">start here</span></div><div id="j-guide" class="journey-guide" aria-hidden="true" hidden></div><canvas id="j-ink" aria-label="Scratch paper: try a brushstroke with a mouse, pen, or finger"></canvas><canvas id="j-card" aria-label="Preview of your handwritten keepsake and dedication" hidden></canvas><div id="j-check-reference" class="journey-check-reference" hidden></div><span class="journey-paper-corner" aria-hidden="true">心意</span></div>
        <div id="j-tools" class="journey-tools glass" role="group" aria-label="Writing tools"><button id="j-undo" disabled aria-label="Undo last mark">↶ <span>Undo</span></button><button id="j-redo" disabled aria-label="Redo last mark">↷ <span>Redo</span></button><span></span><button id="j-brush">Brush settings <span aria-hidden="true">⌁</span></button></div>
        <div id="j-gift" class="journey-gift" data-state="ready" hidden><div class="gift-card-well"><div class="gift-card"><canvas id="j-gift-card" aria-label="Your original handwriting, meaning, and dedication"></canvas></div></div><div class="gift-envelope-back"></div><div class="gift-envelope-front"><span id="j-envelope-name">A little wish for you</span><span class="gift-envelope-brand">墨与愿</span></div><div class="gift-flap"></div><div class="gift-seal" aria-hidden="true">心</div></div>
        <p id="j-paper-note" class="journey-paper-note" role="status">Slow for full strokes. Quick for fine lines.</p>
      </div>
      <aside class="journey-margin"><div id="j-example"><p class="eyebrow">WHAT YOU’LL MAKE</p><div class="journey-example-card"><div id="j-example-glyph" lang="zh">安</div><span>A little peace,<br>in your own hand.</span></div><p class="journey-small">Example lettering.<br>Your marks make it yours.</p></div><div class="journey-side-note"><span lang="zh" aria-hidden="true">一筆<br>一意</span><p>One mark.<br>A little meaning.</p></div></aside>
    </div><div class="journey-bottom"><span>A practice in attention, at your pace.</span><a href="#couplets">Make a New Year doorway greeting ↗</a></div>`;
  const $=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
  const lesson=getLesson('an'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const reducedMotion=()=>reduced.matches||document.body.classList.contains('reduce-motion');
  let data=null,step='explore',furthest=0,stroke=0,guide='trace',scratch=[],art=[],dedication={recipient:'',message:'',sender:''};
  let dirty=false,revision=0,id=null,name='',loading=true,hydrating=false,size=28,ink=.78,envelope='ready',playing=false,timer=null,question=0,answers=[],replayTimer=null,loadRequest=0;
  const stages=['explore','learn','personalize','keep'];
  const pad=drawingPad($('#j-ink'),{onChange(points,state){
    $('#j-ready').disabled=!state.canUndo;$('#j-undo').disabled=!state.canUndo;$('#j-redo').disabled=!state.canRedo;$('#j-clear').disabled=!state.canUndo;
    $('#j-warmup').classList.toggle('has-ink',!!points.length);
    if(!hydrating&&step!=='explore'){dirty=true;revision++;}
    if(step==='explore')$('#j-paper-note').textContent=points.length?'A good beginning. Try another, or meet your first character.':'Slow for full strokes. Quick for fine lines.';
    else if(step==='learn')$('#j-paper-note').textContent=points.length?`${points.length} ${points.length===1?'mark':'marks'} of your own. Follow the guide at your pace.`:'Watch the stroke. Then make your own mark.';
  },onLimit:()=>toast('This paper is full. Save your work before starting a new piece.')});
  function stop(){playing=false;clearTimeout(timer);clearTimeout(replayTimer);$('#j-play-all').textContent='Play all ▶';}
  function snapshot(){pad.finish();if(step==='explore')scratch=pad.get();else art=pad.get();}
  function animateGuide(){
    if(!data)return;
    $('#j-stroke-label').textContent=`Stroke ${stroke+1} of ${lesson.count}`;$('#j-instruction').textContent=lesson.captions[stroke];$('#j-prev-stroke').disabled=stroke===0;
    $('#j-guide').innerHTML=guide==='free'?'':animatedStrokeSVG(data,stroke,{animate:!reducedMotion(),label:`安, stroke ${stroke+1}`});
    $('#j-guide').classList.toggle('watching',guide==='watch');
    if(step==='learn')$('#j-primary').textContent=stroke===5?'Check what I remember →':'Next stroke →';
  }
  function renderCard(){const options={dedication,lesson:'an'};paintArtwork($('#j-card'),art,'keepsake',options);paintArtwork($('#j-gift-card'),art,'keepsake',options);$('#j-envelope-name').textContent=dedication.recipient?`For ${dedication.recipient}`:'A little wish for you';}
  function focusHeading(){requestAnimationFrame(()=>$('#journey-heading').focus({preventScroll:true}));}
  function setStep(next,{focus=true}={}){
    if(next!=='explore'&&!data){toast('The character reference is still loading. Please try again.');return;}
    snapshot();stop();step=next;root.dataset.step=step;
    const actions=$('.journey-actions');$('.journey-story').insertBefore(actions,$('#j-action-note'));
    if(step==='learn')$('#j-learn-panel').insertBefore(actions,$('.journey-culture'));
    if(step==='check')$('#j-check-panel').insertBefore(actions,$('#j-skip-check'));
    if(step==='keep')$('#j-keep-panel').insertBefore(actions,$('.journey-keep-actions'));
    const stage=step==='check'?1:stages.indexOf(step);furthest=Math.max(furthest,stage);
    $$('[data-journey-step]').forEach((b,i)=>{b.disabled=i>furthest;b.toggleAttribute('aria-current',i===stage);if(i===stage)b.setAttribute('aria-current','step');});
    for(const panel of ['explore','learn','check','personal','keep'])$(`#j-${panel}-panel`).hidden=panel!==(step==='personalize'?'personal':step);
    $('#j-back').hidden=step==='explore';$('#j-primary').hidden=false;$('#j-primary').disabled=false;$('#j-action-note').hidden=false;
    $('#j-paper').hidden=step==='keep';$('#j-gift').hidden=step!=='keep';$('#j-paper').classList.toggle('is-card',step==='personalize');
    $('#j-ink').setAttribute('aria-label',step==='explore'?'Scratch paper: try a brushstroke with a mouse, pen, or finger':'Write 安 with a mouse, pen, or finger');
    $('#j-ink').hidden=!['explore','learn'].includes(step);$('#j-card').hidden=step!=='personalize';$('#j-check-reference').hidden=step!=='check';
    $('#j-warmup').hidden=step!=='explore';$('#j-guide').hidden=step!=='learn';$('#j-tools').hidden=!['explore','learn'].includes(step);$('#j-clear').hidden=!['explore','learn'].includes(step);
    $('#j-example').hidden=step!=='explore';$('#j-paper-note').textContent='';
    hydrating=true;pad.set(step==='explore'?scratch:art);hydrating=false;pad.enabled(['explore','learn'].includes(step)&&guide!=='watch'||step==='explore');
    const copy={explore:['YOUR FIRST BRUSHSTROKE','A little ink.<br><em>Begin here.</em>','Learn your first Chinese character, then make a keepsake in your own handwriting.','SCRATCH PAPER'],learn:['YOUR FIRST CHARACTER','A little<br><em>peace.</em>','Six strokes. One small wish. Watch each stroke, then let your hand follow.','YOUR FIRST 安'],check:['A MOMENT TO REMEMBER','A little<br><em>discovery.</em>','A quick check, at your pace. You can always take another look.','NOTICE & REMEMBER'],personalize:['MAKE IT PERSONAL','Someone<br><em>on your mind?</em>','Your marks already mean something. Add a few words, if you like.','YOUR HANDWRITTEN KEEPSAKE'],keep:['A WISH IN YOUR HAND','Made by you.<br><em>Kept with care.</em>','Your handwriting, a little meaning, and a place for your words.','A LITTLE KEEPSAKE']}[step];
    $('#j-eyebrow').textContent=copy[0];$('#journey-heading').innerHTML=copy[1];$('#j-intro').textContent=copy[2];$('#j-paper-label').textContent=copy[3];
    if(step==='explore'){$('#j-primary').textContent='Meet my first character →';$('#j-primary').disabled=!data;$('#j-action-note').textContent='No experience needed. No need to be perfect.';}
    if(step==='learn'){$('#j-action-note').textContent='Move on when you’re ready. Your writing is practice, not a score.';animateGuide();}
    if(step==='check'){renderQuestion();$('#j-action-note').hidden=true;}
    if(step==='personalize'){renderCard();$('#j-primary').textContent=art.length?'Make my keepsake →':'Back to the paper →';$('#j-action-note').textContent=art.length?'Every field is optional. Your writing stays as you made it.':'Add a mark on the paper to make a keepsake of your own.';}
    if(step==='keep'){renderCard();renderEnvelope();$('#j-action-note').hidden=true;$('#j-save').disabled=!art.length;$('#j-download').disabled=!art.length;}
    requestAnimationFrame(()=>pad.resize());if(focus){focusHeading();window.scrollTo({top:matchMedia('(max-width:760px)').matches?root.offsetTop:0,behavior:reducedMotion()?'instant':'smooth'});}
  }
  function renderQuestion(){
    const q=makeQuiz(lesson)[1];$('#j-question-count').textContent=`${question+1} / 2 · A SMALL RECALL CHECK`;
    $('#j-question').textContent=question===0?'What does 安 mean in this lesson?':'Which stroke comes next?';$('#journey-heading').textContent=question===0?'What does 安 mean?':'Which stroke comes next?';
    $('#j-feedback').textContent=question===0?'The meaning is hidden for a moment. Take your time.':`These are the first ${q.target} strokes. Choose the next one.`;
    $('#j-check-reference').innerHTML=question===0?strokeSVG(data,{before:6,ghost:false,label:'安 — recall its meaning'}):strokeSVG(data,{before:q.target,ghost:false,label:'Strokes already written'});
    $('#j-answers').replaceChildren();
    const options=question===0?['Spring','Peace or safety','Mountain']:q.options;
    options.forEach((option,i)=>{const b=document.createElement('button');b.className='journey-answer';
      if(question===0)b.textContent=option;else{b.innerHTML=strokeSVG(data,{active:option,before:q.target,label:`Option ${i+1}: highlighted stroke`})+`<span>Option ${i+1}</span>`;b.setAttribute('aria-label',`Option ${i+1}`);}
      b.onclick=()=>{const correct=question===0?i===1:option===q.target;answers=recordAnswer(answers,question,correct);b.classList.add(correct?'is-correct':'try-again');b.disabled=true;
        $('#j-feedback').textContent=correct?(question===0?'Yes. 安 can express peace or safety. Your own words give it a personal meaning.':`That’s the next stroke. ${q.hint}`):(question===0?'Think of wishing someone calm and safety. Try another answer.':`${q.hint} Watch for that movement and try again.`);
        if(correct){$$('.journey-answer').forEach(x=>x.disabled=true);$('#j-primary').disabled=false;}
      };$('#j-answers').append(b);
    });
    $('#j-answers').classList.toggle('has-glyphs',question===1);$('#j-primary').textContent=question===0?'One more small check →':'Personalize my writing →';$('#j-primary').disabled=true;
  }
  function nextQuestion(){if(question===0){question=1;renderQuestion();}else{toast(`You recognised ${answers.filter(x=>x?.firstCorrect).length} of 2 on the first try. Your writing has no score.`);setStep('personalize');}}
  function renderEnvelope(){
    $('#j-gift').dataset.state=envelope;$('#j-replay-ink').hidden=envelope!=='opened';
    $('#j-primary').textContent={ready:'Seal my keepsake →',sealed:'Preview opening →',opened:'Close & open again ↻'}[envelope];
    $('#j-envelope-copy').textContent={ready:'A small ceremony for something you made. Seal it, or save it just as it is.',sealed:'A little wish, tucked away. Open it to see what’s inside.',opened:'Your own handwriting. Your own words. A little moment to keep.'}[envelope];
    $('#j-save-state').textContent=id&&!dirty?'Saved in this browser. You can return to edit it.':'Up to three editable keepsakes, saved on this device.';$('#j-view-saved').hidden=!id||dirty;
  }
  $('#j-primary').onclick=()=>{
    if(step==='explore'){stroke=0;setStep('learn');}
    else if(step==='learn'){stop();if(stroke<5){stroke++;animateGuide();}else{question=0;answers=[];setStep('check');}}
    else if(step==='check')nextQuestion();
    else if(step==='personalize'){if(!art.length){setStep('learn');return;}envelope='ready';setStep('keep');}
    else{clearTimeout(replayTimer);renderCard();envelope=nextEnvelopeState(envelope,{ready:'seal',sealed:'open',opened:'replay'}[envelope]);renderEnvelope();}
  };
  $('#j-back').onclick=()=>setStep(({learn:'explore',check:'learn',personalize:'learn',keep:'personalize'})[step]);
  $$('[data-journey-step]').forEach(b=>b.onclick=()=>setStep(b.dataset.journeyStep));
  $('#j-skip-check').onclick=()=>setStep('personalize');$('#j-ready').onclick=()=>setStep('personalize');
  $('#j-prev-stroke').onclick=()=>{stop();stroke=Math.max(0,stroke-1);animateGuide();};
  $('#j-replay').onclick=()=>{stop();animateGuide();};
  $('#j-play-all').onclick=()=>{if(playing){stop();return;}playing=true;$('#j-play-all').textContent='Pause Ⅱ';stroke=0;animateGuide();const advance=()=>{if(!playing)return;if(stroke>=5){stop();return;}stroke++;animateGuide();timer=setTimeout(advance,1500);};timer=setTimeout(advance,1500);};
  $$('[data-guide]').forEach(b=>b.onclick=()=>{stop();guide=b.dataset.guide;$$('[data-guide]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));pad.enabled(guide!=='watch');animateGuide();$('#j-paper-note').textContent=guide==='watch'?'Watch the movement. Select Trace or Try myself when you want to write.':guide==='free'?'The guide is hidden. Make your own marks.':'Follow the faint shape. A new stroke never erases your writing.';});
  $('#j-demo').onclick=()=>{const path=$('.warmup-demo');path.classList.remove('playing');void path.getBoundingClientRect();path.classList.add('playing');$('#j-paper-note').textContent='A slow sweep, then lift. Your brush follows the speed of your hand.';};
  $('#j-undo').onclick=()=>pad.undo();$('#j-redo').onclick=()=>pad.redo();
  $('#j-clear').onclick=()=>confirmAction('Begin on fresh paper?',step==='explore'?'This clears only your scratch marks. Your character practice stays.':'This clears the writing on this paper. Saved pieces stay in your collection.','Clear this paper',()=>{pad.set([]);if(step!=='explore'){id=null;name='';}});
  $('#j-brush').onclick=()=>{pad.finish();openModal('YOUR INK BRUSH',`<h2 id="modal-title">Find your rhythm.</h2><p>Slow strokes feel fuller. Faster strokes grow finer. These settings affect your next marks.</p><label class="range-label" for="j-modal-size">Brush size <output id="j-size-value">${size}</output></label><input id="j-modal-size" type="range" min="5" max="60" value="${size}"><label class="range-label" for="j-modal-ink">Ink load <output id="j-ink-value">${Math.round(ink*100)}%</output></label><input id="j-modal-ink" type="range" min="15" max="100" value="${ink*100}"><div class="modal-actions"><button id="j-brush-done" class="button button-dark">Back to my paper →</button></div>`);
    document.querySelector('#j-modal-size').oninput=e=>{size=Number(e.target.value);document.querySelector('#j-size-value').textContent=size;pad.settings(size,ink);};document.querySelector('#j-modal-ink').oninput=e=>{ink=Number(e.target.value)/100;document.querySelector('#j-ink-value').textContent=`${Math.round(ink*100)}%`;pad.settings(size,ink);};document.querySelector('#j-brush-done').onclick=closeModal;};
  function readDedication(){dedication=dedicationText({recipient:$('#j-recipient').value,message:$('#j-message').value,sender:$('#j-sender').value});dirty=true;revision++;envelope='ready';$('#j-message-count').textContent=`${$('#j-message').value.length} / 160`;renderCard();}
  for(const field of ['recipient','message','sender'])$(`#j-${field}`).addEventListener('input',readDedication);
  $$('[data-recipient-mode]').forEach(b=>b.onclick=()=>{$$('[data-recipient-mode]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));$('#j-recipient-label').hidden=b.dataset.recipientMode==='myself';$('#j-recipient').value=b.dataset.recipientMode==='myself'?'Myself':'';readDedication();});
  $('#j-no-note').onclick=()=>{for(const field of ['recipient','message','sender'])$(`#j-${field}`).value='';readDedication();if(art.length){envelope='ready';setStep('keep');}else setStep('learn');};
  $('#j-save').onclick=()=>onSave({kind:'keepsake',payload:structuredClone(art),dedication:structuredClone(dedication),lesson:'an',revision,brush:{size,mode:'ink',ink},id,name:name||(dedication.recipient?`Peace for ${dedication.recipient}`:'My little wish'),saved(work,savedRevision){if(revision===savedRevision){id=work.id;name=work.name;dirty=false;renderEnvelope();$('#j-gift').classList.remove('just-saved');void $('#j-gift').getBoundingClientRect();$('#j-gift').classList.add('just-saved');}try{localStorage.setItem('ink-wishes-practised-an',String(Date.now()));}catch{}}});
  $('#j-download').onclick=()=>download(art,'keepsake',name||'a-little-wish',{dedication,lesson:'an'});
  $('#j-replay-ink').onclick=()=>{clearTimeout(replayTimer);if(reducedMotion()){renderCard();toast('Your completed handwriting is shown with reduced motion.');return;}let count=0;const next=()=>{paintArtwork($('#j-gift-card'),art.slice(0,count),'keepsake',{dedication,lesson:'an'});if(count++<art.length)replayTimer=setTimeout(next,Math.max(60,2200/Math.max(art.length,1)));};next();};
  $('#j-review').onclick=()=>{question=0;answers=[];setStep('check');$('#j-return').hidden=true;};$('#j-dismiss-review').onclick=()=>{$('#j-return').hidden=true;try{localStorage.removeItem('ink-wishes-practised-an');}catch{}};
  try{if(localStorage.getItem('ink-wishes-practised-an'))$('#j-return').hidden=false;}catch{}
  document.addEventListener('keydown',e=>{if(root.hidden||document.querySelector('#modal').open||!['learn','explore'].includes(step)||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?pad.redo():pad.undo();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pad.finish();stop();}});
  async function load(){
    const request=++loadRequest;loading=true;$('#j-primary').disabled=true;$('#j-load-status').textContent='';$('#j-retry').hidden=true;
    try{const response=await fetch('./data/an.json');if(!response.ok)throw new Error();const glyph=checkGlyph(await response.json(),lesson);if(request!==loadRequest)return;data=glyph;$('#j-example-glyph').innerHTML=strokeSVG(data,{label:'Example of 安'});$('#j-primary').disabled=false;$('#j-review').disabled=false;}
    catch{if(request!==loadRequest)return;$('#j-load-status').textContent='The character reference could not load. You can still try the brush.';$('#j-retry').hidden=false;$('#j-review').disabled=true;}
    finally{if(request===loadRequest)loading=false;}
  }
  $('#j-review').disabled=true;$('#j-retry').onclick=load;
  setStep('explore',{focus:false});load();
  return {
    finish(){snapshot();stop();},resize:()=>pad.resize(),hasUnsaved:()=>dirty&&(step==='explore'?art.length:pad.get().length)>0,
    async openWork(work){validateWork(work);const apply=async()=>{if(!data){await load();if(!data){toast('The lesson reference is unavailable. Please retry from Learn.');return;}}snapshot();art=structuredClone(work.strokes);dedication=dedicationText(work.dedication);$('#j-recipient-label').hidden=dedication.recipient==='Myself';$$('[data-recipient-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.recipientMode===(dedication.recipient==='Myself'?'myself':'someone'))));id=work.id;name=work.name;size=work.brush?.size??28;ink=work.brush?.ink??.78;pad.settings(size,ink);for(const field of ['recipient','message','sender'])$(`#j-${field}`).value=dedication[field];$('#j-message-count').textContent=`${dedication.message.length} / 160`;hydrating=true;pad.set(art);hydrating=false;step='personalize';dirty=false;revision++;furthest=3;envelope='ready';setStep('personalize');location.hash='learn';toast('Opened your keepsake. Edit the words or go back to your writing.');};if(dirty&&(art.length||pad.get().length))confirmAction('Open this saved keepsake?','Your unsaved guided piece will be replaced. Other saved works stay in your collection.','Open saved keepsake',apply);else await apply();},
    removed(workId){if(id===workId){id=null;dirty=true;renderEnvelope();}}
  };
}
