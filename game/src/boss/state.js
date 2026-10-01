import {restore} from '../adelia/flow.js';
import {rounds} from './content.js';
export const KEY='reliquia.aunt-boss.local.v1';
export const PREFS='reliquia.aunt-boss.settings.v1';
export const initial=()=>({version:1,phase:'intro',step:0,round:0,chosen:null,success:false});
const phases=['intro','battle','response','fail','restored','closed','dressed','street','feast','end','departure'];
export function normalize(value){
 const s={...initial(),...value};s.version=1;
 s.phase=phases.includes(s.phase)?s.phase:'intro';
 s.step=Number.isInteger(s.step)?Math.max(0,Math.min(s.step,3)):0;
 s.round=Number.isInteger(s.round)?Math.max(0,Math.min(s.round,rounds.length-1)):0;
 const r=rounds[s.round];s.chosen=r.cards.some(c=>c.id===s.chosen)?s.chosen:null;
 s.success=!!s.chosen&&s.chosen===r.correct;
 if(['response','fail'].includes(s.phase)&&!s.chosen)s.phase='battle';
 if(s.phase==='fail'&&s.success)s.phase='response';
 return restore(s);
}
export function answer(s,id){if(s.phase!=='battle'||!rounds[s.round].cards.some(c=>c.id===id))return s;return normalize({...s,phase:'response',chosen:id});}
export function afterResponse(s){if(s.phase!=='response')return s;if(!s.success)return {...s,phase:'fail'};return s.round===rounds.length-1?{...s,phase:'restored'}:{...s,phase:'battle',round:s.round+1,chosen:null,success:false};}
export function retry(){return {...initial(),phase:'battle'};}
export function load(storage,key=KEY){try{return normalize(JSON.parse(storage.getItem(key)));}catch{return initial();}}
export function save(storage,s,key=KEY){try{storage.setItem(key,JSON.stringify(normalize(s)));return true;}catch{return false;}}
