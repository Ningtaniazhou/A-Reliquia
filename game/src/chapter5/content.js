// IN-CM 2021 p.256; Chinese adaptation A, user-approved connecting dialogue O.
const row=(id,who,text,type='A',thought=false)=>({id,who,text,type,thought,source:'IN-CM 2021, p.256'});
export const opening=[row('C5-wake-1','','阳光照着帐篷口。溪流旁，昨夜的火堆只剩下灰白的木炭。','O')];
export const breakfast=[row('C5-potte-1','波特','可算起来了！靴子给您拿来了。'),row('C5-potte-2','波特','今早想吃木薯羹，还是喝咖啡？')];
export const meals={tapioca:[row('C5-meal-tapioca-1','特奥多里科','木薯羹，波特！煮得甜些，软些，让我尝尝葡萄牙的滋味！'),row('C5-meal-tapioca-2','波特','好，我去看看锅。您先坐一会儿。','O')],coffee:[row('C5-meal-coffee-1','特奥多里科','咖啡吧，波特。热热的一杯。','O'),row('C5-meal-coffee-2','波特','已经煮上了。马上给您倒。','O')]};
export const scholar=[row('C5-scholar-1','','托普修斯扶好金框眼镜，又打了一个哈欠。'),row('C5-scholar-2','特奥多里科','博士，你也才醒？','O'),row('C5-scholar-3','托普修斯','是啊。昨晚喝了酒，一躺下就睡着了。','O'),row('C5-scholar-4','特奥多里科','你夜里没有叫过我？说马已经备好了，要去耶路撒冷……','O'),row('C5-scholar-5','托普修斯','没有啊，拉波索。我一夜都在床上。波特刚刚才把我叫起来。','O'),row('C5-scholar-6','特奥多里科','可我记得那身白披风，城门，还有加德……','O',true),row('C5-scholar-7','','营地里响起碗勺相碰的声音。我慢慢松了一口气。','O')];
export const bottles=[row('C5-bottles-1','','桌上还放着昨晚喝过的香槟瓶。我们用它们敬过科学，也敬过宗教。'),row('C5-bottles-2','特奥多里科','昨晚就是在这儿喝的酒。连杯子也没收走。','O',true)];

// Original environmental observations; not quotations from the novel.
export const scenery={
 'breakfast-table':[row('C5-table-1','','咖啡壶已经架好，炊事的人正在准备早餐。','O')],
 fire:[row('C5-fire-1','','火堆里只剩下炭灰。昨夜，人们在这里喝酒、看舞。','O')],
 stream:[row('C5-stream-1','','溪水仍从营地旁流过，远处的遗迹映在清晨的日光中。','O')],
 tent:[row('C5-tent-1','','毯子还没叠起。波特刚从帐篷里把靴子拿出来。','O')]
};
