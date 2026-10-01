const root=document.querySelector('#preview');
const painted=document.querySelector('#painted');
const pixels=document.querySelector('#pixels');
const wave=document.querySelector('#wave');
const replay=document.querySelector('#replay');
const motion=document.querySelector('#motion');
const ctx=pixels.getContext('2d',{alpha:true});
let runId=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

function coverRect(iw,ih,cw,ch){
  const scale=Math.max(cw/iw,ch/ih),w=cw/scale,h=ch/scale;
  return {sx:(iw-w)/2,sy:(ih-h)/2,sw:w,sh:h};
}

function renderPixels(){
  const ratio=16/9,rect=root.getBoundingClientRect();
  const coarseW=320,coarseH=Math.round(coarseW/(rect.width/rect.height||ratio));
  pixels.width=coarseW;pixels.height=coarseH;
  const r=coverRect(painted.naturalWidth,painted.naturalHeight,coarseW,coarseH);
  ctx.imageSmoothingEnabled=true;
  ctx.clearRect(0,0,coarseW,coarseH);
  ctx.drawImage(painted,r.sx,r.sy,r.sw,r.sh,0,0,coarseW,coarseH);
  ctx.fillStyle='rgba(20,31,47,.035)';ctx.fillRect(0,0,coarseW,coarseH);
}

const wait=(ms,id)=>new Promise(resolve=>setTimeout(()=>resolve(id===runId),ms));

async function sweep(id){
  const duration=reduced?1:4100,start=performance.now();
  root.classList.add('pixelizing');
  return new Promise(resolve=>{
    function frame(now){
      if(id!==runId)return resolve(false);
      const p=Math.min(1,(now-start)/duration),e=1-Math.pow(1-p,3);
      pixels.style.clipPath=`inset(0 ${(1-e)*100}% 0 0)`;
      wave.style.left=`${e*112-14}%`;
      painted.style.opacity=String(1-.18*e);
      if(p<1)requestAnimationFrame(frame);else{root.classList.remove('pixelizing');wave.style.opacity='0';resolve(true);}
    }
    requestAnimationFrame(frame);
  });
}

async function play(){
  const id=++runId;
  root.className=reduced?'reduced':'';
  pixels.style.clipPath='inset(0 100% 0 0)';
  painted.style.opacity='1';wave.style.left='-14%';wave.style.opacity='';
  document.querySelector('#hint').textContent=reduced?'已按减少动态显示最终状态':'画面会自动演示一次';
  if(reduced){root.classList.add('walking','arrived','titled','finished');return;}
  if(!await wait(1250,id))return;
  if(!await sweep(id))return;
  if(!await wait(450,id))return;
  root.classList.add('walking');
  if(!await wait(4100,id))return;
  root.classList.add('arrived','titled');
  if(!await wait(1500,id))return;
  root.classList.add('finished');
}

painted.addEventListener('load',()=>{renderPixels();play();},{once:true});
if(painted.complete){renderPixels();play();}
addEventListener('resize',renderPixels);
replay.addEventListener('click',play);
motion.addEventListener('click',()=>{
  reduced=!reduced;motion.setAttribute('aria-pressed',String(reduced));motion.textContent=reduced?'恢复动态':'减少动态';play();
});
