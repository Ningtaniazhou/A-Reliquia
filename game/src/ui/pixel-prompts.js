import {localizeText} from '../i18n/display.js';
import {isPhone} from './input-device.js';
// All pixel chapters use the same accessible key + short action prompt.
if(typeof document!=='undefined'){const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../../styles/ui/pixel-prompts.css',import.meta.url);document.head.append(style);}
export function setPixelPrompt(button,action){const key=document.createElement('kbd'),label=document.createElement('span');key.textContent=localizeText('E');key.setAttribute('aria-hidden','true');label.textContent=localizeText(action);button.replaceChildren(key,label);button.setAttribute('aria-label',localizeText(action+(isPhone()?'':'（E）')));button.setAttribute('aria-keyshortcuts','E');}
