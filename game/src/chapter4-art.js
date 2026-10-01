const path='./assets/chapter4-art-v01/';
const entries=[
 ['compare','首尾对照','同一帐篷，三次睁眼','第三章营地渐黑后，经鼾声与轻拍毯子的声音进入第四章。'],
 ['01-tent-night-embers','1 · 帐篷夜醒','1 · 托普修斯催促出发','p.177–179｜烛光、香槟瓶、陌生的白披风。'],
 ['02-city','2 · 城门','2 · 活着的耶路撒冷','p.179–191｜在人流中听到被捕消息；与第三章朝圣城市呼应。'],
 ['03-house','3 · 迦玛列宅邸','3 · 争论中的加德','p.191–203｜蓝墙会客厅；在这里先认识加德，再与他重逢。'],
 ['04-trial-integrated','4 · 审判回廊','4 · 审判与庭院中的人','p.203–225｜延续已认可的小样；补充审判人物的构图设计。'],
 ['06-garden','6a · 花园红门','6 · 在花园门口遇见加德','p.235–237｜麻布、香料篮与远处的刑场。'],
 ['06-calvary-low-crosses','6b · 髑髅地','6 · 山坡上的见闻','p.237–244｜约瑟、百夫长、母子与盲诗人，各自在场。'],
 ['09-courtyard','9 · 夜间庭院','9 · 提灯人的消息','p.252–255｜只呈现人物讲述，不把救治和移葬画成亲眼所见。'],
 ['10-plaza','10a · 离城','10 · 即将消散的广场','p.255｜托普修斯催促离开；石柱的消散留待动态层制作。'],
 ['10-tent-dawn','10b · 真正醒来','10 · 波特提着靴子进来','p.256｜另一张床上的托普修斯仍在打哈欠。'],
 ['gad-design','加德','加德 · 三种状态','白麻袍、结绳腰带、白手巾、短卷金发。'],
 ['house-cast','宅邸人物','迦玛列宅邸 · 人物设定','从左到右：迦玛列、玛拿西、奥萨尼亚、仆人。'],
 ['trial-cast','审判人物','审判回廊 · 新增人物','从左到右：耶稣、彼拉多、萨雷亚斯、翻译、罗班与孩子、书记。'],
 ['hill-cast','山坡与夜访人物','山坡与夜访 · 人物设定','从左到右：约瑟、百夫长、母子、盲诗人与孩子、提灯人。'],
 ['topsius-existing','托普修斯','托普修斯 · 沿用已确认形象','青年金发、金框眼镜；在左下方提供讲解。'],
 ['merchant-existing','无花果商贩','无花果商贩 · 沿用现有素材','同一人物只在点击后作一次小动作。'],
 ['elder-existing','拿因老人','拿因老人 · 沿用现有素材','石块是人物故事的一部分。'],
 ['workers-existing','修缮工人','两位修缮工人 · 沿用现有素材','保留用户认可的修柱改编，与周围成年人保持合理比例。']
];
const $=s=>document.querySelector(s);let current=0;
function show(index){current=index;const [id,,title,desc]=entries[index];$('#title').textContent=title;$('#desc').textContent=desc;$('#failure').hidden=true;$('#viewer').replaceChildren();$('#controls').replaceChildren();document.querySelectorAll('nav button').forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
 if(id==='compare'){const grid=document.createElement('div');grid.className='compare';for(const [key,label]of [['../jerusalem/camp-moon','第三章末尾 · 营地篝火晚宴'],['01-tent-night-embers','第四章开头 · 梦中被叫醒'],['10-tent-dawn','第四章结尾 · 清晨真正醒来']]){const f=document.createElement('figure'),a=document.createElement('a'),im=document.createElement('img'),cap=document.createElement('figcaption');a.href=im.src=path+key+'.webp';a.target='_blank';im.alt=label;im.onerror=()=>$('#failure').hidden=false;cap.textContent=label;a.append(im);f.append(a,cap);grid.append(f);}$('#viewer').append(grid);$('#note').textContent='当前衔接：营地晚宴 → 火灭、渐黑 → 鼾声 → 轻拍毯子 → 宗教画帐篷夜醒。第三章不插入像素帐内视角。章末以日光、波特手里的靴子和托普修斯的睡衣辨明现实。包裹不作必要线索。';}
 else{const im=document.createElement('img');im.className='art';im.src=path+id+'.webp';im.alt=title;im.onerror=()=>$('#failure').hidden=false;$('#viewer').append(im);const a=document.createElement('a');a.href=im.src;a.target='_blank';a.textContent='打开完整大图';$('#controls').append(a);$('#note').textContent='场景图用于确认构图与角色位置；新人物表用于确认身份与服装，尚未全部拆成透明动作层。宗教画表现的是小说中的梦境见闻，人物脸型与具体建筑属于改编设计。';}
 const prev=document.createElement('button'),next=document.createElement('button');prev.textContent='上一幅';next.textContent='下一幅';prev.onclick=()=>show((current+entries.length-1)%entries.length);next.onclick=()=>show((current+1)%entries.length);$('#controls').append(prev,next);history.replaceState(null,'','#'+id);
}
entries.forEach(([,label],i)=>{const b=document.createElement('button');b.textContent=label;b.onclick=()=>show(i);$('#nav').append(b);});const start=entries.findIndex(e=>e[0]===location.hash.slice(1));show(start<0?0:start);
