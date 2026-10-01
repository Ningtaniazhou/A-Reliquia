// Timings and smootherstep match growth/portal.js and growth/retreat.js.
export const notebookTiming={expand:6500,retreatHold:1300,retreat:5400,write:2100,turn:850};
export const smootherstep=p=>p*p*p*(p*(p*6-15)+10);
export async function movePainting(element,from,to,{retreat=false,reduced=false,paused=()=>document.hidden}={}){
 const duration=reduced?300:retreat?notebookTiming.retreat:notebookTiming.expand;
 const hold=reduced?0:retreat?notebookTiming.retreatHold:0;
 let elapsed=0,last=performance.now();
 const draw=q=>{for(const k of ['left','top','width','height'])element.style[k]=(from[k]+(to[k]-from[k])*q)+'px';};
 draw(0);
 await new Promise(resolve=>{function frame(now){const dt=Math.min(100,now-last);last=now;if(!paused())elapsed+=dt;draw(smootherstep(Math.max(0,Math.min(1,(elapsed-hold)/duration))));if(elapsed>=hold+duration)resolve();else requestAnimationFrame(frame);}requestAnimationFrame(frame);});
}
export function homecomingPicture(){return `<div class="handoff-picture"><img class="handoff-street" src="./assets/dinner/street.webp" alt="离家那夜的里斯本"><div class="handoff-light"></div><img class="handoff-teo" src="./assets/chapter6/v09/teo-surprised.webp" alt="特奥多里科"><img class="handoff-crate" src="./assets/chapter6/obj-0.webp" alt="带走的小圣物箱"></div>`;}
