// One-shot, dialogue-line cues. Different local crops may share one scene-matched frame.
export const actions={
 tent:{asset:'tent',box:[.035,.13,.345,.77]},house:{asset:'house',box:[.151,.32,.173,.45]},garden:{asset:'garden',box:[.478,.12,.224,.74]},trial:{asset:'trial',box:[.312,.47,.073,.285]},hill:{asset:'hill',box:[.15,.27,.131,.46]},night:{asset:'night',box:[.611,.13,.256,.80]},dawn:{asset:'dawn',box:[.51,.10,.185,.70]},
 boyReceive:{asset:'hill-receive-v02',box:[.338,.64,.095,.29],hold:3,sfx:'coin'},
 boyPocket:{asset:'hill-pocket-v02',box:[.236,.545,.199,.40],hold:3.2},
 bardSpeak:{asset:'hill-pocket-v02',box:[.273,.55,.058,.092],hold:3},
 motherLift:{asset:'hill-receive-v02',box:[.750,.438,.087,.41],hold:3.5},
 hostFruit:{asset:'house-gestures-v02',box:[.292,.103,.194,.691],hold:3},
 swordGrip:{asset:'house-gestures-v02',box:[.775,.085,.167,.76],hold:3.5},
 cloakGrip:{asset:'house-gestures-v02',box:[.583,.316,.211,.392],hold:3},
 servantReport:{asset:'house-gestures-v02',box:[.502,.238,.094,.42],hold:3},
 elderStone:{asset:'trial-gestures-v02',box:[.611,.473,.085,.298],hold:3.2},
 workerHammer:{asset:'trial-gestures-v02',box:[.732,.627,.144,.296],clip:'polygon(74.3% 90%,74.6% 83%,76.3% 77%,77.4% 70.6%,79% 66.3%,82.7% 66.3%,83.9% 63.5%,86.2% 63.5%,87% 75%,87% 87.5%,84.7% 90.8%)',hold:.7,sfx:'hammer',sfxAt:.7},
 gadAppeal:{asset:'trial-gestures-v02',box:[.410,.449,.106,.320],hold:3},
 robamChild:{asset:'trial-gestures-v02',box:[.704,.415,.108,.369],clip:'polygon(70.4% 41.5%,78.3% 41.5%,79.5% 53%,80.8% 57.4%,80.8% 69.5%,79.2% 74%,77.5% 75%,76% 78.2%,70.4% 78.2%)',hold:3},
 passerNews:{asset:'city-news-v02',box:[.285,.436,.135,.453],hold:3}
};
export const lineActions={
 'C4-city-news-1':'passerNews',
 'C4-house-gamaliel-2':'hostFruit','C4-house-manasses-2':'swordGrip','C4-house-osanias-2':'cloakGrip','C4-house-gad-1':'house','C4-house-servant-1':'servantReport',
 'C4-trial-figs-2':'trial','C4-trial-elder-1':'elderStone','C4-trial-workers-1':'workerHammer','C4-trial-gad-1':'gadAppeal','C4-trial-robam-1':'robamChild',
 'C4-garden-gad-2':'garden','C4-hill-joseph-2':'hill','C4-hill-mother-2':'motherLift','C4-hill-bard-2':'bardSpeak','C4-hill-bard-3':'boyReceive','C4-hill-bard-4':'boyPocket',
 'C4-night-messenger-1':'night','C4-dawn-potte-1':'dawn'
};
export const lineSounds={'C4-trial-elder-6':'coin','C4-trial-figs-6':'basketCoin'};
export const journeys={tent:{sound:'horse',black:2.3},city:{sound:'steps',black:1.9},house:{sound:'steps',black:1.9},trial:{sound:'steps',black:2.1},garden:{sound:'steps',black:1.9},hill:{sound:'steps',black:2.2},night:{sound:'steps',black:1.9},plaza:{sound:'horse',black:2.5}};
