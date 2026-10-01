// Shared identity and translated dedication. Shop branding is an adaptation addition.
export const MARY_SIGNATURE='M. M.';
export const MARY_NAME='Miss Mary';
export const MARY_DEDICATION='送给我的特奥多里科，我强健的小葡萄牙人，纪念我们共享的欢愉。';
export function maryPaper(kind='dedication'){
 return kind==='shop'?`<div class="mary-paper mary-shop-card"><strong>${MARY_NAME}</strong><span>玛丽小姐 · 手套与蜡花</span><small class="mary-signature">${MARY_SIGNATURE}</small></div>`:`<div class="mary-paper"><p>${MARY_DEDICATION}</p><small class="mary-signature">${MARY_SIGNATURE}</small></div>`;
}
if(typeof document!=='undefined'&&!document.querySelector('link[data-mary-stationery]')){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('../../styles/ui/mary-stationery.css',import.meta.url);link.dataset.maryStationery='';document.head.append(link);
}
