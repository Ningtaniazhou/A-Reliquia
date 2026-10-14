import {readFile} from 'node:fs/promises';
import {assertRetention} from './release-build.mjs';
const next=JSON.parse(await readFile('dist/release.json','utf8'));
const url=new URL('https://ningtaniazhou.github.io/A-Reliquia/release.json');url.searchParams.set('check',Date.now());
const response=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(30000)});
if(response.status===404){console.log('First versioned release; pinned legacy namespace retained.');}
else{
 if(!response.ok)throw Error('Cannot verify previous deployment: '+response.status);
 const previous=await response.json();assertRetention(previous,next);
 console.log('All deployed release directories retained.');
}
