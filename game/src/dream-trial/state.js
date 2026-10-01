export const SAVE_KEY='reliquia.dream-trial.study.v2';
export const initial=()=>({version:2,tutorialSeen:false,started:false,figs:false,gift:false,elderHeard:false,completed:[],cursors:{},active:null,muted:false,volume:.4,reduced:false});
export function normalize(raw,scripts){
 const s=initial();if(!raw||typeof raw!=='object')return s;
 for(const k of ['started','figs','gift','elderHeard','muted','reduced'])s[k]=raw[k]===true;
 s.tutorialSeen=typeof raw.tutorialSeen==='boolean'?raw.tutorialSeen:raw.started===true;
 s.volume=Number.isFinite(raw.volume)?Math.max(0,Math.min(1,raw.volume)):.4;
 s.completed=Array.isArray(raw.completed)?[...new Set(raw.completed.filter(k=>scripts[k]))]:[];
 for(const [k,v] of Object.entries(raw.cursors||{}))if(scripts[k]&&Number.isInteger(v)&&v>=0&&v<scripts[k].length)s.cursors[k]=v;
 s.active=typeof raw.active==='string'&&scripts[raw.active]?raw.active:null;
 if(s.gift){s.figs=true;s.elderHeard=true;}

 if(s.active==='gift'&&!s.elderHeard)s.active=null;
 return s;
}
export function finish(s,key){
 if(!s.completed.includes(key))s.completed.push(key);
 delete s.cursors[key];s.active=null;
 if(key==='figs')s.figs=true;
 if(key==='elder')s.elderHeard=true;
 if(key==='gift')s.gift=true;
 return s;
}
