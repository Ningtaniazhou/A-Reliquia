import {DepartureAudio} from '../departure/audio.js';
import {cues} from '../music/cues.js';
// The registry extension is local to this independent sample page.
cues.jerusalemRain={url:'./assets/jerusalem/rain-city-loop.m4a',loop:true,loopEnd:60,gain:.66,fadeIn:2};
cues.caravan={url:'./assets/jerusalem/caravan-loop.m4a',loop:true,loopEnd:4800/82,gain:.57,fadeIn:1.7};
cues.sepulchre={url:'./assets/jerusalem/sepulchre-loop.m4a',loop:true,loopEnd:64,gain:.52,fadeIn:2};
export class JerusalemAudio extends DepartureAudio {
 constructor(prefs){super(prefs);this.rainVoice=null;this.rainLevel=0;this.mix=.66;}
 async unlock(){await super.unlock();this.rain(this.rainLevel);}
 rain(level){this.rainLevel=level;if(!this.ctx)return;const c=this.ctx;
  if(!this.rainVoice){const b=c.createBuffer(1,c.sampleRate*8,c.sampleRate),a=b.getChannelData(0);let sm=0;for(let i=0;i<a.length;i++){sm=.7*sm+.3*(Math.random()*2-1);a[i]=sm;}const source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();source.buffer=b;source.loop=true;filter.type='lowpass';filter.frequency.value=1500;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(this.master);source.start();this.rainVoice={source,filter,gain};}
  this.rainVoice.gain.gain.setTargetAtTime(level*.5,c.currentTime,.5);this.rainVoice.filter.frequency.setTargetAtTime(level>.15?1800:650,c.currentTime,.5);
 }
 setMix(gain){if(this.mix===gain&&this.current?.name===this.mixedName)return;this.mix=gain;this.mixedName=this.current?.name;if(this.current){const v=this.current;v.gain.gain.cancelScheduledValues(this.ctx.currentTime);v.gain.gain.setTargetAtTime(gain*(cues[v.name]?.gain||.66)/.66,this.ctx.currentTime,.7);}}
 stop(){if(this.rainVoice){for(const key of ['source','filter','gain']){try{if(key==='source')this.rainVoice[key].stop();this.rainVoice[key].disconnect();}catch{}}this.rainVoice=null;}super.stop();}
}
