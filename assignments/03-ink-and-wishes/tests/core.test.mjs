import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {normalizePoint,pointWidth,validateStrokes,validateWork,saveDecision,makePrompt,QUIZ,quizChoice,MAX_POINTS} from '../site/core.mjs';
const drawing=()=>[{mode:'steady',points:[{x:.1,y:.2,w:.014},{x:.8,y:.3,w:.014}]}];
const work=()=>({version:1,id:'one',name:'A wish',kind:'envelope',updatedAt:1,strokes:drawing(),brush:{size:14,mode:'steady'}});

test('same relative pointer position survives canvas resize and page offset',()=>{
  assert.deepEqual(normalizePoint(350,400,{left:100,top:150,width:500,height:500}),{x:.5,y:.5});
  assert.deepEqual(normalizePoint(140,360,{left:20,top:240,width:240,height:240}),{x:.5,y:.5});
  assert.equal(normalizePoint(0,0,{left:0,top:0,width:0,height:100}),null);
});
test('captured pointer outside the paper is bounded without invalid coordinates',()=>{
  assert.deepEqual(normalizePoint(-20,500,{left:0,top:0,width:300,height:300}),{x:0,y:1});
  assert.equal(normalizePoint(NaN,5,{left:0,top:0,width:100,height:100}),null);
});
test('steady width is invariant; experimental speed variation is bounded',()=>{
  for(const speed of [0,.1,1,10,100]) assert.equal(pointWidth(.02,speed,'steady'),.02);
  assert.ok(pointWidth(.02,2,'flow')<pointWidth(.02,.1,'flow'));
  for(let speed=0;speed<100;speed+=.3){const w=pointWidth(.02,speed,'flow');assert.ok(w>=.006&&w<=.023);}
});
test('valid saved work retains editable points, brush settings, and Unicode name',()=>{
  const w=work();w.name='新年的福';const roundTrip=JSON.parse(JSON.stringify(w));assert.deepEqual(validateWork(roundTrip),w);
});
test('damaged or unsupported saved work is rejected instead of drawn',()=>{
  for(const mutation of [w=>w.version=2,w=>w.name=' ',w=>w.kind='unknown',w=>w.updatedAt=NaN,w=>w.strokes=[],w=>w.brush.size=100,w=>w.brush.mode='unknown']){
    const w=work();mutation(w);assert.throws(()=>validateWork(w));
  }
});
test('invalid point data cannot enter the renderer via a saved work',()=>{
  for(const bad of [{x:Infinity,y:.1,w:.01},{x:-.01,y:.1,w:.01},{x:.1,y:2,w:.01},{x:.1,y:.1,w:0},{x:.1,y:.1,w:.9},{x:'0.1',y:.2,w:.01}]){
    assert.throws(()=>validateStrokes([{mode:'steady',points:[bad]}]));
  }
  assert.throws(()=>validateStrokes([{mode:'steady',points:[]}]));assert.throws(()=>validateStrokes('invalid'));
});
test('oversized saved drawings are rejected without silent truncation',()=>{
  const p={x:.1,y:.2,w:.01};assert.throws(()=>validateStrokes([{mode:'steady',points:Array(MAX_POINTS+1).fill(p)}]));
});
test('collection capacity distinguishes confirmed replacement from a new fourth work',()=>{
  const existing=[{id:'a'},{id:'b'},{id:'c'}];assert.equal(saveDecision(existing,'d'),'full');assert.equal(saveDecision(existing,'b'),'replace');assert.equal(saveDecision(existing.slice(0,2),'d'),'new');
});
test('every quiz has exactly one correct option from the bundled stroke model',async()=>{
  const data=JSON.parse(await readFile(new URL('../site/data/fu.json',import.meta.url),'utf8'));
  assert.equal(data.strokes.length,13);assert.equal(data.medians.length,13);
  QUIZ.forEach((q,i)=>{assert.equal(new Set(q.options).size,3);assert.equal(q.options.filter((_,j)=>quizChoice(i,j)).length,1);assert.ok(q.options.every(x=>x>=q.target&&x<data.strokes.length));});
  assert.throws(()=>quizChoice(3,0));assert.throws(()=>quizChoice(0,-1));
});
test('generated agent brief requires a goal and includes evaluation constraints',()=>{
  assert.throws(()=>makePrompt('  '));const prompt=makePrompt('  Make the guide clearer.  ');assert.ok(prompt.includes('Make the guide clearer.'));assert.ok(prompt.includes('preserving existing drawings'));assert.ok(prompt.includes('Do not invent participant feedback'));
});
