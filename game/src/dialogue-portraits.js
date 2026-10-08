import {paperPortrait,portraitMarkup} from './ui/character-portraits.js';
import {dialoguePortraitName} from './ui/dialogue-speaker.js';
import {portraits} from './portrait-data.js';
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../styles/dialogue-portraits.css',import.meta.url);document.head.append(style);
const aliases={'姨姨':'aunt','小特奥多里科':'child','特奥多里科':'teo','特奥多里克':'teo','阿德里亚':'adelia','阿德里娅':'adelia','阿德莉娅':'adelia','马蒂亚斯':'matias','卡西米罗神父':'casimiro','皮涅罗神父':'pinheiro','马加里德博士':'margaride'};
const src=id=>new URL(`../assets/portraits/${id}.webp`,import.meta.url).href;
let queued=false;
const loaded=new Map();
function imageReady(url){if(loaded.has(url))return loaded.get(url);const i=new Image();loaded.set(url,false);i.src=url;i.decode().then(()=>{loaded.set(url,true);schedule();}).catch(()=>{loaded.set(url,true);schedule();});return false;}
for(const id of Object.keys(portraits))imageReady(src(id));
imageReady(new URL('../assets/portraits/teo-sad.webp',import.meta.url).href);
imageReady(new URL('../assets/portraits/shared-v1/aunt-expressions.webp',import.meta.url).href);
function sync(){queued=false;
 for(const old of document.querySelectorAll('.dialogue-bust'))if(!old._panel?.isConnected)old.remove();
 for(const panel of document.querySelectorAll('.arrival-dialogue,#dialogue,#subtitle')){
 if(panel.matches('.paper-scroll')){if(panel.classList.contains('portrait-dialogue'))panel.classList.remove('portrait-dialogue');if(panel._bust)panel._bust.hidden=true;continue;}
 const name=dialoguePortraitName(panel);
 let id=aliases[name];
 const game=document.querySelector('#game');
 if(id==='adelia'&&(game?.dataset.romanceScene==='door'||document.querySelector('#play')?.dataset.scene==='door'))id='adelia-cold';
 if(id==='aunt'&&document.querySelector('#play')?.dataset.scene==='exit')id='aunt-farewell';
 if(id==='aunt'&&document.querySelector('#portrait-art.tear'))id='aunt-tear';
 const sadTeo=id==='teo'&&(game?.dataset.romanceScene==='door'||document.querySelector('#play')?.dataset.scene==='door');
 const emotion=sadTeo?'sad':id==='aunt'&&document.querySelector('#game')?.dataset.phase==='response'?'soft':id==='aunt'&&document.querySelector('#game')?.dataset.phase==='fail'?'angry':'stern';const asset=id?paperPortrait(id,emotion):null;

 panel.classList.toggle('portrait-dialogue',!!asset);
 panel.dataset.portraitReady=String(!asset||imageReady(asset.src));
 const r=panel.getBoundingClientRect(),cs=getComputedStyle(panel);
 const visible=id&&r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&!panel.closest('[hidden]');
 let bust=panel._bust;
 if(!bust){bust=document.createElement('div');bust.className='dialogue-bust';bust._panel=panel;panel._bust=bust;panel.prepend(bust);new ResizeObserver(schedule).observe(panel);}
 bust.hidden=!visible;if(!visible)continue;
 if(asset&&bust.dataset.person!==asset.id){bust.dataset.person=asset.id;bust.innerHTML=portraitMarkup(asset);}
 // Portrait shares the panel background and stays inside its left column.
 bust.style.cssText='';
 }
}
function schedule(){if(!queued){queued=true;queueMicrotask(sync);}}
// A chapter redirect can finish loading this module while the old document is unloading.
if(document.body)new MutationObserver(mutations=>{if(mutations.some(m=>!m.target.closest?.('.dialogue-bust')))schedule();}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','data-phase','data-scene','data-romance-scene']});
document.addEventListener('reliquia:dialogue-layout',schedule);window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);document.fonts.ready.then(schedule);schedule();
