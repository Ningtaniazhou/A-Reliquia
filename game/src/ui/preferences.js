// Shared preferences only. Never store narrative, inventory or chapter checkpoints here.
export const PREFERENCES_KEY='reliquia.preferences.v1';
export const DEFAULT_PREFERENCES=Object.freeze({volume:.5,muted:false,reduced:false});
// Keep the legacy field false so older chapter saves cannot disable story animation.
export function normalizePreferences(value={}){return {volume:Number.isFinite(value.volume)?Math.max(0,Math.min(1,value.volume)):.5,muted:!!value.muted,reduced:false};}
let memory=null;
function storage(){try{return globalThis.localStorage;}catch{return null;}}
export function readPreferences(fallback=DEFAULT_PREFERENCES){let saved;try{saved=JSON.parse(storage()?.getItem(PREFERENCES_KEY)||'null');}catch{}if(saved&&typeof saved==='object'){const prefs=normalizePreferences(saved);memory=prefs;if(saved.reduced!==false){try{storage()?.setItem(PREFERENCES_KEY,JSON.stringify(prefs));}catch{}}return prefs;}if(memory)return {...memory};const prefs=normalizePreferences(fallback);memory=prefs;try{storage()?.setItem(PREFERENCES_KEY,JSON.stringify(prefs));}catch{}return {...prefs};}
export function writePreferences(value){const prefs=normalizePreferences(value),data=JSON.stringify(prefs);memory=prefs;try{storage()?.setItem(PREFERENCES_KEY,data);}catch{}globalThis.dispatchEvent?.(new CustomEvent('reliquia:preferences',{detail:prefs}));return prefs;}
export function watchPreferences(apply){const local=e=>apply(normalizePreferences(e.detail)),external=e=>{if(e.key===PREFERENCES_KEY&&e.newValue){try{apply(normalizePreferences(JSON.parse(e.newValue)));}catch{}}};globalThis.addEventListener('reliquia:preferences',local);globalThis.addEventListener('storage',external);return ()=>{globalThis.removeEventListener('reliquia:preferences',local);globalThis.removeEventListener('storage',external);};}
