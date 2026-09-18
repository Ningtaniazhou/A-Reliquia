// Locally synthesized ambience; no voice tracks, remote requests, or music.
export class Ambience {
 constructor(){this.ctx=null;this.volume=.5;this.muted=false;this.paused=false;this.scene='intro';this.timer=null;this.tick=0;}
 async unlock(){
  if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.master.gain.value=this.volume*.35;
   const con=this.ctx.createConvolver(),size=this.ctx.sampleRate*2.2,b=this.ctx.createBuffer(2,size,this.ctx.sampleRate);for(let c=0;c<2;c++){let d=b.getChannelData(c);for(let i=0;i<size;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/size,3)*.25;}con.buffer=b;const wet=this.ctx.createGain();wet.gain.value=.22;con.connect(wet);wet.connect(this.master);this.reverb=con;
  }if(!this.paused)await this.ctx.resume();if(!this.timer)this.timer=setInterval(()=>this.pulse(),350);
 }
 set(scene){if(this.scene!==scene){this.scene=scene;this.tick=0;}}
 setVolume(v){this.volume=v;this.update();}mute(v){this.muted=v;this.update();}
 update(){if(this.master)this.master.gain.setTargetAtTime(this.muted?0:this.volume*.35,this.ctx.currentTime,.08);}
 async pause(v){this.paused=v;if(this.ctx){if(v)await this.ctx.suspend();else await this.ctx.resume();}}
 tone(f,d,g=.15,type='sine',delay=0,end=null){if(!this.ctx||this.paused||this.muted)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);a.gain.setValueAtTime(.0001,t);a.gain.exponentialRampToValueAtTime(g,t+.014);a.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(a);a.connect(this.master);a.connect(this.reverb);o.start(t);o.stop(t+d+.03);}
 bell(f=392,g=.14){[1,2.01,2.76,4.07,5.42].forEach((r,i)=>this.tone(f*r,3.8-i*.45,g/(i+1)**1.8,'sine',0));}
 bird(){let f=1900+Math.random()*1000;for(let i=0;i<3;i++)this.tone(f+i*220,.11,.022,'sine',i*.16,f+650-i*100);}
 noise(duration=.18,gain=.1,filter=1500){if(!this.ctx||this.paused||this.muted)return;const t=this.ctx.currentTime,b=this.ctx.createBuffer(1,this.ctx.sampleRate*duration,this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);const n=this.ctx.createBufferSource(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='bandpass';f.frequency.value=filter;g.gain.value=gain;n.buffer=b;n.connect(f);f.connect(g);g.connect(this.master);n.start(t);}
 paper(){this.noise(.45,.14,1700);}write(){this.noise(.32,.08,2500);}
 pulse(){if(this.paused||this.muted||!this.ctx)return;this.tick++;
  if(['window','room','book','road-ready'].includes(this.scene)){if(this.tick===2&&this.scene==='window')this.bell();if(this.tick%73===0&&this.scene!=='book')this.bell(330,.055);if(this.tick%13===1)this.bird();}
  if(this.scene==='travel'){this.noise(.085,.17,550);if(this.tick%2===0)this.noise(.07,.09,1100);if(this.tick%5===1){this.tone(1240,.6,.045);this.tone(2347,.3,.013);}if(this.tick%19===0)this.bird();}
 }
 dispose(){clearInterval(this.timer);this.ctx?.close();}
}
