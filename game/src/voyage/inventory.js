import {items} from './content.js';

export const INVENTORY_COLUMNS=2;
export const STARTING_ITEMS=Object.freeze(['ticket']);
export const itemById=new Map(items.map(item=>[item.id,item]));
export function normalizeItems(value){
 return Array.isArray(value)?[...new Set(value.filter(id=>itemById.has(id)))]:[...STARTING_ITEMS];
}
export function nextItem(index,key,count){
 if(!count)return -1;
 if(key==='KeyA')return index%INVENTORY_COLUMNS?index-1:index;
 if(key==='KeyD')return index%INVENTORY_COLUMNS===0?Math.min(count-1,index+1):index;
 if(key==='KeyW')return Math.max(0,index-INVENTORY_COLUMNS);
 if(key==='KeyS')return Math.min(count-1,index+INVENTORY_COLUMNS);
 return index;
}

// Reusable, item-driven backpack. No scene-specific inventory markup.
export class Backpack {
 constructor(root,{onClose,signal}){
  this.root=root;this.onClose=onClose;this.selected=0;this.detailOpen=false;
  root.innerHTML=`<div class="backpack-panel"><header class="backpack-heading"><div><p>旅途随身物</p><h2 id="backpack-title">旅行背包 <small class="backpack-count"></small></h2></div><button data-bag-close aria-label="合上背包">合上 <kbd>Tab</kbd></button></header><div class="backpack-body"><div class="backpack-leather"><div class="backpack-flap" aria-hidden="true"><i></i><i></i></div><div class="backpack-grid" role="toolbar" aria-label="背包物品"></div></div><aside class="backpack-inspection"><div class="backpack-idle"><span aria-hidden="true">◇</span><p><span class="desktop-instruction"><kbd aria-label="空格键">␣</kbd> 查看 · </span>点击物品查看</p></div><section class="backpack-detail" aria-live="polite" aria-label="物品说明" hidden><div class="backpack-detail-art"></div><p class="backpack-tag">随身物件</p><h3></h3><p class="backpack-description"></p><button data-bag-back>收起说明 <kbd>Esc</kbd></button></section></aside></div><footer class="backpack-footer"><span>W A S D 选择</span><span><kbd aria-label="空格键">␣</kbd> 查看</span><span><kbd>Tab</kbd> 返回旅途</span></footer></div>`;
  this.q=selector=>root.querySelector(selector);
  root.addEventListener('click',event=>{
   if(event.target.closest('[data-bag-close]'))return this.onClose();
   if(event.target.closest('[data-bag-back]'))return this.hideDetail();
   const slot=event.target.closest('[data-item-index]');
   if(slot){this.select(Number(slot.dataset.itemIndex));this.inspect();}
  },{signal});
 }
 open(ids,{checked=false}={}){
  const oldId=this.owned?.[this.selected]?.id;
  this.owned=normalizeItems(ids).map(id=>itemById.get(id));this.checked=checked;this.detailOpen=false;
  this.selected=Math.max(0,this.owned.findIndex(item=>item.id===oldId));
  this.root.hidden=false;
  this.q('.backpack-count').textContent=`${this.owned.length} 件`;
  const grid=this.q('.backpack-grid');grid.replaceChildren();
  const slots=Math.max(6,Math.ceil(this.owned.length/INVENTORY_COLUMNS)*INVENTORY_COLUMNS);
  for(let index=0;index<slots;index++){
   const item=this.owned[index],slot=document.createElement(item?'button':'div');
   slot.className='backpack-slot'+(item?'':' empty');
   if(item){slot.dataset.itemIndex=index;slot.setAttribute('aria-label',item.name);slot.setAttribute('aria-pressed','false');slot.tabIndex=-1;slot.innerHTML=`<img src="${item.icon}" alt="" draggable="false"><span>${item.shortName}</span>`;}
   else {slot.setAttribute('aria-hidden','true');slot.innerHTML='<span>·</span>';}
   grid.append(slot);
  }
  this.select(this.selected);this.renderDetail();
  if(!this.owned.length)this.q('[data-bag-close]').focus({preventScroll:true});
 }
 close(){this.root.hidden=true;}
 select(index){
  this.selected=index;
  for(const slot of this.root.querySelectorAll('[data-item-index]')){
   const selected=Number(slot.dataset.itemIndex)===index;slot.tabIndex=selected?0:-1;slot.setAttribute('aria-pressed',String(selected));
   if(selected){slot.focus({preventScroll:true});slot.scrollIntoView({block:'nearest',inline:'nearest'});}
  }
  this.renderDetail();
 }
 inspect(){if(!this.owned.length)return;this.detailOpen=true;this.renderDetail();}
 hideDetail(){this.detailOpen=false;this.renderDetail();this.select(this.selected);}
 renderDetail(){
  const item=this.owned[this.selected],show=this.detailOpen&&!!item;
  this.q('.backpack-idle').hidden=show;this.q('.backpack-detail').hidden=!show;
  if(!show)return;
  this.q('.backpack-detail-art').innerHTML=`<img src="${item.icon}" alt="">`;
  this.q('.backpack-tag').textContent=item.id==='ticket'?(this.checked?'船票 · 已验票':'船票 · 待查验'):'随身物件';
  this.q('.backpack-detail h3').textContent=item.name;
  this.q('.backpack-description').textContent=item.text;
 }
 key(event){
  const code=event.code;
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyE','Enter','Space','Escape','Tab','KeyW','KeyS','KeyA','KeyD','Home','End','PageUp','PageDown'].includes(code)){event.preventDefault();event.stopImmediatePropagation();}
  if(event.repeat&&!['KeyW','KeyA','KeyS','KeyD'].includes(code))return;
  if(['KeyW','KeyA','KeyS','KeyD'].includes(code)){const index=nextItem(this.selected,code,this.owned.length);if(index>=0)this.select(index);}
  else if(code==='Space'){
   if(event.target.closest('[data-bag-close]'))this.onClose();
   else if(event.target.closest('[data-bag-back]'))this.hideDetail();
   else this.inspect();
  }
  else if(code==='Tab')this.onClose();
  else if(code==='Escape'){if(this.detailOpen)this.hideDetail();else this.onClose();}
 }
}
