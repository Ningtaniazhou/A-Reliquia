import {cardFlight} from '../ui/card-flight.js';
import {chapterEntryURL} from '../ui/chapter-entry.js';
import {installCardControls} from '../ui/card-controls.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {sceneCheckpoint,restartButton} from '../ui/scene-checkpoint.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {current as romanceCurrent,begin as romanceBegin,advance as romanceAdvance,choose as romanceChoose} from '../adelia/flow.js';
import {sourceNote as romanceSource} from '../adelia/content.js';
import {rounds,intro,sourceNote,sceneLines} from './content.js';
import {initial,answer,afterResponse,retry,load,save,PREFS,KEY} from './state.js';
import {icons} from './icons.js';
import {point} from '../interaction-marks.js';
import {BossAudio} from './audio.js';
const $=id=>document.getElementById(id),game=$('game');
$('reopen').innerHTML=point();$('door').innerHTML=point();
const integrated=new URLSearchParams(location.search).get('integrated')==='1'&&window.parent!==window;
const bridge=integrated?window.parent.__reliquiaChapter:null;
let entryActive=!bridge;
if(bridge)document.body.classList.add('book-staged');
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
const romancePreview=new URLSearchParams(location.search).get('scene')==='adelia',saveKey=romancePreview?KEY+'.adelia-preview':new URLSearchParams(location.search).has('preview')?KEY+'.chapter2-preview':KEY;
if(bridge)storage={getItem:()=>bridge.saved?JSON.stringify(bridge.saved):null,setItem:(_k,v)=>bridge.save(JSON.parse(v))};
let s=load(storage,saveKey);if(romancePreview&&s.phase==='intro')s=romanceBegin(s);
if(s.phase==='departure')location.replace('./departure.html'+(bridge?'?integrated=1':(romancePreview||new URLSearchParams(location.search).has('preview'))?'?preview=chapter3&from=chapter2':''));
let checkpoint;
let selected=null,tr=null,ready=false,paused=false,last=0,pausedAnimations=[];
let pref={volume:.42,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
try{Object.assign(pref,bridge?bridge.settings:JSON.parse(storage.getItem(PREFS))||{});}catch{}
pref.volume=Number.isFinite(Number(pref.volume))?Math.max(0,Math.min(1,Number(pref.volume))):.42;
Object.assign(pref,readPreferences(pref));
const sound=new BossAudio(pref),clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
const asset=(n,old=false)=>n==='aunt-walk'?'./assets/boss/aunt-walk-v2.webp':`./assets/${old?'dinner':'boss'}/${n}.webp`;
function setImage(el,src){if(el.getAttribute('src')!==src)el.src=src;}
function settings(){document.body.classList.toggle('reduced',pref.reduced);updateSoundButton($('mute'),pref.muted||pref.volume===0);$('volume').value=pref.volume;sound.update();try{if(bridge)bridge.preferences(pref);else storage.setItem(PREFS,JSON.stringify(pref));}catch{}}
function text(speaker,line){$('speaker').textContent=speaker;$('line').textContent=line;}
function music(){if(!entryActive)return;if(['intro','restored','closed','dressed'].includes(s.phase))sound.request('auntHome');else if(['battle','response'].includes(s.phase)){sound.request('auntBattle');}else if(['feast','end'].includes(s.phase)&&['supper','memory'].includes(romanceCurrent(s).scene))sound.request('adelia');else sound.request(null,1.6);}
function syncBusy(){const busy=!!tr||!ready||paused||!entryActive,romanceChoice=s.phase==='feast'&&!!romanceCurrent(s).choices;game.dataset.busy=String(busy);$('dialogue').disabled=busy||romanceChoice||['battle','closed','dressed','fail'].includes(s.phase);$('advance').hidden=busy||romanceChoice||['battle','closed','dressed','fail'].includes(s.phase);$('reopen').disabled=busy;$('door').disabled=busy;for(const b of [...$('cards').children,...$('romance-choices').children])b.disabled=busy;}
function paintCards(){const el=$('cards');el.replaceChildren();for(const [i,c] of rounds[s.round].cards.entries()){const b=document.createElement('button');b.type='button';b.className='card relic-card';b.dataset.card=c.id;b.style.setProperty('--index',i);b.setAttribute('aria-label',c.title+'：'+c.text);b.setAttribute('aria-pressed','false');const icon=document.createElement('img');const tile=3+s.round*3+i;icon.src='./assets/chapter6/card-'+String(tile).padStart(2,'0')+'.webp';icon.alt='';icon.setAttribute('aria-hidden','true');const h=document.createElement('h3'),p=document.createElement('p');h.textContent=c.title;p.textContent=c.text;b.append(icon,h,p);b.addEventListener('click',()=>pick(c.id,true));el.append(b);}}
function render(){checkpoint?.capture(s);
 game.dataset.phase=s.phase;game.classList.remove('reaction-good','reaction-bad');
 for(const [key,val] of Object.entries({growth:['battle','response','fail'].includes(s.phase)?1.65:1,curtain:s.phase==='closed'?1:0,walk:0,fade:1,escape:0,night:['closed','dressed'].includes(s.phase)?1:0}))game.style.setProperty('--'+key,val);
 const outdoors=['street','feast','end'].includes(s.phase);game.classList.toggle('outdoor',outdoors);
 $('romance-choices').hidden=true;$('scene-time').hidden=true;game.dataset.romanceScene='';
 $('boss-hud').hidden=!['battle','response','fail'].includes(s.phase);
 const suspicion=4-s.round-(s.phase==='response'&&s.success?1:0);$('suspicion').setAttribute('aria-valuenow',String(suspicion));[...$('suspicion').children].forEach((el,i)=>el.classList.toggle('spent',i>=suspicion));
 $('aunt-holder').hidden=['closed','dressed'].includes(s.phase);setImage($('aunt'),asset(s.phase==='response'?'aunt-kind':s.phase==='fail'?'aunt-angry':'aunt')); 
 $('teo-holder').className='teo-holder'+(['closed','dressed'].includes(s.phase)?' night':'');
 setImage($('teo'),['closed','dressed'].includes(s.phase)?asset('teo-night'):asset('teo-pious',true));
 $('teo').alt=['closed','dressed'].includes(s.phase)?'特奥多里科换上黑色礼服，白领结和白马甲，手里拿着白手套':'特奥多里科收起肩膀，双手捧着硬面包';
 $('reopen').hidden=s.phase!=='closed';$('door').hidden=s.phase!=='dressed';$('curtains').setAttribute('aria-hidden',String(s.phase!=='closed'));
 $('cards').hidden=s.phase!=='battle';$('failure').hidden=s.phase!=='fail';$('dialogue').hidden=['closed','dressed','fail'].includes(s.phase);
 if(s.phase==='intro')text(intro[s.step].speaker,intro[s.step].text);
 if(s.phase==='battle'){text('姨姨',rounds[s.round].question);paintCards();}
 if(s.phase==='response'){text('姨姨',rounds[s.round].success);game.classList.add('reaction-good');}
 if(s.phase==='fail'){$('failure-line').textContent=rounds[s.round].failure;game.classList.add('reaction-bad');}
 if(s.phase==='restored')say(sceneLines.restored);
 if(s.phase==='street'){setImage($('outside'),asset('street',true));$('outside').alt='舞台之外，夜色中的里斯本';say(sceneLines.street);}
 if(['feast','end'].includes(s.phase)){
  const n=romanceCurrent(s);game.dataset.romanceScene=n.scene;
  setImage($('outside'),n.scene==='door'?'./assets/adelia/door.webp':n.scene==='street'?asset('street',true):asset('feast',true));
  $('outside').alt=n.scene==='door'?'深夜，特奥多里科被挡在阿德里亚的门外':'特奥多里科回忆与阿德里亚的相处';say(n);
  $('scene-time').hidden=!n.time;$('scene-time').textContent=n.time||'';
  const choices=$('romance-choices');choices.replaceChildren();choices.hidden=!n.choices;
  for(const c of n.choices||[]){const btn=document.createElement('button');btn.type='button';btn.textContent=c.text;btn.addEventListener('click',()=>{if(tr||paused||!ready)return;void activateSound();sound.pick();commit(romanceChoose(s,c.id));});choices.append(btn);}
 }
 $('dialogue').setAttribute('aria-label',s.phase==='end'?'继续前往朝圣旅程':game.dataset.romanceScene==='narration'?'阅读旁白后继续':'继续对话');$('advance').textContent='◆';
 syncBusy();music();
}
function say(entry){text(entry.speaker,entry.text);}
function commit(next){s=next;selected=null;tr=null;save(storage,s,saveKey);render();}
function transition(name,duration,done){if(tr||paused||!ready)return;tr={name,duration,elapsed:0,done};game.dataset.phase=name;syncBusy();
 if(name==='awaken'){sound.request('auntBattle');$('boss-hud').hidden=false;$('boss-hud').style.opacity='0';}
 if(name==='shrink'){sound.request('auntHome');$('cards').hidden=true;}
 if(name==='depart'){setImage($('aunt'),asset('aunt-walk',true));$('aunt-holder').hidden=false;$('dialogue').hidden=true;sound.step();}
 if(['close','open'].includes(name)){sound.cloth();$('reopen').hidden=true;$('dialogue').hidden=true;}
 if(name==='escape'){sound.request(null,2.4);sound.door();$('door').hidden=true;}
}
function deal(){transition('deal',1100,()=>{tr=null;for(const card of $('cards').children)card.style.animation='none';game.dataset.phase='battle';syncBusy();});}
async function activateSound(){if(!entryActive)return;
 if(bridge?.context&&!sound.ctx){sound.ctx=bridge.context;sound.sharedContext=true;sound.master=sound.ctx.createGain();sound.master.connect(sound.ctx.destination);sound.update();}
 await sound.unlock();void sound.warm();}
window.reliquiaEnterChapter=()=>{if(!bridge||entryActive||!ready)return;entryActive=true;document.body.classList.remove('book-staged');document.body.classList.add('chapter-arrived');void activateSound().then(()=>{music();sound.clink();});render();$('dialogue').focus({preventScroll:true});};
window.reliquiaLeaveChapter=()=>sound.stop();
window.reliquiaChapterPause=on=>{if(entryActive)pause(on);};
function pick(id,fire=false){if(paused||tr||!ready||s.phase!=='battle')return;void activateSound();selected=id;sound.pick();for(const b of $('cards').children){const on=b.dataset.card===id;b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));}if(fire)cast();}
function cast(){if(!selected||tr||paused||s.phase!=='battle')return;const result=answer(s,selected),el=$('cards').querySelector(`[data-card="${selected}"]`),card=rounds[s.round].cards.find(c=>c.id===selected);text('特奥多里科',card.text.replaceAll('\n',''));
 const flight=cardFlight(el,$('aunt'),sound,result.success);for(const b of $('cards').children)b.classList.add('others');
 transition('throw',3050,()=>{flight.destroy();if(result.success){commit(result);}else{commit({...result,phase:'fail'});$('retry-battle').focus();}});tr.flight=flight;

}
function act(){if(!ready||paused||tr||!entryActive)return;void activateSound();
 if(s.phase==='intro'){if(s.step<3){if(s.step===0)sound.clink();return commit({...s,step:s.step+1});}return transition('awaken',3200,()=>{commit({...s,phase:'battle',round:0,chosen:null,success:false});deal();});}
 if(s.phase==='battle'){if(selected)cast();else{pick(rounds[s.round].cards[0].id);$('cards').firstElementChild.focus();}return;}
 if(s.phase==='response'){const next=afterResponse(s);if(next.phase==='restored')return transition('shrink',2300,()=>commit(next));commit(next);deal();return;}
 if(s.phase==='restored')return transition('depart',3000,()=>{tr=null;$('aunt-holder').hidden=true;$('teo-holder').className='teo-holder relaxed';setImage($('teo'),asset('teo-relaxed',true));$('teo').alt='姨姨走后，特奥多里科才松了口气';sound.release();transition('relief',1700,()=>transition('close',1500,()=>{commit({...s,phase:'closed'});$('reopen').focus();}));});
 if(s.phase==='closed')return transition('open',1800,()=>{commit({...s,phase:'dressed'});$('door').focus();});
 if(s.phase==='dressed')return transition('escape',2400,()=>commit({...s,phase:'street'}));
 if(s.phase==='street'){sound.door();return commit(romanceBegin(s));}
 if(s.phase==='feast'){if(romanceCurrent(s).choices){const active=document.activeElement;if(active?.parentElement===$('romance-choices'))active.click();else $('romance-choices').firstElementChild?.focus();return;}const next=romanceAdvance(s);if(next!==s){commit(next);if(s.phase==='end')window.dispatchEvent(new CustomEvent('reliquia:scene-ended',{detail:{scene:'aunt-boss',exit:'adelia-breakup'}}));}return;}
 if(s.phase==='end'){s={...s,phase:'departure',departureState:{node:'paris-bridge'}};save(storage,s,saveKey);sound.stop();location.href=bridge?'./departure.html?integrated=1':chapterEntryURL('./departure.html?from=chapter2'+((romancePreview||new URLSearchParams(location.search).has('preview'))?'&preview=chapter3':''));}
}
function frame(now){const dt=last?Math.min(now-last,90):0;last=now;if(tr&&!paused){const t=tr;t.elapsed+=dt;const duration=pref.reduced&&t.name!=='throw'?Math.min(t.duration,450):t.duration,p=clamp(t.elapsed/duration),q=smooth(p);
 if(t.name==='awaken'){game.style.setProperty('--growth',1+.65*smooth(p/.66));$('boss-hud').style.opacity=String(smooth((p-.3)/.5));}
 if(t.name==='shrink'){game.style.setProperty('--growth',1.65-.65*q);$('boss-hud').style.opacity=String(1-q);}
 if(t.name==='depart'){game.style.setProperty('--walk',q);game.style.setProperty('--fade',1-smooth((p-.78)/.2));if(Math.floor(p*6)!==t.step&&p<.8){t.step=Math.floor(p*6);sound.step();}}
 if(t.name==='close')game.style.setProperty('--curtain',q);
 if(t.name==='open')game.style.setProperty('--curtain',1-q);
 if(t.name==='escape'){game.style.setProperty('--escape',q);if(Math.floor(p*7)!==t.step&&p<.8){t.step=Math.floor(p*7);sound.step();}}
 if(t.name==='throw')t.flight?.update(t.elapsed);
 if(p>=1){const done=t.done;tr=null;done();syncBusy();}}
 pollPad(now);requestAnimationFrame(frame);
}
function pause(on){if(on===paused)return;paused=on;document.body.classList.toggle('paused',on);if(on){pausedAnimations=game.getAnimations({subtree:true}).filter(a=>a.playState==='running');for(const a of pausedAnimations)a.pause();}else{for(const a of pausedAnimations)try{a.play();}catch{}pausedAnimations=[];}sound.pause(on);syncBusy();}
function openMenu(){pause(true);$('settings').showModal();}
function restart(){checkpoint?.clear();tr?.flight?.destroy();tr=null;commit(romancePreview?romanceBegin(initial()):initial());$('boss-hud').style.opacity='1';}
function chooseOffset(delta){if(tr||paused)return;if(s.phase==='feast'&&romanceCurrent(s).choices){const list=[...$('romance-choices').children],at=list.indexOf(document.activeElement);list[(at+delta+list.length)%list.length]?.focus();return;}if(s.phase!=='battle')return;const cards=rounds[s.round].cards;const at=cards.findIndex(c=>c.id===selected);const n=(at<0?(delta>0?0:2):(at+delta+3)%3);pick(cards[n].id);$('cards').children[n].focus();}
$('dialogue').addEventListener('click',act);$('door').addEventListener('click',act);$('reopen').addEventListener('click',act);
$('retry-battle').addEventListener('click',()=>{void activateSound();commit(retry());$('boss-hud').style.opacity='1';sound.request('auntBattle');deal();});
$('menu').addEventListener('click',openMenu);$('settings').addEventListener('close',()=>pause(document.hidden));
$('restart').addEventListener('click',()=>{restart();$('settings').close();});$('mute').addEventListener('click',()=>{const silent=pref.muted||pref.volume===0;pref.muted=!silent;if(silent&&pref.volume===0)pref.volume=.42;settings();void activateSound();});$('volume').addEventListener('input',e=>{pref.volume=Number(e.target.value);if(pref.volume>0)pref.muted=false;settings();void activateSound();});$('retry-load').addEventListener('click',()=>location.reload());$('source-note').textContent=sourceNote+' '+romanceSource;
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('settings').open){e.preventDefault();openMenu();}return;}if($('settings').open||e.target.matches('input,summary'))return;if(['1','2'].includes(e.key)&&s.phase==='feast'&&romanceCurrent(s).choices){e.preventDefault();$('romance-choices').children[Number(e.key)-1]?.click();return;}if(['ArrowLeft','ArrowRight'].includes(e.key)&&['battle','feast'].includes(s.phase)){e.preventDefault();chooseOffset(e.key==='ArrowLeft'?-1:1);return;}if((e.code==='Space'||e.key==='Enter')&&!e.target.closest('button')){e.preventDefault();act();}});
document.addEventListener('visibilitychange',()=>pause(document.hidden||$('settings').open));window.addEventListener('pagehide',()=>sound.stop());
let padHeld=new Set(),lastAxis=0;function pollPad(now){const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(!p)return;const down=new Set(p.buttons.flatMap((b,i)=>b.pressed?[i]:[]));for(const i of down)if(!padHeld.has(i)){if(i===9){if($('settings').open)$('settings').close();else openMenu();}else if(i===0){if($('settings').open)$('settings').close();else if(s.phase==='fail')$('retry-battle').click();else act();}else if(i===14)chooseOffset(-1);else if(i===15)chooseOffset(1);}if(Math.abs(p.axes[0])>.6&&now-lastAxis>250){chooseOffset(p.axes[0]>0?1:-1);lastAxis=now;}padHeld=down;}
// Read-only diagnostics for local acceptance; no mutation hooks or test-only gameplay shortcuts.
window.bossStatus=()=>({state:{...s},selected,transition:tr?.name||null,ready,paused,music:sound.desired,playing:sound.current?.name||null,audioVoices:sound.voices.size,audioContext:sound.ctx?.state||'not-started',muted:pref.muted,volume:pref.volume,audioErrors:[...sound.errors]});
// Resume in the actual user-gesture event, including a click on the scene background.
document.addEventListener('pointerdown',()=>{if(!paused)void activateSound();},{capture:true});
document.addEventListener('keydown',()=>{if(!paused)void activateSound();},{capture:true});
window.addEventListener('pageshow',()=>{if(!document.hidden){pause($('settings').open);music();}});
settings();render();requestAnimationFrame(frame);
const needed=['./assets/adelia/door.webp',asset('room'),asset('aunt'),asset('aunt-kind'),asset('aunt-angry'),asset('teo-night'),asset('door-closed'),...['teo-pious','teo-relaxed','aunt-walk','street','feast'].map(n=>asset(n,true))];
Promise.all(needed.map(src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>i.decode().then(resolve,reject);i.onerror=reject;i.src=src;}))).then(()=>{ready=true;$('loading').hidden=true;render();if(s.phase==='battle'&&entryActive)deal();bridge?.ready();}).catch(()=>{$('loading').hidden=true;$('error').hidden=false;bridge?.failed();});

checkpoint=sceneCheckpoint(localStorage,'reliquia.boss.scene.'+location.search,s=>s.phase==='feast'?(romanceCurrent(s).scene||s.phase):s.phase);checkpoint.capture(s);restartButton($('settings'),()=>{const entry=checkpoint.restore();if(!entry)return;tr?.flight?.destroy();tr=null;selected=null;commit(entry);$('settings').close();});

// Shared cross-chapter controls and latest preferences.
installSharedControls({readyForCover:()=>ready,audioReady:()=>sound.paused||sound.ctx?.state==='running',soundButton:'#mute',settingsButton:'#menu',getPreferences:()=>pref,applyPreferences:p=>{Object.assign(pref,p);settings();},toggleSettings:()=>{$('settings').open?$('settings').close():openMenu();},closeTop:()=>{if($('settings').open){$('settings').close();return true;}return false;},unlock:activateSound});

installCardControls({active:()=>s.phase==='battle'&&!paused&&!tr&&ready,buttons:()=>[...$('cards').children],onSelect:b=>pick(b.dataset.card)});
