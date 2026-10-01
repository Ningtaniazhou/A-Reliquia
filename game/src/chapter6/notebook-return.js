import {chapterEntryURL} from '../ui/chapter-entry.js';
import {movePainting} from '../ui/notebook-motion.js';
// Keep the actual layered final stage; scale it without recomposing its actors.
export async function returnToNotebook(stage,{preview=false,reduced=false,onFinish=()=>{},paused=()=>document.hidden}={}){
 const source=stage.getBoundingClientRect(),flight=document.createElement('div');
 Object.assign(flight.style,{position:'fixed',zIndex:80,pointerEvents:'none',overflow:'hidden'});
 const copy=stage.cloneNode(true);Object.assign(copy.style,{position:'absolute',inset:0,margin:0,width:'100%',height:'100%',opacity:1});flight.append(copy);
 for(const k of ['left','top','width','height'])flight.style[k]=source[k]+'px';document.body.append(flight);
 const book=document.createElement('iframe');book.title='离家那夜收进回忆本';book.src='./chapter7.html?bridge=1'+(preview?'&preview=1':'');
 Object.assign(book.style,{position:'fixed',inset:0,width:'100%',height:'100%',border:0,zIndex:70,pointerEvents:'none',visibility:'hidden'});
 const loaded=new Promise(resolve=>book.addEventListener('load',resolve,{once:true}));document.body.append(book);await loaded;
 await new Promise(resolve=>{function check(){if(book.contentDocument.querySelector('.handoff-picture')&&book.contentDocument.getElementById('load').hidden)resolve();else requestAnimationFrame(check);}check();});
 const destination=book.contentDocument.querySelector('.handoff-picture').getBoundingClientRect();book.style.visibility='visible';
 await movePainting(flight,source,destination,{retreat:true,reduced,paused});
 onFinish();location.href=chapterEntryURL('./chapter7.html?from=homecoming&arrival=1'+(preview?'&preview=1':''));
}
