import {endingTiming} from './state.js';
import {chapterEntryURL,consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {createLastWords,centerLastWords,settleLastWords} from './last-words.js';
import {restartReading,completionKey} from '../book/replay.js';
import {playMemoryTransition} from '../ui/memory-transition.js';
import {movePainting,homecomingPicture} from '../ui/notebook-motion.js';
import {pages,scenes,objects,ending,asset} from './content.js';
import {initial,restore,reduce,pageReady,spreadReady,lastSpread} from './state.js';
import {point,pen} from '../interaction-marks.js';
import {paperPortrait,portraitMarkup} from '../ui/character-portraits.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {sceneCheckpoint} from '../ui/scene-checkpoint.js';
import {rememberChapter} from '../ui/mainline.js';
import {BossAudio} from '../boss/audio.js';

const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),preview=params.has('preview'),key='reliquia.chapter7.v1'+(preview?'.preview':'')+(params.has('bridge')?'.bridge':'')+(preview&&params.get('start')==='ending'?'.book-ending':'');
// Compatibility for the previously shared link: include the actual chapter-six exit.
if(preview&&params.has('arrival')&&!params.has('from')&&!params.has('bridge'))location.replace('./chapter6.html?preview=1&start=epilogue');
const finalWords=createLastWords(ending);document.body.append(finalWords);finalWords.hidden=true;

let endingBook=null,endingHost=null,endingMount=null,bookMount=0,leavingBook=false;
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('Storage');},removeItem:()=>{}};}
const read=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
const endingTest=preview&&params.get('start')==='ending';
let s=endingTest?{...initial(),mode:'final',ring:true,deed:true,finalLine:0,elapsed:0}:params.has('bridge')?initial():restore(read(key)),prefs=readPreferences(),busy=false,ready=false,last=performance.now(),saveAt=0,epoch=0,observing=false,detailId=null;
const identity=s=>s.mode==='scene'?s.scene:s.mode==='book'?'book-'+s.spread:s.mode;
const checkpoint=sceneCheckpoint(storage,key+'.scene',identity),audio=new BossAudio(prefs),decoded=new Map();
checkpoint.capture(s);
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paused=()=>$('settings').open||document.hidden;
const blocked=()=>paused()||!$('detail').hidden;
const row=()=>s.mode==='scene'?scenes[s.scene].rows[s.line]:null;
const spot=(id,name,x,y,action='inspect',extra='')=>`<button class="hotspot ${s.seen.includes(id)?'seen':''} ${extra}" data-action="${action}" data-id="${id}" aria-label="${name}" style="left:${x}%;top:${y}%">${point()}</button>`;
function save(){if(params.has('bridge'))return;try{storage.setItem(key,JSON.stringify(s));$('save-warning').hidden=true;}catch{$('save-warning').hidden=false;}if(!preview)rememberChapter('epilogue',storage);}
function preferences(){audio.settings=prefs;audio.update();$('volume').value=prefs.volume;document.body.classList.toggle('reduce-motion',prefs.reduced);updateSoundButton($('sound'),prefs.muted||prefs.volume===0,{shortcut:'M'});}
function music(){const name=s.mode==='fade'?null:s.scene==='conscience'?'homecomingC':'homecomingA';if(audio.desired!==name)audio.request(name,s.mode==='fade'?endingTiming.total:1.6);}
function preload(src){if(!decoded.has(src))decoded.set(src,new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>{decoded.delete(src);reject(Error(src));};im.src=src;}));return decoded.get(src);}
function resources(){if(s.mode==='book'||s.mode==='closing')return [...(s.mode==='closing'?[asset('e01-book-closed'),asset('e02-resentment'),asset('e03-regret')]:[]),...pages.slice(s.spread*2,s.spread*2+2).flatMap(p=>p.handoff?['./assets/dinner/street.webp','./assets/chapter6/v09/teo-surprised.webp','./assets/chapter6/obj-0.webp']:[asset(p.art)]),'./assets/journey-border.webp','./assets/writing-pen.webp'];if(s.mode==='scene')return [asset(row().art)];if(s.mode==='credits')return ['./assets/cover-parcel.webp'];return [asset('e01-book-closed'),asset('e02-resentment'),asset('e03-regret')];}
function book(){return `<section class="book-scene growth-book c7-book scene ${s.mode==='closing'?'book-closing':''}" aria-label="回忆本"><div class="book-wrap"><div class="book-cover"></div><div class="paper-stack" aria-hidden="true"></div><div class="book-spread">${pages.slice(s.spread*2,s.spread*2+2).map((p,i)=>{
 const n=s.spread*2+i,written=s.written>n,active=s.written===n&&(n===0||pageReady(s,n-1));
 return `<article class="page page-${i?'right':'left'} ${written?'written':'blank'} ${active?'page-ready':''}" aria-label="${i?'右':'左'}页">${written?`<div class="page-content" ${written?'':'hidden'}><div class="illustration">${p.handoff?homecomingPicture():p.scene?`<button class="scene-thumb" data-action="enter" data-scene="${p.scene}" aria-label="走进${p.title}"><img src="${asset(p.art)}" alt="${p.title}">${point()}</button>`:`<div class="ornament-art"><img src="${asset(p.art)}" alt="${p.title}"></div>`}</div><div class="page-prose" tabindex="0" role="region" aria-label="${p.title}"><p>${p.text}</p></div><span class="page-number">${['一','二','三','四','五','六','七','八','九','十','十一','十二'][n]}</span></div>`: ''}${active?`<button class="write-page" data-action="write" aria-label="在${i?'右':'左'}页书写">${pen()}</button>`:''}</article>`;
 }).join('')}${!pages[s.spread*2+1]?'<article class="page page-right blank"></article>':''}<div class="spine" aria-hidden="true"></div></div>${spreadReady(s)&&s.spread===lastSpread?`<button class="close-notebook" data-action="next" aria-label="合上本子">${point()}</button>`:spreadReady(s)?`<button class="turn-page" data-action="next" aria-label="${s.spread===lastSpread?'合上本子':'翻到下一组书页'}"><span aria-hidden="true">›</span></button>`:''}${s.spread>0?'<button class="turn-page turn-back" data-action="back" aria-label="翻回上一组书页"><span aria-hidden="true">‹</span></button>':''}</div></section>`;}
function portrait(who){return portraitMarkup(paperPortrait(who,who==='特奥多里科'&&(['inheritance','conscience'].includes(s.scene)||s.scene==='market'&&s.line>0)?'sad':'stern'));}
function cornerNav(back=true,next=true){return `<div class="dialogue-nav"><button data-action="back" aria-label="上一句" ${back?'':'disabled'}>‹</button>${next?'<button data-action="next" aria-label="下一句">›</button>':''}</div>`;}
function scene(){const r=row(),props=objects[r.art]||[];let actors='';
 if(s.scene==='market')actors='<button class="actor-target" data-action="next" aria-label="继续与利诺交谈" style="left:3%;top:6%;width:25%;height:79%"></button>';
 if(s.scene==='conscience'){
  if(r.art==='s08-accusation')actors=`${r.target==='telescope'?spot('telescope','查看望远镜',62,83,'telescope'):r.target==='christ'?spot('christ','查看基督画像',84,25,'christ'):''}<button class="actor-target" data-action="next" aria-label="特奥多里科的质问" style="left:35%;top:16%;width:28%;height:69%"></button>`;
  if(r.art==='s09-conscience')actors='<button class="actor-target" data-action="next" aria-label="倾听回应" style="left:45%;top:1%;width:49%;height:95%"></button><button class="actor-target" data-action="next" aria-label="特奥多里科的回应" style="left:14%;top:48%;width:30%;height:49%"></button>';
 }
 return `<section class="stage-scene" aria-label="${scenes[s.scene].title}"><div class="art-area"><div class="art-frame"><img class="scene-image" src="${asset(r.art)}" alt="${scenes[s.scene].title}">${actors}${props.filter(p=>!s.seen.includes(p.id)).map(p=>spot(p.id,p.name,p.x,p.y)).join('')}</div></div><section class="c7-dialogue ${r.target==='telescope'?'telescope-intro':''} ${r.art==='s14b-married'?'marriage-caption':''}" id="dialogue" ${r.target==='telescope'?'hidden':''} data-action="next" aria-label="剧情对白"><div class="c7-portrait">${r.who?portrait(r.who):''}</div>${r.who?`<span class="speaker">${r.who}</span>`:''}<p>${r.text}</p>${cornerNav(s.line>0,!r.target)}</section></section>`;
}
function desk(){const end=['final','fade'].includes(s.mode),art=s.finalLine===0?'e02-resentment':'e03-regret';return `<section class="stage-scene desk-scene" aria-label="特奥多里科的书桌"><div class="art-area"><div class="art-frame"><img class="scene-image" src="${asset('e01-book-closed')}" alt="合上的回忆本，戒指和庄园契据">${end?`<img class="scene-image ${s.finalLine===2?'':'art-overlay'}" style="position:absolute;inset:0" src="${asset(art)}" alt="特奥多里科${s.finalLine===0?'不满':'懊悔'}的神情">`:s.ring?spot('deed','查看庄园契据',21,80,'deed'):spot('ring','查看戒指',68.5,41,'ring')}</div></div>${s.mode==='final'?`<button class="final-text final-controls" data-action="next" aria-label="${s.finalLine<ending.length-1?'显示下一句心声':'回到书本最后一页'}"><span class="final-continue-hint">点击画面继续</span></button>`:''}${s.mode==='fade'?`<div class="fade-shade" style="opacity:${Math.min(1,s.elapsed/endingTiming.total)}"></div>`:''}</section>`;}
function credits(){return '';}
function clearEndingBook(){
 if(finalWords.parentElement!==document.body)document.body.append(finalWords);
 ++bookMount;endingBook?.dispose();endingBook=null;endingMount=null;endingHost?.remove();endingHost=null;
}
function updateEndingReveal(){
 if(!endingHost)return;
 // Finish typesetting before any part of the book becomes visible.
 endingHost.style.opacity=s.mode==='credits'?'1':String(Math.max(0,Math.min(1,(s.elapsed-endingTiming.settle)/endingTiming.reveal)));
 endingHost.style.pointerEvents=s.mode==='credits'?'auto':'none';
}
async function mountEndingBook(){
 if(endingBook){if(s.mode==='credits')endingBook.attachLastPage?.(finalWords);updateEndingReveal();return;}
 if(endingMount)return endingMount;
 const ticket=++bookMount;
 endingHost=document.createElement('section');endingHost.id='ending-book';endingHost.setAttribute('aria-label','最后一页与后护封');
 endingHost.style.opacity='0';$('game').append(endingHost);const host=endingHost;
 endingMount=(async()=>{
 const {mountBook}=await import('../book/book.js');if(ticket!==bookMount)return;
 const mounted=await mountBook(host,{mode:s.mode==='credits'&&['ending','back','front','intro'].includes(s.bookEnding)?s.bookEnding:'ending',onState:p=>{if(['ending','back','front','intro'].includes(p)){s.bookEnding=p;save();}},getPreferences:()=>prefs,paused:()=>blocked()||s.mode==='fade',enterLabel:preview?'返回游戏封面':'重新阅读',onEnter:()=>{if(preview){location.assign('./covers.html');return;}try{restartReading(storage);leavingBook=true;location.assign('./index.html?play=1');}catch{$('save-warning').textContent='无法备份旧进度，尚未开始新一轮。';$('save-warning').hidden=false;return false;}}});
 if(ticket!==bookMount){mounted.dispose();return;}endingBook=mounted;window.endingBook=mounted;
 if(s.mode==='credits')mounted.attachLastPage?.(finalWords);updateEndingReveal();
 })();return endingMount;
}
function render(){if(!['fade','credits'].includes(s.mode))clearEndingBook();const old=document.activeElement?.getAttribute('aria-label');$('view').innerHTML=s.mode==='book'||s.mode==='closing'?book():s.mode==='scene'?scene():s.mode==='credits'?credits():desk();$('game').dataset.mode=s.mode;$('game').dataset.foldBack=String(s.mode==='closing'&&(prefs.reduced||s.elapsed>=1.98));syncLastWords();if(['fade','credits'].includes(s.mode))void mountEndingBook();if(s.mode==='credits'&&!preview){try{storage.setItem(completionKey,'true');}catch{}}document.body.classList.toggle('observing',observing);$('observe').hidden=s.mode!=='scene';$('observe').textContent=observing?'恢复对白框':'查看场景';$('return-book').hidden=!(s.mode==='scene'&&['market','inheritance','conscience'].includes(s.scene)||s.mode==='desk');$('return-book').textContent=s.mode==='desk'?'重读书页':'返回书页';music();if(old)for(const b of $('view').querySelectorAll('button'))if(b.getAttribute('aria-label')===old){b.focus({preventScroll:true});break;}}
function syncLastWords(){
 if(s.mode==='credits'){finalWords.hidden=false;[...finalWords.children].forEach(p=>p.hidden=false);if(!endingBook){settleLastWords(finalWords,1);}return;}
 finalWords.hidden=!['final','fade'].includes(s.mode);
 if(finalWords.hidden)return;
 finalWords.classList.toggle('on-paper',s.mode==='fade');
 [...finalWords.children].forEach((p,i)=>{p.hidden=!(s.mode==='fade'||i<=s.finalLine);});
 if(s.mode==='fade')settleLastWords(finalWords,s.elapsed/endingTiming.settle);else{finalWords.style.color='';finalWords.style.textShadow='';centerLastWords(finalWords);}
}
window.addEventListener('resize',()=>{if(['final','fade'].includes(s.mode))syncLastWords();});
finalWords.addEventListener('click',()=>{if(s.mode==='final')next();});
async function readyRender(){const ticket=++epoch;ready=false;$('load').hidden=!!endingBook&&s.mode==='credits';$('retry').hidden=true;try{await Promise.all(resources().map(preload));if(ticket!==epoch)return;render();ready=true;$('load').hidden=true;const next=s.mode==='scene'?scenes[s.scene].rows[s.line+1]?.art:pages[s.spread*2+2]?.art;if(next)void preload(asset(next)).catch(()=>{});}catch{if(ticket!==epoch)return;$('load p').textContent='这一幕的画面未能载入。';$('retry').hidden=false;}}
async function turnLeaf(back=false){if(prefs.reduced)return;const leaf=document.createElement('div');leaf.className='turning-leaf'+(back?' turn-backward':'');$('view').querySelector('.book-wrap')?.append(leaf);await Promise.all(leaf.getAnimations().map(a=>a.finished));leaf.remove();}
async function dispatch(a,origin){
 if(busy||!ready||blocked())return;
 if(observing&&a.type==='next'&&!a.target){observing=false;render();return;}
 const before=s,next=reduce(s,a);if(JSON.stringify(before)===JSON.stringify(next))return;
 busy=true;$('game').setAttribute('aria-busy','true');
 const memory=before.mode==='desk'&&['ring','deed'].includes(a.type),handshake=before.mode==='scene'&&before.scene==='ring'&&next.mode==='scene'&&before.line===9&&next.line===10;
 let memoryHost,oldLayer;
 if(memory||handshake){memoryHost=document.createElement('div');memoryHost.className='memory-flight';oldLayer=$('view').querySelector('.stage-scene').cloneNode(true);oldLayer.inert=true;memoryHost.append(oldLayer);document.body.append(memoryHost);$('game').dataset.transition='memory';}
 const retreat=before.mode==='scene'&&next.mode==='book',enter=a.type==='enter';
 const oldImage=retreat?$('view').querySelector('.scene-image'):null;
 const from=(origin||oldImage)?.getBoundingClientRect(),flightSrc=origin?.querySelector('img')?.src||oldImage?.src;
 let flight;
 if((enter||retreat)&&from&&flightSrc){flight=document.createElement('img');flight.src=flightSrc;flight.className='portal-flight';for(const k of ['left','top','width','height'])flight.style[k]=from[k]+'px';document.body.append(flight);$('game').dataset.transition=enter?'expand':'retreat';}
 observing=false;s=next;checkpoint.capture(s);save();await readyRender();
 try{
  if(memoryHost&&ready){const newLayer=$('view').querySelector('.stage-scene').cloneNode(true);newLayer.inert=true;memoryHost.append(newLayer);await playMemoryTransition(memoryHost,oldLayer,newLayer,{duration:handshake?900:3600,reduced:prefs.reduced,paused});}
  if(a.type==='write'&&ready){audio.noise(.3,.025,1300);if(!prefs.reduced){const c=$('view').querySelectorAll('.page-content')[(s.written-1)%2];c?.classList.add('ink-reveal');await Promise.all(c?.getAnimations({subtree:true}).filter(a=>a.effect.getTiming().iterations!==Infinity).map(a=>a.finished)||[]);c?.classList.remove('ink-reveal');}}
  if(['next','back'].includes(a.type)&&before.mode==='book'&&s.mode==='book')await turnLeaf(a.type==='back');
  if(flight&&ready){const dest=$('view').querySelector(retreat?`[data-scene="${before.scene}"]`:'.art-frame')?.getBoundingClientRect();if(dest)await movePainting(flight,from,dest,{retreat,reduced:prefs.reduced,paused});}
 }finally{memoryHost?.remove();flight?.remove();delete $('game').dataset.transition;busy=false;$('game').setAttribute('aria-busy','false');}
}
function next(){if(s.mode==='book'){const active=$('view').querySelector('.write-page');if(active){void dispatch({type:'write'});return;}void dispatch({type:'next'});}else void dispatch({type:'next'});}
function detail(id){const p=Object.values(objects).flat().find(p=>p.id===id);if(!p||s.seen.includes(id))return;detailId=id;$('detail-title').textContent=p.name;$('detail-text').textContent=p.text;$('detail').hidden=false;document.body.classList.add('inspecting');$('close-detail').focus({preventScroll:true});}
function closeDetail(){if($('detail').hidden)return false;s=reduce(s,{type:'inspect',id:detailId});detailId=null;save();$('detail').hidden=true;document.body.classList.remove('inspecting');render();$('observe').focus({preventScroll:true});return true;}
function syncMotionPause(){for(const a of [...$('view').getAnimations({subtree:true}),...finalWords.getAnimations({subtree:true})])paused()?a.pause():a.play();}
function closeTop(){if($('settings').open){$('settings').close();audio.pause(document.hidden);document.body.classList.remove('paused');syncMotionPause();last=performance.now();return true;}if(closeDetail())return true;if(observing){observing=false;render();return true;}return false;}
function openSettings(){if(!ready)return;$('restart-scene').disabled=busy;$('restart-chapter').disabled=busy;if($('settings').open){closeTop();return;}$('settings').showModal();audio.pause(true);document.body.classList.add('paused');syncMotionPause();}
async function restart(value=initial()){++epoch;checkpoint.clear();s=restore(value);params.delete('arrival');params.delete('bridge');history.replaceState(null,'',location.pathname+'?'+params);observing=false;$('detail').hidden=true;detailId=null;document.body.classList.remove('inspecting');checkpoint.capture(s);closeTop();save();await readyRender();}
$('view').addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b||b.disabled||blocked()||busy||!ready)return;void audio.unlock();const action=b.dataset.action;if(action==='inspect'){detail(b.dataset.id);return;}if(action==='restart'){void restart();return;}void dispatch({type:['christ','telescope'].includes(action)?'next':action,scene:b.dataset.scene,target:['christ','telescope'].includes(action)?action:undefined},action==='enter'?b:null);});
$('observe').onclick=()=>{if(busy||!ready||blocked())return;observing=!observing;render();};
$('return-book').onclick=()=>void dispatch({type:s.mode==='desk'?'book':'leave'});$('settings-open').onclick=openSettings;$('resume').onclick=closeTop;$('close-detail').onclick=closeTop;$('retry').onclick=readyRender;
$('restart-scene').onclick=()=>void restart(checkpoint.restore()||initial());$('restart-chapter').onclick=()=>void restart();
$('volume').oninput=e=>{prefs.volume=+e.target.value;preferences();};
for(const id of ['settings'])$(id).addEventListener('cancel',e=>{e.preventDefault();closeTop();});
installSharedControls({readyForCover:()=>ready&&(s.mode!=='credits'||!!endingBook),audioReady:()=>audio.paused||audio.ctx?.state==='running',soundButton:'#sound',settingsButton:'#settings-open',getPreferences:()=>prefs,applyPreferences:p=>{prefs=p;preferences();},toggleSettings:openSettings,closeTop,unlock:()=>audio.unlock()});
document.addEventListener('pointerdown',()=>{if(!paused())void audio.unlock();});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.repeat||e.target.matches('input,textarea,[contenteditable=true]'))return;if(e.code==='Escape'){e.preventDefault();if(!closeTop())openSettings();return;}if(blocked()||busy||!ready||s.mode==='credits')return;void audio.unlock();if(e.code==='Enter'&&e.target.closest('button,a'))return;if(['Space','KeyD','ArrowRight','Enter'].includes(e.code)){e.preventDefault();next();}else if(['KeyA','ArrowLeft'].includes(e.code)){e.preventDefault();void dispatch({type:'back'});}});

document.addEventListener('visibilitychange',()=>{audio.pause(paused());syncMotionPause();last=performance.now();if(!leavingBook)save();});window.addEventListener('pagehide',()=>{if(!leavingBook)save();endingBook?.dispose();audio.stop();});
function frame(now){$('sound').dataset.playback=JSON.stringify({cue:audio.desired,voices:audio.voices.size,context:audio.ctx?.state||'locked',errors:audio.errors,muted:prefs.muted,volume:prefs.volume});const dt=Math.min(.1,(now-last)/1000);last=now;if(ready&&!busy&&!paused()&&s.mode==='final'){const line=s.finalLine;s=reduce(s,{type:'tick',dt});if(s.finalLine!==line){render();save();}}if(ready&&!busy&&!paused()&&['closing','fade'].includes(s.mode)&&(s.mode!=='fade'||endingBook)){const old=s.mode;s=reduce(s,{type:'tick',dt});if(old==='closing'){$('game').dataset.fold=s.elapsed<1.5?'start':s.elapsed<3.5?'folding':'closed';$('game').dataset.foldBack=String(prefs.reduced||s.elapsed>=1.98);}if(s.mode!==old){if(old==='fade'){settleLastWords(finalWords,1);updateEndingReveal();}checkpoint.capture(s);save();void readyRender();}else if(s.mode==='fade'){$('view').querySelector('.fade-shade').style.opacity=Math.min(.65,s.elapsed/endingTiming.total);syncLastWords();updateEndingReveal();}if(now-saveAt>600){saveAt=now;save();}}requestAnimationFrame(frame);}
window.chapter7={snapshot:()=>structuredClone(s),ready:()=>ready&&!busy,sound:()=>({desired:audio.desired,voices:audio.voices.size,errors:[...audio.errors],state:audio.ctx?.state,muted:prefs.muted}),source:()=>({pages,scenes,objects})};
$('game').setAttribute('aria-busy','false');$('game').toggleAttribute('data-bridge',params.has('bridge'));preferences();if(!params.has('bridge'))save();void readyRender();requestAnimationFrame(frame);
