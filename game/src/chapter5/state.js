import {opening,breakfast,meals,scholar,bottles,scenery} from './content.js';
import {journey,bridges,bridgePages} from './journey-content.js';
export const groups={opening,breakfast,scholar,bottles,...meals,...scenery,...journey};
export const initial=()=>({version:2,scene:'camp',x:335,facing:1,meal:null,mealRead:false,scholarRead:false,bottlesRead:false,opened:false,volume:.65,muted:false,reduced:false,dialogue:null,choice:false,items:['thorn-parcel'],read:[],cursors:{},seenLines:[],smallPacked:false,packingVersion:2,packed:false,returned:false,given:false,bridge:null,complete:false});
export function normalize(raw={}){
 const s={...initial(),...raw,version:2};
 if(raw.packingVersion!==2){s.smallPacked=!!raw.packed;if(raw.dialogue?.id==='pack'){s.dialogue=null;s.cursors={...raw.cursors,pack:0};}s.seenLines=(raw.seenLines||[]).filter(id=>!id.startsWith('C5-J-pack-'));s.packingVersion=2;}
 if(!['camp','nazareth','hotel','spring','lisbon'].includes(s.scene))s.scene='camp';
 s.x=Math.max(55,Math.min(905,Number(s.x)||335));s.volume=Math.max(0,Math.min(1,Number(s.volume)||0));
 s.items=[...new Set(Array.isArray(s.items)?s.items:[])];s.read=Array.isArray(s.read)?s.read:[];s.cursors=s.cursors&&typeof s.cursors==='object'?s.cursors:{};s.seenLines=Array.isArray(s.seenLines)?s.seenLines:[];
 if(!groups[s.dialogue?.id])s.dialogue=null;else s.dialogue.line=Math.max(0,Math.min(groups[s.dialogue.id].length-1,Number(s.dialogue.line)||0));
 if(s.bridge&&!bridges[s.bridge.id])s.bridge=null;
 if(s.bridge)s.bridge={...s.bridge,page:Math.max(0,Math.min(bridgePages(s.bridge.id).length-1,Math.floor(Number(s.bridge.page)||0)))};
 // Mary's parcel is in the room, not in carried luggage. It only returns with the servant.
 s.items=s.items.filter(id=>id!=='mary-parcel'&&!(id==='aunt-letter'&&s.letterSent));
 if(s.dialogue?.id==='returned'&&s.dialogue.line>=4)s.parcelReceived=true;
 if(s.packed)s.smallPacked=true;
 if(s.smallPacked){s.items=s.items.filter(id=>!['relic-wood','relic-straw','relic-beads','c5-small-relics'].includes(id));if(!s.items.includes('c5-small-crate'))s.items.push('c5-small-crate');}
 if(s.packed){s.items=s.items.filter(id=>id!=='thorn-parcel');if(!s.items.includes('c5-relic-box'))s.items.push('c5-relic-box');}
 if((s.returned||s.parcelReceived)&&!s.given&&!s.items.includes('c5-returned-parcel'))s.items.push('c5-returned-parcel');
 if(s.given||!(s.returned||s.parcelReceived))s.items=s.items.filter(id=>id!=='c5-returned-parcel');
 if(!s.read.includes('woman')){s.read=s.read.filter(id=>id!=='springScholar');s.seenLines=s.seenLines.filter(id=>!id.startsWith('C5-J-spring-scholar-'));delete s.cursors.springScholar;if(s.dialogue?.id==='springScholar')s.dialogue=null;}
 return s;
}
export const scholarAvailable=s=>s.scene!=='spring'||s.read.includes('woman');
export function begin(s,id){if(id==='springScholar'&&!scholarAvailable(s))return s;if(!groups[id])return s;return {...s,dialogue:{id,line:s.read.includes(id)?0:s.cursors[id]||0},choice:false};}
export function advance(s){
 if(!s.dialogue)return s;const {id,line}=s.dialogue,rows=groups[id];
 if(line<rows.length-1)return normalize({...s,dialogue:{id,line:line+1},cursors:{...s.cursors,[id]:Math.max(s.cursors[id]||0,line+1)}});
 const next={...s,dialogue:null,read:[...new Set([...s.read,id])],cursors:{...s.cursors,[id]:0}};
 if(id==='hotelIntro'&&!next.packed&&!next.read.includes('hotelNews'))return begin(normalize(next),'hotelNews');
 if(id==='hotelNews'&&!next.packed&&!next.read.includes('hotelAntiquity'))return begin(normalize(next),'hotelAntiquity');
 if(id==='breakfast')next.choice=true;
 if(['tapioca','coffee'].includes(id))next.mealRead=true;
 if(id==='scholar')next.scholarRead=true;
 if(id==='bottles')next.bottlesRead=true;
 if(id==='packSmall')next.smallPacked=true;
 if(id==='pack')next.packed=true;
 if(id==='returned'){next.returned=true;next.bridge={id:'spring',elapsed:0};}
 if(id==='give')next.given=true;
 if(id==='lisbon')next.complete=true;
 return normalize(next);
}
export const canLeaveCamp=s=>s.mealRead&&s.scholarRead;
export function enter(s,scene){
 const next={...s,scene,x:{camp:335,nazareth:140,hotel:850,spring:160,lisbon:335}[scene],facing:scene==='hotel'?-1:1,bridge:null,dialogue:null,choice:false};
 return begin(normalize(next),{nazareth:'nazarethIntro',hotel:'hotelIntro',spring:'springIntro',lisbon:'lisbon'}[scene]);
}
