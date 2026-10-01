import {cues} from '../music/cues.js';
import {DinnerAudio} from '../dinner/audio.js';
export class BossAudio extends DinnerAudio{
 constructor(settings){super(settings);this.buffers=new Map();this.pending=new Map();this.voices=new Set();this.desired=null;this.current=null;this.token=0;this.unlocked=false;this.errors=[];}
 async unlock(){await super.unlock();this.unlocked=this.ctx?.state==='running';if(this.unlocked&&this.desired&&!this.current)void this.play(this.desired);}
 async buffer(name){
  if(this.buffers.has(name))return this.buffers.get(name);
  if(!this.pending.has(name))this.pending.set(name,(async()=>{
   for(const url of [cues[name].url,cues[name].fallback].filter(Boolean))try{
    const response=await fetch(url);if(!response.ok)throw Error('HTTP '+response.status);
    const decoded=await this.ctx.decodeAudioData(await response.arrayBuffer());this.buffers.set(name,decoded);return decoded;
   }catch(error){this.lastDecodeError=String(error);}
   this.pending.delete(name);this.errors.push(name);throw Error('音乐未能载入：'+name);
  })());return this.pending.get(name);
 }

 request(name,fadeSeconds){this.nextFadeIn=fadeSeconds;if(name===this.desired&&(this.current||!this.unlocked))return;this.desired=name;if(!name){this.fadeOut(true,fadeSeconds??.28);return;}if(this.unlocked)void this.play(name);}
 async play(name){const fadeIn=this.nextFadeIn;const ticket=++this.token;try{const b=await this.buffer(name);if(ticket!==this.token||name!==this.desired||!this.ctx)return;this.fadeOut(false);const source=this.ctx.createBufferSource(),gain=this.ctx.createGain(),t=this.ctx.currentTime,cue=cues[name];source.buffer=b;source.loop=cue.loop;if(cue.loopEnd)source.loopEnd=Math.min(cue.loopEnd,b.duration);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(cue.gain,t+(fadeIn??cue.fadeIn??.32));source.connect(gain);gain.connect(this.master);const v={source,gain,name};this.voices.add(v);this.current=v;source.onended=()=>{this.voices.delete(v);source.disconnect();gain.disconnect();if(this.current===v){this.current=null;}};source.start();}catch{if(ticket===this.token)this.current=null;}}
 fadeOut(invalidate=true,seconds=.28){if(invalidate)++this.token;const v=this.current;this.current=null;if(!v||!this.ctx)return;const t=this.ctx.currentTime;v.gain.gain.cancelScheduledValues(t);v.gain.gain.setValueAtTime(v.gain.gain.value,t);v.gain.gain.linearRampToValueAtTime(0,t+seconds);try{v.source.stop(t+seconds+.03);}catch{}}
 async warm(){if(this.ctx)await Promise.allSettled((this.desired==='adelia'?['adelia']:['auntHome','auntBattle']).map(n=>this.buffer(n)));}
 pick(){this.noise(.08,.04,1700);}
 cast(){this.noise(.3,.09,1800);}
 good(){this.tone(293.66,.7,.11);this.tone(369.99,.85,.07);this.tone(440,1,.06);}
 bad(){this.noise(.25,.16,240);this.tone(73.42,1,.17,'sawtooth');this.tone(77.78,.85,.10,'triangle');}
 stop(){this.unlocked=false;++this.token;for(const v of this.voices)try{v.source.stop();}catch{}this.voices.clear();this.current=null;if(this.sharedContext){this.master?.disconnect();this.master=null;this.ctx=null;}else super.stop();}
}
