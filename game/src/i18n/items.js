import {isPortuguese} from './locale.js';
const parcel=['Embrulho de papel pardo','Um embrulho de papel pardo, atado com uma fita vermelha. Está fechado; não se vê o que contém.'];
const items={
 'mary-parcel':parcel,'thorn-parcel':parcel,'c5-returned-parcel':parcel,
 ticket:['Bilhete do “Málaga”','Lisboa → Gibraltar → Malta → Alexandria. O bilhete é necessário para embarcar e será recolhido no desembarque final.'],
 'relic-wood':['Aparas de madeira','Segundo o vendedor, foram aplainadas por São José. Comprei-as no adro do Santo Sepulcro para as levar à titi.'],
 'relic-straw':['Palha','Segundo o vendedor, é palha da manjedoura de Belém. Guardei-a para a levar à titi.'],
 'relic-beads':['Rosário de madeira','Um fio de contas de madeira, terminado numa pequena cruz.'],
 'thorn-branch':['Ramo de espinhos','Cortei-o no ermo, perto de Jericó. O doutor garantiu-me que foram ramos como este que feriram a fronte de Jesus Cristo.'],
 'thorn-crown':['Coroa de espinhos','Potte entrançou os ramos que cortei no ermo. Os espinhos duros sobressaem dos cruzamentos.']
};
export function localizedItem(item){const translated=isPortuguese&&items[item.id];return translated?{...item,name:translated[0],shortName:translated[0],text:translated[1]}:item;}
