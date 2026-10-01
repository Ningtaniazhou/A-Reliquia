// Landscape expands separately; the carriage follows a single, uniform FLIP.
// Never shrink the carriage inside a simultaneously enlarging parent.
export function expandJourney(root,rect,backdrop,reduced,sourceCar){
 if(!rect||reduced)return;
 const scene=root.querySelector('.road-scene'),frame=root.querySelector('.road-frame'),car=root.querySelector('.road-vehicle');
 if(!frame||!car||!backdrop)return;
 const destination=car.getBoundingClientRect();
 backdrop.classList.add('journey-book-backdrop');backdrop.inert=true;backdrop.setAttribute('aria-hidden','true');root.prepend(backdrop);scene.classList.add('expanding-road');
 const layer=document.createElement('div');layer.className='journey-car-layer';scene.append(layer);layer.append(car);
 Object.assign(car.style,{left:destination.x+'px',top:destination.y+'px',bottom:'auto',width:destination.width+'px',height:destination.height+'px'});
 const options={duration:1200,easing:'cubic-bezier(.22,.65,.3,1)',fill:'none'};
 frame.style.transformOrigin='0 0';
 const animation=frame.animate([{transform:`translate(${rect.x}px,${rect.y}px) scale(${rect.width/frame.offsetWidth},${rect.height/frame.offsetHeight})`},{transform:'none'}],options);
 car.style.transformOrigin='0 0';
 const carAnimation=sourceCar?car.animate([{transform:`translate(${sourceCar.x-destination.x}px,${sourceCar.y-destination.y}px) scale(${sourceCar.width/destination.width})`},{transform:'none'}],options):null;
 const border=document.createElement('img');border.className='journey-border expanding-border';border.src='./assets/journey-border.webp';border.alt='';frame.append(border);border.animate([{opacity:1},{opacity:0}],options);
 let finished=false;const cleanup=()=>{if(finished)return;finished=true;animation.cancel();carAnimation?.cancel();frame.append(car);car.style.left='25%';car.style.top='';car.style.bottom='';car.style.width='';car.style.height='';layer.remove();backdrop.remove();scene.classList.remove('expanding-road');border.remove();frame.style.transformOrigin='';car.style.transformOrigin='';window.removeEventListener('resize',cleanup);};
 animation.finished.catch(()=>{}).finally(cleanup);window.addEventListener('resize',cleanup,{once:true});
}
