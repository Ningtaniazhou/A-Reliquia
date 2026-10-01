// Shared world units for every pixel-scroll chapter. Resize the viewport as a
// whole; never resize individual actors to fit a particular scene or device.
export const SCROLL_SCALE=Object.freeze({width:960,height:540,worldWidth:1280,worldHeight:720,worldTop:-125,deckOffset:74,adultHeight:156});
export const ACTOR_FRAMES=Object.freeze({
 teo:{frames:8,columns:4,cellHeight:160,top:2,height:156,left:0,width:128},
 teoIdle:{frames:1,columns:1,cellHeight:160,top:2,height:156,left:0,width:128},
 sailor:{frames:1,top:5,height:141,left:5,width:80},
});
export function drawActor(ctx,image,kind,{x,feet,frame=0,facing=1}){
 const source=ACTOR_FRAMES[kind],height=SCROLL_SCALE.adultHeight,width=source.width/source.height*height;
 ctx.save();ctx.translate(Math.round(x),Math.round(feet));ctx.scale(facing,1);
 const columns=source.columns||source.frames;
 ctx.drawImage(image,(frame%columns)*(image.width/columns)+source.left,Math.floor(frame/columns)*(source.cellHeight||image.height)+source.top,source.width,source.height,-width/2,-height,width,height);ctx.restore();
}
