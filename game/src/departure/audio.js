import {BossAudio} from '../boss/audio.js';
// Reuse the approved home cue; all sea/ship sounds below are original synthesis.
export class DepartureAudio extends BossAudio{
 constructor(prefs){super(prefs);this.ocean=null;this.seaWanted=false;}
 async unlock(){await super.unlock();if(this.seaWanted)this.sea(true);}
 sea(on){this.seaWanted=on;if(!this.ctx)return;if(!on){if(this.ocean){const t=this.ctx.currentTime,o=this.ocean;o.g.gain.cancelScheduledValues(t);o.g.gain.setValueAtTime(o.g.gain.value,t);o.g.gain.linearRampToValueAtTime(0,t+.7);o.source.stop(t+.75);this.ocean=null;}return;}if(this.ocean)return;
 const ctx=this.ctx,t=ctx.currentTime,buf=ctx.createBuffer(1,ctx.sampleRate*12,ctx.sampleRate),data=buf.getChannelData(0);let pink=0;for(let i=0;i<data.length;i++){pink=.985*pink+.015*(Math.random()*2-1);data[i]=pink*5;}
 const source=ctx.createBufferSource(),filter=ctx.createBiquadFilter(),g=ctx.createGain(),lfo=ctx.createOscillator(),depth=ctx.createGain();source.buffer=buf;source.loop=true;filter.type='lowpass';filter.frequency.value=1300;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.34,t+2.4);lfo.frequency.value=.17;depth.gain.value=.11;lfo.connect(depth);depth.connect(g.gain);source.connect(filter);filter.connect(g);g.connect(this.master);source.start();lfo.start();this.ocean={source,g,lfo,depth,filter};source.onended=()=>{lfo.stop();for(const x of [source,g,lfo,depth,filter])x.disconnect();};
 }
 ship(){this.tone(146.83,2.8,.09,'sine');this.tone(220,2.5,.035,'sine');this.noise(.7,.035,400);}
 stop(){if(this.ocean){try{this.ocean.source.stop();}catch{}this.ocean=null;}this.seaWanted=false;super.stop();}
}
