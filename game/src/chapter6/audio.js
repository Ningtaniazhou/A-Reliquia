import {BossAudio} from '../boss/audio.js';
export class HomecomingAudio extends BossAudio{
 constructor(settings){super(settings);this.mode=null;}
 modeFor(phase){
  if(['awaken','challenge','battle','cast'].includes(phase))return 'battle';
  if(['arrival','inspection','triumphHold','triumph','curtainOpening','empty','roomIn','dismissal','take','leaving','exit','outside'].includes(phase))return 'home';
  if(['chapelFade','evening','seat','seating','lights','lampRequest','lighting','ceremony','silence','congratulate','unbox','perfume','revealHold','recognize','cardInspect','inscription'].includes(phase))return 'ritual';
  return 'silence';
 }
 scene(phase){const mode=this.modeFor(phase);if(this.mode===mode)return;this.mode=mode;this.request(mode==='battle'?'auntBattle':mode==='home'?'homecomingA':mode==='ritual'?'homecomingC':null,['homeFade','roomFade'].includes(phase)?1.4:mode==='silence'?.18:mode==='battle'?.08:['chapelFade','roomIn'].includes(phase)?1.8:1.2);}
 tick(){}
 effect(name){if(!this.ctx)return;if(name==='awaken'){this.noise(.35,.18,350);this.tone(65,1,.13,'triangle');}else if(name==='water'){this.noise(.65,.12,1800);this.tone(1174,1.2,.08);this.tone(1760,.7,.05);}else if(name==='straw'){this.noise(.85,.14,3500);this.tone(880,.8,.07);this.tone(1320,1.1,.035);}else if(name==='wood'){this.noise(.2,.18,650);this.tone(146,.75,.12,'triangle');this.tone(587,.7,.045);}else if(name==='settle'){this.tone(523.25,2.4,.065);this.tone(659.25,2.7,.045);this.tone(783.99,3,.04);this.tone(1567.98,2,.018);}else if(name==='ribbon'){this.noise(.12,.025,1200);}else if(name==='paper'){this.noise(.65,.09,2400);}else if(name==='shock'){this.noise(.25,.065,4000);this.tone(87.3,1.7,.065);this.tone(92.5,1.5,.06);}else if(name==='curtain'){this.cloth();this.noise(1.4,.07,600);}else if(name==='step'){this.step();}else if(name==='door'){this.door();this.tone(73,1,.05,'triangle');}else this.cloth();}
}
