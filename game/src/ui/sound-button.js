import {isPhone} from './input-device.js';
// Shared icon for every playable chapter and music preview.
export function soundIcon(silent){return `<svg class="sound-icon" viewBox="0 0 28 28" width="26" height="26" aria-hidden="true" style="vertical-align:middle;pointer-events:none"><path fill="currentColor" d="M11 5v14.2a4.6 3.2 0 1 1-2-2.7V7l15-3v12.2a4.6 3.2 0 1 1-2-2.7V7.8L11 10z"/>${silent?'<path class="sound-muted-slash" d="M4 3L25 25" stroke="#ff5959" stroke-width="3.5" stroke-linecap="round"/>':''}</svg>`;}
export function updateSoundButton(button,silent,{shortcut=''}={}){
 if(!button)return;button.innerHTML=soundIcon(silent)+(shortcut?`<kbd>${shortcut}</kbd>`:'');
 button.dataset.muted=String(!!silent);button.setAttribute('aria-pressed',String(!!silent));
 const label=silent?'开启声音':'关闭声音';button.setAttribute('aria-label',label);button.title=label+(shortcut&&!isPhone()?'（'+shortcut+'）':'');
}
