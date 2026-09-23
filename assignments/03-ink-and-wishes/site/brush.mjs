// Geometry is in paper coordinates. Keeping texture deterministic makes a saved
// stroke look the same when reopened, resized, or exported onto red paper.
const clamp=(x,lo=0,hi=1)=>Math.min(hi,Math.max(lo,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x);};
const random=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v);};
const noise=(t,seed)=>{const i=Math.floor(t),f=ease(t-i);return random(i+seed)*(1-f)+random(i+1+seed)*f;};
const mix=(a,b,t)=>({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,w:a.w+(b.w-a.w)*t});
export function inkWidth(base,speed,pressure=null){
  const velocity=Number.isFinite(speed)?Math.max(0,speed):0;
  if(Number.isFinite(pressure)&&pressure>0){
    return base*clamp(clamp(.24+clamp(pressure)*1.08,.24,1.26)*clamp(1.06-velocity*.09,.75,1.06),.2,1.28);
  }
  return base*clamp(1.18/(1+velocity*.82),.3,1.18);
}
export function brushShape(stroke){
  const points=stroke.points;
  if(points.length<2)return points.map(p=>({...p,r:p.w/2,nx:0,ny:1,d:0}));
  const smooth=[{...points[0]}];
  let start=points[0];
  for(let i=1;i<points.length;i++){
    const control=points[i-1],end=i===points.length-1?points[i]:mix(points[i-1],points[i],.5);
    const length=Math.hypot(control.x-start.x,control.y-start.y)+Math.hypot(end.x-control.x,end.y-control.y);
    const steps=Math.max(1,Math.ceil(length/.0025));
    for(let j=1;j<=steps;j++){const t=j/steps; smooth.push(mix(mix(start,control,t),mix(control,end,t),t));}
    start=end;
  }
  let total=0;
  smooth.forEach((p,i)=>{if(i)total+=Math.hypot(p.x-smooth[i-1].x,p.y-smooth[i-1].y);p.d=total;});
  const maxWidth=Math.max(...points.slice(0,4096).map(p=>p.w));
  const ramp=Math.min(total*.28,Math.max(.005,maxWidth*1.15));
  return smooth.map((p,i)=>{
    const prev=smooth[Math.max(0,i-1)],next=smooth[Math.min(smooth.length-1,i+1)];
    const dx=next.x-prev.x,dy=next.y-prev.y,length=Math.hypot(dx,dy)||1;
    const entry=.28+.72*ease(p.d/(ramp*.7||1));
    const exit=stroke.finished===false?1:.06+.94*ease((total-p.d)/(ramp||1));
    // Slightly flattened brush belly rather than a circular marker nib.
    const angle=.83+.17*Math.abs(dx/length);
    return {...p,nx:-dy/length,ny:dx/length,r:p.w*.5*Math.min(entry,exit)*angle};
  });
}
function ribbon(ctx,shape,scale=1){
  ctx.beginPath();
  shape.forEach((p,i)=>{const x=p.x+p.nx*p.r*scale,y=p.y+p.ny*p.r*scale;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});
  for(let i=shape.length-1;i>=0;i--){const p=shape[i];ctx.lineTo(p.x-p.nx*p.r*scale,p.y-p.ny*p.r*scale);}
  ctx.closePath();ctx.fill();
}
export function paintInk(ctx,stroke){
  const shape=brushShape(stroke),ink=stroke.ink??.78;
  if(!shape.length)return;
  ctx.save();ctx.fillStyle='#171b1b';ctx.strokeStyle='#171b1b';ctx.lineCap='round';ctx.lineJoin='round';
  if(shape.length===1){
    const p=shape[0];ctx.globalAlpha=.12;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*.85,p.r*1.05,-.55,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=.55+ink*.4;ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*.72,p.r*.92,-.55,0,Math.PI*2);ctx.fill();ctx.restore();return;
  }
  ctx.globalAlpha=.04+ink*.035;ribbon(ctx,shape,1.12);
  ctx.globalAlpha=.025+Math.pow(ink,2)*.88;ribbon(ctx,shape);
  const seed=stroke.seed??Math.round((shape[0].x+shape[0].y)*997);
  const strands=42;
  for(let lane=0;lane<strands;lane++){
    const offset=(lane/(strands-1)*2-1)*.98;
    const phase=(seed%997)*.1+lane*2.39996;
    ctx.globalAlpha=clamp(.84+ink*.13+Math.sin(phase)*.035,.78,.99);
    ctx.beginPath();let connected=false;
    // Each lane is split into short tapered ribbons. Their narrow gaps are
    // translucent, so a crossing stroke never erases ink drawn earlier.
    let left=[],right=[];
    const flush=()=>{
      if(left.length>1){ctx.moveTo(left[0].x,left[0].y);for(const p of left.slice(1))ctx.lineTo(p.x,p.y);for(let j=right.length-1;j>=0;j--)ctx.lineTo(right[j].x,right[j].y);ctx.closePath();}
      left=[];right=[];connected=false;
    };
    for(const p of shape){
      const dry=noise(p.d*(23+lane%7),phase*97);
      const edge=Math.abs(offset);
      if(dry<.55-ink*.52+edge*.06){if(connected)flush();continue;}
      const wobble=(noise(p.d*28,phase*17)-.5)*.018;
      const center=offset+wobble;
      const half=(.016+ink*.015)*(1+.14*Math.sin(p.d*21+phase));
      left.push({x:p.x+p.nx*p.r*(center+half),y:p.y+p.ny*p.r*(center+half)});
      right.push({x:p.x+p.nx*p.r*(center-half),y:p.y+p.ny*p.r*(center-half)});connected=true;
    }
    flush();ctx.fill();
  }
  ctx.restore();
}
