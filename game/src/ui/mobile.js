// Touch-first phones keep the same actions and saves, with device-appropriate hints.
export const phoneQuery=matchMedia('(hover: none) and (pointer: coarse) and (max-width: 1000px)');
export const isPhone=()=>phoneQuery.matches;
const sheet=document.createElement('link');sheet.rel='stylesheet';sheet.href=new URL('../../styles/ui/mobile.css',import.meta.url);document.head.append(sheet);

export function installPhoneOrientation({toggleSettings,closeTop,settingsPanel,enabled}){
 const portrait=matchMedia('(orientation: portrait)');
 const gate=document.createElement('dialog');gate.className='mobile-rotate';gate.setAttribute('aria-label','请横屏游玩');gate.innerHTML='<strong>请横屏游玩</strong><p>将手机横过来，即可继续游戏。</p>';document.body.append(gate);
 let autoPaused=false;
 gate.addEventListener('cancel',e=>e.preventDefault());
 function sync(){
  if(isPhone()&&portrait.matches&&enabled()){
   if(!gate.open){const settings=document.querySelector(settingsPanel);const alreadyOpen=settings&&settings.getClientRects().length>0;autoPaused=!alreadyOpen;if(autoPaused)toggleSettings();gate.showModal();}
  }else if(gate.open){gate.close();if(autoPaused)closeTop();autoPaused=false;}
 }
 phoneQuery.addEventListener('change',sync);portrait.addEventListener('change',sync);sync();
 return ()=>{phoneQuery.removeEventListener('change',sync);portrait.removeEventListener('change',sync);gate.remove();};
}
