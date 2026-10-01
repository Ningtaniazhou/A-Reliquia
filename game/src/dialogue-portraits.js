import {paperPortrait,portraitMarkup} from './ui/character-portraits.js';
import {portraits} from './portrait-data.js';
const style=document.createElement('link');style.rel='stylesheet';style.href=new URL('../styles/dialogue-portraits.css',import.meta.url);document.head.append(style);
const aliases={'姨姨':'aunt','小特奥多里科':'child','特奥多里科':'teo','特奥多里克':'teo','阿德里亚':'adelia','阿德莉娅':'adelia','马蒂亚斯':'matias','卡西米罗神父':'casimiro','皮涅罗神父':'pinheiro','马加里德博士':'margaride'};
const src=id=>new URL(`../assets/portraits/${id}.webp`,import.meta.url).href;
for(const id of Object.keys(portraits)){const i=new Image();i.src=src(id);}
let queued=false;
function sync(){queued=false;
 for(const old of document.querySelectorAll('.dialogue-bust'))if(!old._panel?.isConnected)old.remove();
 for(const panel of document.querySelectorAll('.arrival-dialogue,#dialogue,#subtitle')){
 const speaker=panel.querySelector('.speaker,#speaker');const name=speaker?.textContent.trim()||'';
 let id=aliases[name.split(' · ')[0]];
 if(name.includes('回忆')||name.includes('/')||!speaker||getComputedStyle(speaker).display==='none')id=null;
 const game=document.querySelector('#game');
 if(id==='adelia'&&(game?.dataset.romanceScene==='door'||document.querySelector('#play')?.dataset.scene==='door'))id='adelia-cold';
 if(id==='aunt'&&document.querySelector('#play')?.dataset.scene==='exit')id='aunt-farewell';
 if(id==='aunt'&&document.querySelector('#portrait-art.tear'))id='aunt-tear';
 const r=panel.getBoundingClientRect(),cs=getComputedStyle(panel);
 const visible=id&&r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&!panel.closest('[hidden]');
 let bust=panel._bust;
 if(!bust){bust=document.createElement('div');bust.className='dialogue-bust';bust._panel=panel;panel._bust=bust;panel.parentNode.insertBefore(bust,panel);new ResizeObserver(schedule).observe(panel);}
 bust.hidden=!visible;if(!visible)continue;
 const p=portraits[id];
 const emotion=id==='aunt'&&document.querySelector('#game')?.dataset.phase==='response'?'soft':id==='aunt'&&document.querySelector('#game')?.dataset.phase==='fail'?'angry':'stern';const asset=paperPortrait(id,emotion);if(bust.dataset.person!==asset.id){bust.dataset.person=asset.id;bust.innerHTML=portraitMarkup(asset);}
 // The crop removes the rounded base. Two physical pixels sit behind the panel edge.
 const z=Number.parseInt(cs.zIndex)||7;
 const next=`left:${r.left+Math.min(24,r.width*.015)}px;top:${r.top-r.height+2}px;height:${r.height}px;width:${r.height*1.4}px;z-index:${z-1}`;
 if(bust.style.cssText!==next)bust.style.cssText=next;
 }
}
function schedule(){if(!queued){queued=true;requestAnimationFrame(sync);}}
// A chapter redirect can finish loading this module while the old document is unloading.
if(document.body)new MutationObserver(mutations=>{if(mutations.some(m=>!m.target.closest?.('.dialogue-bust')))schedule();}).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class','data-phase','data-scene','data-romance-scene']});
window.addEventListener('resize',schedule);window.addEventListener('orientationchange',schedule);document.fonts.ready.then(schedule);schedule();
