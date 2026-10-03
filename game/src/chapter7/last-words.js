import {isPhone} from '../ui/mobile.js';
import {endingTextMatrix} from '../book/page-layout.js';
import {ease} from '../book/motion.js';
// One persistent text block survives the scene-to-paper transition.
export function createLastWords(lines){
 const node=document.createElement('section');node.className='last-words';node.setAttribute('aria-label','特奥多里科最后的心声');
 for(const text of lines){const p=document.createElement('p');p.textContent=text;node.append(p);}return node;
}
export function centerLastWords(node){
 const w=Math.max(240,Math.min(440,innerWidth*.32));node.style.width=w+'px';node.style.fontSize=(isPhone()?14:Math.max(14,Math.min(20,w/22)))+'px';
 const scale=Math.min(isPhone()?1:1.6,innerWidth*.86/w,innerHeight*.68/Math.max(1,node.offsetHeight));
 node.style.transform=`matrix(${scale},0,0,${scale},${(innerWidth-w*scale)/2},${(innerHeight-node.offsetHeight*scale)/2})`;
}

export function settleLastWords(node,progress){
 centerLastWords(node);
 const m=new DOMMatrix(node.style.transform),from=[m.a,m.b,m.c,m.d,m.e,m.f];
 const target=endingTextMatrix(innerWidth,innerHeight,node.offsetWidth,node.offsetHeight),q=ease(Math.max(0,Math.min(1,progress)));
 node.style.transform=`matrix(${target.map((v,i)=>from[i]+(v-from[i])*q).join(',')})`;
 node.style.color=`rgb(${[255,244,219].map(v=>Math.round(v*(1-q))).join(',')})`;
 node.style.textShadow=`0 1px 8px rgba(0,0,0,${1-q})`;
}
