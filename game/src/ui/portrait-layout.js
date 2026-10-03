import {paperPortrait} from './character-portraits.js';
// Native chapter 6/7 portraits use the same integrated layout as opening/boss/departure.
const css=document.createElement('link');css.rel='stylesheet';css.href=new URL('../../styles/ui/portrait-layout.css',import.meta.url);document.head.append(css);
export function preparePortraitPanel(panel){
 if(panel.matches(".paper-scroll")){if(panel.classList.contains('portrait-dialogue'))panel.classList.remove('portrait-dialogue');return;}
 const face=panel.querySelector(':scope > #portrait,:scope > .c7-portrait');
 if(face){panel.classList.toggle('portrait-dialogue',!face.hidden&&!!face.firstElementChild&&!panel.classList.contains('narration'));return;}
 if(!panel.matches('.arrival-dialogue,#dialogue,#subtitle'))return;
 const label=panel.querySelector('.speaker,#speaker'),name=label?.textContent.trim().split(' · ')[0]||'';
 const has=!!name&&!/心声|心里|回忆|旁白|叙述/.test(name)&&!!paperPortrait(name)&&!panel.matches('.shared-black,.shared-pixel-dialogue');
 panel.classList.toggle('portrait-dialogue',has);
}
function sync(){for(const panel of document.querySelectorAll('.arrival-dialogue,#dialogue,#subtitle,.c7-dialogue'))preparePortraitPanel(panel);}

let queued=false;function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;sync();});}
new MutationObserver(schedule).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
css.addEventListener('load',()=>{window.dispatchEvent(new Event('resize'));});schedule();

// Align visible artwork, not the transparent rectangle of the source image.
const inkBounds=new Map();
function bottomInk(url,tile){
 const key=url+'|'+tile;if(inkBounds.has(key))return inkBounds.get(key);
 inkBounds.set(key,null);const image=new Image();image.src=url;
 image.decode().then(()=>{const half=tile!==null,w=image.naturalWidth/(half?2:1),h=image.naturalHeight/(half?2:1),canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,half?(tile%2)*w:0,half?Math.floor(tile/2)*h:0,w,h,0,0,w,h);const pixels=ctx.getImageData(0,0,w,h).data;let bottom=0;outer:for(let y=h-1;y>=0;y--)for(let x=0;x<w;x++)if(pixels[(y*w+x)*4+3]>32){bottom=(y+1)/h;break outer;}inkBounds.set(key,bottom||1);alignPortraitFeet();}).catch(()=>inkBounds.set(key,1));return null;
}
function alignPortraitFeet(){
 for(const face of document.querySelectorAll('.portrait-dialogue>.dialogue-bust,.portrait-dialogue>#portrait,.portrait-dialogue>.c7-portrait')){
 if(face.hidden||!face.getClientRects().length)continue;
 const artwork=face.querySelector('.shared-portrait')||face.querySelector('img');if(!artwork)continue;
 const sheet=artwork.hasAttribute('data-sheet'),img=sheet?null:(artwork.matches('img')?artwork:artwork.querySelector('img'));let url,tile=null;
 if(sheet){url=/url\(["']?(.*?)["']?\)/.exec(artwork.style.backgroundImage)?.[1];const pos=artwork.style.backgroundPosition.split(' ');tile=(pos[0]==='100%'?1:0)+(pos[1]==='100%'?2:0);}else url=img?.currentSrc||img?.src;
 if(!url)continue;const bottom=bottomInk(url,tile);if(bottom===null)continue;
 artwork.style.translate='0 0';const box=face.getBoundingClientRect(),r=(sheet?artwork:img).getBoundingClientRect();
 const gap=Math.max(0,box.bottom-(r.top+r.height*bottom));
 // One extra pixel overlaps the panel border, avoiding a subpixel seam.
 artwork.style.translate=`0 ${gap>0?gap+1:0}px`;
 }
}
new MutationObserver(alignPortraitFeet).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['src','data-person','hidden']});
window.addEventListener('resize',alignPortraitFeet);document.addEventListener('reliquia:dialogue-layout',alignPortraitFeet);alignPortraitFeet();
