import {chapterEntryURL,consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {setPixelPrompt} from '../ui/pixel-prompts.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {rememberChapter} from '../ui/mainline.js';
import {sceneCheckpoint,restartButton} from '../ui/scene-checkpoint.js';
import {Backpack,itemById} from '../voyage/inventory.js';
import {relicItems} from '../jerusalem/chapter-content.js';
import {letters} from '../jerusalem/content.js';
import {ChapterSound} from '../chapter4/sound.js';
import {JerusalemAudio} from '../jerusalem/audio.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {groups,initial,normalize,begin,advance,enter} from './state.js';
import {bridges,bridgeDuration,newItems} from './journey-content.js';
import {places,spots,objective,files,assetsFor,paintScene} from './scenes.js';
const $=s=>document.querySelector(s),params=new URLSearchParams(location.search),suffix=params.get('preview')==='hotel'?'.hotel-preview':params.has('preview')?'.preview':'',saveKey='reliquia.chapter5.v1'+suffix;
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage');},removeItem:()=>{}};}
const read=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
const previewStart=()=>params.get('preview')==='hotel'?enter({...initial(),opened:true,inventoryImported:true,items:['thorn-parcel','relic-wood','relic-straw','relic-beads']},'hotel'):initial();
let s=normalize(read(saveKey)||previewStart());
if(params.has('fresh')){s=previewStart();storage.removeItem(saveKey+'.scene');params.delete('fresh');history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}
try{const handoff=JSON.parse(sessionStorage.getItem('reliquia.chapter5.handoff'+suffix));if(handoff){Object.assign(s,handoff);sessionStorage.removeItem('reliquia.chapter5.handoff'+suffix);}}catch{}
// Read-only inheritance; never write back into an earlier chapter's save.
if(!s.inventoryImported){const prev=read('reliquia.jerusalem-study.v1'+(suffix?'.camp-preview':''))||(!suffix?read('reliquia.jerusalem-study.v1'):null);if(Array.isArray(prev?.items))s.items=[...prev.items];else if(!s.items.length)s.items=[...initial().items];s.inventoryImported=true;}
s=normalize(s);
for(const item of [...relicItems,...newItems])itemById.set(item.id,item);
itemById.set('aunt-letter',{id:'aunt-letter',name:'写给姨姨的信',shortName:'信件',icon:'./assets/jerusalem/letter.png',text:letters.join('\n\n')});
Object.assign(s,readPreferences(s));
const checkpoint=sceneCheckpoint(storage,saveKey+'.scene',s=>s.scene);checkpoint.capture(s);
const sound=new ChapterSound(),music=new JerusalemAudio(s),images={},pending=new Map(),canvas=$('canvas'),ctx=canvas.getContext('2d'),keys=new Set();
let ready=false,paused=false,target=null,last=performance.now(),lastSave=0,distance=0,moving=false,bagOpen=false,selected=0,loadingScene=null,bridgeSound=null;
const backpack=new Backpack($('.voyage-bag'),{onClose:()=>bag()});
function persist(){if(!suffix)rememberChapter('morning');try{storage.setItem(saveKey,JSON.stringify(s));$('#save-warning').hidden=true;}catch{$('#save-warning').hidden=false;}}
function stop(){keys.clear();target=null;moving=false;}
function blocked(){return !ready||paused||document.hidden||!!s.dialogue||s.choice||bagOpen||!!s.bridge||s.scene==='lisbon';}
async function asset(id){if(images[id])return;if(pending.has(id))return pending.get(id);const job=(async()=>{const im=new Image();im.src='./assets/'+files[id];await im.decode();images[id]=im;})();pending.set(id,job);try{await job;}finally{pending.delete(id);}}
async function loadScene(scene){await Promise.all(assetsFor(scene).map(asset));}
function preferences(){sound.setVolume(s.volume);sound.setMuted(s.muted);music.settings=s;music.update();$('#volume').value=s.volume;$('#reduced').checked=s.reduced;document.body.classList.toggle('reduced',s.reduced);updateSoundButton($('#sound'),s.muted||s.volume===0,{shortcut:'M'});}
function audioScene(){preferences();music.sea(!!s.bridge&&bridges[s.bridge.id].sound==='sea');music.rain(!s.bridge&&s.scene==='hotel'?.025:0);if(s.bridge){music.request(null,1);sound.fadeForTravel();}else{bridgeSound=null;sound.setScene(s.scene==='hotel'||s.scene==='lisbon'?'tent':'dawn');music.request({camp:'malta',nazareth:'malta',hotel:'jerusalemRain',spring:'caravan',lisbon:'auntHome'}[s.scene],2);}}
async function unlock(){if(paused||document.hidden)return;await Promise.allSettled([sound.unlock(),music.unlock()]);if(s.bridge&&bridgeSound!==s.bridge.id){bridgeSound=s.bridge.id;if(bridges[s.bridge.id].sound==='horse')sound.travel('horse');}}
function expose(){const d=s.dialogue,row=d&&groups[d.id]?.[d.line];if(!row||s.seenLines.includes(row.id))return;s.seenLines.push(row.id);const effect={'C5-J-pack-small-2':'cloth','C5-J-pack-small-4':'hammer','C5-J-pack-2':'cloth','C5-J-pack-4':'cloth','C5-J-pack-8':'hammer','C5-J-returned-5':'coin','C5-J-woman-6':'coin','C5-J-give-3':'cloth'}[row.id];if(effect)sound.effect(effect);persist();}
function say(id){s=begin(s,id);stop();expose();persist();render();}
function travel(id){stop();s.dialogue=null;s.choice=false;s.bridge={id,elapsed:0};audioScene();void unlock();persist();render();void prepareBridge();}
async function prepareBridge(){if(!s.bridge||loadingScene)return;const id=s.bridge.id;loadingScene=id;try{await loadScene(bridges[id].to);$('#travel-error').hidden=true;}catch{$('#travel-error').hidden=false;}finally{loadingScene=null;}}
async function finishBridge(){if(!s.bridge)return;const id=s.bridge.id,to=bridges[id].to;if(!assetsFor(to).every(key=>images[key]))return;stop();s=enter(s,to);checkpoint.capture(s);audioScene();expose();persist();render();}
function next(){if(paused||!s.dialogue||!ready)return;const before=s.bridge?.id;s=advance(s);expose();if(s.bridge?.id!==before){audioScene();void unlock();void prepareBridge();}persist();render();}
function previous(){if(!paused&&s.dialogue?.line>0){s.dialogue.line--;persist();render();}}
function closeTalk(){if(paused)return;if(s.dialogue){if(['hotelIntro','hotelNews','hotelAntiquity','nazarethIntro','springIntro','lisbon','opening'].includes(s.dialogue.id))return;s.dialogue=null;}else s.choice=false;persist();render();}
function nearest(){return spots(s).filter(p=>Math.abs(p.x-s.x)<86).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0];}
function interact(id){if(blocked())return;const p=id==='scholar'?null:id?spots(s).find(p=>p.id===id):nearest();if(id!=='scholar'&&(!p||Math.abs(p.x-s.x)>=86))return;void unlock();if(id==='scholar')return say({camp:'scholar',nazareth:'nazarethScholar',hotel:'hotelScholar',spring:'springScholar'}[s.scene]);
 const actions={leaveCamp:()=>travel('pilgrimage'),leaveNazareth:()=>travel('hotel'),leaveHotel:()=>{s.x=770;s.facing=1;say('returned');},leaveSpring:()=>travel('return'),potte:()=>say(s.meal||'breakfast'),packSmall:()=>say(!s.read.includes('hotelNews')?'hotelNews':!s.read.includes('hotelAntiquity')?'hotelAntiquity':s.smallPacked?'smallPacked':'packSmall'),pack:()=>say(s.packed?'packed':!s.read.includes('hotelNews')?'hotelNews':!s.read.includes('hotelAntiquity')?'hotelAntiquity':!s.smallPacked?'packSmall':'pack'),nazarethPotte:()=>{s.facing=s.x<335?1:-1;say('nazarethPotte');},waterWoman:()=>{s.facing=s.x<500?1:-1;say('waterWoman');},woman:()=>{s.x=s.x>710?800:620;s.facing=s.x>710?-1:1;say(s.given?'womanAfter':s.read.includes('woman')?'give':'woman');}};(actions[p.id]||(()=>say(p.id)))();}
function bag(){if(paused||s.dialogue||s.choice||s.bridge||!ready)return;stop();bagOpen=!bagOpen;if(bagOpen)backpack.open(s.items,{checked:true});else backpack.close();render();}
function render(){
 const d=s.dialogue,row=d&&groups[d.id]?.[d.line],black=!!s.bridge,lisbon=s.scene==='lisbon';
 $('#talk').hidden=!row;$('#talk').classList.toggle('thought',!!row?.thought);$('#talk').classList.toggle('interjection',row?.who==='托普修斯');
 if(row){$('#talk small').textContent=row.who+(row.thought?' · 心声':'');$('#talk small').hidden=!row.who;$('#talk p').textContent=row.text;$('#previous').disabled=d.line===0;$('#close-talk').hidden=['hotelIntro','hotelNews','hotelAntiquity','nazarethIntro','springIntro','lisbon','opening'].includes(d.id);$('#talk').scrollTop=0;}
 $('#choices').hidden=!s.choice;$('#scholar').hidden=black||lisbon;$('#scholar').disabled=blocked();$('#scholar i').hidden=s.scene==='camp'?s.scholarRead:s.read.includes({nazareth:'nazarethScholar',hotel:'hotelScholar',spring:'springScholar'}[s.scene]);
 $('#hint').hidden=!!row||s.choice||bagOpen||black||lisbon;$('#hint').textContent=objective(s);$('.voyage-place').textContent=places[s.scene];$('.voyage-hud').hidden=black;$('#bag-button').disabled=!!row||s.choice;$('.voyage-screen').dataset.scene=lisbon?'lisbon':'jerusalem';canvas.setAttribute('aria-label',places[s.scene]+(lisbon?'':'，A D 行走，靠近后按 E 交互'));document.body.classList.toggle('home-mode',lisbon);
 $('#journey').hidden=!black;if(black){$('#journey p').textContent=bridges[s.bridge.id].text;const t=s.bridge.elapsed||0;$('#journey').style.opacity=s.reduced?'1':String(Math.min(1,t/.55));}else $('#travel-error').hidden=true;
 $('#arrival-end').hidden=!lisbon||!s.complete||bagOpen;preferences();document.querySelectorAll('[data-meal]').forEach((b,i)=>b.classList.toggle('selected',i===selected));markers();
}
function markers(){const host=$('#markers'),near=nearest(),marker=blocked()?'':near?.id||'';if(host.dataset.active===marker&&host.dataset.scene===s.scene)return;host.dataset.active=marker;host.dataset.scene=s.scene;host.replaceChildren();if(!blocked()&&near){const b=document.createElement('button');b.className='voyage-spot near';b.dataset.spot=near.id;b.style.left=near.x/960*100+'%';b.style.top=Math.min(near.y,(s.scene==='hotel'?460:475)-156-14)/540*100+'%';setPixelPrompt(b,near.label);b.onclick=()=>interact(near.id);host.append(b);}}
function pause(v){paused=v;stop();document.body.classList.toggle('paused',v);sound.pause(v||document.hidden);music.pause(v||document.hidden);if(v){if(!$('#settings').open)$('#settings').showModal();}else {$('#settings').close();$('.voyage-screen').focus({preventScroll:true});}render();}
$('#settings-open').onclick=()=>pause(true);$('#resume').onclick=e=>{e.preventDefault();pause(false);};$('#settings').addEventListener('cancel',e=>{e.preventDefault();pause(false);});
restartButton($('#settings'),async()=>{const old=checkpoint.restore();if(!old)return;const prefs={volume:s.volume,muted:s.muted,reduced:s.reduced};s=normalize({...old,...prefs});stop();bagOpen=false;backpack.close();pause(false);await start();});
$('#sound').onclick=()=>{s.muted=!s.muted;preferences();void unlock();persist();};$('#volume').oninput=e=>{s.volume=+e.target.value;preferences();persist();};$('#reduced').onchange=e=>{s.reduced=e.target.checked;preferences();persist();};
$('#bag-button').onclick=bag;$('#scholar').onclick=()=>interact('scholar');$('#close-talk').onclick=closeTalk;$('#next').onclick=next;$('#previous').onclick=previous;$('#talk p').onclick=next;
for(const b of document.querySelectorAll('[data-meal]'))b.onclick=()=>{if(paused)return;s.meal=b.dataset.meal;say(s.meal);};
$('#chapter6-continue').onclick=()=>{persist();sound.stop();music.stop();location.href=chapterEntryURL('./chapter6.html'+(suffix?'?preview=chapter6':'?from=chapter5'));};
$('#travel-error').onclick=()=>void prepareBridge();$('#retry').onclick=()=>void start();
canvas.onclick=e=>{if(blocked())return;const r=canvas.getBoundingClientRect();target=Math.max(55,Math.min(905,(e.clientX-r.left)/r.width*960));};
window.addEventListener('keydown',e=>{
 if(e.ctrlKey||e.metaKey)return;
 if(paused||e.target.matches('input'))return;
 if(bagOpen){e.preventDefault();if(e.code==='Tab')bag();else backpack.key(e);return;}
 if(e.code==='Escape'){e.preventDefault();if(s.dialogue||s.choice){const before=s.dialogue;closeTalk();if(before&&s.dialogue===before)pause(true);}else pause(true);return;}
 if(s.bridge){if(['KeyD','ArrowRight','Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat&&ready){s.bridge.elapsed=bridgeDuration(s.bridge.id);persist();void finishBridge();}}return;}
 if(s.dialogue){if(['KeyA','ArrowLeft'].includes(e.code)){e.preventDefault();previous();}if(['KeyD','ArrowRight','Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)next();}return;}
 if(s.choice){if(['KeyW','KeyS','ArrowUp','ArrowDown'].includes(e.code)){e.preventDefault();selected=1-selected;render();}if(['Space','Enter'].includes(e.code)){e.preventDefault();if(!e.repeat)document.querySelectorAll('[data-meal]')[selected].click();}return;}
 if(e.code==='Tab'){e.preventDefault();bag();}else if(e.code==='KeyR')interact('scholar');else if(e.code==='KeyE')interact();else if(['KeyA','KeyD','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);target=null;}
});
window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',stop);document.addEventListener('pointerdown',()=>void unlock());document.addEventListener('visibilitychange',()=>{stop();sound.pause(paused||document.hidden);music.pause(paused||document.hidden);last=performance.now();persist();});window.addEventListener('pagehide',()=>{persist();sound.stop();music.stop();});
function tick(now){const dt=Math.min(.06,(now-last)/1000);last=now;if(ready&&!paused&&!document.hidden){moving=false;if(s.bridge){s.bridge.elapsed=(s.bridge.elapsed||0)+dt;$('#journey').style.opacity=s.reduced?'1':String(Math.min(1,s.bridge.elapsed/.55));if(s.bridge.elapsed>=bridgeDuration(s.bridge.id))void finishBridge();}else if(!blocked()){let dir=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);if(target!==null){dir=Math.sign(target-s.x);if(Math.abs(target-s.x)<4){target=null;dir=0;}}const before=s.x,step=target!==null?Math.min(210*dt,Math.abs(target-s.x)):210*dt;s.x=Math.max(55,Math.min(905,s.x+dir*step));moving=before!==s.x;if(moving){s.facing=dir;distance+=Math.abs(before-s.x);}}
 sound.tick(dt);paintScene(ctx,images,s,{moving,distance});markers();if(now-lastSave>1000){persist();lastSave=now;}}
 requestAnimationFrame(tick);}
async function start(){ready=false;$('#load').hidden=false;$('#retry').hidden=true;try{await loadScene(s.scene);ready=true;$('#load').hidden=true;audioScene();if(!s.opened&&s.scene==='camp'){s.opened=true;say('opening');}expose();persist();render();void unlock();if(s.bridge)void prepareBridge();}catch{$('#load span').textContent='这一处未能载入。';$('#retry').hidden=false;}}
void start();requestAnimationFrame(tick);window.chapter5={snapshot:()=>JSON.parse(JSON.stringify(s)),sound:()=>({...sound.status(),music:music.desired,musicVoices:music.voices.size}),ready:()=>ready};

// Shared cross-chapter controls and latest preferences.
installSharedControls({soundButton:'#sound',settingsButton:'#settings-open',bagButton:'#bag-button',getPreferences:()=>s,applyPreferences:p=>{Object.assign(s,p);preferences();persist();},toggleSettings:()=>pause(!paused),closeTop:()=>{if($('#settings').open){pause(false);return true;}return false;},unlock,pixel:true});

const restartChapter=document.createElement('button');restartChapter.type='button';restartChapter.textContent='重新开始本章';restartChapter.onclick=()=>{storage.removeItem(saveKey);storage.removeItem(saveKey+'.scene');location.reload();};document.querySelector('#settings').append(restartChapter);
