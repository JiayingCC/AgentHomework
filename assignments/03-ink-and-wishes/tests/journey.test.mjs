import test from 'node:test';
import assert from 'node:assert/strict';
import {validateWork} from '../site/core.mjs';
import {dedicationText,nextEnvelopeState,recordAnswer} from '../site/journey-model.mjs';
import {paintArtwork,wrapText,animatedStrokeSVG} from '../site/render.mjs';
import {readFile} from 'node:fs/promises';
const strokes=[{mode:'ink',ink:.78,seed:3,finished:true,points:[{x:.3,y:.4,w:.025},{x:.7,y:.5,w:.012}]}];
const work={version:1,id:'keepsake-test',name:'A little peace',kind:'keepsake',lesson:'an',updatedAt:1,strokes,dedication:{recipient:'Maya',sender:'嘉',message:'愿你平安。 A little peace.'}};
test('new dedication round-trips with the original strokes; legacy envelopes still validate',()=>{
  const saved=JSON.parse(JSON.stringify(work));assert.deepEqual(validateWork(saved),work);
  const legacy={...work,kind:'envelope'};delete legacy.dedication;delete legacy.lesson;assert.equal(validateWork(legacy),legacy);
  assert.deepEqual(dedicationText(),{recipient:'',sender:'',message:''});
});
test('malformed and oversized metadata fail before saving while literal text remains literal',()=>{
  for(const d of [null,[],{message:55},{recipient:'x'.repeat(41)},{message:'x'.repeat(161)},{sender:'x'.repeat(41)}])assert.throws(()=>validateWork({...work,dedication:d}));
  assert.throws(()=>validateWork({...work,lesson:undefined}));
  assert.equal(dedicationText({message:' <b>你好</b> '}).message,'<b>你好</b>');
});
test('envelope transitions cannot skip sealing, and repeat activation stays consistent',()=>{
  assert.equal(nextEnvelopeState('ready','open'),'ready');
  assert.equal(nextEnvelopeState('ready','seal'),'sealed');
  assert.equal(nextEnvelopeState('sealed','seal'),'sealed');
  assert.equal(nextEnvelopeState('sealed','open'),'opened');
  assert.equal(nextEnvelopeState('opened','replay'),'sealed');
  assert.equal(nextEnvelopeState('sealed','edit'),'ready');
});
test('correcting an answer never inflates the first-attempt count',()=>{
  const initial=[];let result=recordAnswer(initial,0,false);result=recordAnswer(result,0,true);result=recordAnswer(result,0,true);result=recordAnswer(result,1,true);
  assert.deepEqual(initial,[]);assert.equal(result.filter(x=>x.firstCorrect).length,1);assert.equal(result[0].attempts,2);assert.ok(result.every(x=>x.correct));
});
test('export includes dedication and actual ink at full resolution; whitespace and long words fit',()=>{
  const texts=[];const ctx=new Proxy({measureText:text=>({width:[...text].length*18}),fillText:(...args)=>texts.push(args)}, {get:(o,key)=>key in o?o[key]:()=>{}});
  const canvas={getContext:()=>ctx};paintArtwork(canvas,strokes,'keepsake',{dedication:work.dedication,lesson:'an'});
  assert.equal(canvas.width,1200);assert.equal(canvas.height,1800);
  assert.ok(texts.some(([text])=>text==='FOR MAYA'));assert.ok(texts.some(([text])=>text==='With care, 嘉'));
  assert.ok(texts.some(([text])=>text.includes('愿你平安')));
  for(const text of ['a'.repeat(160),'平安'.repeat(80),'hello\n\nworld', 'a long message with spaces '.repeat(6)]){
    const lines=wrapText(ctx,text,200);assert.ok(lines.every(line=>ctx.measureText(line).width<=200));
  }
});
test('stroke direction is revealed from the bundled median and SVG masks have independent IDs',async()=>{
  const data=JSON.parse(await readFile(new URL('../site/data/an.json',import.meta.url),'utf8'));
  const first=animatedStrokeSVG(data,0),second=animatedStrokeSVG(data,0);
  assert.ok(first.includes(`M${data.medians[0][0][0]} ${data.medians[0][0][1]}`));
  assert.notEqual(first.match(/id="([^"]+)/)[1],second.match(/id="([^"]+)/)[1]);
  assert.ok(!animatedStrokeSVG(data,0,{animate:false}).includes('class="stroke-reveal"'));
});
