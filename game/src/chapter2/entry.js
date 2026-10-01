import {readPreferences} from '../ui/preferences.js';
import {initial,normalize} from '../boss/state.js';
const KEY='reliquia.chapter2.complete.v1',PREF='reliquia.chapter2.complete.settings.v1';
const entrance=document.querySelector('#entrance'),frame=document.querySelector('#chapter'),notice=document.querySelector('#notice');
let saved=null,settings={volume:.42,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches},context=null;
try{const raw=localStorage.getItem(KEY);if(raw)saved=normalize(JSON.parse(raw));Object.assign(settings,JSON.parse(localStorage.getItem(PREF))||{});}catch{}
Object.assign(settings,readPreferences(settings));
const persist=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{notice.textContent='浏览器未能保存进度，请勿关闭此页面。';return false;}};
window.__reliquiaChapter={get saved(){return saved;},get settings(){return settings;},get context(){return context;},save(value){saved=value;persist(KEY,value);},preferences(value){settings={...settings,...value};persist(PREF,settings);},ready(){frame.contentWindow?.reliquiaEnterChapter?.();frame.focus();},failed(){frame.hidden=true;entrance.hidden=false;notice.textContent='画面未能载入，请点击继续重试。';document.querySelector('#continue').hidden=false;}};
function enter(fresh){if(fresh){saved=initial();persist(KEY,saved);}try{context??=new AudioContext();void context.resume();}catch{}entrance.hidden=true;frame.hidden=false;frame.src=saved?.phase==='departure'?'./departure.html?integrated=1':'./boss.html?integrated=1';}
document.querySelector('#continue').hidden=!saved;
document.querySelector('#continue').onclick=()=>enter(false);
document.querySelector('#start').onclick=()=>enter(true);
window.addEventListener('pagehide',()=>frame.contentWindow?.reliquiaLeaveChapter?.());
