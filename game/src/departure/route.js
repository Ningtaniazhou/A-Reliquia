import {point} from '../interaction-marks.js';
// Registered against the printed coastal symbols on the 1870 original crop.
// Sea corridors are feasible reconstructions, not the fictional Málaga's logbook.
export const stops=[
 {name:'里斯本',x:137,y:118,fantasy:'lisbon',caption:'里斯本的港口，就在身后。'},
 {name:'直布罗陀',x:188,y:174,path:'M137 118 L126 125 L116 151 L119 166 L147 173 L165 181 L179 180 L188 174'},
 {name:'马耳他',x:470,y:181,path:'M188 174 L202 172 L229 159 L268 138 L321 119 L360 125 L386 132 L411 134 L435 158 L470 181'},
 {name:'亚历山德里亚',x:648,y:246,path:'M470 181 L490 190 L541 204 L593 220 L636 237 L648 246',fantasy:'alexandria',caption:'亚历山德里亚……那我可要在那里好好快活一番。'},
 {name:'雅法',x:760,y:243,path:'M648 246 L649 235 L680 230 L712 233 L738 236 L750 240 L760 243'},
 {name:'耶路撒冷',x:782,y:253,path:'M760 243 L766 248 L770 249 L774 248 L778 250 L782 253',land:true,fantasy:'jerusalem',caption:'耶路撒冷。姨姨交给我的差事。'}
];
export class RoutePlan{
 constructor({step,save,finish,reduced}){Object.assign(this,{step,save,finish,reduced});this.elapsed=0;this.animating=false;this.selected=step-1;this.root=document.getElementById('route');this.ink=document.getElementById('route-ink');this.pen=document.getElementById('unfold');this.pen.innerHTML=point();this.render();}
 sync(step){if(this.step!==step){this.step=step;this.animating=false;this.selected=step-1;this.render();}}
 activate(){if(this.animating){this.complete();return;}if(this.step===6){this.finish();return;}this.step++;this.selected=this.step-1;this.animating=!this.reduced();this.elapsed=0;this.save(this.step);this.render();if(!this.animating)this.complete();}
 tick(dt){if(!this.animating)return;this.elapsed+=dt;const t=Math.min(1,this.elapsed/1200);this.root.style.setProperty('--ink-progress',String(t));if(t===1)this.complete();}
 complete(){this.animating=false;this.root.classList.remove('writing');this.root.style.setProperty('--ink-progress','1');this.showFantasy(this.selected);this.positionHotspot();}
 positionHotspot(){const done=this.step===stops.length&&!this.animating;this.pen.classList.toggle('plan-complete',done);const host=done?this.root.querySelector('.plan-sheet'):document.getElementById('med-map');if(this.pen.parentElement!==host)host.append(this.pen);if(done){this.pen.textContent='收起旅行计划';this.pen.style.left='';this.pen.style.top='';this.pen.setAttribute('aria-label','收起旅行计划，继续剧情');return;}if(!this.pen.querySelector('.interaction-point'))this.pen.innerHTML=point();const index=this.animating?this.step-1:this.step,stop=stops[index];this.pen.style.left=stop.x/885*100+'%';this.pen.style.top=stop.y/320*100+'%';this.pen.setAttribute('aria-label',this.animating?'完成当前线路动画':'标记'+stop.name);}

 showFantasy(i){const f=document.getElementById('route-fantasy'),stop=stops[i];f.hidden=!stop?.fantasy;f.dataset.place=stop?.fantasy||'';f.querySelector('figcaption').textContent=stop?.caption||'';}
 render(){this.root.classList.toggle('writing',this.animating);this.ink.innerHTML='';
 stops.slice(0,this.step).forEach((stop,i)=>{const latest=i===this.step-1,labelY=i===5?stop.y+38:i===4?stop.y-24:stop.y-17;
 this.ink.insertAdjacentHTML('beforeend',`${stop.path?`<path class="route-line ${stop.land?'land':''} ${latest?'new-line':''}" d="${stop.path}" pathLength="1"/>`:''}<g class="route-marker ${latest?'new-marker':''}" role="button" tabindex="0" aria-label="回看${stop.name}" data-index="${i}"><circle cx="${stop.x}" cy="${stop.y}" r="3.5"/><text x="${stop.x}" y="${labelY}" text-anchor="middle">${stop.name}</text></g>`);
 });
 for(const marker of this.ink.querySelectorAll('[data-index]')){const revisit=()=>{if(this.animating)this.complete();this.selected=+marker.dataset.index;this.showFantasy(this.selected);};marker.onclick=revisit;marker.onkeydown=e=>{if(e.key==='Enter'||e.code==='Space'){e.preventDefault();e.stopPropagation();revisit();}};}
 document.getElementById('route-status').textContent=this.step===6?'海路 ━　骑马陆路 ┄':this.step?'海路 ━':'';this.showFantasy(this.animating?-1:this.selected);this.root.style.setProperty('--ink-progress',this.animating?'0':'1');this.positionHotspot();}
}
