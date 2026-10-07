import {drawActor} from '../voyage/scale.js';
import {walkFrame} from '../voyage/motion.js';
import {canLeaveCamp} from './state.js';
export const places={camp:'第五章 · 耶里哥营地',nazareth:'加利利 · 拿撒勒',hotel:'耶路撒冷 · 旅馆客房',spring:'归途 · 山路泉边',lisbon:'里斯本 · 姨姨家'};
const at=(id,x,y,label)=>({id,x,y,label});
export function spots(s){return {
 camp:[at('breakfast-table',272,295,'查看早餐'),at('potte',493,302,'与波特交谈'),at('fire',650,300,'查看火堆'),at('stream',755,239,'眺望溪流'),at('tent',857,295,'查看帐篷'),...(canLeaveCamp(s)?[at('leaveCamp',90,300,'启程')]:[])],
 nazareth:[at('nazarethPotte',335,295,'与波特交谈'),at('waterWoman',500,295,'与女子交谈'),at('overlook',700,300,'眺望山下'),...(s.read.includes('overlook')?[at('leaveNazareth',885,300,'继续赶路')]:[])],
 hotel:[...(!s.packed&&!s.read.includes('hotelNews')?[at('hotelNews',320,290,'与波特交谈')]:[]),at('window',256,281,'看看窗外'),...(!s.smallPacked?[at('packSmall',435,302,'收拾小圣物')]:[]),...(s.smallPacked&&!s.packed?[at('pack',620,302,'装好荆棘冠')]:[]),at('wardrobe',764,302,'收拾衣物'),...(s.packed?[at('leaveHotel',878,284,'准备离开')]:[])],
 spring:[at('water',350,245,'查看泉水'),at('woman',695,320,s.given?'与女人交谈':s.read.includes('woman')?'把包裹给她':'走近女人'),...(s.given?[at('leaveSpring',270,300,'继续赶路')]:[])],lisbon:[]
 }[s.scene];}
export function objective(s){return {camp:canLeaveCamp(s)?'骡马已经备好 · 可以启程':'清晨营地 · 与波特交谈',nazareth:s.read.includes('overlook')?'继续赶路':'走到高处，看看远方',hotel:s.packed?'两只箱子已经收好 · 准备离开':s.smallPacked?'把桌上的荆棘冠包裹装进木盒':'先收拾小圣物',spring:s.given?'骑上骡马继续赶路':'石头后面传来哭声',lisbon:''}[s.scene];}
export const files={camp:'jerusalem/camp-day.webp',cook:'jerusalem/cook.png',mule:'jerusalem/mule.png',parcel:'alexandria-study/parcel.png',potteBoots:'chapter5/potte-boots.webp',potte:'jerusalem/potte.png',servant:'jerusalem/porter.png',walk:'voyage/teodorico-walk-8f.png',idle:'voyage/teodorico-idle.png',waterCarrier:'chapter5/nazareth-v02/water-carrier.webp',nazareth:'chapter5/return-v01/nazareth.webp',spring:'chapter5/return-v01/spring.webp',hotel:'jerusalem/room-v03.webp',woman:'chapter5/return-v01/woman.webp',womanParcel:'chapter5/return-v01/woman-parcel.webp',crateOpen:'chapter5/packing-v01/crate-open.webp',crateClosed:'chapter5/packing-v01/crate-closed.webp',wood:'jerusalem/wood.png',beads:'jerusalem/beads.png',straw:'jerusalem/straw.png',boxOpen:'chapter5/packing-v02/box-open.webp',boxClosed:'chapter5/packing-v02/box-closed.webp',lisbon:'chapter6/v02/doorway-v2.webp'};
export const assetsFor=scene=>['walk','idle','parcel',...({camp:['camp','cook','mule','potteBoots'],nazareth:['nazareth','potte','waterCarrier','mule'],hotel:['hotel','boxOpen','boxClosed','crateOpen','crateClosed','wood','beads','straw','potte','servant'],spring:['spring','woman','womanParcel','potte','mule'],lisbon:['lisbon']}[scene])];
// Small relics use distinct coloured wrapping, never the crown parcel's brown paper/red ribbon.
function wrappedRelic(ctx,x,y,w,i){
 const palettes=[['#bea7cb','#816a8c','#e8d39a'],['#a9bd9c','#70866a','#ecd4a1'],['#cdb687','#97805b','#8e5260']];
 const [paper,shade,ribbon]=palettes[i],h=w*.65;
 ctx.fillStyle='#493d36';ctx.fillRect(x-1,y-1,w+2,h+2);
 ctx.fillStyle=paper;ctx.fillRect(x,y,w,h);
 ctx.fillStyle=shade;ctx.fillRect(x,y+h-4,w,4);ctx.fillRect(x+w-3,y,3,h);
 ctx.fillStyle=ribbon;ctx.fillRect(x+w*.46,y,3,h);ctx.fillRect(x,y+h*.45,w,2);
 ctx.fillRect(x+w*.28,y+h*.22,w*.2,3);ctx.fillRect(x+w*.55,y+h*.22,w*.2,3);
 ctx.fillRect(x+w*.35,y+h*.35,3,3);ctx.fillRect(x+w*.58,y+h*.35,3,3);
}
export function paintScene(ctx,images,s,{moving=false,distance=0}={}){
 ctx.clearRect(0,0,960,540);ctx.imageSmoothingEnabled=s.scene==='lisbon';ctx.drawImage(images[s.scene],0,0,960,540);
 if(s.scene==='lisbon')return;
 const npc=(id,x,feet,height)=>{const im=images[id];if(im)ctx.drawImage(im,x-im.width/im.height*height/2,feet-height,im.width/im.height*height,height);};
 const prop=(id,x,y,w)=>{const im=images[id];if(im)ctx.drawImage(im,x,y,w,w*im.height/im.width);};
 let feet=475;
 if(s.scene==='camp'){npc('cook',272,475,155);npc('mule',90,484,114);npc('potteBoots',493,475,154);if(s.items.includes('thorn-parcel'))prop('parcel',380,309,52);feet=477;}
 if(s.scene==='nazareth'){npc('potte',335,475,154);npc('waterCarrier',500,475,150);npc('mule',870,480,114);}
 if(s.scene==='hotel'){
  feet=460;
  if(!s.packed&&!s.read.includes('hotelNews'))npc('potte',320,460,154);
  const smallClosed=s.smallPacked||s.seenLines.includes('C5-J-pack-small-4');
  const smallInside=s.smallPacked||s.seenLines.includes('C5-J-pack-small-3');
  const smallWrapped=s.seenLines.includes('C5-J-pack-small-2');
  const crateId=smallClosed?'crateClosed':'crateOpen';
  if(!s.smallPacked)prop(crateId,380,425-125*images[crateId].height/images[crateId].width,125);
  if(!s.smallPacked&&!smallClosed){for(const [i,id] of ['wood','beads','straw'].entries()){if(smallWrapped)wrappedRelic(ctx,smallInside?404+i*23:356+i*28,smallInside?352:421,20,i);else prop(id,356+i*28,421,Math.min(18,20*images[id].width/images[id].height));}}
  const packedVisual=s.packed||s.seenLines.includes('C5-J-pack-8');
  const box=images[packedVisual?'boxClosed':'boxOpen'];
  if(box&&!s.packed)prop(packedVisual?'boxClosed':'boxOpen',575,329-60*box.height/box.width,60);
  if(!packedVisual&&!s.seenLines.includes('C5-J-pack-4'))prop('parcel',662,295,43);
  if(!packedVisual&&s.seenLines.includes('C5-J-pack-4'))prop('parcel',587,299,30);
  if(s.dialogue?.id==='returned'){npc('servant',878,460,149);if(!s.seenLines.includes('C5-J-returned-5'))prop('parcel',838,374,42);}
 }
 if(s.scene==='spring'){
  npc('mule',270,470,114);
  npc(s.given||s.seenLines.includes('C5-J-give-3')?'womanParcel':'woman',710,480,126);
  if(s.read.includes('woman')||['woman','give','womanAfter'].includes(s.dialogue?.id))npc('potte',535,475,154);
 }
 drawActor(ctx,moving?images.walk:images.idle,moving?'teo':'teoIdle',{x:s.x,feet,frame:moving?walkFrame(distance):0,facing:s.facing});
 if(s.scene==='hotel'&&['packSmall','pack'].includes(s.dialogue?.id)){
  const small=s.dialogue.id==='packSmall',closed=small?s.smallPacked||s.seenLines.includes('C5-J-pack-small-4'):s.packed||s.seenLines.includes('C5-J-pack-8');
  const inside=s.seenLines.includes(small?'C5-J-pack-small-3':'C5-J-pack-4');
  ctx.fillStyle='#101c2bf2';ctx.fillRect(25,286,320,232);ctx.strokeStyle='#aa8c59';ctx.strokeRect(25,286,320,232);
  ctx.fillStyle='#f4dfb8';ctx.font='16px serif';ctx.fillText(small?'圣物箱':'荆棘冠木盒',43,311);
  const id=small?(closed?'crateClosed':'crateOpen'):(closed?'boxClosed':'boxOpen'),im=images[id],w=Math.min(205,174*im.width/im.height),h=w*im.height/im.width,x=95,y=502-h;
  prop(id,x,y,w);
  if(!closed&&small){for(const [i,item] of ['wood','beads','straw'].entries()){if(s.seenLines.includes('C5-J-pack-small-2'))wrappedRelic(ctx,inside?x+w*.20+i*30:43+i*38,inside?y+h*.48:336,27,i);else prop(item,43+i*38,336,Math.min(22,25*images[item].width/images[item].height));}}
  if(!small&&!closed)prop('parcel',inside?x+w*.27:43,inside?y+h*.40:337,inside?w*.43:43);
 }

}
