import {nodes,start} from './content.js';
export function current(s){return nodes[s.romanceNode]||nodes[start];}
export function begin(s){return {...s,phase:'feast',romanceNode:start,romanceChoices:{}};}
export function advance(s){if(s.phase!=='feast')return s;const n=current(s);if(n.choices)return s;return n.next?{...s,romanceNode:n.next}:{...s,phase:'end'};}
export function choose(s,id){if(s.phase!=='feast')return s;const n=current(s),c=n.choices?.find(c=>c.id===id);return c?{...s,romanceNode:c.next,romanceChoices:{...s.romanceChoices,[s.romanceNode]:id}}:s;}
const previousNodes={'visit-tonight':'introduction',heaven:'wealth',collapse:'dismiss',cooling:'bridge',tick:'bridge',nephew:'bridge',sweet_week:'bridge',eight:'bridge',expectation:'bridge',justino:'bridge',maid:'bridge',accusation:'bridge',money:'bridge',doubt:'who'};
export function restore(s){const key=previousNodes[s.romanceNode]||s.romanceNode,romanceNode=Object.hasOwn(nodes,key)?key:start,romanceChoices={};for(const id of ['umbrella','wealth'])if(nodes[id].choices.some(c=>c.id===s.romanceChoices?.[id]))romanceChoices[id]=s.romanceChoices[id];return {...s,romanceNode,romanceChoices};}
