import {buildRelease} from './release-build.mjs';
console.log(JSON.stringify(await buildRelease({rollback:process.argv.includes('--rollback-baseline')}),null,2));
