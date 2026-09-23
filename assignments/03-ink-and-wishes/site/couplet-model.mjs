export const COUPLET_PRESETS = [
  {id:'renewal',title:'新春 · A fresh beginning',upper:'新年纳余庆',lower:'佳节号长春',heading:'新春大吉',meaning:'Welcome a new year of blessings and a festive season of lasting spring.',source:'https://news.cctv.cn/2025/01/27/ARTIBOkWCYOUApK8PUngdEIt250127.shtml'},
  {id:'blessings',title:'福满门 · Blessings at the door',upper:'天增岁月人增寿',lower:'春满乾坤福满门',heading:'福满人间',meaning:'May the passing years bring long life, and spring bring blessings to your home.',source:'https://www.ndrc.gov.cn/fzggw/jgsj/ltj/sjdt/202301/t20230117_1346733.html'}
];
export const PARTS = ['upper','lower','heading'];
export const PART_LABELS = {upper:'上联 · Upper line',lower:'下联 · Lower line',heading:'横批 · Heading'};
export const PLACEMENT_SOURCE = 'https://www.zhongyuan.gov.cn/hlwpy/9901488.jhtml';
export function validateCoupletText(value){
  if(!value||typeof value!=='object')throw new Error('Enter both lines and a heading.');
  const text={};
  for(const part of PARTS){
    if(typeof value[part]!=='string')throw new Error('Enter both lines and a heading.');
    text[part]=value[part].trim();
    const count=[...text[part]].length,max=part==='heading'?6:9;
    if(count<2||count>max||!/^\p{Script=Han}+$/u.test(text[part]))throw new Error(`${PART_LABELS[part]}: use 2–${max} Chinese characters, without spaces or punctuation.`);
  }
  if([...text.upper].length!==[...text.lower].length)throw new Error('The upper and lower lines need the same number of characters.');
  return text;
}
export function coupletSlots(couplet){
  return PARTS.flatMap(part=>[...couplet[part]].map((char,index)=>({key:`${part}-${index}`,part,index,char})));
}
export function blankCouplet(text=COUPLET_PRESETS[0]){
  return {...validateCoupletText(text),cells:{}};
}
export function coupletProgress(couplet){
  const slots=coupletSlots(couplet);
  return {written:slots.filter(slot=>couplet.cells[slot.key]?.length).length,total:slots.length};
}
// Coordinates are shared by the screen preview and PNG: face the door,
// upper line at the right, lower at the left, heading read right to left.
export function coupletLayout(couplet){
  const headingCount=[...couplet.heading].length,lineCount=[...couplet.upper].length;
  const size=1080/lineCount,top=390;
  const strips={heading:{x:240,y:110,w:1320,h:200},upper:{x:1370,y:top-25,w:240,h:lineCount*size+70},lower:{x:190,y:top-25,w:240,h:lineCount*size+70}};
  const cells=coupletSlots(couplet).map(slot=>{
    const w=slot.part==='heading'?150:Math.min(180,size);
    const x=slot.part==='heading'?900+(headingCount/2-slot.index-.5)*180-w/2:slot.part==='upper'?1490-w/2:310-w/2;
    return {...slot,x,y:slot.part==='heading'?135:top+slot.index*size,w,h:w};
  });
  return {width:1800,height:1700,strips,cells};
}
