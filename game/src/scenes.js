import {spreads} from './content.js';
import {point,pen} from './interaction-marks.js';
import {rainMarkup} from './rain.js';
import {studyHotspots,studyHint} from './study.js';
export const asset=name=>`./assets/${name}`;
export function carriage(extra='',interactive=false){
 return `<div class="carriage ${extra}" ${interactive?'':'aria-hidden="true"'}>${[0,1,2,3].map(i=>`<img class="horse-leg leg-${i}" src="${asset('carriage.webp')}" alt="">`).join('')}<img class="carriage-body" src="${asset('carriage.webp')}" alt=""><img class="wheel wheel-back" src="${asset('wheel.webp')}" alt=""><img class="wheel wheel-front" src="${asset('wheel.webp')}" alt="">${interactive?`<button class="mini-driver" data-action="ENTER_ROAD" aria-label="点击车夫，展开旅途">${point()}</button>`:''}</div>`;
}

export function room(s){return `<section class="room scene ${s.scene==='window'?'entering':''}" aria-label="夏日的书房"><div class="room-frame"><div class="room-camera"><div class="room-art"></div>${s.scene==='room'?studyHotspots(s):''}</div></div>${s.scene==='room'?studyHint(s):''}</section>`;}
function picture(entry,journey,interactive=false){if(!journey)return `<img class="page-art" src="${asset(entry.image)}" alt="${entry.alt}" draggable="false">`;return `<div class="mini-road" role="group" aria-label="${entry.alt}"><div class="mini-landscape"></div>${carriage('',interactive)}<img class="journey-border" src="./assets/journey-border.webp" alt=""></div>`;}
export function book(s,revealIndex=-1,turning=false){
 const entries=spreads[s.spread];

 return `<section class="book-scene scene" aria-label="童年的回忆"><div class="book-wrap ${turning?'turning':''}"><div class="book-cover"></div><div class="paper-stack" aria-hidden="true"></div><div class="book-spread">${entries.map((entry,i)=>{
 const revealed=s.revealed>i;const active=s.revealed===i;const road=s.spread===1&&i===1;return `<article class="page ${i===0?'page-left':'page-right'} ${revealed?'written':'blank'} ${active?'page-ready':''}" aria-label="${i===0?'左':'右'}页">
 ${revealIndex===i?pen('writing-pen'):''}<div class="page-content ${revealIndex===i?'ink-reveal':''}" ${!revealed?'hidden':''}><div class="illustration">${picture(entry,road,road&&revealed)}</div><div class="page-prose" tabindex="0" role="region" aria-label="正文">${entry.lines.map(t=>`<p>${t}</p>`).join('')}</div><span class="page-number">${['一','二','三','四'][s.spread*2+i]}</span></div>
 ${active?`<button class="write-page" data-action="${i===0?'LEFT':'RIGHT'}" aria-label="在${i===0?'左':'右'}页书写">${pen()}</button>`:''}

 </article>`;}).join('')}<div class="spine" aria-hidden="true"></div></div>
 ${s.revealed===2&&s.spread===0?'<button class="turn-page" data-action="TURN" aria-label="点击纸叠翻页"><span aria-hidden="true">›</span></button>':''}
 <button class="turn-page turn-back" data-action="BACK" aria-label="翻回上一页"><span aria-hidden="true">‹</span></button>
 ${turning?'<div class="turning-leaf" aria-hidden="true"></div>':''}</div></section>`;
}
export function road(s){const ready=s.scene==='road-ready',arrived=s.scene==='door';return `<section class="road-scene scene ${ready?'road-ready':''} ${arrived?'arrived':''}" aria-label="去往里斯本的旅途"><div class="road-frame"><div class="journey-country"></div><img class="journey-moon" src="./assets/journey-moon.webp" alt=""><div class="road-vehicle">${carriage()}${ready?'<button class="driver-hotspot glow" data-action="DRIVE" aria-label="点击马夫，启程">'+point()+'</button>':''}</div><div class="road-leftleaf" aria-hidden="true"><img src="./assets/departure.webp" alt=""></div><div class="departing-spine" aria-hidden="true"></div><div class="journey-atmosphere" aria-hidden="true"></div><div class="journey-rain" aria-hidden="true">${rainMarkup()}</div><div class="journey-blackout" aria-hidden="true"></div></div>${arrived?'<button class="house-door" data-action="ENTER_HOUSE" aria-label="敲响姨姨家的门">'+point()+'</button>':''}</section>`;}
