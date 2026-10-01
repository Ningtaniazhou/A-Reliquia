// One clock drives picture, sound and save recovery. It advances only while unpaused.
export const BRIDGE_DURATION=20;
export function bridgeFrame(t){return {embers:Math.max(0,Math.min(1,(t-5)/3)),dancers:1-Math.max(0,Math.min(1,(t-5)/3)),black:Math.max(0,Math.min(1,(t-8)/3)),wake:Math.max(0,Math.min(1,(t-18)/2))};}
const rows=[['托普修斯','特奥多里科，特奥多里科，起来！我们该去耶路撒冷了！'],['特奥多里科','现在就走？行囊不带，帐篷也留在这里？'],['托普修斯','马已经备好了。天亮以前，我们得赶到耶路撒冷城门。']];
export function campBridge({root,state,sound,persist,returnToCamp,paused,onContinue}){
 root.classList.add('camp-bridge');root.innerHTML='<div class="bridge-shade"></div><img class="bridge-wake" alt="烛光中的帐篷，托普修斯穿着白披风叫醒特奥多里科"><button class="bridge-resume" hidden>继续这一夜</button><section class="bridge-dialogue" hidden aria-label="帐篷中的对话"><small></small><p></p><button>继续</button></section><div class="bridge-actions" hidden><button data-continue>跟随托普修斯出发</button><button data-replay>重看这一段</button><button data-return>回到晚宴前的营地</button></div>';
 const image=root.querySelector('img');image.src='./assets/chapter4-art-v01/01-tent-night-embers.webp';
 let loaded=false,failed=false,active=false,second=-1,snoreBuffer=null,snoreBytes=null,snoreLoad=null,snoreIndex=0;
 const loadSnore=()=>snoreLoad||=(fetch('./assets/sound-effects/camp-snoring.wav').then(r=>{if(!r.ok)throw Error('snore');return r.arrayBuffer();}).then(b=>snoreBytes=b).catch(()=>{snoreLoad=null;return null;}));
 void loadSnore();const events=[];const sources=new Set();
 const preload=image.decode().then(()=>{loaded=true;}).catch(()=>{failed=true;});
 const gate=root.querySelector('.bridge-resume'),dialog=root.querySelector('section'),actions=root.querySelector('.bridge-actions');
 let armed=false,leaving=false;
 function depart(){if(leaving||paused())return;leaving=true;stopSounds();onContinue();}
 function play(kind){const c=sound.ctx;if(!c||sound.paused)return;
  let b,duration,offset=0;
  if(kind==='snore'){if(!snoreBuffer)return;b=snoreBuffer;duration=2.2;offset=(snoreIndex++%2)*duration;}
  else{duration=.24;b=c.createBuffer(1,Math.ceil(c.sampleRate*duration),c.sampleRate);const a=b.getChannelData(0);let smooth=0;for(let i=0;i<a.length;i++){const t=i/c.sampleRate;smooth=.82*smooth+.18*(Math.random()*2-1);a[i]=(.55*smooth+.28*Math.sin(2*Math.PI*105*t))*Math.exp(-t*24)*Math.min(1,t/.007);}}
  const source=c.createBufferSource(),gain=c.createGain();source.buffer=b;gain.gain.value=kind==='snore'?.65:1;source.connect(gain).connect(sound.master);source.start(0,offset,duration);sources.add(source);source.onended=()=>{sources.delete(source);source.disconnect();gain.disconnect();};events.push(kind);
 }
 function stopSounds(){for(const source of sources){try{source.stop();}catch{}}sources.clear();}
 async function arm(){await sound.unlock();if(!snoreBuffer){await loadSnore();if(snoreBytes)try{snoreBuffer=await sound.ctx.decodeAudioData(snoreBytes.slice(0));}catch{snoreBytes=null;snoreLoad=null;}}armed=!!snoreBuffer;gate.hidden=armed;}
 gate.onclick=()=>{if(!paused()){if(failed){failed=false;image.src=image.src.split('?')[0]+'?retry='+Date.now();image.decode().then(()=>loaded=true).catch(()=>failed=true);}void arm();}};
 function start(reset=false){leaving=false;active=true;second=-1;events.length=0;stopSounds();const s=state();if(reset){s.bridgeElapsed=0;s.bridgeLine=0;}snoreIndex=0;armed=!!snoreBuffer&&sound.ctx?.state==='running';if(!armed)void arm();root.hidden=false;document.body.classList.add('bridge-active');render();}
 function render(){const s=state(),t=s.bridgeElapsed||0,v=bridgeFrame(t);root.querySelector('.bridge-shade').style.opacity=v.black;image.style.opacity=v.wake;image.hidden=t<18||!loaded;gate.hidden=armed&&!failed;gate.textContent=failed?'重新载入帐篷画面':'继续这一夜';dialog.hidden=t<20||s.bridgeLine>=rows.length;actions.hidden=true;if(!dialog.hidden){dialog.querySelector('small').textContent=rows[s.bridgeLine||0][0];dialog.querySelector('p').textContent=rows[s.bridgeLine||0][1];}root.style.pointerEvents=t<20?'none':'auto';gate.style.pointerEvents='auto';}
 function tick(dt){if(!active)return;const s=state();if(!armed||!loaded){render();return;}const prev=s.bridgeElapsed||0;s.bridgeElapsed=Math.min(BRIDGE_DURATION,prev+dt);for(const [at,kind]of [[12,'snore'],[14.5,'snore'],[17.2,'pat']])if(prev<at&&s.bridgeElapsed>=at)play(kind);if(prev<6&&s.bridgeElapsed>=6)sound.request(null,4);if(Math.floor(s.bridgeElapsed)!==second){second=Math.floor(s.bridgeElapsed);persist();}render();if(s.bridgeElapsed>=20&&s.bridgeLine>=rows.length)depart();}
 function next(){if(paused())return;if(!armed){void arm();return;}const s=state();if(s.bridgeElapsed<20)return;if(s.bridgeLine<rows.length){s.bridgeLine++;persist();render();if(s.bridgeLine>=rows.length)depart();}}
 root.querySelector('[data-continue]').onclick=()=>{if(!paused()){stopSounds();onContinue();}};
 dialog.onclick=next;root.querySelector('[data-replay]').onclick=()=>{if(paused())return;start(true);sound.request('caravan',.5);persist();};root.querySelector('[data-return]').onclick=()=>{if(paused())return;hide();returnToCamp();};
 function hide(){active=false;root.hidden=true;stopSounds();document.body.classList.remove('bridge-active');}
 return {preload,start,tick,next,hide,status:()=>({active,loaded,armed,recordedSnore:!!snoreBuffer,events:[...events],voices:sources.size})};
}
