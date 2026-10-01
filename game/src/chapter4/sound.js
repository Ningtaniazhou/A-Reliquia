import {yawnSamples} from './foley.js';
// Procedural sound design: reconstruction for the adaptation, not historical recordings.
export function snoreSamples(rate=22050,duration=1.8){
 const out=new Float32Array(Math.ceil(rate*duration));let phase=0,noise=0;
 for(let i=0;i<out.length;i++){
  const t=i/rate,u=t/duration;
  // Irregular low glottal pulses, nasal resonances and a closing throat rattle.
  const env=Math.min(1,u/.13)*Math.pow(Math.max(0,Math.sin(Math.PI*u)),.65)*(1-.8*Math.max(0,(u-.84)/.16));
  const f=49+12*Math.sin(u*4)+4*Math.sin(t*29)+2*Math.sin(t*71);phase+=f/rate;
  const pulse=Math.exp(-((phase%1)/.13));noise=.45*noise+.55*(Math.random()*2-1);
  const rattle=(.6+.4*Math.sin(t*2*Math.PI*23))*(.45+noise*.35);
  const voiced=(pulse-.13)*1.2+.12*Math.sin(phase*2*Math.PI*3)+.065*Math.sin(phase*2*Math.PI*7);
  out[i]=Math.tanh((voiced*rattle+noise*.15*pulse)*3)*env*.72;
 }
 return out;
}
const profiles={tent:[.14,270,'cloth'],city:[.10,850,'crowd'],house:[.06,420,'room'],trial:[.09,1000,'crowd'],garden:[.13,1300,'birds'],hill:[.20,650,'dry'],night:[.10,450,'drip'],plaza:[.17,500,'horse'],dawn:[.018,900,'stream']};
export class ChapterSound{
 constructor(){this.ctx=null;this.scene=null;this.voices=new Set();this.ambientGains=new Map();this.effects=new Set();this.volume=.65;this.muted=false;this.paused=false;this.clock=0;this.nextEvent=2;this.generation=0;this.events=[];}
 async unlock(){if(!this.ctx){this.ctx=new AudioContext();this.master=this.ctx.createGain();const limit=this.ctx.createDynamicsCompressor();limit.threshold.value=-12;limit.ratio.value=5;this.master.connect(limit).connect(this.ctx.destination);this.level();if(this.scene)this.build(this.scene);}if(!this.paused)await this.ctx.resume();}
 level(){if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume,this.ctx.currentTime,.08);}
 setVolume(v){this.volume=Math.max(0,Math.min(1,v));this.level();}
 setMuted(v){this.muted=v;this.level();}
 pause(v){this.paused=v;if(this.ctx){if(v)void this.ctx.suspend();else void this.ctx.resume();}}
 setScene(id){if(this.scene===id&&!this.travelling)return;this.scene=id;this.travelling=false;this.clock=0;this.nextEvent=1.5;this.generation++;if(this.ctx)this.build(id);}
 bufferNoise(seconds){const c=this.ctx,b=c.createBuffer(1,c.sampleRate*seconds,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<a.length;i++){const edge=Math.min(1,i/400,(a.length-1-i)/400);a[i]=(Math.random()*2-1)*edge;}return b;}
 track(source,gain,set=this.voices){source.connect(gain).connect(this.master);set.add(source);if(set===this.voices)this.ambientGains.set(source,gain);source.onended=()=>{set.delete(source);this.ambientGains.delete(source);source.disconnect();gain.disconnect();};return source;}
 build(id){const c=this.ctx,token=this.generation;for(const s of this.voices){try{s.stop(c.currentTime+.4);}catch{}}const p=profiles[id]||profiles.tent;
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();src.buffer=this.bufferNoise(12);src.loop=true;filter.type='lowpass';filter.frequency.value=p[1];gain.gain.setValueAtTime(0,c.currentTime);gain.gain.linearRampToValueAtTime(p[0]*2.2,c.currentTime+.7);src.connect(filter);filter.connect(gain).connect(this.master);this.voices.add(src);this.ambientGains.set(src,gain);src.onended=()=>{this.voices.delete(src);this.ambientGains.delete(src);src.disconnect();filter.disconnect();gain.disconnect();};src.start();
  if(p[2]==='crowd'||id==='house'){
   this.crowdPromise??=fetch('./assets/dream-trial/courtyard.wav').then(r=>{if(!r.ok)throw Error('crowd');return r.arrayBuffer();}).then(b=>c.decodeAudioData(b)).catch(()=>null);
   this.crowdPromise.then(b=>{if(!b||token!==this.generation||id!==this.scene)return;const s=c.createBufferSource(),g=c.createGain();s.buffer=b;s.loop=true;g.gain.value=id==='house'?1.1:5;this.track(s,g);s.start();});
  }
 }
 tone(freq,duration,gain=.15,type='sine',end=freq,delay=0){const c=this.ctx,s=c.createOscillator(),g=c.createGain(),at=c.currentTime+delay;s.type=type;s.frequency.setValueAtTime(freq,at);s.frequency.exponentialRampToValueAtTime(Math.max(20,end),at+duration);g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(gain,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+duration);this.track(s,g,this.effects);s.start(at);s.stop(at+duration+.02);}
 noiseHit(duration=.15,gain=.2,cutoff=600,delay=0){const c=this.ctx,s=c.createBufferSource(),g=c.createGain(),f=c.createBiquadFilter(),at=c.currentTime+delay;s.buffer=this.bufferNoise(duration);f.frequency.value=cutoff;g.gain.setValueAtTime(gain,at);g.gain.exponentialRampToValueAtTime(.0001,at+duration);s.connect(f);f.connect(g).connect(this.master);this.effects.add(s);s.onended=()=>{this.effects.delete(s);s.disconnect();f.disconnect();g.disconnect();};s.start(at);}
 effect(kind){if(!this.ctx||this.paused)return;this.events.push(kind);if(kind==='yawn'){const c=this.ctx,b=c.createBuffer(1,Math.ceil(c.sampleRate*3.3),c.sampleRate);b.getChannelData(0).set(yawnSamples(c.sampleRate));const src=c.createBufferSource(),g=c.createGain();src.buffer=b;g.gain.value=1;this.track(src,g,this.effects);src.start(c.currentTime+.65);this.noiseHit(.65,.045,1100,.45);this.noiseHit(.7,.03,850,2.7);}else if(kind==='hammer'){this.noiseHit(.12,.38,3200);this.tone(1400,.10,.10,'triangle',700);}else if(kind==='coin'||kind==='basketCoin'){for(const [i,at] of [0,.085,.23,.39,.46].entries()){const f=2600+i*217;this.noiseHit(.018,.12,7600,at);this.tone(f,.20,.09/(1+i*.3),'sine',f,at);this.tone(f*1.47,.12,.055/(1+i*.3),'sine',f*1.47,at);this.tone(f*2.13,.075,.025,'sine',f*2.13,at);}if(kind==='basketCoin')this.noiseHit(.4,.12,1000,.6);}else if(kind==='chisel'){for(let k=0;k<3;k++){this.noiseHit(.11,.38,3200,k*.42);this.tone(1400,.10,.10,'triangle',700,k*.42);}}else if(kind==='horse'){for(let k=0;k<4;k++)this.noiseHit(.12,.27,450,k*.19);}else this.noiseHit(.55,.3,900);}
 wakeMorning(){if(this.ctx)for(const source of this.effects)try{source.stop();}catch{}this.effects.clear();this.setScene('dawn');this.nextEvent=.25;this.effect('yawn');}
 fadeForTravel(){this.generation++;if(!this.ctx)return;for(const g of this.ambientGains.values()){g.gain.cancelScheduledValues(this.ctx.currentTime);g.gain.setTargetAtTime(0,this.ctx.currentTime,.18);}this.travelling=true;}
 travel(kind){if(!this.ctx||this.paused)return;this.events.push('travel:'+kind);const horse=kind==='horse';for(let i=0;i<(horse?10:6);i++){const at=i*(horse?.21:.34);this.noiseHit(horse?.105:.16,horse?.32:.27,horse?570:850,at);this.tone(horse?140:105,.08,horse?.12:.08,'sine',60,at);if(!horse)this.noiseHit(.16,.07,1200,at+.08);}}
 tick(dt){if(!this.ctx||this.paused||this.travelling||this.ctx.state!=='running')return;this.clock+=dt;if(this.clock<this.nextEvent)return;this.nextEvent=this.clock+4+Math.random()*5;const id=this.scene;
  if(id==='garden'||id==='dawn'){this.tone(2400,.22,id==='dawn'?.025:.11,'sine',3300);this.tone(3200,.19,id==='dawn'?.018:.08,'sine',2300,.27);}
  else if(id==='night'){this.tone(1100,.18,.07,'sine',420);this.tone(850,.24,.06,'sine',350,.4);}
  else if(id==='plaza')this.effect('horse');else if(id==='tent'||id==='house')this.noiseHit(.6,.10,400);
 }
 stop(){this.generation++;for(const s of [...this.voices,...this.effects])try{s.stop();}catch{}this.voices.clear();this.effects.clear();void this.ctx?.close();}
 status(){return {scene:this.scene,context:this.ctx?.state||'locked',loops:this.voices.size,effects:this.effects.size,volume:this.volume,muted:this.muted,events:this.events.slice(-10)};}
}
