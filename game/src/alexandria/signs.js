// Text stays separate from artwork and follows the street camera.
export function drawStreetSigns(c,camera=0){
 c.save();c.textAlign='center';c.textBaseline='middle';c.fillStyle='#f7dfa6';
 for(const [text,x,y,size] of [['金字塔酒店',293.5,130.5,22],['玛丽的手套与蜡花店',494,114,18]]){
  c.font=`600 ${size}px "Songti SC","Noto Serif CJK SC",serif`;
  c.fillText(text,x*8/3-camera,y*8/3-160,190);
 }
 c.restore();
}
