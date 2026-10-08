import {cues} from '../music/cues.js';
export class ArrivalAudio{
 constructor(ctx,master){this.ctx=ctx;this.master=master;this.buffer=null;this.pending=null;this.voice=null;this.wanted=false;}
 async prepare(){if(this.buffer)return this.buffer;if(!this.pending)this.pending=(async()=>{for(const url of [cues.auntHome.url])try{const r=await fetch(url);if(!r.ok)continue;this.buffer=await this.ctx.decodeAudioData(await r.arrayBuffer());return this.buffer;}catch{}throw Error('姨姨家音乐未能载入');})().catch(e=>{this.pending=null;throw e;});return this.pending;}
 async start(delay=1.6){this.wanted=true;if(this.voice)return;const b=await this.prepare();if(!this.wanted||this.voice)return;const source=this.ctx.createBufferSource(),gain=this.ctx.createGain();source.buffer=b;source.loop=true;source.loopEnd=Math.min(cues.auntHome.loopEnd,b.duration);source.connect(gain);gain.connect(this.master);gain.gain.setValueAtTime(0,this.ctx.currentTime);gain.gain.linearRampToValueAtTime(cues.auntHome.gain,this.ctx.currentTime+2);this.voice={source,gain};source.start(this.ctx.currentTime+delay);source.onended=()=>{source.disconnect();gain.disconnect();};}
 stop(){this.wanted=false;const v=this.voice;this.voice=null;if(!v)return;v.gain.gain.setTargetAtTime(0,this.ctx.currentTime,.2);v.source.stop(this.ctx.currentTime+.8);}
}
