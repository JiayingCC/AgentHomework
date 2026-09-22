import {COLORS, createTrials, summarizeTrials, createMemoryRound, scoreMemory, normalizeProgress, completeGame, createPrompt} from './core.mjs';
import {lessons, biasQuestions, psychTerms} from './learning.mjs';

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const storageKey = 'mindplay-progress-v1';
let saved = true;
let progress;
try { const raw=localStorage.getItem(storageKey); try {progress=normalizeProgress(JSON.parse(raw));} catch {progress=normalizeProgress(null);} }
catch { progress = normalizeProgress(null); saved = false; }
let toastTimer;
function toast(text) { clearTimeout(toastTimer); $('#toast').textContent = text; $('#toast').classList.add('visible'); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500); }
function persist() { try { localStorage.setItem(storageKey, JSON.stringify(progress)); saved = true; } catch { saved = false; } updateProgress(); }
function updateProgress() {
  $('#xp').textContent = progress.xp;
  const count = progress.completed.length;
  $('#journey-copy').textContent = count === 0 ? 'Your curiosity trail starts with one game.' : count === 3 ? 'Three new perspectives. Keep asking good questions.' : 'Look at you, collecting little aha moments.';
  $('#progress-fill').style.width = `${count / 3 * 100}%`;
  $('.progress-track').setAttribute('aria-valuenow', count);
  $('#progress-label').textContent = `${count} of 3 activities explored · ${saved ? 'saved on this device' : 'session only; browser storage unavailable'}`;
  $$('[data-complete]').forEach(tag => { tag.hidden = !progress.completed.includes(tag.dataset.complete); });
  document.body.classList.toggle('solid', progress.solid);
  $('#contrast-toggle').setAttribute('aria-pressed', progress.solid);
  $('#contrast-toggle').setAttribute('aria-label', progress.solid ? 'Use glass backgrounds' : 'Use solid backgrounds');
  $('#contrast-toggle').title = progress.solid ? 'Use glass backgrounds' : 'Use solid backgrounds';
}
$('#contrast-toggle').addEventListener('click', () => { progress.solid = !progress.solid; persist(); });
$('#reset-progress').addEventListener('click', () => { if (window.confirm('Reset your three activity badges and curiosity points on this device?')) { progress = normalizeProgress({solid: progress.solid}); persist(); toast('A fresh curiosity trail. Your progress has been reset.'); } });
function navigate() {
  const hash = location.hash.slice(1);
  const page = ['playground','notebook','studio'].includes(hash) ? hash : 'playground';
  $$('.view').forEach(view => { view.hidden = view.id !== page; });
  $$('.main-nav a').forEach(link => { const active = link.hash === `#${page}`; link.classList.toggle('active', active); if (active) link.setAttribute('aria-current','page'); else link.removeAttribute('aria-current'); });
  document.title = `${page === 'studio' ? 'Agent studio' : page === 'notebook' ? 'Knowledge garden' : 'A playground for your mind'} — Mindplay`;
}
window.addEventListener('hashchange', () => { navigate(); window.scrollTo({top:0,behavior:'instant'}); $('#main').focus({preventScroll:true}); });
const sourceLink = lesson => `<a class="source-link" href="${escape(lesson.sourceUrl)}" target="_blank" rel="noreferrer">${escape(lesson.sourceLabel)} ↗</a>`;
$('#lesson-grid').innerHTML = lessons.map(lesson => `<article class="lesson-card glass"><span class="eyebrow">${escape(lesson.concept)}</span><h2>${escape(lesson.title)}</h2><p>${escape(lesson.explanation)}</p><p class="takeaway">${escape(lesson.takeaway)}</p><p class="small">${escape(lesson.limitation)}</p>${sourceLink(lesson)}<button class="card-play" data-game="${lesson.id}">Try the activity <span aria-hidden="true">↗</span></button></article>`).join('');
$('#psych-terms').innerHTML = psychTerms.map(term => `<details class="term"><summary>${escape(term.term)}</summary><p>${escape(term.definition)}</p><p class="example">${escape(term.example)}</p>${sourceLink(term)}</details>`).join('');
const workflow = [
  {name:'Research',icon:'⌕',role:'THE RESEARCH AGENT',title:'Start with evidence, not assumptions.',body:'The research agent checked the psychology against original research, OpenStax chapters, and APA definitions. It delivered lesson copy, source links, and the limits of each demonstration.',output:'Sourced explanations and three everyday bias scenarios for the builder.'},
  {name:'Design',icon:'✳',role:'THE LEAD AGENT',title:'Turn the learning goal into an experience.',body:'The lead agent translated your pastel, grainy-glass brief into Mindplay’s visual system. Games get direct entry points, calm instructions, and a clear explanation after each round.',output:'A consistent visual system and accessible game flows.'},
  {name:'Build',icon:'⌘',role:'THE LEAD AGENT',title:'Make the smallest useful version work.',body:'The lead agent implemented three browser games, local progress, source-backed lessons, and this workflow guide. Bounded game logic is separate from presentation so it can be checked directly.',output:'A working static website that needs no accounts, API keys, or AI service.'},
  {name:'Review',icon:'◎',role:'THE REVIEW AGENT',title:'Give another perspective a real job.',body:'An independent agent reviewed the proposed games for scientific overclaims, timing errors, inaccessible controls, and misleading results. Its findings became specific requirements for the implementation.',output:'Concrete checks: balanced color trials, recognition limits, and completion points awarded once.'},
  {name:'Iterate',icon:'↻',role:'THE HUMAN + THE TEAM',title:'Use feedback to change the next version.',body:'The lead agent incorporated the review: an untimed study phase, a lesson-only path for the visual task, and separate timing summaries for correct responses. Your next role is to play, notice a confusing moment, and request one improvement.',output:'A tighter version, an honest record of checks, and a focused next experiment.'},
];
$('#flow-steps').innerHTML = workflow.map((step,i) => `<button class="flow-step" data-step="${i}" aria-pressed="${i===0}"><span class="step-icon" aria-hidden="true">${step.icon}</span>${step.name}</button>`).join('');
function showStep(index) {
  const step = workflow[index];
  $$('.flow-step').forEach((button,i) => { button.classList.toggle('selected',i===index); button.setAttribute('aria-pressed',i===index); });
  $('#flow-detail').innerHTML = `<span class="eyebrow">${step.role}</span><h3>${step.title}</h3><p>${step.body}</p><div class="handoff"><span>HANDOFF →</span><p>${step.output}</p></div>`;
}
$('#flow-steps').addEventListener('click', event => { const button = event.target.closest('[data-step]'); if (button) showStep(Number(button.dataset.step)); });
const agentTerms = [
  ['Agent','A system that uses a model to work toward a goal, often choosing tools or next steps.','Here, agents researched, reviewed, and built under the user’s direction.'],
  ['Prompt','The instruction or request you give a model.','“Review the color game for confusing instructions; suggest one testable fix.”'],
  ['Context','The information available to the agent when it works.','The homework brief, relevant files, source material, and constraints.'],
  ['Tool','An action an agent can use to inspect or change something.','Read a file, search a source, run a check, or inspect a browser.'],
  ['Handoff','Passing a bounded task or useful output to the next participant.','The research agent gives sourced lesson copy to the lead agent.'],
  ['Evaluation','Checking whether a result meets explicit criteria.','Verify that replays cannot award the same completion points twice.'],
  ['Iteration','A new pass that uses feedback from the previous one.','Fix a confusing instruction, then ask someone to try the game again.'],
  ['Human in the loop','A person participates in decisions, review, or approval.','You set the goal, play the result, and decide what should change next.'],
];
$('#agent-terms').innerHTML = agentTerms.map(([term,definition,example]) => `<details class="term"><summary>${term}</summary><p>${definition}</p><p class="example">${example}</p></details>`).join('');
function generatePrompt() {
  try { $('#prompt-text').textContent = createPrompt($('#brief-goal').value, $('#brief-focus').value); $('#prompt-status').textContent='Brief ready. Review it, then copy it into your agent tool.'; }
  catch(error) { $('#prompt-status').textContent=error.message; $('#brief-goal').focus(); }
}
$('#generate-prompt').addEventListener('click',generatePrompt);
$('#copy-prompt').addEventListener('click',async () => {
  try { await navigator.clipboard.writeText($('#prompt-text').textContent); $('#prompt-status').textContent='Copied. Paste the brief into your agent tool.'; }
  catch { const range = document.createRange(); range.selectNodeContents($('#prompt-text')); const selection=window.getSelection(); selection.removeAllRanges(); selection.addRange(range); $('#prompt-status').textContent='Clipboard unavailable. The brief is selected; use your browser’s Copy command.'; }
});

const dialog = $('#game-dialog');
const content = $('#game-content');
let game = null;
let runId = 0;
let lastOpener;
const lessonFor = id => lessons.find(lesson => lesson.id===id);
const gameNames = {stroop:'Color clash', memory:'Little things, remembered', bias:'Plot twist'};
function closeGame() { runId++; game=null; dialog.close(); }
$('#close-game').addEventListener('click',closeGame);
dialog.addEventListener('cancel', () => { runId++; game=null; });
dialog.addEventListener('close', () => { document.body.classList.remove('modal-open'); lastOpener?.focus({preventScroll:true}); });
document.addEventListener('click',event => { const button=event.target.closest('[data-game]'); if(button) openGame(button.dataset.game,button); });
function focusHeading() { const heading=$('#game-title'); if(heading){heading.tabIndex=-1; heading.focus({preventScroll:true});} }
function setContent(html, focus=true) { content.innerHTML=html; dialog.scrollTop=0; if(focus) focusHeading(); }
function openGame(id, opener=lastOpener) {
  runId++; game={id,phase:'intro'}; lastOpener=opener;
  $('#game-category').textContent={stroop:'ATTENTION · THE STROOP EFFECT',memory:'MEMORY · RECOGNITION',bias:'THINKING · COGNITIVE BIASES'}[id];
  if (!dialog.open) dialog.showModal(); document.body.classList.add('modal-open');
  const intro={
    stroop:{description:'A tiny tug-of-war between reading a word and seeing its color.',art:'<span style="color:#2158bd">GREEN</span>',rules:['Choose the <strong>ink color</strong>, not the word you read.','Try one unscored example, then 12 short trials at your pace.','Use the buttons or the R, B, G, and P keys.'],action:'Try a practice round',note:'This is a visual color-naming activity. You can go straight to the explanation if color perception or reading makes it unsuitable.'},
    memory:{description:'Meet six little words. Then see which ones you recognize in a crowd.',art:'✿ &nbsp; ☾ &nbsp; ✧',rules:['Look at six words for as long as you like.','When you’re ready, find them among twelve options.','Choose exactly six. You can change your selections before checking.'],action:'Meet the words',note:'No countdown. This explores recognition, not memory capacity.'},
    bias:{description:'A good decision sometimes starts with a better question.',art:'! &nbsp; → &nbsp; ?',rules:['Read three everyday situations.','Choose a next step that checks the thinking in each one.','See an explanation after each answer. There’s no timer.'],action:'Find a plot twist',note:'The questions explore ideas, not your personality.'},
  }[id];
  setContent(`<h2 id="game-title" class="game-heading">${gameNames[id]}</h2><p class="game-description">${intro.description}</p><div class="game-intro-art" aria-hidden="true">${intro.art}</div><ol class="game-rules">${intro.rules.map(rule=>`<li>${rule}</li>`).join('')}</ol><div class="game-actions"><button class="primary" data-action="start">${intro.action} <span aria-hidden="true">↗</span></button><button class="text-button" data-action="lesson">Just explore the idea</button></div><p class="game-note">${intro.note}</p>`);
}
function debriefHTML(id) { const lesson=lessonFor(id); return `<div class="debrief"><span class="eyebrow">THE PSYCHOLOGY BEHIND THE PLAY</span><h3>${escape(lesson.title)}</h3><p>${escape(lesson.explanation)}</p><p class="takeaway"><strong>Take it with you:</strong> ${escape(lesson.takeaway)}</p><p class="small">${escape(lesson.limitation)}</p>${sourceLink(lesson)}</div>`; }
function showLesson() { game.phase='lesson'; setContent(`<h2 id="game-title" class="game-heading">${gameNames[game.id]}</h2>${debriefHTML(game.id)}<div class="game-actions"><button class="primary" data-action="finish-lesson">Save this discovery <span aria-hidden="true">✧</span></button><button class="text-button" data-action="restart">Try the game</button></div><p class="game-note">Reading the explanation counts as exploring this activity, too.</p>`); }
function reward(id) { const first=!progress.completed.includes(id); progress=completeGame(progress,id); persist(); return first; }
function results(statsHTML,subtitle) {
  const id=game.id; game.phase='result'; const first=reward(id);
  setContent(`<div class="result-hero"><span class="result-flower" aria-hidden="true">✿</span><h2 id="game-title" class="game-heading">A little more self-curious.</h2><p class="result-subtitle">${subtitle}</p><span class="xp-earned">${first?'+50 CURIOSITY XP':'DISCOVERY ALREADY COLLECTED'}</span></div>${statsHTML}${debriefHTML(id)}<div class="game-actions"><button class="primary" data-action="close">Back to the playground <span aria-hidden="true">↗</span></button><button class="text-button" data-action="restart">Play again</button></div>`);
}
function startGame() {
  if(game.id==='stroop'){game={id:'stroop',phase:'practice',index:0,trials:createTrials(),responses:[],ready:false,answered:false}; renderTrial();}
  if(game.id==='memory'){game={id:'memory',phase:'study',...createMemoryRound(),selected:[]}; renderStudy();}
  if(game.id==='bias'){game={id:'bias',phase:'question',index:0,correct:0,answered:false}; renderQuestion();}
}
function renderTrial() {
  const practice=game.phase==='practice';
  const trial=practice?{ink:1,word:2,congruent:false}:game.trials[game.index];
  game.trial=trial; game.answered=false; game.ready=false;
  const token=runId;
  setContent(`<h2 id="game-title" class="game-heading">Name the ink color.</h2><p class="game-description">Ignore the word’s meaning. Choose its color.</p><div class="trial-header"><span>${practice?'Unscored practice':`Trial ${game.index+1} of 12`}</span><div class="trial-dots" aria-hidden="true">${Array.from({length:12},(_,i)=>`<i class="${!practice&&i<game.index?'done':''}"></i>`).join('')}</div></div><div class="stimulus-board"><span class="stimulus-word" style="visibility:hidden;color:${COLORS[trial.ink].value}">${COLORS[trial.word].name.toUpperCase()}</span></div><div class="color-options">${COLORS.map((color,i)=>`<button class="color-choice" data-color="${i}" disabled>${color.name} <kbd>${color.key.toUpperCase()}</kbd></button>`).join('')}</div><p id="trial-feedback" class="trial-feedback" role="status"></p><div id="trial-next" class="game-actions"></div><p class="game-note">${practice?'Here, the word GREEN is printed in blue. The ink-color answer is Blue.':'Choose a color, then continue when you’re ready. Only your response to the word is timed.'}</p>`);
  requestAnimationFrame(()=>{if(game&&runId===token&&!game.answered&&['practice','trial'].includes(game.phase)){ $('.stimulus-word').style.visibility='visible';game.started=performance.now();game.ready=true;$$('[data-color]').forEach(button=>button.disabled=false);}});
}
function answerColor(index) {
  if(!game||!['practice','trial'].includes(game.phase)||!game.ready||game.answered)return;
  game.answered=true;game.ready=false;
  const correct=index===game.trial.ink;
  if(game.phase==='trial')game.responses.push({correct,ms:performance.now()-game.started,congruent:game.trial.congruent});
  $$('[data-color]').forEach(button=>button.disabled=true);
  $('#trial-feedback').textContent=correct?'Yes — that’s the ink color.':`The ink was ${COLORS[game.trial.ink].name.toLowerCase()}. The word can pull you another way.`;
  $('#trial-next').innerHTML=`<button class="primary" data-action="next-trial">${game.phase==='practice'?'Start 12 trials':game.index===11?'See what happened':'Next word'} <span aria-hidden="true">↗</span></button>`;
  $('[data-action="next-trial"]').focus({preventScroll:true});
}
function nextTrial() {
  if(!game.answered)return;
  if(game.phase==='practice'){game.phase='trial';renderTrial();return;}
  if(game.index<11){game.index++;renderTrial();return;}
  const summary=summarizeTrials(game.responses);
  const ms=value=>value===null?'—':`${Math.round(value)} ms`;
  const valid=summary.match!==null&&summary.clash!==null;
  const difference=valid?Math.round(summary.clash-summary.match):null;
  const comparison=!valid?'There weren’t correct responses in both conditions to compare.':difference>0?`In this round, conflicting words took ${difference} ms longer by median.`:difference<0?`In this round, conflicting words were ${Math.abs(difference)} ms faster by median. Short runs can vary.`:'In this round, the two medians were about the same.';
  results(`<div class="result-grid"><div class="result-stat"><strong>${summary.correct}/12</strong><span>ink colors matched</span></div><div class="result-stat"><strong>${ms(summary.match)}</strong><span>matching words · ${summary.matchN} correct</span></div><div class="result-stat"><strong>${ms(summary.clash)}</strong><span>conflicting words · ${summary.clashN} correct</span></div></div><p class="game-note">${comparison} Medians use correct trials only; these are approximate browser timings.</p>`,'You tried a small version of the Stroop task.');
}
document.addEventListener('keydown',event=>{
  if(!dialog.open||!game||event.repeat||event.altKey||event.ctrlKey||event.metaKey)return;
  if(!['practice','trial'].includes(game.phase))return;
  const index=COLORS.findIndex(color=>color.key===event.key.toLowerCase());
  if(index>=0){event.preventDefault();answerColor(index);}
});
document.addEventListener('visibilitychange',()=>{
  if(document.hidden&&game&&['practice','trial'].includes(game.phase)&&!game.answered){
    game.resumePhase=game.phase;game.phase='paused';game.ready=false;runId++;
    setContent('<h2 id="game-title" class="game-heading">A little pause.</h2><p class="game-description">You switched away from the page. This word’s timing was discarded. Try it again when you’re ready.</p><div class="game-actions"><button class="primary" data-action="resume">Resume this word ↗</button></div>',false);
  }
});
function renderStudy() { setContent(`<h2 id="game-title" class="game-heading">Meet six little words.</h2><p class="game-description">Take your time. Make a mental picture, a tiny story, or just notice the words.</p><div class="memory-words">${game.targets.map(word=>`<span class="word-tile study-word">${word}</span>`).join('')}</div><div class="game-actions"><button class="primary" data-action="recognize">I’m ready to find them <span aria-hidden="true">↗</span></button></div><p class="game-note">You control the study time. The words disappear in the next step.</p>`); }
function renderRecognition() {
  game.phase='recognition';
  setContent(`<h2 id="game-title" class="game-heading">Which ones feel familiar?</h2><p class="game-description">Choose the six words you just saw. Tap again to deselect.</p><div class="memory-words">${game.choices.map(word=>`<button class="word-tile" data-word="${word}" aria-pressed="false">${word}</button>`).join('')}</div><p id="selection-count" class="check-note" role="status">0 of 6 selected</p><div class="game-actions"><button class="primary" data-action="check-memory" disabled>Check my words <span aria-hidden="true">↗</span></button></div>`);
}
function selectWord(word) {
  if(game.phase!=='recognition')return;
  if(game.selected.includes(word))game.selected=game.selected.filter(item=>item!==word);
  else if(game.selected.length<6)game.selected.push(word);
  else { $('#selection-count').textContent='Six selected. Deselect one to choose a different word.';return; }
  $$('[data-word]').forEach(button=>button.setAttribute('aria-pressed',game.selected.includes(button.dataset.word)));
  $('#selection-count').textContent=`${game.selected.length} of 6 selected`;
  $('[data-action="check-memory"]').disabled=game.selected.length!==6;
}
function checkMemory() {
  if(game.phase!=='recognition'||game.selected.length!==6)return;
  const score=scoreMemory(game.targets,game.selected);
  const falseAlarms=game.selected.filter(word=>!game.targets.includes(word));
  results(`<div class="result-grid"><div class="result-stat"><strong>${score.hits}/6</strong><span>studied words recognized</span></div><div class="result-stat"><strong>${score.falseAlarms}</strong><span>new words selected</span></div></div><p class="game-note"><strong>Studied words not selected:</strong> ${score.missed.length?score.missed.join(', '):'None'}<br><strong>New words selected:</strong> ${falseAlarms.length?falseAlarms.join(', '):'None'}</p>`,'That was recognition: finding something you’ve encountered before.');
}
function renderQuestion() {
  game.answered=false;const question=biasQuestions[game.index];
  setContent(`<span class="question-number">SITUATION ${game.index+1} OF 3</span><h2 id="game-title" class="game-heading">A tiny thinking detour.</h2><p class="scenario-text">${escape(question.scenario)}</p><div class="answer-list">${question.choices.map((choice,index)=>`<button class="answer-option" data-answer="${index}"><span class="option-letter" aria-hidden="true">${'ABC'[index]}</span><span>${escape(choice)}</span></button>`).join('')}</div><div id="answer-feedback" role="status"></div><div id="question-next" class="game-actions"></div>`);
}
function answerQuestion(index) {
  if(game.phase!=='question'||game.answered)return;
  game.answered=true;const question=biasQuestions[game.index];const correct=index===question.answer;if(correct)game.correct++;
  $$('[data-answer]').forEach(button=>{const answer=Number(button.dataset.answer);button.disabled=true;if(answer===question.answer){button.classList.add('correct');button.querySelector('.option-letter').textContent='✓';}else if(answer===index){button.classList.add('incorrect');button.querySelector('.option-letter').textContent='×';}});
  $('#answer-feedback').innerHTML=`<div class="answer-explanation"><strong>${correct?'That’s a useful next step.':'A different step checks this more directly.'} ${escape(question.concept)}.</strong><br><strong>Correct answer:</strong> ${escape(question.choices[question.answer])}<br>${escape(question.explanation)}</div>`;
  $('#question-next').innerHTML=`<button class="primary" data-action="next-question">${game.index===2?'Collect the insight':'Next situation'} <span aria-hidden="true">↗</span></button>`;
  $('[data-action="next-question"]').focus({preventScroll:true});
}
function nextQuestion(){if(!game.answered)return;if(game.index<2){game.index++;renderQuestion();}else results(`<div class="result-grid"><div class="result-stat"><strong>${game.correct}/3</strong><span>evidence-checking steps identified</span></div><div class="result-stat"><strong>3</strong><span>ideas to notice in everyday life</span></div></div>`,'A better question can change where your thinking goes.');}
content.addEventListener('click',event=>{
  const color=event.target.closest('[data-color]');if(color){answerColor(Number(color.dataset.color));return;}
  const word=event.target.closest('[data-word]');if(word){selectWord(word.dataset.word);return;}
  const answer=event.target.closest('[data-answer]');if(answer){answerQuestion(Number(answer.dataset.answer));return;}
  const button=event.target.closest('[data-action]');if(!button||!game)return;
  const actions={start:startGame,lesson:showLesson,restart:()=>openGame(game.id),'next-trial':nextTrial,recognize:renderRecognition,'check-memory':checkMemory,'next-question':nextQuestion,close:closeGame,resume:()=>{game.phase=game.resumePhase;renderTrial();},'finish-lesson':()=>{const first=reward(game.id);closeGame();toast(first?'Discovery saved. +50 curiosity XP.':'You’ve already collected this discovery.');}};
  actions[button.dataset.action]?.();
});
updateProgress();navigate();showStep(0);generatePrompt();
