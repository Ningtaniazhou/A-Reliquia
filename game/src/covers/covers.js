const openingTest=new URLSearchParams(location.search).get('preview')==='opening';
import {mountBook} from '../book/book.js';
import {restartReading,readingComplete} from '../book/replay.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {resumeChapter} from '../ui/mainline.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {Ambience} from '../audio.js';
const root=document.querySelector('#cover'),frame=document.querySelector('#play'),nav=document.querySelector('#choices'),music=document.querySelector('#cover-music'),status=document.querySelector('#status');
const art={parcel:{name:'包裹中的谜',file:'cover-parcel.webp'}};
let settings={volume:.5,muted:false};try{settings={...settings,...JSON.parse(localStorage.getItem('reliquia.settings')||'{}')};}catch{}
Object.assign(settings,readPreferences(settings));
const ambience=new Ambience();ambience.setVolume(settings.volume);ambience.mute(settings.muted);ambience.set('cover');
const bridge=window.__reliquiaCover={ambience,entered:false};
let version='parcel',generation=0,portal=null,book=null;
const pictures=Object.values(art).map(item=>{const img=new Image();img.src='./assets/'+item.file;return img.decode().catch(()=>{});});
const garden=new Image();garden.src='./assets/study-shelf.webp';const gardenReady=garden.decode();
function soundLabel(){updateSoundButton(music,ambience.muted||settings.volume===0||ambience.ctx?.state!=='running');}
function wake(){if(!ambience.muted)ambience.unlock().then(soundLabel).catch(soundLabel);}
music.onclick=()=>{if(ambience.muted){ambience.mute(false);ambience.unlock().then(soundLabel);}else if(ambience.ctx?.state==='running'){ambience.mute(true);}else{ambience.unlock().then(soundLabel);}try{localStorage.setItem('reliquia.settings',JSON.stringify({...JSON.parse(localStorage.getItem('reliquia.settings')||'{}'),muted:ambience.muted}));}catch{}soundLabel();};
async function show(v){const token=++generation;book?.dispose();portal?.remove();portal=null;bridge.entered=false;version='parcel';frame.hidden=true;frame.style.visibility='hidden';frame.src='about:blank';ambience.set('cover');ambience.pause(document.hidden);root.hidden=false;root.className='';document.body.classList.remove('playing');document.querySelector('#again').hidden=true;status.textContent='';
const mounted=await mountBook(root,{getPreferences:()=>settings,paused:()=>!!document.querySelector('#cover-settings')?.open,onEnter:start,enterLabel:!openingTest&&readingComplete()?'重新阅读':'进入书中世界'});if(token!==generation){mounted.dispose();return;}book=mounted;window.coverBook=book;soundLabel();}
async function start(){const token=++generation,button=root.querySelector('.start');button.disabled=true;wake();status.textContent='';
if(!openingTest&&readingComplete()){try{restartReading();}catch{button.disabled=false;status.textContent='无法备份旧进度，尚未开始新一轮。';return;}}
const destination=openingTest?null:resumeChapter();if(destination){ambience.pause(true);location.assign(destination);return;}
try{await gardenReady;}catch{button.disabled=false;status.textContent='花园暂时没有载入，请刷新重试。';return;}
if(token!==generation)return;frame.hidden=false;frame.src='./index.html?play=1&cover=1'+(openingTest?'&preview=opening':'');const began=performance.now();
const wait=()=>{if(token!==generation)return;const game=frame.contentDocument?.querySelector('#game');if(game?.dataset.scene&&(game.querySelector('*')||frame.contentDocument.querySelector('.chapter-portal.active'))&&!frame.contentDocument.querySelector('.load-note')){reveal(token);}else if(performance.now()-began<15000){requestAnimationFrame(wait);}else{frame.hidden=true;button.disabled=false;status.textContent='画面暂时没有打开，请再试一次。';}};requestAnimationFrame(wait);}
async function reveal(token){const rect=book.paintingTransition?.()||book.paintingRect,vw=innerWidth,vh=innerHeight;const reduced=settings.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
portal=document.createElement('div');portal.className='cover-portal';portal.setAttribute('aria-hidden','true');Object.assign(portal.style,{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:rect.clip?'0':'42% 42% 0 0',clipPath:rect.clip||'none'});
portal.style.visibility='hidden';portal.innerHTML=`<div class="garden-world"><div class="camera"></div></div><img class="portal-picture" src="./assets/${art[version].file}" alt="">`;document.body.append(portal);
if(rect.image){const picture=portal.querySelector('.portal-picture');picture.src=rect.image;Object.assign(picture.style,{inset:'auto',left:-rect.x+'px',top:-rect.y+'px',width:vw+'px',height:vh+'px',objectFit:'fill'});}
const world=portal.querySelector('.garden-world'),scale=Math.max(rect.width/vw,rect.height/vh),initial=`translate(${(rect.width-vw*scale)/2}px,${(rect.height-vh*scale)/2}px) scale(${scale})`;world.style.transform=initial;
try{await portal.querySelector('.portal-picture').decode();if(token!==generation)return;portal.style.visibility='visible';await portal.querySelector('.portal-picture').animate([{opacity:1},{opacity:0}],{duration:reduced?100:1600,fill:'forwards'}).finished;if(token!==generation)return;
root.classList.add('opening');const options={duration:reduced?120:3600,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
world.animate([{transform:initial},{transform:'none'}],options);
await portal.animate([{left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:rect.clip?'0':'42% 42% 0 0',clipPath:rect.clip||'none'},{left:'0px',top:'0px',width:vw+'px',height:vh+'px',borderRadius:'0px',clipPath:rect.expanded||'none'}],options).finished;
if(token!==generation)return;finish();}catch{if(token===generation)finish();}}
function finish(){book?.dispose();book=null;frame.style.visibility='visible';portal?.remove();portal=null;root.hidden=true;bridge.entered=true;ambience.set('window');document.body.classList.add('playing');document.querySelector('#again').hidden=false;frame.contentWindow.focus();}
nav.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{show(b.dataset.version);wake();});document.querySelector('#again').onclick=()=>show(version);
document.addEventListener('pointerdown',e=>{if(e.target!==music)wake();});document.addEventListener('keydown',wake);document.addEventListener('visibilitychange',()=>{if(!bridge.entered)ambience.pause(document.hidden||!!document.querySelector('#cover-settings')?.open);});window.addEventListener('pagehide',()=>{book?.dispose();ambience.dispose();});
show(version);wake();

const settingsButton=document.createElement('button');settingsButton.id='cover-settings-open';settingsButton.textContent='设置';document.body.append(settingsButton);
const settingsPanel=document.createElement('dialog');settingsPanel.id='cover-settings';settingsPanel.innerHTML='<h2>设置 · 已暂停</h2><label>音量 <input id="cover-volume" type="range" min="0" max="1" step=".05"></label><label><input id="cover-reduced" type="checkbox">减少动态</label><button id="cover-resume">返回游戏</button>';document.body.append(settingsPanel);
function coverPreferences(p){Object.assign(settings,p);ambience.setVolume(p.volume);ambience.mute(p.muted);document.querySelector('#cover-volume').value=p.volume;document.querySelector('#cover-reduced').checked=p.reduced;soundLabel();}
function toggleCoverSettings(){if(settingsPanel.open)settingsPanel.close();else{ambience.pause(true);settingsPanel.showModal();}}
settingsButton.onclick=toggleCoverSettings;settingsPanel.addEventListener('close',()=>ambience.pause(document.hidden));document.querySelector('#cover-resume').onclick=()=>settingsPanel.close();document.querySelector('#cover-volume').oninput=e=>coverPreferences({...settings,volume:+e.target.value});document.querySelector('#cover-reduced').onchange=e=>coverPreferences({...settings,reduced:e.target.checked});coverPreferences(settings);
installSharedControls({soundButton:'#cover-music',settingsButton:'#cover-settings-open',settingsPanel:'#cover-settings',fields:'#cover-volume,#cover-reduced',getPreferences:()=>settings,applyPreferences:coverPreferences,toggleSettings:toggleCoverSettings,closeTop:()=>{if(settingsPanel.open){settingsPanel.close();return true;}return false;},enabled:()=>!bridge.entered,unlock:()=>ambience.unlock()});
