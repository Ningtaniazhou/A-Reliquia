import {script} from './content.js';
import {normalizeVoyage} from '../voyage/state.js';
export const KEY='reliquia.departure-preview.v1';
export const initial=()=>({node:script[0].key,unfolded:false,departed:false,routeStep:0});
export function normalize(s){if(s?.node==='alexandria')s={...s,node:'route',routeStep:4};const node=script.find(n=>n.key===s?.node);return node?{node:node.key,unfolded:!!s.unfolded,departed:!!s.departed,routeStep:Math.max(0,Math.min(6,Math.floor(Number(s.routeStep)||0))),voyage:normalizeVoyage(s.voyage)}:initial();}
export const current=s=>script.find(n=>n.key===s.node)||script[0];
export function advance(s){const n=current(s);if(n.action||n.end)return s;return {...s,node:script[script.indexOf(n)+1].key};}
export function interact(s,action){const n=current(s);if(n.action!==action)return s;return {...s,node:script[script.indexOf(n)+1].key,unfolded:s.unfolded||action==='unfold',departed:s.departed||action==='leave'};}
export function read(store){try{return normalize(JSON.parse(store.getItem(KEY)));}catch{return initial();}}
export function save(store,s){try{store.setItem(KEY,JSON.stringify(normalize(s)));return true;}catch{return false;}}
