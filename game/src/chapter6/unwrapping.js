// Only cotton and ribbon need gestures; every other layer advances with one click.
export const unwrapSteps=[
 {kind:'drag',axis:'out',distance:.24,label:'按住棉花，拖出木箱'},
 {kind:'tap',label:'点击包裹，将它取出'},
 {kind:'drag',axis:'right',distance:.12,label:'按住长丝带的末端，向右拉开'},
 {kind:'tap',label:'点击包裹，揭开褐纸'},
 {kind:'tap',label:'点击包裹，打开内层'},
 {kind:'tap',label:'点击白布，将它取出'},
 {kind:'tap',label:'点击衣料，将它展开'}
];
export function normalizedProgress(v){return Math.max(0,Math.min(1,Number(v)||0));}
export class UnwrapInteraction{
 constructor({point,stage,state,blocked,cottonOutside,update,sound}){Object.assign(this,{point,stage,state,blocked,cottonOutside,update,sound});this.drag=null;this.lastTap=-Infinity;this.ignoreClick=false;
 point.addEventListener('pointerdown',e=>this.down(e));point.addEventListener('pointermove',e=>this.move(e));point.addEventListener('pointerup',e=>this.up(e));point.addEventListener('pointercancel',()=>this.cancel());point.addEventListener('lostpointercapture',()=>this.cancel());
 }
 down(e){const s=this.state();if(s.phase!=='unbox'||this.blocked()||e.button!==0)return;this.ignoreClick=false;const spec=unwrapSteps[s.step];if(spec.kind!=='drag')return;e.preventDefault();this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,start:s.unwrap||0,dx:s.unwrapDX||0,dy:s.unwrapDY||0,step:s.step,value:s.unwrap||0};this.point.setPointerCapture(e.pointerId);this.point.classList.add('grasped');}
 move(e){if(!this.drag)return;if(this.blocked()||this.state().step!==this.drag.step){this.cancel();return;}const d=this.drag,spec=unwrapSteps[d.step],r=this.stage.getBoundingClientRect();let dx=d.dx+(e.clientX-d.x)/r.width,dy=d.dy+(e.clientY-d.y)/r.height;
 const value=spec.axis==='out'?(this.cottonOutside(dx,dy)?1:Math.min(.98,Math.hypot(dx,dy)/spec.distance)):Math.max(0,Math.min(1,d.start+(e.clientX-d.x)/(r.width*spec.distance)));
 d.value=value;this.update(Math.min(.98,value),spec.axis==='out'?{unwrapDX:dx,unwrapDY:dy}:{});if(!this.lastSound||performance.now()-this.lastSound>180){this.sound(d.step===2?'ribbon':'cloth');this.lastSound=performance.now();}}
 up(e){if(!this.drag||e.pointerId!==this.drag.id)return;this.move(e);if(!this.drag)return;const d=this.drag;this.cancel();this.ignoreClick=true;if(!this.blocked()&&this.state().step===d.step&&d.value>=1)this.update(1);}
 cancel(){const d=this.drag;this.drag=null;if(d&&this.point.hasPointerCapture(d.id))this.point.releasePointerCapture(d.id);this.point.classList.remove('grasped');}
 tap(keyboard=false){if(this.ignoreClick&&!keyboard){this.ignoreClick=false;return;}const s=this.state();if(s.phase!=='unbox'||this.blocked())return;const spec=unwrapSteps[s.step];if(spec.kind!=='tap'&&!keyboard)return;if(performance.now()-this.lastTap<350)return;this.lastTap=performance.now();this.sound(s.step<=1?'cloth':s.step<=4?'paper':'cloth');this.update(spec.kind==='tap'?1:Math.min(1,(s.unwrap||0)+.25));}
}
