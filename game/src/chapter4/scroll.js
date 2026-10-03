import {scenes} from './content.js';
const panel=document.getElementById('dialogue');
const rows=scenes.flatMap(s=>[...s.intro,...s.exit,...s.stories.flatMap(h=>[...h.rows,...(h.waiting||[])]),...s.topics.flatMap(h=>h.rows)]);
function fit(){
 const copy=panel.querySelector('.scroll-copy'),text=document.getElementById('words');
 const style=getComputedStyle(text),cs=getComputedStyle(copy);
 const width=innerWidth*.94-parseFloat(cs.left)-parseFloat(cs.right);
 const probe=document.createElement('p');Object.assign(probe.style,{position:'fixed',left:'-10000px',visibility:'hidden',width:width+'px',margin:'0',font:style.font,lineHeight:style.lineHeight,letterSpacing:style.letterSpacing});document.body.append(probe);
 let max=0;for(const row of rows){probe.textContent=row.text;max=Math.max(max,probe.getBoundingClientRect().height);}probe.remove();
 const speaker=parseFloat(getComputedStyle(document.getElementById('speaker')).lineHeight);
 panel.style.setProperty('--scroll-height',Math.ceil(Math.max(innerWidth>1100?200:0,max+speaker+6+parseFloat(cs.top)+parseFloat(cs.bottom)))+'px');
}
document.fonts.ready.then(fit);window.addEventListener('resize',fit);fit();
