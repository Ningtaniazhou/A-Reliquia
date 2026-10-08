import {displayName} from './conventions.js';
import {portraits} from '../portrait-data.js';
const base=new URL('../../assets/portraits/',import.meta.url);
const epiloguePortraits={'利诺':'portrait-lino','克里斯平':'portrait-crispim','热苏伊娜':'portrait-jesuina','若苏伊娜':'portrait-jesuina'};
export const PAPER_CHARACTERS=Object.freeze({'姨姨':'aunt','小特奥多里科':'child','特奥多里科':'teo','马蒂亚斯':'matias','卡西米罗神父':'casimiro','皮涅罗神父':'pinheiro','马加里德博士':'margaride','阿德里亚':'adelia','阿德里娅':'adelia','阿德莉娅':'adelia'});
export function paperPortrait(id,emotion='stern'){
 if(epiloguePortraits[id])return {id,src:new URL('../../assets/chapter7/'+epiloguePortraits[id]+'.webp',import.meta.url).href,scale:1.24,offset:0};
 if(id==='茹斯蒂诺')return {id,src:new URL('../../assets/chapter6/guest-portrait-3.webp',import.meta.url).href,scale:1,offset:0};
 id=PAPER_CHARACTERS[displayName(id)]||id;
 if(id==='aunt'){const positions={stern:'0% 0%',soft:'100% 0%',shock:'0% 100%',angry:'100% 100%'};return {id:'aunt-'+emotion,src:new URL('shared-v1/aunt-expressions.webp',base).href,position:positions[emotion]||positions.stern};}
 if(id==='teo'&&emotion==='sad')return {id:'teo-sad',src:new URL('teo-sad.webp',base).href,scale:portraits.teo.scale,offset:portraits.teo.offset};
 const p=portraits[id];return p?{id,src:new URL(id+'.webp',base).href,scale:p.scale,offset:p.offset}:null;
}
export function portraitMarkup(p){if(!p)return '';return p.position?`<span class="shared-portrait" data-sheet="true" style="background-image:url('${p.src}');background-position:${p.position}"></span>`:`<span class="shared-portrait" style="--portrait-scale:${p.scale*100}%;--portrait-top:${p.offset*100}%"><img src="${p.src}" alt=""></span>`;}
