// Driven by the chapter clock, so settings/hidden-page pauses also stop flight and result cues.
export function cardFlight(source,target,sound,correct=true){
 const r=source.getBoundingClientRect(),a=target.getBoundingClientRect(),el=source.cloneNode(true);
 for(const [i,node] of [source,...source.querySelectorAll('*')].entries()){const copy=[el,...el.querySelectorAll('*')][i],style=getComputedStyle(node);for(const key of style)copy.style.setProperty(key,style.getPropertyValue(key));}
 Object.assign(el.style,{position:'fixed',left:r.x+'px',top:r.y+'px',width:r.width+'px',height:r.height+'px',margin:'0',animation:'none',transition:'none',pointerEvents:'none',zIndex:45,transformOrigin:'center'});el.classList.add('card-flight');el.removeAttribute('id');el.setAttribute('aria-hidden','true');document.body.append(el);
 const x=a.x+a.width*.5,y=a.y+a.height*.34,dx=x-r.x-r.width/2,dy=y-r.y-r.height/2;
 const ring=document.createElement('div');Object.assign(ring.style,{position:'fixed',left:x-70+'px',top:y-70+'px',width:'140px',height:'140px',border:'2px solid #e7c78b',borderRadius:'50%',boxShadow:'0 0 12px #dba74766',pointerEvents:'none',opacity:0,zIndex:46});document.body.append(ring);
 let launched=false,hit=false,result=false;
 // A cached audio module may predate a cue. Audio must never stop the chapter clock.
 const cue=name=>{try{sound?.[name]?.();}catch(error){console.warn('Card audio cue skipped:',name,error);}};
 return {update(ms){if(ms>=230&&!launched){launched=true;cue('cast');}if(ms>=970&&!hit){hit=true;cue('impact');}if(ms>=1210&&!result){result=true;cue(correct?'good':'bad');}
 const q=Math.min(1,Math.max(0,(ms-230)/740)),lift=Math.min(1,ms/230),ease=q*q*(3-2*q);const px=ms<230?-20*lift:dx*ease-20*(1-ease)-60*Math.sin(q*Math.PI),py=ms<230?-42*lift:dy*ease-42*(1-ease)-110*Math.sin(q*Math.PI);
 el.style.transform=`translate(${px}px,${py}px) rotate(${ms<230?-12*lift:-12+24*q-16*Math.sin(q*Math.PI)}deg) scale(${ms<230?1+.12*lift:1.12-.8*q})`;el.style.opacity=String(ms<970?1:Math.max(0,1-(ms-970)/130));
 const p=Math.max(0,(ms-970)/540);ring.style.opacity=ms>=970?String(.48*Math.max(0,1-p)):'0';ring.style.transform=`scale(${.15+1.05*Math.min(1,p)})`;target.style.translate=ms>=970&&ms<1220?`${Math.sin((ms-970)/250*Math.PI*4)*1.5}px 0`:'0 0';},destroy(){el.remove();ring.remove();target.style.translate='';}};
}
