// Read previously displayed dialogue without rewinding choices or chapter state.
const panel=document.getElementById('dialogue'),speaker=document.getElementById('speaker'),line=document.getElementById('line');
if(panel&&speaker&&line){
 const nav=document.createElement('nav');nav.className='dialogue-corner-nav';nav.setAttribute('aria-label','对白翻页');
 const prev=document.createElement('button'),next=document.createElement('button');prev.textContent='‹';next.textContent='›';prev.setAttribute('aria-label','上一句');next.setAttribute('aria-label','下一句');nav.append(prev,next);document.body.append(nav);
 const history=[];let at=-1,shown='',drag=false,start=null;
 // Snapshot presentation only: gameplay progress and saved choices remain live.
 const visualFields=[['#game',['data-phase','data-romance-scene']],['#play',['data-scene','data-dream']],['#outside',['src','alt']],['#backdrop',['src','alt']],['#scene-time',['hidden']],['#time',['hidden']],['#portrait',['hidden']],['#portrait-art',['data-person','class']],['#dream',['hidden']],['#dream-art',['data-place']],['#route',['hidden','class']]];
 function captureVisual(){return {fields:visualFields.map(([selector,attrs])=>{const el=document.querySelector(selector);return {selector,values:Object.fromEntries(attrs.map(a=>[a,el?.getAttribute(a)??null]))};}),outdoor:document.querySelector('#game')?.classList.contains('outdoor'),labels:['scene-time','time','dream-label'].map(id=>[id,document.getElementById(id)?.textContent])};}
 function restoreVisual(v){if(!v)return;for(const {selector,values} of v.fields){const el=document.querySelector(selector);if(!el)continue;for(const [a,value] of Object.entries(values)){if(value===null)el.removeAttribute(a);else el.setAttribute(a,value);}}document.querySelector('#game')?.classList.toggle('outdoor',!!v.outdoor);for(const [id,text] of v.labels){const el=document.getElementById(id);if(el&&text!==undefined)el.textContent=text;}}
 const read=()=>({speaker:speaker.textContent,line:line.textContent,person:document.getElementById('portrait-art')?.dataset.person,visual:captureVisual()});
 const key=v=>JSON.stringify([v.speaker,v.line]);
 function capture(){const v=read(),k=key(v);if(k===shown||!v.line)return;history.push(v);if(history.length>500)history.shift();at=history.length-1;shown=k;}
 function show(index){at=index;const v=history[at];shown=key(v);restoreVisual(v.visual);speaker.textContent=v.speaker;line.textContent=v.line;const portrait=document.getElementById('portrait-art');if(portrait&&v.person)portrait.dataset.person=v.person;}
 function locked(){return panel.disabled||panel.hidden||document.body.classList.contains('paused');}
 function forward(){if(locked())return;drag=false;start=null;if(at<history.length-1)show(at+1);else panel.click();}
 window.addEventListener('keydown',e=>{if(e.target.matches('input,textarea')||document.querySelector('dialog[open]')||nav.hidden||locked())return;if(['KeyA','KeyD','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();e.stopImmediatePropagation();if(['KeyA','ArrowLeft'].includes(e.code)){if(at>0)show(at-1);}else forward();}},true);
 prev.onclick=()=>{if(!locked()&&at>0)show(at-1);};next.onclick=forward;
 panel.addEventListener('pointerdown',e=>{start=[e.clientX,e.clientY];drag=false;});panel.addEventListener('pointermove',e=>{if(start&&Math.hypot(e.clientX-start[0],e.clientY-start[1])>10)drag=true;});
 panel.addEventListener('click',e=>{if(drag){e.stopImmediatePropagation();return;}if(at<history.length-1){e.stopImmediatePropagation();if(!locked())show(at+1);}},true);
 const observer=new MutationObserver(capture);observer.observe(speaker,{childList:true,subtree:true,characterData:true});observer.observe(line,{childList:true,subtree:true,characterData:true});capture();
 function layout(){const r=panel.getBoundingClientRect(),style=getComputedStyle(panel);nav.hidden=panel.hidden||r.width===0||style.visibility==='hidden'||style.display==='none';if(!nav.hidden)document.getElementById('game')?.style.setProperty('--dialogue-bottom-space',(innerHeight-r.top+10)+'px');const inset=panel.classList.contains('portrait-dialogue')?parseFloat(style.paddingLeft)-22:0;nav.style.left=(r.left+inset)+'px';nav.style.top=(r.bottom-44)+'px';nav.style.width=(r.width-inset)+'px';prev.disabled=locked()||at<=0;next.disabled=locked();requestAnimationFrame(layout);}layout();
}
