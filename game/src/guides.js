// One demonstration per kind of action, including across reloads and rereading.
const key='reliquia.guides.v1';
let seen=new Set();try{seen=new Set(JSON.parse(localStorage.getItem(key)||'[]'));}catch{}
export function hand(kind){
 if(seen.has(kind))return '';seen.add(kind);try{localStorage.setItem(key,JSON.stringify([...seen]));}catch{}
 return `<span class="tap-guide" data-guide="${kind}" aria-hidden="true"><svg viewBox="0 0 48 56" fill="none"><path d="M18 30V8a4 4 0 0 1 8 0v16-5a4 4 0 0 1 7 0v5-2a4 4 0 0 1 7 1v3a4 4 0 0 1 6 3v10c0 8-5 13-12 13h-5c-5 0-8-3-11-7L8 32c-3-5 2-9 6-5l4 3Z" fill="#f7ecd1" stroke="#7b603a" stroke-width="2" stroke-linejoin="round"/><path d="M10 10H5M12 3 8 0M30 4l4-4" stroke="#ebca83" stroke-width="2" stroke-linecap="round"/></svg></span>`;
}
