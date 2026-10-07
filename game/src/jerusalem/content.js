import {presentation} from './presentation.js';
import {chapterPlaces,chapterTopics,chapterDialogue,contextualTopics} from './chapter-content.js';
// IN-CM 2021, printed pages. A: adaptation, O: new connecting dialogue.
const T='特奥多里科',P='波特',S='托普修斯',C='旅馆前台';
const d=(source,kind,rows,event)=>({source,kind,rows,event});
export const places={street:'耶路撒冷 · 雨中城区',lobby:'地中海旅馆 · 大堂',room:'地中海旅馆 · 客房'};
export const arrival=[
 '船只抵达雅法。我在那里结识了波特——这一路前往圣地的向导。',
 '换乘骡车，离开海岸。果园渐渐退到身后，犹地亚的山岭在暮色里暗了下来。',
 '抵达耶路撒冷时，细雨正落在灰白的屋顶上。地中海旅馆，就在这条街的前面。'
];
export const letters=[
 '我最亲爱的姨姨：\n\n自从来到圣城，我越发觉得自己充满了德行。想必是主喜悦我这一趟朝圣，特意赐给我的恩惠。',
 '我日夜默想主的苦难，也日夜想着姨姨。这里每一块石头，都使我不忍用靴底去踩；每一次跪下祈祷，我总先求圣母保佑您的健康。',
 '我盼着找到一件非同寻常的圣物，治好您的一切病痛，也报答您赐给我的恩惠。只是现在还不能透露。\n\n请代我问候我们的朋友，尤其是虔诚的卡西米罗。',
 '请姨姨赐福给您忠实而思念您的外甥。\n\n特奥多里科\n\n附言：这里的人若想知道什么是德行，真应该先认识姨姨。'
];
export const topics={
 city:[['cityRain','这里一直这么冷清吗？'],['cityGuards','圣墓门口为什么会有守卫？']],
 potte:[['potteHome','你从哪里来？'],['potteTobacco','你的烟草很香。']]
};
export const dialogue={
 register:d('148–149','O',[[C,'欢迎。两位的房间已经收拾好了。从右边的门进去。'],[T,'先告诉我：屋里总不会也下雨吧？'],[C,'屋顶还撑得住，先生。还有，如果您有信要寄，我可以替您交给邮差。'],[T,'很好。我姨姨一定正等着我的消息。']], 'checkin'),
 frontAgain:d('148–149','O',[[C,'房间从右边进去。要寄信的话，把封好的信交给我就好。']]),
 checkFirst:d('148–149','O',[[T,'我得先向前台报个名字，总不能把每一扇门都当作自己的客房。']]),
 window:d('149–150','A',[[T,'这地方真糟糕，托普修斯！阿尔佩德里尼亚说得一点不错。连散步的去处、台球房、剧院都没有！'],[T,'我们的主，竟然住过这样的城市！'],[S,'是啊。不过在耶稣基督的时代，这里要有趣得多。'],[T,'我望着对面的绿百叶窗。博士说的热闹我看不见，倒只看见雨水不停地往下流。']], 'window'),
 deskBefore:d('162–163；前移写信时间','A',[[T,'该给姨姨写封信了。这里的雨、泥和无聊，就不必写给她看了。'],[T,'她想知道的，是我在圣地变得多么虔诚。']],'letter'),
 seal:d('162–163','O',[[T,'我把信折好，封起来。这几页纸上的耶路撒冷，比窗外那一座讨人喜欢多了。']],'seal'),
 send:d('162–163','O',[[C,'寄往里斯本？我替您交给邮差。'],[T,'有劳。请小心些，这里面全是我对姨姨的一片心。'],[C,'请放心，先生。'],[T,'信交给前台了。姨姨读了这些话，总该满意了。']],'send'),
 sentAgain:d('162–163','O',[[C,'您的信已经收下了，先生。我会按约交寄。']]),
 cityRain:d('149–150','A',[[T,'波特，这里就没有一点像样的消遣？'],[P,'您一路盼着到圣城，现在到了，倒先找起消遣来了。'],[T,'朝圣者也有两条腿，总不能整天跪着。'],[P,'先把湿衣裳晾一晾。等您想看圣迹，我给您说明白路怎么走。']]),
 cityGuards:d('153','A',[[T,'听说圣墓门口有带枪的守卫？'],[P,'有。您会看见他们坐在那里，喝咖啡、抽烟。'],[T,'守着这么神圣的地方，倒很懂得舒服。'],[P,'门里挤着来自各地的朝圣者，也有不同教派的人。维持秩序可不能只靠祈祷。']]),
 potteHome:d('147','A',[[T,'你是本地人？'],[P,'我叫保罗·波特，来自黑山。这一带海岸上的人，多半叫我“快乐的波特”。'],[T,'这名字倒不冤枉你。我还没见过谁的牙齿也这么高兴。'],[P,'既然路总得走，高兴一点也不多花一枚钱。']]),
 potteTobacco:d('147；159','A',[[P,'来一点？阿勒颇的烟草。'],[T,'这香气，总算比外头的雨水强。'],[P,'从雅法起您就赏识我的烟草。看来圣城还没让您戒掉享受。'],[T,'我的好波特，虔诚又不妨碍鼻子。']]),
 routeHoly:d('152–153；空间指示新增','A',[[P,'圣墓和苦路都得走远些。人们说，那条苦路就是耶稣被押往刑场走过的路。先安顿下来，再到街那头找骡马。'],[T,'好，能骑着去，总比冒雨走路强。']]),
 routeFatme:d('157–158；压缩到同街','A',[[P,'往右走，藤蔓下那扇小门，就是法特梅家。'],[T,'门小不要紧，里面有趣就行。'],[P,'您若想进去，我可以先替您向法特梅打声招呼。']]),
 routeWild:d('150；164；169','A',[[P,'耶里哥和荒野要离开圣城，另备行装。先看过圣墓，再商量那一程。']]),
 routeRoom:d('148–149','O',[[P,'前台右边的门通往客房。您想寄信，可以在房里的桌子上写。']]),
 gutter:d('149','A',[[T,'两道锌槽把屋上的雨水送下来。一道灌进巷子，一道照顾着卷心菜。圣城的水，分配得倒很周到。']]),
 garden:d('149','A',[[T,'低墙后面是一片卷心菜。泥土软得发亮，驴叫从那一头传来。我来朝圣，先遇见的倒是一座菜园。']]),
 shutters:d('149','A',[[T,'绿百叶窗关得严严实实。我在外面站了一会儿，没听见里面有什么动静。']]),
 roofs:d('149','A',[[T,'露台屋顶一片泥灰，晾衣杆还竖着。这天气，衣裳是晒不干了；或许挂在上面也算一种修行。']]),
 fatme:d('158','A',[[T,'藤蔓下的小门漏出一点暖光。波特说过法特梅这个名字。我先记住这扇门，回头向他问个清楚。']]),
 mule:d('147；区域交通为新增','A',[[T,'骡马在檐下歇脚。雅法来的泥还粘在鞍袋上；它们比我更有耐性，也不抱怨圣城没有台球房。']]),
 arch:d('149；空间连接新增','O',[[T,'石拱后面的小巷一层层向上。雨把远处的人影洗成了灰色。我先记住来路，免得连旅馆都找不回去。']]),
 friar:d('149；路人问答新增','O',[[T,'请问，地中海旅馆往哪边走？'],['撑伞的修士','沿街往右，找那扇点着灯的大拱门。小心排水槽。'],[T,'多谢。我已经领教过它了。']]),
 traveller:d('149；路人问答新增','O',[[T,'这雨还要下多久？'],['裹着斗篷的旅人','我知道哪里可以避雨，可不知道天什么时候放晴。'],[T,'这两个问题，我倒宁愿您知道后一个。']]),
 wardrobe:d('149；虚拟背包规则','A',[[T,'桃花心木的衣柜，总算有一点文明的气息。就把玛丽的包裹放在这里吧。临走时，她还叫我到了耶路撒冷给她写信。']]),
 wallpaper:d('148–149','A',[[T,'薄薄的隔墙上，蓝色枝蔓从纸里爬出来。外面的草木都浸透了，只有这些枝叶永不受雨。']]),
 scholar:d('149–150','A',[[S,'你已经到了耶路撒冷，特奥多里科。'],[T,'我知道，博士。我只想先换掉这身湿衣服。'],[S,'不妨先看看窗外。眼前这座城，和你一路想象的未必相同。']]),
 scholarSeen:d('149–150','A',[[T,'你说，在耶稣基督的时代，这里要有趣得多？'],[S,'是的。'],[T,'我又看了一眼窗外。可我眼前还是这些湿漉漉的屋顶。博士所说的热闹，我一点也看不出来。']])
};
Object.assign(places,chapterPlaces);
Object.assign(dialogue,chapterDialogue);
for(const group of ['city','potte'])topics[group].push(...chapterTopics[group]);
export const topicIds=[...Object.values(topics).flat().map(([id])=>id),...Object.values(contextualTopics).flat()];

// Observation metadata is retained for source records; presentation.js distinguishes inner thoughts from unlabelled descriptions.
for(const id of ['gutter','garden','shutters','roofs','fatme','mule','arch','wardrobe','wallpaper'])dialogue[id].presentation='inspection';

// Keep IDs and saved cursors stable while the portrait responds to witnessed events.
const fatmeEarly=[
 ['要先问问法特梅吗？','当然。总不能站在门口就回去。'],
 ['你还要在这里等吗？','既然来了，先看看她介绍的姑娘再说。']
];
export function dialogueRow(id,index,state){
 const row=dialogue[id].rows[index];
 if(id==='routeFatme'&&index===2&&state.arranged)return [row[0],'我已经替您打过招呼，直接过去就好。'];
 if(id==='fatmeScholar'&&state.fatmeStage<2)return [row[0],fatmeEarly[state.fatmeStage||0][index]];
 return row;
}

// v06 approved Chinese rewrites are adaptations, not newly authenticated quotations.
const revisedRows={routeFatme:[2],fatmeArrange:[2],fatmeComplaint:[1],potteCaravan:[2],viaScholar:[2],marketScholar:[1],holyScholar:[0,2],takeWood:[1],cut:[2],pack:[2],treeAfter:[0],tableAfter:[0],fire:[2],scholarSeen:[2]};
const revisedRowsV7={fatmeComplaint:[3],fatmeRefusal:[5],fatmeOffer:[3,4],fatmeScholar:[0,1],herod:[2,3,4],takeWood:[0],takeStraw:[0],takeBeads:[0],wardrobe:[0],shutters:[0],tree:[0],treeThought:[4]};
export const textRecords=Object.entries(dialogue).flatMap(([id,d])=>d.rows.map(([speaker,text],i)=>({id:`J34-${id.toUpperCase()}-${String(i+1).padStart(2,'0')}`,version:id==='wardrobe'?8:revisedRowsV7[id]?.includes(i)?7:revisedRows[id]?.includes(i)?6:5,mode:presentation(id,d,i).thought?'thought':presentation(id,d,i).label?'speech':'description',kind:revisedRowsV7[id]?.includes(i)||revisedRows[id]?.includes(i)?'A+O':d.kind,source:d.source,edition:'IN-CM 2021',speaker,text})));

textRecords.push({...textRecords.find(r=>r.id==='J34-ROUTEFATME-03'),id:'J34-ROUTEFATME-03-ARRANGED',condition:'arranged',text:dialogueRow('routeFatme',2,{arranged:true})[1]});

for(let stage=0;stage<2;stage++)for(let index=0;index<2;index++){const row=dialogueRow('fatmeScholar',index,{fatmeStage:stage});textRecords.push({id:`J34-FATMESCHOLAR-${String(index+1).padStart(2,'0')}-STAGE${stage}`,version:7,mode:'speech',kind:'O',source:'改编连接；原场景159–160页',edition:'IN-CM 2021',condition:`fatmeStage=${stage}`,speaker:row[0],text:row[1]});}
