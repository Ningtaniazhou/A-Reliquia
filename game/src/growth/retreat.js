export function paintRetreat(root,elapsed,reduced){
 const art=root.querySelector('.memory-return-art'),slot=root.querySelector('.arrival-memory-art');if(!art||!slot)return;
 const a=root.getBoundingClientRect(),b=slot.getBoundingClientRect();
 const p=reduced?1:Math.min(1,Math.max(0,(elapsed-1.3)/5.4)),q=p*p*p*(p*(p*6-15)+10);
 Object.assign(art.style,{left:(b.left-a.left)*q+'px',top:(b.top-a.top)*q+'px',width:a.width+(b.width-a.width)*q+'px',height:a.height+(b.height-a.height)*q+'px'});
 const dialogue=root.querySelector('.memory-return-dialogue');dialogue.style.opacity=String(reduced?0:Math.max(0,1-elapsed/.65));
 root.querySelector('.memory-return .book-wrap').style.setProperty('--return-progress',q);
}
