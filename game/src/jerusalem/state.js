import {relicItems} from './chapter-content.js';
import {dialogue,topicIds,arrival,letters} from './content.js';
export const SAVE_KEY='reliquia.jerusalem-study.v1';
export const WIDTH=2880, VIEW=960;
export const initial=()=>({version:2,room:'street',x:140,facing:1,arrival:0,checked:false,potteMet:false,windowSeen:false,letter:'none',letterPage:0,asked:[],seen:[],cursors:{},dialogue:null,letterOpen:false,complete:false,endSeen:false,items:['mary-parcel'],fatmeStage:0,fatmePaid:0,scholarInvited:false,arranged:false,campVisited:false,thorn:0,toasted:false,danced:false,bridgeElapsed:0,bridgeLine:0,celebration:false});
const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(v)?v:a));
export function normalize(raw){
 const s={...initial(),...raw};s.version=2;
 if(!['street','lobby','room','fatmeRoom','forecourt','holy','camp','wild'].includes(s.room))s.room='street';
 s.checked=!!s.checked;if(!s.checked&&s.room==='room')s.room='lobby';
 s.x=clamp(s.x,55,s.room==='street'?WIDTH-55:905);s.facing=s.facing===-1?-1:1;
 s.arrival=Math.floor(clamp(s.arrival,0,arrival.length));s.windowSeen=!!s.windowSeen;
 if(!['none','sealed','sent'].includes(s.letter))s.letter='none';
 s.letterPage=Math.floor(clamp(s.letterPage,0,letters.length-1));s.letterOpen=!!s.letterOpen&&s.checked&&s.room==='room';
 s.asked=[...new Set((Array.isArray(s.asked)?s.asked:[]).filter(id=>topicIds.includes(id)))];
 s.seen=[...new Set((Array.isArray(s.seen)?s.seen:[]).filter(id=>id in dialogue))];
 s.potteMet=!!s.potteMet||[...s.seen,...s.asked].some(id=>/^(potte|route)/.test(id)||id==='fatmeArrange')||!!s.campVisited||['forecourt','holy','camp','wild'].includes(s.room);
 s.cursors=Object.fromEntries(Object.entries(s.cursors&&typeof s.cursors==='object'?s.cursors:{}).filter(([id])=>id in dialogue).map(([id,n])=>[id,Math.floor(clamp(n,0,dialogue[id].rows.length-1))]));
 if(!(s.dialogue in dialogue)||s.dialogue==='pottePacking')s.dialogue=null;
 s.fatmeStage=Math.floor(clamp(s.fatmeStage,0,3));s.fatmePaid=Math.floor(clamp(raw?.fatmePaid??Math.min(2,s.fatmeStage),0,2));s.arranged=!!s.arranged;s.campVisited=!!s.campVisited;
 s.scholarInvited=!!s.scholarInvited||s.dialogue==='treeScholar'||s.seen.includes('treeScholar')||Number(s.thorn)>0;
 s.fatmeAnchor=clamp(raw?.fatmeAnchor??680,470,680);
 s.thorn=Math.floor(clamp(s.thorn,0,3));s.toasted=!!s.toasted&&s.thorn===3;s.danced=!!s.danced&&s.toasted;
 const valid=new Set(relicItems.map(i=>i.id));s.items=[...new Set(['mary-parcel',...(s.letter==='sealed'?['aunt-letter']:[]),...(Array.isArray(s.items)?s.items.filter(id=>valid.has(id)&&!id.startsWith('thorn-')):[])])];
 if(s.thorn)s.items.push(['','thorn-branch','thorn-crown','thorn-parcel'][s.thorn]);
 s.celebration=!!s.celebration&&s.thorn===3;
 s.bridgeElapsed=clamp(s.bridgeElapsed,0,20);s.bridgeLine=Math.floor(clamp(s.bridgeLine,0,3));
 s.complete=!!s.complete&&s.danced;s.endSeen=!!s.endSeen&&s.complete;
 if(['forecourt','holy','camp','wild'].includes(s.room)&&(!s.checked||!s.windowSeen)){s.room='street';s.x=1595;}
 if(['camp','wild'].includes(s.room)&&!holyDone(s)){s.room='forecourt';s.x=140;s.dialogue=null;s.celebration=false;s.complete=false;s.endSeen=false;s.bridgeElapsed=0;s.bridgeLine=0;}
 return s;
}
export function begin(s,id){if(!(id in dialogue))return s;return {...s,dialogue:id,letterOpen:false,scholarInvited:s.scholarInvited||id==='treeScholar'};}
export function finish(s,id){
 const event=dialogue[id]?.event;if(!event&&!dialogue[id])return s;
 const next={...s,dialogue:null,cursors:{...s.cursors,[id]:0},seen:[...new Set([...s.seen,id])],asked:topicIds.includes(id)?[...new Set([...s.asked,id])]:s.asked};
 if(/^(potte|route)/.test(id)||id==='fatmeArrange')next.potteMet=true;
 if(event==='checkin')next.checked=true;
 if(event==='window')next.windowSeen=true;
 if(event==='letter'){next.letterOpen=true;next.letterPage=0;}
 if(event==='seal'&&s.checked){next.letter='sealed';next.items=[...new Set([...s.items,'aunt-letter'])];}
 if(event==='send'&&s.letter==='sealed'){next.letter='sent';next.items=s.items.filter(id=>id!=='aunt-letter');}
 if(event==='arrange')next.arranged=true;
 if(event==='fatmeWelcome')next.fatmeStage=Math.max(1,s.fatmeStage);
 if(event==='fatmeOffer')next.fatmeStage=Math.max(2,s.fatmeStage);
 if(event==='fatmeDone')next.fatmeStage=3;
 if(event==='campVisited')next.campVisited=true;
 for(const [e,item] of [['wood','relic-wood'],['straw','relic-straw'],['beads','relic-beads']])if(event===e)next.items=[...new Set([...s.items,item])];
 let stage=s.thorn;
 if(event==='cut'&&s.seen.includes('treeScholar'))stage=Math.max(stage,1);
 if(event==='craft'&&stage===1)stage=2;
 if(event==='pack'&&stage===2)stage=3;
 if(stage!==s.thorn){next.thorn=stage;next.items=[...s.items.filter(id=>!id.startsWith('thorn-')),['','thorn-branch','thorn-crown','thorn-parcel'][stage]];}
 if(event==='toast'&&s.thorn===3)next.toasted=true;
 if(event==='fire'&&s.toasted)next.danced=true;
 if(event==='sleep'&&s.danced){next.complete=true;next.endSeen=false;}
 return next;
}
export function advance(s){const id=s.dialogue;if(!id)return s;const n=(s.cursors[id]||0)+1;return n>=dialogue[id].rows.length?finish(s,id):{...s,cursors:{...s.cursors,[id]:n}};}
export function read(store){try{return normalize(JSON.parse(store.getItem(SAVE_KEY)));}catch{return initial();}}
export function save(store,s){try{store.setItem(SAVE_KEY,JSON.stringify(s));return true;}catch{return false;}}

export const purchasedRelics=s=>['relic-wood','relic-straw','relic-beads'].every(id=>s.items.includes(id));
export function holyDone(s){return purchasedRelics(s)&&s.seen.includes('tomb')&&s.seen.includes('calvary');}
export function travelReady(s){return s.checked&&s.windowSeen&&s.potteMet;}
