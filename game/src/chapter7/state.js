import {pages,scenes,ending} from './content.js';
export const finalIdleSeconds=10;
export const endingTiming={settle:4,reveal:3.5,total:7.5};
export const initial=()=>({version:3,mode:'book',spread:0,written:1,done:[],scene:null,line:0,seen:[],ring:false,deed:false,finalLine:0,elapsed:0});
export const lastSpread=Math.ceil(pages.length/2)-1;
export const pageReady=(s,n)=>!pages[n]||(s.written>n&&(!pages[n].scene||s.done.includes(pages[n].scene)));
export const spreadReady=s=>[s.spread*2,s.spread*2+1].every(n=>pageReady(s,n));
export function restore(data){
 if(!data||![1,2,3].includes(data.version))return initial();const s={...initial(),...data,version:3};
 if(data.version===1){if(s.written>8)s.written--;if(s.mode==='scene'&&s.scene==='conscience'&&s.line>0)s.line+=4;}
 if(data.version<3){if(s.written<=5)s.written++;if(s.mode==='scene'&&['market','inheritance','conscience'].includes(s.scene))s.spread=Math.floor(pages.findIndex(p=>p.scene===s.scene)/2);}
 s.spread=Math.max(0,Math.min(lastSpread,Math.trunc(s.spread)||0));s.written=Math.max(1,Math.min(pages.length,Math.trunc(s.written)||0));
 s.done=Array.isArray(s.done)?s.done.filter(x=>['market','inheritance','conscience'].includes(x)):[];s.seen=Array.isArray(s.seen)?s.seen:[];
 if(!['book','scene','closing','desk','final','fade','credits'].includes(s.mode))return initial();
 if(s.mode==='scene'){if(!scenes[s.scene])return initial();s.line=Math.max(0,Math.min(scenes[s.scene].rows.length-1,Math.trunc(s.line)||0));}
 s.finalLine=Math.max(0,Math.min(ending.length-1,Math.trunc(s.finalLine)||0));s.elapsed=Math.max(0,Math.min(s.mode==='final'?finalIdleSeconds:endingTiming.total,Number(s.elapsed)||0));return s;
}
export function reduce(s,a){
 const n=structuredClone(s);
 if(a.type==='inspect'){for(const id of ['C7-O-07','C7-O-09'].includes(a.id)?['C7-O-07','C7-O-09']:[a.id])if(!n.seen.includes(id))n.seen.push(id);return n;}
 if(s.mode==='book'){
  if(a.type==='write'&&s.written>=s.spread*2&&s.written<Math.min(pages.length,s.spread*2+2)&&(s.written===0||pageReady(s,s.written-1)))n.written++;
  if(a.type==='enter'&&pages.slice(s.spread*2,s.spread*2+2).some((p,i)=>p.scene===a.scene&&s.written>s.spread*2+i)){n.mode='scene';n.scene=a.scene;n.line=0;}
  if(a.type==='back'&&s.spread>0)n.spread--;
  if(a.type==='next'&&spreadReady(s)){if(s.spread<lastSpread)n.spread++;else{n.mode='closing';n.elapsed=0;}}
 }else if(s.mode==='scene'){
  const rows=scenes[s.scene].rows;
  if(a.type==='back')n.line=Math.max(0,s.line-1);
  if(a.type==='leave'&&['market','inheritance','conscience'].includes(s.scene)){n.mode='book';n.scene=null;}
  if(a.type==='next'&&(!rows[s.line].target||a.target===rows[s.line].target)){
   if(s.line<rows.length-1)n.line++;
   else if(s.scene==='ring'){n.ring=true;n.mode='desk';n.scene=null;}
   else if(s.scene==='deed'){n.deed=true;n.mode='final';n.finalLine=0;n.elapsed=0;n.scene=null;}
   else{if(!n.done.includes(s.scene))n.done.push(s.scene);n.mode='book';n.scene=null;}
  }
 }else if(s.mode==='desk'){
  if(a.type==='ring'&&!s.ring){n.mode='scene';n.scene='ring';n.line=0;}
  if(a.type==='deed'&&s.ring&&!s.deed){n.mode='scene';n.scene='deed';n.line=0;}
  if(a.type==='book'){n.mode='book';n.spread=lastSpread;}
 }else if(s.mode==='final'){
  if(a.type==='next'){if(s.finalLine<ending.length-1){n.finalLine++;n.elapsed=0;}else{n.mode='fade';n.elapsed=0;}}
  if(a.type==='back'){n.finalLine=Math.max(0,s.finalLine-1);n.elapsed=0;}
 }
 if(a.type==='tick'&&s.mode==='final'){n.elapsed=Math.min(finalIdleSeconds,s.elapsed+Math.max(0,Math.min(.1,a.dt)));if(n.elapsed>=finalIdleSeconds&&s.finalLine<ending.length-1){n.finalLine++;n.elapsed=0;}}
 if(a.type==='tick'&&['closing','fade'].includes(s.mode)){n.elapsed+=Math.max(0,Math.min(.1,a.dt));if(n.elapsed>=(s.mode==='closing'?4.8:endingTiming.total)){n.mode=s.mode==='closing'?'desk':'credits';n.elapsed=0;}}
 return n;
}
