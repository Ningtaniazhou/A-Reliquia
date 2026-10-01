import {displayName} from './conventions.js';
// Presentation-only migration: keep original narrative identity and save cursors.
const css=document.createElement('style');css.textContent=`[data-nonverbal="true"]>.speaker,[data-nonverbal="true"] #speaker,[data-nonverbal="true"]>small,[data-nonverbal="true"]>.voyage-speaker{display:none!important}[data-nonverbal="true"]{border-left-width:1px!important}[data-nonverbal="true"] .dialogue-bust{display:none!important}`;document.head.append(css);
const selectors='.arrival-dialogue,.voyage-dialogue,.alex-talk,.j-talk,.bridge-dialogue,#dialogue,#subtitle,#speech';
let queued=false;
function sync(){queued=false;for(const panel of document.querySelectorAll(selectors)){const label=panel.querySelector(':scope > .speaker,#speaker,:scope > small,:scope > .voyage-speaker');if(!label)continue;const original=label.textContent.trim(),name=displayName(original);if(name!==original)label.textContent=name;const silent=!name||/心声|心里|回忆|^(旁白|叙述|介绍)$/.test(name)||panel.matches('.thought,.is-thought,.narration');panel.dataset.nonverbal=String(silent);if(silent){label.hidden=true;panel.setAttribute('aria-label','叙述');}else{label.hidden=false;panel.setAttribute('aria-label','交谈');}}}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});schedule();
