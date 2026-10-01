// Read-only page history. Replaying a page never replays a game action or save event.
const specs=[
['#dialogue','#speech','#speaker','#next'],
 ['.j-talk','p','small','[data-next]'],['.voyage-dialogue','p','.voyage-speaker','[data-v="next"]'],
 ['.malta-speech','p','span','[data-next]'],['.alex-talk','p','small','[data-next]'],
 ['.alex-black','p',null,'[data-black]'],['.j-black','p','small','#arrival-next'],
 ['.bridge-dialogue','p','small','button'],['#speech','.zh','.speaker','#next']
];
const installed=new WeakSet(),pagers=[];
const visible=el=>!!el&&el.getClientRects().length>0&&!el.closest('[hidden]')&&getComputedStyle(el).visibility!=='hidden';
function install(panel,text,who,next){
 if(installed.has(panel))return;installed.add(panel);if(getComputedStyle(panel).position==='static')panel.style.position='relative';
 const prev=document.createElement('button');prev.className='page-back';prev.textContent='‹';prev.setAttribute('aria-label','上一页 A');if(next.parentElement.tagName==='FOOTER')next.parentElement.prepend(prev);else next.before(prev);next.classList.add('page-forward');next.setAttribute('aria-label','下一页 D');
 const review=document.createElement('div');review.className='page-review';review.hidden=true;review.innerHTML='<small></small><p></p>';panel.append(review);
 let history=[],at=-1,key='',wasVisible=false;
 const read=()=>({who:who?.textContent||'',text:text.textContent,scholar:panel.matches('.is-scholar,.interjection')});
 function capture(){prev.hidden=!visible(next);const on=visible(panel)&&visible(next);if(!on){wasVisible=false;return;}if(!wasVisible){history=[];at=-1;key='';wasVisible=true;review.hidden=true;panel.classList.remove('reviewing-page');}const row=read(),k=JSON.stringify(row);if(k!==key&&row.text){key=k;history.push(row);at=history.length-1;review.hidden=true;panel.classList.remove('reviewing-page');}prev.disabled=at<=0;next.textContent='›';}
 function show(i){at=i;review.hidden=i===history.length-1;if(!review.hidden){review.classList.toggle('is-scholar',history[i].scholar);review.querySelector('small').textContent=history[i].who;review.querySelector('p').textContent=history[i].text;}panel.classList.toggle('reviewing-page',!review.hidden);prev.disabled=at<=0;}
 function blocked(){return document.querySelector('dialog[open]')||document.body.classList.contains('paused')||document.querySelector('#settings.veil:not([hidden])');}
 function backward(){if(!blocked()&&at>0)show(at-1);}
 prev.addEventListener('click',e=>{e.stopPropagation();backward();});
 // Intercept only read-back pages. At the live page the original chapter owns advancement.
 panel.addEventListener('click',e=>{if(e.target.closest('.page-back')){e.stopImmediatePropagation();backward();return;}if(at<history.length-1&&!e.target.closest('[data-close],#closeDialogue,#leave')){e.stopImmediatePropagation();if(!blocked())show(at+1);}},true);
 const pager={panel,next,prev,backward,forward:()=>{if(!blocked()){if(at<history.length-1)show(at+1);else next.click();}},capture};pagers.push(pager);
 new MutationObserver(()=>{if(next.textContent!=='›')next.textContent='›';}).observe(next,{childList:true});
}
function scan(){for(const [selector,ts,ws,ns] of specs)for(const p of document.querySelectorAll(selector)){const t=p.querySelector(ts),w=ws&&p.querySelector(ws),n=p.querySelector(ns);if(t&&n)install(p,t,w,n);}for(const p of pagers)p.capture();requestAnimationFrame(scan);}scan();
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey||e.target.matches('input,textarea,select')||document.querySelector('dialog[open]'))return;const p=pagers.find(p=>visible(p.panel)&&visible(p.next)&&!p.next.disabled);if(!p)return;const back=['KeyA','ArrowLeft'].includes(e.code),forward=['KeyD','ArrowRight','Space'].includes(e.code);if(back||forward){e.preventDefault();e.stopImmediatePropagation();back?p.backward():p.forward();}},true);
