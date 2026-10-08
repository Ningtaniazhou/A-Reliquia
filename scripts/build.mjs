import {auditAssets} from './audit-assets.mjs';
import {cp,rm,mkdir,readdir,stat,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const required=['room.webp','window.webp','birth.webp','father.webp','departure.webp','landscape.webp','carriage.webp','wheel.webp'];
for(const name of required)await stat(resolve('game/assets',name));
const audit=await auditAssets('game');if(audit.missing.length)throw new Error('Missing assets: '+JSON.stringify(audit.missing));
await rm('dist',{recursive:true,force:true});await mkdir('dist');await cp('game','dist',{recursive:true});
async function inventory(dir){let rows=[];for(const item of await readdir(dir,{withFileTypes:true})){const path=resolve(dir,item.name);if(item.isDirectory())rows.push(...await inventory(path));else rows.push({path,bytes:(await stat(path)).size});}return rows;}
const files=await inventory('dist'),assets=files.filter(f=>f.path.startsWith(resolve('dist/assets')+'/'));
const size=rows=>(rows.reduce((sum,f)=>sum+f.bytes,0)/1048576).toFixed(2);
console.log(`Built ${files.length} files: ${size(files)} MiB total; ${assets.length} assets: ${size(assets)} MiB. Research, previews and source masters excluded.`);
