import {restartButton} from '../ui/scene-checkpoint.js';
import {updateSoundButton} from '../ui/sound-button.js';
import {topics,opening,ending} from './dialogue.js';
import {SCROLL_SCALE} from '../voyage/scale.js';
const $=id=>document.getElementById(id),scene=$('scene'),audio=$('music');
let reviewed=new Set();
const availableTopics=()=>topics.filter(t=>!(unlocked?reviewed:asked).has(t.id));
let asked=new Set(),unlocked=false,mode='scene',selected=0,pages=[],page=0,activeTopic=null,returnMode='choices',suspended=null,wasPlaying=false;
function render(){
 $('speech').hidden=mode==='scene';$('next').hidden=mode!=='speech';$('choices').hidden=mode!=='choices';$('meet').hidden=mode!=='scene'||unlocked;
 $('portrait').hidden=!unlocked;$('scholar').hidden=unlocked;
 $('scholar').src=mode==='scene'?'./assets/malta/topsius-measure.png':'./assets/malta/topsius-talk.png';
 $('hero').src=['speech','choices'].includes(mode)?'./assets/malta/teodorico-listen.png':'./assets/malta/teodorico-idle.png';
 $('hint').hidden=!unlocked||mode!=='scene';
 if(mode==='speech'){
  const row=pages[page];$('speech').querySelector('.speaker').textContent=row[0];$('speech').querySelector('.zh').textContent=row[1];$('speech').querySelector('.pt').textContent='';$('speech').querySelector('.pt').hidden=true;
 }
 if(mode==='choices'){
  $('speech').querySelector('.pt').hidden=true;
  $('speech').querySelector('.speaker').textContent='托普修斯';$('speech').querySelector('.zh').textContent=unlocked?'拉波索先生，您还想问些什么？':'请问吧，先生。您想知道什么？';$('speech').querySelector('.pt').textContent='';
  $('options').replaceChildren();availableTopics().forEach((t,i)=>{const b=document.createElement('button');b.className='option'+(i===selected?' selected':'');b.textContent=t.label;b.setAttribute('aria-pressed',String(i===selected));b.onclick=()=>{selected=i;choose();};$('options').append(b);});
 }
}
function speak(rows,next='choices',id=null){pages=rows;page=0;mode='speech';returnMode=next;activeTopic=id;render();}
function choose(){const t=availableTopics()[selected];if(t)speak(t.pages,'choices',t.id);}
function next(){
 if(mode==='scene'){if(suspended){mode=suspended;suspended=null;render();}else if(unlocked){reviewed.clear();selected=0;mode='choices';render();}else speak(opening);return;}
 if(mode==='choices'){choose();return;}
 if(++page<pages.length){render();return;}
 if(activeTopic)(unlocked?reviewed:asked).add(activeTopic);
 $('options').replaceChildren();
 if(returnMode==='unlock'){unlocked=true;mode='scene';activeTopic=null;render();return;}
 if(asked.size===topics.length&&!unlocked){speak(ending,'unlock');return;}
 mode=availableTopics().length?'choices':'scene';selected=Math.min(selected,Math.max(0,availableTopics().length-1));render();
}
function leave(){if(['speech','choices'].includes(mode)){suspended=mode;mode='scene';render();}}
$('next').onclick=next;$('meet').onclick=next;$('portrait').onclick=()=>{reviewed.clear();selected=0;mode='choices';suspended=null;$('portrait').classList.add('read');render();};
$('sceneView').onclick=()=>{suspended=null;mode='scene';render();scene.focus();};
$('dialogueView').onclick=()=>{suspended=null;if(unlocked){reviewed.clear();selected=0;mode='choices';render();}else speak(opening);scene.focus();};
$('portraitView').onclick=()=>{unlocked=true;asked=new Set(topics.map(t=>t.id));suspended=null;mode='scene';render();scene.focus();};
function musicState(){const on=!audio.paused;updateSoundButton($('musicToggle'),!on||audio.volume===0);updateSoundButton($('sound'),!on||audio.volume===0);}
async function toggleMusic(){if(audio.paused){try{await audio.play();}catch{$('musicToggle').textContent='音频未能播放，请重试';return;}}else audio.pause();musicState();}
$('musicToggle').onclick=toggleMusic;$('sound').onclick=toggleMusic;audio.volume=.35;$('volume').oninput=e=>{audio.volume=+e.target.value;musicState();};
$('settings').onclick=()=>{wasPlaying=!audio.paused;audio.pause();musicState();$('pause').showModal();};$('resume').onclick=()=>$('pause').close();$('pause').onclose=()=>{if(wasPlaying)audio.play().then(musicState).catch(()=>{});scene.focus();};
document.addEventListener('keydown',e=>{
 if($('pause').open||e.target.matches('input,summary'))return;
 if(!['KeyW','KeyS','KeyE','Space','Enter','KeyR','Escape'].includes(e.code))return;
 e.preventDefault();if(e.repeat)return;
 if(e.code==='Escape'){if(mode==='scene')$('settings').click();else leave();return;}
 if(e.code==='KeyR'){if(!unlocked)return;if(mode==='scene')$('portrait').click();else leave();return;}
 if(mode==='choices'&&['KeyW','KeyS'].includes(e.code)){selected=(selected+(e.code==='KeyS'?1:-1)+availableTopics().length)%availableTopics().length;render();return;}
 if(e.code==='Space'&&mode!=='scene'||e.code==='KeyE'&&mode==='scene')next();
});
for(const src of ['./assets/malta/teodorico-idle.png','./assets/malta/teodorico-listen.png']){const im=new Image();im.src=src;im.decode().catch(()=>{});}
scene.style.setProperty('--adult-height-width',SCROLL_SCALE.adultHeight/SCROLL_SCALE.width*100+'cqw');
scene.style.setProperty('--adult-height',SCROLL_SCALE.adultHeight/SCROLL_SCALE.height*100+'%');
render();
// Local preview server may expose WAV as a streaming resource without duration.
audio.addEventListener('timeupdate',()=>{if(audio.currentTime>=40)audio.currentTime=0;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){audio.pause();musicState();}});

musicState();

restartButton($('pause'),()=>{asked=new Set();reviewed.clear();unlocked=false;mode='scene';selected=0;pages=[];page=0;activeTopic=null;suspended=null;$('portrait').classList.remove('read');render();$('pause').close();});
