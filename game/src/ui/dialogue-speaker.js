import {displayName} from './conventions.js';
import {originalCharacterName} from '../i18n/characters.js';

// Layout and portrait rendering must agree before the next animation frame.
// A label's hidden/style state may still belong to the preceding narration.
export function dialoguePortraitName(panel){
 const label=panel.querySelector('.speaker,#speaker');
 const name=label?.dataset.originalSpeaker||label?.textContent.trim()||'';
 if(!name||/心声|心里|回忆|旁白|叙述|介绍|Pensamento|Memórias|Narração|\//.test(name)||panel.matches('.shared-black,.shared-pixel-dialogue,.thought,.is-thought,.narration'))return '';
 return displayName(originalCharacterName(name.split(' · ')[0]));
}
