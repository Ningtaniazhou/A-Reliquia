import {setPixelPrompt} from '../ui/pixel-prompts.js';
import {Alexandria} from '../alexandria/chapter.js';
import {initialVoyage,normalizeVoyage,voyageAction,canDepart} from './state.js';
import {conversations,spots} from './content.js';
import {Backpack} from './inventory.js';
import {SCROLL_SCALE,drawActor} from './scale.js';
import {MaltaEncounter} from '../malta/encounter.js';
import {walkFrame,boardingFrame,maltaArrivalFrame} from './motion.js';
const ROOT='./assets/voyage/';
export class Voyage {
 constructor(host,{sound,prefs,saved,onSave,onMenu}){
  Object.assign(this,{host,sound,prefs,onSave,onMenu});this.s=normalizeVoyage(saved);this.keys=new Set();this.target=null;this.active=false;this.ready=false;this.paused=false;this.time=0;this.walkDistance=0;this.teachingUntil=0;this.camera=0;this.auto=null;this.dialogue=null;this.inventory=false;this.lastSave=0;this.abort=new AbortController();this.assets={};
  host.innerHTML=`<div class="voyage-screen" tabindex="-1" aria-label="第三章：朝圣之旅"><div class="voyage-stage"><canvas width="960" height="540" aria-label="横向卷轴：码头与马拉加号甲板"></canvas><div class="voyage-film top"></div><div class="voyage-film bottom"></div><div class="voyage-title"><h1>圣遗物</h1><p class="voyage-chapter">第三章 · 朝圣之旅</p><button data-v="start">按〔空格键〕启程</button></div><div class="voyage-markers"></div><div class="voyage-iris"><span class="voyage-destination" hidden>抵达 马尔他</span></div></div><header class="voyage-hud" hidden><span class="voyage-place"></span><button data-v="bag">背包 <kbd>Tab</kbd></button></header><div class="malta-departure-hint" role="status" hidden>← 去左侧码头乘船</div><div class="voyage-teaching" role="status" hidden>A / D 移动 · E 互动 · Tab 背包</div><section class="voyage-dialogue" role="dialog" aria-label="交谈" aria-modal="true" hidden><span class="voyage-speaker"></span><p></p><button data-v="next">继续 <kbd aria-label="空格键">␣</kbd></button></section><section class="voyage-bag" role="dialog" aria-modal="true" aria-labelledby="backpack-title" hidden></section><div class="voyage-loading" role="status">海港正在亮起……</div><span class="voyage-save-warning" hidden>此浏览器无法保存进度</span></div>`;
  this.el=host.firstElementChild;this.stage=this.el.querySelector('.voyage-stage');this.canvas=this.el.querySelector('canvas');this.ctx=this.canvas.getContext('2d');this.ctx.imageSmoothingEnabled=false;
  this.q=s=>this.el.querySelector(s);const signal=this.abort.signal;
  this.el.append(this.q('.voyage-iris'));
  this.encounter=new MaltaEncounter(this);this.alex=new Alexandria(this);
  const end=document.createElement('div');end.className='voyage-next-port';end.hidden=true;end.innerHTML='<small>第三章 · 马耳他</small><h2>下一站，亚历山大里亚</h2><p>同路的旅人，再次启程。</p>';this.el.append(end);
  this.backpack=new Backpack(this.q('.voyage-bag'),{onClose:()=>this.bag(),signal});
  this.el.addEventListener('click',e=>{const a=e.target.closest('[data-v]')?.dataset.v;if(!a||['left','right'].includes(a))return;this.sound.unlock();if(a==='start')this.start();if(a==='interact')this.interact();if(a==='next')this.next();if(a==='bag'||a==='close-bag')this.bag();},{signal});
  this.canvas.addEventListener('pointerdown',e=>{if(this.s.scene==='alexandria'){void this.sound.unlock();this.alex.pointer(e);return;}if(this.blocked()||this.s.scene==='title')return;const r=this.canvas.getBoundingClientRect();this.target={x:Math.max(55,Math.min(this.s.scene==='malta'?910:1220,(e.clientX-r.left)/r.width*960+this.camera))};void this.sound.unlock();},{signal});
  document.addEventListener('keydown',e=>this.key(e),{signal});document.addEventListener('keyup',e=>this.keys.delete(e.code),{signal});window.addEventListener('blur',()=>{this.keys.clear();this.target=null;},{signal});window.addEventListener('pagehide',()=>this.persist(),{signal});
  this.loading=Promise.all(Object.entries({harbor:ROOT+'harbor.webp',deck:ROOT+'deck-clear.webp',sea:ROOT+'sea-clear.webp',sailor:ROOT+'sailor.png',teo:ROOT+'teodorico-walk-8f.png',teoIdle:ROOT+'teodorico-idle.png',malta:'./assets/malta/malta.webp',topsius:'./assets/malta/topsius-measure.png',topsiusTalk:'./assets/malta/topsius-talk.png',listen:'./assets/malta/teodorico-listen.png'}).map(async([id,url])=>{const im=new Image();im.src=url;await im.decode();this.assets[id]=im;})).then(()=>{this.ready=true;this.q('.voyage-loading').hidden=true;this.paint();this.ui();}).catch(()=>{this.q('.voyage-loading').innerHTML='海港未能载入。<button data-v="retry">重新载入</button>';this.q('[data-v=retry]').onclick=()=>location.reload();});
  this.ui();
 }
 setActive(on){this.active=on;this.host.hidden=!on;if(on){if(this.s.scene==='onward'){this.s=voyageAction(this.s,'ARRIVE_ALEXANDRIA');}if(this.s.scene==='alexandria')void this.alex.enter();if(this.s.scene==='sailing'&&!this.s.completed&&!this.auto)this.auto={kind:'malta',t:0,swapped:false};this.ui();this.music();this.el.focus({preventScroll:true});}else{this.keys.clear();this.target=null;}}
 reset(){this.alex.el.hidden=true;this.alex.fade=null;this.alex.menu=null;this.alex.bagOpen=false;this.alex.suspended=false;this.encounter.el.hidden=false;this.s=initialVoyage();this.keys.clear();this.target=null;this.auto=null;this.dialogue=null;this.inventory=false;this.backpack.close();this.camera=0;this.walkDistance=0;this.encounter.open=false;this.encounter.rows=[];this.encounter.reviewed.clear();this.ui();}
 blocked(){return !this.active||!this.ready||this.paused||this.auto||this.dialogue||this.inventory||this.encounter.open;}
 music(){if(this.s.scene==='alexandria'){if(this.active)this.sound.request('malta');return;}if(this.active)this.sound.request(this.s.scene==='malta'?'malta':['deck','onward'].includes(this.s.scene)?'voyageDeck':'voyageTitle');}
 persist(){const ok=this.onSave({...this.s});this.q('.voyage-save-warning').hidden=ok!==false;}
 dispatch(action){if(action==='SCHOLAR_UNLOCK')this.teachingUntil=this.time+7;this.s=voyageAction(this.s,action);this.persist();this.ui();}
 start(){if(this.blocked()||this.s.scene!=='title')return;this.dispatch('START');this.s.x=-48;this.auto={kind:'entry',t:0};this.sound.good();this.ui();}
 key(e){if(this.active&&this.s.scene==='alexandria'){void this.sound.unlock();this.alex.key(e);return;}if(e.ctrlKey||e.metaKey||e.altKey)return;if(!this.active||e.target.matches('input,summary')||this.paused)return;
  const code=e.code;void this.sound.unlock();if(this.inventory){this.backpack.key(e);return;}if(['ArrowLeft','ArrowRight','KeyA','KeyD','Space','KeyE','Tab','Escape','Enter','KeyR','KeyW','KeyS','ArrowUp','ArrowDown'].includes(code)){e.preventDefault();e.stopImmediatePropagation();}
  if(e.repeat&&['Space','KeyE','Tab','Enter','Escape','KeyR'].includes(code))return;
  if(this.encounter.open){this.encounter.key(code);return;}
  if(code==='KeyR'&&this.s.scholarUnlocked){this.encounter.begin();return;}
  if(code==='Escape'){if(this.inventory)this.bag();else if(this.dialogue)this.closeTalk();else this.onMenu();return;}
  if(this.s.scene==='title'){if(code==='Space'||code==='Enter')this.start();return;}
  if(code==='Tab'){this.bag();return;}if(code==='Space'){if(this.dialogue)this.next();return;}if(code==='KeyE'){if(!this.dialogue)this.interact();return;}if(code==='Enter')return;
  if(this.blocked())return;if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(code)){this.keys.add(code);this.target=null;if(!e.repeat){const dir=['ArrowRight','KeyD'].includes(code)?1:-1,oldX=this.s.x;this.s.x=Math.max(55,Math.min(this.s.scene==='malta'?910:this.s.scene==='dock'?(this.s.checked?870:700):1220,this.s.x+dir*5));this.walkDistance+=Math.abs(this.s.x-oldX);this.moving=this.s.x!==oldX;this.s.facing=dir;this.persist();this.paint();}}
 }
 bag(){if(this.s.scene==='alexandria')return this.alex.bag();if(!this.active||!this.ready||this.paused||this.auto||this.s.scene==='title'||this.dialogue||this.encounter.open)return;this.keys.clear();this.target=null;this.inventory=!this.inventory;if(this.inventory)this.dispatch('INVENTORY');this.ui();if(this.inventory)this.backpack.open(this.s.items,{checked:this.s.checked});else{this.backpack.close();this.el.focus({preventScroll:true});}}
 talk(id,done){if(this.blocked())return;this.keys.clear();this.target=null;this.dialogue={id,index:0,done};this.ui();this.q('[data-v=next]').focus({preventScroll:true});}
 closeTalk(){// Closing review never grants an uncompleted action.
  this.dialogue=null;this.ui();this.el.focus({preventScroll:true});
 }
 next(){if(!this.dialogue||this.paused)return;const d=this.dialogue;if(++d.index>=conversations[d.id].length){this.dialogue=null;d.done?.();this.el.focus({preventScroll:true});}this.ui();}
 available(){if(this.s.scene==='malta')return [...(this.s.scholarUnlocked?[{id:'maltaExit',x:75,y:380,label:'去码头'}]:[{id:'scholar',x:555,y:360,label:'交谈'}]),{id:'flowers',x:210,y:330,label:'查看紫罗兰'},{id:'palace',x:780,y:270,label:'查看大首长宫'}];if(this.s.scene==='dock')return spots.dock.filter(p=>p.id==='ticket'||this.s.checked);if(this.s.scene==='deck'||this.s.scene==='sailing')return spots.deck.filter(p=>this.s.scene!=='sailing'||['cabin','rope','sea'].includes(p.id)).map(p=>p.id==='sea'&&this.s.scene==='sailing'?{...p,label:'眺望海面'}:p);return [];}
 nearest(){return this.available().filter(p=>Math.abs(p.x-this.s.x)<95).sort((a,b)=>Math.abs(a.x-this.s.x)-Math.abs(b.x-this.s.x))[0];}
 interact(id){if(this.s.scene==='alexandria')return this.alex.interact(id);if(this.blocked())return;const p=id?this.available().find(p=>p.id===id):this.nearest();if(!p)return;if(Math.abs(p.x-this.s.x)>95){this.target={x:Math.max(55,p.x-55),id:p.id};return;}
  if(p.id==='scholar'){this.encounter.begin();return;}
  if(p.id==='maltaExit'){this.sound.ship();this.keys.clear();this.target=null;this.auto={kind:'onward',t:0,swapped:false};this.ui();return;}
  if(p.id==='ticket')return this.talk('ticket',()=>{this.dispatch('TICKET');this.sound.good();});
  if(p.id==='board'){this.keys.clear();this.target=null;this.moving=false;this.auto={kind:'board',t:0,swapped:false};this.ui();return;}
  if(p.id==='sail')return this.talk('sail',()=>{if(canDepart(this.s)){this.dispatch('SAIL');this.auto={kind:'malta',t:0,swapped:false};this.sound.ship();this.music();}});
  this.talk(this.s.scene==='sailing'&&['rope','sea'].includes(p.id)?p.id+'Sailing':p.id,()=>this.dispatch('OBSERVE:'+p.id));
 }

 ui(){if(this.s.scene==='alexandria'&&this.alex)return this.alex.ui();this.canvas.setAttribute('aria-label',this.s.scene==='malta'?'马耳他大首长宫外：特奥多里科与托普修斯':'横向卷轴：码头与马拉加号甲板');const title=this.s.scene==='title';this.el.dataset.scene=this.s.scene;this.el.dataset.transition=this.auto?.kind||'';this.el.classList.toggle('voyage-reduced',this.prefs.reduced);this.q('.voyage-title').hidden=!title;this.q('.voyage-hud').hidden=title;this.q('.voyage-place').textContent=this.s.scene==='malta'?'马耳他 · 大首长宫外':this.s.scene==='onward'?'马拉加号 · 前往亚历山大里亚':this.s.scene==='dock'?'里斯本 · 登船口':this.s.scene==='sailing'?'马拉加号 · 航行中':'马拉加号 · 甲板';
  this.q('.voyage-dialogue').hidden=!this.dialogue;this.q('.voyage-bag').hidden=!this.inventory;
  if(this.dialogue){const d=this.dialogue,row=conversations[d.id][d.index];const interjection=['rope','sail'].includes(d.id)&&d.index===0;this.q('.voyage-dialogue').classList.toggle('is-interjection',interjection);this.q('.voyage-dialogue').classList.toggle('is-scholar',row[0]==='托普修斯');this.q('.voyage-speaker').textContent=(['flowers','cabin','ropeSailing','seaSailing'].includes(d.id)||['palace','sea'].includes(d.id)&&d.index>0)?'特奥多里科 · 心声':['palace','sea'].includes(d.id)?'':row[0]+(interjection&&row[0]!=='托普修斯'?' · 插话':'');this.q('.voyage-dialogue p').textContent=row[1];this.q('[data-v=next]').innerHTML='继续 <kbd aria-label="空格键">␣</kbd>';this.q('[data-v=next]').setAttribute('aria-label',d.index===conversations[d.id].length-1?'结束交谈':'继续交谈');}
  this.encounter.render();this.q('.voyage-next-port').hidden=this.s.scene!=='onward'||this.encounter.open||this.inventory;
  const modal=!!this.dialogue||this.inventory||this.encounter.open;for(const sel of ['.voyage-hud','.voyage-markers'])this.q(sel).inert=modal||!!this.auto;this.canvas.style.pointerEvents=modal||this.auto?'none':'';
  this.buildMarkers();
 }
 buildMarkers(){const box=this.q('.voyage-markers');box.replaceChildren();for(const p of this.available()){const b=document.createElement('button');b.className='voyage-spot';b.dataset.spot=p.id;b.setAttribute('aria-label',p.label);setPixelPrompt(b,p.label);b.onclick=()=>{void this.sound.unlock();this.interact(p.id);};box.append(b);}this.positionMarkers();}
 positionMarkers(){const nearest=this.nearest();const offset=['deck','sailing'].includes(this.s.scene)?SCROLL_SCALE.deckOffset:0;for(const b of this.q('.voyage-markers').children){const p=this.available().find(p=>p.id===b.dataset.spot);const x=(p.markerX??p.x)-this.camera;b.style.left=(x/960*100)+'%';let y=p.y+offset;const feet=this.s.scene==='malta'?454:this.s.scene==='dock'?494:422+offset;if(Math.abs((p.markerX??p.x)-this.s.x)<70)y=Math.min(y,feet-174);if(this.s.scene==='malta'&&!this.s.scholarUnlocked&&Math.abs(p.x-600)<80)y=Math.min(y,280);if(this.s.scene==='dock'&&Math.abs(p.x-545)<80)y=Math.min(y,320);b.style.top=(y/540*100)+'%';b.hidden=x<25||x>935||!!this.auto||!!this.dialogue||this.inventory||this.encounter.open||p.id!==nearest?.id;}}
 pause(on){this.paused=on;this.keys.clear();this.target=null;this.el.classList.toggle('voyage-paused',on);}
 tick(dt){if(!this.active||!this.ready||this.paused)return;if(this.s.scene==='alexandria'){this.alex.tick(dt);return;}this.time+=dt/1000;const oldX=this.s.x;let moving=false;
  if(this.auto){const a=this.auto;if(a.kind==='malta'&&!a.audioStarted){a.audioStarted=true;this.sound.request(null,3);}a.t+=dt/1000;
   if(a.kind==='entry'){this.s.x=-48+138*Math.min(1,a.t/.9);moving=true;if(a.t>=.9){this.auto=null;this.teachingUntil=this.time+6;this.persist();this.ui();}}
   if(['board','malta','onward'].includes(a.kind)){const transition=['malta','onward'].includes(a.kind)?maltaArrivalFrame(a.t,a.kind==='malta'):boardingFrame(a.t);if(transition.swap&&!a.swapped){a.swapped=true;this.s.facing=1;this.dispatch(a.kind==='board'?'BOARD':a.kind==='malta'?'ARRIVE_MALTA':'LEAVE_MALTA');if(a.kind==='malta')this.sound.request('malta',3.5);else this.music();}if(transition.done){this.auto=null;if(a.kind==='onward'){this.s=voyageAction(this.s,'ARRIVE_ALEXANDRIA');void this.alex.enter();this.persist();}this.ui();}}
   
  }else if(!this.dialogue&&!this.inventory&&!this.encounter.open&&!['title','onward'].includes(this.s.scene)){
   let dir=(this.keys.has('ArrowRight')||this.keys.has('KeyD')?1:0)-(this.keys.has('ArrowLeft')||this.keys.has('KeyA')?1:0);
   if(this.target){const distance=this.target.x-this.s.x;if(Math.abs(distance)<4){const id=this.target.id;this.target=null;if(id)this.interact(id);}else dir=Math.sign(distance);}
   if(dir){this.s.x=Math.max(55,Math.min(this.s.scene==='malta'?910:this.s.scene==='dock'?(this.s.checked?870:700):1220,this.s.x+dir*210*dt/1000));this.s.facing=dir;moving=this.s.x!==oldX;}
  }
  // Alexandria replaces the marker list during the onward transition. Its next
  // frame owns movement and prompts; never run the old voyage marker pass.
  if(this.s.scene==='alexandria')return;
  this.moving=moving;if(moving)this.walkDistance+=Math.abs(this.s.x-oldX);if(moving&&this.time-this.lastSave>.6){this.persist();this.lastSave=this.time;}
  this.q('.voyage-teaching').textContent=this.s.scene==='malta'?'R 询问 托普修斯 · 向左去码头乘船':'A / D 移动 · E 互动 · Tab 背包';
  this.q('.voyage-teaching').hidden=this.time>=this.teachingUntil||!!this.dialogue||this.inventory||!['dock','malta'].includes(this.s.scene)||this.encounter.open;
  this.q('.malta-departure-hint').hidden=this.s.scene!=='malta'||!this.s.scholarUnlocked||this.encounter.open||this.inventory||!!this.dialogue||!!this.auto;
  this.paint();this.positionMarkers();
 }
 paint(){if(!this.ready)return;if(this.s.scene==='alexandria'){this.alex.paint();return;}const c=this.ctx,w=SCROLL_SCALE.width,h=SCROLL_SCALE.height,title=this.s.scene==='title',deck=['deck','sailing','onward'].includes(this.s.scene);c.imageSmoothingEnabled=false;c.clearRect(0,0,w,h);
  if(this.s.scene==='malta'){this.camera=0;c.drawImage(this.assets.malta,0,0,w,h);if(!this.s.scholarUnlocked){const im=this.encounter.open?this.assets.topsiusTalk:this.assets.topsius;c.drawImage(im,600-im.width/2,454-156,im.width,156);}if(this.encounter.open){c.drawImage(this.assets.listen,this.s.x-64,454-156,128,156);}else drawActor(c,this.moving?this.assets.teo:this.assets.teoIdle,this.moving?'teo':'teoIdle',{x:this.s.x,feet:454,frame:this.moving?walkFrame(this.walkDistance):0,facing:this.s.facing});this.paintFade();return;}
  if(title){c.drawImage(this.assets.harbor,0,0,w,h);this.paintFade();return;}
  this.camera=Math.max(0,Math.min(SCROLL_SCALE.worldWidth-w,this.s.x-420));const offset=deck?SCROLL_SCALE.deckOffset:0,ground=deck?422+offset:494;
  c.drawImage(deck?this.assets.deck:this.assets.harbor,-this.camera,SCROLL_SCALE.worldTop+offset,SCROLL_SCALE.worldWidth,SCROLL_SCALE.worldHeight);
  if(this.s.scene==='dock'){drawActor(c,this.assets.sailor,'sailor',{x:545-this.camera,feet:ground});}
  if(['sailing','onward'].includes(this.s.scene)){c.globalAlpha=this.auto?.kind==='sail'?Math.min(1,this.auto.t/4):1;c.drawImage(this.assets.sea,-this.camera,SCROLL_SCALE.worldTop+offset,SCROLL_SCALE.worldWidth,SCROLL_SCALE.worldHeight);c.globalAlpha=1;}
  if(this.s.scene==='sailing'&&!this.prefs.reduced){c.globalAlpha=.15;for(let i=0;i<13;i++){let x=(i*91+this.time*22)%1280-this.camera;c.fillStyle=i%2?'#f7b953':'#71b8bd';c.fillRect(x,286+offset+(i%5)*13,34,2);}c.globalAlpha=1;}
  const frame=this.moving?walkFrame(this.walkDistance):0,im=this.moving?this.assets.teo:this.assets.teoIdle;const y=ground;
  if(this.encounter.open)c.drawImage(this.assets.listen,this.s.x-this.camera-64,y-156,128,156);else drawActor(c,im,this.moving?'teo':'teoIdle',{x:this.s.x-this.camera,feet:y,frame,facing:this.s.facing});
  this.paintFade();
 }
 paintFade(){const a=this.auto,f=['malta','onward'].includes(a?.kind)?maltaArrivalFrame(a.t,a.kind==='malta'):a?.kind==='board'?boardingFrame(a.t):null;this.q('.voyage-iris').style.opacity=a?.kind==='onward'?Math.min(1,a.t/.55):f?.opacity||0;this.q('.voyage-destination').textContent=a?.kind==='onward'?'抵达亚历山德里亚':'抵达 马尔他';this.q('.voyage-destination').hidden=!(['malta','onward'].includes(a?.kind)&&f.label);}
 status(){return {state:{...this.s},ready:this.ready,active:this.active,paused:this.paused,auto:this.auto?.kind||null,dialogue:this.dialogue?{id:this.dialogue.id,index:this.dialogue.index}:null,inventory:this.inventory,camera:this.camera};}
 destroy(){this.persist();this.abort.abort();this.host.replaceChildren();}
}
