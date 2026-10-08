import {consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {sceneCheckpoint,restartButton} from '../ui/scene-checkpoint.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {Voyage} from '../voyage/game.js';
import {script,people,sourceNote} from './content.js';
import {initial,current,read,save,advance,interact} from './state.js';
import {DepartureAudio} from './audio.js';
import {RoutePlan} from './route.js';
import {point} from '../interaction-marks.js';
const $=id=>document.getElementById(id),play=$('play');
let store;try{store=localStorage;}catch{store={getItem:()=>null,setItem:()=>{throw Error('storage unavailable');}};}
const params=new URLSearchParams(location.search),preview=['chapter3','voyage','malta','alexandria'].includes(params.get('preview'))?params.get('preview'):null;
const bridge=params.get('integrated')==='1'&&window.parent!==window?window.parent.__reliquiaChapter:null;
let parentState=bridge?.saved;
if(bridge)store={getItem:k=>k.endsWith('settings.v1')?JSON.stringify(bridge.settings):JSON.stringify(parentState?.departureState||{node:'paris-bridge'}),setItem:(_k,v)=>{parentState={...parentState,phase:'departure',departureState:JSON.parse(v)};bridge.save(parentState);}};
if(preview){const base=store,prefix='reliquia.chapter3.'+preview+'.';store={getItem:k=>base.getItem(prefix+k),setItem:(k,v)=>base.setItem(prefix+k,v)};}
const checkpointFresh=params.has('fresh')||params.has('restart');
const PREF='reliquia.departure-preview.settings.v1';let pref={volume:.48,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};try{Object.assign(pref,JSON.parse(store.getItem(PREF)));}catch{}
Object.assign(pref,readPreferences(pref));
let s=read(store);if(params.get('from')==='chapter2'&&s.node==='cooling')s={...s,node:'paris-bridge'};if(preview&&s.node==='cooling')s={...initial(),node:preview==='chapter3'?'farewell':'harbor',departed:preview==='voyage'};
if(preview&&params.has('fresh')){s={...initial(),node:preview==='chapter3'?'farewell':'harbor'};save(store,s);params.delete('fresh');history.replaceState(null,'',location.pathname+'?'+params);}
if(preview==='malta'&&(!s.voyage||s.voyage.scene==='title')){s={...s,node:'harbor',voyage:{scene:'sailing',x:500,checked:true,completed:false}};save(store,s);}
if(preview==='alexandria'&&s.voyage?.scene!=='alexandria'){s={...s,node:'harbor',voyage:{scene:'alexandria',maltaAsked:['wall','scholar','books','journey'],scholarUnlocked:true,maltaComplete:true,items:[]}};}
let ready=false,paused=false,tr=null,last=0,hold=0;
if(new URLSearchParams(location.search).has('restart')){s=initial();save(store,s);history.replaceState(null,'',location.pathname);}
const sound=new DepartureAudio(pref);
if(bridge?.context){sound.ctx=bridge.context;sound.sharedContext=true;sound.master=sound.ctx.createGain();sound.master.connect(sound.ctx.destination);sound.update();}
let checkpoint;
const voyage=new Voyage($('voyage'),{sound,prefs:pref,saved:s.voyage,onSave:value=>{s={...s,voyage:value};checkpoint?.capture(s);return save(store,s);},onMenu:()=>menu()});
window.reliquiaChapterPause=on=>pause(on);window.reliquiaLeaveChapter=()=>sound.stop();window.reliquiaEnterChapter=()=>{void unlock();};
const routePlan=new RoutePlan({step:s.routeStep,save:step=>{s={...s,routeStep:step};save(store,s);},finish:()=>commit(interact(s,'unfold')),reduced:()=>pref.reduced});
const bg={door:'./assets/adelia/door.webp',dinner:'./assets/departure/dinner-facing-aunt.webp',dinnerTear:'./assets/departure/dinner-aunt-tear.webp',salon:'./assets/departure/private-room.webp',guide:'./assets/departure/paper-no-pen.webp',exit:'./assets/departure/farewell-room.webp',harbor:'./assets/voyage/harbor.webp'};
const labels={paris:'想象中的巴黎',jerusalem:'想象中的耶路撒冷',alexandria:'想象中的亚历山德里亚'};
function preference(){document.body.classList.toggle('reduced',pref.reduced);sound.update();updateSoundButton($('mute'),pref.muted||pref.volume===0,{shortcut:'M'});$('volume').value=pref.volume;try{if(bridge)bridge.preferences(pref);else store.setItem(PREF,JSON.stringify(pref));}catch{}voyage.ui();}
function music(){const n=current(s);if(n.scene==='harbor'){voyage.music();sound.sea(false);return;}if(!tr){sound.request(['dinner','salon','guide','exit'].includes(n.scene)?'auntHome':null,1.8);sound.sea(n.scene==='harbor');}}
function busy(){const lock=!ready||paused||!!tr||hold>0,n=current(s);$('dialogue').disabled=lock||!!n.action||!!n.end;$('unfold').disabled=$('leave').disabled=lock;$('advance').hidden=lock;}
function render(){checkpoint?.capture(s);const n=current(s);play.dataset.scene=n.scene;delete play.dataset.dream;if(n.dream)play.dataset.dream=n.dream;
 $('backdrop').src=n.scene==='dinner'&&n.tear?bg.dinnerTear:bg[n.scene]||bg.dinner;$('backdrop').alt={door:'深夜，特奥多里科站在关闭的门前，阿德里娅在楼上',dinner:'姨姨家的烛光饭厅',salon:'姨姨家，宗教画像与烛光环绕',guide:'出发前的行程',exit:'通往外面的门',harbor:'像素画风的里斯本港，一艘轮船等待启航'}[n.scene]||'';
 $('dialogue').hidden=!!n.action||!!n.end;$('speaker').textContent=people[n.person]||'';$('line').textContent=n.text;$('dialogue').setAttribute('aria-label',n.scene==='black'?'阅读后继续':'继续对话');
 $('portrait').hidden=!n.person;$('portrait-art').dataset.person=n.person||'';$('portrait-art').classList.toggle('tear',!!n.tear);
 $('dream').hidden=!n.dream;$('dream-art').dataset.place=n.dream||'';$('dream-label').textContent=labels[n.dream]||'';
 $('time').hidden=!n.time;$('time').textContent=n.time||'';
 $('route').hidden=n.scene!=='guide'||!!n.dream;routePlan.sync(s.routeStep);$('unfold').hidden=n.action!=='unfold';$('leave').hidden=true;
 voyage.setActive(n.scene==='harbor');$('teo-scene').style.filter=n.tear?'brightness(.55)':'drop-shadow(5px 6px 5px #0007)';
 if(n.action==='leave')$('leave').focus({preventScroll:true});if(n.action==='unfold')$('unfold').focus({preventScroll:true});
 busy();music();}
function commit(next){s=next;save(store,s);render();if(current(s).action==='leave')action('leave');}
function startTransition(name,duration,done){if(tr)return;tr={name,duration,elapsed:0,done,sea:false,horn:false};busy();}
async function unlock(){await sound.unlock();if(sound.ctx&&current(s).scene==='exit')void sound.buffer('voyageTitle').catch(()=>{});if(!tr)music();}
function next(){if(!ready||paused||tr||hold>0)return;void unlock();const n=current(s);if(n.end)return;if(n.action){action(n.action);return;}const target=advance(s);const old=n.scene,newNode=current(target);if(newNode.tear)hold=pref.reduced?0:1600;if(newNode.scene!==old){play.classList.add('fading');startTransition('scene',pref.reduced?200:850,()=>{commit(target);play.classList.remove('fading');});}else commit(target);}
function action(kind){if(!ready||paused||tr||hold>0||current(s).action!==kind)return;void unlock();if(kind==='unfold'){
 routePlan.activate();
 }else{
 $('leave').hidden=true;play.classList.add('fading');sound.request(null,3.2);startTransition('departure',6500,()=>{commit(interact(s,'leave'));play.classList.remove('closing','fading');});
 }}
function pause(on){paused=on;voyage.pause(on);document.body.classList.toggle('paused',on);sound.pause(on);busy();}
function menu(){pause(true);$('settings').showModal();}
function reset(){checkpoint?.clear();tr=null;hold=0;play.classList.remove('fading','closing');sound.sea(false);voyage.reset();if(preview==='malta')voyage.s={...voyage.s,scene:'sailing',x:500,checked:true,completed:false};commit(preview?{...initial(),node:preview==='chapter3'?'farewell':'harbor'}:initial());if(preview==='alexandria'){voyage.s={...voyage.s,scene:'alexandria',maltaAsked:['wall','scholar','books','journey'],scholarUnlocked:true,maltaComplete:true,items:[]};void voyage.alex.enter();}}
$('dialogue').addEventListener('click',next);$('unfold').innerHTML=point();$('leave').innerHTML=point();$('unfold').addEventListener('click',()=>action('unfold'));$('leave').addEventListener('click',()=>action('leave'));$('menu').addEventListener('click',menu);$('settings').addEventListener('close',()=>pause(document.hidden));$('restart').addEventListener('click',()=>{reset();$('settings').close();});$('mute').addEventListener('click',()=>{const silent=pref.muted||pref.volume===0;pref.muted=!silent;if(silent&&pref.volume===0)pref.volume=.48;preference();void unlock();});$('volume').addEventListener('input',e=>{pref.volume=+e.target.value;if(pref.volume>0)pref.muted=false;preference();void unlock();});$('source-note').textContent='依据IN-CM 2021版改编；部分对白与衔接为原创。';
document.addEventListener('pointerdown',()=>{if(!paused)void unlock();},{capture:true});document.addEventListener('keydown',e=>{if(current(s).scene==='harbor'&&!paused)return;if(e.key==='Escape'){if(!$('settings').open){e.preventDefault();menu();}return;}if(paused||e.target.matches('input,summary'))return;void unlock();if(e.code==='Enter'&&e.target.closest('#dialogue,.dialogue-corner-nav')){e.preventDefault();return;}if(e.code==='Space'&&!e.target.closest('button')){e.preventDefault();if(!e.repeat)next();}});
document.addEventListener('visibilitychange',()=>pause(document.hidden||$('settings').open));window.addEventListener('pagehide',()=>sound.stop());window.addEventListener('pageshow',()=>{if(!document.hidden){pause($('settings').open);music();}});
let padHeld=false;function frame(now){const dt=last?Math.min(90,now-last):0;last=now;if(!paused){if(ready)voyage.tick(dt);if(current(s).scene==='guide')routePlan.tick(dt);if(hold>0){hold=Math.max(0,hold-dt);busy();}if(tr){const t=tr;t.elapsed+=dt;if(t.name==='departure'){if(t.elapsed>3300&&!t.sea){t.sea=true;sound.request('voyageTitle',3);}if(t.elapsed>2100)play.classList.add('fading');}if(t.elapsed>=t.duration){tr=null;t.done();busy();}}}
 const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean),pressed=!!pad?.buttons[0]?.pressed;if(pressed&&!padHeld){if(current(s).end&&!paused){if(voyage.s.scene==='title')voyage.start();else if(voyage.dialogue)voyage.next();else voyage.interact();}else next();}padHeld=pressed;requestAnimationFrame(frame);}
window.departureStatus=()=>({state:{...s},node:current(s).key,scene:current(s).scene,person:current(s).person,dream:current(s).dream||null,transition:tr?.name||null,ready,paused,hold,routeAnimating:routePlan.animating,music:sound.desired,playing:sound.current?.name||null,sea:!!sound.ocean,audioContext:sound.ctx?.state||'not-started',errors:[...sound.errors],voyage:voyage.status(),audioVoices:sound.voices.size});
preference();render();requestAnimationFrame(frame);
const needed=[...new Set([...Object.values(bg),'./assets/departure/mediterranean-1870.webp','./assets/departure/dreams.webp','./assets/departure/aunt-tear.webp','./assets/dinner/teo-watch.webp','./assets/boss/aunt.webp'])];
Promise.all([voyage.loading,...needed.map(url=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>image.decode().then(resolve,reject);image.onerror=reject;image.src=url;}))]).then(()=>{ready=true;bridge?.ready();$('loading').hidden=true;busy();if(current(s).action==='leave')action('leave');}).catch(()=>{$('loading').textContent='画面未能载入，请刷新重试。';});

// Utility shortcuts remain available in every third-chapter scene and modal.

checkpoint=sceneCheckpoint(localStorage,'reliquia.departure.scene.'+location.search,s=>s.node==='harbor'?'voyage:'+s.voyage?.scene+':'+(s.voyage?.alexandria?.room||''):current(s).scene);if(checkpointFresh)checkpoint.clear();checkpoint.capture(s);restartButton($('settings'),()=>{const entry=checkpoint.restore();if(!entry)return;s=entry;voyage.s=structuredClone(entry.voyage||voyage.s);save(store,s);location.reload();});

// Shared cross-chapter controls and latest preferences.
installSharedControls({readyForCover:()=>ready&&(current(s).scene!=='harbor'||voyage.ready&&(voyage.s.scene!=='alexandria'||voyage.alex.ready)),audioReady:()=>sound.paused||sound.ctx?.state==='running',soundButton:'#mute',settingsButton:'#menu',bagButton:'[data-v=bag]',getPreferences:()=>pref,applyPreferences:p=>{Object.assign(pref,p);preference();},toggleSettings:()=>{$('settings').open?$('settings').close():menu();},closeTop:()=>{if($('settings').open){$('settings').close();return true;}return false;},unlock,pixel:()=>current(s).scene==='harbor'});
