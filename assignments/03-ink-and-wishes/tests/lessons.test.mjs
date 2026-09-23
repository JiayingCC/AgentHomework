import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {LESSONS,getLesson,DEFAULT_LESSON,makeQuiz,checkGlyph} from '../site/lessons.mjs';
import {validateWork,quizChoice} from '../site/core.mjs';
import {strokeSVG} from '../site/render.mjs';

test('all six lessons have matching local stroke data and complete explanations',async()=>{
  assert.equal(LESSONS.length,6);assert.equal(new Set(LESSONS.map(l=>l.id)).size,6);
  assert.equal(new Set(LESSONS.map(l=>l.char)).size,6);
  for(const lesson of LESSONS){
    const data=JSON.parse(await readFile(new URL(`../site/data/${lesson.id}.json`,import.meta.url),'utf8'));
    assert.equal(checkGlyph(data,lesson),data);assert.equal(lesson.captions.length,lesson.count);
    assert.ok(lesson.captions.every(c=>c.length>10));assert.ok(lesson.source.startsWith('https://dict.'));
    const svg=strokeSVG(data,{label:lesson.char});assert.equal((svg.match(/<path /g)||[]).length,lesson.count);
    assert.ok(svg.includes(`aria-label="${lesson.char}"`));assert.ok(!svg.includes('fill="none"'));
  }
});
test('every character quiz offers a real choice with one correct remaining stroke',()=>{
  for(const lesson of LESSONS){
    const quiz=makeQuiz(lesson);assert.ok(quiz.length>=2&&quiz.length<=3);
    quiz.forEach((q,i)=>{
      assert.ok(q.options.length>=2&&q.options.length<=3);assert.equal(new Set(q.options).size,q.options.length);
      assert.ok(q.options.every(n=>n>=q.target&&n<lesson.count));
      assert.equal(q.options.filter((_,j)=>quizChoice(i,j,quiz)).length,1);
      assert.equal(q.hint,lesson.captions[q.target]);assert.throws(()=>quizChoice(i,q.options.length,quiz));
    });
  }
  assert.equal(makeQuiz(getLesson('shan')).length,2);assert.equal(makeQuiz(getLesson('fu')).length,3);
});
test('wrong or malformed character data cannot replace a selected guide',async()=>{
  const data=JSON.parse(await readFile(new URL('../site/data/shan.json',import.meta.url),'utf8'));
  assert.throws(()=>checkGlyph(data,getLesson('fu')));
  assert.throws(()=>checkGlyph({...data,strokes:['<script>',...data.strokes.slice(1)]},getLesson('shan')));
});
test('saved works keep their lesson and legacy works still map to 福',()=>{
  const work={version:1,id:'a',name:'山的练习',kind:'practice',updatedAt:1,strokes:[{mode:'steady',points:[{x:.3,y:.4,w:.02}]}]};
  assert.equal(getLesson(validateWork(work).lesson??DEFAULT_LESSON).char,'福');
  for(const lesson of LESSONS){const saved=JSON.parse(JSON.stringify({...work,lesson:lesson.id}));assert.equal(validateWork(saved).lesson,lesson.id);}
  assert.throws(()=>validateWork({...work,lesson:'unknown'}));
});
