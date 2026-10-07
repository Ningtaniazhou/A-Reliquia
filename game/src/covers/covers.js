const openingTest=new URLSearchParams(location.search).get('preview')==='opening';
import {mountBook} from '../book/book.js';
import {restartReading} from '../book/replay.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {resumeChapter,readingProgress} from '../ui/mainline.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {Ambience} from '../audio.js';
const root=document.querySelector('#cover'),frame=document.querySelector('#play'),nav=document.querySelector('#choices'),music=document.querySelector('#cover-music'),status=document.querySelector('#status');
const playWindow=document.querySelector('#play-window');
let heldScene=null;
const art={parcel:{name:'包裹中的谜',file:'cover-parcel.webp'}};
let settings={volume:.5,muted:false};try{settings={...settings,...JSON.parse(localStorage.getItem('reliquia.settings')||'{}')};}catch{}
Object.assign(settings,readPreferences(settings));
const ambience=new Ambience();ambience.setVolume(settings.volume);ambience.mute(settings.muted);ambience.set('cover');
const bridge=window.__reliquiaCover={ambience,entered:false,navigate(destination){ambience.pause(true);frame.src=destination;}};
let version='parcel',generation=0,portal=null,book=null;
const pictures=Object.values(art).map(item=>{const img=new Image();img.src='./assets/'+item.file;return img.decode().catch(()=>{});});
function soundLabel(){updateSoundButton(music,ambience.muted||settings.volume===0);}
function wake(){if(!ambience.muted)ambience.unlock().then(soundLabel).catch(soundLabel);}
music.onclick=()=>{if(ambience.muted){ambience.mute(false);ambience.unlock().then(soundLabel);}else if(ambience.ctx?.state==='running'){ambience.mute(true);}else{ambience.unlock().then(soundLabel);}try{localStorage.setItem('reliquia.settings',JSON.stringify({...JSON.parse(localStorage.getItem('reliquia.settings')||'{}'),muted:ambience.muted}));}catch{}soundLabel();};
async function show(v){const token=++generation;book?.dispose();portal?.remove();portal=null;bridge.entered=false;version='parcel';heldScene?.release();heldScene=null;playWindow.hidden=true;playWindow.removeAttribute('style');frame.removeAttribute('style');frame.hidden=true;frame.style.visibility='hidden';frame.src='about:blank';ambience.set('cover');ambience.pause(document.hidden);root.hidden=false;root.className='';document.body.classList.remove('playing');document.querySelector('#again').hidden=true;status.textContent='';
const mounted=await mountBook(root,{getPreferences:()=>settings,paused:()=>!!document.querySelector('#cover-settings')?.open,onEnter:start,enterLabel:'进入书中世界'});if(token!==generation){mounted.dispose();return;}book=mounted;window.coverBook=book;soundLabel();}
async function start(){if(!openingTest&&readingProgress()){showReadingChoice();return false;}return enterReading();}
async function enterReading(){const token=++generation,button=root.querySelector('.start');button.disabled=true;wake();status.textContent='';

const destination=openingTest?null:resumeChapter();
frame.hidden=false;playWindow.hidden=false;playWindow.style.visibility='hidden';
frame.style.width=innerWidth+'px';frame.style.height=innerHeight+'px';
frame.src=destination||'./index.html?play=1&cover=1'+(openingTest?'&preview=opening':'');
const began=performance.now();
const wait=()=>{if(token!==generation)return;let leaf=frame.contentWindow;
 try{for(let depth=0;depth<4;depth++){const nested=[...leaf.document.querySelectorAll('iframe')].find(f=>f.getBoundingClientRect().width>0&&!f.closest('[hidden]')&&f.getAttribute('aria-hidden')!=='true'&&leaf.getComputedStyle(f).pointerEvents!=='none');if(!nested)break;leaf=nested.contentWindow;}
 const api=leaf.reliquiaCoverScene;
 if(api?.ready()){heldScene=api;api.hold();requestAnimationFrame(()=>requestAnimationFrame(()=>void reveal(token)));return;}
 }catch{}
 if(performance.now()-began<30000)requestAnimationFrame(wait);else{playWindow.hidden=true;frame.hidden=true;button.disabled=false;status.textContent='画面暂时没有打开，请再试一次。';}
};requestAnimationFrame(wait);}
async function reveal(token){const rect=book.paintingTransition?.()||book.paintingRect,vw=innerWidth,vh=innerHeight;
const bounds={left:rect.x+'px',top:rect.y+'px',width:rect.width+'px',height:rect.height+'px',borderRadius:rect.clip?'0':'42% 42% 0 0',clipPath:rect.clip||'none'};
Object.assign(playWindow.style,bounds);
const scale=Math.max(rect.width/vw,rect.height/vh),initial=`translate(${(rect.width-vw*scale)/2}px,${(rect.height-vh*scale)/2}px) scale(${scale})`;
frame.style.transform=initial;frame.style.visibility='visible';playWindow.style.visibility='visible';
portal=document.createElement('div');portal.className='cover-portal';portal.setAttribute('aria-hidden','true');Object.assign(portal.style,bounds);
const picture=new Image();picture.className='portal-picture';picture.src=rect.image||'./assets/'+art[version].file;
if(rect.image)Object.assign(picture.style,{inset:'auto',left:-rect.x+'px',top:-rect.y+'px',width:vw+'px',height:vh+'px',objectFit:'fill'});
portal.append(picture);document.body.append(portal);
try{await picture.decode();if(token!==generation)return;
await portal.animate([{opacity:1},{opacity:0}],{duration:1200,fill:'forwards'}).finished;
if(token!==generation)return;portal.remove();portal=null;root.classList.add('opening');
const options={duration:2800,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'};
const zoom=frame.animate([{transform:initial},{transform:'none'}],options);
const expand=playWindow.animate([bounds,{left:'0px',top:'0px',width:vw+'px',height:vh+'px',borderRadius:'0px',clipPath:rect.expanded||'none'}],options);
await expand.finished;if(token!==generation)return;
playWindow.removeAttribute('style');frame.style.transform='none';expand.cancel();zoom.cancel();finish();
}catch{if(token===generation)finish();}}
function finish(){book?.dispose();book=null;frame.style.visibility='visible';portal?.remove();portal=null;root.hidden=true;bridge.entered=true;document.body.classList.add('playing');document.querySelector('#again').hidden=false;heldScene?.release();heldScene=null;const openingScene=frame.contentDocument?.querySelector('#game')?.dataset.scene;if(openingScene&&openingScene!=='chapter2'){ambience.set(openingScene);ambience.pause(document.hidden);}else ambience.pause(true);frame.contentWindow.focus();}
window.addEventListener('resize',()=>{if(bridge.entered){frame.style.width=innerWidth+'px';frame.style.height=innerHeight+'px';}});
nav.querySelectorAll('[data-version]').forEach(b=>b.onclick=()=>{show(b.dataset.version);wake();});document.querySelector('#again').onclick=()=>show(version);
document.addEventListener('pointerdown',e=>{if(!e.target.closest('#cover-music'))wake();});document.addEventListener('keydown',wake);document.addEventListener('visibilitychange',()=>{if(!bridge.entered)ambience.pause(document.hidden||!!document.querySelector('#cover-settings')?.open);});window.addEventListener('pagehide',()=>{book?.dispose();ambience.dispose();});
show(version);


const readingChoice=document.createElement('dialog');readingChoice.id='reading-choice';readingChoice.setAttribute('aria-labelledby','reading-choice-title');
readingChoice.innerHTML='<h2 id="reading-choice-title">继续这段往事？</h2><p id="reading-position"></p><div><button id="reading-continue">继续阅读</button><button id="reading-new">从头阅读</button><button id="reading-cancel">返回封面</button></div><p id="reading-error" role="status"></p>';document.body.append(readingChoice);
function showReadingChoice(){document.querySelector('#reading-position').textContent='上次读到：'+readingProgress().label;document.querySelector('#reading-error').textContent='';readingChoice.showModal();}
document.querySelector('#reading-continue').onclick=()=>{readingChoice.close();void enterReading();};
document.querySelector('#reading-new').onclick=()=>{try{restartReading();readingChoice.close();void enterReading();}catch{document.querySelector('#reading-error').textContent='暂时无法保存原来的进度，请稍后重试。';}};
document.querySelector('#reading-cancel').onclick=()=>readingChoice.close();

const settingsButton=document.createElement('button');settingsButton.id='cover-settings-open';settingsButton.textContent='设置';document.body.append(settingsButton);
const settingsPanel=document.createElement('dialog');settingsPanel.id='cover-settings';settingsPanel.innerHTML='<h2>设置 · 已暂停</h2><label>音量 <input id="cover-volume" type="range" min="0" max="1" step=".05"></label><button id="cover-resume">返回封面</button>';document.body.append(settingsPanel);
function coverPreferences(p){Object.assign(settings,p);ambience.setVolume(p.volume);ambience.mute(p.muted);document.querySelector('#cover-volume').value=p.volume;soundLabel();}
function toggleCoverSettings(){if(settingsPanel.open)settingsPanel.close();else{ambience.pause(true);settingsPanel.showModal();}}
settingsButton.onclick=toggleCoverSettings;settingsPanel.addEventListener('close',()=>ambience.pause(document.hidden));document.querySelector('#cover-resume').onclick=()=>settingsPanel.close();document.querySelector('#cover-volume').oninput=e=>coverPreferences({...settings,volume:+e.target.value});coverPreferences(settings);
installSharedControls({soundButton:'#cover-music',settingsButton:'#cover-settings-open',settingsPanel:'#cover-settings',fields:'#cover-volume',getPreferences:()=>settings,applyPreferences:coverPreferences,toggleSettings:()=>{if(!readingChoice.open)toggleCoverSettings();},closeTop:()=>{if(readingChoice.open){readingChoice.close();return true;}if(settingsPanel.open){settingsPanel.close();return true;}return false;},enabled:()=>!bridge.entered,unlock:()=>ambience.unlock()});
