// Chapter routing only: chapter-owned saves and inventories remain intact.
const KEY='reliquia.mainline.v1';
const routes={jerusalem:'./jerusalem-study.html',dream:'./chapter4.html',morning:'./chapter5.html',homecoming:'./chapter6.html',epilogue:'./chapter7.html'};
const saveKeys={jerusalem:'reliquia.jerusalem-study.v1',dream:'reliquia.chapter4.v1',morning:'reliquia.chapter5.v1',homecoming:'reliquia.chapter6.v1',epilogue:'reliquia.chapter7.v1'};
const labels={jerusalem:'第三章 · 耶路撒冷',dream:'第四章 · 梦境',morning:'第五章 · 梦醒与归途',homecoming:'第六章 · 返家',epilogue:'第七章'};
const read=(storage,key)=>{try{const v=JSON.parse(storage.getItem(key));return v&&typeof v==='object'&&!Array.isArray(v)?v:null;}catch{return null;}};
export function rememberChapter(chapter,storage=localStorage){try{storage.setItem(KEY,JSON.stringify({chapter}));}catch{}}
export function readingProgress(storage=localStorage){
 const saved=read(storage,KEY),camp=read(storage,saveKeys.jerusalem),dream=read(storage,saveKeys.dream);
 const chapter=saved?.chapter;
 // An orphan route marker is not a save. A completed predecessor may have saved
 // its handoff just before navigation, so those two boundaries remain resumable.
 if(routes[chapter]&&(read(storage,saveKeys[chapter])||chapter==='dream'&&camp?.endSeen||chapter==='morning'&&dream?.finished))return {chapter,label:labels[chapter],url:routes[chapter]};
 for(const id of ['epilogue','homecoming','morning','dream'])if(!routes[chapter]&&read(storage,saveKeys[id]))return {chapter:id,label:labels[id],url:routes[id]};
 if(camp?.endSeen)return dream?.finished?{chapter:'morning',label:labels.morning,url:routes.morning}:{chapter:'dream',label:labels.dream,url:routes.dream+'?from=camp'};
 if(camp)return {chapter:'jerusalem',label:labels.jerusalem,url:routes.jerusalem};
 const opening=read(storage,'reliquia.opening.v1');
 if(opening?.scene){const later=opening.scene==='chapter2',departure=later&&opening.chapterState?.phase==='departure';return {chapter:departure?'departure':later?'boss':'opening',label:departure?'第三章 · 朝圣之旅':later?'第二章 · 姨姨家':'第一章 · 往事的开端',url:null};}
 const departure=read(storage,'reliquia.departure-preview.v1');if(departure?.node)return {chapter:'departure',label:'第三章 · 朝圣之旅',url:'./departure.html'};
 const boss=read(storage,'reliquia.aunt-boss.local.v1');if(boss?.phase)return {chapter:'boss',label:'第二章 · 姨姨家',url:boss.phase==='departure'?'./departure.html?from=chapter2':'./boss.html'};
 return null;
}
export function resumeChapter(storage=localStorage){return readingProgress(storage)?.url||null;}
