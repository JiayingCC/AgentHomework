import {paintInk} from './brush.mjs';
export const INK = '#202323';
export function strokeSVG(data,{active=-1,before=13,ghost=true,label='Reference for 福'}={}) {
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
export function paintArtwork(canvas,strokes,kind='envelope',{thumbnail=false}={}) {
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
