import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {contentVersion} from './release-build.mjs';

export function checkAcceptance(status,authorization,current){
 const chapters=[1,2,3,4,5,6,7];
 const checks=['sourceReviewComplete','addressFormsReviewComplete','fullPlaythroughPassed','legacySaveRegressionPassed','mobileLandscapePassed','deploymentTransitionPassed'];
 const deferred=authorization?.release===current&&authorization?.authorizedBy==='user'&&authorization?.decision==='publish-with-mobile-device-check-deferred';
 const missing=[...chapters.filter(c=>!status.completedChapters.includes(c)).map(c=>'chapter '+c),...checks.filter(k=>status[k]!==true&&!(k==='mobileLandscapePassed'&&deferred))];
 if(status.locale!=='pt-PT'||missing.length)throw Error('Localization release checks outstanding: '+missing.join(', '));
 return deferred&&status.mobileLandscapePassed!==true;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const status=JSON.parse(await readFile('game/src/i18n/readiness.json','utf8'));
 let authorization;try{authorization=JSON.parse(await readFile('scripts/release-authorization.json','utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
 const deferred=checkAcceptance(status,authorization,await contentVersion('game'));
 console.log(deferred?'Desktop acceptance passed. User authorized this exact release with real-phone testing deferred; mobileLandscapePassed remains false.':'Localization release acceptance recorded.');
}
