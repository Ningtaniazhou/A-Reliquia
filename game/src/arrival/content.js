// REL-INCM-2021; quotations checked against printed pp. 83–85, identities p.87.
// Doorway meeting and brief aureole are user-approved visual adaptations.
export const arrivalLines=[
 {id:'ARR-01',page:83,speaker:'马蒂亚斯',scene:'doorway',kind:'quotation',zh:'这就是姨姨。你得很爱很爱姨姨……姨姨说什么，你都得说“是”！',pt:'Esta é a titi. É necessário gostar muito da titi… É necessário dizer sempre que sim à titi!'},
 {id:'ARR-02',page:83,speaker:'姨姨',scene:'doorway',kind:'quotation',zh:'天哪，维森西娅！太可怕了！我看他们给他的头发抹了橄榄油！',pt:'Credo, Vicência! Que horror! Acho que lhe puseram azeite no cabelo!'},
 {id:'ARR-03',page:83,speaker:'小特奥多里科',scene:'doorway',kind:'quotation',zh:'是的，姨姨。',pt:'Sim, titi.'},
 {id:'ARR-04',page:'83–84',speaker:'姨姨',scene:'doorway',kind:'excerpt',zh:'去吧，维森西娅，把他带进去……擦掉他眼角的污垢，看看他会不会画十字……',pt:'Vá, Vicência, leve-o lá para dentro… lave-lhe essa ramela, veja se ele sabe fazer o sinal da cruz…'},
 {id:'ARR-BRIDGE',page:84,speaker:'特奥多里科 · 回忆',scene:'narration',kind:'adapted narration',zh:'马蒂亚斯先生亲了我两下，维森西娅便把我带到厨房。到了晚上，他们给我穿上绒布衣服。她换了洗净的围裙，神情严肃地牵着我的手，把我带进客厅。姨姨和两位神父正在那里。',pt:'O Sr. Matias deu-me dois beijos repenicados. A Vicência levou-me para a cozinha. À noite vestiram-me o meu fato de veludilho; e a Vicência, séria, de avental lavado, trouxe-me pela mão a uma sala […]'},
 {id:'ARR-05',page:84,speaker:'皮涅罗神父',scene:'evening',kind:'quotation fragment',zh:'晚上好。',pt:'Boas-noites.'},
 {id:'ARR-06a',page:84,speaker:'皮涅罗神父',scene:'evening',kind:'adapted dialogue',zh:'你叫什么名字？',pt:'Como te chamas?'},
 {id:'ARR-06b',page:84,speaker:'小特奥多里科',scene:'evening',kind:'adapted dialogue',zh:'特德里科。',pt:'Tedrico.'},
 {id:'ARR-06c',page:84,speaker:'卡西米罗神父',scene:'evening',kind:'adapted dialogue',zh:'慢慢来，把音节分开：特—奥—多—里—科。',pt:'Devagar, separa as sílabas: Te-o-do-ri-co.'},
 {id:'ARR-07',page:84,speaker:'卡西米罗神父',scene:'evening',kind:'quotation',zh:'特奥多里科除了姨姨，再没有别的人了……姨姨说什么，你都得说“是”……',pt:'O Teodorico não tem ninguém senão a titi… É necessário dizer sempre que sim à titi…'},
 {id:'ARR-08',page:84,speaker:'小特奥多里科',scene:'evening',kind:'quotation',zh:'是的，姨姨。',pt:'Sim, titi.'},
 {id:'ARR-09',page:84,speaker:'姨姨',scene:'evening',kind:'quotation',zh:'经过那间亮着灯、挂着绿帘子的祈祷室时，要跪下来，画个十字……',pt:'E quando passar pelo oratório, onde está a luz e a cortina verde, ajoelhe, faça o seu sinalzinho da cruz…'}
];

export const arrivalPeople={'马蒂亚斯':'matias','姨姨':'aunt','小特奥多里科':'child','皮涅罗神父':'pinheiro','卡西米罗神父':'casimiro'};
export const arrivalAssets=['chapter6/v02/doorway-v2.webp','aunt-evening.webp','arrival/portraits.webp','boss/aunt.webp','departure/portraits.webp'];
export const legacyArrivalIds=['ARR-01','ARR-02','ARR-03','ARR-04','ARR-05','ARR-06a','ARR-07','ARR-08','ARR-09'];

export const arrivalV2Ids=arrivalLines.filter(l=>l.id!=='ARR-BRIDGE').map(l=>l.id);
