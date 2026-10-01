// Individual irregular ink marks: sparse first drops, then a gentle shower.
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
const seed=n=>{const v=Math.sin(n*127.1+31.7)*43758.5453;return v-Math.floor(v);};
const drops=Array.from({length:44},(_,i)=>({
 x:seed(i+1),offset:seed(i+51),duration:2.4+seed(i+91)*1.8,
 scale:.55+seed(i+131)*.55,threshold:i/44*.82,
 opacity:.3+seed(i+171)*.22
}));
export function rainMarkup(){return drops.map(()=>'<svg class="journey-raindrop" viewBox="0 0 8 24" aria-hidden="true"><path d="M6.5 1C6 6 7 12 5.2 18.6C4.4 22.4 1.2 23.5 1.4 19.3C1.5 14.5 4.7 6.8 6.5 1Z"/></svg>').join('');}
export function paintRain(layer,strength,reduced,time){
 if(!layer)return;
 const width=layer.clientWidth,height=layer.clientHeight;
 Array.from(layer.children).forEach((el,i)=>{
  const d=drops[i],phase=reduced?d.offset:(time/d.duration+d.offset)%1;
  const visibility=ease((strength-d.threshold)/.18);
  const edge=reduced?1:ease(phase/.12)*ease((1-phase)/.12);
  el.style.opacity=(visibility*edge*d.opacity).toFixed(3);
  el.style.transform=`translate(${d.x*width+(1-phase)*26-13}px,${phase*(height+40)-20}px) rotate(10deg) scale(${d.scale})`;
 });
}
