// IN-CM 2021 printed pages; Chinese condensations are adaptations, Portuguese is excerpted.
const growthOriginal=[[
 {id:'GROW-01',page:85,image:'growth/school.webp',alt:'九岁的特奥多里科带着行李走入寄宿学校，克里斯平在门内迎接他',lines:['九岁时，姨姨把我送进了寄宿学校。','在那里，我与克里斯平亲近起来。'],original:'Apenas completei 9 anos, a titi […] colocou-me, como interno, no Colégio dos Isidoros […].'},
 {id:'GROW-02',page:88,image:'growth/seasons.webp',alt:'冬日火盆、春归燕子与红石竹、夏日海岸与葡萄围绕着渐渐长大的少年',lines:['冬日的火盆，春归的燕子与红石竹，夏天的海水浴和葡萄。','岁月就这样过去，我渐渐长大。'],original:'E os anos assim foram passando: […] depois chegavam as andorinhas […] depois era o tempo dos banhos de mar […].'}
],[
 {id:'GROW-03',page:88,image:'growth/coimbra.webp',alt:'卡西米罗神父陪伴年轻的特奥多里科前往科英布拉，书中夹着姨姨给他的祷文',lines:['后来，我去科英布拉继续求学。','姨姨给了我每天必须念的祷文，卡西米罗神父陪我前往。'],original:'O padre Casimiro foi-me levar à cidade graciosa onde dormita Minerva.'},
 {id:'GROW-04',dining:true,page:96,image:null,alt:'学成归来的青年特奥多里科与姨姨坐在里斯本家中的饭桌旁',lines:['学成后，我带着学位证书回到里斯本，住在姨姨家。','在她面前，我总显得十分虔诚。'],original:'Um dia enfim cheguei a Lisboa, com as minhas cartas de doutor metidas num canudo de lata.'}
]];
export const growthSpreads=[
 [{id:'ARR-MEMO-01',memory:true,page:84,image:'aunt-evening.webp',alt:'姨姨与两位神父的客厅成为本子左页的插画',lines:['“是的，姨姨。”'],original:'— Sim, titi.'},growthOriginal[0][0]],
 [growthOriginal[0][1],growthOriginal[1][0]],
 [growthOriginal[1][1],null]
];
export const growthCount=i=>growthSpreads[i].filter(Boolean).length;
export const growthAssets=['growth/school.webp','growth/seasons.webp','growth/coimbra.webp','writing-pen.webp','study-shelf.webp','departure.webp','aunt-evening.webp'];
