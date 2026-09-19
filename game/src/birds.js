// Soft synthetic outdoor calls: curved pitch, varied syllables, breath and distance.
export function makeBird(ctx,variant){const sr=ctx.sampleRate,duration=1.8,b=ctx.createBuffer(1,sr*duration,sr),out=b.getChannelData(0);
 const phrases=[[[0,.19,2800,3600],[.29,.12,3350,2600],[.48,.28,2600,3200]],[[0,.3,2300,3000],[.47,.23,2700,2450]],[[0,.1,3400,3000],[.17,.12,3100,3700],[.38,.13,3500,2800],[.67,.24,2800,3400]],[[0,.25,2600,3100],[.38,.32,3000,2300]]];
 for(const [start,len,from,to] of phrases[variant%4]){let phase=0;for(let j=0;j<len*sr;j++){const u=j/(len*sr),t=j/sr;const f=from+(to-from)*Math.sin(u*Math.PI/2)+70*Math.sin(t*2*Math.PI*32)*Math.sin(Math.PI*u);phase+=2*Math.PI*f/sr;const env=Math.sin(Math.PI*u)**1.8;out[Math.floor(start*sr)+j]+=(Math.sin(phase)+.10*Math.sin(2*phase)+.018*(Math.random()*2-1))*env*.32;}}
 return b;}
