import test from 'node:test';
import assert from 'node:assert/strict';
import {COUPLET_PRESETS,validateCoupletText,blankCouplet,coupletSlots,coupletProgress,coupletLayout} from '../site/couplet-model.mjs';
import {validateWork,MAX_POINTS} from '../site/core.mjs';
import {paintArtwork,paintCouplet} from '../site/render.mjs';
const drawing=()=>[{mode:'steady',points:[{x:.2,y:.3,w:.03},{x:.8,y:.3,w:.03}]}];
function work(){const couplet=blankCouplet();couplet.cells['upper-0']=drawing();couplet.cells['heading-0']=drawing();return {version:1,id:'couplet-one',name:'我的春联',kind:'couplet',updatedAt:1,couplet,brush:{mode:'ink',size:28,ink:.78}};}

test('presets and custom couplets require matched lines and Chinese-only text',()=>{
  COUPLET_PRESETS.forEach(p=>assert.equal(validateCoupletText(p).upper,p.upper));
  assert.deepEqual(validateCoupletText({upper:' 春回大地 ',lower:'福满人间',heading:'新春大吉'}),{upper:'春回大地',lower:'福满人间',heading:'新春大吉'});
  for(const patch of [{upper:'春'}, {lower:'长短不同'}, {heading:'a<script>'}, {upper:'新年，纳余庆'}, {heading:'春 天'}, {upper:'一二三四五六七八九十'}, {heading:'一二三四五六七'}, {upper:'😀😀😀😀😀'}])assert.throws(()=>validateCoupletText({...COUPLET_PRESETS[0],...patch}));
});
test('repeated characters get independent positions and partial drafts count only ink',()=>{
  const c=blankCouplet(COUPLET_PRESETS[1]),slots=coupletSlots(c);
  assert.equal(slots.length,18);assert.equal(new Set(slots.map(s=>s.key)).size,18);
  c.cells['upper-1']=drawing();c.cells['upper-5']=[];
  assert.equal(slots.find(s=>s.key==='upper-1').char,slots.find(s=>s.key==='upper-5').char);
  assert.deepEqual(coupletProgress(c),{written:1,total:18});
});
test('saved couplets retain strokes in all three parts and round-trip independently',()=>{
  const w=work();w.couplet.cells['lower-2']=drawing();const restored=JSON.parse(JSON.stringify(w));
  assert.deepEqual(validateWork(restored),w);restored.couplet.cells['upper-0'][0].points[0].x=.7;
  assert.equal(w.couplet.cells['upper-0'][0].points[0].x,.2);
});
test('corrupt, empty, outside-cell and oversized couplets are rejected',()=>{
  for(const mutate of [w=>w.couplet.cells={},w=>w.couplet.cells=null,w=>w.couplet.cells['upper-99']=drawing(),w=>w.couplet.cells['upper-0']='bad',w=>w.couplet.upper='不等长',w=>w.couplet.upper+=' ',w=>w.couplet.cells['heading-0'][0].points[0].x=2]){const w=work();mutate(w);assert.throws(()=>validateWork(w));}
  const w=work(),p={x:.2,y:.3,w:.02};w.couplet.cells['upper-0']=[{mode:'steady',points:Array(MAX_POINTS/2+1).fill(p)}];w.couplet.cells['lower-0']=[{mode:'steady',points:Array(MAX_POINTS/2+1).fill(p)}];assert.throws(()=>validateWork(w));
});
test('export places upper right, lower left and heading right-to-left within red strips',()=>{
  for(const length of [2,5,7,9]){
    const c=blankCouplet({upper:'春'.repeat(length),lower:'福'.repeat(length),heading:'新春大吉'}),layout=coupletLayout(c);
    const cells=layout.cells,upper=cells.filter(s=>s.part==='upper'),lower=cells.filter(s=>s.part==='lower'),heading=cells.filter(s=>s.part==='heading');
    assert.ok(upper[0].x>lower[0].x);assert.ok(heading[0].x>heading[1].x);assert.ok(upper[0].y<upper[1].y);
    for(const cell of cells){const strip=layout.strips[cell.part];assert.ok(cell.x>=strip.x&&cell.x+cell.w<=strip.x+strip.w);assert.ok(cell.y>=strip.y&&cell.y+cell.h<=strip.y+strip.h);assert.ok(cell.x+cell.w<layout.width&&cell.y+cell.h<layout.height);}
  }
});
test('PNG renderer excludes guide lettering and UI; preview guides are optional',()=>{
  const text=[],ctx=new Proxy({fillText:(...args)=>text.push(args)}, {get:(target,key)=>key in target?target[key]:()=>{}}),canvas={getContext:()=>ctx},c=work().couplet;
  paintArtwork(canvas,c,'couplet');assert.equal(canvas.width,1800);assert.equal(canvas.height,1700);assert.equal(text.length,0);
  paintCouplet(canvas,c,{guides:true});assert.equal(text.length,coupletProgress(c).total-2);
  text.length=0;paintArtwork(canvas,c,'couplet',{thumbnail:true});assert.equal(text.length,0);assert.equal(canvas.width,432);
});
