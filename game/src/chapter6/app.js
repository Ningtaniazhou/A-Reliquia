import {chapterEntryURL,consumeChapterEntry} from '../ui/chapter-entry.js';
consumeChapterEntry();
import {returnToNotebook} from './notebook-return.js';
import {MARY_DEDICATION,MARY_SIGNATURE} from '../ui/mary-stationery.js';
import {UnwrapInteraction,unwrapSteps} from './unwrapping.js';
import {installCardControls} from '../ui/card-controls.js';
import {paperPortrait,portraitMarkup} from '../ui/character-portraits.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {point} from '../interaction-marks.js';
import {initial,normalize,goto,selectCard,nextLine,action,tick,durations,area,mood,chapterScene} from './state.js';
import {cards,groups,actionLabels,itemDescriptions} from './content.js';
import {HomecomingAudio} from './audio.js';
import {sceneCheckpoint} from '../ui/scene-checkpoint.js';
import {rememberChapter} from '../ui/mainline.js';
import {updateSoundButton} from '../ui/sound-button.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),preview=params.has('preview'),key='reliquia.chapter6.v1'+(preview?'.preview':'');
$('dedication').querySelector('p').textContent=MARY_DEDICATION;
$('dedication').querySelector('small').textContent=MARY_SIGNATURE;
$('dedication').querySelector('small').classList.add('mary-signature');
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{throw Error('storage unavailable');},removeItem:()=>{}};}
const read=k=>{try{return JSON.parse(storage.getItem(k));}catch{return null;}};
let s=normalize(read(key)||initial());
if(!read(key)&&!preview){const old=read('reliquia.chapter5.v1');if(old?.complete)s=normalize({...initial(),items:old.items,volume:old.volume,muted:old.muted,reduced:old.reduced});}
if(params.has('fresh')){s=initial();storage.removeItem(key+'.scene');params.delete('fresh');window.history.replaceState(null,'',location.pathname+'?'+params);}
// Explicit transition preview starts at the final spoken line, never at a stale save.
if(preview&&params.get('start')==='epilogue'){
 s=normalize({...initial(),phase:'outside',line:groups.outside.length-1,carried:true});
 for(const k of [key+'.scene','reliquia.chapter7.v1.preview','reliquia.chapter7.v1.preview.scene'])storage.removeItem(k);
 params.delete('start');window.history.replaceState(null,'',location.pathname+'?'+params);
}
Object.assign(s,readPreferences(s));
const checkpoint=sceneCheckpoint(storage,key+'.scene',chapterScene);checkpoint.capture(s);
const sound=new HomecomingAudio(s),base='./assets/chapter6/',esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
$('reopen').innerHTML=point();
let ready=false,paused=false,last=performance.now(),savedAt=0,visualKey='',dialogueKey='',fxKey='',history=[],review=null,selected=0,actionBusy=0;
const asset=n=>base+n+'.webp',revised=n=>asset('v02/'+n),seatingArt=n=>asset((['teo-seated','aunt-seated','guest-0','guest-1','guest-2','guest-3'].includes(n)?'v08/':'v09/')+n),obj=n=>asset('obj-'+n),aunt=n=>asset('aunt-'+n),person=n=>asset(n===2?'v09/teo-surprised':'people-'+n),extra=n=>asset('extra-'+n),cardArt=n=>asset('card-'+String(n).padStart(2,'0'));
const img=(src,cls,style='',alt='')=>`<img class="${cls}" src="${src}" style="${style}" alt="${alt}">`;
function save(){try{storage.setItem(key,JSON.stringify(s));$('save-warning').hidden=true;}catch{$('save-warning').hidden=false;}if(!preview)rememberChapter('homecoming',storage);}
function preferences(){sound.settings=s;sound.update();document.body.classList.toggle('reduced',!!s.reduced);$('volume').value=s.volume;$('reduced').checked=s.reduced;updateSoundButton($('sound'),s.muted||s.volume===0,{shortcut:'M'});}
function row(){if(['lights','lighting'].includes(s.phase))return null;if(s.phase==='cast'){const c=cards.find(c=>c.id===s.pending);return c?{id:'cast-'+c.id+(s.elapsed<2?'say':'reply'),who:s.elapsed<2?'特奥多里科':'姨姨',text:s.elapsed<2?c.say:c.reply}:null;}return groups[s.phase]?.[s.line]||null;}
function portrait(who){const shared=paperPortrait(who,s.phase==='shock'?'shock':mood(s));if(shared)return shared;if(who==='内格朗')return [asset('guest-portrait-'+(mood(s)==='angry'?6:2)),false];if(who==='维森西娅')return [person(5),true];return [person(6),true];}
function rememberRow(){const r=row();if(!r||history.at(-1)?.id===r.id)return;history.push({...r,mood:mood(s),portrait:r.who?portrait(r.who):null});if(history.length>120)history.shift();}
function set(next){if(next===s)return;if(next.phase==='ending'&&s.phase==='outside'){void finishIntoNotebook();return;}const previous=s.phase,oldUsed=s.used.length;s=normalize(next);review=null;if(previous!==s.phase){actionBusy=0;visualKey='';checkpoint.capture(s);sound.scene(s.phase);const effects={awaken:'awaken',triumphHold:'settle',lighting:'cloth',revealHold:'cloth',shock:'shock',curtainClosing:'curtain',curtainOpening:'curtain',outside:'door'};if(effects[s.phase])sound.effect(effects[s.phase]);}save();render();if(s.used.length>oldUsed&&!s.reduced){for(const [cls,from,to] of [['teo',[1,1.2,1.45][oldUsed],[1.2,1.45,1.7][oldUsed]],['aunt',[1.65,1.3,.95][oldUsed],s.used.length===3?1:[1.3,.95,1][oldUsed]]]){document.querySelector('.'+cls)?.animate([{transform:`scale(${from})`},{transform:`scale(${to})`}],{duration:900,easing:'ease-out'});}}}
function go(){if(paused||!ready||leavingForBook)return;if(review!==null){review++;if(review>=history.length-1)review=null;renderDialogue();return;}if(durations[s.phase])return;if(groups[s.phase]&&s.phase!=='lights'){set(nextLine(s));return;}useAction();}
function useAction(){if(s.phase==='unbox'){unwrapInput.tap(true);return;}if(paused||!ready||durations[s.phase]||performance.now()<actionBusy)return;const before=s.phase;if(before==='end')return;if(before==='unbox'){actionBusy=performance.now()+(s.reduced?120:650);sound.effect(s.step<2?'cloth':'paper');}else if(['seat','empty'].includes(before))sound.effect('step');else if(before==='take')sound.effect('wood');const next=action(s);if(next!==s){visualKey='';set(next);}}
function castCard(id){if(paused||!ready||review!==null)return;const next=selectCard(s,id);if(next===s)return;sound.effect(id);selected=0;set(next);}
function openSettings(){if(!ready)return;$('restart-scene').disabled=leavingForBook;if($('restart-chapter'))$('restart-chapter').disabled=leavingForBook;unwrapInput.cancel();paused=true;sound.pause(true);$('settings').showModal();document.body.classList.add('paused');}
function resume(){paused=false;$('settings').close();sound.pause(document.hidden);document.body.classList.remove('paused');last=performance.now();$('game').focus({preventScroll:true});}

function actor(src,cls,style){return img(src,'actor '+cls,style);}
// Physical seat anchors persist through the curtain transition.
const seats=[{x:8,b:16,w:15,h:40},{x:65,b:16,w:15,h:37},{x:18,b:21,w:12,h:35},{x:75,b:13,w:19,h:40}];
const seatStyle=q=>`left:${q.x}%;bottom:${q.b}%;width:${q.w}%;height:${q.h}%;${q.flip?'transform:scaleX(-1)':''}`;
function guest(n,uneasy=false){return actor(seatingArt('guest-'+n),'guest-actor guest-'+n+(uneasy?' startled':''),seatStyle(seats[n]));}
const teoSeat='left:27%;bottom:23%;height:32%;width:18%';
const auntSeat='left:57.5%;bottom:21.5%;height:33%;width:13%';
function paintStage(){const a=area(s),empty=['curtainClosed','curtainOpening','empty','roomFade','roomBlack'].includes(s.phase),battle=['awaken','challenge','battle','cast','triumphHold','triumph','homeFade'].includes(s.phase),isExit=['roomIn','dismissal','take','leaving','exit'].includes(s.phase),night=s.phase==='outside'||s.phase==='ending'||s.phase==='end';
 const bg=a==='door'?(night?'./assets/dinner/street.webp':revised('doorway-v2')):a==='chapel'?asset('v08/chapel-clean'):asset(a);$('backdrop').src=bg;$('backdrop').alt=a==='chapel'?'烛光中的祈祷室':a==='bedroom'?'特奥多里科的卧室':night?'夜色中的里斯本':'姨姨家的门';$('backdrop').style.filter='';
 let actors='',props='',furniture='';
 if(a==='door'&&night){actors=actor(person(2),'teo','left:43%;bottom:12%;height:52%;width:20%');props=img(obj(0),'prop','left:61%;bottom:12%;width:13%;height:16%');}
 if(a==='bedroom'){
  let ai=isExit||s.phase==='arrival'?null:battle?(s.used.length===3?3:s.used.length>0?1:0):0,ti=isExit?(['leaving','exit'].includes(s.phase)?2:3):battle?(s.used.length>=2?1:0):0;
  actors=actor(ti===0?extra(0):person(ti),'teo',isExit?(ti===3?'left:43%;bottom:11%;height:57%;width:26%':'left:45%;bottom:11%;height:76%;width:27%'):battle?(s.used.length===3?'left:33%;height:49%':'height:49%'):'height:49%');
  if(ai!==null)actors+=actor(ai===3?revised('aunt-kneel-v2'):aunt(ai),'aunt',ai===3?'left:65%;height:33%;bottom:10%':battle?'height:49%;bottom:2%':'height:49%');
  if(['roomIn','dismissal'].includes(s.phase))actors+=actor(person(5),'maid','left:8%;bottom:10%;height:60%;width:23%');
  const openCrate=!isExit&&!['homeFade','eveningBlack'].includes(s.phase)&&!(s.phase==='triumph'&&s.line>=1);
  props=img(openCrate?asset('v10/crate-open'):obj(0),'prop travel-crate',isExit?'left:75%;bottom:10%;width:16%;height:20%':s.used.length===3?'left:9%;bottom:10%;width:18%;height:27%;object-position:bottom':'left:43%;bottom:8%;width:18%;height:27%;object-position:bottom');
  
 }
 if(a==='chapel'){
  const upset=['shock','accusations','curtainClosing'].includes(s.phase),pose=s.phase==='shock'?6:upset?7:2,standing=['chapelFade','evening','seat','seating'].includes(s.phase);
  if(!empty){
   actors+=guest(0,s.phase==='shock')+guest(2,s.phase==='shock')+guest(1,s.phase==='shock')+guest(3,s.phase==='shock');
   if(standing||upset)furniture+=img(seatingArt('teo-chair'),'prop teo-empty-chair',teoSeat);
   if(s.phase==='lighting')furniture+=img(seatingArt('aunt-chair'),'prop aunt-empty-chair',auntSeat);
   actors+=actor(s.phase==='lighting'?extra(2):seatingArt(mood(s)==='angry'?'aunt-angry':'aunt-seated'),'aunt'+(s.phase==='shock'?' startled':''),s.phase==='lighting'?'left:58%;bottom:24%;height:44%;width:15%;transform:scaleX(-1)':auntSeat);
   actors+=actor(upset?person(2):standing?extra(0):seatingArt('teo-seated'),'teo',upset?'left:28.5%;bottom:23%;height:48%;width:16%':standing?'left:29%;bottom:23%;height:42%;width:15%':teoSeat);
  }else{
   furniture+=seats.map((q,i)=>img(seatingArt('guest-chair-'+i),'prop empty-chair guest-seat-'+i,seatStyle(q))).join('');
   furniture+=img(seatingArt('aunt-chair'),'prop empty-chair aunt-seat',auntSeat);
   actors=actor(seatingArt('teo-sad'),'teo',teoSeat);
  }
  props+=img(obj(['unbox','perfume','revealHold','recognize','cardInspect','inscription','shock','accusations','curtainClosing','curtainClosed','curtainOpening','empty','roomFade','roomBlack'].includes(s.phase)?2:1),'prop relic-box','left:48.25%;bottom:50.7%;width:4.4%;height:5%;object-position:center bottom');
  if(empty){props+=img(obj(5),'prop discarded-paper','left:52%;bottom:50.7%;width:4%;height:4%');props+=img(asset('v11/dress-floor'),'prop discarded-dress','left:39%;bottom:18%;width:13%;height:11%;object-position:bottom');}
  const count=s.phase==='lighting'?Math.min(4,Math.ceil(s.elapsed/0.8)):['chapelFade','evening','seat','seating','lights','lampRequest'].includes(s.phase)?0:4;
  for(let i=0;i<count;i++){const x=[43.3,45,55,56.7][i];props+=img(extra(3),'prop added-candle',`left:${x}%;bottom:50.7%;width:1.7%;height:8%;object-position:center bottom`);}
 }

 $('cast').innerHTML=actors;$('props').innerHTML=props;$('seats').innerHTML=furniture;
 // In both the occupied and empty room, nearer floor anchors paint over farther seats.
 if(a==='chapel')for(const el of document.querySelectorAll('#cast>.actor,#seats>.prop')){el.style.zIndex=String(Math.round(1000-parseFloat(el.style.bottom)*10));if(el.classList.contains('startled'))el.style.animationDelay=`-${s.elapsed}s`;}
 $('stage').dataset.phase=s.phase;
 const close=['unbox','perfume','revealHold','recognize','cardInspect','inscription'].includes(s.phase);$('focus-scene').hidden=!close;$('stage').classList.toggle('closeup',close);$('stage').classList.toggle('unwrapping',s.phase==='unbox');
 if(close){let idx=s.step<1?2:s.step<3?3:s.step<5?5:s.step<7?7:6;const cotton=s.step===0;const dress=s.step>=7;
 $('focus-scene').innerHTML=dress?`<div class="dress-holder">${img(revised('aunt-hands-v2'),'holding-aunt')}${img(revised('dress-v2'),'held-dress')}</div>${img(revised('dress-v2'),'focus-object revealed-dress')}`:'<div class="focus-altar"></div>'+img(s.step<2?aunt(1):s.step===6?extra(2):aunt(4),'focus-aunt')+img(obj(idx),'focus-object',s.step===6?'top:8%;height:48%;transform:rotate(-8deg)':'')+(cotton?img(obj(4),'focus-cotton'):'')+(s.step===4?img(obj(7),'focus-cotton','top:38%;height:30%'):'');}
 $('light').style.opacity=battle?'1':a==='chapel'?'0.5':'.4';
}
function scaleActors(){const a=document.querySelector('.aunt'),t=document.querySelector('.teo');if(!['awaken','challenge','battle','cast','triumphHold','triumph','homeFade'].includes(s.phase))return;const pairs=[[1.65,1],[1.3,1.2],[.95,1.45],[.65,1.7]];let [as,ts]=pairs[s.used.length];if(s.phase==='awaken'){const q=Math.min(1,s.elapsed);as=1+.65*q;ts=1;}if(a)a.style.transform=`scale(${s.used.length===3?1:as})`;if(t)t.style.transform=`scale(${ts})`;}
function renderBoss(){
 const active=['awaken','challenge','battle','cast','triumphHold','triumph','homeFade'].includes(s.phase),hero=active&&s.used.length===3;
 const hud=$('boss-hud'),halo=$('saint-halo');hud.hidden=!active||hero;halo.hidden=!hero;
 if(!active)return;
 const actor=document.querySelector(hero?'.teo':'.aunt');if(!actor)return;
 const stage=$('stage').getBoundingClientRect(),r=actor.getBoundingClientRect();
 if(hero){halo.style.left=(r.x-stage.x+r.width/2)+'px';halo.style.top=Math.max(24,r.y-stage.y+r.height*.055)+'px';halo.style.width=Math.min(130,r.width*.43)+'px';return;}
 const hp=Math.max(0,100-(s.used.length+(s.phase==='cast'&&s.elapsed>=2.2?1:0))*100/3);
 hud.dataset.owner='aunt';$('boss-name').textContent='帕特罗西尼奥·达斯内维斯 · 姨姨';
 $('boss-health').style.width=hp+'%';$('boss-meter').setAttribute('aria-valuenow',String(Math.round(hp)));
 const {width:w,height:h}=hud.getBoundingClientRect();
 hud.style.left=Math.max(12,Math.min(stage.width-w-12,r.x-stage.x+r.width/2-w/2))+'px';
 hud.style.top=Math.max(64-stage.y,r.y-stage.y-h-10)+'px';
}
function renderHotspot(){
 const spots={cardInspect:{x:40,y:24,label:'查看纸卡'},seat:{x:30.5,y:66,label:'点击绿绒座椅坐下'},lights:{x:64,y:59,label:'请姨姨添灯'},unbox:{x:45,y:s.step===0?49:44,label:actionLabels['unbox'+s.step]},take:{x:83,y:78,label:'提起大箱子'},exit:{x:27,y:46,label:'走出房门'},empty:{x:13,y:49,label:'离开祈祷室'}};
 if(s.phase==='unbox')spots.unbox.label=unwrapSteps[s.step].label;
 const spot=spots[s.phase],el=$('scene-hotspot');el.hidden=!spot;$('hotspot-caption').hidden=!spot||['cardInspect','seat','empty','take','exit'].includes(s.phase);
 if(!spot)return;
 el.style.left=spot.x+'%';el.style.top=spot.y+'%';
 if(s.phase==='cardInspect'){
  const target=$('focus-scene').querySelector('.revealed-dress');
  if(target?.naturalWidth){const stage=$('stage').getBoundingClientRect(),r=target.getBoundingClientRect(),scale=Math.min(r.width/target.naturalWidth,r.height/target.naturalHeight),w=target.naturalWidth*scale,h=target.naturalHeight*scale;el.style.left=(r.left-stage.left+(r.width-w)/2+w*.61)+'px';el.style.top=(r.top-stage.top+(r.height-h)/2+h*.235)+'px';}
 }
 if(s.phase==='unbox'){
  const target=$('focus-scene').querySelector(s.step===0?'.focus-cotton':'.focus-object');
  if(target?.naturalWidth){const stage=$('stage').getBoundingClientRect(),r=target.getBoundingClientRect(),scale=Math.min(r.width/target.naturalWidth,r.height/target.naturalHeight),w=target.naturalWidth*scale,h=target.naturalHeight*scale;
   // Intrinsic coordinates follow the long free ribbon tail, never the bow loops.
   const x=s.step===2?.96:.5,y=s.step===2?.70:.5;
   el.style.left=(r.left-stage.left+(r.width-w)/2+w*x)+'px';el.style.top=(r.top-stage.top+(r.height-h)/2+h*y)+'px';
  }
 }el.setAttribute('aria-label',spot.label);$('hotspot-caption').textContent=spot.label;
}
function renderUnwrap(){
 if(s.phase!=='unbox')return;const p=s.unwrap||0,focus=$('focus-scene'),object=focus.querySelector('.focus-object');
 if(!object)return;
 if(s.step===0){const cotton=focus.querySelector('.focus-cotton'),r=$('stage').getBoundingClientRect();if(cotton)cotton.style.transform=`translate(${(s.unwrapDX||0)*r.width}px,${(s.unwrapDY||0)*r.height}px)`;}
 if(s.step===2){object.src=asset('v08/ribbon-'+(p<.7?0:1));object.style.transform=`translateX(${p*20}px)`;}
 if(s.step===3)object.src=asset('v08/ribbon-2');
}
function cottonOutside(dx,dy){
 const stage=$('stage').getBoundingClientRect(),cotton=$('focus-scene').querySelector('.focus-cotton'),box=$('focus-scene').querySelector('.focus-object');
 if(!cotton||!box?.naturalWidth)return false;
 const c=cotton.getBoundingClientRect(),r=box.getBoundingClientRect(),scale=Math.min(r.width/box.naturalWidth,r.height/box.naturalHeight),w=box.naturalWidth*scale,h=box.naturalHeight*scale,left=r.left+(r.width-w)/2,top=r.top+(r.height-h)/2;
 const x=c.x+c.width/2+((dx-(s.unwrapDX||0))*stage.width),y=c.y+c.height/2+((dy-(s.unwrapDY||0))*stage.height);
 return Math.hypot(dx*stage.width,dy*stage.height)>Math.min(w,h)*.14&&(x<left+w*.12||x>left+w*.9||y<top+h*.42||y>top+h*.87);
}
const unwrapInput=new UnwrapInteraction({point:$('scene-hotspot'),stage:$('stage'),state:()=>s,blocked:()=>paused||!ready,cottonOutside:cottonOutside,update:(p,offset={})=>{const next={...s,...offset,unwrap:p};set(p>=1?action(next):next);},sound:name=>sound.effect(name)});
$('focus-scene').addEventListener('pointerdown',e=>{unwrapInput.ignoreClick=false;if(s.phase==='unbox'&&s.step===0&&e.target.matches('.focus-cotton'))unwrapInput.down(e);});
$('focus-scene').addEventListener('click',e=>{if(s.phase==='unbox'&&e.target.matches('.focus-object,.focus-cotton'))unwrapInput.tap();});
$('focus-scene').addEventListener('dragstart',e=>e.preventDefault());
$('focus-scene').addEventListener('load',()=>{if(s.phase==='unbox')renderHotspot();},true);
function renderDialogue(){rememberRow();const r=review!==null?history[review]:row();$('dialogue').hidden=!r||s.phase==='eveningBlack';$('portrait').hidden=!r?.who;if(!r){dialogueKey='';return;}const signature=[r.id,r.who,r.text,s.phase,review].join(':');if(signature===dialogueKey)return;dialogueKey=signature;$('speaker').textContent=r.who;$('words').textContent=r.text;$('dialogue').classList.toggle('narration',!r.who);const p=r.portrait||portrait(r.who);$('portrait').classList.toggle('full',Array.isArray(p)&&p[1]);$('portrait').toggleAttribute('data-shared',!Array.isArray(p));if(r.who)$('portrait').innerHTML=Array.isArray(p)?`<img src="${p[0]}" alt="">`:portraitMarkup(p);$('next').disabled=!!durations[s.phase]&&review===null;$('previous').disabled=history.length<2||!!durations[s.phase];$('dialogue').setAttribute('aria-label',r.who?'交谈':'叙述');}
function render(){preferences();sound.scene(s.phase);const signature=[s.phase,['arrival','triumph'].includes(s.phase)?s.line:0,s.step,s.used.length,s.phase==='lighting'?Math.floor(s.elapsed/.8):0].join(':');if(signature!==visualKey){visualKey=signature;paintStage();}scaleActors();renderBoss();renderDialogue();renderUnwrap();renderHotspot();
 const hand=s.phase==='battle';$('cards').hidden=!hand;$('card-hint').hidden=true;if(hand){const remaining=cards.filter(c=>!s.used.includes(c.id));const ids=remaining.map(c=>c.id).join();if($('cards').dataset.ids!==ids){$('cards').dataset.ids=ids;$('cards').innerHTML=remaining.map(c=>`<button class="relic-card" data-card="${c.id}" aria-label="${c.name}：${esc(c.text)}"><img src="${cardArt(c.art)}" alt=""><h3>${c.name}</h3><p>${c.text}</p></button>`).join('');for(const b of $('cards').children)b.onclick=()=>castCard(b.dataset.card);}}
 const label=s.phase==='unbox'?actionLabels['unbox'+s.step]:actionLabels[s.phase];$('action').hidden=!label||['seat','lights','curtainClosed','inscription','unbox','take','exit','empty'].includes(s.phase)||!!row();if($('action').dataset.label!==(label||'')){$('action').dataset.label=label||'';$('action').innerHTML=label?point()+`<span>${esc(label)}</span>`:'';}
 $('dedication').hidden=s.phase!=='inscription';$('ending').hidden=s.phase!=='end';
 const curtain=s.phase==='curtainClosing'?Math.min(1,s.elapsed/1.8):s.phase==='curtainClosed'?1:s.phase==='curtainOpening'?1-Math.min(1,s.elapsed/2.2):0;$('game').style.setProperty('--curtain',curtain);$('reopen').hidden=s.phase!=='curtainClosed';$('curtains').setAttribute('aria-hidden',String(curtain===0));
 const k=s.phase==='cast'?s.pending:'';if(fxKey!==k){fxKey=k;$('fx').className=k;$('fx').innerHTML=k?img(cardArt(cards.find(c=>c.id===k).art),'flying-object')+'<div class="cast-wave"></div>':'';}
 $('stage').style.opacity=s.phase==='ending'?1-s.elapsed/2:1;
 const transition=['homeFade','eveningBlack','chapelFade','roomFade','roomBlack','roomIn'].includes(s.phase);
 const fade=['homeFade','roomFade'].includes(s.phase)?Math.min(1,s.elapsed/durations[s.phase]):['chapelFade','roomIn'].includes(s.phase)?1-Math.min(1,s.elapsed/durations[s.phase]):1;
 $('scene-fade').hidden=!transition;$('scene-fade').style.opacity=fade;
 $('intertitle').hidden=s.phase!=='eveningBlack';$('intertitle-words').textContent=s.phase==='eveningBlack'?row()?.text||'':'';

}
const required=['v11/dress-floor','v10/crate-open','v08/chapel-clean','v08/dedication-paper','v08/teo-seated','v08/aunt-seated','v08/guest-0','v08/guest-1','v08/guest-2','v08/guest-3','v08/ribbon-0','v08/ribbon-1','v08/ribbon-2',...['teo-surprised','teo-sad','teo-chair','aunt-angry','aunt-chair',...Array.from({length:4},(_,i)=>'guest-chair-'+i)].map(n=>'v09/'+n),'v02/doorway-v2','v02/chapel-v2','v02/aunt-kneel-v2','v02/dress-v2','v02/aunt-hands-v2','v02/teo-sad-v2','bedroom','gate-night','plain-chair',...Array.from({length:8},(_,i)=>'guest-'+i),...Array.from({length:4},(_,i)=>'extra-'+i),...Array.from({length:8},(_,i)=>'aunt-'+i),...Array.from({length:8},(_,i)=>'people-'+i),...Array.from({length:8},(_,i)=>'obj-'+i),...Array.from({length:3},(_,i)=>'card-'+String(i).padStart(2,'0'))];
let leavingForBook=false;
async function finishIntoNotebook(){if(leavingForBook)return;leavingForBook=true;s=normalize({...s,phase:'end',complete:true,elapsed:0});save();$('dialogue').hidden=true;$('ending').hidden=true;$('stage').style.opacity=1;await returnToNotebook($('stage'),{preview,reduced:s.reduced,paused:()=>paused||document.hidden,onFinish:()=>sound.stop()});}
async function start(){ready=false;$('load').hidden=false;$('retry').hidden=true;try{await Promise.all([...required.map(asset),'./assets/dinner/street.webp'].map(src=>{const image=new Image();image.src=src;return image.decode();}));ready=true;$('load').hidden=true;render();save();if(['ending','end'].includes(s.phase))void finishIntoNotebook();}catch{$('load p').textContent='舞台素材未能载入。';$('retry').hidden=false;}}
function prev(){if(paused||durations[s.phase]||history.length<2)return;review=review===null?history.length-2:Math.max(0,review-1);renderDialogue();}
$('next').onclick=e=>{e.stopPropagation();go();};$('dialogue').onclick=go;$('previous').onclick=e=>{e.stopPropagation();prev();};$('action').onclick=useAction;$('scene-hotspot').onclick=()=>s.phase==='unbox'?unwrapInput.tap():useAction();$('reopen').onclick=useAction;$('read-done').onclick=useAction;$('settings-open').onclick=openSettings;$('resume').onclick=resume;$('retry').onclick=start;
for(const id of ['settings'])$(id).addEventListener('cancel',e=>{e.preventDefault();resume();});
$('restart-scene').onclick=()=>{const saved=checkpoint.restore();if(saved){history=[];review=null;set({...saved,volume:s.volume,muted:s.muted,reduced:s.reduced});resume();}};
$('replay').onclick=()=>{checkpoint.clear();history=[];set({...initial(),...readPreferences(s)});};
$('sound').onclick=()=>{s.muted=!s.muted;preferences();save();};$('volume').oninput=e=>{s.volume=+e.target.value;preferences();save();};$('reduced').onchange=e=>{s.reduced=e.target.checked;preferences();save();};
document.addEventListener('pointerdown',()=>{if(!paused&&ready)void sound.unlock();});
document.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.target.matches('input'))return;if(e.code==='Escape'){e.preventDefault();if(!e.repeat)paused?resume():openSettings();return;}if(paused||!ready||e.repeat)return;void sound.unlock();if(s.phase==='battle'){const buttons=[...$('cards').children];if(['ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();selected=(selected+(e.code==='ArrowLeft'?-1:1)+buttons.length)%buttons.length;buttons[selected]?.focus();}else if(['Space','Enter'].includes(e.code)){e.preventDefault();buttons[selected]?.click();}return;}if(['KeyA','ArrowLeft'].includes(e.code)){e.preventDefault();prev();}else if(['Space','Enter','KeyD','ArrowRight'].includes(e.code)){e.preventDefault();go();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)unwrapInput.cancel();sound.pause(paused||document.hidden);document.body.classList.toggle('paused',paused||document.hidden);last=performance.now();save();});window.addEventListener('pagehide',()=>{save();sound.stop();});
function frame(now){const dt=Math.min(.06,(now-last)/1000);last=now;if(ready&&!paused&&!document.hidden){sound.tick(dt);renderBoss();if(durations[s.phase]){const next=tick(s,dt);if(next.phase!==s.phase)set(next);else{s=next;render();}}if(now-savedAt>1000){save();savedAt=now;}}requestAnimationFrame(frame);}
window.chapter6={snapshot:()=>structuredClone(s),ready:()=>ready,sound:()=>({mode:sound.mode,music:sound.desired,voices:sound.voices.size,errors:sound.errors}),history:()=>structuredClone(history)};
void start();requestAnimationFrame(frame);

// Shared cross-chapter controls and latest preferences.
installSharedControls({soundButton:'#sound',settingsButton:'#settings-open',getPreferences:()=>s,applyPreferences:p=>{Object.assign(s,p);preferences();save();},toggleSettings:()=>{if($('settings').open)resume();else{openSettings();}},closeTop:()=>{if($('settings').open){resume();return true;}return false;},unlock:()=>sound.unlock()});

const restartChapter=document.createElement('button');restartChapter.type='button';restartChapter.id='restart-chapter';restartChapter.textContent='重新开始本章';restartChapter.onclick=()=>{unwrapInput.cancel();checkpoint.clear();history=[];review=null;dialogueKey='';visualKey='';fxKey='';set({...initial(),...readPreferences(s)});checkpoint.capture(s);resume();save();};document.querySelector('#settings').append(restartChapter);

installCardControls({active:()=>s.phase==='battle'&&!paused&&ready,buttons:()=>[...$('cards').children],onSelect:(_b,i)=>{selected=i;}});

$('seats').addEventListener('click',e=>{if(s.phase==='seat'&&e.target.matches('.teo-empty-chair'))useAction();});
$('cast').addEventListener('click',e=>{if(s.phase==='lights'&&e.target.matches('.aunt'))useAction();});

$('intertitle').onclick=go;

// Independent chapter previews keep their epilogue saves isolated.
if(preview)document.getElementById("chapter7-entry").href="./chapter7.html?preview=1";
