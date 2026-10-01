// Explicit story crossings start the destination once; plain visits/reloads resume it.
const pendingKey='reliquia.chapter-entry.handoff';
const keys={'departure.html':'reliquia.departure-preview.v1','jerusalem-study.html':'reliquia.jerusalem-study.v1','chapter4.html':'reliquia.chapter4.v1','chapter5.html':'reliquia.chapter5.v1','chapter6.html':'reliquia.chapter6.v1','chapter7.html':'reliquia.chapter7.v1'};
export function entrySaveKey(url){const name=url.pathname.split('/').pop(),base=keys[name];if(!base)return null;const p=url.searchParams;return base+(p.has('preview')?(name==='jerusalem-study.html'?'.camp-preview':name==='chapter5.html'&&p.get('preview')==='hotel'?'.hotel-preview':'.preview'):'');}
export function chapterEntryURL(destination,session=sessionStorage,base=location.href){
 const url=new URL(destination,base);if(url.origin!==new URL(base).origin||!entrySaveKey(url))throw Error('Unknown chapter entry');
 const token=crypto.randomUUID();session.setItem(pendingKey,JSON.stringify({token,path:url.pathname,key:entrySaveKey(url)}));url.searchParams.set('entry',token);return url.href;
}
export function consumeChapterEntry(storage=localStorage,session=sessionStorage,url=new URL(location.href)){
 const token=url.searchParams.get('entry');if(!token)return false;
 let entry;try{entry=JSON.parse(session.getItem(pendingKey));}catch{return false;}
 if(!entry||entry.token!==token||entry.path!==url.pathname||entry.key!==entrySaveKey(url))return false;
 const names=[entry.key,entry.key+'.scene'],backup=Object.fromEntries(names.map(k=>[k,storage.getItem(k)]).filter(([,v])=>v!==null));
 // A failed backup must leave the previous progress untouched.
 if(Object.keys(backup).length)storage.setItem('reliquia.chapter-entry.backup.'+token,JSON.stringify(backup));
 names.forEach(k=>storage.removeItem(k));session.removeItem(pendingKey);
 url.searchParams.delete('entry');history.replaceState(null,'',url.pathname+url.search+url.hash);return true;
}
