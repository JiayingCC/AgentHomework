import test from 'node:test';
import assert from 'node:assert/strict';
import {inkWidth,brushShape} from '../site/brush.mjs';
import {validateWork,validateStrokes} from '../site/core.mjs';

const stroke=()=>({mode:'ink',ink:.65,seed:417,finished:true,points:Array.from({length:20},(_,i)=>({x:.1+i*.035,y:.35+Math.sin(i/6)*.06,w:.04}))});
test('mouse ink is fuller at low speed and remains within valid saved widths',()=>{
  assert.ok(inkWidth(.04,.1)>inkWidth(.04,2));
  for(const size of [.005,.028,.06])for(const speed of [0,.1,1,5,100,Infinity]){
    const w=inkWidth(size,speed);assert.ok(Number.isFinite(w)&&w>0&&w<=.08);
  }
});
test('pen pressure affects ink width without accepting the release pressure as a full dot',()=>{
  assert.ok(inkWidth(.04,.2,.8)>inkWidth(.04,.2,.2));
  assert.equal(inkWidth(.04,1,0),inkWidth(.04,1));
  for(const pressure of [.01,.5,1,2])for(const speed of [0,3,100])assert.ok(inkWidth(.06,speed,pressure)<=.08);
});
test('a finished brush mark has a belly and a tapered entry and exit',()=>{
  const shape=brushShape(stroke());const belly=Math.max(...shape.map(p=>p.r));
  assert.ok(shape[0].r<belly*.4);assert.ok(shape.at(-1).r<belly*.1);
  assert.ok(shape.every(p=>[p.x,p.y,p.r,p.nx,p.ny].every(Number.isFinite)));
  const live=brushShape({...stroke(),finished:false});assert.ok(live.at(-1).r>shape.at(-1).r*5);
});
test('texture and stroke geometry survive a save/load without random changes',()=>{
  const w={version:1,id:'brush-test',name:'墨迹',kind:'envelope',updatedAt:1,brush:{mode:'ink',size:40,ink:.65},strokes:[stroke()]};
  const saved=validateWork(JSON.parse(JSON.stringify(w)));
  assert.deepEqual(saved,w);assert.deepEqual(brushShape(saved.strokes[0]),brushShape(w.strokes[0]));
});
test('a tap and duplicate samples have finite geometry',()=>{
  const point={x:.5,y:.5,w:.03};
  for(const points of [[point],[point,point],[point,point,{...point,x:.50001}]]){
    const shape=brushShape({...stroke(),points});assert.ok(shape.length>0);
    assert.ok(shape.every(p=>[p.x,p.y,p.r,p.nx,p.ny].every(Number.isFinite)));
  }
});
test('legacy drawings still validate; malformed ink metadata is rejected',()=>{
  for(const mode of ['steady','flow'])assert.doesNotThrow(()=>validateStrokes([{mode,points:[{x:.1,y:.1,w:.014}]}]));
  for(const patch of [{ink:NaN},{ink:0},{ink:1.1},{seed:-1},{seed:1.5},{finished:'yes'}])assert.throws(()=>validateStrokes([{...stroke(),...patch}]));
});
