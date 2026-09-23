import {normalizePoint,MAX_POINTS,validateWork} from './core.mjs';
import {inkWidth} from './brush.mjs';
import {paintStrokes,paintCouplet} from './render.mjs';
import {COUPLET_PRESETS,PARTS,PART_LABELS,PLACEMENT_SOURCE,blankCouplet,coupletSlots,coupletProgress,coupletLayout,validateCoupletText} from './couplet-model.mjs';

export function setupCouplets({toast,confirmAction,openModal,closeModal,onSave,download}){
  const $=s=>document.querySelector(s),canvas=$('#couplet-ink'),ctx=canvas.getContext('2d');
  let piece=blankCouplet(),selected='upper-0',history={},size=28,ink=.78,guide=true,dirty=false,id=null,name='',revision=0;
  let pointer=null,active=null,lastTime=0,frame=0,pointCount=0;
  const copy=value=>structuredClone(value),current=()=>piece.cells[selected]||[],slots=()=>coupletSlots(piece);
  function draw(){frame=0;ctx.clearRect(0,0,canvas.width,canvas.height);paintStrokes(ctx,current(),{x:0,y:0,w:canvas.width,h:canvas.height});}
  function schedule(){if(!frame)frame=requestAnimationFrame(draw);}
  function resize(){const box=canvas.getBoundingClientRect();if(!box.width)return;const dpr=Math.min(devicePixelRatio||1,3);canvas.width=Math.round(box.width*dpr);canvas.height=Math.round(box.height*dpr);draw();}
  new ResizeObserver(resize).observe($('#couplet-paper'));
  function preview(){
    paintCouplet($('#couplet-preview'),piece,{guides:true});
    const layout=coupletLayout(piece),slot=layout.cells.find(s=>s.key===selected),highlight=$('#couplet-highlight');
    Object.assign(highlight.style,{left:`${slot.x/layout.width*100}%`,top:`${slot.y/layout.height*100}%`,width:`${slot.w/layout.width*100}%`,height:`${slot.h/layout.height*100}%`});
    $('#couplet-preview').setAttribute('aria-label',`Couplet preview. Upper line on the right: ${piece.upper}. Lower line on the left: ${piece.lower}. Heading read right to left: ${piece.heading}. Pale letters are unwritten guides.`);
  }
  function update(){
    const list=slots(),slot=list.find(s=>s.key===selected),progress=coupletProgress(piece),index=list.findIndex(s=>s.key===selected);
    $('#couplet-cell-label').textContent=`${PART_LABELS[slot.part]} · ${slot.index+1} / ${[...piece[slot.part]].length}`;
    $('#couplet-guide-character').textContent=slot.char;$('#couplet-guide-character').hidden=!guide;$('#couplet-grid').hidden=!guide;
    $('#couplet-ink').setAttribute('aria-label',`Write ${slot.char} — ${PART_LABELS[slot.part]}, character ${slot.index+1}`);
    $('#couplet-status').textContent=`${progress.written} / ${progress.total} character spaces have ink · ${dirty?'not saved yet':id?'saved in this browser':'start with any character'}`;
    $('#couplet-progress').value=progress.written;$('#couplet-progress').max=progress.total;
    $('#couplet-undo').disabled=!current().length;$('#couplet-redo').disabled=!history[selected]?.length;
    $('#couplet-clear').disabled=!current().length;$('#couplet-save').disabled=!progress.written;$('#couplet-export').disabled=!progress.written;
    $('#couplet-prev').disabled=index===0;$('#couplet-next').disabled=index===list.length-1;
    document.querySelectorAll('[data-couplet-part]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.coupletPart===slot.part)));
    const focusedSlot=document.activeElement?.dataset.slot;
    $('#couplet-characters').replaceChildren();
    [...piece[slot.part]].forEach((char,i)=>{const b=document.createElement('button');b.className='couplet-character';b.dataset.slot=`${slot.part}-${i}`;b.textContent=char;b.lang='zh';b.setAttribute('aria-label',`${PART_LABELS[slot.part]} ${i+1}: ${char}`);b.setAttribute('aria-pressed',String(selected===b.dataset.slot));if(piece.cells[b.dataset.slot]?.length)b.classList.add('has-ink');b.onclick=()=>select(b.dataset.slot);$('#couplet-characters').append(b);if(focusedSlot===b.dataset.slot)b.focus({preventScroll:true});});
  }
  function finish(){if(pointer===null)return;const old=pointer;if(active)active.finished=true;pointer=null;active=null;try{canvas.releasePointerCapture(old);}catch{}draw();preview();update();}
  function select(key){finish();selected=key;draw();preview();update();}
  function changed(){dirty=true;revision++;}
  canvas.addEventListener('pointerdown',event=>{
    if(pointer!==null||event.button!==0||!event.isPrimary)return;
    if(pointCount>=MAX_POINTS){toast('This couplet has reached its drawing limit. Save or download it first.');return;}
    const p=normalizePoint(event.clientX,event.clientY,canvas.getBoundingClientRect());if(!p)return;
    event.preventDefault();pointer=event.pointerId;canvas.setPointerCapture(pointer);
    active={mode:'ink',ink,seed:crypto.getRandomValues(new Uint32Array(1))[0],finished:false,points:[{...p,w:inkWidth(size/1000,0,event.pointerType==='pen'?event.pressure:null)}]};
    (piece.cells[selected]??=[]).push(active);history[selected]=[];pointCount++;lastTime=event.timeStamp;changed();schedule();
  });
  function move(event){
    if(event.pointerId!==pointer||!active)return;event.preventDefault();
    const events=event.getCoalescedEvents?.();
    for(const e of events?.length?events:[event]){
      const p=normalizePoint(e.clientX,e.clientY,canvas.getBoundingClientRect());if(!p)continue;
      const last=active.points.at(-1),distance=Math.hypot(p.x-last.x,p.y-last.y);if(distance<.0007)continue;
      if(pointCount>=MAX_POINTS){finish();toast('Drawing limit reached. Save this couplet before continuing.');break;}
      const speed=distance/Math.max(1,e.timeStamp-lastTime)*1000,target=inkWidth(size/1000,speed,e.pointerType==='pen'?e.pressure:null);
      active.points.push({...p,w:last.w*.6+target*.4});pointCount++;lastTime=e.timeStamp;
    }
    schedule();
  }
  canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',e=>{if(e.pointerId===pointer){move(e);finish();}});
  for(const type of ['pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{if(e.pointerId===pointer)finish();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
  function undo(){finish();const stroke=current().pop();if(!stroke)return;(history[selected]??=[]).push(stroke);pointCount-=stroke.points.length;changed();draw();preview();update();}
  function redo(){finish();const stroke=history[selected]?.pop();if(!stroke)return;(piece.cells[selected]??=[]).push(stroke);pointCount+=stroke.points.length;changed();draw();preview();update();}
  $('#couplet-undo').onclick=undo;$('#couplet-redo').onclick=redo;
  document.addEventListener('keydown',e=>{if($('#view-couplets').hidden||$('#modal').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo();}});
  $('#couplet-clear').onclick=()=>confirmAction('Clear this character?','Only this character’s ink will be cleared. The rest of your couplet stays.','Clear character',()=>{pointCount-=current().reduce((n,s)=>n+s.points.length,0);piece.cells[selected]=[];history[selected]=[];changed();draw();preview();update();});
  $('#couplet-guide').onclick=()=>{guide=!guide;$('#couplet-guide').setAttribute('aria-pressed',String(guide));update();};
  $('#couplet-size').oninput=e=>{size=Number(e.target.value);$('#couplet-size-value').textContent=size;};
  $('#couplet-ink-load').oninput=e=>{ink=Number(e.target.value)/100;$('#couplet-ink-value').textContent=`${e.target.value}%`;};
  for(const part of PARTS)document.querySelector(`[data-couplet-part="${part}"]`).onclick=()=>select(`${part}-0`);
  function step(delta){const list=slots(),index=list.findIndex(s=>s.key===selected);if(list[index+delta])select(list[index+delta].key);}
  $('#couplet-prev').onclick=()=>step(-1);$('#couplet-next').onclick=()=>step(1);
  function fillInputs(){for(const part of PARTS)$(`#couplet-${part}`).value=piece[part];}
  function showContext(preset){
    $('#couplet-meaning').textContent=preset?preset.meaning:'Your own words. Matching lengths are checked; tone patterns and literary parallelism need human review.';
    $('#couplet-example-source').hidden=!preset;
    if(preset){$('#couplet-example-source').href=preset.source;$('#couplet-example-source').textContent='Read the source for these two lines ↗';}
    $('#couplet-heading-note').textContent=preset?'The heading is a suggested pairing for this exercise.':'';
  }
  function replace(text,preset){
    const apply=()=>{finish();piece=blankCouplet(text);selected='upper-0';history={};pointCount=0;id=null;name='';dirty=false;revision++;fillInputs();showContext(preset);draw();preview();update();toast('Your new couplet is ready to write.');};
    if(coupletProgress(piece).written)confirmAction('Start a new couplet?','This replaces the current couplet draft. Saved works stay in your collection.','Start new couplet',apply);else apply();
  }
  COUPLET_PRESETS.forEach(preset=>{const b=document.createElement('button');b.className='button button-light';b.textContent=preset.title;b.onclick=()=>replace(preset,preset);$('#couplet-presets').append(b);});
  $('#couplet-text-form').onsubmit=e=>{e.preventDefault();try{const text=validateCoupletText(Object.fromEntries(PARTS.map(part=>[part,$(`#couplet-${part}`).value])));$('#couplet-text-error').textContent='';replace(text,null);}catch(error){$('#couplet-text-error').textContent=error.message;}};
  $('#couplet-save').onclick=()=>{finish();onSave(snapshot());};
  $('#couplet-export').onclick=()=>{
    finish();const progress=coupletProgress(piece),payload=copy(piece);
    const go=()=>download(payload,'couplet',name||'my-spring-couplet');
    if(progress.written<progress.total)confirmAction('Download an unfinished couplet?',`${progress.total-progress.written} character spaces still have no ink. Those spaces will be blank in the PNG; tracing guides are never exported.`,'Download draft',go);else go();
  };
  $('#couplet-culture').onclick=()=>{
    openModal('春联 · TWO LINES, ONE WISH',`<h2 id="modal-title">A doorway into a new year.</h2><p>Spring Festival couplets pair two lines of equal length to express hopes for the year ahead. The upper line is 上联, the lower line 下联, and the short heading 横批 ties the wish together.</p><h3>Face the doorway</h3><p>This studio uses the traditional arrangement: upper line on your right, lower line on your left. Both run from top to bottom. The heading reads from right to left. Modern arrangements also exist; direction matters when placing a real set.</p><h3>Write one space at a time</h3><p>Select a line, then a character. The pale printed letter is a guide, not a brushwork model. Your own ink appears on the red paper. A filled space records ink, not calligraphy accuracy.</p><p>For your own text, this prototype checks equal character counts. It does not judge tones, parallelism, or artistic quality.</p><ul class="source-list"><li><a href="${PLACEMENT_SOURCE}" target="_blank" rel="noreferrer">Source for placement conventions ↗</a></li><li><a href="${COUPLET_PRESETS[0].source}" target="_blank" rel="noreferrer">CCTV: Spring Festival couplets and wishes ↗</a></li></ul><div class="modal-actions"><button class="button button-dark" id="couplet-culture-close">Back to my couplet ↗</button></div>`);
    $('#couplet-culture-close').onclick=closeModal;
  };
  function snapshot(){return {kind:'couplet',payload:copy(piece),id,name,revision,brush:{size,mode:'ink',ink}};}
  function openWork(work){
    validateWork(work);
    const apply=()=>{finish();piece=copy(work.couplet);selected=slots().find(s=>piece.cells[s.key]?.length)?.key||'upper-0';history={};id=work.id;name=work.name;dirty=false;revision++;size=work.brush?.size??28;ink=work.brush?.ink??.78;pointCount=Object.values(piece.cells).flat().reduce((n,s)=>n+s.points.length,0);fillInputs();showContext(COUPLET_PRESETS.find(p=>PARTS.every(part=>p[part]===piece[part])));$('#couplet-size').value=size;$('#couplet-size-value').textContent=size;$('#couplet-ink-load').value=Math.round(ink*100);$('#couplet-ink-value').textContent=`${Math.round(ink*100)}%`;location.hash='couplets';requestAnimationFrame(resize);preview();update();toast('Your couplet is open for editing.');};
    if(dirty&&coupletProgress(piece).written)confirmAction('Open this saved couplet?','This replaces your current unsaved couplet draft.','Open saved couplet',apply);else apply();
  }
  fillInputs();showContext(COUPLET_PRESETS[0]);preview();update();
  return {finish,resize,openWork,hasUnsaved:()=>dirty&&coupletProgress(piece).written>0,
    saved(work,savedRevision){if(revision===savedRevision){id=work.id;name=work.name;dirty=false;update();}},
    removed(removedId){if(id===removedId){id=null;dirty=coupletProgress(piece).written>0;update();}}
  };
}
