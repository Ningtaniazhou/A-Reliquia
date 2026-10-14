import {isPortuguese} from './locale.js';
const people={
 teo:['特奥多里科','Teodorico'],child:['小特奥多里科','Teodorico'],aunt:['姨姨','Titi'],topsius:['托普修斯','Topsius'],potte:['波特','Potte'],
 pinheiro:['皮涅罗神父','Padre Pinheiro'],margaride:['马加里德博士','Dr. Margaride'],casimiro:['卡西米罗神父','Padre Casimiro'],
 matias:['马蒂亚斯','Sr. Matias'],adelia:['阿德里娅','Adélia'],mary:['玛丽','Mary'],vicencia:['维森西娅','Vicência'],
 waterWoman:['汲水女子','Rapariga'],woman:['女人','Mulher'],servant:['旅馆仆人','Criado'],
};
const aliases=Object.fromEntries(Object.entries(people).flatMap(([id,names])=>[[id,id],[names[0],id]]));
Object.assign(aliases,{'阿德里亚':'adelia','阿德莉娅':'adelia','皮涅罗':'pinheiro','马加里德':'margaride','特奥多里克':'teo'});
export const characterId=value=>aliases[value]||value||'';
export const characterName=id=>people[characterId(id)]?.[isPortuguese?1:0]||id||'';
// Portrait lookup uses authored identities even when a label is in Portuguese.
export function originalCharacterName(name){
 const entry=Object.entries(people).find(([id,names])=>id!=='child'&&names[1]===name);
 return entry?entry[1][0]:name;
}
