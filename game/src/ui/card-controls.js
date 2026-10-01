import {CARD_CONTROLS} from './conventions.js';
// Same keyboard behavior for both paper-stage card battles; mouse handlers own effects.
export function installCardControls({active,buttons,onSelect=()=>{}}){const key=e=>{if(!active()||e.ctrlKey||e.metaKey||e.altKey)return;const list=buttons().filter(b=>!b.disabled);if(!list.length)return;
 const numeric=/^(Digit|Numpad)[0-9]$/.test(e.code),move=[CARD_CONTROLS.previous,CARD_CONTROLS.next].includes(e.code),confirm=CARD_CONTROLS.confirm.includes(e.code);if(!numeric&&!move&&!confirm)return;e.preventDefault();e.stopImmediatePropagation();if(e.repeat||numeric)return;
 let at=list.indexOf(document.activeElement);if(move){at=at<0?(e.code===CARD_CONTROLS.next?0:list.length-1):(at+(e.code===CARD_CONTROLS.next?1:-1)+list.length)%list.length;onSelect(list[at],at);list[at].focus({preventScroll:true});}else list[at<0?0:at].click();};window.addEventListener('keydown',key,true);return ()=>window.removeEventListener('keydown',key,true);}
