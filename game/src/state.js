import {normalize as normalizeChapter} from './boss/state.js';
import {growthCount,growthSpreads} from './growth/content.js';
import {arrivalLines,legacyArrivalIds,arrivalV2Ids} from './arrival/content.js';
import {studyIds,studyComplete} from './study-content.js';
export const KEY='reliquia.opening.v1';
export const initial=()=>({version:1,scene:'window',spread:0,revealed:0,progress:0,pages:[0,0],studied:[],arrivalVersion:3,growthVersion:2,growthSpread:0,growthPages:[1,0,0],chapterState:null});
const scenes=['intro','window','room','preface','book','road-ready','travel','door','arrival','writing-return','growth','chapter2'];
export function normalize(value){
 if(!value||value.version!==1||!scenes.includes(value.scene))return initial();
 const s={...initial(),scene:value.scene,spread:value.spread===1?1:0,revealed:Math.max(0,Math.min(2,Number(value.revealed)||0)),progress:Math.max(0,Math.min(1,Number(value.progress)||0))};
 s.studied=Array.isArray(value.studied)?studyIds.filter(id=>value.studied.includes(id)):['preface','book','road-ready','travel','door'].includes(s.scene)?[...studyIds]:[];
 s.pages=[0,1].map(i=>Math.max(0,Math.min(2,Number(value.pages?.[i])||0)));s.pages[s.spread]=Math.max(s.pages[s.spread],s.revealed);
 if(s.scene==='arrival'){s.arrivalLine=Math.max(0,Math.min(arrivalLines.length-1,Number(value.arrivalLine)||0));s.arrivalSeen=true;if(value.arrivalVersion!==3){const id=(value.arrivalVersion===2?arrivalV2Ids:legacyArrivalIds)[s.arrivalLine];s.arrivalLine=Math.max(0,arrivalLines.findIndex(l=>l.id===id));}}
 if(value.growthVersion===2){s.growthSpread=Math.max(0,Math.min(growthSpreads.length-1,Number(value.growthSpread)||0));s.growthPages=growthSpreads.map((_,i)=>Math.max(i===0?1:0,Math.min(growthCount(i),Number(value.growthPages?.[i])||0)));}
 else{const a=value.growthPages?.[0]||0,b=value.growthPages?.[1]||0;s.growthPages=[a>=1?2:1,b>=1?2:a>=2?1:0,b>=2?1:0];s.growthSpread=b>=2?2:(b>=1||a>=1)?1:0;}
 if(value.chapterState)s.chapterState=normalizeChapter(value.chapterState);
 if(['writing-return','growth','chapter2'].includes(s.scene)){s.arrivalLine=arrivalLines.length-1;s.arrivalSeen=true;}
 if(s.scene==='intro')s.scene='window';
 if(s.scene==='travel')s.scene=s.progress>=1?'door':'road-ready';
 if(s.scene==='road-ready')s.progress=0;
 return s;
}
export function reduce(s,action){
 if(action==='RESTART')return initial();
 if(action==='CONTINUE'&&s.scene==='intro')return {...s,scene:'window'};
 if(action==='ROOM'&&s.scene==='window')return {...s,scene:'room'};
 if(action.startsWith('STUDIED:')&&s.scene==='room'){const id=action.slice(8);return studyIds.includes(id)&&!s.studied?.includes(id)?{...s,studied:[...(s.studied||[]),id]}:s;}
 if(action==='OPEN'&&s.scene==='room'&&studyComplete(s))return {...s,scene:'preface'};
 if(action==='TURN'&&s.scene==='preface')return {...s,scene:'book',spread:0,revealed:s.pages?.[0]||0};
 if(action==='LEFT'&&s.scene==='book'&&s.revealed===0)return {...s,revealed:1,pages:s.spread===0?[1,s.pages?.[1]||0]:[s.pages?.[0]||0,1]};
 if(action==='RIGHT'&&s.scene==='book'&&s.revealed===1)return {...s,revealed:2,pages:s.spread===0?[2,s.pages?.[1]||0]:[s.pages?.[0]||0,2]};
 if(action==='TURN'&&s.scene==='book'&&s.spread===0&&s.revealed===2)return {...s,spread:1,revealed:s.pages?.[1]||0};
 if(action==='ENTER_ROAD'&&s.scene==='book'&&s.spread===1&&s.revealed===2)return {...s,scene:'travel',progress:0};
 if(action==='DRIVE'&&s.scene==='road-ready')return {...s,scene:'travel',progress:0};
 if(action==='ARRIVE'&&s.scene==='travel')return {...s,scene:'door',progress:1};
 if(action==='ENTER_HOUSE'&&s.scene==='door')return {...s,scene:'arrival',arrivalLine:0,arrivalSeen:false};
 if(action==='ARRIVAL_READY'&&s.scene==='arrival')return {...s,arrivalSeen:true};
 if(s.scene==='arrival'&&s.arrivalSeen){
  if(action==='AUNT_NEXT')return {...s,arrivalLine:Math.min(arrivalLines.length-1,(s.arrivalLine||0)+1)};
  if(action==='AUNT_PREV')return {...s,arrivalLine:Math.max(0,(s.arrivalLine||0)-1)};
  if(action==='AUNT_REREAD')return {...s,arrivalLine:0};
 }
 if(action==='WRITE_YEARS'&&s.scene==='arrival'&&s.arrivalSeen&&s.arrivalLine===arrivalLines.length-1)return {...s,scene:'writing-return',growthSpread:0};
 if(action==='GROW_READY'&&s.scene==='writing-return')return {...s,scene:'growth'};
 if(s.scene==='growth'){
  const n=s.growthPages[s.growthSpread];
  if(n<growthCount(s.growthSpread)&&((action==='GROW_LEFT'&&n===0)||(action==='GROW_RIGHT'&&n===1))){const pages=[...s.growthPages];pages[s.growthSpread]++;return {...s,growthPages:pages};}
  if(action==='GROW_TURN'&&s.growthSpread<growthSpreads.length-1&&n===growthCount(s.growthSpread))return {...s,growthSpread:s.growthSpread+1};
  if(action==='ENTER_CHAPTER'&&s.growthSpread===growthSpreads.length-1&&n===growthCount(s.growthSpread))return {...s,scene:'chapter2'};
 }
 if(action==='BACK'){
  if(s.scene==='growth'&&s.growthSpread>0)return {...s,growthSpread:s.growthSpread-1};
  if(['growth','writing-return'].includes(s.scene))return {...s,scene:'arrival',arrivalSeen:true,arrivalLine:arrivalLines.length-1};
  if(s.scene==='arrival')return {...s,scene:'door',progress:1};
  if(['road-ready','travel','door'].includes(s.scene))return {...s,scene:'book',spread:1,revealed:2,progress:0};
  if(s.scene==='book'&&s.spread===1)return {...s,spread:0,revealed:2};
  if(s.scene==='book')return {...s,scene:'preface'};
  if(s.scene==='preface')return {...s,scene:'room'};
  if(s.scene==='room')return {...s,scene:'window'};
 }
 return s;
}
export function readSave(storage){try{return normalize(JSON.parse(storage.getItem(KEY)));}catch{return initial();}}
export function writeSave(storage,s){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
