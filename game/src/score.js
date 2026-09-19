// Original 16-bar reminiscence, 6/8 at dotted-quarter = 40.
// D minor with warm major sevenths; no quotation of an existing composition.
const bars=[
 [50,[57,62,65,69],[74,null,72,69,null,65]],
 [46,[53,57,62,65],[69,null,70,69,null,65]],
 [53,[57,60,64,69],[67,null,69,72,null,69]],
 [48,[55,60,64,67],[67,null,64,62,null,null]],
 [50,[57,62,65,69],[65,null,69,74,null,72]],
 [43,[55,58,62,65],[70,null,69,67,null,62]],
 [46,[53,57,62,65],[65,null,67,69,null,65]],
 [45,[57,61,64,67],[64,null,61,62,null,null]],
 [50,[57,62,65,69],[74,null,77,76,null,74]],
 [46,[53,57,62,65],[72,null,70,69,null,null]],
 [53,[57,60,64,69],[69,null,72,74,null,72]],
 [48,[55,60,64,67],[67,null,64,67,null,null]],
 [43,[55,58,62,65],[70,null,69,67,null,65]],
 [46,[53,57,62,65],[65,null,62,65,null,69]],
 [45,[57,61,64,67],[67,null,64,61,null,64]],
 [50,[57,62,65,69],[62,null,null,69,null,null]]
];
export class MemoryScore{
 constructor(ctx,master,reverb){this.ctx=ctx;this.bus=ctx.createGain();this.bus.gain.value=0;this.bus.connect(master);const wet=ctx.createGain();wet.gain.value=.22;this.bus.connect(wet);wet.connect(reverb);this.cache=new Map();this.step=0;this.next=ctx.currentTime+.15;this.active=false;for(const midi of new Set(bars.flatMap(b=>[b[0],...b[1],...b[2]]).filter(n=>n!==null)))this.sample(midi);}
 set(scene){this.active=scene!=='intro';const level=scene==='book'?.7:scene==='travel'?.56:scene==='door'?.46:scene==='intro'?0:.36;this.bus.gain.setTargetAtTime(level*2.5,this.ctx.currentTime,1.5);if(!this.active){this.step=0;this.next=this.ctx.currentTime+.15;}}
 sample(midi){if(this.cache.has(midi))return this.cache.get(midi);const sr=this.ctx.sampleRate,b=this.ctx.createBuffer(1,sr*4.5,sr),d=b.getChannelData(0),f=440*2**((midi-69)/12);for(let i=0;i<d.length;i++){const t=i/sr;let v=0;for(let h=1;h<=7;h++)v+=Math.sin(2*Math.PI*f*h*Math.sqrt(1+.00007*h*h)*t)*Math.exp(-t*(.85+h*.48))/(h**1.75);d[i]=v*(1-Math.exp(-t*130))*.5;}this.cache.set(midi,b);return b;}
 note(midi,time,velocity,pan=0){const src=this.ctx.createBufferSource(),g=this.ctx.createGain(),p=this.ctx.createStereoPanner();src.buffer=this.sample(midi);g.gain.value=velocity;p.pan.value=pan;src.connect(g);g.connect(p);p.connect(this.bus);src.start(time);src.onended=()=>{src.disconnect();g.disconnect();p.disconnect();};}
 sustain(notes,time){const g=this.ctx.createGain();g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(.014,time+.8);g.gain.setTargetAtTime(.0001,time+2.4,.6);g.connect(this.bus);const voices=[];for(const midi of notes.slice(0,3)){const o=this.ctx.createOscillator();o.type='sine';o.frequency.value=440*2**((midi-69)/12);o.detune.value=(voices.length-1)*3;o.connect(g);o.start(time);o.stop(time+5);voices.push(o);}voices.at(-1).onended=()=>{voices.forEach(o=>o.disconnect());g.disconnect();};}
 schedule(){if(!this.active)return;const now=this.ctx.currentTime;if(this.next<now-.2)this.next=now+.05;while(this.next<now+.8){const bar=bars[Math.floor(this.step/6)%bars.length],beat=this.step%6,t=this.next;const variation=Math.floor(this.step/96)%2; if(beat===0){this.note(bar[0],t,.13,-.22);this.sustain(bar[1],t);}if(beat===0||beat===2||beat===4)this.note(bar[1][beat/2],t+.055,.075,-.15);if(bar[2][beat]!==null)this.note(bar[2][beat],t+.02,.15+(beat===0?.025:0),.18);if(variation&&beat===5&&bar[2][beat]===null)this.note(bar[1][3],t+.08,.055,.25);this.step++;this.next+=.5;}}
}
