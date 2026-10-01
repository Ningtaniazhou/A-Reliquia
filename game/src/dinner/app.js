import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {restartButton} from '../ui/scene-checkpoint.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {beats,sourceNotes} from './content.js';
import {SETTINGS,load,save,previous,advance,transitions} from './state.js';
import {DinnerAudio} from './audio.js';
const $=id=>document.getElementById(id),stage=$('stage'),teo=$('teo'),aunt=$('aunt');
const asset=name=>`./assets/dinner/${name}.webp`;
let storage;try{storage=window.localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('unavailable');}};}
let settings={volume:.35,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
try{const s=JSON.parse(storage.getItem(SETTINGS));if(s){settings={volume:Math.max(0,Math.min(1,Number(s.volume)||0)),muted:!!s.muted,reduced:!!s.reduced};}}catch{}
Object.assign(settings,readPreferences(settings));
let id=load(storage).id,transition=null,paused=false,ready=false,lastTime=0,stepSound=-1,pausedAnimations=[];
const sound=new DinnerAudio(settings);
const setImage=(el,name)=>{if(el.dataset.asset!==name){el.src=asset(name);el.dataset.asset=name;}};
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{v=clamp(v);return v*v*(3-2*v);};
function storeSettings(){try{storage.setItem(SETTINGS,JSON.stringify(settings));}catch{}}
function appearance(){document.body.classList.toggle('reduced',settings.reduced);updateSoundButton($('mute'),settings.muted||settings.volume===0);$('reduced').checked=settings.reduced;$('volume').value=settings.volume;sound.update();}
function scene(name){stage.dataset.scene=name;}
function resetMotion(){for(const key of ['walking','curtain','black','bob'])stage.style.setProperty('--'+key,0);stage.style.setProperty('--aunt-opacity',1);stage.style.setProperty('--teo-opacity',1);$('motion-caption').textContent='';}
function render(){
 resetMotion();scene(id);const b=beats.find(b=>b.id===id)||beats[0];
 $('act').textContent=b.act;$('speaker').textContent=b.speaker;$('text-kind').textContent='';$('text-kind').hidden=true;$('zh').textContent=b.zh;$('pt').textContent='';$('pt').hidden=true;
 $('next').textContent='›';$('next').disabled=!ready||paused;$('back').disabled=id==='meal'||!ready;$('side-door').hidden=id!=='relaxed';$('side-door').disabled=!ready||paused;
 $('progress').textContent=`${beats.indexOf(b)+1} / ${beats.length}`;
 aunt.hidden=['watched','relaxed','street','feast','heaven','farewell'].includes(id);teo.hidden=['street','feast','heaven','farewell'].includes(id);
 setImage(aunt,'aunt-seated');setImage(teo,id==='relaxed'?'teo-relaxed':id==='watched'?'teo-watch':'teo-pious');
 teo.alt=id==='relaxed'?'特奥多里科松开领口，翘着腿，带着玩世不恭的笑':id==='watched'?'特奥多里科站着望向姨姨离开的门':'特奥多里科挺直腰背，拘谨地拿着面包皮';
 $('subtitle').style.opacity='1';
}
function commit(next){id=next;transition=null;save(storage,id);render();}
function start(name){if(!ready||paused||transition)return;const cfg=transitions[name];transition={name,...cfg,elapsed:0};stepSound=-1;scene(name);$('next').disabled=true;$('side-door').hidden=true;$('subtitle').style.opacity='.7';
 if(name==='depart'){setImage(aunt,'aunt-walk');setImage(teo,'teo-watch');aunt.hidden=false;sound.noise(.25,.08,500);}
 if(name==='curtain'){sound.cloth();$('motion-caption').textContent='';}
 if(name==='escape'){setImage(teo,'teo-walk');sound.door();}
 if(name==='visit')sound.door();
}
function act(){if(!ready||paused||transition)return;void sound.unlock();
 if(id==='sleep')return start('depart');if(id==='watched')return start('curtain');if(id==='relaxed')return start('escape');if(id==='street')return start('visit');
 if(id==='meal'||id==='feast')sound.clink();commit(advance(id));
}
function animate(now){const dt=lastTime?Math.min(now-lastTime,80):0;lastTime=now;
 if(transition&&!paused){const tr=transition;tr.elapsed+=dt;const duration=settings.reduced?Math.min(tr.duration,900):tr.duration,p=clamp(tr.elapsed/duration);
  if(tr.name==='depart'){
   const w=smooth((p-.16)/.76);stage.style.setProperty('--walking',w);stage.style.setProperty('--aunt-opacity',1-smooth((p-.79)/.15));stage.style.setProperty('--bob',settings.reduced?0:Math.sin(p*30)*1.2);
   if(!settings.reduced&&p>.17&&p<.85){const n=Math.floor(p*8);if(n!==stepSound){sound.step();stepSound=n;}}
  }else if(tr.name==='curtain'){
   const cover=p<.36?smooth(p/.36):p<.60?1:1-smooth((p-.60)/.40);stage.style.setProperty('--curtain',cover);
   if(p>=.47&&teo.dataset.asset!=='teo-relaxed'){setImage(teo,'teo-relaxed');scene('relaxed');$('side-door').hidden=true;sound.release();}
   $('subtitle').style.opacity=String(p<.36?1-p/.36:p<.60?0:(p-.60)/.40);
   if(p>.60){const b=beats.find(b=>b.id==='relaxed');$('zh').textContent=b.zh;$('pt').textContent='';$('pt').hidden=true;$('speaker').textContent=b.speaker;$('text-kind').textContent='';$('text-kind').hidden=true;}
  }else if(tr.name==='escape'){
   stage.style.setProperty('--walking',smooth(p/.86));stage.style.setProperty('--teo-opacity',1-smooth((p-.72)/.14));stage.style.setProperty('--bob',settings.reduced?0:Math.sin(p*35)*1.8);stage.style.setProperty('--black',smooth((p-.82)/.18));
   if(!settings.reduced&&p<.84){const n=Math.floor(p*7);if(n!==stepSound){sound.step();stepSound=n;}}
  }else if(tr.name==='visit')stage.style.setProperty('--black',smooth(p));
  if(p>=1){const next=tr.to;commit(next);if(next==='street')sound.door();}
 }
 requestAnimationFrame(animate);
}
function pause(on){if(on&&!paused){pausedAnimations=stage.getAnimations({subtree:true}).filter(a=>a.playState==='running');for(const a of pausedAnimations)a.pause();}else if(!on&&paused){for(const a of pausedAnimations){try{a.play();}catch{}}pausedAnimations=[];}paused=on;document.body.classList.toggle('paused',on);sound.pause(on);$('next').disabled=on||!ready||!!transition;$('side-door').disabled=on||!ready;}
function openDialog(el){if(transition||ready){pause(true);el.showModal();}}
$('next').addEventListener('click',act);$('side-door').addEventListener('click',act);
$('back').addEventListener('click',()=>{if(!ready||paused)return;transition=null;commit(previous(id));});
$('pause').addEventListener('click',()=>openDialog($('settings')));
$('source').addEventListener('click',()=>openDialog($('sources')));
for(const el of [$('settings'),$('sources')])el.addEventListener('close',()=>pause(document.hidden));
$('mute').addEventListener('click',()=>{const silent=settings.muted||settings.volume===0;settings.muted=!silent;if(silent&&!settings.volume)settings.volume=.35;void sound.unlock();appearance();storeSettings();});
$('volume').addEventListener('input',e=>{settings.volume=Number(e.target.value);appearance();storeSettings();});
$('reduced').addEventListener('change',e=>{settings.reduced=e.target.checked;appearance();storeSettings();});
$('restart').addEventListener('click',()=>{commit('meal');$('settings').close();});
$('retry').addEventListener('click',()=>location.reload());
for(const [title,body] of sourceNotes){const section=document.createElement('section');section.className='source-entry';const h=document.createElement('h3'),p=document.createElement('p');h.textContent=title;p.textContent=body;section.append(h,p);$('source-list').append(section);}
document.addEventListener('keydown',e=>{if((e.target.matches('button,input')&&!['KeyA','KeyD'].includes(e.code))||$('settings').open||$('sources').open)return;if(e.code==='KeyD'||e.code==='Space'||e.key==='Enter'){e.preventDefault();act();}else if(e.code==='KeyA'||e.key==='ArrowLeft'){e.preventDefault();if(ready&&!paused){transition=null;commit(previous(id));}}else if(e.key==='Escape'){e.preventDefault();openDialog($('settings'));}});
document.addEventListener('visibilitychange',()=>pause(document.hidden||$('settings').open||$('sources').open));
window.addEventListener('pagehide',()=>sound.stop());
appearance();render();requestAnimationFrame(animate);
const needed=['room','teo-pious','teo-relaxed','teo-walk','aunt-seated','aunt-walk','teo-watch','street','feast'];
Promise.all(needed.map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>img.decode().then(resolve,reject);img.onerror=reject;img.src=asset(name);}))).then(()=>{ready=true;render();}).catch(()=>{$('load-error').hidden=false;});

restartButton($('settings'),()=>{transition=null;commit(id);$('settings').close();});

// Shared cross-chapter controls and latest preferences.
installSharedControls({soundButton:'#mute',settingsButton:'#pause',getPreferences:()=>settings,applyPreferences:p=>{Object.assign(settings,p);appearance();storeSettings();},toggleSettings:()=>{$('settings').open?$('settings').close():openDialog($('settings'));},closeTop:()=>{const d=document.querySelector('dialog[open]');if(d){d.close();return true;}return false;},unlock:()=>sound.unlock()});
