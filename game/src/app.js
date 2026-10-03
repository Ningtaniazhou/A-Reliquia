import {sceneCheckpoint,restartButton} from './ui/scene-checkpoint.js';
import {readPreferences} from './ui/preferences.js';
import {installSharedControls} from './ui/shared-controls.js';
import {soundIcon,updateSoundButton} from './ui/sound-button.js';
import {growthBook,writingReturn} from './growth/scene.js';
import {paintRetreat} from './growth/retreat.js';
import {arrivalLines,arrivalAssets} from './arrival/content.js';
import {growthAssets,growthCount,growthSpreads} from './growth/content.js';
import {ChapterPortal} from './growth/portal.js';
import {arrival} from './arrival/scene.js';
import {readSave,writeSave,reduce,initial} from './state.js';
import {assets} from './content.js';
import {room,book,road} from './scenes.js';
import {JOURNEY_SECONDS,paintJourney,journeyAt} from './journey.js';
import {Ambience} from './audio.js';
import {expandJourney} from './journey-transition.js';
import {studyItems,studyComplete} from './study-content.js';
import {preface} from './preface.js';
import {studyDetail,fitStudyDetail} from './study.js';
const root=document.querySelector('#game'),live=document.querySelector('#live');
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('unavailable');}};}
const preview=location.hostname==='127.0.0.1'?new URLSearchParams(location.search).get('preview'):null;
const growthPreview=preview==='growth',chapter3Preview=preview==='chapter3';
const journeyPreview=preview==='journey',studyPreview=preview==='study',openingPreview=preview==='opening',doorPreview=preview==='door',localPreview=chapter3Preview||growthPreview||doorPreview||journeyPreview||studyPreview||openingPreview;
const fresh=new URLSearchParams(location.search).get('fresh')==='1';
let state=chapter3Preview?{...initial(),scene:'chapter2',chapterState:{version:1,phase:'departure',departureState:{node:'farewell'}}}:growthPreview?{...initial(),scene:'arrival',arrivalLine:arrivalLines.length-1,arrivalSeen:true}:doorPreview?{...initial(),scene:'door',spread:1,revealed:2,pages:[2,2],progress:1}:journeyPreview?{...initial(),scene:'road-ready',spread:1,revealed:2,pages:[2,2]}:studyPreview?{...initial(),scene:'room'}:openingPreview||fresh?initial():readSave(storage),saved=true,elapsed=0,busy=0,pending=null,revealIndex=-1,paused=false,menu=null,last=performance.now(),travelSaved=0;
let openingCheckpoint;
let settings={volume:.5,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};try{settings={...settings,...JSON.parse(storage.getItem('reliquia.settings')||'{}')};}catch{}
let travelRate=1,onDialogClose=null,quietTime=0;
let coverHost=null;try{if(new URLSearchParams(location.search).get('cover')==='1'&&window.parent!==window)coverHost=window.parent.__reliquiaCover||null;}catch{}
Object.assign(settings,readPreferences(settings));
const sound=coverHost?.ambience||new Ambience();sound.setVolume(settings.volume);sound.mute(settings.muted);
window.__reliquiaOpeningSound=sound;window.__reliquiaOpeningSettings=settings;window.__reliquiaChapterState=()=>state.scene==='chapter2'?state.chapterState:null;
const portal=new ChapterPortal(root,{
 enter:()=>act('ENTER_CHAPTER'),isActive:()=>state.scene==='chapter2',blocked:()=>orientationBlocked,
 save:value=>{if(state.scene==='chapter2'){state.chapterState=value;persist();}},
 preferences:value=>{Object.assign(settings,value);sound.mute(settings.muted);sound.setVolume(settings.volume);saveSettings();},
 complete:()=>{state=reduce(state,'ENTER_CHAPTER');elapsed=0;busy=0;persist();sound.set('chapter2');root.dataset.scene='chapter2';root.innerHTML='';},
});
const loaded=new Map();
const preload=names=>Promise.all(names.map(n=>{if(loaded.has(n))return loaded.get(n);const p=new Promise((res,rej)=>{const im=new Image();im.onload=()=>res();im.onerror=()=>rej(Error(n));im.src='./assets/'+n;});loaded.set(n,p);return p;}));
const portrait=matchMedia('(orientation: portrait) and (max-width: 900px)');
let orientationBlocked=portrait.matches;
function syncOrientation(){orientationBlocked=portrait.matches;root.inert=orientationBlocked;root.classList.toggle('orientation-paused',orientationBlocked);sound.pause(paused||document.hidden||orientationBlocked);portal.frame?.contentWindow?.reliquiaChapterPause?.(paused||document.hidden||orientationBlocked);portal.layout();last=performance.now();}
portrait.addEventListener('change',syncOrientation);
let loading=false;
function announce(t){live.textContent=t;}
function persist(){if(!localPreview)saved=writeSave(storage,state);}
function speedButton(){return ['road-ready','travel'].includes(state.scene)?`<button class="travel-speed ${travelRate===2?'active':''}" data-action="SPEED" aria-pressed="${travelRate===2}" aria-label="${travelRate===2?'原速':'二倍速'}"><span aria-hidden="true">${travelRate===2?'▶':'▶▶'}</span><span>${travelRate===2?'原速':'二倍速'}</span></button>`:'';}
function soundLabel(){return soundIcon(settings.muted||settings.volume===0||sound.ctx?.state!=='running');}
function syncSoundButton(){const b=root.querySelector('[data-action=SOUND]');if(b){updateSoundButton(b,settings.muted||settings.volume===0||sound.ctx?.state!=='running');}}
function toolbar(){if(state.scene==='chapter2')return '';return `<nav class="toolbar" aria-label="游戏控制"><div class="toolbar-left">${!['window','book','growth'].includes(state.scene)?'<button data-action="BACK" aria-label="回看上一幕">← 回看</button>':'<span class="brand">圣遗物</span>'}</div><div class="toolbar-right"><button data-action="SOUND" aria-label="${settings.muted||settings.volume===0||sound.ctx?.state!=='running'?'开启声音':'关闭声音'}">${soundLabel()}</button><button data-action="SETTINGS">设置</button></div></nav>`;}
function render(){openingCheckpoint?.capture(state);
 root.className=[paused?'paused':'',settings.reduced?'reduce-motion':''].join(' ');root.dataset.scene=state.scene;root.dataset.spread=state.spread;root.dataset.revealed=state.revealed;
 let scene=state.scene==='chapter2'?'':state.scene==='writing-return'?writingReturn(state):state.scene==='growth'?growthBook(pending==='GROW_TURN'?reduce(state,'GROW_TURN'):state,revealIndex,pending==='GROW_TURN'):state.scene==='arrival'?arrival(state):state.scene==='preface'?preface(pending==='TURN'):['window','room'].includes(state.scene)?room(state):state.scene==='book'?book(pending==='TURN'?reduce(state,'TURN'):state,revealIndex,pending==='TURN'):road(state);
 root.innerHTML=scene+toolbar()+speedButton();syncSoundButton();syncOrientation();syncBusy();sound.set(coverHost&&!coverHost.entered?'cover':state.scene);updateTravel();updateCamera();if(state.scene==='writing-return')paintRetreat(root,elapsed,settings.reduced);
 root.style.setProperty('--stage-ratio',root.clientWidth/root.clientHeight);
 if(state.scene==='chapter2'||(state.scene==='growth'&&state.growthSpread===growthSpreads.length-1&&state.growthPages[state.growthSpread]===growthCount(state.growthSpread))){portal.mount();portal.layout();if(state.scene==='chapter2'&&portal.ready)portal.activate();}else portal.destroy();
}
function syncBusy(){if(portal.button)portal.button.disabled=busy>0;root.setAttribute('aria-busy',String(busy>0));root.querySelectorAll('[data-action=LEFT],[data-action=RIGHT],[data-action=TURN],[data-action=ENTER_ROAD],[data-action=DRIVE],[data-action=GROW_LEFT],[data-action=GROW_RIGHT],[data-action=GROW_TURN],[data-action=ENTER_CHAPTER]').forEach(b=>b.disabled=busy>0);}
function growthAction(){const n=state.growthPages[state.growthSpread];return n<growthCount(state.growthSpread)?(n===0?'GROW_LEFT':'GROW_RIGHT'):state.growthSpread<growthSpreads.length-1?'GROW_TURN':'ENTER_CHAPTER';}
function focusAction(){const action=state.scene==='growth'?growthAction():state.scene==='preface'?'TURN':state.scene==='room'?(studyComplete(state)?'OPEN':'INSPECT:'+(studyItems.find(item=>!state.studied?.includes(item.id))?.id||'ring')):state.scene==='book'?(state.revealed===0?'LEFT':state.revealed===1?'RIGHT':state.spread===0?'TURN':'ENTER_ROAD'):state.scene==='road-ready'?'DRIVE':state.scene==='door'?'ENTER_HOUSE':state.scene==='arrival'&&state.arrivalSeen?(state.arrivalLine===arrivalLines.length-1?'WRITE_YEARS':'AUNT_NEXT'):null;if(action==='ENTER_CHAPTER'){portal.button?.focus({preventScroll:true});return;}if(action)root.querySelector(`[data-action="${action}"]`)?.focus({preventScroll:true});}
function change(action){const next=reduce(state,action);if(next===state)return;state=next;elapsed=0;travelSaved=0;revealIndex=-1;pending=null;busy=0;persist();render();focusAction();}
async function ensureScene(names){loading=true;const note=document.createElement('div');note.className='load-note';note.setAttribute('aria-label','载入中');document.body.append(note);try{await preload(names);return true;}catch(e){const panel=document.createElement('section');panel.className='error-panel';panel.innerHTML='<p>这一页还没有载入。</p><button>重新载入</button>';panel.querySelector('button').onclick=()=>location.reload();document.body.append(panel);return false;}finally{note.remove();loading=false;}}
async function act(action){
 quietTime=0;root.querySelectorAll('.attention').forEach(p=>p.classList.remove('attention'));
 if(action==='SETTINGS'){openSettings();return;}
 if(action==='SOUND'){settings.muted=!settings.muted&&sound.ctx?.state!=='running'?false:!settings.muted;sound.mute(settings.muted);saveSettings();await sound.unlock();syncSoundButton();return;}
 if(paused||loading||orientationBlocked)return;
 if(action==='SPEED'&&['road-ready','travel'].includes(state.scene)){travelRate=travelRate===1?2:1;const button=root.querySelector('.travel-speed');button.outerHTML=speedButton();root.querySelector('.travel-speed')?.focus({preventScroll:true});announce(travelRate===2?'旅途已加速。':'恢复正常速度。');return;}
 if(action.startsWith('INSPECT:')&&state.scene==='room'){await sound.unlock();openStudy(action.slice(8));return;}
 if(portal.progress!==null)return;
 if(action==='BACK'&&state.scene==='writing-return')return;
 if(action==='BACK'){busy=0;pending=null;change(action);return;}
 if(busy>0)return;
 await sound.unlock();
 if(action==='WRITE_YEARS'){
  if(reduce(state,action)===state)return;if(!await ensureScene(growthAssets))return;
  change(action);paintRetreat(root,0,settings.reduced);return;
 }
 if(action==='GROW_LEFT'||action==='GROW_RIGHT'){
  const next=reduce(state,action);if(next===state)return;state=next;revealIndex=action==='GROW_LEFT'?0:1;
  busy=settings.reduced?.1:2.2;sound.write();persist();render();return;
 }
 if(action==='GROW_TURN'){if(reduce(state,action)===state)return;pending=action;busy=settings.reduced?.1:.85;sound.paper();render();return;}
 if(action==='ENTER_CHAPTER'){
  if(reduce(state,action)===state||!portal.ready)return;
  if(portal.begin()){busy=settings.reduced?.3:6.5;syncBusy();sound.set('chapter2');}return;
 }
 if(action==='OPEN'){if(!studyComplete(state))return;if(!await ensureScene(['birth.webp','father.webp','departure.webp','landscape.webp','carriage.webp','wheel.webp','writing-pen.webp','journey-border.webp']))return;sound.paper();change(action);return;}
 if(action==='LEFT'||action==='RIGHT'){
  const next=reduce(state,action);if(next===state)return;state=next;revealIndex=action==='LEFT'?0:1;busy=settings.reduced?.1:2.2;sound.write();persist();render();announce('这一页的往事浮现了。');return;
 }
 if(action==='TURN'){if(reduce(state,action)===state)return;pending='TURN';busy=settings.reduced?.1:.85;sound.paper();render();return;}
 if(action==='ENTER_ROAD'){if(reduce(state,action)===state)return;const mini=root.querySelector('.mini-road'),rect=mini?.getBoundingClientRect(),carRect=mini?.querySelector('.carriage')?.getBoundingClientRect(),backdrop=root.querySelector('.book-scene')?.cloneNode(true);if(!await ensureScene(['journey-continuous.webp','journey-moon.webp','journey-border.webp']))return;sound.paper();change(action);expandJourney(root,rect,backdrop,settings.reduced,carRect);busy=settings.reduced?.1:1.2;syncBusy();return;}
 if(action==='ENTER_HOUSE'){if(state.scene!=='door')return;if(!await ensureScene(arrivalAssets))return;try{await sound.prepareArrival();}catch{announce('音乐暂时未能载入。');}sound.doorway();change(action);return;}
 if(action==='END'){openEnd();return;}
 change(action);
}
let dialoguePointer=null,dialogueDragged=false;
root.addEventListener('pointerdown',e=>{dialoguePointer={x:e.clientX,y:e.clientY};dialogueDragged=false;});
root.addEventListener('pointermove',e=>{if(dialoguePointer&&Math.hypot(e.clientX-dialoguePointer.x,e.clientY-dialoguePointer.y)>10)dialogueDragged=true;});
root.addEventListener('pointercancel',()=>{dialogueDragged=true;dialoguePointer=null;});
root.addEventListener('click',e=>{
 const b=e.target.closest('[data-action]');if(b){if(!b.disabled)act(b.dataset.action);return;}
 const panel=e.target.closest('[data-dialogue-next]');
 if(panel&&!dialogueDragged&&state.scene==='arrival'&&state.arrivalSeen)act(panel.dataset.dialogueNext);
 dialoguePointer=null;
});
function saveSettings(){try{storage.setItem('reliquia.settings',JSON.stringify(settings));}catch{}root.classList.toggle('reduce-motion',settings.reduced);}
function pause(value){paused=value;root.classList.toggle('paused',paused);sound.pause(paused||document.hidden||orientationBlocked);}
function dialog(html){if(menu)return null;pause(true);menu=document.createElement('dialog');menu.className='dialog';menu.innerHTML=html;document.body.append(menu);menu.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});menu.showModal();return menu;}
function closeDialog(){if(!menu)return;menu.close();menu.remove();menu=null;const after=onDialogClose;onDialogClose=null;pause(false);last=performance.now();if(after)after();else focusAction();}
function openSettings(){const d=dialog('<h2>设置</h2><label>音量 <input id="opening-volume" type="range" min="0" max="1" step=".05"></label><button id="opening-resume">返回游戏</button>');if(!d)return;d.dataset.settings='true';restartButton(d,()=>{const entry=openingCheckpoint.restore();if(!entry)return;closeDialog();state=entry;elapsed=0;busy=0;pending=null;persist();render();});const restart=document.createElement('button');restart.textContent='重新开始本章';restart.onclick=()=>{const chapterState=state.chapterState;closeDialog();openingCheckpoint.clear();state={...initial(),chapterState};elapsed=0;busy=0;pending=null;persist();render();};d.append(restart);d.querySelector('#opening-volume').value=settings.volume;d.querySelector('#opening-volume').oninput=e=>{settings.volume=+e.target.value;sound.setVolume(settings.volume);saveSettings();};d.querySelector('#opening-resume').onclick=closeDialog;}
function openStudy(id){
 const item=studyItems.find(item=>item.id===id);if(!item)return;
 const d=dialog(studyDetail(item));if(!d)return;
 d.classList.add('study-dialog');d.setAttribute('aria-labelledby','study-title');root.classList.add('studying');fitStudyDetail(d);
 sound.pause(document.hidden||orientationBlocked);
 onDialogClose=()=>{root.classList.remove('studying');quietTime=0;state=reduce(state,'STUDIED:'+id);persist();render();if(studyComplete(state)){announce('桌上的本子亮了起来，可以开始写作。');focusAction();}else root.querySelector(`[data-action="INSPECT:${id}"]`)?.focus({preventScroll:true});};
 d.querySelector('#study-return').onclick=closeDialog;d.querySelector('.study-copy').focus({preventScroll:true});
}
function openEnd(){const d=dialog('<h2>笔尖暂歇</h2><p>这一段回忆，停在姨姨家的门口。</p><div class="dialog-actions"><button class="primary" id="stay">留在门前</button><button id="reread">重读书页</button></div>');if(!d)return;d.querySelector('#stay').onclick=closeDialog;d.querySelector('#reread').onclick=()=>{closeDialog();change('BACK');};}
function updateCamera(){
 const camera=root.querySelector('.room-camera');if(!camera)return;
 const p=state.scene==='window'?Math.min(1,Math.max(0,(elapsed-1.8)/9)):1;
 const eased=p*p*p*(p*(p*6-15)+10);
 camera.style.transform=`scale(${settings.reduced?1:2.65-1.65*eased})`;
 root.querySelector('.room-frame').style.opacity=1;
}
function updateTravel(){if(!['road-ready','travel','door'].includes(state.scene))return;const p=state.scene==='door'?1:state.progress;const frame=root.querySelector('.road-frame'),car=root.querySelector('.road-vehicle');if(!frame||!car)return;const journey=paintJourney(frame,p,settings.reduced,elapsed);sound.setJourney(journey);if(!frame.closest('.expanding-road'))car.style.left=`${25-20*journey.arrival}%`;car.style.transform=state.scene==='travel'&&journey.moving&&!settings.reduced?`translateY(${Math.sin(elapsed*11)*1.1}px)`:'none';root.querySelectorAll('.wheel').forEach(w=>w.style.transform=`rotate(${settings.reduced?0:journey.distance*4000}deg)`);root.querySelectorAll('.horse-leg').forEach((leg,i)=>{const angle=state.scene==='travel'&&journey.moving&&!settings.reduced?Math.sin(elapsed*10+(i%2)*Math.PI)*10:0;leg.style.transform=`rotate(${angle}deg)`;});const retreat=Math.min(1,p*5);const leaf=root.querySelector('.road-leftleaf');if(leaf)leaf.style.transform=`translateX(${-retreat*105}%)`;const spine=root.querySelector('.departing-spine');if(spine){spine.style.transform=`translateX(${-retreat*frame.offsetWidth*.26}px)`;spine.style.opacity=String(1-retreat);}}
function frame(t){const dt=Math.min((t-last)/1000,.12);last=t;if(!paused&&!orientationBlocked&&!document.hidden&&!loading&&(!coverHost||coverHost.entered)){quietTime+=dt;elapsed+=dt*(state.scene==='travel'&&!journeyAt(state.progress).parked?travelRate:1);
 if(busy>0){busy-=dt;if(busy<=0){busy=0;if(pending==='TURN'||pending==='GROW_TURN')change(pending);else{revealIndex=-1;syncBusy();focusAction();}}}
 portal.tick(dt,settings.reduced);
 if(state.scene==='writing-return'){paintRetreat(root,elapsed,settings.reduced);if(elapsed>=(settings.reduced?.8:6.9))change('GROW_READY');}
 if(state.scene==='window')updateCamera();
 if(state.scene==='arrival'&&!state.arrivalSeen&&elapsed>=11.4)change('ARRIVAL_READY');
 if(quietTime>9&&!busy&&['room','book','growth','road-ready','door'].includes(state.scene)){const point=root.querySelector('.unread .interaction-point,.notebook-hotspot .interaction-point,.mini-driver .interaction-point,.driver-hotspot .interaction-point,.house-door .interaction-point');point?.classList.add('attention');if(state.scene==='growth'&&portal.progress===null)portal.button?.querySelector('.interaction-point')?.classList.add('attention');}
 if(state.scene==='window'&&elapsed>=(settings.reduced?2:11.1))change('ROOM');
 if(state.scene==='travel'){state.progress=Math.min(1,elapsed/(settings.reduced?24:JOURNEY_SECONDS));updateTravel();if(elapsed-travelSaved>2){persist();travelSaved=elapsed;}if(state.progress>=1){change('ARRIVE');announce('已经抵达里斯本，姨姨家门前。');}}
 }requestAnimationFrame(frame);}
window.addEventListener('resize',()=>{root.style.setProperty('--stage-ratio',root.clientWidth/root.clientHeight);updateTravel();fitStudyDetail(menu);portal.layout();});document.addEventListener('visibilitychange',()=>{sound.pause(paused||document.hidden||orientationBlocked);last=performance.now();if(document.hidden)persist();});window.addEventListener('pagehide',persist);
document.addEventListener('keydown',e=>{if(orientationBlocked||menu||e.target.closest?.('.page-prose,.preface-prose')||e.altKey||e.ctrlKey||e.metaKey)return;if((e.code==='KeyA'||e.key==='ArrowLeft')){e.preventDefault();act(state.scene==='arrival'&&state.arrivalSeen?'AUNT_PREV':'BACK');}if((e.code==='KeyD'||e.key===' '||e.key==='Enter')&&(e.code==='KeyD'||!(document.activeElement instanceof HTMLButtonElement))&&!(document.activeElement instanceof HTMLInputElement)){const target=state.scene==='growth'?growthAction():state.scene==='preface'?'TURN':state.scene==='room'?(studyComplete(state)?'OPEN':'INSPECT:'+(studyItems.find(item=>!state.studied?.includes(item.id))?.id||'ring')):state.scene==='book'?(state.revealed===0?'LEFT':state.revealed===1?'RIGHT':state.spread===0?'TURN':'ENTER_ROAD'):state.scene==='road-ready'?'DRIVE':state.scene==='door'?'ENTER_HOUSE':state.scene==='arrival'&&state.arrivalSeen?(state.arrivalLine===arrivalLines.length-1?'WRITE_YEARS':'AUNT_NEXT'):null;if(target){e.preventDefault();act(target);}}});
render();requestAnimationFrame(frame);
ensureScene(['growth','writing-return'].includes(state.scene)?growthAssets:state.scene==='chapter2'?[]:state.scene==='arrival'?arrivalAssets:state.scene==='window'?['study-shelf.webp','study-objects.webp','topsius-books.webp']:assets.concat('wheel.webp'));
// Browsers require a first gesture for audio; the scene itself starts immediately.
function wakeSound(e){if(e.target.closest?.('[data-action=SOUND]'))return;if(!orientationBlocked&&!paused){sound.unlock().then(syncSoundButton).catch(()=>{});}}
document.addEventListener('pointerdown',wakeSound,{once:true});
document.addEventListener('keydown',wakeSound,{once:true});

if(fresh){const u=new URL(location.href);u.searchParams.delete('fresh');history.replaceState({},'',u);}

// Shared cross-chapter controls and latest preferences.
installSharedControls({readyForCover:()=>!loading&&!!root.firstElementChild,audioReady:()=>sound.paused||sound.ctx?.state==='running',soundButton:'[data-action=SOUND]',settingsButton:'[data-action=SETTINGS]',settingsPanel:'dialog[data-settings]',getPreferences:()=>settings,applyPreferences:p=>{Object.assign(settings,p);sound.setVolume(p.volume);sound.mute(p.muted);saveSettings();syncSoundButton();const v=document.querySelector('#opening-volume');if(v)v.value=p.volume;},toggleSettings:()=>{if(menu)closeDialog();else openSettings();},closeTop:()=>{if(menu)closeDialog();else openSettings();return true;},enabled:()=>state.scene!=='chapter2',unlock:()=>sound.unlock()});

openingCheckpoint=sceneCheckpoint(storage,'reliquia.opening.scene.'+location.search,s=>s.scene+':'+(s.scene==='arrival'?arrivalLines[s.arrivalLine]?.scene:s.scene==='book'?s.spread:''));openingCheckpoint.capture(state);

window.addEventListener('reliquia:cover-resume',()=>sound.set(state.scene));
