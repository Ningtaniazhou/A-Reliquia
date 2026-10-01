// Shared by the playable chapter and the animation comparison page.
export const memoryTransitionDuration=3600;
const ease=p=>p*p*(3-2*p);
export function memoryFrame(kind,p){const q=ease(p);if(kind==='iris')return {oldOpacity:1,newOpacity:1,scale:1,clip:`circle(${(q*150).toFixed(3)}% at var(--focus-x,68.5%) var(--focus-y,41%))`};if(kind==='black')return {oldOpacity:1-Math.min(1,p/.42),newOpacity:Math.max(0,(p-.52)/.48),scale:1,clip:'none'};return {oldOpacity:1-q,newOpacity:q,scale:1.035-.035*q,clip:'none'};}
export async function playMemoryTransition(host,oldLayer,newLayer,{kind='crossfade',duration=memoryTransitionDuration,reduced=false,paused=()=>document.hidden}={}){
 host.style.background='#000';oldLayer.classList.add('memory-old');newLayer.classList.add('memory-new');
 let elapsed=0,last=performance.now();const span=reduced?350:duration;
 const draw=p=>{const f=memoryFrame(kind,p);oldLayer.style.opacity=f.oldOpacity;newLayer.style.opacity=f.newOpacity;newLayer.style.transform=`scale(${f.scale})`;newLayer.style.clipPath=f.clip;};draw(0);
 await new Promise(resolve=>{function tick(now){if(!paused())elapsed+=Math.min(100,now-last);last=now;draw(Math.min(1,elapsed/span));if(elapsed>=span)resolve();else requestAnimationFrame(tick);}requestAnimationFrame(tick);});
}
