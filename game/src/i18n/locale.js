// Locale is captured once per document. Active games never subscribe to preference changes.
export const LOCALE_KEY='reliquia.locale.v1';
export const SESSION_KEY='reliquia.session-locale.v1';
export const supported=Object.freeze(['zh-CN','pt-PT']);
export const validLocale=value=>supported.includes(value)?value:null;
const read=(storage,key)=>{try{return validLocale(storage?.getItem(key));}catch{return null;}};
export function resolveLocale({explicit,parent,session,preference,cover=false}={}){
 return validLocale(parent)||validLocale(explicit)||(!cover&&validLocale(session))||validLocale(preference)||'zh-CN';
}
function current(){
 if(typeof window==='undefined')return 'zh-CN';
 let parent,session,preference;
 try{if(window.parent!==window)parent=window.parent.__reliquiaLocale;}catch{}
 try{session=read(window.sessionStorage,SESSION_KEY);}catch{}
 try{preference=read(window.localStorage,LOCALE_KEY);}catch{}
 const url=new URL(window.location.href),cover=url.pathname.endsWith('/covers.html');
 return resolveLocale({explicit:url.searchParams.get('lang'),parent,session,preference,cover});
}
export const locale=current();
export const isPortuguese=locale==='pt-PT';
if(typeof window!=='undefined'){
 Object.defineProperty(window,'__reliquiaLocale',{value:locale,configurable:true});
 document.documentElement.lang=locale;
 // Remember this tab's choice for chapter reloads, without touching narrative saves.
 try{sessionStorage.setItem(SESSION_KEY,locale);}catch{}
}
export function selectLocale(value){
 if(!validLocale(value))throw new Error('Unsupported locale');
 if(typeof window==='undefined'||window.parent!==window||!location.pathname.endsWith('/covers.html'))throw new Error('Choose a language on the cover');
 try{localStorage.setItem(LOCALE_KEY,value);}catch{}
 try{sessionStorage.setItem(SESSION_KEY,value);}catch{}
 const url=new URL(location.href);url.searchParams.set('lang',value);location.replace(url.href);
}
export const bilingual=(zh,pt)=>isPortuguese?pt:zh;
