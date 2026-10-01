// Original brief stage foley; no voice track and no persistent music loop.
export class DinnerAudio{
 constructor(settings){this.settings=settings;this.ctx=null;this.master=null;this.paused=false;}
 async unlock(){try{if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return;this.ctx=new C();this.master=this.ctx.createGain();this.master.connect(this.ctx.destination);this.update();}if(!this.paused)await this.ctx.resume();}catch{}}
 update(){if(this.master)this.master.gain.setTargetAtTime(this.settings.muted?0:this.settings.volume,this.ctx.currentTime,.03);}
 pause(on){this.paused=on;if(this.ctx)(on?this.ctx.suspend():this.ctx.resume()).catch(()=>{});}
 tone(freq,duration=.2,gain=.08,type='sine'){if(!this.ctx||this.paused||this.settings.muted)return;const t=this.ctx.currentTime,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(this.master);o.start();o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect();};}
 noise(duration=.25,gain=.06,freq=800){if(!this.ctx||this.paused||this.settings.muted)return;const n=this.ctx.createBufferSource(),b=this.ctx.createBuffer(1,Math.ceil(this.ctx.sampleRate*duration),this.ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.sin(Math.PI*i/d.length);n.buffer=b;const f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();f.type='lowpass';f.frequency.value=freq;g.gain.value=gain;n.connect(f);f.connect(g);g.connect(this.master);n.start();n.onended=()=>{n.disconnect();f.disconnect();g.disconnect();};}
 clink(){this.tone(1640,.32,.05);this.tone(2370,.18,.022);}
 step(){this.noise(.1,.14,350);}
 cloth(){this.noise(.65,.12,900);}
 door(){this.noise(.16,.11,420);this.tone(145,.35,.05,'triangle');}
 release(){this.tone(196,.55,.027);}
 stop(){this.ctx?.close().catch(()=>{});this.ctx=null;this.master=null;}
}
