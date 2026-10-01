import {beats} from './content.js';
export const KEY='reliquia.dinner.local.v1';
export const SETTINGS='reliquia.dinner.settings.v1';
export const transitions={depart:{from:'sleep',to:'watched',duration:3900},curtain:{from:'watched',to:'relaxed',duration:3700},escape:{from:'relaxed',to:'street',duration:3000},visit:{from:'street',to:'feast',duration:1200}};
export function normalize(v){const id=transitions[v?.id]?.from||v?.id;return {version:1,id:beats.some(b=>b.id===id)?id:'meal'};}
export function advance(id){const i=beats.findIndex(b=>b.id===id);return i<0?'meal':beats[(i+1)%beats.length].id;}
export function previous(id){const current=transitions[id]?.from||id;const i=beats.findIndex(b=>b.id===current);return beats[Math.max(0,i-1)].id;}
export function load(storage){try{return normalize(JSON.parse(storage.getItem(KEY)));}catch{return normalize(null);}}
export function save(storage,id){try{storage.setItem(KEY,JSON.stringify(normalize({id})));return true;}catch{return false;}}
