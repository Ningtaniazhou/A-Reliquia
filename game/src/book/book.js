import {bookCamera,pageTextMatrix} from './page-layout.js';
import * as T from '../../vendor/three/three.module.js';
import {createBook,SIZE} from './model.js';
import {introduction,credits,beacon} from './content.js';
import {poses,motions,ease,turnLift} from './motion.js';
const css=new URL('../../styles/book/book.css',import.meta.url);if(!document.querySelector('link[data-book-style]')){const l=document.createElement('link');l.rel='stylesheet';l.href=css;l.dataset.bookStyle='';document.head.append(l);}
// One scene and one physical book own all opening/ending states. No game saves are changed here.
export async function mountBook(host,{mode='front',lastPage=null,arrival=false,getPreferences=()=>({}),paused=()=>false,onEnter=()=>{},onFront=()=>{},enterLabel='进入书中世界',onState=()=>{}}={}){
 host.classList.add('book-host');host.innerHTML='<div class="book-loading" role="status">正在取出书本……</div>';
 let renderer;
 try{renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});}catch{host.innerHTML=`<div class="book-fallback"><p>此浏览器未能显示三维书本。</p><article>${mode==='ending'?credits:introduction}</article><button class="start">${enterLabel}</button></div>`;host.querySelector('button').onclick=onEnter;return {dispose(){},pause(){},paintingRect:{x:innerWidth*.25,y:innerHeight*.25,width:innerWidth*.5,height:innerHeight*.5},snapshot:()=>({phase:'fallback'})};}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.setClearColor(0x000000,0);
 const scene=new T.Scene(),camera=new T.OrthographicCamera(-4,4,3,-3,.1,80);
 scene.add(new T.HemisphereLight(0xfff9ed,0x465354,1.9));
 const key=new T.DirectionalLight(0xfff6e8,2.4);key.position.set(-4,7,9);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-9,right:9,top:8,bottom:-8,near:.5,far:30});key.shadow.bias=-.00015;key.shadow.normalBias=.025;key.shadow.radius=5;scene.add(key);
 const fill=new T.DirectionalLight(0xcce1e7,1.2);fill.position.set(7,-2,5);scene.add(fill);
 const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({opacity:.28}));ground.position.z=-.41;ground.receiveShadow=true;scene.add(ground);
 let model;
 try{model=await createBook();}catch{renderer.dispose();host.innerHTML='<div class="book-fallback"><p>书本图画暂时未能载入。</p><button>重新载入</button></div>';host.querySelector('button').onclick=()=>location.reload();return {dispose(){},snapshot:()=>({phase:'error'})};}
 scene.add(model.root);host.innerHTML='';host.append(renderer.domElement);renderer.domElement.setAttribute('aria-label','绿色精装书三维模型');
 const overlay=document.createElement('div');overlay.className='book-overlays';host.append(overlay);
 overlay.innerHTML=`<article class="book-copy" hidden><div class="book-copy-scroll" tabindex="0" role="region"></div><div class="book-copy-actions" hidden><button class="book-enter start">${enterLabel}</button></div><span class="book-scroll-note" hidden>向下阅读 ↓</span></article><button class="book-hand" hidden>${beacon}<span></span></button><span class="book-live" aria-live="polite"></span>`;
 const panel=overlay.querySelector('.book-copy'),scroll=overlay.querySelector('.book-copy-scroll'),actions=overlay.querySelector('.book-copy-actions'),entry=overlay.querySelector('.book-enter'),hint=overlay.querySelector('.book-scroll-note'),handle=overlay.querySelector('.book-hand'),live=overlay.querySelector('.book-live');
 let phase='front',disposed=false,dirty=true,animation=null,raf,last=performance.now(),reading=0,readEnd=false,atEndFor=0,width=1,height=1,paperWidth=1,paperHeight=1,fitKey='';
 let arrivalTime=arrival?0:4;
 const arrivalPaper=document.createElement('div');arrivalPaper.className='book-arrival-paper';arrivalPaper.hidden=!arrival;overlay.prepend(arrivalPaper);
 if(lastPage){overlay.append(lastPage);lastPage.classList.add('on-paper');lastPage.hidden=false;}
 const pose={...poses.front};
 const reduced=()=>getPreferences().reduced||matchMedia('(prefers-reduced-motion: reduce)').matches;
 function setPhase(p){dirty=true;phase=p;host.dataset.bookPhase=p;panel.hidden=!['intro','ending','closing'].includes(p);handle.hidden=true;onState(p);if(p==='intro'||p==='ending'){
  fitKey='';entry.disabled=false;scroll.innerHTML=p==='intro'?introduction:credits;scroll.scrollTop=0;scroll.setAttribute('aria-label',p==='intro'?'书封介绍':'片尾信息');actions.hidden=p!=='intro';panel.classList.toggle('book-credits',p==='ending');reading=0;atEndFor=0;readEnd=false;
 }live.textContent=({front:'圣遗物。展开前护封，进入书本世界。',intro:'前护封已展开。',ending:'读到最后一页。右侧是制作信息与致谢。',back:'书已合上。点击书脊上的光点，翻回封面。'})[p]||'';}
 function motion(target,duration){return new Promise(resolve=>{animation={from:{...pose},target,duration:reduced()?.14:duration,elapsed:0,resolve};});}
 async function sequence(name){for(const [target,duration] of motions[name]){if(disposed)return;await motion(target,duration);}}
 async function open(){if(phase!=='front'||paused())return;setPhase('opening');await sequence('open');if(!disposed){setPhase('intro');scroll.focus({preventScroll:true});}}
 async function close(){if(phase!=='ending'||!readEnd||paused())return;setPhase('closing');await sequence('close');if(!disposed){setPhase('back');position();handle.focus({preventScroll:true});}}
 async function flip(){if(phase!=='back'||paused())return;setPhase('flipping');await sequence('flip');if(disposed)return;pose.turn=0;setPhase('front');onFront();position();handle.focus({preventScroll:true});}
 async function ending(){if(disposed||animation||paused())return;const wasIntro=phase==='intro';setPhase('to-ending');if(wasIntro)await sequence('ending');else{await motion({turn:Math.PI,lift:0},2.6);if(!disposed)await motion({back:Math.PI-.15,look:1.4,spread:1},2);}if(!disposed){setPhase('ending');scroll.focus({preventScroll:true});}}
 function project(parent,x,y,z){const v=new T.Vector3(x,y,z);parent.localToWorld(v);v.project(camera);return {x:(v.x+1)*width/2,y:(1-v.y)*height/2};}
 function putPanel(parent,x0,x1,z){const tl=project(parent,x0,1.74,z),tr=project(parent,x1,1.74,z),bl=project(parent,x0,-1.73,z);const projectedWidth=Math.hypot(tr.x-tl.x,tr.y-tl.y),projectedHeight=Math.hypot(bl.x-tl.x,bl.y-tl.y);
 if(phase!=='closing'){paperWidth=projectedWidth;paperHeight=projectedHeight;}
 const w=paperWidth,h=paperHeight;panel.style.width=w+'px';panel.style.height=h+'px';panel.style.transform=`matrix(${(tr.x-tl.x)/w},${(tr.y-tl.y)/w},${(bl.x-tl.x)/h},${(bl.y-tl.y)/h},${tl.x},${tl.y})`;
 const nextFit=[phase,Math.round(w),Math.round(h)].join(':');if(phase!=='closing'&&nextFit!==fitKey){fitKey=nextFit;let font=Math.min(19,Math.max(14,w*.046));panel.style.setProperty('--book-font',font+'px');while(scroll.scrollHeight>scroll.clientHeight+1&&font>11){font-=.25;panel.style.setProperty('--book-font',font+'px');}}
 }
 function putHand(parent,x,y,z,label){const p=project(parent,x,y,z);handle.style.left=p.x+'px';handle.style.top=p.y+'px';handle.setAttribute('aria-label',label);handle.removeAttribute('title');const caption=handle.querySelector('span');caption.textContent='';caption.hidden=true;handle.hidden=false;}
 function applyPose(){model.front.rotation.y=pose.front;model.fold.rotation.y=pose.fold;model.back.rotation.y=pose.back;model.root.rotation.y=pose.turn;model.root.position.z=pose.lift+(animation&&'turn' in animation.target?turnLift(Math.min(1,animation.elapsed/animation.duration)):0);model.root.updateMatrixWorld(true);
 bookCamera(camera,width,height,pose);
 }
 function position(){applyPose();
 if(lastPage){
  lastPage.hidden=!['ending','closing'].includes(phase)||(phase==='closing'&&pose.back<Math.PI/2);
  if(!lastPage.hidden){
   const target=pageTextMatrix((x,y,z)=>project(model.rig,x,y,z),lastPage.offsetWidth,lastPage.offsetHeight);
   lastPage.style.transform=`matrix(${target.join(',')})`;
  }
 }
 const arrivalProgress=Math.min(1,arrivalTime/4);arrivalPaper.style.opacity=1-arrivalProgress;arrivalPaper.hidden=arrivalProgress>=1;
 panel.style.opacity=arrival?Math.max(0,(arrivalProgress-.45)/.55):1;
if(phase==='intro')putPanel(model.fold,-.15,-SIZE.flap+.15,-.006);if(phase==='closing')panel.hidden=pose.back<Math.PI/2;if(phase==='ending'||phase==='closing')putPanel(model.backFold,-SIZE.flap+.1,-.1,.009);
 if(phase==='front')putHand(model.front,SIZE.w,0,.045,'展开护封');else if(phase==='back')putHand(model.rig,-.10,0,SIZE.t/2,'翻回封面');else if(phase==='ending'&&readEnd)putHand(model.back,SIZE.w,0,.06,'合上书');
 if(!panel.hidden){const overflow=scroll.scrollHeight>scroll.clientHeight+4;hint.hidden=!overflow||scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-4;}
 }
 function resize(){dirty=true;const r=host.getBoundingClientRect();width=Math.max(1,r.width);height=Math.max(1,r.height);renderer.setSize(width,height);position();}
 const observer=new ResizeObserver(resize);observer.observe(host);
 entry.onclick=()=>{if(phase==='intro'&&!paused()){entry.disabled=true;Promise.resolve(onEnter()).then(result=>{if(result===false)entry.disabled=false;}).catch(()=>{entry.disabled=false;});}};
 handle.onclick=()=>{if(phase==='front')void open();else if(phase==='ending')void close();else if(phase==='back')void flip();};
 function frame(now){if(disposed)return;const dt=Math.min(.08,(now-last)/1000);last=now;const stopped=document.hidden||paused();handle.style.animationPlayState=stopped?'paused':'running';host.dataset.reduced=String(reduced());
 if(!stopped){if(animation){dirty=true;animation.elapsed+=dt;const amount=ease(Math.min(1,animation.elapsed/animation.duration));for(const key in animation.target)pose[key]=T.MathUtils.lerp(animation.from[key],animation.target[key],amount);if(animation.elapsed>=animation.duration){const done=animation;animation=null;done.resolve();}}
 if(arrivalTime<4){arrivalTime=Math.min(4,arrivalTime+dt/(reduced()?.08:1));dirty=true;}
 if(phase==='ending'&&arrivalTime>=4){reading+=dt;const bottom=scroll.scrollTop+scroll.clientHeight>=scroll.scrollHeight-4;atEndFor=bottom?atEndFor+dt:0;if(reading>=5&&atEndFor>=1.4)readEnd=true;}
 position();if(dirty){renderer.render(scene,camera);dirty=false;}}
 raf=requestAnimationFrame(frame);
 }
 renderer.domElement.addEventListener('webglcontextlost',e=>{if(disposed)return;e.preventDefault();host.dataset.contextLost='true';live.textContent='画面暂时中断，请刷新恢复。';});
 renderer.domElement.addEventListener('webglcontextrestored',()=>{dirty=true;delete host.dataset.contextLost;});
 if(['ending','back','intro'].includes(mode)){Object.assign(pose,poses[mode]);setPhase(mode);}else setPhase('front');resize();raf=requestAnimationFrame(frame);
 // Project the actual printed arch, including camera tilt, instead of estimating its bounds.
 function paintingTransition(){
  const pixels=[[180,1115],[180,650]];
  for(let i=1;i<=48;i++){const t=i/48,u=1-t;pixels.push([180*u*u*u+3*180*u*u*t+3*844*u*t*t+844*t*t*t,650*u*u*u+3*365*u*u*t+3*365*u*t*t+650*t*t*t]);}
  pixels.push([844,1115]);
  const points=pixels.map(([x,y])=>project(model.art,(x/1024-.5)*(SIZE.w-.1),(.5-y/1463)*(SIZE.h-.1),0));
  const x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y)),w=Math.max(...points.map(p=>p.x))-x,h=Math.max(...points.map(p=>p.y))-y;
  const clip='polygon('+points.map(p=>`${(p.x-x)/w*100}% ${(p.y-y)/h*100}%`).join(',')+')';
  const expanded='polygon('+points.map((_,i)=>i===0?'0% 100%':i===points.length-1?'100% 100%':`${(i-1)/48*100}% 0%`).join(',')+')';
  renderer.render(scene,camera);
  return {x,y,width:w,height:h,clip,expanded,image:renderer.domElement.toDataURL()};
 }
 return {open,ending,close,flip,model,scene,renderer,camera,paintingTransition,snapshot:()=>({phase,pose:{...pose},reading,readEnd,animating:!!animation}),get paintingRect(){const a=project(model.front,.46,1.0,.04),b=project(model.front,2.34,-1.4,.04);return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),width:Math.abs(b.x-a.x),height:Math.abs(b.y-a.y)};},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();animation?.resolve();scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});model.textures.forEach(t=>t.dispose());renderer.dispose();renderer.forceContextLoss();host.replaceChildren();}};
}
