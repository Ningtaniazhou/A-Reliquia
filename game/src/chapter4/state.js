import {scenes} from './content.js';
export const SAVE_KEY='reliquia.chapter4.v1';
export function initial(fromCamp=false){return {version:1,index:0,phase:fromCamp?'explore':'intro',dialogue:fromCamp?null:{kind:'intro',id:'intro',line:0},done:{},read:{},cursors:{},tutorialSeen:false,finished:false,volume:.65,muted:false,reduced:false};}
export function normalize(raw,fromCamp=false){const s={...initial(fromCamp),...raw};s.index=Math.max(0,Math.min(scenes.length-1,Number.isInteger(s.index)?s.index:0));for(const k of ['done','read','cursors'])if(!s[k]||typeof s[k]!=='object'||Array.isArray(s[k]))s[k]={};s.volume=Number.isFinite(s.volume)?Math.max(0,Math.min(1,s.volume)):.65;s.travelLine=Math.max(0,Math.min((current(s).travel?.length||1)-1,Math.floor(Number(s.travelLine)||0)));s.muted=!!s.muted;s.reduced=!!s.reduced;if(s.phase==='travel'){s.dialogue=null;}
 if(s.dialogue){const group=resolve(s,s.dialogue);if(!group?.rows?.length){if(s.dialogue.kind==='exit')s.phase='travel';s.dialogue=null;}else s.dialogue.line=Math.min(Math.max(0,Math.floor(s.dialogue.line)||0),group.rows.length-1);}return s;}
export const current=s=>scenes[s.index];
export function resolve(s,d=s.dialogue){if(!d)return null;const c=current(s);if(d.kind==='intro'||d.kind==='exit')return {id:d.kind,rows:c[d.kind]};const g=(d.kind==='topic'?c.topics:c.stories).find(x=>x.id===d.id);return d.kind==='waiting'&&g?{...g,rows:g.waiting||[]}:g;}
export const key=(s,id)=>current(s).id+':'+id;
export const completed=(s,id)=>!!s.done[key(s,id)];
export const ready=(s,h)=>(h.requires||[]).every(id=>completed(s,id));
export function begin(s,kind,id){const d={kind,id,line:0},group=resolve(s,d);if(!group)return false;if(kind==='story'&&!ready(s,group)){if(!group.waiting?.length)return false;s.dialogue={kind:'waiting',id,line:0};return true;}const cursor=s.cursors[key(s,kind+':'+id)];d.line=Math.min(cursor||0,group.rows.length-1);s.dialogue=d;return true;}
export function advance(s){const d=s.dialogue,g=resolve(s);if(!g)return 'none';const ck=key(s,d.kind+':'+d.id);if(d.line<g.rows.length-1){d.line++;s.cursors[ck]=d.line;return 'line';}delete s.cursors[ck];s.dialogue=null;
 if(d.kind==='waiting')return 'explore';
 if(d.kind==='topic'){s.read[key(s,d.id)]=true;return 'menu';}
 if(d.kind==='intro'){s.phase='explore';return 'explore';}
 if(d.kind==='exit'){s.phase='travel';return 'travel';}
 s.done[key(s,d.id)]=true;
 if(current(s).stories.filter(x=>x.required).every(x=>completed(s,x.id))){if(!current(s).exit.length){s.phase='travel';return 'travel';}s.phase='exit';begin(s,'exit','exit');return 'exit';}return 'explore';
}
export function enter(s,index){s.index=index;s.phase='intro';s.dialogue={kind:'intro',id:'intro',line:0};s.finished=false;}
