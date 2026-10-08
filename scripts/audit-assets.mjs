// Conservative release audit. Dynamic references require scene/browser tests;
// lack of a literal reference is never treated as permission to delete a file.
import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,relative,extname} from 'node:path';
import {createHash} from 'node:crypto';
export async function auditAssets(root='game'){
 root=resolve(root);const files=[];async function walk(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,e.name);if(e.isDirectory())await walk(p);else files.push(p);}}await walk(root);
 const assets=[],missing=[];
 for(const p of files){const rel=relative(root,p);if(rel.startsWith('assets/')){const data=await readFile(p);assets.push({path:rel,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
 if(['.js','.css','.html'].includes(extname(p))&&!rel.startsWith('vendor/')){const text=await readFile(p,'utf8');for(const m of text.matchAll(/["'`](?:\.\/)?(assets\/[^"'`\n]+\.(?:webp|png|m4a|wav|woff2))["'`]/g)){if(m[1].includes('${'))continue;try{await stat(resolve(root,m[1]));}catch{missing.push({source:rel,asset:m[1]});}}}}
 const byType={};for(const a of assets){const key=extname(a.path);byType[key]=(byType[key]||0)+a.bytes;}
 return {files:files.length,assetCount:assets.length,assetBytes:assets.reduce((s,a)=>s+a.bytes,0),byType,missing,assets};
}
if(process.argv[1]&&resolve(process.argv[1])===new URL(import.meta.url).pathname){const report=await auditAssets(process.argv[2]||'game');console.log(JSON.stringify(report,null,2));if(report.missing.length)process.exitCode=1;}
