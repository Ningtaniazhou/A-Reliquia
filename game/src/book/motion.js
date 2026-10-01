// Shared by live controls and the exported GLB/Blender animation library (seconds/radians).
export const poses={front:{front:0,fold:0,back:0,turn:0,look:0,spread:0,lift:-.3},intro:{front:0,fold:-Math.PI,back:0,turn:0,look:1.28,spread:1,lift:-.3},ending:{front:0,fold:0,back:Math.PI-.15,turn:Math.PI,look:1.4,spread:1,lift:0},back:{front:0,fold:0,back:0,turn:Math.PI,look:0,spread:0,lift:0}};
export const motions={open:[[{front:-1.75,spread:1,look:1.28},1.3],[{fold:-Math.PI},1.2],[{front:0},1.6]],ending:[[{front:-1.75},1.15],[{fold:0},1],[{front:0,look:0,spread:0},1.25],[{turn:Math.PI,lift:0},2.6],[{back:Math.PI-.15,look:1.4,spread:1},2]],close:[[{back:0,look:0,spread:0},2.3]],flip:[[{turn:Math.PI*2,lift:-.3},2.8]]};
export const ease=t=>t*t*t*(t*(t*6-15)+10);
export const turnLift=t=>Math.sin(Math.PI*t)*1.8;
