const dictionary=id=>`https://dict.concised.moe.edu.tw/dictView.jsp?ID=${id}&la=0&powerMode=0`;
const landscapeSource={url:dictionary(34440),title:'Ministry of Education: 山水, landscape'};
const festivalSource={url:'https://ich.unesco.org/en/RL/spring-festival-social-practices-of-the-chinese-people-in-celebration-of-traditional-new-year-02126',title:'UNESCO: Spring Festival practices'};

export const LESSONS=[
  {id:'shan',char:'山',pinyin:'shān',meaning:'Mountain',count:3,group:'Nature',source:dictionary(34392),
    gloss:'Three strokes, a mountain. A simple place to practise balance and space.',
    context:'山 means mountain. Together, 山 and 水 form 山水 (shān shuǐ), a word for natural scenery and for landscape painting. Notice the misty mountain landscape around your paper.',
    connection:landscapeSource,practice:'Let the central stroke stand tall. Leave a little breathing room on either side.',
    captions:['Begin with the tall central vertical stroke.','Write the left side, then turn across the base in one stroke.','Add the vertical on the right.']},
  {id:'shui',char:'水',pinyin:'shuǐ',meaning:'Water',count:4,group:'Nature',source:'https://dict.revised.moe.edu.tw/dictView.jsp?ID=9163&la=0&powerMode=0',
    gloss:'A central line with movement on both sides. Let your brush open out.',
    context:'水 means water. In 山水 (shān shuǐ), mountains and water come together as a name for landscape and landscape painting. This character gives you a small way to connect writing with the painted surroundings.',
    connection:landscapeSource,practice:'Keep the central line steady, then let the side strokes move away from it.',
    captions:['Start with the central vertical and its hook.','Draw the turning stroke on the left, sweeping down-left.','Add the short slant from the upper right toward the centre.','Finish with the long sweep down to the right.']},
  {id:'yong',char:'永',pinyin:'yǒng',meaning:'Lasting',count:5,group:'Brush practice',source:dictionary(45045),
    gloss:'A small mark, a turn, and two open sweeps. Explore the brush’s rhythm.',
    context:'永 carries the sense of lasting or enduring. You will meet it in 永久 (yǒng jiǔ, permanent) and 永遠 (yǒng yuǎn, forever). For your own artwork, think of something you would like to keep.',
    connection:{url:dictionary(45045),title:'Ministry of Education: 永 and example words'},practice:'Try a slow turn and a light finish. Compare how a full brush and a dry brush change the same stroke.',
    captions:['Begin with the small dot at the top.','Move across, turn downward through the centre, and finish with the hook.','Add the turning stroke that sweeps down-left.','Draw the short slant from the upper right toward the centre.','Open out with the final sweep to the right.']},
  {id:'an',char:'安',pinyin:'ān',meaning:'Peace',count:6,group:'A wish',source:dictionary(39684),
    gloss:'A quiet wish: peace, calm, and safety. Write it for someone you care about.',
    context:'安 can describe calm, stability, or safety. Its meaning also appears in words such as 安心 (ān xīn, to feel at ease). Here, choosing 安 for a gift is a personal wish for well-being.',
    connection:{url:dictionary(39684),title:'Ministry of Education: 安, meanings and usage'},practice:'Leave space beneath the roof. Watch where the last horizontal crosses the lower strokes.',
    captions:['Place the small dot above the roof.','Add the short descending stroke at the left of the roof.','Draw the roof across and turn down at its right end.','Begin the lower part with the long angled, turning stroke.','Sweep from the upper right of the lower part down toward the left.','Finish with the long crossing horizontal.']},
  {id:'chun',char:'春',pinyin:'chūn',meaning:'Spring',count:9,group:'Spring Festival',source:dictionary(32885),
    gloss:'A season of beginnings. Build the open upper strokes around the small lower box.',
    context:'春 means spring. It is also the first character in 春節 (chūn jié), Spring Festival. The festival includes greetings, good wishes, and family and community traditions; different families celebrate in different ways.',
    connection:festivalSource,practice:'Give the three horizontal strokes different lengths. Keep the lower box smaller than the open strokes above it.',
    captions:['Begin with the upper horizontal.','Add the second horizontal beneath it.','Write the longer third horizontal.','Sweep from near the top down toward the lower left.','Add the spreading stroke toward the lower right.','Start the lower box with its left vertical.','Draw the top and right side of the box in one turning stroke.','Add the short horizontal inside the box.','Close the box with the bottom horizontal.']},
  {id:'fu',char:'福',pinyin:'fú',meaning:'Good fortune',count:13,group:'Spring Festival',source:dictionary(6421),
    gloss:'A small character with a generous meaning: good fortune, happiness, a blessing.',
    context:'福 brings together ideas of good fortune and well-being. Spring Festival traditions include sharing greetings and wishes for the year ahead. Your own writing can become a personal wish on a red-envelope design.',
    connection:festivalSource,practice:'Keep the left side narrow and leave space between the boxes on the right.',
    captions:['Begin with the small upper-left mark.','Draw the turning stroke below it on the left.','Add the vertical through the left-hand component.','Place the small mark on the right of that component.','Move to the upper horizontal on the right.','Draw the left edge of the upper box.','Turn across the top and down the right side of the upper box.','Close the upper box with its bottom horizontal.','Begin the lower-right box with its left edge.','Draw the top and right side of the lower box in one turn.','Place the horizontal inside the lower box.','Add its central vertical.','Close the lower box with this final horizontal.']}
];
export const DEFAULT_LESSON='fu';
export const getLesson=id=>LESSONS.find(lesson=>lesson.id===id);
export function makeQuiz(lesson){
  const n=lesson.count;
  const targets=lesson.id==='fu'?[0,4,8]:[...new Set([0,Math.floor((n-2)/2),n-2])];
  return targets.map((target,i)=>{
    const remaining=n-target;
    let options=[...new Set([target,target+Math.ceil((remaining-1)/2),n-1])];
    const rotate=(i+1)%options.length;options=options.slice(rotate).concat(options.slice(0,rotate));
    return {target,options,hint:lesson.captions[target]};
  });
}
export function checkGlyph(data,lesson){
  if(!data||data.strokes?.length!==lesson.count||data.medians?.length!==lesson.count||data.strokes.some(s=>typeof s!=='string'||!s.length||!/^[MLCQZHVSAmlcqzhvsa0-9.,\s-]+$/.test(s)))throw new Error(`The reference for ${lesson.char} could not be loaded.`);
  return data;
}
