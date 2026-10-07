// REL-INCM-2021, printed pages verified against the source PDF.
// Props' placement and the ring as an entry point are the user's adaptation.
export const studyItems=[
 {id:'ring',title:'手上的戒指',textId:'STUDY-T01',page:'309',x:68.5,y:41,scale:6,
  zh:'我结婚了。我做了父亲。我有了自己的马车……',
  pt:'Casei. Sou pai. Tenho carruagem […]',
  note:'我的妻子热苏伊娜，是我少年同窗克里斯平的姐妹。',noteType:'source-based summary, pp. 306, 308–309'},
 {id:'medal',title:'基督勋章',textId:'STUDY-T02',version:2,page:'309',x:69,y:61,scale:5,
  zh:'我受到邻里的敬重，还获得了基督勋章——一项体面的荣誉。',
  pt:'Tenho carruagem, a consideração do meu bairro, a Comenda de Cristo.'},
 {id:'deed',title:'莫斯泰罗庄园的契据',textId:'STUDY-T03',page:'310',x:22,y:81,scale:4,
  zh:'我签下了那份契据；经历了那么多希望与失落，我终于成了莫斯泰罗庄园的主人。',
  pt:'[…] assinei […] a escritura que me tornava enfim, depois de tantas esperanças e de tantos desalentos, o senhor do Mosteiro!',
  note:'窗外的树，也曾为我的父母遮过荫。',noteType:'source-based summary, p. 309'},
 {id:'books',title:'托普修斯的旅行著作',textId:'STUDY-T04',page:'77',x:52.5,y:16,scale:6,
  zh:'他总称我为“显赫的葡萄牙贵族”。',
  pt:'Denomina-me sempre o ilustre fidalgo lusitano […].',
  secondZh:'托普修斯还借我之名，把虚构的言论和判断塞进我的嘴里、安进我的脑袋……',
  secondPt:'[…] Topsius aproveita-me […] para pendurar ficticiamente, nos meus lábios e no meu crânio, dizeres e juízos […]',
  note:'这是托普修斯写到我的那套《耶路撒冷游历与评述》，一共七卷。',noteType:'translated title and edition detail, p. 77'}
];
export const studyIds=studyItems.map(item=>item.id);
export const studyComplete=s=>studyIds.every(id=>s.studied?.includes(id));
