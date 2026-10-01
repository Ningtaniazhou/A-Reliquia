import {normalizeAlexandria} from '../alexandria/state.js';
import {normalizeItems,STARTING_ITEMS} from './inventory.js';
export const initialVoyage=()=>({version:2,scene:'title',x:90,checked:false,inventorySeen:false,completed:false,observed:[],items:[...STARTING_ITEMS],facing:1,maltaAsked:[],scholarUnlocked:false,maltaComplete:false});
export function normalizeVoyage(value){
 const v={...initialVoyage(),...value,version:2};
 delete v.packed; // Retired luggage tutorial, including old saves.
 if(!['title','dock','deck','sailing','malta','onward','alexandria'].includes(v.scene))v.scene='title';
 v.x=Number.isFinite(v.x)?Math.max(55,Math.min(1220,v.x)):90;
 v.checked=!!v.checked;v.inventorySeen=!!v.inventorySeen;
 v.completed=v.scene==='alexandria'||v.scene==='sailing'&&!!v.completed;
 if(v.scene==='alexandria')v.alexandria=normalizeAlexandria(v.alexandria);
 v.observed=['sea','rope','cabin'].filter(x=>Array.isArray(v.observed)&&v.observed.includes(x));
 v.maltaAsked=['wall','scholar','books','journey'].filter(id=>Array.isArray(v.maltaAsked)&&v.maltaAsked.includes(id));
 v.scholarUnlocked=!!v.scholarUnlocked&&v.maltaAsked.length===4;v.maltaComplete=!!v.maltaComplete&&v.scholarUnlocked;
 if(v.scene==='onward'&&!v.maltaComplete)v.scene='malta';
 if(v.scene==='malta')v.x=Math.min(910,v.x);
 v.items=normalizeItems(v.items).filter(id=>!v.completed||id!=='ticket');v.facing=v.facing===-1?-1:1;
 if(['deck','sailing','malta','onward','alexandria'].includes(v.scene))v.checked=true;
 return v;
}
export const canDepart=v=>v.checked&&!v.completed;
export function voyageAction(v,action){
 if(action==='ARRIVE_ALEXANDRIA'&&v.scene==='onward'&&v.maltaComplete)return {...v,scene:'alexandria',completed:true,items:v.items.filter(id=>id!=='ticket'),alexandria:normalizeAlexandria(v.alexandria)};
 if(action==='START'&&v.scene==='title')return {...v,scene:'dock',x:90};
 if(action==='TICKET'&&v.scene==='dock'&&v.items.includes('ticket'))return {...v,checked:true};
 if(action==='BOARD'&&v.scene==='dock'&&v.checked&&v.items.includes('ticket'))return {...v,scene:'deck',x:140};
 if(action==='INVENTORY')return {...v,inventorySeen:true};
 if(action==='SAIL'&&v.scene==='deck'&&canDepart(v))return {...v,scene:'sailing',x:1100};
 if(action==='ARRIVE_MALTA'&&v.scene==='sailing')return {...v,scene:'malta',x:135,facing:1};
 if(action.startsWith('MALTA_ASK:')&&v.scene==='malta'&&['wall','scholar','books','journey'].includes(action.slice(10)))return {...v,maltaAsked:[...new Set([...v.maltaAsked,action.slice(10)])]};
 if(action==='SCHOLAR_UNLOCK'&&v.scene==='malta'&&v.maltaAsked.length===4)return {...v,scholarUnlocked:true};
 if(action==='LEAVE_MALTA'&&v.scene==='malta'&&v.scholarUnlocked)return {...v,scene:'onward',x:500,maltaComplete:true};
 // Destination handoff calls this only on FINAL disembarkation, never at a stop
 // or on departure. Alexandria arrival above performs the same final ticket retirement.
 if(action==='DISEMBARK'&&v.scene==='sailing')return {...v,completed:true,items:v.items.filter(id=>id!=='ticket')};
 if(action.startsWith('OBSERVE:'))return {...v,observed:[...new Set([...v.observed,action.slice(8)])]};
 return v;
}
