import {topics,opening,ending} from './dialogue.js';
export class MaltaEncounter{
 constructor(v){this.v=v;this.open=false;this.selected=0;this.page=0;this.rows=[];this.topic=null;this.phase='choices';this.reviewed=new Set();
 const box=document.createElement('div');box.className='malta-encounter';box.innerHTML=`<button class="malta-portrait" hidden aria-label="询问托普修斯"><img src="./assets/malta/topsius-portrait.webp" alt="托普修斯"><kbd>R</kbd></button><section class="malta-speech" hidden aria-label="学者对话"><span></span><p></p><button data-close aria-label="结束本次交谈">暂别</button><button data-next>继续 <kbd aria-label="空格键">␣</kbd></button></section><section class="malta-options" hidden aria-label="选择话题"><small>特奥多里科</small><div></div><footer>W / S 选择　␣ 空格确认　Esc 暂离</footer></section>`;v.el.append(box);this.el=box;this.portrait=box.querySelector('.malta-portrait');this.speech=box.querySelector('.malta-speech');this.options=box.querySelector('.malta-options');this.portrait.onclick=()=>this.open?this.close():this.begin();box.querySelector('[data-close]').onclick=()=>{if(!v.paused)this.close();};box.querySelector('[data-next]').onclick=()=>this.next();
 const saved=v.s.encounter;if(saved&&['malta','onward'].includes(v.s.scene)){this.phase=['opening','topic','ending','choices'].includes(saved.phase)?saved.phase:'choices';this.topic=topics.some(t=>t.id===saved.topic)?saved.topic:null;this.rows=this.phase==='opening'?opening:this.phase==='ending'?ending:this.phase==='topic'?topics.find(t=>t.id===this.topic)?.pages||[]:[];if(this.phase!=='choices'&&!this.rows.length)this.phase='choices';this.page=Math.max(0,Math.min(this.rows.length-1,Math.floor(saved.page)||0));this.selected=Math.max(0,Math.min(topics.length-1,Math.floor(saved.selected)||0));this.reviewed=new Set((saved.reviewed||[]).filter(id=>topics.some(t=>t.id===id)));this.open=!!saved.open;}
 }
 snapshot(){return {open:this.open,phase:this.phase,topic:this.topic,page:this.page,selected:this.selected,reviewed:[...this.reviewed]};}
 save(){this.v.persist();}
 available(){const read=this.v.s.scholarUnlocked?this.reviewed:new Set(this.v.s.maltaAsked);return topics.filter(t=>!read.has(t.id));}
 begin(){const v=this.v;if(!['malta','onward'].includes(v.s.scene)||v.paused||v.auto||v.inventory||v.dialogue)return;v.keys.clear();v.target=null;v.moving=false;this.open=true;
  if(v.s.scholarUnlocked){this.reviewed.clear();this.phase='choices';this.selected=0;}
  else if(v.s.maltaAsked.length===topics.length){this.rows=ending;this.page=0;this.phase='ending';}
  else if(!this.rows.length&&v.s.maltaAsked.length){this.phase='choices';this.selected=0;}
  else if(!this.rows.length){this.rows=opening;this.page=0;this.phase='opening';}
  this.save();this.render();v.ui();}
 close(){this.open=false;this.save();this.render();this.v.ui();this.v.el.focus({preventScroll:true});}
 next(){if(!this.open||this.v.paused)return;if(this.phase==='choices'){const t=this.available()[this.selected];if(!t)return;this.topic=t.id;this.rows=t.pages;this.page=0;this.phase='topic';this.save();this.render();return;}
  if(++this.page<this.rows.length){this.save();this.render();return;}
  if(this.phase==='ending'){this.v.dispatch('SCHOLAR_UNLOCK');this.rows=[];this.close();return;}
  if(this.phase==='opening')this.v.dispatch('MALTA_ASK:wall');
  if(this.phase==='topic'){if(this.v.s.scholarUnlocked)this.reviewed.add(this.topic);else this.v.dispatch('MALTA_ASK:'+this.topic);}
  if(!this.v.s.scholarUnlocked&&this.v.s.maltaAsked.length===topics.length){this.phase='ending';this.rows=ending;this.page=0;}
  else if(!this.available().length){this.close();return;}else{this.phase='choices';this.selected=Math.min(this.selected,this.available().length-1);}
  this.save();this.render();}
 key(code){if(!this.open)return false;if(['Escape','KeyR'].includes(code)){this.close();return true;}if(code==='Space'){this.next();return true;}if(code==='KeyE'){return true;}if(code==='Enter')return true;if(['KeyW','KeyS'].includes(code)&&this.phase==='choices'){const n=this.available().length;this.selected=(this.selected+(code==='KeyS'?1:-1)+n)%n;this.render();}return true;}
 render(){const v=this.v;this.portrait.hidden=!v.s.scholarUnlocked||!['malta','onward'].includes(v.s.scene);this.portrait.inert=!!v.auto||v.inventory||!!v.dialogue;this.speech.hidden=!this.open;this.options.hidden=!this.open||this.phase!=='choices';this.options.querySelector('div').replaceChildren();if(!this.open)return;
  const row=this.phase==='choices'?['托普修斯','您还想知道什么？']:this.rows[Math.min(this.page,this.rows.length-1)];this.speech.classList.toggle('is-scholar',row[0]==='托普修斯');this.speech.querySelector('span').textContent=row[0];this.speech.querySelector('p').textContent=row[1];this.speech.querySelector('[data-next]').hidden=this.phase==='choices';
  if(this.phase==='choices')this.available().forEach((t,i)=>{const b=document.createElement('button');b.textContent=t.label;b.classList.toggle('selected',i===this.selected);b.onclick=()=>{this.selected=i;this.next();};this.options.querySelector('div').append(b);});
 }
}
