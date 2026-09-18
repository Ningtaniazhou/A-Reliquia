import {readSave,writeSave,reduce,initial} from './state.js';
import {assets} from './content.js';
import {intro,room,book,road} from './scenes.js';
import {Ambience} from './audio.js';
const root=document.querySelector('#game'),live=document.querySelector('#live');
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('unavailable');}};}
let state=readSave(storage),saved=true,elapsed=0,busy=0,pending=null,revealIndex=-1,paused=false,menu=null,last=performance.now(),travelSaved=0;
let settings={volume:.5,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};try{settings={...settings,...JSON.parse(storage.getItem('reliquia.settings')||'{}')};}catch{}
const sound=new Ambience();sound.setVolume(settings.volume);sound.mute(settings.muted);
const loaded=new Map();
const preload=names=>Promise.all(names.map(n=>{if(loaded.has(n))return loaded.get(n);const p=new Promise((res,rej)=>{const im=new Image();im.onload=()=>res();im.onerror=()=>rej(Error(n));im.src='./assets/'+n;});loaded.set(n,p);return p;}));
const portrait=matchMedia('(orientation: portrait) and (max-width: 900px)');
let orientationBlocked=portrait.matches;
function syncOrientation(){orientationBlocked=portrait.matches;root.inert=orientationBlocked;root.classList.toggle('orientation-paused',orientationBlocked);sound.pause(paused||document.hidden||orientationBlocked);last=performance.now();}
portrait.addEventListener('change',syncOrientation);
let loading=false;
function announce(t){live.textContent=t;}
function persist(){saved=writeSave(storage,state);}
function toolbar(){return `<nav class="toolbar" aria-label="游戏控制"><div class="toolbar-left">${state.scene!=='intro'?'<button data-action="BACK" aria-label="回看上一幕">← 回看</button>':'<span class="brand">圣遗物</span>'}</div><div class="toolbar-right"><button data-action="SOUND" aria-label="${settings.muted?'开启声音':'关闭声音'}">${settings.muted?'声音 关':'声音 开'}</button><button data-action="MENU" aria-label="暂停与设置">${state.scene==='intro'?'设置':'暂停'}</button></div></nav>`;}
function render(){
 root.className=[paused?'paused':'',settings.reduced?'reduce-motion':''].join(' ');root.dataset.scene=state.scene;root.dataset.spread=state.spread;root.dataset.revealed=state.revealed;
 let scene=state.scene==='intro'?intro():['window','room'].includes(state.scene)?room(state):state.scene==='book'?book(state,revealIndex,pending==='TURN'):road(state);
 root.innerHTML=scene+toolbar();syncOrientation();syncBusy();sound.set(state.scene);updateTravel();updateCamera();
}
function syncBusy(){root.setAttribute('aria-busy',String(busy>0));root.querySelectorAll('[data-action=LEFT],[data-action=RIGHT],[data-action=TURN],[data-action=ENTER_ROAD],[data-action=DRIVE]').forEach(b=>b.disabled=busy>0);}
function focusAction(){const action=state.scene==='room'?'OPEN':state.scene==='book'?(state.revealed===0?'LEFT':state.revealed===1?'RIGHT':state.spread===0?'TURN':'ENTER_ROAD'):state.scene==='road-ready'?'DRIVE':state.scene==='door'?'END':null;if(action)root.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});}
function change(action){const next=reduce(state,action);if(next===state)return;state=next;elapsed=0;travelSaved=0;revealIndex=-1;pending=null;busy=0;persist();render();focusAction();}
async function ensureScene(names){loading=true;const note=document.createElement('div');note.className='load-note';note.textContent='纸页正在展开…';document.body.append(note);try{await preload(names);return true;}catch(e){const panel=document.createElement('section');panel.className='error-panel';panel.innerHTML='<p>这一页还没有载入。</p><button>重新载入</button>';panel.querySelector('button').onclick=()=>location.reload();document.body.append(panel);return false;}finally{note.remove();loading=false;}}
async function act(action){
 if(action==='MENU'){openMenu();return;}
 if(action==='SOUND'){settings.muted=!settings.muted;sound.mute(settings.muted);saveSettings();await sound.unlock();root.querySelector('[data-action="SOUND"]').textContent=settings.muted?'声音 关':'声音 开';root.querySelector('[data-action="SOUND"]').setAttribute('aria-label',settings.muted?'开启声音':'关闭声音');return;}
 if(paused||loading||orientationBlocked)return;
 if(action==='BACK'){busy=0;pending=null;change(action);return;}
 if(busy>0)return;
 await sound.unlock();
 if(action==='CONTINUE'){if(!await ensureScene(['room.webp','window.webp']))return;change(action);return;}
 if(action==='OPEN'){if(!await ensureScene(['birth.webp','father.webp','departure.webp','landscape.webp','carriage.webp','wheel.webp']))return;sound.paper();change(action);return;}
 if(action==='LEFT'||action==='RIGHT'){
  const next=reduce(state,action);if(next===state)return;state=next;revealIndex=action==='LEFT'?0:1;busy=settings.reduced?.1:2.2;sound.write();persist();render();announce('这一页的往事浮现了。');return;
 }
 if(action==='TURN'){if(reduce(state,action)===state)return;pending='TURN';busy=settings.reduced?.1:.85;sound.paper();render();return;}
 if(action==='ENTER_ROAD'){sound.paper();change(action);busy=settings.reduced?.1:1.35;syncBusy();return;}
 if(action==='END'){openEnd();return;}
 change(action);
}
root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(b&&!b.disabled)act(b.dataset.action);});
function saveSettings(){try{storage.setItem('reliquia.settings',JSON.stringify(settings));}catch{}root.classList.toggle('reduce-motion',settings.reduced);}
function pause(value){paused=value;root.classList.toggle('paused',paused);sound.pause(paused||document.hidden||orientationBlocked);}
function dialog(html){if(menu)return null;pause(true);menu=document.createElement('dialog');menu.className='dialog';menu.innerHTML=html;document.body.append(menu);menu.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});menu.showModal();return menu;}
function closeDialog(){if(!menu)return;menu.close();menu.remove();menu=null;pause(false);last=performance.now();focusAction();}
function openMenu(){const d=dialog(`<h2>暂且搁笔</h2><p>${saved?'往事已记在这里，稍后可以继续。':'此浏览器暂时无法保存进度，请保留页面。'}</p><label>环境音量<input id="volume" type="range" min="0" max="1" step="0.05" value="${settings.volume}" aria-label="环境音量"></label><label>静音<input id="mute" type="checkbox" ${settings.muted?'checked':''}></label><label>减少动态<input id="motion" type="checkbox" ${settings.reduced?'checked':''}></label><div class="dialog-actions"><button class="primary" id="resume">继续回忆</button><button id="restart">从头开始</button></div>`);if(!d)return;
 d.querySelector('#volume').oninput=e=>{settings.volume=Number(e.target.value);sound.setVolume(settings.volume);saveSettings();};d.querySelector('#mute').onchange=e=>{settings.muted=e.target.checked;sound.mute(settings.muted);saveSettings();};d.querySelector('#motion').onchange=e=>{settings.reduced=e.target.checked;saveSettings();};d.querySelector('#resume').onclick=()=>{closeDialog();const button=root.querySelector('[data-action="SOUND"]');button.textContent=settings.muted?'声音 关':'声音 开';button.setAttribute('aria-label',settings.muted?'开启声音':'关闭声音');};d.querySelector('#restart').onclick=()=>{d.innerHTML='<h2>重写这段回忆？</h2><p>将从夏日书房的开篇重新开始。</p><div class="dialog-actions"><button class="primary" id="confirm">从头开始</button><button id="cancel">继续当前回忆</button></div>';d.querySelector('#confirm').onclick=()=>{closeDialog();change('RESTART');};d.querySelector('#cancel').onclick=closeDialog;d.querySelector('#cancel').focus();};
}
function openEnd(){const d=dialog('<h2>笔尖暂歇</h2><p>这一段回忆，停在姨姨家的门口。</p><div class="dialog-actions"><button class="primary" id="stay">留在门前</button><button id="reread">重读书页</button></div>');if(!d)return;d.querySelector('#stay').onclick=closeDialog;d.querySelector('#reread').onclick=()=>{closeDialog();change('BACK');};}
function updateCamera(){
 const camera=root.querySelector('.room-camera');if(!camera)return;
 const p=state.scene==='window'?Math.min(1,Math.max(0,(elapsed-1.8)/9)):1;
 const eased=p*p*p*(p*(p*6-15)+10);
 camera.style.transform=`scale(${settings.reduced?1:2.65-1.65*eased})`;
 root.querySelector('.room-frame').style.opacity=state.scene==='window'?Math.min(1,elapsed/1.6):1;
}
function updateTravel(){if(!['road-ready','travel','door'].includes(state.scene))return;const p=state.scene==='door'?1:state.progress;const frame=root.querySelector('.road-frame'),land=root.querySelector('.road-landscape'),car=root.querySelector('.road-vehicle');if(!frame||!land||!car)return;const range=land.offsetWidth-frame.offsetWidth;land.style.transform=`translateX(${-range*p}px)`;car.style.left=`${29-24*p}%`;car.style.transform=state.scene==='travel'&&!settings.reduced?`translateY(${Math.sin(elapsed*11)*1.1}px)`:'none';root.querySelectorAll('.wheel').forEach(w=>w.style.transform=`rotate(${settings.reduced?0:p*1800}deg)`);root.querySelectorAll('.horse-leg').forEach((leg,i)=>{const angle=state.scene==='travel'&&!settings.reduced?Math.sin(elapsed*7.5+(i%2)*Math.PI)*10:0;leg.style.transform=`rotate(${angle}deg)`;});const retreat=Math.min(1,p*5);const leaf=root.querySelector('.road-leftleaf');if(leaf)leaf.style.transform=`translateX(${-retreat*105}%)`;const spine=root.querySelector('.departing-spine');if(spine){spine.style.transform=`translateX(${-retreat*frame.offsetWidth*.26}px)`;spine.style.opacity=String(1-retreat);}}
function frame(t){const dt=Math.min((t-last)/1000,.12);last=t;if(!paused&&!orientationBlocked&&!document.hidden&&!loading){elapsed+=dt;
 if(busy>0){busy-=dt;if(busy<=0){busy=0;if(pending==='TURN')change('TURN');else{revealIndex=-1;syncBusy();focusAction();}}}
 if(state.scene==='window')updateCamera();
 if(state.scene==='window'&&elapsed>=(settings.reduced?2:11.1))change('ROOM');
 if(state.scene==='travel'){state.progress=Math.min(1,elapsed/(settings.reduced?5:19));updateTravel();if(elapsed-travelSaved>2){persist();travelSaved=elapsed;}if(state.progress>=1){change('ARRIVE');announce('已经抵达里斯本，姨姨家门前。');}}
 }requestAnimationFrame(frame);}
window.addEventListener('resize',updateTravel);document.addEventListener('visibilitychange',()=>{sound.pause(paused||document.hidden||orientationBlocked);last=performance.now();if(document.hidden)persist();});window.addEventListener('pagehide',persist);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu){e.preventDefault();openMenu();}if(orientationBlocked||menu||e.target.closest?.('.page-prose')||e.altKey||e.ctrlKey||e.metaKey)return;if(e.key==='ArrowLeft'){e.preventDefault();act('BACK');}if((e.key===' '||e.key==='Enter')&&!(document.activeElement instanceof HTMLButtonElement)&&!(document.activeElement instanceof HTMLInputElement)){const target=state.scene==='intro'?'CONTINUE':state.scene==='room'?'OPEN':state.scene==='book'?(state.revealed===0?'LEFT':state.revealed===1?'RIGHT':state.spread===0?'TURN':'ENTER_ROAD'):state.scene==='road-ready'?'DRIVE':null;if(target){e.preventDefault();act(target);}}});
render();requestAnimationFrame(frame);
if(state.scene!=='intro')ensureScene(assets.concat('wheel.webp'));
else preload(['room.webp','window.webp']).catch(()=>{});
