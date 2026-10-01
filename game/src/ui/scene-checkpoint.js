import {LABELS} from './conventions.js';
// Store entry progress separately; replay never erases progress from previous areas.
export function sceneCheckpoint(storage,key,identity){let entry;try{entry=JSON.parse(storage.getItem(key));}catch{}
 return {capture(state){const scene=identity(state);if(entry?.scene===scene)return;entry={scene,state:structuredClone(state)};try{storage.setItem(key,JSON.stringify(entry));}catch{}},restore(){return entry?structuredClone(entry.state):null;},clear(){entry=null;try{storage.removeItem(key);}catch{}}};}
export function restartButton(dialog,run){const b=document.createElement('button');b.type='button';b.textContent=LABELS.restartScene;b.onclick=async()=>{if(b.disabled)return;b.disabled=true;try{await run();}finally{b.disabled=false;}};const anchor=dialog.querySelector('#restart');(anchor?.parentElement||dialog).insertBefore(b,anchor||null);return b;}
