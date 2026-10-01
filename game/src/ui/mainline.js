// Chapter routing only: chapter-owned saves and inventories remain intact.
const KEY='reliquia.mainline.v1';
const routes={jerusalem:'./jerusalem-study.html',dream:'./chapter4.html',morning:'./chapter5.html',homecoming:'./chapter6.html',epilogue:'./chapter7.html'};
export function rememberChapter(chapter,storage=localStorage){try{storage.setItem(KEY,JSON.stringify({chapter}));}catch{}}
export function resumeChapter(storage=localStorage){try{
 const saved=JSON.parse(storage.getItem(KEY));if(routes[saved?.chapter])return routes[saved.chapter];
 // Older connected saves predate the route marker. Independent previews use other keys.
 const camp=JSON.parse(storage.getItem('reliquia.jerusalem-study.v1'));
 if(camp?.endSeen){const dream=JSON.parse(storage.getItem('reliquia.chapter4.v1'));return dream?.finished?routes.morning:routes.dream+'?from=camp';}
 if(camp)return routes.jerusalem;
 }catch{}return null;
}
