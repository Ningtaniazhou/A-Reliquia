import {mountBook} from './book.js';
import {readPreferences} from '../ui/preferences.js';
import {installSharedControls} from '../ui/shared-controls.js';
import {Ambience} from '../audio.js';
const $=id=>document.getElementById(id),audio=new Ambience();let prefs=readPreferences(),book,loading=false;
function apply(p){prefs=p;audio.setVolume(p.volume);audio.mute(p.muted);$('volume').value=p.volume;$('reduced').checked=p.reduced;document.body.classList.toggle('reduce-motion',p.reduced);}
function close(){if(!$('settings').open)return false;$('settings').close();audio.pause(document.hidden);document.body.classList.remove('paused');return true;}
function settings(){if(close())return;$('settings').showModal();audio.pause(true);document.body.classList.add('paused');}
async function show(mode){if(loading)return;loading=true;book?.dispose();book=await mountBook($('book'),{mode,getPreferences:()=>prefs,paused:()=>$('settings').open,onEnter:()=>location.assign('./index.html?play=1&preview=opening'),enterLabel:'进入书中世界',onState:p=>{for(const id of ['front','ending'])$(id).disabled=['opening','closing','flipping','to-ending'].includes(p);}});window.bookPreview=book;loading=false;}
$('front').onclick=()=>show('front');$('ending').onclick=()=>show('ending');$('settings-open').onclick=settings;$('resume').onclick=close;$('volume').oninput=e=>apply({...prefs,volume:+e.target.value});$('reduced').onchange=e=>apply({...prefs,reduced:e.target.checked});$('settings').addEventListener('cancel',e=>{e.preventDefault();close();});
installSharedControls({soundButton:'#sound',settingsButton:'#settings-open',getPreferences:()=>prefs,applyPreferences:apply,toggleSettings:settings,closeTop:close,unlock:()=>audio.unlock()});
document.addEventListener('keydown',e=>{if(e.code==='Escape'&&!e.repeat&&!e.ctrlKey&&!e.metaKey)settings();});document.addEventListener('pointerdown',()=>audio.unlock());document.addEventListener('visibilitychange',()=>audio.pause(document.hidden||$('settings').open));window.addEventListener('pagehide',()=>{book?.dispose();audio.dispose();});apply(prefs);audio.set('cover');show(new URLSearchParams(location.search).has('ending')?'ending':'front');
