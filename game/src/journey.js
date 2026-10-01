import {paintRain} from './rain.js';
// User-approved two-day condensation; the overnight is a visual ellipsis.
export const JOURNEY_SECONDS=68;
const clamp=x=>Math.max(0,Math.min(1,x));
const smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t);};
export function journeyAt(progress){
 const t=clamp(progress)*JOURNEY_SECONDS;
 const parked=t>=24&&t<34;
 const country=t<24?.25*(1-(1-clamp(t/24))**1.35):t<34?.25:.25+.75*clamp((t-34)/34);
 const city=smooth(49,66,t);
 const rain=smooth(49,68,t);
 const night=smooth(8,23,t)*(1-smooth(28,30,t));
 const blackout=smooth(26,28,t)*(1-smooth(30,32,t));
 const arrival=smooth(56,68,t);
 const phase=t<8?'morning-road':t<17?'pine-dusk':t<24?'lamplit-town':t<28?'inn-night':t<30?'overnight':t<34?'inn-morning':t<53?'valley-road':'lisbon-rain';
 return {rain,night,inside:0,blackout,country,city,arrival,parked,moving:!parked&&t<68,phase,progress:clamp(progress),distance:country+arrival*.65,warmth:Math.sin(Math.PI*night)*.16};
}
export function paintJourney(frame,progress,reduced,time){
 const j=journeyAt(progress);frame.dataset.journeyPhase=j.phase;frame.dataset.journeyProgress=progress.toFixed(6);
 for(const [key,value] of Object.entries({night:j.night,blackout:j.blackout,city:j.city,sunset:j.warmth}))frame.style.setProperty('--'+key,value.toFixed(4));
 const country=frame.querySelector('.journey-country');if(country)country.style.transform=`translateX(${-Math.max(0,country.offsetWidth-frame.offsetWidth)*j.country}px)`;
 paintRain(frame.querySelector('.journey-rain'),j.rain,reduced,time);
 return j;
}
