import {updateSoundButton} from '../ui/sound-button.js';
import {scripts,labels,backgroundTopics} from './content.js';
import {SAVE_KEY,initial,normalize,finish} from './state.js';
import {Sound} from './audio.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let state;try{state=normalize(JSON.parse(localStorage.getItem(SAVE_KEY)),scripts);}catch{state=initial();}
const sound=new Sound(),images={},actors={
 topsius:{x:.035,y:.61,w:.107,h:.38,blend:0,alpha:1,near:0},
 merchant:{x:.381,y:.458,w:.0802,h:.285,blend:0,alpha:1,near:0},
 elder:{x:.649,y:.445,w:.0788,h:.28,blend:0,alpha:1,near:0},
 workers:{x:.81,y:.58,w:.1744,h:.31,blend:0,alpha:1,near:0},
};
let paused=false,ready=false,last=0,zoom=1,detailClosed='',dirty=true,transitionUntil=0,lastInput=performance.now(),cueLine='';
function fitScreen(){const z=Number.parseFloat(getComputedStyle(document.documentElement).zoom)||1;const h=`${window.innerHeight/z}px`;if($('dream').style.getPropertyValue('--screen-height')!==h)$('dream').style.setProperty('--screen-height',h);}
fitScreen();window.addEventListener('resize',fitScreen);new MutationObserver(fitScreen).observe(document.documentElement,{attributes:true,attributeFilter:['style']});
const spots=[
 {id:'court',label:'观察庭院',x:.59,y:.18,w:.15,h:.28},
 
 ...Object.entries(actors).map(([id,a])=>({id,label:labels[id],x:a.x,y:a.y,w:a.w,h:a.h})),
];
const save=()=>{try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch{$('save-warning').hidden=false;}};
const current=()=>state.active?scripts[state.active][state.cursors[state.active]||0]:null;
const stopped=()=>paused||document.hidden;
const elderVisible=()=>true;
const merchantVisible=()=>true;
const required=['court','stonework','intro','figs','elder','gift'];
const complete=()=>required.every(k=>state.completed.includes(k));
const keyFor=id=>id==='merchant'?'figs':id==='workers'?'stonework':id==='elder'?(!state.figs?'elderWait':state.elderHeard?'gift':'elder'):id;
function activity(){lastInput=performance.now();document.querySelectorAll('.hint,.continue-hint').forEach(b=>b.classList.remove('hint','continue-hint'));}
document.addEventListener('pointerdown',activity);document.addEventListener('keydown',activity);
setInterval(()=>{
 if(!ready||document.hidden||!state.started||performance.now()-lastInput<7000)return;
 if($('guide-menu').open)return;
 if(paused)return;
 if(state.active){$('next').classList.add('continue-hint');return;}
 const b=[...document.querySelectorAll('[data-spot]')].find(b=>b.dataset.spot!=='topsius'&&!b.disabled&&!state.completed.includes(keyFor(b.dataset.spot)));
 if(b)b.classList.add('hint');else if(complete())$('finish').classList.add('continue-hint');
},500);
function closeGuide(){ $('guide-menu').close();activity();document.querySelector('[data-spot="topsius"]')?.focus({preventScroll:true});}
function openGuide(){
 $('guide-topics').replaceChildren();
 for(const topic of backgroundTopics){const b=document.createElement('button');b.dataset.topic=topic.key;const read=state.completed.includes(topic.key);b.textContent=topic.title+(read?' ✓':'');b.setAttribute('aria-label',topic.title+(read?'，已读':''));b.onclick=()=>{closeGuide();start(topic.key);};$('guide-topics').append(b);}
 $('guide-menu').showModal();activity();
}
$('guide-close').onclick=closeGuide;$('guide-menu').addEventListener('cancel',e=>{e.preventDefault();closeGuide();});
const reduced=()=>state.reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
function setPause(v){paused=v;$('dream').classList.toggle('paused',v);sound.set(state,v,!!state.active);dirty=true;}
function openSettings(){if(!ready)return;$('volume').value=state.volume;$('reduced').checked=state.reduced;$('settings').showModal();setPause(true);}
function closeSettings(){$('settings').close();setPause(false);}
function restart(){state={...initial(),volume:state.volume,muted:state.muted,reduced:state.reduced};detailClosed='';for(const a of Object.values(actors))a.blend=0;$('settings').close();$('ending').close();setPause(false);save();render();$('enter').focus();}
function start(key){if(!ready||stopped())return;if((state.completed.includes(key)&&key!=='topsius'&&!key.startsWith('bg_'))||key==='gift'&&(!state.elderHeard||state.gift))return;
 state.active=key;state.cursors[key]??=0;detailClosed='';save();render();$('next').focus();sound.start().then(()=>sound.set(state,false,true));if(key==='figs')sound.cue('bell');if(key==='stonework')sound.cue('work');}
function advance(){if(!state.active||stopped())return;const key=state.active,index=state.cursors[key]||0;
 if(index+1>=scripts[key].length){finish(state,key);detailClosed='';save();render();if(key==='departure'){setPause(true);$('ending').showModal();}else if(key.startsWith('bg_'))openGuide();else if(complete()&&!state.completed.includes('departure'))start('departure');}
 else {state.cursors[key]=index+1;detailClosed='';save();render();}
}
function leave(){if(!state.active)return;if(state.active==='intro'){openSettings();return;}const id=current()?.actor;state.active=null;detailClosed='';save();render();document.querySelector(`[data-spot="${id||'topsius'}"]`)?.focus();}
function activate(id){if(state.active||!state.started||stopped())return;
 state.tutorialSeen=true;save();render();if(id==='topsius')openGuide();else start(keyFor(id));
}
for(const s of spots){const b=document.createElement('button');b.className='hotspot';b.dataset.spot=s.id;b.setAttribute('aria-label',s.label);b.innerHTML=`<span>${s.label}</span>`;b.style.cssText=`left:${s.x*100}%;top:${s.y*100}%;width:${s.w*100}%;height:${s.h*100}%`;b.onclick=()=>activate(s.id);$('hotspots').append(b);}
function render(){
 const line=current();dirty=true;transitionUntil=performance.now()+1700;
 $('opening').hidden=state.started;$('dialogue').hidden=!line;$('explore').hidden=!!line||!state.started;
 $('hotspots').inert=!!line||!state.started||paused;
 for(const s of spots){const b=document.querySelector(`[data-spot="${s.id}"]`);b.hidden=false;b.disabled=s.id!=='topsius'&&state.completed.includes(keyFor(s.id));b.classList.toggle('seen',b.disabled);}
 $('give').hidden=!state.elderHeard||state.gift;$('finish').hidden=!complete();
 $('help').hidden=state.tutorialSeen||!state.completed.includes('intro');
 $('leave').hidden=state.active==='intro';
 updateSoundButton($('sound'),state.muted);$('sound').classList.toggle('muted',state.muted);$('sound').setAttribute('aria-label',state.muted?'开启声音':'关闭声音');
 if(line){document.querySelector('.dialogue-top').hidden=line.mode==='narration';$('speaker').textContent=line.who;$('speech').textContent=line.text;$('speech').scrollTop=0;$('relation').textContent=line.mode==='thought'?'心声':'';$('next').innerHTML=(state.cursors[state.active]||0)===scripts[state.active].length-1?'点击收起':'点击对白继续';
  $('focus-name').textContent=line.actor?labels[line.actor]:state.active==='court'?'庭院':'';$('focus-name').hidden=!$('focus-name').textContent;
  if(line.detail==='gift'&&cueLine!==line.id){sound.cue('coins');cueLine=line.id;}
 }else $('focus-name').hidden=true;
 const detail=line?.detail;const show=false; // Keep attention in the painting, without an automatic object close-up.$('object-detail').hidden=!show;if(show)drawDetail(detail);
 sound.set(state,paused,!!line);
}
function drawDetail(kind){const d=$('detail-canvas').getContext('2d'),img=images[kind==='stone'?'elder':'merchant'];if(!img)return;d.clearRect(0,0,500,380);const cell=img.width/2;
 // Runtime camera crop of the outstretched hand in the original sprite sheet.
 const r=kind==='stone'?[cell+115,265,360,310]:[cell+100,320,365,300];d.drawImage(img,...r,0,0,500,380);$('detail-label').textContent=kind==='stone'?'刻着圣殿的雪花石':'他手中的两枚无花果';}
function draw(t){requestAnimationFrame(draw);if(!ready)return;const dt=Math.min((t-last)/1000||0,.05);last=t;if(stopped())return;
 const motion=!reduced();const targetZoom=1;zoom+=(targetZoom-zoom)*Math.min(1,dt*5);let moving=Math.abs(targetZoom-zoom)>.0002;
 const owner=({figs:'merchant',elder:'elder',gift:'elder',topsius:'topsius',intro:'topsius',departure:'topsius'})[state.active];
 for(const [id,a]of Object.entries(actors)){
  const index=state.cursors[state.active]||0;
  // A gesture is held for the whole exchange, not retriggered by each speaker.
  const target=id==='workers'?Number(state.active==='stonework'):Number(owner===id&&(id!=='merchant'||index>=1));
  const near=0,rate=motion?Math.min(1,dt*3):1;
  a.blend+=(target-a.blend)*rate;a.near+=(near-a.near)*rate;
  if(Math.abs(target-a.blend)>.001||Math.abs(near-a.near)>.001)moving=true;
 }

 if(!dirty&&!moving&&t>transitionUntil)return;dirty=false;
 const W=canvas.width,H=canvas.height;ctx.clearRect(0,0,W,H);ctx.save();ctx.translate(W/2,H/2);ctx.scale(zoom,zoom);ctx.translate(-W/2,-H/2);ctx.drawImage(images.background,0,0,W,H);
 const ordered=Object.entries(actors).sort((a,b)=>(a[1].y+a[1].h)-(b[1].y+b[1].h));
 for(const[id,a]of ordered){const im=images[id],cell=im.width/2;const h=a.h*H,w=h*cell/im.height;
  const x=(a.x+a.w/2)*W-w/2,y=a.y*H;
  ctx.save();ctx.filter='drop-shadow(0px 5px 4px rgba(38,28,17,.16))';
  if(a.blend<.999){ctx.globalAlpha=1-a.blend;ctx.drawImage(im,0,0,cell,im.height,x,y,w,h);}
  if(a.blend>.001){ctx.globalAlpha=a.blend;ctx.drawImage(im,cell,0,cell,im.height,x,y,w,h);}ctx.restore();
 }
 ctx.restore();
}
async function load(){try{await Promise.all(['background','topsius','merchant','elder','workers'].map(async name=>{const im=new Image();im.src=`./assets/dream-trial/${name}.webp?v=4`;await im.decode();images[name]=im;}));ready=true;$('enter').disabled=false;$('enter').textContent=state.started?'继续这一刻':'走进回廊';render();if(state.started&&!state.active&&!state.completed.includes('intro'))start('intro');}catch(e){$('load-error').hidden=false;$('opening').hidden=true;console.error(e);}}
$('enter').onclick=async()=>{await sound.start();state.started=true;save();if(!state.active)start('intro');else render();};
$('dialogue').addEventListener('click',e=>{if(!e.target.closest('button')&&!window.getSelection()?.toString())advance();});
$('next').onclick=advance;$('leave').onclick=leave;$('give').onclick=()=>start('gift');$('settings-open').onclick=openSettings;$('resume').onclick=closeSettings;$('restart').onclick=restart;$('replay').onclick=restart;
$('settings').addEventListener('cancel',e=>{e.preventDefault();closeSettings();});$('ending').addEventListener('cancel',e=>{e.preventDefault();$('return-painting').click();});
$('return-painting').onclick=()=>{$('ending').close();setPause(false);render();};$('finish').onclick=()=>{if(!complete())return;if(!state.completed.includes('departure'))start('departure');else{setPause(true);$('ending').showModal();}};
function mute(){state.muted=!state.muted;save();sound.start().then(()=>sound.set(state,paused,!!state.active));render();}
$('sound').onclick=mute;$('volume').oninput=e=>{state.volume=Number(e.target.value);save();sound.set(state,paused,!!state.active);};$('reduced').onchange=e=>{state.reduced=e.target.checked;save();dirty=true;};
$('detail-close').onclick=()=>{detailClosed=current()?.id;$('object-detail').hidden=true;};
document.addEventListener('keydown',e=>{
 if(e.repeat)return;if(e.code==='F1'){e.preventDefault();if($('ending').open||$('guide-menu').open)return;$('settings').open?closeSettings():openSettings();return;}
 if($('settings').open||$('ending').open||$('guide-menu').open)return;
 if(e.code==='Escape'){e.preventDefault();state.active?leave():openSettings();return;}
 if(e.code==='KeyM'){e.preventDefault();mute();return;}
 if(e.code==='Space'){e.preventDefault();if(!state.started)$('enter').click();else if(state.active)advance();else if(document.activeElement?.tagName==='BUTTON')document.activeElement.click();return;}
 if(e.code==='KeyE'&&!state.active&&document.activeElement?.dataset.spot){e.preventDefault();document.activeElement.click();}
});
document.addEventListener('visibilitychange',()=>{sound.set(state,paused,!!state.active);last=performance.now();dirty=true;});window.addEventListener('pagehide',()=>sound.close());
const unlockSound=()=>{sound.start().then(()=>sound.set(state,paused,!!state.active)).catch(()=>{});};
document.addEventListener('pointerdown',unlockSound,{once:true});document.addEventListener('keydown',unlockSound,{once:true});
// Read-only diagnostic for local acceptance checks; no main-game state is imported.
window.dreamTrialStatus=()=>({state:structuredClone(state),line:current()?.id,ready,paused,actors:structuredClone(actors),sound:sound.ctx?.state||'not-started',audio:{ambientGain:sound.ambientGain?.gain.value,masterGain:sound.gain?.gain.value,loaded:sound.nodes.length}});
load();requestAnimationFrame(draw);
