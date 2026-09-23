import {paintInk} from './brush.mjs';
import {coupletLayout} from './couplet-model.mjs';
import {dedicationText} from './journey-model.mjs';
import {getLesson} from './lessons.mjs';
export const INK = '#202323';
export function strokeSVG(data,{active=-1,before=data.strokes.length,ghost=true,label='Character reference'}={}) {
  const paths=data.strokes.map((d,i)=>{
    const color=i===active?'#202323':i<before?'#899191':ghost?'#e5e8e8':'none';
    return `<path d="${d}" fill="${color}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img" aria-label="${label}"><g transform="translate(0 900) scale(1 -1)">${paths}</g></svg>`;
}
export function paintStrokes(ctx,strokes,box) {
  ctx.save();ctx.translate(box.x,box.y);ctx.scale(box.w,box.h);ctx.fillStyle=INK;ctx.strokeStyle=INK;ctx.lineCap='round';ctx.lineJoin='round';
  for(const stroke of strokes){
    if(stroke.mode==='ink'){paintInk(ctx,stroke);continue;}
    const ps=stroke.points;if(!ps.length)continue;
    ctx.beginPath();ctx.arc(ps[0].x,ps[0].y,ps[0].w/2,0,Math.PI*2);ctx.fill();
    for(let i=1;i<ps.length;i++){
      const a=ps[i-1],b=ps[i];ctx.lineWidth=(a.w+b.w)/2;
      ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
      ctx.beginPath();ctx.arc(b.x,b.y,b.w/2,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}
export function paintArtwork(canvas,strokes,kind='envelope',{thumbnail=false,dedication={},lesson='an'}={}) {
  if(kind==='keepsake')return paintKeepsake(canvas,strokes,{thumbnail,dedication,lesson});
  if(kind==='couplet')return paintCouplet(canvas,strokes,{thumbnail});
  const width=thumbnail?360:kind==='envelope'?1200:1200;
  const height=kind==='envelope'?Math.round(width*5/3):width;
  canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');
  ctx.fillStyle=kind==='envelope'?'#962d32':'#fff';ctx.fillRect(0,0,width,height);
  if(kind==='envelope'){
    const margin=width*.075;ctx.strokeStyle='#dcaaa454';ctx.lineWidth=width/1200;
    ctx.strokeRect(margin,margin,width-2*margin,height-2*margin);
    ctx.strokeStyle='#dcaaa440';ctx.beginPath();ctx.moveTo(margin,margin);ctx.lineTo(width/2,width*.31);ctx.lineTo(width-margin,margin);ctx.stroke();
    paintStrokes(ctx,strokes,{x:width*.15,y:height*.29,w:width*.7,h:width*.7});
    ctx.fillStyle='#ecc2af';ctx.font=`${width*.021}px Georgia`;ctx.textAlign='center';
    ctx.fillText('A WISH FOR YOU',width/2,height*.83);
    ctx.font=`italic ${width*.022}px Georgia`;ctx.fillText('with a little ink, and a little care',width/2,height*.858);
  }else paintStrokes(ctx,strokes,{x:0,y:0,w:width,h:height});
  return canvas;
}

// Wrap by grapheme so long words and Chinese dedications fit as well as English.
export function wrapText(ctx,text,width) {
  const segments=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(x=>x.segment):[...text];
  const lines=[];let line='';
  for(const char of segments){
    if(char==='\n'){lines.push(line.trim());line='';continue;}
    if(ctx.measureText(line+char).width>width&&line){
      const split=line.lastIndexOf(' ');
      if(split>line.length*.45){lines.push(line.slice(0,split));line=line.slice(split+1)+char;}
      else{lines.push(line.trim());line=char;}
    }else line+=char;
  }
  if(line.trim()||!lines.length)lines.push(line.trim());return lines;
}
export function paintKeepsake(canvas,strokes,{thumbnail=false,dedication={},lesson='an'}={}){
  const width=thumbnail?360:1200,scale=width/1200;
  canvas.width=width;canvas.height=width*1.5;
  const ctx=canvas.getContext('2d'),d=dedicationText(dedication),l=getLesson(lesson)||getLesson('an');
  ctx.scale(scale,scale);ctx.fillStyle='#fdfcf9';ctx.fillRect(0,0,1200,1800);
  ctx.fillStyle='#962d32';ctx.fillRect(68,65,1064,6);ctx.strokeStyle='#deddd7';ctx.lineWidth=1;ctx.strokeRect(45,42,1110,1716);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#5a6060';
  ctx.font='25px "Avenir Next", sans-serif';
  ctx.fillText(d.recipient?`FOR ${d.recipient.toLocaleUpperCase()}`:'A LITTLE WISH, IN YOUR OWN HAND',600,139,1000);
  paintStrokes(ctx,strokes,{x:190,y:240,w:820,h:820});
  ctx.fillStyle=INK;ctx.font='48px Georgia, "Songti SC", serif';ctx.fillText(`${l.char}  ·  ${l.meaning}`,600,1135);
  ctx.fillStyle='#626969';ctx.font='28px "Avenir Next", sans-serif';ctx.fillText(l.pinyin,600,1196);
  ctx.font='34px Georgia, "Songti SC", serif';
  let font=34,lines=wrapText(ctx,d.message||'A little ink. A wish of your own.',920);
  while(lines.length>6&&font>22){font-=2;ctx.font=`${font}px Georgia, "Songti SC", serif`;lines=wrapText(ctx,d.message.replace(/\s+/g,' '),920);}
  const gap=font*1.5;const start=1375-(lines.length-1)*gap/2;
  lines.forEach((line,i)=>ctx.fillText(line,600,start+i*gap));
  if(d.sender){ctx.font='italic 30px Georgia, "Songti SC", serif';ctx.fillStyle=INK;ctx.fillText(`With care, ${d.sender}`,600,1610,1000);}
  ctx.fillStyle='#962d32';ctx.font='20px "Avenir Next", sans-serif';ctx.fillText('INK & WISHES  /  墨与愿',600,1710);
  return canvas;
}

// Reveal a licensed filled stroke along its median: direction, not a fading blob.
let referenceId=0;
export function animatedStrokeSVG(data,index,{animate=true,label='Stroke reference'}={}){
  const key=`ink-reference-${++referenceId}`,median=data.medians[index];
  const path=median.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
  const prior=data.strokes.map((d,i)=>`<path d="${d}" fill="${i<index?'#777f7d':'#e9ebe7'}"/>`).join('');
  return `<svg viewBox="0 0 1024 1024" role="img" aria-label="${label}"><defs><mask id="${key}"><path d="${path}" pathLength="1" fill="none" stroke="white" stroke-width="150" stroke-linecap="round" stroke-linejoin="round" class="${animate?'stroke-reveal':''}"/></mask></defs><g transform="translate(0 900) scale(1 -1)">${prior}<path d="${data.strokes[index]}" fill="#202323" mask="url(#${key})"/><circle cx="${median[0][0]}" cy="${median[0][1]}" r="11" fill="#962d32"/></g></svg>`;
}
export function paintCouplet(canvas,couplet,{thumbnail=false,guides=false}={}){
  const layout=coupletLayout(couplet),scale=thumbnail?.24:1;
  canvas.width=Math.round(layout.width*scale);canvas.height=Math.round(layout.height*scale);
  const ctx=canvas.getContext('2d');ctx.scale(scale,scale);
  ctx.fillStyle='#f1f2f3';ctx.fillRect(0,0,layout.width,layout.height);
  ctx.fillStyle='#962d32';
  for(const box of Object.values(layout.strips))ctx.fillRect(box.x,box.y,box.w,box.h);
  ctx.strokeStyle='#dcaaa454';ctx.lineWidth=2;
  for(const box of Object.values(layout.strips))ctx.strokeRect(box.x+14,box.y+14,box.w-28,box.h-28);
  for(const slot of layout.cells){
    const strokes=couplet.cells[slot.key]||[];
    if(strokes.length)paintStrokes(ctx,strokes,slot);
    else if(guides){ctx.fillStyle='#ecc2af65';ctx.font=`${slot.w*.74}px "Songti SC","STSong","SimSun",serif`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(slot.char,slot.x+slot.w/2,slot.y+slot.h*.54);}
  }
  return canvas;
}
