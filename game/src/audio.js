import {ArrivalAudio} from './arrival/audio.js';
import {MemoryScore} from './score.js';
import {makeBird} from './birds.js';
// Original local score and ambience. No voice tracks or remote audio requests.
export class Ambience {
 constructor(){this.ctx=null;this.volume=.5;this.muted=false;this.paused=false;this.scene='intro';this.timer=null;this.tick=0;this.nextBird=0;this.birdIndex=0;this.journey={night:0,inside:0};}
 async unlock(){
  if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.master.gain.value=this.muted?0:this.volume*.65;
   const con=this.ctx.createConvolver(),size=this.ctx.sampleRate*2.2,b=this.ctx.createBuffer(2,size,this.ctx.sampleRate);for(let c=0;c<2;c++){let d=b.getChannelData(c);for(let i=0;i<size;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/size,3)*.25;}con.buffer=b;const wet=this.ctx.createGain();wet.gain.value=.22;con.connect(wet);wet.connect(this.master);this.reverb=con;
   // A seamless low wind bed keeps summer ambience present between bird calls.
   const wind=this.ctx.createBuffer(1,this.ctx.sampleRate*12,this.ctx.sampleRate),data=wind.getChannelData(0);let previous=0;
   for(let i=0;i<data.length;i++){previous=(previous+(Math.random()*2-1)*.025)/1.025;data[i]=previous*3;}
   this.wind=this.ctx.createBufferSource();this.wind.buffer=wind;this.wind.loop=true;
   const filter=this.ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=950;
   this.bed=this.ctx.createGain();this.bed.gain.value=['intro','cover','arrival','chapter2','writing-return','growth'].includes(this.scene)?0:.17;
   this.wind.connect(filter);filter.connect(this.bed);this.bed.connect(this.master);this.wind.start();
   this.score=new MemoryScore(this.ctx,this.master,this.reverb);this.score.set(['arrival','chapter2'].includes(this.scene)?'intro':this.scene==='growth'?'book':this.scene);this.arrivalMusic=new ArrivalAudio(this.ctx,this.master);this.birds=Array.from({length:4},(_,i)=>makeBird(this.ctx,i));
  }if(!this.paused)await this.ctx.resume();if(this.scene==='arrival')this.arrivalMusic.start().catch(()=>{});if(!this.timer)this.timer=setInterval(()=>this.pulse(),350);
 }
 set(scene){if(this.scene!==scene){this.scene=scene;this.tick=0;this.score?.set(['arrival','chapter2'].includes(scene)?'intro':scene==='growth'?'book':scene);if(scene==='arrival')this.arrivalMusic?.start().catch(()=>{});else this.arrivalMusic?.stop();}if(this.bed)this.bed.gain.setTargetAtTime(['intro','cover','arrival','chapter2','writing-return','growth'].includes(scene)?0:scene==='book'?.10:.17,this.ctx.currentTime,.8);}
 async prepareArrival(){await this.unlock();return this.arrivalMusic?.prepare();}
 doorway(){if(!this.ctx||this.muted)return;const duration=4.6,sr=this.ctx.sampleRate,b=this.ctx.createBuffer(1,Math.ceil(sr*duration),sr),d=b.getChannelData(0);for(let i=0;i<d.length;i++){const t=i/sr;let v=0;for(const at of [0,.42,.84]){const q=t-at;if(q>=0&&q<.25)v+=(Math.sin(q*2*Math.PI*115)*.35+(Math.random()*2-1)*.23)*Math.exp(-q*25);}if(t>2.8&&t<4.4){const q=t-2.8,env=Math.sin(q/1.6*Math.PI);v+=env*(Math.sin(2*Math.PI*(120*q+28*q*q+1.4*Math.sin(q*21)))*.055+(Math.random()*2-1)*.018);}d[i]=v;}const source=this.ctx.createBufferSource();source.buffer=b;source.connect(this.master);source.start();source.onended=()=>source.disconnect();}
 setJourney(value){this.journey=value;}
 setVolume(v){this.volume=v;this.update();}mute(v){this.muted=v;this.update();}
 update(){if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*.65,this.ctx.currentTime,.08);}
 async pause(v){this.paused=v;if(this.ctx){if(v)await this.ctx.suspend();else await this.ctx.resume();}}
 tone(f,d,g=.15,type='sine',delay=0,end=null){if(!this.ctx||this.paused||this.muted)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(g,t+.014);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(this.master);a.connect(this.reverb);o.start(t);o.stop(t+d+.03);}
 bell(f=392,g=.14){[1,2.01,2.76,4.07,5.42].forEach((r,i)=>this.tone(f*r,3.8-i*.45,g/(i+1)**1.8,'sine',0));}
 bird(){if(!this.ctx||this.paused||this.muted)return;const src=this.ctx.createBufferSource(),gain=this.ctx.createGain(),pan=this.ctx.createStereoPanner();src.buffer=this.birds[this.birdIndex++%4];src.playbackRate.value=.92+Math.random()*.14;gain.gain.value=this.scene==='book'?.035:.065;pan.pan.value=(Math.random()-.5)*1.25;src.connect(gain);gain.connect(pan);pan.connect(this.master);src.start();src.onended=()=>{src.disconnect();gain.disconnect();pan.disconnect();};}

 noise(duration=.18,gain=.1,filter=1500){if(!this.ctx||this.paused||this.muted)return;const t=this.ctx.currentTime,b=this.ctx.createBuffer(1,this.ctx.sampleRate*duration,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);const n=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='bandpass';f.frequency.value=filter;g.gain.value=gain;n.buffer=b;n.connect(f);f.connect(g);g.connect(this.master);n.start(t);}
 paper(){this.noise(.45,.14,1700);}write(){this.noise(.32,.08,2500);}
 pulse(){if(this.paused||!this.ctx||this.ctx.state!=='running')return;this.score.schedule();this.tick++;
  if(!['intro','cover','arrival','chapter2','writing-return','growth'].includes(this.scene)&&(this.scene!=='travel'||this.journey.night<.35)&&this.ctx.currentTime>=this.nextBird){this.bird();this.nextBird=this.ctx.currentTime+6+Math.random()*9;}
  if(this.muted)return;
  if(['window','room','book','road-ready','door'].includes(this.scene)){if([8,15,22,29].includes(this.tick)&&this.scene==='window')this.bell(392,.12);if(this.tick%73===0&&this.scene!=='book')this.bell(330,.055);}
  if(this.scene==='travel'&&this.journey.moving!==false){this.noise(.085,.17*(1-this.journey.inside*.45),550);if(this.tick%2===0)this.noise(.07,.09,1100);if(this.tick%5===1){this.tone(1240,.6,.045);this.tone(2347,.3,.013);}}
 }
 dispose(){this.arrivalMusic?.stop();clearInterval(this.timer);this.ctx?.close();}
}
