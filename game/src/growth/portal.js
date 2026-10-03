import {point} from '../interaction-marks.js';
// Keep one live chapter canvas at its final viewport size. Only its enclosing
// window scales, so actors never reflow or spring when the illustration expands.
export class ChapterPortal{
 constructor(root,options){this.root=root;this.options=options;this.el=null;this.ready=false;this.progress=null;this.started=false;this.error=false;}
 mount(){
  if(this.el)return;
  window.__reliquiaChapter={
   get context(){return window.__reliquiaOpeningSound?.ctx||null;},
   get settings(){return window.__reliquiaOpeningSettings;},
   get saved(){return window.__reliquiaChapterState?.()||null;},
   save:value=>this.options.save(value),
   preferences:value=>this.options.preferences(value),
   ready:()=>{this.ready=true;this.button.hidden=false;this.layout();if(this.options.isActive())this.activate();},
   failed:()=>{this.error=true;this.button.hidden=false;this.button.setAttribute('aria-label','重新载入饭厅');},
  };
  this.el=document.createElement('div');this.el.className='chapter-portal';
  this.frame=document.createElement('iframe');this.frame.title='姨姨家的晚饭';this.frame.src='./boss.html?integrated=1';this.frame.tabIndex=-1;this.frame.setAttribute('aria-hidden','true');
  this.button=document.createElement('button');this.button.className='portal-point';this.button.innerHTML=point();this.button.setAttribute('aria-label','走进特奥多里科在姨姨家的一顿晚饭');this.button.hidden=true;
  this.button.onclick=()=>{if(this.error){this.error=false;this.ready=false;this.button.hidden=true;this.frame.src='./boss.html?integrated=1';return;}this.options.enter();};
  this.el.append(this.frame,this.button);document.body.append(this.el);this.layout();
 }
 layout(){
  if(!this.el)return;
  const root=this.root.getBoundingClientRect(),slot=this.root.querySelector('.dining-slot'),rect=slot?.getBoundingClientRect();
  const active=this.started||this.options.isActive();
  this.el.hidden=(!active&&!rect)||this.options.blocked();if(this.el.hidden)return;
  this.frame.style.width=root.width+'px';this.frame.style.height=root.height+'px';
  const p=this.progress,q=p===null?(active?1:0):p*p*p*(p*(p*6-15)+10);
  const from=this.from||rect||root;
  // Uniform scaling throughout. A resize recomputes the target and final geometry.
  const scale=from.width/root.width+(1-from.width/root.width)*q;
  const x=from.left+(root.left-from.left)*q,y=from.top+(root.top-from.top)*q;
  Object.assign(this.el.style,{left:x+'px',top:y+'px',width:root.width*scale+'px',height:root.height*scale+'px'});
  this.frame.style.transform=`scale(${scale})`;
  this.button.hidden=!this.ready||active||p!==null;
  // A newly loaded chapter must not expose an enabled entry during page writing.
  this.button.disabled=this.root.getAttribute('aria-busy')==='true';
  this.el.classList.toggle('active',active&&p===null);this.el.classList.toggle('expanding',p!==null);
 }
 begin(){if(!this.ready||this.progress!==null)return false;this.from=this.root.querySelector('.dining-slot').getBoundingClientRect();this.progress=0;this.time=0;this.root.classList.add('chapter-entry-busy');this.button.hidden=true;this.layout();return true;}
 tick(dt,reduced){if(this.progress===null)return;this.time+=dt;this.progress=Math.min(1,this.time/(reduced?.3:6.5));this.layout();if(this.progress>=1){this.progress=null;this.from=null;this.started=true;this.options.complete();this.activate();}}
 activate(){if(!this.ready)return;this.started=true;this.progress=null;this.from=null;this.layout();this.frame.tabIndex=0;this.frame.removeAttribute('aria-hidden');this.frame.contentWindow?.reliquiaEnterChapter?.();this.frame.focus({preventScroll:true});}
 destroy(){if(!this.el)return;this.frame.contentWindow?.reliquiaLeaveChapter?.();this.el.remove();this.el=null;this.ready=false;this.started=false;this.progress=null;this.from=null;}
}
