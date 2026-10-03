import {parcelAppearance} from '../voyage/parcel.js';
// C5-J IDs are stable. A = adaptation, O = original connective writing; printed IN-CM 2021 pages.
const T='特奥多里科',P='波特',S='托普修斯';
const group=(id,page,lines)=>lines.map(([who,text,type='A',thought=false],i)=>({id:`C5-J-${id}-${i+1}`,who,text,type,thought,source:`IN-CM 2021, pp.${page}`}));
export const journey={
 nazarethIntro:group('nazareth-in','258–259',[[T,'终于到拿撒勒了。靴子里又进了沙。','O',true]]),
 nazarethPotte:group('nazareth-potte','258',[[T,'波特，你倒一点也不累。','O'],[P,'有这么漂亮的姑娘，谁还顾得上累呢？','O'],[T,'还没看够吗，波特？我只盼着早些上船，回里斯本去。','O']]),
 waterWoman:group('water-woman','258',[['汲水女子','先生，请让一让。我要去泉边。','O'],[T,'她垂下眼睛笑了笑。我连一句讨好的话也懒得说。','A',true],[T,'又是泉水，又是石头。到底还要在这里耽搁多久？我只想回里斯本。','O',true]]),
 // Retained only to resume an older interrupted save; no shared NPC hotspot.
 waterCarriers:group('water-carriers','258',[[T,'一个姑娘扶着肩上的红陶水罐，沿着树下的小路往泉边走。','A',true],[P,'姑娘，你一过来，我们赶路的疲倦都没了！','O'],['','她垂下眼睛笑了笑。波特捻着胡子，又凑过去说了几句。','A'],[T,'哼，搔首弄姿。波特倒还有这样的精神。','A',true]]),
 overlook:group('look','258–259',[[S,'从这里望过去，是以斯德拉伦平原。再远些，那是迦密山。'],[T,'风景倒不错。'],[T,'博士的手指还在远处转。我已经打了第三个哈欠。','A',true]]),
 nazarethScholar:group('nazareth-scholar','257–259',[[S,'我们经过了雅各井，也到过革尼撒勒湖。你似乎一路都没什么精神。','A'],[T,'这些天走得够多了，博士。我的脚可没有睡过。','O']]),
 hotelIntro:group('hotel-in','260–262',[[T,'床还是这么软。总算不用再睡帐篷了。','A',true],[P,'先生，荆棘冠的包裹也给您带回来了。','A'],[T,'好波特！这一包带回去，姨姨可要乐坏了。','A']]),
 hotelNews:group('hotel-news','260–261',[[P,'还有件新鲜事！希律门附近开了家咖啡馆，叫西奈休憩所。里面有台球桌！','A'],[T,'台球桌？好极了！有吃的，有台球——我早就盼着好好享受一下了！','A'],[T,'把荆棘冠的包裹放在桌上吧，好波特。晚饭后，咱们就去！','A']]),
 hotelAntiquity:group('hotel-antiquity','261',[[S,'特奥多里科！我们离开的这几天，挖出了一块圣殿的石碑！上面刻着禁止异教徒入内的铭文。饭后我们就去看看！','A'],[T,'那座门……绿色的大理石台阶，忽然又在我眼前闪了一下。','A',true],[T,'不去！博士，我受够了。从今天起，我一块石头也不看了，一处宗教遗迹也不去了！','A'],['','博士走开了。接下来的几天，我忙着核对、整理带给姨姨的圣物。波特也把装箱用的东西备齐了。','A']]),
 window:group('window','259–260',[[T,'又是这扇窗，这些墙，这间软和的客房。我伸手摸了摸床，总算不用再睡帐篷。','A',true]]),
 wardrobe:group('wardrobe','260；265',[[T,'衬衣、袜子，都得收好。路上淋湿的衣服也该干了。','A',true]]),
 packSmall:group('pack-small','261',[[T,'先收这些小圣物。木片、麦秆、念珠，还有约旦河水。','A'],[T,'我把小件分别裹上彩纸，再扎好丝带。','A',true],[T,'把包好的小件一件件放进箱子。外面又加了铁皮，这一路颠簸，可别碰坏了。','A',true],[T,'大箱子盖好了。桌上那包荆棘冠，还得另装。','O',true]]),
 smallPacked:group('small-packed','261',[[T,'小圣物都收在大箱子里了，铁皮也加固好了。','A',true]]),
 pack:group('pack','261–262',[[T,'现在装荆棘冠。这只木盒，正好放得下。'],[T,'我打开木盒，沿着盒壁铺好蓝花布，再用白棉花垫软盒底。','A',true],[T,'纸上的折痕，红带上的结，都原样留着。姨姨若知道它们是在圣地包好的，一定更喜欢。'],[T,'我没有打开包裹，把它整个放了进去。','A',true],[T,'博士，我能告诉姨姨，这就是耶稣基督戴过的那顶荆棘冠吗？'],[S,'圣物的价值，不在于它们有多真实，而在于它们能激起怎样的信仰。你可以这样告诉姨姨。'],[T,'好极了，博士！'],[T,'我盖好木盒，钉牢了盒盖。','A',true]]),
 hotelScholar:group('hotel-scholar','261–262',[[S,'箱子用黎巴嫩的雪松，倒很合适。'],[T,'波特还提议用受过祝福的佛兰德松木。连钉子的来历，我都想好怎样告诉姨姨了。']]),
 packed:group('packed','262',[[T,'箱盖已经钉牢。姨姨，这回可有好东西给您看了。','A',true]]),
 returned:group('returned','265–266', [['旅馆仆人','先生！还有一个包裹！'],['旅馆仆人','收拾房间时，在桌子后面找到的。上面都是灰，我已经替您擦干净了。'],[T,'褐纸，红带。玛丽的睡衣！这才想起来，收行李时，衣柜里确实没有它。','A',true],[T,'好，拿着这些。'],[T,'我把口袋里的铜钱给了他，接过包裹。','A',true],[T,'姨姨连我的信和衬裤都要翻。这东西可不能带进她家。','A',true]]),
 springIntro:group('spring-in','266–267',[[T,'博士的马偏要喝水，我们只好停下来。','A',true],[T,'这地方倒很僻静。找个沟，把那包东西丢下去……','A',true],[T,'咦？石头后面，好像有人在哭。','A',true]]),
 water:group('water','267',[[T,'水从石槽里细细地流出来。马还在喝，连头也不肯抬。','A',true]]),
 woman:group('woman','267–268',[[T,'波特，过来！问问她，出了什么事？'],['女人','房子……烧了。那些骑兵过去以后……','A'],[P,'她说家烧了。孩子还小，她已经没有奶水。'],[T,'她把孩子贴在脸上，头发垂下来，哭得说不出话。','A',true],[P,'拿着。'],[T,'波特给了她一枚银币。博士掏出本子，记下了几行。','A',true],[T,'我摸了摸口袋。铜钱刚才全给旅馆的仆人了。','A',true],[T,'等等，我手里还有这一包……','A',true]]),
 give:group('give','268',[[T,'波特，把这包东西给她。告诉她，里面的衣服可以卖钱。'],[P,'拿到大卫塔附近去。法特梅，或那位撒玛利亚的帕尔米拉，会肯出钱的。'],[T,'我递出包裹。她一只手搂着孩子，一只手把它接了过去。','O',true],['女人','愿上天保佑你们……保佑你们……','A'],[T,'她把包裹拢在怀里，又低头亲了亲孩子。','O',true]]),
 womanAfter:group('woman-after','268', [['女人','愿上天保佑你们……','A']]),
 springScholar:group('spring-scholar','267',[[S,'我把她的话记下了。回去讲到这里的境况时，这件事不能略过。','A'],[T,'孩子一直没有醒。','O']]),
 lisbon:group('lisbon','275–276',[[T,'里斯本！我抱紧木箱，望见姨姨家的门。','A',true],[T,'姨姨，我回来了！','O']])
};
export const bridges={
 pilgrimage:{to:'nazareth',source:'IN-CM 2021, pp.257–259',type:'A',sound:'horse',text:'第二天，我们收起帐篷，继续往加利利去。\n\n伯特利、雅各井、迦密山……我一路听，一路打哈欠。到了拿撒勒，博士又领着我往高处走。'},
 hotel:{to:'hotel',source:'IN-CM 2021, pp.259–262',type:'A',sound:'horse',text:'从拿撒勒折回耶路撒冷，路上又淋了一场雨。\n\n推开旅馆客房的门，我先摸了摸那张软床，又打开了衣柜。'},
 spring:{to:'spring',source:'IN-CM 2021, pp.265–267',type:'A',sound:'horse',text:'木箱随行李上了驮马。仆人送回的包裹，却还在我手里。\n\n我盘算着，等离开大家的视线，就找条沟把它扔掉。走到山路上的泉边，博士的马忽然拐过去，怎么拉也不肯走。'},
 return:{to:'lisbon',source:'IN-CM 2021, pp.268–276',type:'A',sound:'sea',text:'我们回到路上。身后，那女人还在祝福我们。\n\n到了雅法，我和波特告别，随博士乘船回埃及。次日，在亚历山德里亚，博士送我上了回葡萄牙的船。他再三保证：可以告诉姨姨，那就是原来的荆棘冠，一根刺也不差。\n\n两周后，我抱着木箱，坐上里斯本的马车。姨姨家的门，已经在前面了。'}
};
export const bridgeDuration=id=>Math.max(4,1.5+bridges[id].text.replace(/\s/g,'').length/9);
export const newItems=[
 {id:'c5-relic-box',name:'荆棘冠木盒',shortName:'荆棘冠木盒',icon:'./assets/chapter5/packing-v02/box-closed.webp',text:'荆棘冠的包裹已经放进去了。蓝花布衬着盒壁，白棉花垫在下面，褐纸和红带都没有拆动。盒盖已经钉牢。'},
 {id:'c5-returned-parcel',...parcelAppearance},
 {id:'c5-small-crate',name:'圣物箱',shortName:'圣物箱',icon:'./assets/chapter5/packing-v01/crate-closed.webp',text:'给姨姨带的小圣物都装在里面，彩纸和丝带裹得妥妥当当。箱外又加了铁皮，路上颠簸也不怕。'}
];
