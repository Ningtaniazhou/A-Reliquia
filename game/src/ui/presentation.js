// One layout contract for black intertitles and dialogue within the pixel stage.
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('../../styles/ui/presentation.css',import.meta.url);document.head.append(sheet);
const blackSelector='[data-black-narration],.arrival-scene.narration .arrival-dialogue,#game[data-romance-scene="narration"] #dialogue,#play[data-scene="black"] #dialogue,.alex-black,.j-black,#intertitle,#journey:has(#journey-words),body:has(.voyage-screen) #journey';
function layout(){
 const blacks=new Set(document.querySelectorAll(blackSelector));
 for(const p of document.querySelectorAll('.shared-black'))if(!blacks.has(p))p.classList.remove('shared-black');
 for(const p of blacks)p.classList.add('shared-black');
 const canvas=document.querySelector('.voyage-stage canvas,.voyage-screen canvas');
 for(const p of document.querySelectorAll('[data-pixel-dialogue],.voyage-dialogue,.malta-speech,.alex-talk,.j-talk')){
  const active=!!canvas&&!document.body.classList.contains('home-mode');p.classList.toggle('shared-pixel-dialogue',active);
  if(!active||p.hidden)continue;
  const r=canvas.getBoundingClientRect(),parent=p.offsetParent?.getBoundingClientRect()||{top:0,left:0};
  const top=Math.max(82,r.top+r.height*.1),width=Math.min(760,r.width*.82);
  p.style.setProperty('--talk-top',`${top-parent.top}px`);p.style.setProperty('--talk-left',`${r.left+r.width/2-parent.left}px`);p.style.setProperty('--talk-width',`${width}px`);p.style.setProperty('--talk-max-height',`${Math.min(r.height*.59,innerHeight-top-28)}px`);
 }
 requestAnimationFrame(layout);
}
requestAnimationFrame(layout);
