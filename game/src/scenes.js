import {opening,spreads} from './content.js';
export const asset=name=>`./assets/${name}`;
export function carriage(extra=''){
 return `<div class="carriage ${extra}" aria-hidden="true"><img class="carriage-body" src="${asset('carriage.webp')}" alt=""><img class="wheel wheel-back" src="${asset('wheel.webp')}" alt=""><img class="wheel wheel-front" src="${asset('wheel.webp')}" alt=""></div>`;
}
export function intro(){return `<section class="intro scene" aria-label="回忆录的开篇"><div class="intro-copy">${opening.map(t=>`<p>${t}</p>`).join('')}</div><button class="continue" data-action="CONTINUE">点击继续<span aria-hidden="true"> →</span></button></section>`;}
export function room(s){return `<section class="room scene ${s.scene==='window'?'entering':''}" aria-label="夏日的书房"><div class="room-frame"><div class="room-camera"><div class="room-art"></div>${s.scene==='room'?'<button class="notebook-hotspot glow" data-action="OPEN" aria-label="打开桌上的本子"><span class="hotspot-ring"></span></button>':''}</div>${s.scene==='window'?`<img class="window-opening" src="${asset('window.webp')}" alt="窗外的夏日花园与教堂">`:''}</div>${s.scene==='room'?'<p class="scene-hint">点击桌上的本子</p>':''}</section>`;}
function picture(entry,journey){if(!journey)return `<img class="page-art" src="${asset(entry.image)}" alt="${entry.alt}" draggable="false">`;return `<div class="mini-road" role="img" aria-label="${entry.alt}"><div class="mini-landscape"></div>${carriage()}</div>`;}
export function book(s,revealIndex=-1,turning=false){
 const entries=spreads[s.spread];
 let hint=s.revealed===0?(s.spread===0?'点击左页，开始书写':'点击左页，写下往事'):s.revealed===1?'点击右页，继续书写':s.spread===0?'点击右侧的纸叠，翻向下一页':'点击右页的马车，走进旅途';
 return `<section class="book-scene scene" aria-label="童年的回忆"><div class="book-wrap ${turning?'turning':''}"><div class="book-cover"></div><div class="paper-stack" aria-hidden="true"></div><div class="book-spread">${entries.map((entry,i)=>{
 const revealed=s.revealed>i;const active=s.revealed===i;const road=s.spread===1&&i===1;return `<article class="page ${i===0?'page-left':'page-right'} ${revealed?'written':'blank'} ${active?'page-ready':''}" aria-label="${i===0?'左':'右'}页">
 <div class="page-content ${revealIndex===i?'ink-reveal':''}" ${!revealed?'hidden':''}><div class="illustration">${picture(entry,road)}</div><div class="page-prose">${entry.lines.map(t=>`<p>${t}</p>`).join('')}</div><span class="page-number">${['一','二','三','四'][s.spread*2+i]}</span></div>
 ${active?`<button class="write-page" data-action="${i===0?'LEFT':'RIGHT'}" aria-label="在${i===0?'左':'右'}页书写">${s.spread===0&&i===0?'<span class="first-guide"><span aria-hidden="true">✧</span>点击纸页<br>开始书写</span>':'<span class="paper-glint" aria-hidden="true">✧</span>'}</button>`:''}
 ${road&&revealed?'<button class="enter-road" data-action="ENTER_ROAD" aria-label="走进右页的马车旅途"></button>':''}
 </article>`;}).join('')}<div class="spine" aria-hidden="true"></div></div>
 ${s.revealed===2&&s.spread===0?'<button class="turn-page" data-action="TURN" aria-label="点击纸叠翻页"><span aria-hidden="true">›</span></button>':''}
 ${turning?'<div class="turning-leaf" aria-hidden="true"></div>':''}</div><p class="scene-hint">${hint}</p></section>`;
}
export function road(s){const ready=s.scene==='road-ready',arrived=s.scene==='door';return `<section class="road-scene scene ${ready?'road-ready':''} ${arrived?'arrived':''}" aria-label="去往里斯本的旅途"><div class="road-frame"><div class="road-landscape"></div><div class="road-vehicle">${carriage()}${ready?'<button class="wheel-hotspot glow" data-action="DRIVE" aria-label="点击车轮，启程"><span></span></button>':''}</div><div class="road-leftleaf" aria-hidden="true"><img src="./assets/departure.webp" alt=""></div><div class="departing-spine" aria-hidden="true"></div></div>${arrived?'<div class="arrival-caption"><span>里斯本</span><h1>姨姨家门前</h1><p>车轮停了下来。</p><button class="end-button" data-action="END">在这里停笔</button></div>':''}${ready?'<p class="scene-hint">点击发亮的车轮，让旅途开始</p>':s.scene==='travel'?'<p class="scene-hint travel-hint">长路缓缓，往事向前。</p>':''}</section>`;}
