import {getLesson,DEFAULT_LESSON,makeQuiz} from './lessons.mjs';
import {validateCoupletText,coupletSlots} from './couplet-model.mjs';
export const MAX_WORKS = 3;
export const MAX_POINTS = 100000;
export const BRUSH_MODES = ['steady','flow','ink'];
export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function normalizePoint(x, y, rect) {
  if (![x,y,rect.left,rect.top,rect.width,rect.height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0) return null;
  return {x:clamp((x-rect.left)/rect.width), y:clamp((y-rect.top)/rect.height)};
}
export function pointWidth(base, speed, mode) {
  return mode === 'flow' ? base * clamp(1.15 - speed * 0.7, 0.3, 1.15) : base;
}
export function validateStrokes(strokes) {
  if (!Array.isArray(strokes) || strokes.length > 5000) throw new Error('This drawing has too many strokes.');
  let count = 0;
  for (const stroke of strokes) {
    if (!stroke || !BRUSH_MODES.includes(stroke.mode) || !Array.isArray(stroke.points) || !stroke.points.length) throw new Error('The saved drawing is not valid.');
    if(stroke.ink!==undefined&&(!Number.isFinite(stroke.ink)||stroke.ink<.15||stroke.ink>1))throw new Error('The saved ink setting is not valid.');
    if(stroke.seed!==undefined&&(!Number.isInteger(stroke.seed)||stroke.seed<0||stroke.seed>0xffffffff))throw new Error('The saved brush texture is not valid.');
    if(stroke.finished!==undefined&&typeof stroke.finished!=='boolean')throw new Error('The saved stroke is not valid.');
    for (const p of stroke.points) {
      count++;
      if (!p || ![p.x,p.y,p.w].every(Number.isFinite) || p.x<0 || p.x>1 || p.y<0 || p.y>1 || p.w<0.0001 || p.w>0.08) throw new Error('The saved drawing contains invalid points.');
    }
  }
  if (count > MAX_POINTS) throw new Error('This drawing is too large to save. Download a PNG to keep it.');
  return strokes;
}
export function validateWork(work) {
  if (!work || work.version!==1 || typeof work.id!=='string' || !work.id || work.id.length>100 || typeof work.name!=='string' || !work.name.trim() || work.name.length>60 || !['practice','envelope','couplet'].includes(work.kind) || !Number.isFinite(work.updatedAt)) throw new Error('This saved work could not be opened.');
  if(work.lesson!==undefined&&!getLesson(work.lesson))throw new Error('The character for this saved work is not supported.');
  if(work.brush && (!Number.isFinite(work.brush.size)||work.brush.size<5||work.brush.size>60||!BRUSH_MODES.includes(work.brush.mode))) throw new Error('The saved brush settings are not valid.');
  if(work.brush?.ink!==undefined&&(!Number.isFinite(work.brush.ink)||work.brush.ink<.15||work.brush.ink>1))throw new Error('The saved ink setting is not valid.');
  if(work.kind==='couplet'){
    const text=validateCoupletText(work.couplet);
    if(Object.entries(text).some(([key,value])=>value!==work.couplet[key]))throw new Error('The saved couplet contains extra spaces.');
    const cells=work.couplet.cells,keys=new Set(coupletSlots(work.couplet).map(slot=>slot.key));
    if(!cells||typeof cells!=='object'||Array.isArray(cells))throw new Error('The saved couplet is not valid.');
    for(const key of Object.keys(cells))if(!keys.has(key))throw new Error('A saved character is outside the couplet.');
    const all=[];
    for(const strokes of Object.values(cells)){validateStrokes(strokes);all.push(...strokes);}
    validateStrokes(all);
    if(!all.length)throw new Error('Write at least one character before saving.');
  }else{
    validateStrokes(work.strokes);
    if (!work.strokes.length) throw new Error('There are no marks in this saved work.');
  }
  return work;
}
export function saveDecision(existing, id) {
  return existing.some(work=>work.id===id) ? 'replace' : existing.length<MAX_WORKS ? 'new' : 'full';
}
export function makePrompt(goal) {
  const clean = String(goal??'').trim();
  if (!clean) throw new Error('Describe one thing you would improve first.');
  return `Improve Ink & Wishes. My goal: ${clean}\n\nFirst inspect the relevant code and explain the current behavior. Propose one small change, preserving existing drawings and the Ink & Wishes learning experience. Implement the change, run checks that would catch the original problem, and show a working preview. Report what you tested, what remains uncertain, and one decision I should review. Do not invent participant feedback or claim a cultural expert reviewed the result.`;
}
export const QUIZ = makeQuiz(getLesson(DEFAULT_LESSON));
export function quizChoice(question, choice,quiz=QUIZ) {
  if (!Number.isInteger(question)||!quiz[question]||!Number.isInteger(choice)||choice<0||choice>=quiz[question].options.length) throw new Error('Invalid quiz choice.');
  return quiz[question].options[choice]===quiz[question].target;
}
