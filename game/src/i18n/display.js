import {isPortuguese} from './locale.js';
import {tr,trMarkup} from './ui.js';

// Localization is confined to display sinks. Original character names, state keys,
// source records and choices remain available to the game logic unchanged.
export const localizeText=value=>typeof value==='string'?tr(value):value;
export const localizeMarkup=value=>typeof value==='string'?trMarkup(value):value;

// Static authored HTML is translated once, before chapter modules render their UI.
// Dynamic content is translated by explicit rendering calls, not a DOM observer.
if(isPortuguese&&typeof document!=='undefined'){
 const style=document.createElement('link');style.rel='stylesheet';
 style.href=new URL('../../styles/ui/locale.css',import.meta.url);document.head.append(style);
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const nodes=[];while(walker.nextNode())if(!walker.currentNode.parentElement.closest('script,style'))nodes.push(walker.currentNode);
 for(const node of nodes)node.textContent=tr(node.textContent);
 for(const el of document.querySelectorAll('[aria-label],[title],[alt]'))for(const attr of ['aria-label','title','alt'])if(el.hasAttribute(attr))el.setAttribute(attr,tr(el.getAttribute(attr)));
 document.title=tr(document.title);
}
