import './presentation.js';
import {KEYS,LABELS,SETTINGS_HELP} from './conventions.js';
import {readPreferences,writePreferences,watchPreferences,normalizePreferences} from './preferences.js';
import {updateSoundButton} from './sound-button.js';
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../../styles/ui/shared-controls.css',import.meta.url);document.head.append(style);
// Chapter adapters own pause/resume and local overlay order; common keys never advance a story.
export function installSharedControls({soundButton,settingsButton,bagButton,fields='#volume,#motion,#reduced,#reduce,#opening-volume,#opening-reduced',settingsPanel='#settings',getPreferences,applyPreferences,toggleSettings,closeTop=()=>false,enabled=()=>true,unlock=()=>{},pixel=false}){
 const find=s=>s&&document.querySelector(s),same=(a,b)=>JSON.stringify(normalizePreferences(a))===JSON.stringify(normalizePreferences(b));
 const apply=p=>{if(!same(getPreferences(),p))applyPreferences(p);};
 apply(readPreferences(getPreferences()));const unwatch=watchPreferences(apply);
 function refresh(){
  for(const [selector,role,key] of [[soundButton,'sound','M'],[settingsButton,'settings','P'],[bagButton,'bag','Tab']]){const b=find(selector);if(!b)continue;if(b.dataset.gameControl!==role)b.dataset.gameControl=role;b.classList.toggle('pixel-control',typeof pixel==='function'?pixel():pixel);if(b.getAttribute('aria-keyshortcuts')!==key)b.setAttribute('aria-keyshortcuts',key);
   if(role==='settings'){const label=b.classList.contains('pixel-control')?'设置 <kbd>P</kbd>':LABELS.settings;if(b.innerHTML!==label)b.innerHTML=label;b.title='设置（P）';}
   if(role==='bag')b.title='背包（Tab）';
  }
  const panel=find(settingsPanel);if(panel&&!panel.querySelector('.shared-settings-help')){const p=document.createElement('p');p.className='shared-settings-help';p.textContent=SETTINGS_HELP;panel.append(p);}
 }
 refresh();let queued=false;const observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;refresh();});}});observer.observe(document.body,{childList:true,subtree:true});
 const onClick=e=>{if(!enabled()||!e.target.closest?.(soundButton))return;e.preventDefault();e.stopImmediatePropagation();const p=normalizePreferences(getPreferences()),silent=p.muted||p.volume===0;const next={...p,muted:!silent,volume:silent&&p.volume===0?.5:p.volume};applyPreferences(next);writePreferences(next);void unlock();updateSoundButton(find(soundButton),next.muted||next.volume===0,{shortcut:typeof pixel==='function'?pixel()?'M':'':pixel?'M':''});};
 const fieldChanged=e=>{if(e.target.matches?.(fields))queueMicrotask(()=>{const p=normalizePreferences(getPreferences());if(e.target.type==='range'&&p.volume>0)p.muted=false;apply(p);writePreferences(p);});};
 const keydown=e=>{if(!enabled()||e.ctrlKey||e.metaKey||e.altKey||e.isComposing||e.target.matches?.('textarea,input:not([type=range]):not([type=checkbox]),[contenteditable=true]'))return;
  if(e.code==='Enter'&&e.target.matches?.('input[type=range],input[type=checkbox]')){e.preventDefault();e.stopImmediatePropagation();return;}
  if([KEYS.sound,KEYS.settings,KEYS.settingsAlias].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(e.repeat)return;if(e.code===KEYS.sound)find(soundButton)?.click();else toggleSettings();return;}
  if(e.code===KEYS.back&&e.repeat){e.preventDefault();e.stopImmediatePropagation();return;}
  if(e.code===KEYS.back&&closeTop()){e.preventDefault();e.stopImmediatePropagation();}
 };
 document.addEventListener('click',onClick,true);document.addEventListener('input',fieldChanged);document.addEventListener('change',fieldChanged);window.addEventListener('keydown',keydown,true);
 return ()=>{unwatch();observer.disconnect();document.removeEventListener('click',onClick,true);document.removeEventListener('input',fieldChanged);document.removeEventListener('change',fieldChanged);window.removeEventListener('keydown',keydown,true);};
}
