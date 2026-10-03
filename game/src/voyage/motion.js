// One complete two-step walk cycle. Phase advances by distance, never wall time.
export const WALK=Object.freeze({frames:8,stride:156});
export function walkFrame(distance){return Math.floor(Math.max(0,distance)/WALK.stride*WALK.frames)%WALK.frames;}

// Scene changes only during the opaque hold; neither actor nor camera climbs.
export function boardingFrame(seconds){
 const t=Math.max(0,seconds);
 return {opacity:t<.5?t/.5:t<.8?1:Math.max(0,1-(t-.8)/.6),swap:t>=.65,done:t>=1.4};
}

// Destination title is readable only during the fully black hold.
export function maltaArrivalFrame(seconds,slow=true){
 const t=Math.max(0,seconds);
 if(!slow)return {opacity:t<1.5?t/1.5:1,swap:t>=3.5,done:t>=7.5,label:t>=1.5&&t<7.5};
 return {opacity:t<1.5?t/1.5:t<6?1:Math.max(0,1-(t-6)/1.5),swap:t>=3.5,done:t>=7.5,label:t>=1.5&&t<6};
}
