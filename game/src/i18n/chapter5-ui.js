import {isPortuguese} from './locale.js';
import {tr} from './ui.js';
const copy={
 '褐纸包裹':'Embrulho de papel pardo','一个用褐纸包好、系着红带的包裹。纸包没有拆开，看不见里面的东西。':'Um embrulho de papel pardo, atado com uma fita vermelha. Está fechado; não se vê o que contém.',
 '第五章 · 耶里哥营地':'Capítulo V · Acampamento de Jericó','加利利 · 拿撒勒':'Galileia · Nazaré','耶路撒冷 · 旅馆客房':'Jerusalém · Quarto','归途 · 山路泉边':'Regresso · Fonte','里斯本 · 姨姨家':'Lisboa · Casa da titi',
 '查看早餐':'Examinar','与波特交谈':'Falar','查看火堆':'Examinar','眺望溪流':'Observar','查看帐篷':'Examinar','启程':'Partir',
 '与女子交谈':'Falar','眺望山下':'Observar','继续赶路':'Prosseguir','看看窗外':'Espreitar','收拾小圣物':'Guardar relíquias','装好荆棘冠':'Guardar a coroa','收拾衣物':'Arrumar a roupa','准备离开':'Sair',
 '查看泉水':'Examinar','与女人交谈':'Falar','把包裹给她':'Dar o embrulho','走近女人':'Aproximar-se',
 '骡马已经备好 · 可以启程':'As montadas estão prontas · Pode partir','清晨营地 · 与波特交谈':'Manhã no acampamento · Fale com Potte','走到高处，看看远方':'Suba para ver a paisagem',
 '两只箱子已经收好 · 准备离开':'A bagagem está pronta · Pode sair','把桌上的荆棘冠包裹装进木盒':'Guarde o embrulho da coroa na caixa','先收拾小圣物':'Arrume primeiro as pequenas relíquias','骑上骡马继续赶路':'Monte e prossiga a viagem','附近传来哭声':'Ouve-se chorar por perto',
 '圣物箱':'Baú das relíquias','荆棘冠木盒':'Caixa da coroa',
 '荆棘冠的包裹已经放进去了。蓝花布衬着盒壁，白棉花垫在下面，褐纸和红带都没有拆动。盒盖已经钉牢。':'O embrulho da coroa está na caixa, forrada de chita azul florida e acolchoada com algodão branco. O papel pardo e a fita vermelha ficaram intactos. A tampa está pregada.',
 '给姨姨带的小圣物都装在里面，彩纸和丝带裹得妥妥当当。箱外又加了铁皮，路上颠簸也不怕。':'As pequenas relíquias para a titi estão bem embrulhadas em papéis de cor e fitas. O baú foi reforçado com folha de ferro para resistir à viagem.',
 '声音与设置':'Som e definições','询问托普修斯 R':'Consultar Topsius R','托普修斯':'Topsius','返回':'Voltar','今早想吃些什么？':'O que deseja esta manhã?',
 '木薯羹，甜些、软些。':'Tapioca, bem doce e bem cozida.','一杯热咖啡。':'Uma chávena de café quente.','W / S 选择 · 空格确认 · Esc 返回':'W / S Escolher · Espaço Confirmar · Esc Voltar',
 '途中':'Em viagem','继续旁白':'Continuar a narração','继续 ›':'Continuar ›','未能载入下一处，点击重试':'Não foi possível carregar a próxima cena. Tente novamente.','重试':'Tentar novamente','浏览器未能保存本段进度。':'O navegador não conseguiu guardar o progresso.',
 'A / D 或方向键　行走':'A / D ou setas — Andar','E　靠近后交互':'E — Interagir quando estiver perto','A / D　对白上一页 / 下一页':'A / D — Página anterior / seguinte','空格　继续对白 / 确认选项':'Espaço — Continuar / confirmar',
 'D / 空格　读完后继续':'D / Espaço — Continuar a leitura','W / S　选择选项':'W / S — Escolher','R　询问托普修斯':'R — Consultar Topsius','Tab　背包':'Tab — Bagagem','Esc　返回 / 设置':'Esc — Voltar / definições','M　声音开关；P　设置':'M — Som; P — Definições',
 '，A D 行走，靠近后按 E 交互':'. A / D para andar; E para interagir quando estiver perto.',
 '清晨营地，靠近后点击动作按钮交互':'Acampamento de manhã. Aproxime-se e toque no botão da ação.',
 '圣遗物 · 第五章':'A Relíquia · Capítulo V'
};
export const trC5=text=>isPortuguese?(copy[text]??tr(text)):text;
// One-time localization of authored HTML, before handlers attach; never rewrites a live dialogue.
export function localizeChapter5HTML(){
 if(!isPortuguese)return;
 document.title=trC5(document.title);
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
 for(const node of nodes){if(node.parentElement?.closest('script,style'))continue;node.nodeValue=node.nodeValue.replace(/\S(?:[\s\S]*\S)?/,text=>trC5(text));}
 for(const node of document.querySelectorAll('[aria-label],[title],[alt]'))for(const key of ['aria-label','title','alt'])if(node.hasAttribute(key))node.setAttribute(key,trC5(node.getAttribute(key)));
}
export const bridgeTranslations={
 pilgrimage:['No dia seguinte, recolhemos as tendas e prosseguimos para a Galileia.\n\nBetel, o poço de Jacob, o Carmelo… Eu ouvia e bocejava. Em Nazaré, o doutor levou-me de novo a um lugar elevado.'],
 hotel:['No regresso de Nazaré a Jerusalém, apanhámos mais uma chuvada.\n\nMal abri a porta do quarto, passei a mão pela cama macia e abri o armário.'],
 spring:['A caixa de madeira seguiu com a bagagem, no animal de carga. Mas eu continuava com o embrulho que o criado me devolvera.\n\nPlaneava afastar-me dos outros e deitá-lo numa vala. Junto a uma fonte no caminho da serra, o cavalo do doutor desviou-se de repente e não houve maneira de o fazer avançar.'],
 return:['Retomámos o caminho. Atrás de nós, a mulher continuava a abençoar-nos. Em Jafa, despedi-me de Potte e embarquei com o doutor para o Egito.','No dia seguinte, em Alexandria, o doutor acompanhou-me ao navio para Portugal. Garantiu-me várias vezes que podia dizer à titi que aquela era a coroa original, sem lhe faltar um espinho.','Duas semanas depois, subi para uma carruagem em Lisboa, com a caixa nos braços. A porta da titi já se via ao fundo.']
};
