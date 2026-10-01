import {chapterEntryURL,consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {sceneCheckpoint,restartButton} from '../ui/scene-checkpoint.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {rememberChapter} from '../ui/mainline.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {scenes} from './content.js';
import {SAVE_KEY,initial,normalize,current,resolve,key,completed,ready,begin,advance,enter} from './state.js';
import {ChapterSound} from './sound.js';
import {actions,lineActions,lineSounds,journeys} from './actions.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),preview=params.has('preview'),saveKey=SAVE_KEY+(preview?'.preview':'');
let saved=null;try{saved=JSON.parse(localStorage.getItem(saveKey));}catch{}
if(preview&&params.has('fresh')){saved=null;params.delete('fresh');history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}
let s=normalize(saved,params.get('from')==='camp'),started=false,paused=false,loading=true,menu=false,idle=0,last=performance.now(),poseTime=0,poseToken=0,loadToken=0,poseElapsed=0,activeAction=null,cueKey='',transition=null,reviewLine=null,reviewGroup='';
if(params.get('from')==='camp'){try{const k='reliquia.chapter4.handoff'+(preview?'.preview':'');const prefs=JSON.parse(sessionStorage.getItem(k));if(prefs){s=normalize({...s,...prefs});sessionStorage.removeItem(k);}}catch{}}
if(saved?.index>=scenes.length){s.finished=true;s.phase='finished';s.dialogue=null;}
Object.assign(s,readPreferences(s));
const checkpoint=sceneCheckpoint(localStorage,saveKey+'.scene',s=>s.index);
const sound=new ChapterSound(),poseCache=new Map();sound.setVolume(s.volume);sound.setMuted(s.muted);
const reduceQuery=matchMedia('(prefers-reduced-motion: reduce)');
function persist(){if(!preview)rememberChapter(s.finished?'morning':'dream');try{localStorage.setItem(saveKey,JSON.stringify(s));}catch{}}
function resetIdle(){idle=0;document.querySelectorAll('.hint').forEach(x=>x.classList.remove('hint'));}
function position(el,box){const[x,y,w,h]=box;Object.assign(el.style,{left:x*100+'%',top:y*100+'%',width:w*100+'%',height:h*100+'%'});}
function poseImage(id){const a=actions[id];if(!a)return null;let img=poseCache.get(a.asset);if(!img){img=new Image();img.src='./assets/chapter4/pose-'+a.asset+'.webp';poseCache.set(a.asset,img);}return img;}
function showPose(id){const action=actions[id];if(!action)return;if(s.reduced||reduceQuery.matches){if(action.sfx)sound.effect(action.sfx);return;}const token=++poseToken,img=poseImage(id);img.decode().then(()=>{if(token!==poseToken||loading)return;const[x,y,w,h]=action.box,p=$('pose');p.src=img.src;p.dataset.action=id;p.style.clipPath=action.clip||`inset(${y*100}% ${(1-x-w)*100}% ${(1-y-h)*100}% ${x*100}%)`;p.hidden=false;requestAnimationFrame(()=>p.classList.add('show'));poseTime=action.hold||2.6;poseElapsed=0;activeAction={...action,fired:false};if(action.sfx&&!action.sfxAt){sound.effect(action.sfx);activeAction.fired=true;}}).catch(()=>{});}
function clearPose(){poseToken++;poseTime=0;activeAction=null;$('pose').classList.remove('show');$('pose').hidden=true;delete $('pose').dataset.action;}
function syncCue(row){if(!started||loading||cueKey===row.id)return;cueKey=row.id;clearPose();if(lineActions[row.id])showPose(lineActions[row.id]);if(lineSounds[row.id])sound.effect(lineSounds[row.id]);}
function render(){const c=current(s);$('place').textContent=c.title;document.body.classList.toggle('reduced',s.reduced||reduceQuery.matches);updateSoundButton($('sound'),s.muted);$('volume').value=s.volume*100;$('reduce').checked=s.reduced;
 const d=s.dialogue,g=resolve(s);$('dialogue').hidden=!d||loading;$('rest').hidden=!!d||loading;
 if(d&&g){const group=s.index+':'+d.kind+':'+d.id;if(reviewGroup!==group){reviewGroup=group;reviewLine=null;}const row=g.rows[reviewLine??d.line],speaker=$('speaker');if(reviewLine===null)syncCue(row);$('previous').disabled=(reviewLine??d.line)===0;speaker.replaceChildren();if(row.who){speaker.append(document.createTextNode(row.who));if(row.mode==='thought'){const em=document.createElement('em');em.textContent='心声';speaker.append(em);}}$('words').textContent=row.text;$('next').textContent='›';}
 $('tutorial').hidden=s.tutorialSeen||s.phase!=='explore'||s.index!==0;$('ended').hidden=!s.finished;
 $('hotspots').replaceChildren();for(const h of [...c.stories,{id:'guide',name:'托普修斯',box:c.guide}]){const el=document.createElement('button');el.className='hotspot';el.dataset.id=h.id;el.setAttribute('aria-label',h.name);position(el,h.box);el.style.setProperty('--pulse-delay',(-$('hotspots').children.length*.31)+'s');const unlocked=h.id==='guide'||ready(s,h);el.disabled=!!d||loading||!started||paused||!unlocked;const unread=h.id==='guide'?c.topics.some(q=>!s.read[key(s,q.id)]):!completed(s,h.id);const guideReady=h.id!=='guide'||c.stories.flatMap(x=>x.requires||[]).every(id=>completed(s,id));el.classList.toggle('pending',unread&&unlocked&&guideReady);el.onclick=()=>interact(h);$('hotspots').append(el);}
 $('topics').hidden=!menu||!!d||paused; if(menu&&!d){$('questions').replaceChildren();for(const q of c.topics){const b=document.createElement('button');b.dataset.topic=q.id;const title=document.createElement('span');title.textContent=q.title;b.append(title);if(s.read[key(s,q.id)]){const check=document.createElement('b');check.textContent='✓';check.setAttribute('aria-label','已看过');b.append(check);}b.onclick=()=>{cueKey='';begin(s,'topic',q.id);resetIdle();persist();render();};$('questions').append(b);}}
}
function interact(h){if(s.dialogue||paused||loading||h.id!=='guide'&&!ready(s,h))return;reviewLine=null;resetIdle();cueKey='';s.tutorialSeen=true;if(h.id==='guide'){menu=true;showPose(current(s).guidePose);}else{begin(s,'story',h.id);if(h.sfx&&s.dialogue?.kind==='story')sound.effect(h.sfx);}persist();render();}
function next(){if(transition){journeyNext(true);return;}if(!started||paused||loading||!s.dialogue)return;resetIdle();if(reviewLine!==null){reviewLine++;if(reviewLine>=s.dialogue.line)reviewLine=null;render();return;}const result=advance(s);persist();if(result==='travel'){void travel();return;}if(result==='menu')menu=true;else menu=false;render();}
function closeDialogue(){if(!s.dialogue||!['story','topic','waiting'].includes(s.dialogue.kind))return;menu=s.dialogue.kind==='topic';s.dialogue=null;reviewLine=null;cueKey='';clearPose();resetIdle();persist();render();}
async function loadScene(index,change=false,underBlack=false){transition=null;loading=true;cueKey='';clearPose();const token=++loadToken,c=scenes[index];$('load').hidden=underBlack;$('load').textContent='正在展开画卷……';render();const img=new Image();img.src='./assets/chapter4-art-v01/'+c.image+'.webp';try{await img.decode();if(token!==loadToken)return;if(change)enter(s,index);$('painting').src=img.src;$('painting').alt=c.title;loading=false;if(change)s.travelLine=0;document.body.classList.remove('travelling');$('load').hidden=true;$('shade').classList.remove('dark');sound.setScene(c.sound);checkpoint.capture(s);persist();render();for(const [row,id]of Object.entries(lineActions))if(row.startsWith('C4-'+c.id+'-'))poseImage(id);if(started&&s.dialogue?.kind==='intro')showPose(c.guidePose);
 // Only preload the next tableau, never the whole chapter.
 if(scenes[index+1]){const n=new Image();n.src='./assets/chapter4-art-v01/'+scenes[index+1].image+'.webp';}
 }catch{if(token!==loadToken)return;$('load').hidden=false;$('load').replaceChildren(document.createTextNode('画面未能载入，请重试。'));const retry=document.createElement('button');retry.textContent='重新载入';retry.onclick=()=>void loadScene(index,change);$('load').append(retry);}}
let handedOff=false;
function finishChapter(){
 if(handedOff)return;handedOff=true;transition=null;
 s.finished=true;s.phase='finished';persist();
 const suffix=preview?'.preview':'';
 sessionStorage.setItem('reliquia.chapter5.handoff'+suffix,JSON.stringify({volume:s.volume,muted:s.muted,reduced:s.reduced}));
 location.href=chapterEntryURL('./chapter5.html?from=dream'+(preview?'&preview=1':''));
}
function journeyRender(){const tr=transition;if(!tr)return;$('journey').hidden=tr.elapsed<.65||tr.waking;$('journey-words').textContent=(current(s).travel||[]).map(row=>row.who?row.who+'：“'+row.text+'”':row.text).join('\n\n');}
function journeyNext(manual=false){if(!transition||paused||transition.waking||transition.advancing||transition.elapsed<(manual ? 0.65 : transition.minimum))return;transition.advancing=true;if(transition.target===scenes.length){transition.waking=true;transition.elapsed=0;$('journey').hidden=true;sound.wakeMorning();}else{const target=transition.target;$('journey').hidden=true;void loadScene(target,true,true);}}
function travel(){loading=true;menu=false;clearPose();const journey=journeys[current(s).id]||{sound:'steps',black:1.9},length=(current(s).travel||[]).reduce((n,r)=>n+r.text.length,0);transition={target:s.index+1,elapsed:0,played:false,...journey,minimum:Math.max(2.8,1.5+length/9)};$('shade').classList.add('dark');document.body.classList.add('travelling');sound.fadeForTravel();render();journeyRender();}
$('journey').onclick=()=>journeyNext(true);
function previous(){if(!started||paused||loading||!s.dialogue)return;const line=reviewLine??s.dialogue.line;if(line>0){reviewLine=line-1;render();}}
$('previous').onclick=e=>{e.stopPropagation();previous();};
function setPause(v){paused=v;$('settings').hidden=!v;$('restartConfirm').hidden=true;sound.pause(v||document.hidden||!started);resetIdle();render();}
$('start').onclick=async()=>{if(started)return;started=true;$('gate').hidden=true;try{await sound.unlock();}catch{}if(saved?.index>=scenes.length||s.finished){finishChapter();return;}if(s.phase==='travel')travel();render();if(s.dialogue?.kind==='intro')showPose(current(s).guidePose);};
$('dialogue').onclick=()=>next();
$('back').onclick=()=>{menu=false;resetIdle();render();};$('pause').onclick=()=>setPause(true);$('resume').onclick=()=>setPause(false);
$('sound').onclick=async()=>{if(!started)return;s.muted=!s.muted;sound.setMuted(s.muted);await sound.unlock();persist();render();};
$('volume').oninput=e=>{s.volume=Number(e.target.value)/100;sound.setVolume(s.volume);persist();};$('reduce').onchange=e=>{s.reduced=e.target.checked;clearPose();persist();render();};
$('restart').onclick=()=>{$('restartConfirm').hidden=false;};$('cancelRestart').onclick=()=>{$('restartConfirm').hidden=true;};$('confirmRestart').onclick=()=>{const settings={volume:s.volume,muted:s.muted,reduced:s.reduced};checkpoint.clear();s={...initial(),...settings};menu=false;setPause(false);persist();void loadScene(0);};
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input'))return;if(transition&&e.code==='Space'){e.preventDefault();if(!e.repeat)journeyNext(true);return;}if(e.code==='KeyA'){e.preventDefault();previous();return;}if(e.code==='KeyD'||e.code==='Space'||e.code==='Enter'){if(e.code!=='KeyD'&&e.target.closest('button'))return;e.preventDefault();next();}if(e.code==='Escape'){if(paused)setPause(false);else if(menu){if(s.dialogue)closeDialogue();else{menu=false;render();}}else if(s.dialogue&&['story','topic','waiting'].includes(s.dialogue.kind))closeDialogue();else setPause(true);}});
window.addEventListener('pointerdown',()=>{resetIdle();if(started&&!paused)void sound.unlock();},{passive:true});
document.addEventListener('visibilitychange',()=>{sound.pause(paused||document.hidden||!started);last=performance.now();});window.addEventListener('pagehide',()=>{persist();sound.stop();});
function tick(now){const dt=Math.min(.1,(now-last)/1000);last=now;
 if(started&&!paused&&!document.hidden){
  if(transition){transition.elapsed+=dt;if(transition.waking){sound.tick(dt);if(transition.elapsed>=6)finishChapter();}else {if(!transition.played&&transition.elapsed>=.65){transition.played=true;sound.travel(transition.sound);}journeyRender();if(transition.elapsed>=transition.minimum)journeyNext();}}
  else if(!loading){idle+=dt;sound.tick(dt);if(poseTime>0){poseElapsed+=dt;if(activeAction?.sfx&&!activeAction.fired&&poseElapsed>=(activeAction.sfxAt||0)){sound.effect(activeAction.sfx);activeAction.fired=true;}poseTime-=dt;if(poseTime<=0)$('pose').classList.remove('show');}if(idle>7&&!menu&&s.dialogue)$('next').classList.add('hint');}
 }requestAnimationFrame(tick);
}requestAnimationFrame(tick);
// Read-only diagnostics used by local acceptance tests.
window.chapter4={snapshot:()=>JSON.parse(JSON.stringify(s)),sound:()=>sound.status(),scene:()=>current(s).id,transition:()=>transition?{...transition}:null};
void loadScene(s.index).then(()=>{if(params.get('from')==='camp')$('start').click();else if(started&&s.phase==='travel')travel();});render();
document.addEventListener('pointerdown',()=>{if(started&&!paused)void sound.unlock().catch(()=>{});});

// Shared cross-chapter controls and latest preferences.
installSharedControls({soundButton:'#sound',settingsButton:'#pause',settingsPanel:'#settings section',getPreferences:()=>s,applyPreferences:p=>{Object.assign(s,p);sound.setVolume(p.volume);sound.setMuted(p.muted);persist();render();},toggleSettings:()=>setPause(!paused),closeTop:()=>{if(paused){setPause(false);return true;}return false;},unlock:()=>started?sound.unlock():undefined});

restartButton($('settings').querySelector('section'),async()=>{const entry=checkpoint.restore();if(!entry)return;const prefs=readPreferences(s);s=normalize({...entry,...prefs});menu=false;reviewLine=null;reviewGroup='';setPause(false);persist();await loadScene(s.index);});
