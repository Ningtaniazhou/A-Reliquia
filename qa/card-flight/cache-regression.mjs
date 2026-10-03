import {chromium} from '/Users/ningzhou/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';
const oldAudio=execFileSync('git',['show','d277bc1:game/src/boss/audio.js'],{encoding:'utf8'});
const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
try {
 for(const mode of ['current','legacy','cue-error','restore']){
  const page=await browser.newPage({viewport:{width:1280,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  if(mode==='legacy'||mode==='cue-error')await page.route('**/src/boss/audio.js*',route=>route.fulfill({contentType:'text/javascript',body:mode==='legacy'?oldAudio:oldAudio.replace(' cast(){',' impact(){throw Error("Audio device unavailable");}\n cast(){')}));
  await page.addInitScript(mode=>localStorage.setItem('reliquia.chapter6.v1.preview',JSON.stringify(mode==='restore'?{phase:'cast',pending:'water',elapsed:.98,used:[],muted:false}:{phase:'battle',used:[],muted:false})),mode);
  await page.goto((process.env.GAME_URL||'http://127.0.0.1:4173')+'/chapter6.html?preview=chapter6');
  await page.waitForFunction(()=>window.chapter6?.ready());
  if(mode!=='restore')await page.locator('#cards button[data-card="water"]').click();
  await page.waitForFunction(()=>chapter6.snapshot().used.includes('water'));
  for(let count=2;count<=3;count++){
   await page.locator('#cards button').first().click();
   await page.waitForFunction(count=>chapter6.snapshot().used.length===count,count);
  }
  assert.deepEqual(errors,[]);
  assert.equal(await page.locator('.card-flight').count(),0);
  console.log('PASS chapter6 three cards:',mode);
  await page.close();
 }
}finally{await browser.close();}
