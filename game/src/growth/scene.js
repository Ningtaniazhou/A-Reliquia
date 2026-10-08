import {growthSpreads,growthCount} from './content.js';
import {pen,point} from '../interaction-marks.js';
import {arrivalDialogue} from '../arrival/scene.js';
export const writingReturn=s=>`<section class="memory-return scene" aria-label="客厅的往事收回书页">${growthBook({...s,growthSpread:0})}<div class="memory-return-art" aria-hidden="true"></div><div class="memory-return-dialogue">${arrivalDialogue(s)}</div></section>`;
export function growthBook(s,reveal=-1,turning=false){
 const spread=s.growthSpread||0,seen=s.growthPages?.[spread]||0;
 return `<section class="book-scene growth-book scene" aria-label="渐渐长大的回忆"><div class="book-wrap ${turning?'turning':''}"><div class="book-cover"></div><div class="paper-stack" aria-hidden="true"></div><div class="book-spread">${growthSpreads[spread].map((e,i)=>{
 if(!e)return '<article class="page page-right blank" aria-label="空白右页"></article>';
 const written=seen>i,active=seen===i,dining=e.dining;
 return `<article class="page ${i===0?'page-left':'page-right'} ${written?'written':'blank'} ${active?'page-ready':''}" aria-label="${i===0?'左':'右'}页">
 ${reveal===i?pen('writing-pen'):''}${written?`<div class="page-content ${reveal===i?'ink-reveal':''}" ${written?'':'hidden'}><div class="illustration ${dining?'dining-illustration':''}">${dining?`<div class="dining-frame"><div class="dining-slot" aria-hidden="true"></div><button class="dining-hotspot" data-action="ENTER_CHAPTER" aria-label="走进特奥多里科在姨姨家的一顿晚饭">${point()}</button></div>`:e.memory?`<div class="arrival-memory-art" role="img" aria-label="${e.alt}"></div>`:`<img class="page-art " src="./assets/${e.image}" alt="${e.alt}">`}</div><div class="page-prose" tabindex="0" role="region" aria-label="正文">${e.lines.map(l=>`<p>${l}</p>`).join('')}</div><span class="page-number">${['五','六','七','八','九','十'][spread*2+i]}</span></div>`: ''}
 ${active?`<button class="write-page" data-action="GROW_${i===0?'LEFT':'RIGHT'}" aria-label="在${i===0?'左':'右'}页书写">${pen()}</button>`:''}</article>`;
 }).join('')}<div class="spine" aria-hidden="true"></div></div>${spread<growthSpreads.length-1&&seen===growthCount(spread)?'<button class="turn-page" data-action="GROW_TURN" aria-label="翻到下一组成长书页"><span aria-hidden="true">›</span></button>':''}<button class="turn-page turn-back" data-action="BACK" aria-label="翻回上一页"><span aria-hidden="true">‹</span></button>${turning?'<div class="turning-leaf" aria-hidden="true"></div>':''}</div></section>`;
}
