import {parcelAppearance} from './parcel.js';
// VOY-*: original teaching dialogue (O), not quotations from the novel.
// Second narrative layer, pixel pilgrimage mode. Source boundary: design/第三章开场与登船教学_v0.1.md.
export const items=[
 {id:'mary-parcel',...parcelAppearance},
 {id:'ticket',name:'“马拉加”号船票',shortName:'船票',icon:'./assets/voyage/items/ticket.png',text:'里斯本 → 直布罗陀 → 马耳他 → 亚历山大港。登船凭证。这趟航行结束下船时收回。'},
];
export const conversations={
 flowers:[['特奥多里科','卖花姑娘面前摆着漂亮的紫罗兰。我停下来，细看这些小小的紫色花朵。']],
 palace:[['特奥多里科','这就是大首长宫。它的墙壁有一种军事建筑的威严，又带着修道院般的肃穆。'],['特奥多里科','我望着这些庄严的石砌墙面。托普修斯正是用他的阳伞，在这里认真地量墙。']],
 ropeSailing:[['特奥多里科','缆绳已经收好。我们确实出发了。']],
 seaSailing:[['特奥多里科','里斯本正在远去。眼前，是越来越宽阔的海。']],
 ticket:[['船员','这位先生，去亚历山大港？请让我看看您的船票。'],['特奥多里科','正是。行李也在这里，一件不少。'],['船员','“马拉加”号，没错。我们先经过直布罗陀，再去马耳他。您的船票已经验过了。'],['船员','沿舷梯上去就是甲板。开船前，您尽可以四处看看。']],
 sea:[['特奥多里科','从这里看去，里斯本已经像远处的一幅小画。'],['特奥多里科','姨姨大概正在为我的灵魂祈祷。我呢，眼下只想知道，这艘船的晚饭怎么样。']],
 rope:[['船员','缆绳还系着呢，先生。等大家都准备好了，我们就离港。'],['特奥多里科','我不着急。只要这根绳子最后会解开。']],
 cabin:[['特奥多里科','船舱就在这里。一路上若是有好饭菜、好天气，再碰见几个有趣的旅伴……'],['特奥多里科','这趟旅行，想必不会太难熬。']],
 sail:[['船员','我们就要离开里斯本了。'],['特奥多里科','都准备好了。启程吧！']],
};
export const spots={
 dock:[{id:'ticket',x:545,y:325,label:'出示船票'},{id:'board',x:650,y:350,label:'登上轮船'}],
 deck:[{id:'cabin',x:150,markerX:235,y:395,label:'看看船舱'},{id:'rope',x:610,y:380,label:'看看缆绳'},{id:'sea',x:905,y:370,label:'望向里斯本'},{id:'sail',x:1170,y:360,label:'准备启航'}],
};

export const textRecords=Object.entries(conversations).flatMap(([scene,lines])=>lines.map(([speaker,text],i)=>({id:`VOY-${scene.toUpperCase()}-${String(i+1).padStart(2,'0')}`,version:['ticket','sail'].includes(scene)?2:1,kind:['flowers','palace'].includes(scene)?'A':'O',sourcePage:['flowers','palace'].includes(scene)?'130':null,narrativeLayer:2,mode:'pixel-pilgrimage',speaker,text,status:'adaptation-draft'})));
