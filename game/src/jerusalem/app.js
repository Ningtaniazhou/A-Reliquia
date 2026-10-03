import {isPhone} from '../ui/mobile.js';
import {chapterEntryURL,consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {setPixelPrompt} from '../ui/pixel-prompts.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {rememberChapter} from '../ui/mainline.js';
import {campBridge,bridgeFrame} from './camp-bridge.js';
import {sceneCheckpoint,restartButton} from '../ui/scene-checkpoint.js';
import {presentation} from './presentation.js';
import {chapterController} from './chapter.js';
import {scholarPending,regionFiles,needed,regionSpots,heroFeet,objective} from './regions.js';
import {topicAvailable,relicItems,contextForTopic} from './chapter-content.js';
import {holyDone,travelReady} from './state.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {arrival,letters,dialogue,dialogueRow,places,topics,topicIds} from './content.js';
import {initial,normalize,read,save,begin,advance,WIDTH,SAVE_KEY} from './state.js';
import {JerusalemAudio} from './audio.js';
import {drawActor} from '../voyage/scale.js';
import {walkFrame} from '../voyage/motion.js';
import {Backpack,itemById} from '../voyage/inventory.js';
const $=s=>document.querySelector(s), screen=$('.voyage-screen'), canvas=$('canvas'),ctx=canvas.getContext('2d');
const params=new URLSearchParams(location.search);
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage unavailable');}};}
const preview=params.has('preview'),campPreview=params.get('preview')==='camp-ending';
if(preview){const backing=storage;const map=k=>k.startsWith(SAVE_KEY)?k.replace(SAVE_KEY,SAVE_KEY+'.camp-preview'):k;storage={getItem:k=>backing.getItem(map(k)),setItem:(k,v)=>backing.setItem(map(k),v),removeItem:k=>backing.removeItem(map(k))};}
let s=read(storage),prefs={volume:.48,muted:false,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches};
try{Object.assign(prefs,JSON.parse(storage.getItem('reliquia.jerusalem-study.settings')));}catch{}
Object.assign(prefs,readPreferences(prefs));
if(params.has('fresh')){storage.removeItem?.(SAVE_KEY+'.scene');s=initial();params.delete('fresh');history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}
if(campPreview&&!s.campVisited){s=normalize({...initial(),items:['mary-parcel','relic-wood','relic-straw','relic-beads'],arrival:arrival.length,room:'camp',x:400,checked:true,windowSeen:true,seen:['tomb','calvary'],campVisited:true,thorn:3});}
const checkpoint=sceneCheckpoint(storage,SAVE_KEY+'.scene',s=>s.room);checkpoint.capture(s);
let ready=false,paused=false,menu=null,selected=0,bagOpen=false,ending=false,fade=null,target=null,distance=0,time=0,camera=0,moving=false,last=0,lastSave=0,quietUntil=0,hintUntil=0;
let dusk=s.toasted?1:0;
const keys=new Set(),images={},sound=new JerusalemAudio(prefs),abort=new AbortController();
const files={left:'street-left.webp',middle:'street-middle.webp',right:'street-right.webp',lobby:'lobby.webp',room:'room-v03.webp',potte:'potte.png',clerk:'clerk.png',friar:'friar.png',resident:'resident.png',bedouin:'bedouin.png',woman:'woman.png',porter:'porter.png',mule:'mule.png'};
Object.assign(files,regionFiles);
const pending=new Map();
async function asset(id){if(images[id])return;if(pending.has(id))return pending.get(id);const url=id==='teo'?'./assets/voyage/teodorico-walk-8f.png':id==='idle'?'./assets/voyage/teodorico-idle.png':id==='sharedParcel'?'./assets/alexandria-study/parcel.png':'./assets/jerusalem/'+files[id];const job=(async()=>{const im=new Image();im.src=url;await im.decode();images[id]=im;})();pending.set(id,job);try{await job;}finally{pending.delete(id);}}
const loadScene=(room)=>Promise.all(needed(room,s).map(asset));
const bridge=campBridge({root:$('.j-ending'),state:()=>s,sound,persist,paused:()=>paused,onContinue:()=>{s.endSeen=true;persist();try{sessionStorage.setItem('reliquia.chapter4.handoff'+(preview?'.preview':''),JSON.stringify(prefs));}catch{}sound.stop();location.href=chapterEntryURL('./chapter4.html?from=camp'+(preview?'&preview=1':''));},returnToCamp:()=>{ending=false;s.complete=false;s.endSeen=false;s.toasted=false;s.danced=false;s.bridgeElapsed=0;s.bridgeLine=0;dusk=0;persist();music();ui();}});
const loading=Promise.all([asset('teo'),asset('idle'),loadScene(s.room)]);
function startBridge(reset=true){ending=true;stop();s.complete=true;s.endSeen=false;s.celebration=false;bridge.start(reset);persist();music();ui();}
const chapter=chapterController({state:()=>s,talk,depart:(room,x)=>{menu=null;go(room,x);},showMenu,hint});
for(const item of relicItems)itemById.set(item.id,item);
function persist(){if(!preview)rememberChapter(s.endSeen?'dream':'jerusalem');checkpoint.capture(s); $('.j-save-warning').hidden=save(storage,s); }
function stop(){keys.clear();target=null;moving=false;}
function blocked(){return !ready||paused||!!fade||s.arrival<arrival.length||!!s.dialogue||!!menu||bagOpen||s.letterOpen||ending;}
function hint(text,seconds=5){$('.j-hint').textContent=text;hintUntil=time+seconds;$('.j-hint').hidden=false;}
function music(){if(ending){sound.request(s.bridgeElapsed<6?'caravan':null,3);sound.rain(0);return;}if(s.arrival<arrival.length){sound.request(s.arrival<2?'voyageDeck':null,2);sound.rain(s.arrival>=2?.22:0);return;}const cue=s.room==='holy'?'sepulchre':s.room==='fatmeRoom'||s.room==='camp'&&s.toasted?'caravan':s.room==='wild'||s.room==='camp'?'malta':'jerusalemRain';sound.request(cue,1.7);sound.rain(['street','forecourt'].includes(s.room)?.23:s.room==='lobby'?.09:s.room==='room'?.055:0);}
let scholarHelpRead=storage.getItem('reliquia.scholar-yellow-help.v1')==='1';
const scholarHelp=document.createElement('span');scholarHelp.className='j-scholar-help';scholarHelp.textContent='头像背景泛起金光时，按 R 听托普修斯说些什么';$('.j-scholar').append(scholarHelp);
function askScholar(){scholarHelpRead=true;try{storage.setItem('reliquia.scholar-yellow-help.v1','1');}catch{}chapter.scholar();ui();}
function settings(){stop();pause(true);$('#settings').showModal();}
function pause(on){paused=on;stop();sound.pause(on);document.body.classList.toggle('paused',on);if(!on&&sound.ctx)void sound.unlock().then(music);}
function preference(){document.body.classList.toggle('reduced',prefs.reduced);prefs.volume=Math.max(0,Math.min(1,Number(prefs.volume)||0));sound.update();$('#volume').value=prefs.volume;updateSoundButton($('#mute'),prefs.muted||prefs.volume===0,{shortcut:'M'});try{storage.setItem('reliquia.jerusalem-study.settings',JSON.stringify(prefs));}catch{}}
const backpack=new Backpack($('.voyage-bag'),{signal:abort.signal,onClose:()=>bag()});
function letterItem(){itemById.set('aunt-letter',{id:'aunt-letter',name:'写给姨姨的信',shortName:s.letter==='sent'?'信 · 已交寄':'信 · 待交寄',icon:'./assets/jerusalem/letter.png',text:(s.letter==='sent'?'前台已收下信件，答应代为交寄。信的记录留在我的背包中。':'信已经封好，可以交给大堂前台代寄。')+'\n\n'+letters.join('\n\n')});}
function bag(){if(paused||fade||s.arrival<arrival.length||s.dialogue||menu||s.letterOpen||ending||!ready)return;stop();bagOpen=!bagOpen;if(bagOpen){letterItem();backpack.open(s.items,{checked:true});backpack.q('.backpack-heading p').textContent='旅途所得';}else{backpack.close();screen.focus();}ui();}
function talk(id){if(paused||fade||bagOpen||!ready)return;stop();menu=null;s=begin(s,id);persist();ui();}
function next(){if(paused||!ready||fade)return;
 if(s.arrival<arrival.length){s.arrival++;persist();music();if(s.arrival===arrival.length){fade={t:0,room:'street',x:s.x,swapped:true,reveal:true};hint(isPhone()?'点击地面行走，靠近后点击动作互动':'A / D 行走 · E 交互 · 点击地面也可行走',8);}ui();return;}
 if(menu){menu.rows[selected]?.run();return;}
 if(!s.dialogue)return;
 const id=s.dialogue;s=advance(s);if(id==='window'&&(s.cursors.window===2||!s.dialogue))quietUntil=time+8;
 if(!s.dialogue){if(topicIds.includes(id)){showMenu(contextForTopic(id)||(topics.city.some(([k])=>k===id)?'city':'potte'));}
  if(dialogue[id].event==='checkin')hint('房间在右侧门内。波特在大堂等你。');
  if(dialogue[id].event==='window')hint('书桌上有纸笔，可以给姨姨写信。');
  if(dialogue[id].event==='seal'){sound.pick();hint('信已封好 · 下楼交给前台代寄');}
  if(dialogue[id].event==='send')hint('信已交寄 · 你可以继续在圣城探索');
  chapter.after(id);
  if(dialogue[id].event==='fire'||dialogue[id].event==='sleep')startBridge();
  music();
 }
 persist();ui();screen.focus({preventScroll:true});
}
function close(){if(paused)return;stop();if(menu){const parent=menu.parent;menu=null;if(parent)showMenu(parent);}else if(s.dialogue){s.dialogue=null;persist();}else if(s.letterOpen){s.letterOpen=false;persist();}ui();screen.focus({preventScroll:true});}
function showMenu(id){if(paused||fade||bagOpen||!ready)return;stop();const row=(label,run)=>({label,run});let title,rows,parent;
 if(id==='main'){title='与波特交谈';rows=[row('我想问路。',()=>showMenu('routes')),row('聊聊这座圣城。',()=>showMenu('city')),row('说说你的旅途。',()=>showMenu('potte'))];}
 if(id==='routes'){title='你想去哪里？';parent='main';rows=[['旅馆客房','routeRoom'],['圣墓与苦路','routeHoly'],['法特梅家','routeFatme'],['耶里哥与荒野',holyDone(s)?'routeReady':'routeWild']].map(([label,d])=>row(label,()=>talk(d)));}
 if(id==='city'||id==='potte'){title=id==='city'?'圣城见闻':'波特的旅途';parent='main';const available=topics[id].filter(([k])=>topicAvailable(k,s)), unread=available.filter(([k])=>!s.asked.includes(k));rows=(unread.length?unread:available).map(([k,label])=>row(label,()=>talk(k)));}
 if(id==='front'){title='您有什么需要？';rows=[row('问问寄信的事。',()=>talk(s.letter==='sent'?'sentAgain':'frontAgain')),...(s.letter==='sealed'?[row('交出写给姨姨的信。',()=>talk('send'))]:[])];}
 if(id==='desk'){title='书桌上的信纸';rows=s.letter==='none'?[row('给姨姨写信。',()=>{menu=null;stop();s.letterOpen=true;s.letterPage=0;persist();ui();})]:[row('重读写给姨姨的信。',()=>{menu=null;s.letterOpen=true;s.letterPage=0;persist();ui();})];}
 const extra=chapter.menu(id);if(extra){title=extra.title;rows=extra.rows;}
 menu={id,parent,title,rows:[...rows,row('返回',()=>close())]};selected=0;ui();
}
function go(room,x){if(blocked())return;stop();sound.door();const trip={room,x,t:0,swapped:false,loaded:false};fade=trip;loadScene(room).then(()=>{trip.loaded=true;}).catch(e=>{console.error(e);if(fade===trip){fade=null;hint('这一处暂时未能载入，请再试一次。',8);ui();}});ui();}
function spots(){const extra=regionSpots(s);if(extra)return extra;if(s.room==='street')return [
 {id:'roofs',x:215,y:255,label:'看看屋顶'},{id:'shutters',x:405,y:328,label:'查看百叶窗'},{id:'friar',x:570,y:317,label:'向修士问路'},
 {id:'garden',x:805,y:359,label:'看看菜园'},{id:'gutter',x:1046,y:342,label:'查看水槽'},{id:'hotel',x:1368,y:393,label:'进入旅馆'},
 ...(travelReady(s)?[{id:'mule',x:1595,y:288,label:'选择去向'}]:[]),{id:'fatme',x:1938,y:393,label:s.arranged?'进入小门':'查看小门'},{id:'traveller',x:2350,y:316,label:'与旅人说话'},{id:'arch',x:2680,y:330,label:'看看巷口'}];
 if(s.room==='lobby')return [{id:'exit',x:127,y:376,label:'返回雨街'},{id:'potte',x:425,y:305,label:'与波特交谈'},{id:'front',x:736,y:242,label:s.checked?'与前台交谈':'登记入住'},{id:'roomDoor',x:888,y:343,label:'前往客房'}];
 return [{id:'window',x:256,y:281,label:'看看窗外'},{id:'wallpaper',x:495,y:245,label:'查看隔墙'},{id:'desk',x:623,y:333,label:'查看信纸'},{id:'wardrobe',x:764,y:313,label:'查看衣柜'},{id:'exit',x:904,y:367,label:'回到大堂'}];}
function nearest(){return spots().filter(p=>Math.abs(p.x-s.x)<86).sort((a,b)=>Math.abs(a.x-s.x)-Math.abs(b.x-s.x))[0];}
function interact(id){if(blocked())return;const p=id?spots().find(p=>p.id===id):nearest();if(!p)return;
 if(Math.abs(p.x-s.x)>=86){target={x:p.x,id:p.id};return;}
 if(chapter.interact(p.id))return;
 if(p.id==='hotel')return go('lobby',135);
 if(p.id==='exit')return go(s.room==='room'?'lobby':'street',s.room==='room'?874:1368);
 if(p.id==='roomDoor')return s.checked?go('room',875):talk('checkFirst');
 if(p.id==='front')return s.checked?showMenu('front'):talk('register');
 if(p.id==='potte')return showMenu('main');
 if(p.id==='desk')return showMenu('desk');
 talk(p.id);
}
function updateLetter(){const n=s.letterPage;$('.j-letter p').textContent=letters[n];$('#letter-back').disabled=n===0;$('#letter-next').textContent='›';$('#letter-next').setAttribute('aria-label',n===letters.length-1?'折好信件':'下一页 D');$('#letter-back').textContent='‹';}
function previousLetter(){if(!paused&&s.letterOpen&&s.letterPage>0){s.letterPage--;persist();ui();}}
function nextLetter(){if(paused||!s.letterOpen)return;if(s.letterPage<letters.length-1){s.letterPage++;persist();ui();}else{s.letterOpen=false;if(s.letter==='none')talk('seal');else{persist();ui();}}}
function ui(){const busy=!!s.dialogue||!!menu||s.letterOpen||ending||!!fade||s.arrival<arrival.length;
 $('.voyage-place').textContent=places[s.room]+(s.room==='camp'&&s.toasted?' · 夜':'');$('.j-objective').textContent=objective(s);$('.j-objective').hidden=busy||bagOpen;canvas.setAttribute('aria-label',places[s.room]+'，A D 行走，E 交互');
 $('.j-talk').hidden=!s.dialogue;$('.j-menu').hidden=!menu;$('.j-letter').hidden=!s.letterOpen;$('.j-ending').hidden=!ending;$('.voyage-bag').hidden=!bagOpen;
 $('.voyage-hud').hidden=s.arrival<arrival.length||!!fade;$('.utilities').hidden=!!fade;$('.voyage-hud').inert=busy||bagOpen;$('.j-scholar').hidden=s.arrival<arrival.length;$('.j-scholar').disabled=busy||bagOpen;$('.j-scholar i').hidden=!scholarPending(s);
 const teach=!scholarHelpRead&&!$('.j-scholar i').hidden&&!busy&&!bagOpen;scholarHelp.hidden=!teach;$('.j-scholar').classList.toggle('first-light',teach);
 if(s.dialogue){const entry=dialogue[s.dialogue],row=dialogueRow(s.dialogue,s.cursors[s.dialogue]||0,s);const view=presentation(s.dialogue,entry,s.cursors[s.dialogue]||0);$('.j-talk small').textContent=view.label;$('.j-talk small').hidden=!view.label;$('.j-talk p').textContent=row[1];$('.j-talk').classList.toggle('thought',view.thought);$('.j-talk').classList.toggle('interjection',row[0]==='托普修斯');$('.j-talk').scrollTop=0;}
 if(menu){$('.j-menu h2').textContent=menu.title;const box=$('.j-menu div');box.replaceChildren();menu.rows.forEach((r,i)=>{const b=document.createElement('button');b.textContent=r.label;b.setAttribute('aria-label',r.label);if(i===selected){const key=document.createElement('kbd');key.textContent='␣';key.setAttribute('aria-label','空格键');b.append(key);}b.classList.toggle('selected',i===selected);b.onclick=()=>{if(!paused){selected=i;r.run();}};box.append(b);});}
 if(s.letterOpen)updateLetter();
 const markers=$('.voyage-markers');markers.replaceChildren();for(const p of spots()){const b=document.createElement('button');b.className='voyage-spot';b.dataset.spot=p.id;b.setAttribute('aria-label',p.label);setPixelPrompt(b,p.label);b.onclick=()=>interact(p.id);markers.append(b);}position();black();
}
function position(){camera=s.room==='street'?Math.round(Math.max(0,Math.min(WIDTH-960,s.x-420))):0;const n=nearest();for(const b of $('.voyage-markers').children){const p=spots().find(p=>p.id===b.dataset.spot);b.style.left=((p.x-camera)/960*100)+'%';let y=Math.min(p.y,302);const faces=s.room==='lobby'?[{x:736,y:262},{x:425,y:322}]:s.room==='street'?[{x:570,y:287},{x:875,y:307},{x:1135,y:312},{x:1785,y:307},{x:2350,y:321},{x:2610,y:307}]:[];faces.push(...({fatmeRoom:[{x:775,y:316},{x:250,y:326}],forecourt:[{x:345,y:291},{x:510,y:306},{x:847,y:294}],holy:[{x:200,y:352},{x:615,y:320}],camp:[{x:272,y:320},{x:795,y:318}]}[s.room]||[]));for(const face of faces)if(Math.abs(p.x-face.x)<95)y=Math.min(y,face.y-18);const heroTop=heroFeet(s.room)-156;if(Math.abs(p.x-s.x)<72)y=Math.min(y,heroTop-14);b.style.top=(y/540*100)+'%';b.hidden=blocked()||p.id!==n?.id;}}
function black(){const el=$('.j-black');el.hidden=!fade&&s.arrival>=arrival.length;if(fade){el.style.opacity=fade.reveal?Math.max(0,1-fade.t/1.4):fade.t<.45?fade.t/.45:fade.t<.9?1:Math.max(0,1-(fade.t-.9)/.5);$('.j-black small').hidden=true;$('.j-black p').textContent='';$('#arrival-next').hidden=true;}else if(s.arrival<arrival.length){el.style.opacity=1;$('.j-black small').hidden=false;$('.j-black p').textContent=arrival[s.arrival];$('#arrival-next').hidden=false;}}
function npc(id,x,feet=475,height=156,facing=1){const im=images[id];if(!im)return;const w=im.width/im.height*height;ctx.save();ctx.translate(Math.round(x),feet);ctx.scale(facing,1);ctx.drawImage(im,-w/2,-height,w,height);ctx.restore();}
function rain(rect={x:0,y:0,w:960,h:500},count=110){ctx.save();ctx.beginPath();ctx.rect(rect.x,rect.y,rect.w,rect.h);ctx.clip();const t=prefs.reduced?0:time;ctx.fillStyle='#b7cee0';ctx.globalAlpha=.27;for(let i=0;i<count;i++){const x=((i*137.31+t*17-camera*.17)%960+960)%960;const y=(i*67.4+t*(195+i%7*13))%540;ctx.fillRect(Math.floor(x),Math.floor(y),1,i%3+5);}ctx.restore();}
function blendSection(im,x,w,h,overlap){
 // Atmospheric overlap hides a hard strip boundary; all scenery remains imagegen art.
 const scale=im.width/w;
 for(let i=0;i<overlap;i+=2){ctx.globalAlpha=(i+1)/overlap;ctx.drawImage(im,i*scale,0,2*scale,im.height,x+i,0,2,h);}
 ctx.globalAlpha=1;ctx.drawImage(im,overlap*scale,0,im.width-overlap*scale,im.height,x+overlap,0,w-overlap,h);
}
function paint(){if(!ready)return;ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,960,540);if(s.arrival<arrival.length){ctx.fillStyle='#050810';ctx.fillRect(0,0,960,540);return;}
 if(s.room==='street'){
  ctx.drawImage(images.left,-camera,-1,780,558);
  blendSection(images.middle,720-camera,1440,540,60);
  ctx.save();ctx.translate(2160-camera,0);ctx.scale(-1,1);ctx.drawImage(images.middle,1380,0,60,540,-60,0,60,540);ctx.restore();
  blendSection(images.right,2160-camera,720,550,60);
  // Same human scale as 3-1–3-3. Residents stay in their own street positions.
  npc('friar',570-camera,465,178);npc('woman',875-camera,450,143,-1);npc('porter',1135-camera,461,149);npc('resident',1785-camera,457,150);npc('bedouin',2350-camera,477,156);npc('resident',2610-camera,439,132,-1);npc('mule',1595-camera,443,119);
  ctx.font='13px "Songti SC",serif';ctx.textAlign='center';ctx.fillStyle='#eee0bc';ctx.fillText('地 中 海 旅 馆',1368-camera,237);
 }else{ctx.drawImage(images[s.room],0,0,960,540);if(s.room==='camp'&&s.toasted){ctx.globalAlpha=dusk;ctx.drawImage(images.campMoon,0,0,960,540);ctx.globalAlpha=1;{ctx.globalAlpha=dusk*(ending?bridgeFrame(s.bridgeElapsed).embers:s.dialogue==='fire'||s.danced?0:1);ctx.drawImage(images.campEmbers,0,images.campEmbers.height*190/540,images.campEmbers.width,images.campEmbers.height*350/540,0,190,960,350);ctx.globalAlpha=1;}}if(s.room==='lobby'){npc('potte',425,478);npc('clerk',736,407,145);/* The counter occludes the clerk below the tabletop. */ctx.drawImage(images.lobby,512,312,320,121,512,312,320,121);}}
 if(s.room==='fatmeRoom'){npc('fatmeLady',775,476,159);if(s.fatmePaid===1)npc('circassian',350,478,153);if(s.fatmePaid>=2)npc('nubian',250,475,149);}
 if(s.room==='forecourt')npc('mule',95,461,105);
 if(s.room==='wild')npc('mule',115,420,110);
 if(s.room==='camp'&&s.thorn>=3&&images.sharedParcel)ctx.drawImage(images.sharedParcel,470,310,52,40);
 if(s.room==='holy'){npc('guard',200,472,120);npc('priest',615,470,150);}
 if(s.room==='camp'){npc('cook',272,475,155);npc('mule',90,484,114);if(s.thorn>0&&s.thorn<3||['craft','pack'].includes(s.dialogue))npc('potte',625,475,154);if(s.dialogue==='fire'||s.danced){ctx.globalAlpha=ending?bridgeFrame(s.bridgeElapsed).dancers:1;npc('dancer',798,478+(prefs.reduced?0:Math.sin(time*3)*1.4),159);if(!prefs.reduced&&(!ending||s.bridgeElapsed<5)){ctx.fillStyle='#efb965';for(let i=0;i<7;i++){const age=(time*.8+i/7)%1;ctx.globalAlpha=(1-age)*.7;ctx.fillRect(630+Math.sin(age*8+i)*15,435-age*65,2,2);}}ctx.globalAlpha=1;}}
 drawActor(ctx,moving?images.teo:images.idle,moving?'teo':'teoIdle',{x:s.x-camera,feet:heroFeet(s.room),facing:s.facing,frame:moving?walkFrame(distance):0});
 if(s.room==='forecourt')rain();
 if(s.room==='street'){rain();if(!prefs.reduced){ctx.fillStyle='#c1d6e1';ctx.globalAlpha=.36;for(let i=0;i<22;i++){const f=(time*2.2+i*.31)%1;if(f<.45){const x=(i*137+77-camera)%2880,y=451+i%4*10;ctx.fillRect(x-f*6,y,2+f*13,1);}}ctx.globalAlpha=1;}}
 else if(s.room==='room')rain({x:202,y:108,w:132,h:195},90);else if(s.room==='lobby')rain({x:40,y:163,w:94,h:205},90);
}
function frame(now){const dt=last?Math.min(65,now-last)/1000:0;last=now;
 if(ready&&!paused){if(ending)bridge.tick(dt);time+=dt;dusk=s.toasted?Math.min(1,dusk+dt/2.2):0;if(fade){fade.t=Math.min(fade.t+dt,(!fade.loaded&&!fade.swapped)?.64:99);if(!fade.swapped&&fade.loaded&&fade.t>=.65){s.room=fade.room;s.x=fade.x;s.facing=1;fade.swapped=true;persist();music();ui();}if(fade.t>=1.4){const arrived=fade.room;fade=null;ui();if(['camp','wild'].includes(arrived)&&!s.campVisited)talk('travelFirst');}}else if(!blocked()){
  let dir=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0);let step=210*dt;
  if(target){const dx=target.x-s.x;if(Math.abs(dx)<3){const id=target.id;target=null;if(id)interact(id);}else{dir=Math.sign(dx);step=Math.min(step,Math.abs(dx));}}
  const old=s.x;if(!blocked())s.x=Math.max(55,Math.min(s.room==='street'?WIDTH-55:905,s.x+dir*step));moving=old!==s.x;if(moving){s.facing=dir;distance+=Math.abs(s.x-old);if(time-lastSave>.5){persist();lastSave=time;}}else moving=false;
 }else moving=false;
 const level=time<quietUntil ? 0 : (s.dialogue||menu||s.letterOpen) ? .29 : s.room==='room' ? .39 : .66;if(!ending)sound.setMix(level);
 position();paint();black();$('.j-hint').hidden=time>hintUntil||!!s.dialogue||!!menu||bagOpen||s.letterOpen||ending||!!fade;
 }requestAnimationFrame(frame);
}
function key(e){if(e.ctrlKey||e.metaKey||e.altKey||e.target.matches('input,summary')||paused)return;const k=e.code,handled=['KeyA','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','KeyW','KeyS','KeyE','KeyR','Space','Escape','Tab'];if(!handled.includes(k))return;e.preventDefault();e.stopImmediatePropagation();void sound.unlock();if(e.repeat&&['KeyE','KeyR','Space','Escape','Tab'].includes(k))return;
 if(bagOpen){backpack.key(e);return;}
 if(ending){if(k==='Escape')settings();else if(k==='Space')bridge.next();return;}
 if(k==='Escape'){if(menu||s.dialogue||s.letterOpen)close();else settings();return;}
 if(s.letterOpen){if(k==='Space'||k==='KeyD'||k==='ArrowRight')nextLetter();else if(k==='ArrowLeft'||k==='KeyA')previousLetter();else if(k==='ArrowDown'||k==='KeyS')$('.j-letter p').scrollBy(0,60);else if(k==='ArrowUp'||k==='KeyW')$('.j-letter p').scrollBy(0,-60);return;}
 if(menu){if(['KeyW','KeyS','ArrowUp','ArrowDown'].includes(k)){selected=(selected+(['KeyS','ArrowDown'].includes(k)?1:-1)+menu.rows.length)%menu.rows.length;ui();$('.j-menu div button.selected')?.scrollIntoView({block:'nearest'});}else if(k==='Space')next();return;}
 if(k==='Space'){next();return;}if(k==='Tab'){bag();return;}if(blocked())return;if(k==='KeyE')interact();else if(k==='KeyR')askScholar();else if(['KeyA','KeyD','ArrowLeft','ArrowRight'].includes(k)){keys.add(k);target=null;}
}
canvas.addEventListener('pointerdown',e=>{if(blocked())return;void sound.unlock();const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*960+camera,y=(e.clientY-r.top)/r.height*540;const p=spots().filter(p=>Math.abs(p.x-x)<52&&y>190).sort((a,b)=>Math.abs(a.x-x)-Math.abs(b.x-x))[0];if(p)interact(p.id);else target={x:Math.max(55,Math.min(s.room==='street'?WIDTH-55:905,x))};});
$('.j-talk [data-next]').onclick=next;$('.j-talk p').onclick=next;$('.j-talk [data-close]').onclick=close;$('#arrival-next').onclick=next;$('#bag-button').onclick=bag;$('.j-scholar').onclick=()=>{if(!blocked())askScholar();};$('#letter-next').onclick=nextLetter;$('#letter-back').onclick=previousLetter;$('#letter-close').onclick=close;
$('#settings-button').onclick=settings;$('#settings').addEventListener('close',()=>{pause(document.hidden);screen.focus();});$('#volume').oninput=e=>{prefs.volume=+e.target.value;if(prefs.volume>0)prefs.muted=false;preference();};$('#mute').onclick=()=>{prefs.muted=!prefs.muted;if(!prefs.muted&&!prefs.volume)prefs.volume=.48;preference();void sound.unlock();};
$('#restart').onclick=async()=>{bridge.hide();await loadScene('street');checkpoint.clear();s=initial();menu=null;fade=null;ending=false;bagOpen=false;quietUntil=0;distance=0;backpack.close();stop();persist();music();ui();$('#settings').close();};
restartButton($('#settings'),async()=>{bridge.hide();const entry=checkpoint.restore();if(!entry)return;await loadScene(entry.room);s=normalize(entry);s.dialogue=null;s.letterOpen=false;menu=null;fade=null;ending=false;bagOpen=false;quietUntil=0;distance=0;dusk=s.toasted?1:0;backpack.close();stop();persist();music();ui();$('#settings').close();});
window.addEventListener('keydown',key);window.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',stop);document.addEventListener('pointerdown',()=>{if(!paused)void sound.unlock();},{capture:true});document.addEventListener('visibilitychange',()=>pause(document.hidden||$('#settings').open));window.addEventListener('pagehide',()=>{persist();sound.stop();});window.addEventListener('pageshow',()=>{if(ready){music();}});
window.jerusalemStatus=()=>({state:structuredClone(s),ready,paused,camera,worldWidth:WIDTH,viewWidth:960,menu:menu?{id:menu.id,labels:menu.rows.map(r=>r.label),selected}:null,bagOpen,ending,bridge:bridge.status(),transition:!!fade,music:sound.desired,playing:sound.current?.name,voices:sound.voices.size,rain:!!sound.rainVoice,errors:[...sound.errors],heroFeet:heroFeet(s.room),spots:spots()});
preference();ui();music();requestAnimationFrame(frame);
loading.then(()=>{ready=true;$('.j-loading').hidden=true;ending=s.complete&&!s.endSeen;if(ending)bridge.start(false);music();ui();paint();}).catch(e=>{$('.j-loading').textContent='雨城暂时未能载入。请刷新重试。';console.error(e);});

// Shared cross-chapter controls and latest preferences.
installSharedControls({readyForCover:()=>ready,audioReady:()=>sound.paused||sound.ctx?.state==='running',soundButton:'#mute',settingsButton:'#settings-button',bagButton:'#bag-button',getPreferences:()=>prefs,applyPreferences:p=>{Object.assign(prefs,p);preference();},toggleSettings:()=>{$('#settings').open?$('#settings').close():settings();},closeTop:()=>{if($('#settings').open){$('#settings').close();return true;}return false;},unlock:()=>sound.unlock(),pixel:true});
