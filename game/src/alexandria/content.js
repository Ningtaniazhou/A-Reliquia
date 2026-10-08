// ALEX-*: Chinese adaptation of IN-CM 2021, printed pp.131–140.
// Dialogue is adapted, not a verbatim quotation. First-person Teodorico narration.
import {MARY_DEDICATION, MARY_SIGNATURE} from '../ui/mary-stationery.js';
const me='特奥多里科',owner='酒店老板',a='阿尔佩德里尼亚',m='玛丽',t='托普修斯';
export const dialogue={
 register:{page:'131–133',event:'register',rows:[[owner,'欢迎来到金字塔酒店。请在这本簿子上写下姓名和籍贯。'],[t,'托普修斯。来自德意志帝国。'],[me,'特奥多里科，来自海内海外皆有领土的葡萄牙。'],[a,'我也来自葡萄牙，是特兰科索镇的人。先生若有什么需要，叫阿尔佩德里尼亚就是了。'],[me,'一个同乡！我想找个地方祈祷……也想找一点爱情。'],[a,'沿街走，紫色木手下面就是玛丽小姐的手套与蜡花店。您就说，是金字塔酒店介绍来的。再往前，喷泉旁边便是教堂。'],[me,'我记住了。祈祷和爱情，原来离得这样近。']]},
 meet:{page:'133–134',event:'meet',rows:[[m,'先生想看看哪一种手套？'],[me,'我是阿尔佩德里尼亚介绍来的。'],[me,'她把报纸放下，膝上的白猫动了动。我只看见那双浅蓝眼睛，和一圈金色的卷发。'],[m,'那就把手给我，试试这一双。'],[me,'我的手交给了她，竟再也舍不得收回来。'],[m,'这朵玫瑰，也送给您。'],[me,'我原本还有一场祈祷要做……可那一刻，我把它忘得干干净净。']]},
 invite:{page:'135（邀请为连接改编）',event:'invite',rows:[[me,'玛丽，今晚能请你到金字塔酒店共进晚餐吗？'],[m,'好呀。我收好店里的东西，就过去。'],[me,'那么，我在餐厅等你。']]},
 maryWait:{page:'原创连接',rows:[[m,'我会去的。餐厅见。']]},
 dinner:{page:'135–136',event:'dinner',rows:[[m,'你不想去看看那些古迹吗？'],[me,'此刻，我只想坐在你身旁。那些石头尽可以再等一等。'],[t,'两位让我想起古代亚历山德里亚的宴游。沿河的宫殿、花园，还有丝绸篷下的游船……'],[m,'那样的地方，真想去看看。'],[me,'不带我去？'],[m,'没有你，我连天堂也不想去。'],[me,'我听得心满意足，连香槟的钱也付得格外痛快。']]},
 gift:{page:'138–140',event:'gift',rows:[[me,'那是玛丽的睡衣！蕾丝、浅色丝带，还有我熟悉的紫罗兰香气。'],[m,'送给你，特奥多里科。带着它，放在你身边，就像我还陪着你。'],[m,'等一等，我还要写一句话。'],[me,`她写给我：${MARY_DEDICATION}——${MARY_SIGNATURE}`],[me,'她拿起褐纸和红带，灵巧地把睡衣包了起来。我把包裹小心收进行囊。褐纸上，似乎还留着她的香气。']]},
 goodbye:{page:'140',event:'goodbye',rows:[[m,'到了耶路撒冷，要写信给我。'],[me,'玛丽，我会记着你。'],[me,'船快开了，我终究还是得走。'],[me,'我走出房门，竟像把心的一部分留在了那里。']]},
 churchBefore:{page:'原创连接',rows:[[me,'喷泉后就是教堂。姨姨要我一到埃及就祈祷；我还是先沿街走走吧。']]},
 church:{page:'133–134',rows:[[me,'喷泉后就是教堂。姨姨要我一到埃及就祈祷；我却总惦记着在手套店遇到的那位美丽女士。']]},
 port:{page:'原创连接',rows:[[me,'我的行李已经上岸。我先去金字塔酒店住下。']]},
 earlyLeave:{page:'原创连接',rows:[[me,'动身前，我得去向玛丽道别。']]},
 scholarBefore:{page:'133；问答为衔接改写',rows:[[me,'你准备到哪里去，托普修斯？'],[t,'找找托勒密时代留下的古物。特奥多里科先生，这座城还有许多值得仔细察看的石头。'],[me,'那你先去。我想先熟悉一下附近的街道。'],[me,'我可不急着陪他研究石头。我还有自己的事要办。']]},
 scholar:{page:'133、135；问答为衔接改写',rows:[[t,'特奥多里科先生，您还打算看看这座城的古迹吗？'],[me,'当然。不过今天，我另有安排。'],[t,'又是那间手套店？'],[me,'我在那里过得很愉快。那些古迹已经等了这么多年，再等一天又有什么关系？']]},
 porterJerusalem:{page:'136；移至大堂，末句心声原创',rows:[[me,'我接下来要去耶路撒冷。你知道那地方怎么样吗？'],[a,'先生，您该留在亚历山德里亚，舒舒服服地享享福……'],[me,'你去过耶路撒冷？'],[a,'没去过，先生。不过我知道……比咱们葡萄牙的布拉加还糟！'],[me,'岂有此理！'],[me,'他明明没去过，倒说得这样肯定。可我听了，还是更不想动身了。']]},
 porterPast:{page:'132；叙述转为问答',rows:[[me,'你一个特兰科索人，怎么会来到这里？'],[a,'母亲去世后，我继承了些田地，就去了里斯本。我那时只想着享福。'],[me,'后来呢？'],[a,'我认识了一个西班牙姑娘，叫杜尔塞，便跟她去了马德里。赌桌拿走了我的钱，她也离开了我。'],[me,'你就没有回葡萄牙？'],[a,'没有。我又去了别的地方。走来走去，如今就在这里替客人搬行李。']]},
 porterWork:{page:'132；叙述转为问答，末句心声原创',rows:[[me,'到这家酒店之前，你靠什么生活？'],[a,'我在罗马替教堂管过杂务，在雅典当过理发师。'],[me,'你倒是什么都会。'],[a,'在摩里亚，我还住过沼泽边的茅屋，靠捞水蛭吃饭。后来到了士麦那，就背着水囊沿街卖水。'],[me,'如今总算安顿下来了。'],[a,'是啊，先生。如今我在这里搬行李。'],[me,'捞水蛭、卖水、搬行李……这些活儿，我一样也没做过。']]},
 porterNews:{page:'132；感谢与末句心声原创',rows:[[a,'先生，您带了里斯本的报纸吗？我想知道国内的政局怎么样了。'],[me,'有几张，我拿来包靴子了。你若不嫌弃，就都拿去吧。'],[a,'不嫌弃，先生。能看看家乡的消息就好。'],[me,'几张包靴子的旧报纸，竟也让我做了回慷慨的同乡。']]},
};
// ALEX-OBS: original first-person observations; no new actions attributed to the novel.
Object.assign(dialogue,{
 checkInFirst:{page:'原创连接',rows:[[me,'我得先到前台登记入住。']]},
 ledger:{page:'原创物件观察',rows:[[me,'我的名字还留在这里，笔画铺得满满当当。紧挨着的托普修斯，却写得一丝不苟。我的籍贯写得比博士长得多。葡萄牙可不只是地图上那么一小块地方。']]},
 shopCard:{page:'原创物件观察；Miss Mary 称呼参照139页',kind:'O',rows:[[me,'玛丽小姐。店卡下方印着两个花体字母：M. M.']]},
 gloves:{page:'原创物件观察',rows:[[me,'一双双手套排列得整整齐齐。我原以为这不过是件小商品，走近了，却忍不住想象那双替我试戴的手。']]},
 cat:{page:'原创物件观察',rows:[[me,'白猫在柜台上蜷成一团，连眼睛也懒得睁。我倒羡慕它，能这样心安理得地留在这间小店里。']]},
 writing:{page:'原创物件观察',rows:[[me,'纸和笔都替我备好了。我原该给姨姨写封信，可一坐下来，心思便又飘到了别处。']]},
 restaurantMenu:{page:'原创菜单；虚构价格，非原作或历史价目',rows:[['餐厅菜单','金字塔酒店'],[me,'一瓶香槟竟抵得上十份烤肉！我暗暗心疼起来：不过几杯酒，竟要花这么多钱。']]},
 restaurantMenuMary:{page:'原创菜单；虚构价格，非原作或历史价目',rows:[['餐厅菜单','金字塔酒店'],[me,'一瓶香槟竟抵得上十份烤肉。可只要玛丽肯陪我坐着，我便付得痛快。钱算什么，今晚我只要她欢喜。']]}
});
export const interlude=[
 '为了留在玛丽身边，我放弃了开罗、尼罗河和狮身人面像。那些日子，她的一个微笑，就足以让我忘记远行。',
 '可是，姨姨吩咐的朝圣还等着我。为了她的遗产，我终究得离开玛丽，往耶路撒冷去。'
];
export const place={street:'亚历山德里亚 · 港口主街',lobby:'金字塔酒店 · 门厅',shop:'玛丽的手套与蜡花店',dining:'金字塔酒店 · 餐厅',room:'金字塔酒店 · 客房',interlude:'亚历山德里亚',outbound:'凯芒号 · 前往雅法'};
// Presentation is explicit: thought is not dialogue spoken to another character.
export const thoughts={register:[6],scholarBefore:[3],porterJerusalem:[5],porterWork:[6],porterNews:[3],meet:[2,4,6],dinner:[6],gift:[0,3,4],goodbye:[2,3],church:[0],churchBefore:[0],port:[0],earlyLeave:[0]};
Object.assign(thoughts,{checkInFirst:[0],ledger:[0],shopCard:[0],gloves:[0],cat:[0],writing:[0],restaurantMenu:[1],restaurantMenuMary:[1]});
export const interjections={register:[1],dinner:[2]};
export const isInterjection=(id,index)=>interjections[id]?.includes(index)||false;
export const inspectionIds=['ledger','shopCard','gloves','cat','writing','restaurantMenu','restaurantMenuMary','church','churchBefore'];
export const isInspection=id=>inspectionIds.includes(id);
export const isThought=(id,index)=>thoughts[id]?.includes(index)||false;
// These approved conversations mix source-based adaptation with original connective lines.
for(const id of ['scholarBefore','scholar','porterJerusalem','porterPast','porterWork','porterNews'])dialogue[id].kind='A+O';
export const records=Object.entries(dialogue).flatMap(([id,d])=>d.rows.map(([speaker,text],i)=>({id:`ALEX-${id}-${id==='register'?[1,2,4,5,9,10,11][i]:id==='gift'?[2,3,4,5,7][i]:i+1}`,version:id==='shopCard'||id==='gift'&&i===3?8:id==='porterWork'&&i===6?7:id==='ledger'?6:4,mode:isInspection(id)?'inspection':isThought(id,i)?'thought':isInterjection(id,i)?'interjection':'speech',kind:d.kind||(d.page.includes('原创')?'O':'A'),sourcePage:d.page,speaker,text}))); 

export const narrationRecords=interlude.map((text,i)=>({id:`ALEX-NAR-${i+1}`,version:1,kind:"A",sourcePage:"136–138",speaker:me,text}));

export const porterTopics=[['porterJerusalem','耶路撒冷怎么样？'],['porterPast','你怎么来到埃及的？'],['porterWork','这些年你都做过什么？'],['porterNews','家乡的消息']];

// Editorial revision 2026-10-07: departure prompt follows the current scene.
export const earlyLeaveText=stage=>({1:'先在城里逛逛，再想动身的事。',2:'我还想再去见见玛丽。',3:'我答应了玛丽，要和她一起吃晚饭。',4:'临走前，我还想去看看玛丽。',5:'动身前，我得去向玛丽道别。'}[stage]||'先办完这里的事，再动身。');
