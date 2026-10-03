// Returning to the cover never resets progress. Only the explicit Re-read action does.
export const completionKey='reliquia.book.finished.v1';
export function readingComplete(storage=localStorage){try{return storage.getItem(completionKey)==='true';}catch{return false;}}
export function restartReading(storage=localStorage,session=sessionStorage){
 const keys=Object.keys(storage).filter(k=>k.startsWith('reliquia.')&&(!k.includes('preview')||k==='reliquia.departure-preview.v1'||k==='reliquia.departure-preview.v1.scene')&&!k.includes('.backup.')&&!k.includes('settings')&&k!=='reliquia.preferences.v1');
 const backup=Object.fromEntries(keys.map(k=>[k,storage.getItem(k)]));
 // Write the backup before removing any key; quota failure leaves the old run intact.
 storage.setItem('reliquia.reading.backup.'+Date.now(),JSON.stringify(backup));
 for(const key of keys)storage.removeItem(key);
 for(const key of Object.keys(session))if(key.startsWith('reliquia.')&&key.includes('handoff'))session.removeItem(key);
}
