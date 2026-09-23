import {normalizePoint, MAX_POINTS} from './core.mjs';
import {inkWidth} from './brush.mjs';
import {paintStrokes} from './render.mjs';

// A pointer pad using the same brush and normalized coordinates as the studio.
export function drawingPad(canvas, {onChange = () => {}, onLimit = () => {}} = {}) {
  const ctx = canvas.getContext('2d'), baked = document.createElement('canvas'), ink = baked.getContext('2d');
  let strokes = [], redo = [], pointer = null, active = null, time = 0, count = 0, frame = 0, bakedCount = 0;
  let size = 28, load = .78, enabled = true;
  function draw() {
    frame = 0;
    const complete = active ? strokes.length - 1 : strokes.length;
    if (bakedCount > complete) {ink.clearRect(0,0,baked.width,baked.height);bakedCount = 0;}
    if (complete > bakedCount) {paintStrokes(ink,strokes.slice(bakedCount,complete),{x:0,y:0,w:baked.width,h:baked.height});bakedCount = complete;}
    ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(baked,0,0);
    if (active) paintStrokes(ctx,[active],{x:0,y:0,w:canvas.width,h:canvas.height});
  }
  function schedule() {if (!frame) frame = requestAnimationFrame(draw);}
  function invalidate() {bakedCount = 0;ink.clearRect(0,0,baked.width,baked.height);schedule();}
  function resize() {
    const rect = canvas.getBoundingClientRect();if (!rect.width || !rect.height) return;
    const ratio = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width*ratio);canvas.height = Math.round(rect.height*ratio);
    baked.width = canvas.width;baked.height = canvas.height;bakedCount = 0;draw();
  }
  function notify() {onChange(strokes, {canUndo:!!strokes.length, canRedo:!!redo.length});}
  function finish() {
    if (pointer === null) return;
    const old = pointer;active.finished = true;pointer = null;active = null;
    try {canvas.releasePointerCapture(old);} catch {}
    schedule();notify();
  }
  function append(event) {
    if (event.pointerId !== pointer || !active) return;
    event.preventDefault();const rect = canvas.getBoundingClientRect();
    const coalesced = event.getCoalescedEvents?.();
    for (const e of coalesced?.length ? coalesced : [event]) {
      const point = normalizePoint(e.clientX,e.clientY,rect);if (!point) continue;
      const previous = active.points.at(-1), distance = Math.hypot(point.x-previous.x,point.y-previous.y);
      if (distance < .0007) continue;
      if (count >= MAX_POINTS) {finish();onLimit();break;}
      const speed = distance / Math.max(1,e.timeStamp-time)*1000;
      const width = inkWidth(size/1000,speed,e.pointerType === 'pen' ? e.pressure : null);
      active.points.push({...point,w:previous.w*.6+width*.4});count++;time=e.timeStamp;
    }
    schedule();
  }
  canvas.addEventListener('pointerdown', event => {
    if (!enabled || pointer !== null || event.button !== 0 || !event.isPrimary) return;
    if (count >= MAX_POINTS || strokes.length >= 5000) {onLimit();return;}
    const p = normalizePoint(event.clientX,event.clientY,canvas.getBoundingClientRect());if (!p) return;
    event.preventDefault();pointer = event.pointerId;canvas.setPointerCapture(pointer);
    active = {mode:'ink',ink:load,seed:crypto.getRandomValues(new Uint32Array(1))[0],finished:false,points:[{...p,w:inkWidth(size/1000,0,event.pointerType === 'pen' ? event.pressure : null)}]};
    strokes.push(active);redo=[];count++;time=event.timeStamp;schedule();notify();
  });
  canvas.addEventListener('pointermove',append);
  canvas.addEventListener('pointerup',event=>{if(event.pointerId === pointer){append(event);finish();}});
  for (const event of ['pointercancel','lostpointercapture']) canvas.addEventListener(event,e=>{if(e.pointerId === pointer)finish();});
  const observer = new ResizeObserver(resize);observer.observe(canvas);
  return {
    finish, resize, get:()=>structuredClone(strokes),
    set(value) {finish();strokes=structuredClone(value);redo=[];count=strokes.reduce((n,s)=>n+s.points.length,0);invalidate();notify();},
    undo() {finish();if(strokes.length){const s=strokes.pop();redo.push(s);count-=s.points.length;invalidate();notify();}},
    redo() {finish();if(redo.length){const s=redo.pop();strokes.push(s);count+=s.points.length;invalidate();notify();}},
    settings(nextSize,nextLoad) {size=nextSize;load=nextLoad;},
    enabled(value) {if(!value)finish();enabled=value;canvas.style.pointerEvents=value?'auto':'none';}
  };
}
