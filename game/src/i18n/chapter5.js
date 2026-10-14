import {isPortuguese} from './locale.js';
import {characterId} from './characters.js';
import {lines} from './chapter5-pt.js';
export function localizeRow(row){
 if(isPortuguese&&!Object.hasOwn(lines,row.id))throw Error('Missing pt-PT dialogue: '+row.id);
 return {...row,speakerId:characterId(row.who),text:isPortuguese?lines[row.id]:row.text};
}
