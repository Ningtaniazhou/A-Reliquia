export const KEY='reliquia.opening.v1';
export const initial=()=>({version:1,scene:'intro',spread:0,revealed:0,progress:0,pages:[0,0]});
const scenes=['intro','window','room','book','road-ready','travel','door'];
export function normalize(value){
 if(!value||value.version!==1||!scenes.includes(value.scene))return initial();
 const s={...initial(),scene:value.scene,spread:value.spread===1?1:0,revealed:Math.max(0,Math.min(2,Number(value.revealed)||0)),progress:Math.max(0,Math.min(1,Number(value.progress)||0))};
 s.pages=[0,1].map(i=>Math.max(0,Math.min(2,Number(value.pages?.[i])||0)));s.pages[s.spread]=Math.max(s.pages[s.spread],s.revealed);
 if(s.scene==='window')s.scene='room';
 if(s.scene==='travel')s.scene=s.progress>=1?'door':'road-ready';
 if(s.scene==='road-ready')s.progress=0;
 return s;
}
export function reduce(s,action){
 if(action==='RESTART')return initial();
 if(action==='CONTINUE'&&s.scene==='intro')return {...s,scene:'window'};
 if(action==='ROOM'&&s.scene==='window')return {...s,scene:'room'};
 if(action==='OPEN'&&s.scene==='room')return {...s,scene:'book'};
 if(action==='LEFT'&&s.scene==='book'&&s.revealed===0)return {...s,revealed:1,pages:s.spread===0?[1,s.pages?.[1]||0]:[s.pages?.[0]||0,1]};
 if(action==='RIGHT'&&s.scene==='book'&&s.revealed===1)return {...s,revealed:2,pages:s.spread===0?[2,s.pages?.[1]||0]:[s.pages?.[0]||0,2]};
 if(action==='TURN'&&s.scene==='book'&&s.spread===0&&s.revealed===2)return {...s,spread:1,revealed:s.pages?.[1]||0};
 if(action==='ENTER_ROAD'&&s.scene==='book'&&s.spread===1&&s.revealed===2)return {...s,scene:'road-ready',progress:0};
 if(action==='DRIVE'&&s.scene==='road-ready')return {...s,scene:'travel',progress:0};
 if(action==='ARRIVE'&&s.scene==='travel')return {...s,scene:'door',progress:1};
 if(action==='BACK'){
  if(['road-ready','travel','door'].includes(s.scene))return {...s,scene:'book',spread:1,revealed:2,progress:0};
  if(s.scene==='book'&&s.spread===1)return {...s,spread:0,revealed:2};
  if(s.scene==='book')return {...s,scene:'room'};
  if(s.scene==='room'||s.scene==='window')return initial();
 }
 return s;
}
export function readSave(storage){try{return normalize(JSON.parse(storage.getItem(KEY)));}catch{return initial();}}
export function writeSave(storage,s){try{storage.setItem(KEY,JSON.stringify(s));return true;}catch{return false;}}
