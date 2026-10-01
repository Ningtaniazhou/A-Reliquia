import {MARY_SIGNATURE} from '../ui/mary-stationery.js';
// Optional observations: no inventory, currency balance, or plot prerequisites.
export function inspectionSpots(a){const all={
 lobby:a.stage>=1?[{id:'ledger',x:590,markerX:590,y:345,label:'查看登记簿'}]:[],
 shop:[{id:'gloves',x:345,y:310,label:'查看手套'},{id:'shopCard',x:710,y:330,label:'查看店卡'},{id:'cat',x:835,y:360,label:'看看白猫'}],
 dining:[{id:'restaurantMenu',x:375,y:345,label:'查看餐厅菜单'}],
 room:[{id:'writing',x:755,y:370,label:'查看纸笔'}]
};return (all[a.room]||[]).map(p=>({...p,inspect:true}));}
export const inspectionDialogue=(id,stage)=>id==='restaurantMenu'&&stage>=3?'restaurantMenuMary':id;
// Fictional adaptation prices in a common accounting unit, not historical quotations.
export const menuPrices=`<table aria-label="餐厅价目表"><caption>价目表 · 银币</caption><tbody><tr><th>面包与橄榄</th><td>1 / 份</td></tr><tr><th>蔬菜汤</th><td>2 / 份</td></tr><tr><th>烤鱼</th><td>5 / 份</td></tr><tr><th>烤肉</th><td>6 / 份</td></tr><tr class="wine"><th>陈年葡萄酒</th><td>30 / 瓶</td></tr><tr class="wine"><th>香槟</th><td>60 / 瓶</td></tr></tbody></table>`;
// A small paper menu resting on the dining-room sideboard, on the same 2px grid.
export function drawMenu(c){c.fillStyle='#503d29';c.fillRect(364,366,30,24);c.fillStyle='#ebd4a1';c.fillRect(366,364,26,22);c.fillStyle='#a28352';c.fillRect(378,366,2,18);for(let y=368;y<384;y+=4){c.fillRect(368,y,8,2);c.fillRect(382,y,8,2);}}

// Cream shop card beside the counter gloves; lettering remains separate from the art.
export function drawShopCard(c){c.save();c.fillStyle='#74512f';c.fillRect(682,351,60,39);c.fillStyle='#efdfb8';c.fillRect(684,349,56,37);c.strokeStyle='#b79561';c.strokeRect(688,353,48,29);c.fillStyle='#63432b';c.textAlign='center';c.textBaseline='middle';c.font='italic 600 16px Georgia, serif';c.fillText(MARY_SIGNATURE,712,367,44);c.restore();}

export function drawLedger(c){c.fillStyle='#52372c';c.fillRect(575,390,40,23);c.fillStyle='#ead7ad';c.fillRect(577,388,36,21);c.fillStyle='#987a4e';c.fillRect(594,389,2,18);for(let y=392;y<407;y+=4){c.fillRect(580,y,11,1);c.fillRect(598,y,11,1);}}
