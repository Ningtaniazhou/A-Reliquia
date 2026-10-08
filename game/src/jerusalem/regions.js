// Scene layout and loading are independent from dialogue and progression.
const at=(id,x,y,label)=>({id,x,y,label});
export const regionFiles={fatmeRoom:'fatme-room.webp',forecourt:'forecourt.webp',holy:'holy.webp',camp:'camp-day.webp',campNight:'camp-night.webp',campMoon:'camp-moon.webp',campEmbers:'camp-embers.webp',wild:'wild.webp',fatmeLady:'fatme-lady.webp',nubian:'nubian.webp',circassian:'circassian.webp',guard:'guard.webp',priest:'priest.webp',cook:'cook.webp',dancer:'dancer.webp'};
export function needed(room,s){return ({street:['left','middle','right','friar','woman','porter','resident','bedouin','mule'],lobby:['lobby','potte','clerk'],room:['room'],fatmeRoom:['fatmeRoom','fatmeLady','nubian','circassian'],forecourt:['forecourt','mule'],holy:['holy','guard','priest'],camp:['camp','campNight','campMoon','campEmbers','cook','dancer','potte','bedouin','mule','sharedParcel'],wild:['wild','mule']})[room]||[];}
export function regionSpots(s){return ({
 fatmeRoom:[at('streetExit',895,340,'回到雨街'),at('fatmeTalk',710,270,s.fatmeStage?'与法特梅交谈':'询问舞女的事'),at('fatmeObjects',405,310,'查看陈设'),...(s.fatmePaid>=2?[at('fatmeWoman',(s.fatmeAnchor||680)-270,270,'看看那位姑娘')]:[])],
 forecourt:[at('travel',95,300,'选择去向'),at('via',225,275,'查看苦路'),at('wood',345,260,'查看商品'),at('straw',510,277,'查看商品'),at('holyDoor',704,295,'进入圣墓教堂'),at('beads',847,260,'查看商品')],
 holy:[at('forecourtExit',70,325,'回到前庭'),at('guard',200,300,'看看守卫'),at('slab',352,310,'查看石板'),at('tomb',545,282,'走近墓龛'),at('calvary',810,295,'登上台阶')],
 camp:[at('travel',90,300,'选择去向'),at('coffee',272,295,'喝杯咖啡'),...(s.thorn===1?[at('campPotte',625,290,'请波特编冠')]:[]),...(s.thorn>=2?[at('worktable',490,302,s.thorn===2?'包好荆棘冠':'查看行李')]:[]),...(s.thorn>=3?[at('wine',400,290,s.toasted?'查看酒杯':'举杯饮酒')]:[]),...(s.thorn>=3?[at('firepit',650,300,s.toasted?'开始篝火晚宴':'查看火堆')]:[]),at('stream',755,239,'眺望溪流'),at('tent',857,295,s.danced?'进帐篷睡下':'查看帐篷')],
 wild:[at('campExit',115,285,'返回营地'),at('tree',575,285,s.thorn?'查看切口':'查看荆棘树'),at('landscape',835,300,'眺望荒岭')]
 })[s.room]||null;}
export const heroFeet=room=>({street:462,room:460,lobby:489,forecourt:467,holy:471,fatmeRoom:472,camp:477,wild:475})[room]||489;
export function scholarFor(s){return ({forecourt:'marketScholar',holy:'holyScholar',fatmeRoom:'fatmeAfter',camp:'campScholar',wild:s.thorn?'crownScholar':s.seen.includes('treeThought')?'treeScholar':'ruins'})[s.room]||(s.windowSeen?'scholarSeen':'scholar');}
export function objective(s){if(s.complete)return '回看第三章 · 可探索已到过的地方';if(!s.checked)return '到旅馆前台办理入住';if(!s.potteMet)return '先在大堂与波特交谈';if(!s.windowSeen)return '去客房，看看窗外的圣城';if(!s.seen.includes('tomb')||!s.seen.includes('calvary'))return '圣墓参观 · 门口骡马已备好';if(!s.thorn)return '可前往耶里哥营地与荒野';if(s.thorn===1)return '回营地 · 请波特编冠';if(s.thorn===2)return '营地工作桌 · 包好荆棘冠';if(!s.toasted)return '营地 · 打开香槟';if(!s.danced)return '营地 · 走近篝火';return '夜深了 · 到帐篷休息';}

export const scholarAvailable=s=>s.room!=='wild'||s.scholarInvited||s.dialogue==='treeScholar'||s.seen.includes('treeScholar')||s.thorn>0;
export function scholarPending(s){if(!scholarAvailable(s))return false;const groups={forecourt:['viaScholar','marketScholar'],holy:['guardScholar','holyScholar'],camp:['ruins','herod'],fatmeRoom:['fatmeScholar']};const ids=groups[s.room]||[s.room==='wild'&&!s.seen.includes('treeThought')?'crownScholar':scholarFor(s)];return ids.some(id=>!s.seen.includes(id));}
