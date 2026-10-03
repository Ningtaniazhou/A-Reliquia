import {holyDone,travelReady,purchasedRelics} from './state.js';
import {contextualTopics} from './chapter-content.js';
import {scholarFor} from './regions.js';
// The host owns DOM, movement and save writes. This controller only maps intent.
export function chapterController({state,talk,depart,showMenu,hint}){
 const choice=(label,run)=>({label,run});
 const speech=(label,id)=>({...choice(label,()=>talk(id)),topic:id});
 const trip=(label,room,x)=>choice(label,()=>depart(room,x));
 function menu(id){const s=state();let title,rows;
  if(id==='travel'){if(!travelReady(s))return null;title='骡马已经备好';rows=[];
   if(s.room!=='street')rows.push(trip('回到耶路撒冷城区。','street',1595));
   if(s.room!=='forecourt')rows.push(travelReady(s)?trip('前往圣墓前庭。','forecourt',145):speech('先去客房，看看窗外。','travelBlocked'));
   if(holyDone(s)){
    if(s.room!=='camp')rows.push(trip('前往耶里哥附近的营地。','camp',125));
    rows.push(trip('独自前往荒野。','wild',150));
   }
  }
  const wares={wood:['木片摊','woodOffer','takeWood','relic-wood'],straw:['麦秆与石子','strawOffer','takeStraw','relic-straw'],beads:['念珠摊','beadOffer','takeBeads','relic-beads']};
  if(wares[id]){const [name,offer,take,item]=wares[id];title=name;rows=[speech('问问这件东西的来历。',offer),speech(s.items.includes(item)?'查看已经收下的物件。':'付钱，收下这件物品。',s.items.includes(item)?'relicAgain':take)];}
  if(id==='tree'){title='岩壁旁的荆棘树';rows=[speech('看看树干与枝条。',s.thorn?'treeAfter':'tree')];
   if(!s.thorn){if(!s.seen.includes('treeThought'))rows.push(speech('想到姨姨与圣物。','treeThought'));
    else if(!s.seen.includes('treeScholar'))rows.push(speech('去请博士来看这棵树。','treeScholar'));
    else rows.push(speech('用小刀割下一根枝条。','cut'));
   }else rows.push(speech('问博士为什么是荆棘冠。','crownScholar'));
  }
  if(id==='campScholar'){title='问博士';rows=[speech('耶里哥的遗迹。','ruins'),speech('荒山里的希律与施洗约翰。','herod')];}
  if(id==='forecourtScholar'){title='问博士';rows=[speech('苦路与彼拉多旧居。','viaScholar'),speech('这些圣物的来历。','marketScholar')];}
  if(id==='holyScholar'){title='问博士';rows=[speech('为什么有穆斯林守卫？','guardScholar'),speech('石头、灯火与仪式。','holyScholar')];}
  if(id==='fatmeNext'){title='法特梅家';const first=s.fatmeStage===1;rows=[choice(first?'付七个金皮阿斯特，请她进来。':'付九个皮阿斯特，请另一位进来。',()=>{s.fatmePaid=first?1:2;talk(first?'fatmeOffer':'fatmeRefusal');})];}
  if(contextualTopics[id]){if(contextualTopics[id].some(k=>!s.asked.includes(k)))rows=rows.filter(row=>!s.asked.includes(row.topic));}
  return title?{title,rows}:null;
 }
 function scholar(){const s=state();if(s.room==='forecourt')return showMenu('forecourtScholar');if(s.room==='holy')return showMenu('holyScholar');if(s.room==='camp')return showMenu('campScholar');if(s.room==='fatmeRoom')return talk('fatmeScholar');if(s.room==='wild'&&!s.seen.includes('treeThought'))return talk('crownScholar');talk(scholarFor(s));}
 function interact(id){const s=state();
  if(id==='mule'||id==='travel'){if(travelReady(s))showMenu('travel');return true;}
  if(id==='fatme'){if(!s.arranged)talk('fatme');else depart('fatmeRoom',860);return true;}
  if(id==='streetExit'){depart('street',1938);return true;}
  if(id==='fatmeTalk'){if((s.fatmeStage===1&&s.fatmePaid<1)||(s.fatmeStage===2&&s.fatmePaid<2)){showMenu('fatmeNext');return true;}talk(['fatmeWelcome','fatmeOffer','fatmeRefusal','fatmeAfter'][s.fatmeStage]);return true;}
  if(id==='holyDoor'){if(purchasedRelics(s))depart('holy',95);else hint('先到三位商人那里买齐带给姨姨的圣物，再进教堂。',8);return true;}
  if(id==='forecourtExit'){depart('forecourt',708);return true;}
  if(['wood','straw','beads','tree'].includes(id)){showMenu(id);return true;}
  if(id==='campExit'){depart('camp',780);return true;}
  if(id==='landscape'){talk('wildLook');return true;}
  if(id==='campPotte'){if(s.thorn===1){s.x=545;s.facing=1;talk('craft');}else talk('campWaiting');return true;}
  if(id==='worktable'){if(s.thorn<2)return true;talk(['materials','craft','pack','tableAfter'][s.thorn]);return true;}
  if(id==='wine'||id==='firepit'){if(s.thorn<3)return true;s.celebration=true;talk(s.toasted?'fire':'toast');return true;}
  if(id==='tent'){talk(s.danced?'sleep':'campWaiting');return true;}
  return false;
 }
 function after(id){const s=state();
  if(['tomb','calvary'].includes(id)&&holyDone(s))hint('圣墓参观已完成 · 骡马可带你前往营地与荒野',8);
  if(['treeThought','treeScholar'].includes(id))showMenu('tree');
  if(id==='cut')hint('获得带刺的枝条 · 回营地请波特编冠',8);
  if(id==='craft')hint('荆棘冠编好了 · 到工作桌把它包好',8);
  if(id==='pack'){if(s.celebration)talk('toast');else hint('荆棘冠已包好 · 点击酒杯或篝火开始晚宴',8);}
  if(id==='toast'&&s.celebration)talk('fire');
  
  if(id==='fatmeWelcome'||id==='fatmeOffer')showMenu('fatmeNext');
 }
 return {menu,interact,scholar,after};
}
