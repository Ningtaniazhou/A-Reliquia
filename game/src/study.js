import {studyItems,studyComplete} from './study-content.js';
import {point} from './interaction-marks.js';
export function fitStudyDetail(){ /* Isolated objects use a responsive square, no crop fitting. */ }
export function studyHotspots(s){
 return studyItems.map((item,i)=>`<button class="study-hotspot study-${item.id} ${s.studied?.includes(item.id)?'studied':'unread'}" style="--x:${item.x}%;--y:${item.y}%" data-action="INSPECT:${item.id}" aria-label="查看${item.title}${s.studied?.includes(item.id)?'，已查看':''}">${point()}</button>`).join('')+(studyComplete(s)?`<button class="notebook-hotspot glow" data-action="OPEN" aria-label="打开本子，开始写作">${point()}</button>`:'');
}
export function studyHint(){return '';}
export function studyDetail(item){return `<div class="study-layout"><div class="study-visual" aria-hidden="true"><div class="study-object object-${item.id}"></div></div><div class="study-reading"><div class="study-copy" tabindex="0"><h2 id="study-title">${item.title}</h2>${item.id==='books'?`<p class="study-note">${item.note}</p>`:''}<blockquote><p class="study-zh">${item.zh}</p>${item.secondZh?`<p class="study-zh second-quote">${item.secondZh}</p>`:''}</blockquote>${item.note&&item.id!=='books'?`<p class="study-note">${item.note}</p>`:''}</div><button class="study-return" id="study-return">返回书房</button></div></div>`;}
