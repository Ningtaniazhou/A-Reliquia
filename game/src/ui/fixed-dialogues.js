import {preparePortraitPanel} from './portrait-layout.js';
import {isPhone} from './mobile.js';
const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('../../styles/ui/fixed-dialogues.css',import.meta.url);document.head.append(link);
// Measure all dialogue pages for this chapter, never the currently displayed sentence.
const files={
 arrival:['arrival/content'],boss:['boss/content','adelia/content'],departure:['departure/content'],
 voyage:['voyage/content'],malta:['malta/dialogue'],alexandria:['alexandria/content'],jerusalem:['jerusalem/content'],
 chapter4:['chapter4/content'],chapter5:['chapter5/content','chapter5/journey-content'],chapter6:['chapter6/content'],chapter7:['chapter7/content']
};
const cache=new Map();
function collect(value,out=[]){
 if(!value||typeof value!=='object')return out;
 if(value.mode==='narration'||['narration','black'].includes(value.scene))return out;
 if(Array.isArray(value)&&value.length>=2&&typeof value[0]==='string'&&typeof value[1]==='string'){out.push(value[1]);return out;}
 for(const [key,v] of Object.entries(value)){
  if(['bridges','newItems','itemDescriptions','objects','sourceNote','records','textRecords','narrationRecords'].includes(key))continue;
  if(typeof v==='string'&&['text','zh','question','success','failure','say','reply'].includes(key))out.push(v);
  else if(typeof v==='object')collect(v,out);
 }return out;
}
function spokenCorpus(key,m){
 if(key==='voyage')return m.conversations;
 if(key==='malta')return [m.opening,m.ending,m.topics.map(t=>t.pages)];
 if(key==='jerusalem')return [m.dialogue,m.contextualScholarRows.map(v=>v.row)];
 if(key==='alexandria')return m.dialogue;
 if(key==='chapter6')return [Object.entries(m.groups).filter(([id])=>id!=='eveningBlack').flatMap(([,rows])=>rows.map(({text})=>({text}))),m.cards.map(({say,reply})=>({say,reply}))];
 if(key==='chapter7')return m.scenes;
 return m;
}
export function dialoguePages(key){if(!cache.has(key))cache.set(key,Promise.all(files[key].map(f=>import(new URL('../'+f+'.js',import.meta.url)))).then(ms=>[...new Set(ms.flatMap(m=>collect(spokenCorpus(key,m))))]));return cache.get(key);}
const path=location.pathname;
const chapter=/chapter[4567]/.exec(path)?.[0]||(path.includes('boss')?'boss':path.includes('departure')?'departure':path.includes('jerusalem')?'voyage':'arrival');
const specs=[['.arrival-dialogue','.arrival-zh','arrival'],['#dialogue','#words,#line,#speech,.line',chapter],['.c7-dialogue','p','chapter7'],['.voyage-dialogue','p','voyage'],['.malta-speech','p','malta'],['.alex-talk','p','alexandria'],['.j-talk','p',path.includes('chapter5')?'chapter5':'jerusalem']];
const shownText=new WeakMap();
const pending=new WeakSet(),measurements=new Map();let fitted=new WeakMap();
const portraitLoads=new Map();
function nativePortraitReady(panel){
 const urls=[...panel.querySelectorAll('#portrait img,.c7-portrait img')].map(i=>i.currentSrc||i.src);
 for(const node of panel.querySelectorAll('#portrait .shared-portrait,.c7-portrait .shared-portrait')){const match=/url\(["']?(.*?)["']?\)/.exec(node.style.backgroundImage);if(match)urls.push(match[1]);}
 let ready=true;for(const url of urls){if(!portraitLoads.has(url)){const img=new Image();img.src=url;portraitLoads.set(url,img.complete&&img.naturalWidth>0);if(!portraitLoads.get(url))img.decode().catch(()=>{}).then(()=>{portraitLoads.set(url,true);schedule();});}if(!portraitLoads.get(url))ready=false;}panel.dataset.nativePortraitReady=String(ready);
}
function scan(){
 for(const [selector,textSelector,key] of specs)for(const panel of document.querySelectorAll(selector)){
  if(panel.matches('.paper-scroll'))continue;
  if(panel.hidden||!panel.getClientRects().length||panel.matches('.shared-black')){if(panel.classList.contains('chapter-dialogue-fixed'))panel.classList.remove('chapter-dialogue-fixed');continue;}
  preparePortraitPanel(panel);
  const text=panel.querySelector(textSelector);if(!text)continue;nativePortraitReady(panel);
  if(!panel.classList.contains('chapter-dialogue-fixed'))panel.classList.add('chapter-dialogue-fixed');
  const style=getComputedStyle(text),pstyle=getComputedStyle(panel),width=Math.max(40,text.clientWidth||panel.clientWidth-parseFloat(pstyle.paddingLeft)-parseFloat(pstyle.paddingRight));
  const signature=[key,width,style.font,style.lineHeight,style.letterSpacing,style.whiteSpace,pstyle.padding,innerHeight,isPhone()].join('|');
  if(shownText.get(text)!==text.textContent){text.scrollTop=0;panel.scrollTop=0;shownText.set(text,text.textContent);}
  if(fitted.get(panel)===signature||pending.has(panel))continue;
  const apply=({height,count,longest,textHeight})=>{panel.style.setProperty('--chapter-dialogue-height',height+'px');if(key==='boss')document.documentElement.style.setProperty('--cards-dialogue-height',height+'px');if(key==='chapter4')document.documentElement.style.setProperty('--scene-dialogue-height',height+'px');panel.dataset.dialogueLongest=longest;panel.dataset.dialogueTextHeight=textHeight;panel.dataset.dialogueCorpus=key;panel.dataset.dialoguePages=count;panel.dataset.dialogueMeasuredHeight=height;panel.dataset.dialogueReady='true';fitted.set(panel,signature);document.dispatchEvent(new Event('reliquia:dialogue-layout'));};
  if(measurements.has(signature)){apply(measurements.get(signature));continue;}
  panel.dataset.dialogueReady='false';pending.add(panel);dialoguePages(key).then(rows=>{
   const probe=document.createElement('div');Object.assign(probe.style,{position:'fixed',left:'-10000px',visibility:'hidden',width:width+'px',font:style.font,lineHeight:style.lineHeight,letterSpacing:style.letterSpacing,whiteSpace:style.whiteSpace});document.body.append(probe);
   let max=0,longest='';for(const row of rows){probe.textContent=row;const h=probe.getBoundingClientRect().height;if(h>max||(h===max&&row.length>longest.length)){max=h;longest=row;}}probe.remove();
   const speaker=panel.querySelector(':scope > #speaker,:scope > .speaker,:scope > small,:scope > .voyage-speaker,:scope > span');
   const speakerHeight=Math.max(isPhone()?18:24,speaker?.getBoundingClientRect().height||0);
   const reserve=parseFloat(pstyle.paddingTop)+parseFloat(pstyle.paddingBottom)+speakerHeight+8+2;
   const height=Math.ceil(max+reserve);
   const measured={height,count:rows.length,longest,textHeight:max};measurements.set(signature,measured);if(panel.isConnected)apply(measured);
  }).catch(e=>console.error('Dialogue size corpus',key,e)).finally(()=>pending.delete(panel));
 }
}
// Run after chapter rendering, and only recompute measurements for a changed viewport/font.
let queued=false;
function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;scan();});}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,characterData:true});
window.addEventListener('resize',()=>{fitted=new WeakMap();schedule();});
link.addEventListener('load',schedule);document.fonts.ready.then(()=>{fitted=new WeakMap();measurements.clear();schedule();});schedule();
