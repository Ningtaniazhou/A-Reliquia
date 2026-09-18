import {cp,rm,mkdir,readdir,stat,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const required=['room.webp','window.webp','birth.webp','father.webp','departure.webp','landscape.webp','carriage.webp','wheel.webp'];
for(const name of required)await stat(resolve('game/assets',name));
await rm('dist',{recursive:true,force:true});await mkdir('dist');await cp('game','dist',{recursive:true});
let total=0;for(const name of await readdir('dist/assets'))total+=(await stat('dist/assets/'+name)).size;
console.log(`Built game only; artwork ${(total/1048576).toFixed(2)} MiB. Research and source masters excluded.`);
