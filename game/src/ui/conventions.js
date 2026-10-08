// Runtime contract for every current and future chapter. See design/全游戏共享规范.md.
export const KEYS=Object.freeze({settings:'KeyP',settingsAlias:'F1',sound:'KeyM',back:'Escape',bag:'Tab',interact:'KeyE',scholar:'KeyR',confirm:'Space'});
export const LABELS=Object.freeze({settings:'设置',sound:'声音',bag:'背包',restartScene:'重新开始当前场景',restartChapter:'重新开始本章'});
export const CHARACTER_NAMES=Object.freeze({pinheiro:'皮涅罗神父',margaride:'马加里德博士',aunt:'姨姨',teo:'特奥多里科',child:'小特奥多里科',adelia:'阿德里娅'});
export const ITEM_NAMES=Object.freeze({straw:'麦秆'});
export const CARD_CONTROLS=Object.freeze({numeric:false,previous:'ArrowLeft',next:'ArrowRight',confirm:['Space','Enter']});
const aliases={'阿德里亚':'阿德里娅','阿德丽亚':'阿德里娅','阿德莉娅':'阿德里娅','皮涅罗':'皮涅罗神父','马加里德':'马加里德博士','特奥多里克':'特奥多里科'};
export const displayName=name=>aliases[name]||name||'';
export const SETTINGS_HELP='P 设置 · M 声音开关 · Esc 返回';
