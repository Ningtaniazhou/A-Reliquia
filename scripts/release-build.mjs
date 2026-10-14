import {mkdtemp,readdir,readFile,writeFile,mkdir,cp,rm} from 'node:fs/promises';
import {resolve,join,relative} from 'node:path';
import {tmpdir} from 'node:os';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {auditAssets} from './audit-assets.mjs';

async function files(root){const out=[];for(const e of await readdir(root,{withFileTypes:true})){const p=join(root,e.name);if(e.name==='notebook-test.html')continue;if(e.isDirectory())out.push(...await files(p));else if(e.isFile())out.push(p);else throw Error('Release cannot contain symlinks: '+p);}return out.sort();}
export async function contentVersion(root){const hash=createHash('sha256');for(const p of await files(root)){hash.update(relative(root,p));hash.update('\0');hash.update(await readFile(p));hash.update('\0');}return hash.digest('hex').slice(0,20);}
export function assertRetention(previous,next){
 if(previous.schema!==1||previous.legacyCommit!==next.legacyCommit)throw Error('Unexpected deployed release manifest');
 const ids=new Set([next.current,...next.retained.map(r=>r.id)]);
 for(const id of [previous.current,...previous.retained.map(r=>r.id)])if(!ids.has(id))throw Error('Keep deployed version '+id+' by adding its full source commit to scripts/releases.json');
}
function exportGame(commit,target){
 if(!/^[a-f0-9]{40}$/.test(commit))throw Error('Pin a complete commit ID');
 // Only tracked runtime files from the known revision; research and local work stay out.
 const archive=execFileSync('git',['archive',commit,'game'],{maxBuffer:200*1024*1024});
 execFileSync('tar',['-x','-C',target],{input:archive,maxBuffer:1024*1024});
}
export async function buildRelease({source='game',output='dist',config,rollback=false}={}){
 config??=JSON.parse(await readFile('scripts/releases.json','utf8'));
 const audit=await auditAssets(source);if(audit.missing.length)throw Error('Missing assets: '+JSON.stringify(audit.missing));
 const temp=await mkdtemp(join(tmpdir(),'reliquia-release-'));
 try{
  const staging=join(temp,'site');await mkdir(staging);exportGame(config.legacyCommit,temp);
  // The entire original namespace remains available to pre-update tabs, including lazy imports.
  await cp(join(temp,'game'),staging,{recursive:true});await rm(join(temp,'game'),{recursive:true});
  const retained=[];
  for(const commit of config.retainedCommits){exportGame(commit,temp);const root=join(temp,'game'),id=await contentVersion(root);await mkdir(join(staging,'releases'),{recursive:true});await cp(root,join(staging,'releases',id),{recursive:true,filter:p=>!p.endsWith('/notebook-test.html')});await rm(root,{recursive:true});retained.push({commit,id});}
  const id=await contentVersion(source);await mkdir(join(staging,'releases'),{recursive:true});await cp(source,join(staging,'releases',id),{recursive:true,filter:p=>!p.endsWith('/notebook-test.html')});
  const manifest={schema:1,current:id,legacyCommit:config.legacyCommit,retained,rollback};
  if(!rollback){
   // Entry only. Relative URLs inside a release never escape its immutable directory.
   const destination='./releases/'+id+'/covers.html';
   await writeFile(join(staging,'covers.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A Relíquia</title><script>location.replace(${JSON.stringify(destination)}+location.search+location.hash)</script><noscript><a href="${destination}">中文 / Português</a></noscript></html>`);
  }
  await writeFile(join(staging,'release.json'),JSON.stringify(manifest,null,2)+'\n');
  // Do not erase the last successful local build until the new tree has been assembled.
  await rm(output,{recursive:true,force:true});await mkdir(resolve(output,'..'),{recursive:true});await cp(staging,output,{recursive:true});
  return {id,retained,files:(await files(output)).length,legacyCommit:config.legacyCommit};
 }finally{await rm(temp,{recursive:true,force:true});}
}
