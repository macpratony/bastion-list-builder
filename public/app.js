"use strict";
/* =====================================================================
   CONFIGURACIÓN DE FIREBASE
   Pega aquí el objeto firebaseConfig de tu proyecto para que todos los
   que abran la app puedan crear cuenta. Si lo dejas en null, también se
   puede pegar desde la pestaña «Cuenta» (se guarda solo en ese navegador).
   ===================================================================== */
const FIREBASE_CONFIG = null;
const FIREBASE_SDK = "10.12.2";

// Los datos de cada usuario viven solo en Firestore (users/{uid}). En el navegador
// se guardan únicamente preferencias sin datos privados (tema y pestaña).
const PREFS_KEY = "bastion-prefs-v1";
// Copia antigua de la época sin cuentas: no se carga sola, solo se ofrece importarla.
const LEGACY_KEY = "bastion-mando-v1";
const CFG_KEY = "bastion-firebase-config";
const CLIENT_ID = Math.random().toString(36).slice(2,10);
const PHASES = ["Mando","Movimiento","Disparo","Carga","Combate"];
const ROLES = ["Héroe épico","Personaje","Línea","Transporte dedicado","Otra"];
const STATS = ["M","T","SV","W","LD","OC"];
const LIMITS = [500,1000,1500,2000,3000];
const ALIGN = {imp:"Imperio", cha:"Caos", xen:"Xenos"};
const FACTIONS = [
  ["adepta-sororitas","Adepta Sororitas","imp","#e0454f"],
  ["adeptus-custodes","Adeptus Custodes","imp","#e3b341"],
  ["adeptus-mechanicus","Adeptus Mechanicus","imp","#e0663a"],
  ["aeldari","Aeldari","xen","#2fc7b2"],
  ["astra-militarum","Astra Militarum","imp","#a3b35a"],
  ["black-templars","Black Templars","imp","#d7dde6"],
  ["blood-angels","Blood Angels","imp","#ef3e46"],
  ["chaos-daemons","Demonios del Caos","cha","#b56cf0"],
  ["chaos-knights","Caballeros del Caos","cha","#d4573c"],
  ["chaos-space-marines","Marines Espaciales del Caos","cha","#e2504a"],
  ["dark-angels","Dark Angels","imp","#3fbf63"],
  ["death-guard","Guardia de la Muerte","cha","#a8b83f"],
  ["deathwatch","Deathwatch","imp","#a9bccf"],
  ["drukhari","Drukhari","xen","#a46ad6"],
  ["emperors-children","Hijos del Emperador","cha","#e866c0"],
  ["genestealer-cults","Cultos Genestealer","xen","#9a7cf0"],
  ["grey-knights","Caballeros Grises","imp","#b9c8d8"],
  ["imperial-agents","Agentes Imperiales","imp","#d0864a"],
  ["imperial-knights","Caballeros Imperiales","imp","#4f97e8"],
  ["leagues-of-votann","Ligas de Votann","xen","#f0962e"],
  ["necrons","Necrones","xen","#43e07a"],
  ["orks","Orkos","xen","#7cc043"],
  ["space-marines","Marines Espaciales","imp","#3f86ef"],
  ["space-wolves","Space Wolves","imp","#8fb6d8"],
  ["tau-empire","Imperio T'au","xen","#eab05c"],
  ["thousand-sons","Mil Hijos","cha","#3aa0e6"],
  ["tyranids","Tiránidos","xen","#c25bd0"],
  ["world-eaters","Devoradores de Mundos","cha","#e8403a"]
].map(([id,name,align,color])=>({id,name,align,color}));
const DEFAULT_FAC = "dark-angels";
const fac = id => FACTIONS.find(f=>f.id===id) || FACTIONS.find(f=>f.id===DEFAULT_FAC);

/* Índice de hojas de datos de 11.ª edición (warmind.online):
   [nombre, categoría, puntos mín., id, leyenda (1/0), tamaños [[miniaturas,puntos],…] si hay varios].
   La hoja completa de cada facción está en data/<facción>.json y se carga al abrirla. */
const DB = {"adepta-sororitas":[["Aestred Thurga y Agathae Dolan","H",80,"aestred-thurga-and-agathae-dolan"],["Arcoflagelantes","I",50,"arco-flagellants",0,[[3,50],[10,140]]],["Santuario de Batalla","F",170,"battle-sanctum",1],["Escuadra de Hermanas de Batalla","L",100,"battle-sisters-squad"],["Canonesa","P",60,"canoness"],["Canonesa con propulsor de salto","P",75,"canoness-with-jump-pack"],["Castigator","V",165,"castigator"],["Insidiadoras celestes","I",115,"celestian-insidiants"],["Celestiana Sacresant Aveline","H",45,"celestian-sacresant-aveline",1],["Celestes sacrosantas","I",75,"celestian-sacresants",0,[[5,75],[10,150]]],["Cruzados","I",40,"crusaders",1,[[2,40],[4,80]]],["Daemonífuga","H",85,"daemonifuge"],["Asesinos del Culto de la Muerte","I",55,"death-cult-assassins",1,[[2,55],[4,110]]],["Dialogante","P",40,"dialogus"],["Dogmática","P",45,"dogmata"],["Escuadra de dominias","I",90,"dominion-squad"],["Exorcist","V",175,"exorcist"],["Hospitalaria","P",65,"hospitaller"],["Imagificadora","P",55,"imagifier"],["Inmolador","T",100,"immolator"],["Intranzia Fraye","H",135,"intranzia-fraye"],["Junith Eruita","H",105,"junith-eruita"],["Sacerdote del Ministorum","P",50,"ministorum-priest"],["Mortificadoras","V",70,"mortifiers",0,[[1,70],[2,130]]],["Morvenn Vahl","H",215,"morvenn-vahl"],["Palatina","P",50,"palatine"],["Exoesqueletos ejemplares","V",165,"paragon-warsuits"],["Motores Penitentes","V",70,"penitent-engines",0,[[1,70],[2,140]]],["Escuadra de arrepentidas","I",70,"repentia-squad",0,[[5,70],[10,140]]],["Repressor","T",130,"repressor",1],["Escuadra de vengadoras","I",105,"retributor-squad"],["Santa Celestine","H",135,"saint-celestine"],["Santificadores","I",110,"sanctifiers"],["Escuadra de serafinas","I",75,"seraphim-squad",0,[[5,75],[10,150]]],["Escuadra de Hermanas Novicias","I",90,"sisters-novitiate-squad"],["Rhino de las Sororitas","T",65,"sororitas-rhino"],["Triunfo de Santa Katherine","H",245,"triumph-of-saint-katherine"],["Escuadra de cefíreas","I",75,"zephyrim-squad",0,[[5,75],[10,150]]]],"adeptus-custodes":[["Custodios Agamatus","M",225,"agamatus-custodians",0,[[3,225],[6,450]]],["Aleya","H",55,"aleya",1],["Custodios Allarus","I",180,"allarus-custodians",0,[[2,180],[3,270]]],["Custodios Allarus (Codex)","I",180,"codex-allarus-custodians",0,[[2,180],[3,270]]],["Rhino del Anathema Psykana","T",70,"anathema-psykana-rhino"],["Rhino del Anathema Psykana (Codex)","T",70,"codex-anathema-psykana-rhino"],["Custodios Aquilon","I",195,"aquilon-custodians",0,[[3,195],[6,390]]],["Exterminadores Aquilon con guanteletes de energía solaritas (Codex)","I",285,"codex-aquilon-terminators-with-solarite-power-gauntlets"],["Exterminadores Aquilon con zarpas de energía solaritas (Codex)","I",275,"codex-aquilon-terminators-with-solarite-power-talons"],["Cañonera Ares","V",580,"ares-gunship"],["Campeón de filo","P",175,"blade-champion"],["Campeón de filo (Codex)","P",175,"codex-blade-champion"],["Tanque Gravitatorio Caladius Aniquilador (Codex)","V",250,"codex-caladius-annihilator-grav-tank"],["Tanque Gravitatorio Caladius","V",230,"caladius-grav-tank"],["Tanque Gravitatorio Caladius (Codex)","V",230,"codex-caladius-grav-tank"],["Dreadnought desprecio achillus","V",230,"contemptor-achillus-dreadnought"],["Dreadnought desprecio achillus (Codex)","V",230,"codex-contemptor-achillus-dreadnought"],["Dreadnought galatus desprecio","V",220,"contemptor-galatus-dreadnought"],["Dreadnought galatus desprecio (Codex)","V",220,"codex-contemptor-galatus-dreadnought"],["Transporte Gravitatorio Coronus","V",225,"coronus-grav-carrier"],["Transporte Gravitatorio Coronus (Codex)","V",225,"codex-coronus-grav-carrier"],["Guardias custodios","L",180,"custodian-guard",0,[[4,180],[5,225]]],["Sodalidad de guardias custodios (Codex)","L",240,"codex-custodian-guard-sodality"],["Sodalidad de Guardias Custodios con lanzas de adrasita (Codex)","I",200,"codex-custodian-guard-sodality-with-adrasite-spears",1],["Sodalidad de Guardias Custodios con lanzas de piritita (Codex)","I",215,"codex-custodian-guard-sodality-with-pyrithite-spears",1],["Guardia custodio con lanzas de adrasita y piritita","I",250,"custodian-guard-with-adrasite-and-pyrithite-spears"],["Protectores custodios","I",210,"custodian-wardens",0,[[4,210],[5,260]]],["Protectores custodios (Codex)","I",200,"codex-custodian-wardens",0,[[2,200],[3,295]]],["Sodalidad de motos a reacción girohalcón (Codex)","M",260,"codex-gyrfalcon-jetbike-sodality"],["Caballera centura","P",55,"knight-centura"],["Caballera centura (Codex)","P",55,"codex-knight-centura"],["Lanzadera de asalto Orión","V",690,"orion-assault-dropship"],["Asaltante gravitatorio palas","V",135,"pallas-grav-attack"],["Asaltante gravitatorio palas (Codex)","V",135,"codex-pallas-grav-attack"],["Escuadra de Perseguidoras (Codex)","I",45,"codex-prosecutor-squad",0,[[4,45],[5,50],[9,80],[10,90]]],["Perseguidoras","I",50,"prosecutors",0,[[4,50],[5,55],[9,80],[10,90]]],["Custodios Sagittarum","I",225,"sagittarum-custodians"],["Sodalidad de Custodios Sagittarum (Codex)","I",185,"codex-sagittarum-custodians-sodality",1],["Sodalidad de guardias centinelas (Codex)","L",240,"codex-sentinel-guard-sodality"],["Capitán Escudo","P",180,"shield-captain"],["Capitán Escudo (Codex)","P",180,"codex-shield-captain"],["Capitán escudo con armadura exterminador Allarus","P",185,"shield-captain-in-allarus-terminator-armour"],["Capitán escudo con armadura exterminador Allarus (Codex)","P",185,"codex-shield-captain-in-allarus-terminator-armour"],["Capitán escudo en moto a reacción Dawneagle","P",205,"shield-captain-on-dawneagle-jetbike"],["Capitán escudo en moto a reacción Dawneagle (Codex)","P",205,"codex-shield-captain-on-dawneagle-jetbike"],["Dreadnought Pesado Telemon","V",280,"telemon-heavy-dreadnought"],["Dreadnought Pesado Telemon (Codex)","V",280,"codex-telemon-heavy-dreadnought"],["Trajann Valoris","H",265,"trajann-valoris"],["Trajann Valoris (Codex)","H",265,"codex-trajann-valoris"],["Valerian","H",130,"valerian",1],["Custodios Venatari","I",150,"venatari-custodians",0,[[3,150],[6,300]]],["Venatari con Destructores Cinéticos (Codex)","I",255,"codex-venatari-with-kinetic-destroyers"],["Venatari con Lanzas Verutum (Codex)","I",270,"codex-venatari-with-verutum-lances"],["Dreadnought desprecio venerable","V",220,"venerable-contemptor-dreadnought",1],["Land Raider Venerable","V",230,"venerable-land-raider",1],["Pretores Vertus","M",220,"vertus-praetors",0,[[2,220],[3,330]]],["Pretores Vertus (Codex)","M",220,"codex-vertus-praetors",0,[[2,220],[3,330]]],["Escuadra de Acechadoras (Codex)","I",50,"codex-vigilator-squad",0,[[4,50],[5,55],[9,90],[10,100]]],["Acechadoras","I",50,"vigilators",0,[[4,50],[5,55],[9,90],[10,100]]],["Escuadra de Buscabrujas (Codex)","I",55,"codex-witchseeker-squad",0,[[4,55],[5,60],[9,100],[10,110]]],["Buscabrujas","I",50,"witchseekers",0,[[4,50],[5,55],[9,90],[10,100]]]],"adeptus-mechanicus":[["Arqueóptero avetrallador","V",160,"archaeopter-fusilave"],["Arqueóptero estratorraptor","V",185,"archaeopter-stratoraptor"],["Arqueóptero Transvector","V",145,"archaeopter-transvector"],["Belisarius Cawl","H",220,"belisarius-cawl"],["Electrosacerdotes Corpuscarii","I",60,"corpuscarii-electro-priests",0,[[5,60],[10,120]]],["Dataherrero cibernético","P",20,"cybernetica-datasmith"],["Electrosacerdotes Fulguritas","I",65,"fulgurite-electro-priests",0,[[5,65],[10,130]]],["Ultimadores Hastarii","I",100,"hastarii-exterminators"],["Fusileros Hastarii","I",105,"hastarii-fusiliers"],["Zancoférreos Ballistarii","V",80,"ironstrider-ballistarii",0,[[1,80],[2,160],[3,250]]],["Robots Kastelan","V",150,"kastelan-robots",0,[[2,150],[4,300]]],["Irruptores Kataphron","I",140,"kataphron-breachers",0,[[3,140],[6,290]]],["Destructor Kataphron","I",100,"kataphron-destroyers",0,[[3,100],[6,200]]],["Trepadunas onagro","V",150,"onager-dunecrawler"],["Desguazadores Pteraxii","I",75,"pteraxii-skystalkers",0,[[5,75],[10,150]]],["Tecnorrapaz Pteraxii","I",75,"pteraxii-sterylizors",0,[[5,75],[10,150]]],["Hoplitas Secutarii","I",65,"secutarii-hoplites",1,[[5,65],[10,130]]],["Peltastas Secutarii","I",50,"secutarii-peltasts",1,[[5,50],[10,100]]],["Incursores Serberys","M",60,"serberys-raiders",0,[[3,60],[6,105]]],["Sulfojinete Serberys","M",55,"serberys-sulphurhounds",0,[[3,55],[6,95]]],["Clado de Batalla de Servidores","I",75,"servitor-battleclade"],["Infiltradores Sicarianos","I",75,"sicarian-infiltrators",0,[[5,75],[10,155]]],["Ferracechadores sicarianos","I",75,"sicarian-ruststalkers",0,[[5,75],[10,160]]],["Mariscal Skitarii","P",35,"skitarii-marshal"],["Exploradores Skitarii","L",85,"skitarii-rangers"],["Vanguardia Skitarii","L",85,"skitarii-vanguard"],["Desintegrador Skorpius","V",160,"skorpius-disintegrator"],["Trepadunas Skorpius","T",75,"skorpius-dunerider"],["Dragones sidonianos con Jezzail Radium","V",55,"sydonian-dragoons-with-radium-jezzails",0,[[1,55],[2,95],[3,140]]],["Dragones sidonianos con lanza Táser","V",60,"sydonian-dragoons-with-taser-lances",0,[[1,60],[2,120],[3,170]]],["Skatros sidoniano","P",45,"sydonian-skatros"],["Tecnosacerdote Dominus","P",60,"tech-priest-dominus"],["Tecnosacerdote visioingeniero","P",55,"tech-priest-enginseer"],["Tecnosacerdote Manipulus","P",60,"tech-priest-manipulus"],["Tecnoarqueólogo","P",45,"technoarcheologist"],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Thulia Ghuld","H",180,"thulia-ghuld"],["X-101","H",40,"x-101",1]],"aeldari":[["Amallyn Guíasombras","H",75,"amallyn-shadowguide",1],["Asurmen","H",135,"asurmen"],["Autarca","P",70,"autarch"],["Autarca en Motojet","P",90,"autarch-skyrunner",1],["Autarca cazacielos","P",70,"autarch-wayleaper"],["Avatar de Khaine","H",250,"avatar-of-khaine"],["Baharroth","H",125,"baharroth"],["Cantahuesos","P",45,"bonesinger",1],["Filo del clan","P",70,"clanblade"],["Cobra","V",415,"cobra",1],["Banda de Danzantes de las Nubes Corsarios","M",125,"corsair-cloud-dancer-band",1,[[3,125],[4,150],[6,210],[7,245]]],["Banda de Saqueadores Corsarios","I",125,"corsair-reaver-band",1,[[5,125],[6,150],[10,250],[11,275]]],["Corsarios saqueacielos","I",75,"corsair-skyreavers",0,[[5,75],[10,140]]],["Corsarios saqueadores","L",65,"corsair-voidreavers",0,[[5,65],[10,110]]],["Corsarios del vacío","I",70,"corsair-voidscarred",0,[[5,70],[10,140]]],["Cazador Carmesí","V",160,"crimson-hunter"],["Plataforma de Cañón D","I",110,"d-cannon-platform"],["Segadores Siniestros","I",95,"dark-reapers",0,[[5,95],[10,200]]],["Bufón de Muerte","P",65,"death-jester"],["Vengadores Implacables","I",70,"dire-avengers",0,[[5,70],[10,140]]],["Caballeros dragoneros","M",85,"dragon-knights",0,[[3,85],[6,180]]],["Eldrad Ulthran","H",120,"eldrad-ulthran"],["Falcón","V",130,"falcon"],["Vidente","P",60,"farseer"],["Vidente correcielos","P",60,"farseer-skyrunner"],["Dragones llameantes","I",110,"fire-dragons",0,[[5,110],[10,240]]],["Prisma","V",150,"fire-prism"],["Firestorm","V",115,"firestorm",1],["Fuegan","H",130,"fuegan"],["Guardianes de defensa","L",90,"guardian-defenders"],["Caza espectral belladona","V",155,"hemlock-wraithfighter"],["Avispón","V",100,"hornet",1],["Espectros Aullantes","I",85,"howling-banshees",0,[[5,85],[10,165]]],["Illic Lanzanocturna","H",70,"illic-nightspear",1],["Irillyth","H",105,"irillyth",1],["Jain Zar","H",105,"jain-zar"],["Karandras","H",90,"karandras",1],["Kharseth","H",80,"kharseth"],["Leyacechador","P",75,"leystalker"],["Lhykhis","H",135,"lhykhis"],["Lynx","V",180,"lynx",1],["Maugan Ra","H",100,"maugan-ra"],["Hiladora nocturna","V",165,"night-spinner"],["Ala Nocturna","V",150,"nightwing",1],["Titán fantasmal","N",2100,"phantom-titan"],["Fénix","V",175,"phoenix",1],["Príncipe Yriel","H",95,"prince-yriel"],["Exploradores","I",60,"rangers",0,[[5,60],[10,110]]],["Titán renacido","N",1100,"revenant-titan"],["Escorpión","V",410,"scorpion",1],["Espectros Sombríos","I",115,"shadow-spectres",1,[[5,115],[10,230]]],["Plataforma tejedora de sombras","I",60,"shadow-weaver-platform"],["Vidente de sombras","P",50,"shadowseer"],["Lanzas brillantes","M",100,"shining-spears",0,[[3,100],[6,200]]],["Cazadoras sudario","M",90,"shroud-runners",0,[[3,90],[6,165]]],["Caballero Espectral Skathach","N",490,"skathach-wraithknight",1],["Tejecielos","M",90,"skyweavers",0,[[2,90],[4,180]]],["Solitario","H",105,"solitaire"],["Spiritseer","P",50,"spiritseer"],["Colmillos Estelares","V",70,"starfangs",0,[[1,70],[2,140]]],["Tejeestrellas","T",70,"starweaver"],["Cantarroca","P",55,"stonesinger"],["Guardianes de asalto","L",100,"storm-guardians"],["Escorpiones Asesinos","I",75,"striking-scorpions",0,[[5,75],[10,145]]],["Halcones Cazadores","I",95,"swooping-hawks",0,[[5,95],[10,190]]],["El Visarca","H",80,"the-visarch"],["El yncarnado","H",230,"the-yncarne"],["Compañía","I",85,"troupe",0,[[5,85],[6,100],[11,190],[12,205]]],["Director de Compañía","P",75,"troupe-master"],["Cazador Vampiro","V",460,"vampire-hunter",1],["Asaltante Vampiro","V",430,"vampire-raider",1],["Plataforma cañón de vibración","I",60,"vibro-cannon-platform"],["Tejevacíos","V",115,"voidweaver"],["Vibora","V",75,"vyper",0,[[1,75],[2,140]]],["Bípode de combate","V",80,"war-walkers",0,[[1,80],[2,160]]],["Brujo","P",40,"warlock"],["Cónclave de Brujos","I",55,"warlock-conclave",0,[[2,55],[4,110]]],["Brujo correcielos","M",45,"warlock-skyrunners",0,[[1,45],[2,90]]],["Cazador de la Disformidad","V",145,"warp-hunter",1],["Arañas de Disformidad","I",105,"warp-spiders",0,[[5,105],[10,200]]],["Andador de Asalto Wasp","V",95,"wasp-assault-walker",1],["Serpiente","T",115,"wave-serpent"],["Portal de la Telaraña","F",105,"webway-gate",1],["Jinetes del Viento","M",80,"windriders",0,[[3,80],[6,170]]],["Filos espectrales","I",140,"wraithblades"],["Guardia Espectral","I",145,"wraithguard"],["Caballero Espectral","N",385,"wraithknight"],["Caballero espectral con espectrofilo","N",380,"wraithknight-with-ghostglaive"],["Señor Espectral","N",125,"wraithlord"],["Vidente Espectral","N",160,"wraithseer",1],["Arconte Ynnari","P",85,"ynnari-archon"],["Íncubo Ynnari","I",80,"ynnari-incubi",0,[[5,80],[10,160]]],["Guerreros kabalistas Ynnari","L",110,"ynnari-kabalite-warriors"],["Asaltante Ynnari","T",70,"ynnari-raider"],["Guadañas Ynnari","M",65,"ynnari-reavers",0,[[3,65],[6,120]]],["Súcubos Ynnari","P",45,"ynnari-succubus"],["Ponzoña Ynnari","T",65,"ynnari-venom"],["Brujas Ynnari","L",90,"ynnari-wyches"],["Yvraine","H",90,"yvraine"]],"astra-militarum":[["Straken «Mano de Hierro»","H",55,"iron-hand-straken",1],["Línea de defensa aegius","F",145,"aegis-defence-line"],["Aterrizador Aquila","V",120,"aquila-lander",1],["Martillo Tormenta Arkuriano","V",480,"arkurian-stormhammer",1],["Medusa patrón Armageddon","V",105,"armageddon-pattern-medusa",1],["Sentinels acorazados","V",65,"armoured-sentinels",0,[[1,65],[2,120]]],["Dotación de artillería de campaña","I",95,"artillery-team"],["Lanzadera Arvus","V",95,"arvus-lighter",1],["Vehículo de Recuperación Atlas","V",80,"atlas-recovery-vehicle",1],["Jinetes recios de attila","M",60,"attilan-rough-riders",0,[[5,60],[10,120]]],["Avenger Strike Fighter","V",130,"avenger-strike-fighter"],["Baneblade","V",415,"baneblade"],["Banehammer","V",385,"banehammer"],["Banesword","V",415,"banesword"],["Basilisk","V",115,"basilisk"],["Escuadra de torogretes","I",90,"bullgryn-squad",0,[[3,90],[6,200]]],["Castellano Cadiano","P",55,"cadian-castellan"],["Escuadra de mando de cadia","P",60,"cadian-command-squad"],["Escuadra de armas pesadas de cadia","I",65,"cadian-heavy-weapons-squad"],["Escuadra de Reconocimiento Cadiana","I",80,"cadian-recon-squad"],["Tropas de choque de cadia","L",70,"cadian-shock-troops",0,[[10,70],[20,145]]],["Carnodon","V",160,"carnodon",1],["Escuadra de mando de Catachan","P",60,"catachan-command-squad"],["Escuadra de armas pesadas de Catachan","I",70,"catachan-heavy-weapons-squad"],["Tropas de jungla de Catachán","L",70,"catachan-jungle-fighters",0,[[10,70],[20,135]]],["Transporte Ligero Centaur","V",40,"centaur-light-carrier",1],["Var Centaur","T",65,"centaur-rsv"],["Chimera","T",75,"chimera"],["Ciaphas Cain","H",70,"ciaphas-cain",1],["Coloso","V",160,"colossus",1],["Comisario","P",30,"commissar"],["Comisaria Graves","H",125,"commissar-graves"],["Comisaria Graves a pie","H",65,"commissar-graves-on-foot"],["Comisario Yarrick","H",110,"commissar-yarrick"],["Crassus","V",180,"crassus",1],["Cyclops Demolition Vehicle","V",40,"cyclops-demolition-vehicle"],["Escuadra de Granaderos del Cuerpo de la Muerte","I",110,"death-korps-grenadier-squad",1],["Korps de la Muerte de Krieg","L",70,"death-korps-of-krieg",0,[[10,70],[20,135]]],["Comisario Jinete de la Muerte","P",35,"death-rider-commissar",1],["Jinetes de la Muerte","M",60,"death-riders",0,[[5,60],[10,110]]],["Deathstrike","V",125,"deathstrike"],["Bombarda de Asedio Blindada Dominus","V",325,"dominus-armoured-siege-bombard",1],["Doomhammer","V",380,"doomhammer"],["Batería Remolcada Earthshaker","I",120,"earthshaker-carriage-battery",1],["Plataforma Earthshaker","F",110,"earthshaker-platform",1],["Sentinel Aerotransportado Eliseo","V",85,"elysian-drop-sentinel",1],["Escuadra de Francotiradores Elisea","I",65,"elysian-sniper-squad",1],["Batería artillera de campaña","I",90,"field-ordnance-battery"],["Fantasmas de Gaunt","H",95,"gaunt-s-ghosts"],["Transporte Pesado Gorgon","V",275,"gorgon-heavy-transport",1],["Portamortero Griffon","V",115,"griffon-mortar-carrier",1],["Taladro de Brecha Hades","V",110,"hades-breaching-drill",1],["Equipo de Mortero Pesado","I",50,"heavy-mortar-team",1],["Equipo de Lanzador Cuádruple Pesado","I",50,"heavy-quad-launcher-team",1],["Los Últimos del Infierno","H",80,"hell-s-last",1],["Hellhammer","V",385,"hellhammer"],["Hellhound","V",115,"hellhound"],["VBC Hippogriff","V",70,"hippogriff-afv",0,[[1,70],[2,140]]],["Hydra","V",90,"hydra"],["Plataforma Hydra","F",95,"hydra-platform",1],["Kasrkin","I",105,"kasrkin"],["Ingenieros de Combate de Krieg","I",65,"krieg-combat-engineers",0,[[5,65],[10,95]]],["Escuadra de Mando de Krieg","P",60,"krieg-command-squad"],["Escuadra de Armas Pesadas de Krieg","I",70,"krieg-heavy-weapons-squad"],["Tanque de Batalla Leman Russ","V",160,"leman-russ-battle-tank"],["Comandnte de Leman Russ","P",195,"leman-russ-commander"],["Leman Russ Demolisher","V",160,"leman-russ-demolisher"],["Leman Russ Eradicator","V",145,"leman-russ-eradicator"],["Leman Russ Executioner","V",145,"leman-russ-executioner"],["Leman Russ Exterminator","V",160,"leman-russ-exterminator"],["Leman Russ Punisher","V",130,"leman-russ-punisher"],["Leman Russ Vanquisher","V",130,"leman-russ-vanquisher"],["Lord Mariscal Dreir","H",70,"lord-marshal-dreir"],["Lord Solar Leontus","H",120,"lord-solar-leontus"],["Macharius","V",310,"macharius",1],["Macharius Omega","V",310,"macharius-omega",1],["Macharius Vanquisher","V",285,"macharius-vanquisher",1],["Macharius Vulcan","V",310,"macharius-vulcan",1],["Malcador","V",250,"malcador",1],["Malcador Annihilator","V",270,"malcador-annihilator",1],["Malcador Defender","V",310,"malcador-defender",1],["Malcador Infernus","V",235,"malcador-infernus",1],["Manticore","V",150,"manticore"],["Plataforma Manticore","F",95,"manticore-platform",1],["Bombardero Marauder","V",345,"marauder-bomber",1],["Destructor Marauder","V",375,"marauder-destroyer",1],["Batería Remolcada Medusa","I",125,"medusa-carriage-battery",1],["Escuadra de Mando del Militarum Tempestus","P",85,"militarum-tempestus-command-squad"],["Sacerdote del Ministorum","P",35,"ministorum-priest"],["Minotauro","V",225,"minotaur",1],["Jinetes Mukaali","M",110,"mukaali-riders",1],["Servidores del Munitorum","I",35,"munitorum-servitors",1],["Nork Deddog","H",60,"nork-deddog"],["Ogrete guardaespaldas","P",40,"ogryn-bodyguard"],["Escuadra de Ogretes","I",60,"ogryn-squad",0,[[3,60],[6,120]]],["Pretor","V",275,"praetor",1],["Psíquico Primaris","P",60,"primaris-psyker"],["Preparado Provisionalmente","H",40,"provisionally-prepared",1],["Escuadra del Cuadro del Intendente","P",45,"quartermaster-cadre-squad",1],["Batería de Destructores Láser Rapier","I",35,"rapier-laser-destroyer-battery",1,[[1,35],[2,70],[3,105]]],["Rátidos","I",60,"ratlings",0,[[5,60],[10,100]]],["Agregados del Regimiento","I",40,"regimental-attaches",1],["Rein y Raus","H",50,"rein-and-raus",1],["Tanque de Batalla Rogal Dorn","V",260,"rogal-dorn-battle-tank"],["Comandante de Rogal Dorn","P",290,"rogal-dorn-commander"],["Batería de Armas Sabre","F",45,"sabre-weapons-battery",1,[[1,45],[2,90]]],["Vehículo de Mando Salamander","V",80,"salamander-command-vehicle",1],["Vehículo Explorador Salamander","V",95,"salamander-scout-vehicle",1],["Sentinels Exploradores","V",55,"scout-sentinels",0,[[1,55],[2,100]]],["Sentinel Elevador","V",55,"sentinel-powerlifter",1],["Sargento Harker","H",40,"sergeant-harker",1],["Shadowsword","V",375,"shadowsword"],["Sly Marbo","H",55,"sly-marbo"],["Quimera Tormenta","T",90,"storm-chimera",1],["Stormblade","V",415,"stormblade",1],["Stormlord","V",395,"stormlord"],["Stormsword","V",430,"stormsword"],["Cazatanques Destructor Stygies","V",180,"stygies-destroyer-tank-hunter",1],["Batería Tarantula","V",40,"tarantula-battery",1,[[1,40],[2,80],[3,120]]],["Vehículo de Asalto Tauros","M",50,"tauros-assault-vehicle",1],["Tauros Venator","M",50,"tauros-venator",1],["Taurox","T",65,"taurox"],["Taurox Prime","T",75,"taurox-prime"],["Tecnosacerdote visioingeniero","P",45,"tech-priest-enginseer"],["Tempestus Aquilons","I",95,"tempestus-aquilons"],["Vástagos Tempestus","I",75,"tempestus-scions",0,[[5,75],[10,150]]],["Vehículo de Apoyo Trojan","V",80,"trojan-support-vehicle",1],["Ursula Creed","H",85,"ursula-creed"],["Valdor","V",285,"valdor",1],["Valkyrie","V",170,"valkyrie"],["Valquiria Sky Talon","V",185,"valkyrie-sky-talon",1],["Cañonera Vendetta","V",255,"vendetta-gunship",1],["Lightning patrón Voss","V",130,"voss-pattern-lightning",1],["Cañonera Vulture","V",225,"vulture-gunship",1],["Wyvern","V",95,"wyvern"]],"black-templars":[["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario","P",45,"apothecary"],["Apotecario Biologis","P",60,"apothecary-biologis"],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Castellano","P",75,"castellan"],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán Grimaldus","H",120,"chaplain-grimaldus"],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Escuadra de Mando","I",165,"command-squad",1],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Anciano cruzado","P",45,"crusade-ancient"],["Escuadra de Cruzados","L",160,"crusader-squad",0,[[10,160],[20,305]]],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Escuadra Devastadora","I",120,"devastator-squad",1,[[5,120],[10,200]]],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Paladín del Emperador","P",100,"emperor-s-champion"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Execrador","P",65,"execrator"],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Gladiator lancero","V",165,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",145,"gladiator-valiant"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Gran mariscal Helbrecht","H",125,"high-marshal-helbrecht"],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kratos","V",240,"kratos",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Mariscal","P",80,"marshal"],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Portador Rapier","V",90,"rapier-carrier",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",265,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"scout-squad",0,[[5,65],[10,120]]],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Escuadra de hermanos de armas","I",115,"sword-brethren-squad",0,[[4,115],[5,140],[9,250],[10,275]]],["Escuadra Táctica","L",140,"tactical-squad",1],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Typhon","V",320,"typhon",1],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",165,"venerable-dreadnought",1],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"blood-angels":[["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario","P",45,"apothecary"],["Apotecario Biologis","P",60,"apothecary-biologis"],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astorath","H",90,"astorath"],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Predator Baal","V",135,"baal-predator"],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Capitán de los ángeles sangrientos","P",90,"blood-angels-captain"],["Hermano Corbulo","H",75,"brother-corbulo",1],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán Tycho","H",75,"captain-tycho",1],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Bibliotecario Jefe Mephiston","H",175,"chief-librarian-mephiston"],["Escuadra de Mando","I",165,"command-squad",1],["Comandante Dante","H",140,"commander-dante"],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Capitán de la Compañía de la Muerte","P",80,"death-company-captain"],["Capitán de la Compañía de la Muerte con propulsor de salto","P",85,"death-company-captain-with-jump-pack"],["Dreadnought de la Compañía de la Muerte","V",165,"death-company-dreadnought"],["Dreadnought de la Compañía de la Muerte con Magnagarfio","V",145,"death-company-dreadnought-with-magna-grapple",1],["Marines de la Compañía de la Muerte","I",90,"death-company-marines",0,[[5,90],[10,170]]],["Marines de la Compañía de la Muerte con Rifles Bólter","I",80,"death-company-marines-with-bolt-rifles",1,[[5,80],[10,155]]],["Marines de la Compañía de la Muerte con Bólteres","I",125,"death-company-marines-with-boltguns",1,[[5,125],[10,250]]],["Marines de la Compañía de la Muerte con Bólteres y Retrorreactores","I",140,"death-company-marines-with-boltguns-and-jump-packs",1,[[5,140],[10,280]]],["Marines de la Compañía de la Muerte con propulsores de salto","I",130,"death-company-marines-with-jump-packs",0,[[5,130],[10,260]]],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Escuadra Devastadora","I",120,"devastator-squad",1,[[5,120],[10,200]]],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Dreadnought Furioso","V",150,"furioso-dreadnought",1],["Gabriel Seth","H",90,"gabriel-seth",1],["Gladiator lancero","V",160,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",165,"gladiator-valiant"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kratos","V",240,"kratos",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Lemartes","H",110,"lemartes"],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Bibliotecario","P",75,"librarian"],["Dreadnought Bibliotecario","V",170,"librarian-dreadnought",1],["Bibliotecario con Armadura Phobos","P",75,"librarian-in-phobos-armour"],["Bibliotecario con armadura exterminador","P",80,"librarian-in-terminator-armour"],["Bibliotecario en Moto","P",80,"librarian-on-bike",1],["Bibliotecario con Retrorreactor","P",75,"librarian-with-jump-pack",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Portador Rapier","V",90,"rapier-carrier",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",260,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Guardia Sanguinaria","I",135,"sanguinary-guard",0,[[3,135],[6,275]]],["Sacerdote Sanguinario","P",60,"sanguinary-priest"],["Sacerdote Sanguinario con Retrorreactor","P",100,"sanguinary-priest-with-jump-pack",1],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"scout-squad",0,[[5,65],[10,120]]],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Escuadra Táctica","L",140,"tactical-squad",1],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["El Sanguinor","H",120,"the-sanguinor"],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Tycho el Perdido","H",90,"tycho-the-lost",1],["Typhon","V",320,"typhon",1],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",165,"venerable-dreadnought",1],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"chaos-daemons":[["Aetaos'rau'keres","H",315,"aetaos-rau-keres",1],["An'ggrath el Desatado","H",415,"an-ggrath-the-unbound",1],["Be'lakor","H",390,"be-lakor"],["Bestias de Nurgle","B",80,"beasts-of-nurgle",0,[[1,80],[2,150]]],["Aplastadores","M",95,"bloodcrushers",0,[[3,95],[6,210]]],["Desangradores","L",110,"bloodletters"],["Amo sangriento","P",65,"bloodmaster"],["Devorador de Almas","P",320,"bloodthirster"],["Horrores Azules","L",125,"blue-horrors"],["Carro flamígero","M",115,"burning-chariot"],["Hechicero del cambio","P",60,"changecaster"],["Paradigma de contorsión","P",115,"contorted-epitome"],["Príncipe Daemon del Caos","P",165,"daemon-prince-of-chaos"],["Príncipe Daemon del Caos alado","P",190,"daemon-prince-of-chaos-with-wings"],["Diablillas","L",100,"daemonettes"],["Epidemius","H",80,"epidemius"],["Incinerador glorioso","P",65,"exalted-flamer"],["Surcadestinos","P",95,"fateskimmer"],["Fauces feculentas","F",100,"feculent-gnarlmaw"],["Diablos","B",90,"fiends",0,[[3,90],[6,190]]],["Incineradores","I",65,"flamers",0,[[3,65],[6,130]]],["Mastines de Khorne","B",80,"flesh-hounds",0,[[5,80],[10,150]]],["Amo del flujo","P",70,"fluxmaster"],["Furias","I",40,"furies",1,[[5,40],[10,80]]],["Engendro del Caos Gigante","N",130,"giant-chaos-spawn",1],["Gran Inmundicia","P",265,"great-unclean-one"],["Desollador infernal","M",80,"hellflayers",0,[[1,80],[2,160]]],["Heraldo de Slaanesh en Corcel de Slaanesh","P",70,"herald-of-slaanesh-on-steed-of-slaanesh",1],["Hortículus fangux","H",120,"horticulous-slimux"],["Embelesadora infernal","P",60,"infernal-enrapturess"],["Kairos Tejedestinos","H",305,"kairos-fateweaver"],["Karanak","H",70,"karanak"],["Guardián de los Secretos","P",265,"keeper-of-secrets"],["Señor de la Transformación","P",320,"lord-of-change"],["Nurgletes","L",45,"nurglings",0,[[3,45],[6,90]]],["Horrores rosa","L",150,"pink-horrors"],["Zánganos de Plaga","M",110,"plague-drones",0,[[3,110],[6,220]]],["Sapos de la Plaga","B",120,"plague-toads",1],["Portadores de Plaga","L",115,"plaguebearers"],["Jinetes de Viruela","M",160,"pox-riders",1],["Portapestes","P",60,"poxbringer"],["Amo desgarrador en trono de sangre","P",160,"rendmaster-on-blood-throne"],["Putrigus","H",280,"rotigus"],["Scabeiathrax el Hinchado","H",275,"scabeiathrax-the-bloated",1],["Aulladores","B",80,"screamers",0,[[3,80],[6,160]]],["Buscadores","M",85,"seekers",0,[[5,85],[10,155]]],["Shalaxi Helbane","H",315,"shalaxi-helbane"],["Skarbrand","H",330,"skarbrand"],["Altar de Cráneos","F",105,"skull-altar"],["Cañón de Cráneos","M",100,"skull-cannon"],["Señor de los Cráneos","P",85,"skullmaster"],["Despojacráneos","H",85,"skulltaker"],["Bilisgaitero chapuzas","P",55,"sloppity-bilepiper"],["Aplastador de almas","V",180,"soul-grinder"],["Bestia del Caos Espinosa","N",145,"spined-chaos-beast",1],["Escriba plagarruina","P",60,"spoilpox-scrivener"],["Syll'esske","H",120,"syll-esske"],["Los Escribas Azules","H",75,"the-blue-scribes"],["El Cambiante","H",105,"the-changeling"],["La Máscara de Slaanesh","H",95,"the-masque-of-slaanesh"],["Portatormentos","P",135,"tormentbringer"],["Tejetrances","P",60,"tranceweaver"],["Zarakynel","H",320,"zarakynel",1]],"chaos-knights":[["Caballero Asterius Acastus del Caos","V",785,"chaos-acastus-knight-asterius"],["Caballero porfirión Acastus del Caos","V",725,"chaos-acastus-knight-porphyrion"],["Caballero aquerón Cerastus del Caos","P",370,"chaos-cerastus-knight-acheron"],["Caballero Atrapos Cerastus del Caos","P",385,"chaos-cerastus-knight-atrapos"],["Caballero castigador Cerastus del Caos","P",370,"chaos-cerastus-knight-castigator"],["Caballero lancero Cerastus del Caos","P",385,"chaos-cerastus-knight-lancer"],["Caballero Questoris del Caos Magaera","P",375,"chaos-questoris-knight-magaera"],["Caballero Questoris del Caos Styrix","P",365,"chaos-questoris-knight-styrix"],["Titán Reaver del Caos","V",2200,"chaos-reaver-titan"],["Titán Warbringer Nemesis del Caos","V",2600,"chaos-warbringer-nemesis-titan"],["Titán Warhound del Caos","V",1100,"chaos-warhound-titan"],["Titán Warlord del Caos","V",3500,"chaos-warlord-titan"],["Caballero abominable","P",350,"knight-abominant"],["Caballero execrador","P",350,"knight-desecrator"],["Caballero expoliador","P",360,"knight-despoiler"],["Caballero masacrador","P",350,"knight-rampager"],["Caballero portarruina","P",325,"knight-ruinator"],["Caballero tirano","P",390,"knight-tyrant"],["Perro de la guerra forajido","V",135,"war-dog-brigand"],["Perro de la guerra verdugo","V",130,"war-dog-executioner"],["Perro de la guerra cazador","V",135,"war-dog-huntsman"],["Perro de la guerra karnívoro","V",145,"war-dog-karnivore"],["Perro de la guerra Moirax","V",150,"war-dog-moirax"],["Perro de la guerra acechador","V",135,"war-dog-stalker"]],"chaos-space-marines":[["Abaddon el Saqueador","H",300,"abaddon-the-despoiler"],["Cultistas Malditos","I",90,"accursed-cultists",0,[[8,90],[16,185]]],["Carnicero de Sangre","V",160,"blood-slaughterer",1],["Cerberus","V",270,"cerberus",1],["Motoristas del Caos","M",80,"chaos-bikers",0,[[3,80],[6,150]]],["Predator Deimos del Caos","V",115,"chaos-deimos-predator",1],["Land Raider del Caos","V",220,"chaos-land-raider"],["Señor del Caos","P",95,"chaos-lord"],["Señor del Caos con armadura exterminador","P",90,"chaos-lord-in-terminator-armour"],["Señor del Caos en Moto","P",95,"chaos-lord-on-bike",1],["Señor del Caos en Disco de Tzeentch","P",100,"chaos-lord-on-disc-of-tzeentch",1],["Señor del Caos sobre Juggernaut","P",115,"chaos-lord-on-juggernaut",1],["Señor del Caos en Palanquín de Nurgle","P",90,"chaos-lord-on-palanquin-of-nurgle",1],["Señor del Caos en Corcel de Slaanesh","P",100,"chaos-lord-on-steed-of-slaanesh",1],["Señor del Caos con propulsor de salto","P",85,"chaos-lord-with-jump-pack"],["Predator del Caos aniquilador","V",140,"chaos-predator-annihilator"],["Predator del Caos Destructor","V",145,"chaos-predator-destructor"],["Rhino del Caos","T",65,"chaos-rhino"],["Engendro del Caos","B",60,"chaos-spawn"],["Escuadra de Exterminadores del Caos","I",185,"chaos-terminator-squad",0,[[5,185],[10,370]]],["Thunderhawk del Caos","V",840,"chaos-thunderhawk",1],["Vindicator del Caos","V",180,"chaos-vindicator"],["Elegidos","I",140,"chosen",0,[[5,140],[10,280]]],["Instigador cultista","P",45,"cultist-firebrand"],["Turba de Cultistas","L",50,"cultist-mob",0,[[10,50],[20,90]]],["Turba de Cultistas con Armas de Fuego","L",50,"cultist-mob-with-firearms",1,[[10,50],[20,100]]],["Cypher","H",95,"cypher"],["Apóstol Oscuro","P",70,"dark-apostle"],["Congregación oscura","P",90,"dark-commune"],["Decimator","V",165,"decimator",1],["Profanador","V",300,"defiler"],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Cápsula de Desembarco Dreadclaw","V",115,"dreadclaw-drop-pod",1],["Campeón Exaltado","P",70,"exalted-champion",1],["Fabius bilis","H",110,"fabius-bile"],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Hombres bestia expoliagores","I",60,"fellgor-beastmen"],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Diablo de la Forja","V",155,"forgefiend"],["Infectados por la Viruela de Geller","I",125,"gellerpox-infected",1],["Gran Dron de la Plaga","V",150,"greater-blight-drone",1],["Gran Escorpión de Bronce","V",500,"greater-brass-scorpion",1],["Haarken reclamamundos","H",95,"haarken-worldclaimer"],["Aniquiladores","I",135,"havocs"],["Bruto infernal","V",125,"helbrute"],["Dragón infernal","V",175,"heldrake"],["Espada Infernal","V",115,"hell-blade",1],["Garra Infernal","V",140,"hell-talon",1],["Príncipe Daemon de los Astartes herejes","P",155,"heretic-astartes-daemon-prince"],["Príncipe Daemon de los Astartes herejes con alas","P",170,"heretic-astartes-daemon-prince-with-wings"],["Huron Corazón Negro","H",135,"huron-blackheart"],["Garra de Asalto Kharybdis","V",300,"kharybdis-assault-claw",1],["Bersérkeres de Khorne","L",170,"khorne-berzerkers",0,[[10,170],[20,330]]],["Señor de los Cráneos de Khorne","V",450,"khorne-lord-of-skulls"],["Kratos","V",240,"kratos",1],["Kravek Morne","H",130,"kravek-morne"],["Devastador Kytan","V",400,"kytan-ravager",1],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Legionarios","L",95,"legionaries",0,[[5,95],[10,180]]],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Señor de la discordia en acechante infernal","P",155,"lord-discordant-on-helstalker"],["Maestro verdugo","P",75,"master-of-executions"],["Maestro de la posesión","P",65,"master-of-possession"],["Amos del torbellino","H",150,"masters-of-the-maelstrom"],["Mastodon","V",540,"mastodon",1],["Diablo despedazador","V",125,"maulerfiend"],["Mutiladores","I",165,"mutilators"],["Alimaña Mutoide","E",85,"mutoid-vermin",1],["Cultistas Negavolt","I",55,"negavolt-cultists",1],["Garra némesis","I",105,"nemesis-claw",0,[[5,105],[10,190]]],["Corona de noctilita","F",125,"noctilith-crown"],["Marines ruidosos","I",160,"noise-marines"],["Arrasadores","I",160,"obliterators"],["Marines de Plaga","L",90,"plague-marines",0,[[5,90],[7,125],[10,175]]],["Poseídos","I",130,"possessed",0,[[5,130],[10,260]]],["Portador Rapier","V",90,"rapier-carrier",1],["Rapaces","I",115,"raptors",0,[[5,115],[10,225]]],["Asaltantes corsarios rojos","I",120,"red-corsairs-raiders",0,[[5,120],[10,220]]],["Capitán de pillaje de los corsarios rojos","P",65,"red-corsairs-reave-captain"],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Ejecutor Renegado","P",65,"renegade-enforcer",1],["Escuadra de Armas Pesadas Renegada","I",75,"renegade-heavy-weapons-squad",1],["Domador de Bestias Ogrete Renegado","B",40,"renegade-ogryn-beast-handler",1,[[4,40],[7,70]]],["Brutos Ogretes Renegados","I",95,"renegade-ogryn-brutes",1],["Ogretes de Plaga Renegados","I",95,"renegade-plague-ogryns",1],["Psíquico Renegado","P",60,"rogue-psyker",1],["Marines rúbrica","L",115,"rubric-marines",0,[[5,115],[10,210]]],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Hechicero","P",65,"sorcerer"],["Hechicero con armadura exterminador","P",85,"sorcerer-in-terminator-armour"],["Hechicero en Moto","P",75,"sorcerer-on-bike",1],["Hechicero en Disco de Tzeentch","P",80,"sorcerer-on-disc-of-tzeentch",1],["Hechicero en Palanquín de Nurgle","P",80,"sorcerer-on-palanquin-of-nurgle",1],["Hechicero en Corcel de Slaanesh","P",85,"sorcerer-on-steed-of-slaanesh",1],["Spartan","V",300,"spartan",1],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Ejecutor Traidor","P",70,"traitor-enforcer"],["Escuadra de Guardias Traidores","I",65,"traitor-guardsmen-squad"],["Typhon","V",320,"typhon",1],["Vashtorr el arquífice","H",220,"vashtorr-the-arkifane"],["Cianurántula","V",120,"venomcrawler"],["Espolones de la disformidad","I",130,"warp-talons",0,[[5,130],[10,290]]],["Herrero disforme","P",65,"warpsmith"],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"dark-angels":[["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario","P",45,"apothecary"],["Apotecario Biologis","P",60,"apothecary-biologis"],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Asmodai","H",80,"asmodai"],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Azrael","H",150,"azrael"],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Belial","H",100,"belial"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Escuadra de Mando","I",165,"command-squad",1],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Escuadra de Mando del Ala de Muerte","I",200,"deathwing-command-squad",1,[[5,200],[10,400]]],["Caballeros del Ala de Muerte","I",255,"deathwing-knights"],["Maestro de Ataque del Ala de Muerte","P",80,"deathwing-strikemaster",1],["Escuadra de Exterminadores del Ala de Muerte","I",190,"deathwing-terminator-squad",0,[[5,190],[10,380]]],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Escuadra Devastadora","I",120,"devastator-squad",1,[[5,120],[10,200]]],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Ezekiel","H",110,"ezekiel"],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Gladiator lancero","V",160,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",165,"gladiator-valiant"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Camaradas del círculo interior","I",90,"inner-circle-companions",0,[[3,90],[6,180]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kratos","V",240,"kratos",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Land Speeder venganza","V",150,"land-speeder-vengeance"],["Lazarus","H",80,"lazarus"],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Bibliotecario","P",75,"librarian"],["Bibliotecario con Armadura Phobos","P",75,"librarian-in-phobos-armour"],["Bibliotecario con armadura exterminador","P",80,"librarian-in-terminator-armour"],["Bibliotecario en Moto","P",80,"librarian-on-bike",1],["Bibliotecario con Retrorreactor","P",75,"librarian-with-jump-pack",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Lion El'Jonson","H",415,"lion-el-jonson"],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Caza Nephilim","V",200,"nephilim-jetfighter"],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Portador Rapier","V",90,"rapier-carrier",1],["Caballero negro del Ala de Cuervo","M",85,"ravenwing-black-knights",0,[[3,85],[6,170]]],["Escuadra de Mando del Ala de Cuervo","M",115,"ravenwing-command-squad"],["Espolón del Ala de Cuervo","V",190,"ravenwing-dark-talon"],["Mortaja del Ala de Cuervo","V",80,"ravenwing-darkshroud"],["Maestro de Garras del Ala de Cuervo","P",105,"ravenwing-talonmaster",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",260,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Sammael","H",120,"sammael"],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"scout-squad",0,[[5,65],[10,120]]],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Escuadra Táctica","L",140,"tactical-squad",1],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Typhon","V",320,"typhon",1],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",165,"venerable-dreadnought",1],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"death-guard":[["Bestias de Nurgle","B",70,"beasts-of-nurgle",0,[[1,70],[2,140]]],["Biologus putrefacto","P",60,"biologus-putrifier"],["Exterminadores dominaplagas","I",115,"blightlord-terminators",0,[[3,115],[5,185],[10,370]]],["Cerberus","V",270,"cerberus",1],["Land Raider del Caos","V",220,"chaos-land-raider"],["Señor del Caos en Palanquín de Nurgle","P",90,"chaos-lord-on-palanquin-of-nurgle",1],["Predator del Caos aniquilador","V",130,"chaos-predator-annihilator"],["Predator del Caos Destructor","V",140,"chaos-predator-destructor"],["Rhino del Caos","T",75,"chaos-rhino"],["Engendro del Caos","B",80,"chaos-spawn"],["Thunderhawk del Caos","V",840,"chaos-thunderhawk",1],["Príncipe Daemon de Nurgle","P",185,"daemon-prince-of-nurgle"],["Príncipe Daemon de Nurgle alado","P",160,"daemon-prince-of-nurgle-with-wings"],["Señor del Caos de la Guardia de la Muerte","P",65,"death-guard-chaos-lord",1],["Señor del Caos de la Guardia de la Muerte con Armadura de Exterminador","P",85,"death-guard-chaos-lord-in-terminator-armour",1],["Cultistas de la Guardia de la Muerte","I",50,"death-guard-cultists",1,[[10,50],[20,100]]],["Poseídos de la Guardia de la Muerte","I",155,"death-guard-possessed",1,[[5,155],[10,310]]],["Hechicero de la Guardia de la Muerte con Armadura de Exterminador","P",70,"death-guard-sorcerer-in-terminator-armour",1],["Exterminadores sudario de Muerte","I",150,"deathshroud-terminators",0,[[3,150],[6,305]]],["Profanador","V",300,"defiler"],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Dron fétido","V",100,"foetid-bloat-drone"],["Dron fétido con lanzaplagas","V",125,"foetid-bloat-drone-with-heavy-blight-launcher"],["Engendraplagas hediondo","P",60,"foul-blightspawn"],["Infectados por la Viruela de Geller","I",125,"gellerpox-infected",1],["Gran Inmundicia","P",265,"great-unclean-one"],["Gran Dron de la Plaga","V",150,"greater-blight-drone",1],["Bruto infernal","V",105,"helbrute"],["Espada Infernal","V",115,"hell-blade",1],["Garra Infernal","V",140,"hell-talon",1],["Portaicono","P",45,"icon-bearer"],["Kratos","V",240,"kratos",1],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Señor del Contagio","P",110,"lord-of-contagion"],["Señor de las Viruelas","P",65,"lord-of-poxes"],["Señor de la Virulencia","P",90,"lord-of-virulence"],["Conjuraplagas maligno","P",60,"malignant-plaguecaster"],["Mastodon","V",540,"mastodon",1],["Malignificador miásmico","F",105,"miasmic-malignifier"],["Mortarion","H",375,"mortarion"],["Alimaña Mutoide","E",85,"mutoid-vermin",1],["Cargaplagas mefíticos","V",95,"myphitic-blight-haulers",0,[[1,95],[2,190]]],["Pestífero nocivo","P",50,"noxious-blightbringer"],["Nurgletes","E",45,"nurglings",0,[[3,45],[6,90]]],["Zánganos de Plaga","M",110,"plague-drones",0,[[3,110],[6,220]]],["Marines de Plaga","L",90,"plague-marines",0,[[5,90],[7,125],[10,175]]],["Cirujano de Plaga","P",50,"plague-surgeon"],["Portadores de Plaga","L",115,"plaguebearers"],["Reptador revientaplagas","V",170,"plagueburst-crawler"],["Plagabundos","I",65,"poxwalkers",0,[[10,65],[20,130]]],["Portador Rapier","V",90,"rapier-carrier",1],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Putrigus","H",280,"rotigus"],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Hechicero en Palanquín de Nurgle","P",80,"sorcerer-on-palanquin-of-nurgle",1],["Spartan","V",300,"spartan",1],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Cuentaplagas","P",60,"tallyman"],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Typhon","V",320,"typhon",1],["Typhus","H",90,"typhus"],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"deathwatch":[["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario","P",45,"apothecary"],["Apotecario Biologis","P",60,"apothecary-biologis"],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Escuadra de Mando","I",165,"command-squad",1],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Corvus Blackstar","V",180,"corvus-blackstar"],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Escuadra de exterminadores vigías de la Muerte","I",190,"deathwatch-terminator-squad",0,[[5,190],[10,380]]],["Veteranos vigías","L",115,"deathwatch-veterans",0,[[5,115],[10,220]]],["Comando Decimus","L",110,"decimus-kill-team",0,[[5,110],[10,210]]],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Comando Fortis","I",210,"fortis-kill-team"],["Gladiator lancero","V",160,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",165,"gladiator-valiant"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Comando Indomitor","I",280,"indomitor-kill-team"],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kratos","V",240,"kratos",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Bibliotecario","P",75,"librarian"],["Bibliotecario con Armadura Phobos","P",75,"librarian-in-phobos-armour"],["Bibliotecario con armadura exterminador","P",80,"librarian-in-terminator-armour"],["Bibliotecario en Moto","P",80,"librarian-on-bike",1],["Bibliotecario con Retrorreactor","P",75,"librarian-with-jump-pack",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Portador Rapier","V",90,"rapier-carrier",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",260,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"codex-scout-squad",0,[[5,65],[10,120]]],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Comando Spectrus","I",185,"spectrus-kill-team"],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Comando espolón","I",280,"talonstrike-kill-team"],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"codex-terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"codex-terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Typhon","V",320,"typhon",1],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",165,"venerable-dreadnought",1],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Capitán vigía Artemis","H",75,"watch-captain-artemis"],["Señor vigía","P",105,"watch-master"],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"drukhari":[["Arconte","P",80,"archon"],["Señor de las Bestias","P",135,"beastmaster",1],["Corte del Arconte","I",95,"court-of-the-archon",1],["Cronos","N",55,"cronos",0,[[1,55],[2,100]]],["Drazhar","H",85,"drazhar"],["Grotescos","I",80,"grotesques",1,[[3,80],[6,170]]],["Hemónculo","P",50,"haemonculus"],["Mano del Arconte","I",115,"hand-of-the-archon"],["Infernales","M",90,"hellions",0,[[5,90],[10,180]]],["Íncubos","I",90,"incubi",0,[[5,90],[10,180]]],["Guerreros kabalistas","L",110,"kabalite-warriors"],["Dama Malys","H",100,"lady-malys"],["Lelith Hesperax","H",80,"lelith-hesperax"],["Mandrágoras","I",80,"mandrakes",0,[[5,80],[10,160]]],["Incursor","T",75,"raider"],["Expoliador","V",110,"ravager"],["Caza de Ataque Raven","V",170,"raven-strike-fighter",1],["Caza a reacción estilete","V",170,"razorwing-jetfighter"],["Segador","V",115,"reaper",1],["Guadañas","M",75,"reavers",0,[[3,75],[6,150]]],["Azotes con Armas Pesadas","I",110,"scourges-with-heavy-weapons"],["Azotes con carabinas cristalinas","I",75,"scourges-with-shardcarbines"],["Súcubo","P",50,"succubus"],["Talos","N",70,"talos",0,[[1,70],[2,140]]],["Tantalus","V",230,"tantalus",1],["Urien Rakarth","H",80,"urien-rakarth",1],["Ponzoña","T",65,"venom"],["Bombardero Cuervo","V",245,"voidraven-bomber"],["Atormentados","L",55,"wracks",0,[[5,55],[8,90],[10,110]]],["Brujas","L",90,"wyches"]],"emperors-children":[["Land Raider del Caos","V",210,"chaos-land-raider"],["Rhino del Caos","T",70,"chaos-rhino"],["Engendro del Caos","B",70,"chaos-spawn"],["Exterminadores del Caos","I",155,"chaos-terminators"],["Príncipe Daemon de Slaanesh","P",165,"daemon-prince-of-slaanesh"],["Príncipe Daemon de Slaanesh alado","P",205,"daemon-prince-of-slaanesh-with-wings"],["Diablillas","L",100,"daemonettes"],["Profanador","V",300,"defiler"],["Diablos","B",90,"fiends",0,[[3,90],[6,190]]],["Filos impecables","I",95,"flawless-blades",0,[[3,95],[6,190]]],["Fulgrim","H",340,"fulgrim"],["Dragón infernal","V",175,"heldrake"],["Infractores","L",95,"infractors",0,[[5,95],[10,175]]],["Guardián de los Secretos","P",265,"keeper-of-secrets"],["Lord exultante","P",95,"lord-exultant"],["Señor kakofonista","P",70,"lord-kakophonist"],["Lucius el sempiterno","H",130,"lucius-the-eternal"],["Diablo despedazador","V",120,"maulerfiend"],["Marines ruidosos","I",160,"noise-marines"],["Buscadores","M",85,"seekers",0,[[5,85],[10,155]]],["Shalaxi Helbane","H",315,"shalaxi-helbane"],["Hechicero","P",55,"sorcerer"],["Torturadores","L",85,"tormentors",0,[[5,85],[10,170]]]],"genestealer-cults":[["Aberrantes","I",140,"aberrants",0,[[5,140],[10,280]]],["Abominante","P",85,"abominant"],["Cruzacrestas aquiles","V",95,"achilles-ridgerunners",0,[[1,95],[2,160]]],["Híbridos acólitos con pistola automática","L",65,"acolyte-hybrids-with-autopistols",0,[[5,65],[10,120]]],["Híbridos acólitos con pistola lanzallamas","L",75,"acolyte-hybrids-with-hand-flamers",0,[[5,75],[10,140]]],["Acólito guardaicono","P",50,"acolyte-iconward"],["Chacales Atalanos","M",85,"atalan-jackals",0,[[5,85],[10,150],[9,160]]],["Benefictus","P",75,"benefictus"],["Biófago","P",50,"biophagus"],["Clamavus","P",50,"clamavus"],["Goliath triturarrocas","V",110,"goliath-rockgrinder"],["Camión Goliath","T",75,"goliath-truck"],["Híbridos metamorfos","I",75,"hybrid-metamorphs",0,[[5,75],[10,140]]],["Chacal Alphus","P",55,"jackal-alphus"],["Kelermorfo","P",60,"kelermorph"],["Locus","P",35,"locus"],["Magus","P",50,"magus"],["Híbridos Neófitos","L",70,"neophyte-hybrids",0,[[10,70],[20,135]]],["Nexos","P",50,"nexos"],["Patriarca","P",80,"patriarch"],["Primus","P",60,"primus"],["Genestealers Puros","I",75,"purestrain-genestealers",0,[[5,75],[10,140]]],["Saboteadora Reductus","P",70,"reductus-saboteur"],["Sanctus","P",60,"sanctus"],["Perforadora Tectónica","F",125,"tectonic-fragdrill",1]],"grey-knights":[["Hermano Capitán","P",100,"brother-captain"],["Hermano Capitán Stern","H",90,"brother-captain-stern",1],["Campeón de la hermandad","P",75,"brotherhood-champion"],["Capellán de la hermandad","P",70,"brotherhood-chaplain"],["Bibliotecario de la hermandad","P",95,"brotherhood-librarian"],["Tecnomarine de la hermandad","P",75,"brotherhood-techmarine"],["Escuadra de exterminadores de la hermandad","L",150,"brotherhood-terminator-squad",0,[[4,150],[5,185],[8,315],[10,380]]],["Castellano Crowe","H",105,"castellan-crowe"],["Gran Maestre","P",100,"grand-master"],["Gran Maestre en servoterror némesis","P",210,"grand-master-in-nemesis-dreadknight"],["Gran Maestre Voldus","H",130,"grand-master-voldus"],["Dreadnought de los Caballeros Grises","V",160,"grey-knights-dreadnought",1],["Razorback Reliquia de los Caballeros Grises","T",95,"grey-knights-relic-razorback",1],["Cañonera Thunderhawk de los Caballeros Grises","V",805,"grey-knights-thunderhawk-gunship"],["Escuadra interceptora","I",135,"interceptor-squad",0,[[5,135],[10,270]]],["Kaldor Draigo","H",125,"kaldor-draigo",1],["Land Raider","V",220,"land-raider"],["Land Raider cruzado","V",220,"land-raider-crusader"],["Land Raider redentor","V",260,"land-raider-redeemer"],["Servoterror némesis","V",205,"nemesis-dreadknight"],["Escuadra de Paladines","I",185,"paladin-squad",0,[[4,185],[5,230],[8,385],[10,490]]],["Escuadra de purgadores","I",115,"purgation-squad",0,[[5,115],[10,230]]],["Escuadra de Purificadores","I",145,"purifier-squad",0,[[5,145],[10,290]]],["Razorback","T",75,"razorback"],["Rhino","T",70,"rhino"],["Servidores","I",60,"servitors",1],["Interceptor Stormhawk","V",160,"stormhawk-interceptor"],["Cañonera Stormraven","V",280,"stormraven-gunship"],["Cañonera Stormtalon","V",170,"stormtalon-gunship"],["Escuadra de Choque","L",125,"strike-squad",0,[[5,125],[10,250]]],["Dreadnought Venerable","P",130,"venerable-dreadnought"]],"imperial-agents":[["Comando aquila","L",110,"aquila-kill-team",0,[[5,110],[10,210]]],["Asesino Callidus","H",100,"callidus-assassin"],["Corvus Blackstar","V",180,"corvus-blackstar"],["Asesino Culexus","H",85,"culexus-assassin"],["Huésped Demoníaco","I",40,"daemonhost",1,[[1,40],[2,80]]],["Legionarios Condenados","I",90,"damned-legionnaires",1,[[5,90],[10,180]]],["Comando vigías de la Muerte","L",115,"deathwatch-kill-team",0,[[5,115],[10,220]]],["Escuadra de exterminadores vigías de la Muerte","I",210,"deathwatch-terminator-squad",1,[[5,210],[10,420]]],["Asesino Eversor","H",100,"eversor-assassin"],["Escuadra de Exacción","I",90,"exaction-squad"],["Comando Fortis","I",100,"fortis-kill-team",1,[[5,100],[10,200]]],["Escuadra de Exterminadores de los Caballeros Grises","I",175,"grey-knights-terminator-squad"],["Abordadores de la Armada Imperial","L",90,"imperial-navy-breachers"],["Rhino Imperial","T",65,"imperial-rhino"],["Comando Indomitor","I",120,"indomitor-kill-team",1,[[5,120],[10,240]]],["Inquisidor","P",55,"inquisitor"],["Inquisidor Coteaz","H",75,"inquisitor-coteaz"],["Inquisidora Draxus","H",75,"inquisitor-draxus"],["Inquisidor Eisenhorn","H",65,"inquisitor-eisenhorn",1],["Inquisidora Greyfax","H",65,"inquisitor-greyfax"],["Inquisidor con Armadura de Exterminador","P",70,"inquisitor-in-terminator-armour",1],["Inquisidor Karamazov","H",140,"inquisitor-karamazov",1],["Inquisidor Kroyle","H",100,"inquisitor-kroyle"],["Inquisidor Ostromandeus","H",65,"inquisitor-ostromandeus",1],["Operativos inquisitoriales","I",50,"inquisitorial-agents",0,[[6,50],[12,100]]],["Chimera Inquisitorial","T",60,"inquisitorial-chimera"],["Janus Draik","H",40,"janus-draik",1],["Armero Jokaero","P",30,"jokaero-weaponsmith",1],["Kill Team Cassius","H",220,"kill-team-cassius",1],["Sacerdote del Ministorum","P",40,"ministorum-priest"],["Navegante","P",60,"navigator"],["Neyam Shai Murad","H",40,"neyam-shai-murad",1],["Kill Team Proteus","I",160,"proteus-kill-team",1,[[5,160],[10,320]]],["Séquito comerciante independiente","P",75,"rogue-trader-entourage"],["Santificadores","I",100,"sanctifiers"],["Immolator de las Hermanas de Batalla","T",90,"sisters-of-battle-immolator"],["Escuadra de Hermanas de Batalla","I",100,"sisters-of-battle-squad"],["Comando Spectrus","I",90,"spectrus-kill-team",1,[[5,90],[10,180]]],["Escuadra sojuzgadores","I",85,"subductor-squad"],["UR-025","H",55,"ur-025",1],["Escuadra de Motos Veteranas","M",70,"veteran-bike-squad",1,[[3,70],[6,140]]],["Escuadra Vigilante","L",85,"vigilant-squad"],["Asesino Vindicare","H",110,"vindicare-assassin"],["Infantes del vacío","I",50,"voidsmen-at-arms"],["Capitán vigía Artemis","H",75,"watch-captain-artemis"],["Señor vigía","P",105,"watch-master"]],"imperial-knights":[["Caballero Asterius Acastus","V",785,"acastus-knight-asterius"],["Caballero asterius porfirión","V",725,"acastus-knight-porphyrion"],["Helverin Armiger","V",140,"armiger-helverin"],["Moirax Armiger","V",150,"armiger-moirax"],["Espada de guerra Armiger","V",140,"armiger-warglaive"],["Canis Rex","H",415,"canis-rex"],["Caballero aquerón Cerastus","P",380,"cerastus-knight-acheron"],["Caballero Atrapos Cerastus","P",420,"cerastus-knight-atrapos"],["Caballero castigador Cerastus","P",380,"cerastus-knight-castigator"],["Caballero lancero Cerastus","P",415,"cerastus-knight-lancer"],["Caballero Castellano","P",425,"knight-castellan"],["Cruzados","P",395,"knight-crusader"],["Caballero defensor","P",385,"knight-defender"],["Caballero destrero","P",265,"knight-destrier"],["Caballero errante","P",355,"knight-errant"],["Caballero gallardo","P",355,"knight-gallant"],["Caballero Paladín","P",375,"knight-paladin"],["Caballero Preceptor","P",365,"knight-preceptor"],["Caballero valeroso","P",390,"knight-valiant"],["Caballero guardián","P",365,"knight-warden"],["Caballero Questoris Magaera","P",385,"questoris-knight-magaera"],["Caballero Questoris Styrix","P",375,"questoris-knight-styrix"],["Titán Reaver","V",2200,"reaver-titan"],["Titán Warbringer Nemesis","V",2600,"warbringer-nemesis-titan"],["Titán Warhound","V",1100,"warhound-titan"],["Titán Warlord","V",3500,"warlord-titan"]],"leagues-of-votann":[["Evaluador arkanista","P",70,"arkanyst-evaluator"],["Berehk Stornbröw","H",85,"berehk-stornbrow"],["Ferromaestro Brôkhyr","P",70,"brokhyr-iron-master"],["Estruendosos Brôkhyr","I",80,"brokhyr-thunderkyn",0,[[3,80],[6,170]]],["Buri Aegnirssen","H",85,"buri-aegnirssen"],["Beserkes cthonianos","I",90,"cthonian-beserks",0,[[5,90],[10,180]]],["Sacudidores cthonianos","I",100,"cthonian-earthshakers"],["Campeón Einhyr","P",65,"einhyr-champion"],["Guardamoradas Einhyr","I",130,"einhyr-hearthguard",0,[[5,130],[10,270]]],["Grimnyr","P",65,"grimnyr"],["Sucesores","L",90,"hearthkyn-warriors"],["Terrabastión Hekaton","V",250,"hekaton-land-fortress"],["Pioneros Hernkyn","M",85,"hernkyn-pioneers",0,[[3,85],[6,170]]],["Yaegirs Hernkyn","I",90,"hernkyn-yaegirs"],["Acerobreros ferrofamiliares con desintegradores volkanitas pesados","I",80,"ironkin-steeljacks-with-heavy-volkanite-disintegrators",0,[[3,80],[6,170]]],["Acerobreros ferrofamiliares con armas de combate","I",75,"ironkin-steeljacks-with-melee-weapons",0,[[3,75],[6,150]]],["Kâhl","P",65,"kahl"],["Káprica carguero","T",70,"kapricus-carrier"],["Kápricas defensores","V",75,"kapricus-defenders",0,[[1,75],[2,150]]],["Estratega Memnyr","P",45,"memnyr-strategist"],["Sagitauro","T",85,"sagitaur"],["ûthar el Destinado","H",100,"uthar-the-destined"]],"necrons":[["Plataforma de aniquilación","V",100,"annihilation-barge"],["Anrakyr el Viajero","H",95,"anrakyr-the-traveller",1],["Fragmento de c’tan del embaucador","H",330,"c-tan-shard-of-the-deceiver"],["Fragmento de c’tan del portador de la noche","H",360,"c-tan-shard-of-the-nightbringer"],["Fragmento de c’tan del Dragón de vacío","H",345,"c-tan-shard-of-the-void-dragon"],["Acantritas Canoptek","B",85,"canoptek-acanthrites",1,[[3,85],[6,170]]],["Destructor acechante canóptico","V",130,"canoptek-doomstalker"],["Macrocitos canópticos","B",70,"canoptek-macrocytes"],["Reanimador canóptico","V",75,"canoptek-reanimator"],["Enjambres canópticos escarabeo","E",40,"canoptek-scarab-swarms",0,[[3,40],[6,80]]],["Arañas canópticas","V",65,"canoptek-spyders",0,[[1,65],[2,110]]],["Trepatumbas canópticos","B",60,"canoptek-tomb-crawlers"],["Centinela de Tumba Canoptek","N",115,"canoptek-tomb-sentinel",1],["Acechador de Tumba Canoptek","N",130,"canoptek-tomb-stalker",1],["Espectros canópticos","B",95,"canoptek-wraiths",0,[[3,95],[6,220]]],["Plataforma de mando catacumba","P",120,"catacomb-command-barge"],["Cronomante","P",70,"chronomancer"],["Convergencia de Dominio","F",60,"convergence-of-dominion",0,[[1,60],[2,120],[3,180]]],["Criptosiervos","I",60,"cryptothralls"],["Omnicidas","I",60,"deathmarks",0,[[5,60],[10,120]]],["Guadaña de la Muerte","V",200,"doom-scythe"],["Arca del exterminio","V",200,"doomsday-ark"],["Desolladores","I",55,"flayed-ones",0,[[5,55],[10,100]]],["Pilón Gauss","F",210,"gauss-pylon",1],["Geomante","P",75,"geomancer"],["Arca Fantasma","T",100,"ghost-ark"],["Destructor maldicida","P",75,"hexmark-destroyer"],["Illuminor Szeras","H",175,"illuminor-szeras"],["Inmortales","L",65,"immortals",0,[[5,65],[10,130]]],["Imotekh el Señor de la tormenta","H",100,"imotekh-the-stormlord"],["Destructores Lokhust","M",40,"lokhust-destroyers",0,[[1,40],[2,55],[3,80],[6,190]]],["Destructores Lokhust pesados","M",50,"lokhust-heavy-destroyers",0,[[1,50],[2,100],[3,165]]],["Señor Lokhust","P",80,"lokhust-lord"],["Señor","P",65,"lord",1],["Necroguardia","I",80,"lychguard",0,[[5,80],[10,160]]],["Monolito","V",420,"monolith"],["Guerreros Necrones","L",85,"necron-warriors",0,[[10,85],[20,190]]],["Nekrosor Ammentar","H",195,"nekrosor-ammentar"],["Nemesor Zahndrekh","H",85,"nemesor-zahndrekh",1],["Guadaña de la noche","V",125,"night-scythe"],["Manto Nocturno","V",140,"night-shroud",1],["Obelisco","V",280,"obelisk"],["Destructores ofidianos","I",80,"ophydian-destroyers",0,[[3,80],[6,150]]],["Orikan el Adivino","H",90,"orikan-the-diviner"],["Overlord","P",90,"overlord"],["Señor supremo con mortaja de translocación","P",90,"overlord-with-translocation-shroud"],["Plasmante","P",60,"plasmancer"],["Psicomante","P",65,"psychomancer"],["Guardia real","P",50,"royal-warden"],["Pilones Centinela","F",120,"sentry-pylons",1],["Constructo Pesado Seraptek","V",540,"seraptek-heavy-construct"],["Destructores Skorpekh","I",85,"skorpekh-destroyers",0,[[3,85],[6,170]]],["Señor Skorpekh","P",95,"skorpekh-lord"],["Tecnomante","P",80,"technomancer"],["Arca Teseracto","V",130,"tesseract-ark",1],["Bóveda teseráctica","V",465,"tesseract-vault"],["El rey silente","H",420,"the-silent-king"],["Cuchillas de la necrópolis","M",70,"tomb-blades",0,[[3,70],[6,140]]],["Murallas de la Ciudadela Tumba","F",180,"tomb-citadel-walls",1],["C’tan transcendente","P",340,"transcendent-c-tan"],["Trazyn el Infinito","H",60,"trazyn-the-infinite"],["Pretorianos de la triarca","I",80,"triarch-praetorians",0,[[5,80],[10,160]]],["Acechante de la triarca","V",110,"triarch-stalker"],["Vargard Obyron","H",85,"vargard-obyron",1]],"orks":[["Kaza de Ataque","V",100,"attack-fighta",1],["Noble inzignia","P",30,"bannernob"],["Karro de Guerra","V",160,"battlewagon"],["Chikoz trinkabeztiaz","L",80,"beast-snagga-boyz",0,[[10,80],[20,160]]],["Kabezilla","P",85,"beastboss"],["Kabezilla en garrapatozaurio","P",140,"beastboss-on-squigosaur"],["Grandez Armaz","V",20,"big-gunz",1,[[1,20],[2,40]]],["Mekániko","P",100,"big-mek"],["Mechadakka de mekániko","P",160,"big-mek-dakkarig"],["Mekániko kon megaarmadura","P",90,"big-mek-in-mega-armour"],["Mekániko en Moto de Guerra","P",105,"big-mek-on-warbike",1],["Mekániko con Campo de Fuerza Kustom","P",55,"big-mek-with-kustom-force-field",1],["Mekániko kon kañón de atake Shokk","P",110,"big-mek-with-shokk-attack-gun"],["Big Trakk","V",90,"big-trakk",1],["Kabezabúnker","F",135,"big-ed-bossbunka"],["Jefazo","P",50,"bigboss"],["Kazabombardero","V",115,"blitza-bommer"],["Jefe Snikrot","H",80,"boss-snikrot"],["Boss Zagstruk","H",90,"boss-zagstruk",1],["Chikoz","L",85,"boyz",0,[[10,85],[20,170]]],["Tronchadorez","I",120,"breaka-boyz"],["Kemadorez","I",60,"burna-boyz",1,[[5,60],[10,120]]],["Kemabombardero","V",125,"burna-bommer"],["Kóptero de Guerra Chinork","V",105,"chinork-warkopta",1],["Da Red Gobbo","H",40,"da-red-gobbo",1],["Dakkarreaktor","V",125,"dakkajet"],["Dreznaut","V",130,"deff-dread"],["Fortaleza de Batalla Deff Rolla","V",250,"deff-rolla-battle-fortress",1],["Deztroziklo","P",80,"deffkilla-wartrike"],["Kópteroz","M",85,"deffkoptas",0,[[3,85],[6,170]]],["Deffkoptas con Rebanadoraz","V",130,"deffkoptas-with-big-shootas",1],["Kaza-Bombardero","V",100,"fighta-bommer",1],["Tipejoz vazilonez","I",110,"flash-gitz",0,[[5,110],[10,220]]],["Garramut gargantuesco","N",500,"gargantuan-squiggoth"],["Ghazghkull Thraka","H",290,"ghazghkull-thraka"],["Gorkonauta","V",325,"gorkanaut"],["Gretchin","I",45,"gretchin",0,[[10,45],[20,80]]],["Lanzabombas Grot","M",50,"grot-bomm-launcha",1],["Megatanque Grot","V",110,"grot-mega-tank",1],["Tanques Grot","V",155,"grot-tanks",1,[[4,155],[8,310]]],["Karrokañón","V",150,"codex-gunwagon"],["Kazaforkma","N",165,"hunta-rig"],["Karro Kañón","V",115,"kannonwagon",1],["Kaptin Badrukk","H",80,"kaptin-badrukk",1],["Kill Krusha","V",230,"kill-krusha",1],["Plataforkma","N",175,"kill-rig"],["Kill Tank","V",300,"kill-tank",1],["Lataz azezinaz","V",130,"killa-kans",0,[[3,130],[6,275]]],["Orkomandoz","I",125,"kommandos"],["Karro Elevador","V",135,"lifta-wagon",1],["Saqueadorez","I",50,"lootas",1,[[5,50],[10,100]]],["Mad Dok Grotsnik","H",65,"mad-dok-grotsnik",1],["Mega Dread","V",225,"mega-dread",1],["Meganoblez","I",70,"meganobz",0,[[2,70],[3,105],[5,175],[6,210]]],["Chapuzaz","P",55,"mek"],["Kañonez de mekániko","V",55,"mek-gunz",0,[[1,55],[2,110],[3,165]]],["Meka-Dread","V",210,"meka-dread",1],["Taller de Mekboy","F",80,"mekboy-workshop",1],["Morkonauta","V",345,"morkanaut"],["Mozrog pezkuezorroto","H",170,"mozrog-skragbad"],["Nazdreg","H",165,"codex-nazdreg"],["Noblez","I",115,"nobz",0,[[5,115],[10,230]]],["Nobz en Motos de Guerra","M",125,"nobz-on-warbikes",1],["Jefe matazanoz","P",60,"painboss"],["Matazanoz","P",45,"painboy"],["Matasanoz en Moto de Guerra","P",85,"painboy-on-warbike",1],["Garrapatonetaz","V",85,"rukkatrukk-squigbuggy",0,[[1,85],[2,160]]],["Kaporal","P",10,"codex-runtherd"],["Kemadorez Buggy","M",45,"skorchas",1,[[1,45],[2,90]]],["Squiggoth","N",150,"squiggoth",1],["Jinetez de garrapatocino","M",130,"squighog-boyz",0,[[4,130],[8,260]]],["Pizoteador","V",700,"stompa"],["Zoldadoz de azalto","I",70,"stormboyz",0,[[5,70],[10,140]]],["Petatankez","I",160,"tankbustas"],["Kamión","T",60,"trukk"],["Ufthak Halcón Negro","H",70,"ufthak-blackhawk",1],["Moteroz","M",75,"warbikers",0,[[3,75],[6,140]]],["Kaudillo","P",100,"warboss"],["Kaudillo kon megaarmadura","P",115,"warboss-in-mega-armour"],["Kaudillo en Moto de Guerra","P",75,"warboss-on-warbike",1],["Buguiz de guerra","V",70,"warbuggies",0,[[1,70],[2,130]]],["Mototankez","M",70,"wartrakk",0,[[1,70],[2,130]]],["Zuperreaktor tuneao","V",215,"wazbom-blastajet"],["Wazdakka Gutsmek","H",200,"wazdakka-gutsmek"],["Eztrambótiko","P",60,"weirdboy"],["Zodgrod verrugozgrod","H",50,"zodgrod-wortsnagga"]],"space-marines":[["Adrax Agatone","H",90,"adrax-agatone"],["Aethon Shaan","H",105,"aethon-shaan"],["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario","P",45,"apothecary"],["Apotecario Biologis","P",60,"apothecary-biologis"],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Caanok Var","H",100,"caanok-var"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán Titus","H",115,"captain-titus"],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Cato Sicarius","H",115,"cato-sicarius"],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán Cassius","H",80,"chaplain-cassius",1],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Bibliotecario Jefe Tigurius","H",115,"chief-librarian-tigurius"],["Escuadra de Mando","I",165,"command-squad",1],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Darnath Lysander","H",160,"darnath-lysander"],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Escuadra Devastadora","I",120,"devastator-squad",1,[[5,120],[10,200]]],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Gladiator lancero","V",160,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",165,"gladiator-valiant"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Padre de Hierro Feirros","H",85,"iron-father-feirros"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kaius Konorius","H",100,"codex-kaius-konorius"],["Kayvaan Shrike","H",95,"kayvaan-shrike"],["Kor'sarro Khan","H",80,"kor-sarro-khan"],["Kratos","V",240,"kratos",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Bibliotecario","P",75,"librarian"],["Bibliotecario con Armadura Phobos","P",75,"librarian-in-phobos-armour"],["Bibliotecario con armadura exterminador","P",80,"librarian-in-terminator-armour"],["Bibliotecario en Moto","P",80,"librarian-on-bike",1],["Bibliotecario con Retrorreactor","P",75,"librarian-with-jump-pack",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Marneus Calgar","H",180,"marneus-calgar-in-armour-of-antilochus"],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Pedro Kantor","H",80,"pedro-kantor",1],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Portador Rapier","V",90,"rapier-carrier",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",260,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Roboute Guilliman","H",415,"roboute-guilliman"],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"scout-squad",0,[[5,65],[10,120]]],["Sargento Chronus","H",75,"sergeant-chronus",1],["Sargento Telion","H",70,"sergeant-telion",1],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Suboden Khan","H",105,"suboden-khan"],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Escuadra Táctica","L",140,"tactical-squad",1],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Tor Garadon","H",90,"tor-garadon"],["Typhon","V",320,"typhon",1],["Veteranos de la Guerra Tiránida","I",85,"tyrannic-war-veterans",1],["Uriel Ventris","H",105,"uriel-ventris",1],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",165,"venerable-dreadnought",1],["Guardia de Honor Victrix","I",120,"victrix-honour-guard",0,[[3,120],[6,250]]],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Vulkan He'stan","H",105,"vulkan-he-stan"],["Guardianes de Ultramar","H",115,"wardens-of-ultramar"],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"space-wolves":[["Escuadra de agresores","I",90,"aggressor-squad",0,[[3,90],[6,180]]],["Anciano","P",40,"ancient"],["Anciano con armadura exterminador","P",75,"ancient-in-terminator-armour"],["Antiguo en Moto","P",90,"ancient-on-bike",1],["Apotecario en Moto","P",65,"apothecary-on-bike",1],["Arjac puñorroca","H",105,"arjac-rockfist"],["Escuadra de intercesores de asalto","L",85,"assault-intercessor-squad",0,[[5,85],[10,170]]],["INTERCESORES DE ASALTO \\nCON PROPULSOR DE SALTO","I",95,"assault-intercessors-with-jump-packs",0,[[5,95],[10,190]]],["Escuadra de Asalto","I",95,"assault-squad",1,[[5,95],[10,190]]],["Escuadra de Asalto con Retrorreactores","I",115,"assault-squad-with-jump-packs",1,[[5,115],[10,230]]],["Servidores Astartes","I",55,"astartes-servitors",1],["Astraeus","V",550,"astraeus"],["Escuadra de Motos de Ataque","M",55,"attack-bike-squad",1,[[1,55],[2,110],[3,165]]],["Dreadnought Ballistus","V",150,"ballistus-dreadnought"],["Escuadra de Motos","M",80,"bike-squad",1,[[3,80],[6,160]]],["Bjorn garra implacable","H",160,"bjorn-the-fell-handed"],["Anciano de ferreaguardia","P",70,"bladeguard-ancient"],["Escuadra de veteranos de ferreaguardia","I",90,"bladeguard-veteran-squad",0,[[3,90],[6,180]]],["Garras Sangrientas","L",150,"blood-claws",0,[[10,150],[20,290]]],["Dreadnought Brutalis","V",160,"brutalis-dreadnought"],["Ariete de Asalto Caestus","V",215,"caestus-assault-ram",1],["Canis Nacido del Lobo","H",75,"canis-wolfborn",1],["Capitán","P",90,"captain"],["Capitán con Armadura Gravis","P",90,"captain-in-gravis-armour"],["Capitán con Armadura Phobos","P",75,"captain-in-phobos-armour"],["Capitán con armadura exterminador","P",90,"captain-in-terminator-armour"],["Capitán en Moto","P",110,"captain-on-bike"],["Capitán con propulsor de salto","P",90,"captain-with-jump-pack"],["Carab Culln el Resucitado","H",250,"carab-culln-the-risen",1],["Escuadra de Asalto Centurion","I",150,"centurion-assault-squad",1,[[3,150],[6,300]]],["Escuadra Devastadora Centurion","I",175,"centurion-devastator-squad",1,[[3,175],[6,350]]],["Cerberus","V",270,"cerberus",1],["Capellán","P",60,"chaplain"],["Capellán con armadura exterminador","P",75,"chaplain-in-terminator-armour"],["Capellán en Moto","P",75,"chaplain-on-bike"],["Dreadnought Venerable Capellán","V",150,"chaplain-venerable-dreadnought",1],["Capellán con propulsor de salto","P",75,"chaplain-with-jump-pack"],["Escuadra de Mando","I",165,"command-squad",1],["Campeón de la Compañía en Moto","P",60,"company-champion-on-bike",1],["Héroes de la Compañía","I",125,"company-heroes"],["Veteranos de la Compañía en Motos","M",110,"company-veterans-on-bikes",1,[[2,110],[5,275]]],["Ciberlobo","P",20,"cyberwolf",1],["Cápsula de Desembarco Deathstorm","V",95,"deathstorm-drop-pod",1],["Predator Deimos","V",115,"deimos-predator",1],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Escuadra de desoladores","I",140,"desolation-squad"],["Dreadnought","V",135,"dreadnought",1],["Cápsula de Desembarco de Dreadnought","V",75,"dreadnought-drop-pod",1],["Cápsula de Desembarco","T",60,"drop-pod"],["Escuadra de eliminadores","I",85,"eliminator-squad"],["Escuadra de erradicadores con bólteres pesados","I",100,"eradicator-squad-with-heavy-bolters",0,[[3,100],[6,215]]],["Escuadra de erradicadores con fusiles de fusión","I",100,"eradicator-squad",0,[[3,100],[6,200]]],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Lobos Fenrisianos","B",45,"fenrisian-wolves",0,[[5,45],[10,75]]],["Ferren Areios","H",80,"ferren-areios",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Servotorretas Firestrike","V",80,"firestrike-servo-turrets",0,[[1,80],[2,160]]],["Gladiator lancero","V",160,"gladiator-lancer"],["Gladiator Segador","V",165,"gladiator-reaper"],["Gladiator valeroso","V",165,"gladiator-valiant"],["Cazadores Grises","L",180,"grey-hunters"],["Búnker Hammerfall","F",175,"hammerfall-bunker",1],["Harald Lobo de la Muerte","H",85,"harald-deathwolf",1],["Escuadra de intercesores pesados","L",115,"heavy-intercessor-squad",0,[[5,115],[10,230]]],["Escuadra de revientainfiernos","I",115,"hellblaster-squad",0,[[5,115],[10,230]]],["Sabuesos de Morkai","I",95,"hounds-of-morkai",1,[[5,95],[10,190]]],["Cazador","V",100,"hunter",1],["Marine Espacial Imperial","P",40,"imperial-space-marine",1],["Impulsor","T",70,"impulsor"],["Escuadra de precursores","I",130,"inceptor-squad",0,[[3,130],[6,260]]],["Escuadra de incursores","I",90,"incursor-squad",0,[[5,90],[10,170]]],["Escuadra Infernus","I",95,"infernus-squad",0,[[5,95],[10,190]]],["Escuadra de infiltradores","I",85,"infiltrator-squad",0,[[5,85],[10,150]]],["Escuadra de intercesores","L",85,"intercessor-squad",0,[[5,85],[10,170]]],["Quads Invader","M",65,"invader-atv",0,[[1,65],[2,130]]],["Exoesqueleto táctico Invictor","V",135,"invictor-tactical-warsuit"],["Sacerdote de Hierro","P",60,"iron-priest"],["Dreadnought Ironclad","V",150,"ironclad-dreadnought",1],["Deslizador de Ataque Javelin","V",110,"javelin-attack-speeder",1],["Judiciar","P",50,"judiciar"],["Kratos","V",240,"kratos",1],["Krom Mirada de Dragón","H",65,"krom-dragongaze",1],["Land Raider","V",245,"land-raider"],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider cruzado","V",230,"land-raider-crusader"],["Land Raider Excelsior","V",250,"land-raider-excelsior",1],["Land Raider Helios","V",220,"land-raider-helios",1],["Land Raider Prometheus","V",250,"land-raider-prometheus",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Land Raider redentor","V",245,"land-raider-redeemer"],["Land Speeder","V",105,"land-speeder"],["Land Speeder Storm","T",70,"land-speeder-storm",1],["Land Speeder Tempest","V",95,"land-speeder-tempest",1],["Land Speeder Tornado","V",95,"land-speeder-tornado",1],["Land Speeder Typhoon","V",100,"land-speeder-typhoon",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Bibliotecario","P",75,"librarian"],["Bibliotecario con Armadura Phobos","P",75,"librarian-in-phobos-armour"],["Bibliotecario con armadura exterminador","P",80,"librarian-in-terminator-armour"],["Bibliotecario en Moto","P",80,"librarian-on-bike",1],["Bibliotecario con Retrorreactor","P",75,"librarian-with-jump-pack",1],["Teniente","P",50,"lieutenant"],["Teniente con Armadura Phobos","P",40,"lieutenant-in-phobos-armour"],["Teniente con Armadura Reiver","P",45,"lieutenant-in-reiver-armour",1],["Teniente con combiarma","P",85,"lieutenant-with-combi-weapon"],["Logan Grimnar","H",150,"logan-grimnar"],["Logan Grimnar en Stormrider","H",180,"logan-grimnar-on-stormrider",1],["Colmillos Largos","I",120,"long-fangs",1,[[5,120],[6,145]]],["Lukas el Embaucador","H",50,"lukas-the-trickster",1],["Mastodon","V",540,"mastodon",1],["Dreadnought Mortis","V",130,"mortis-dreadnought",1],["Colmillo Asesino","H",150,"murderfang"],["Njal invocatormentas","H",100,"njal-stormcaller"],["Escuadra de batidores","M",80,"outrider-squad",0,[[3,80],[6,160]]],["Predator Annihilator","V",135,"predator-annihilator",1],["Predator Destructor","V",140,"predator-destructor",1],["Campeón de la Compañía Primaris","P",55,"primaris-company-champion",1],["Ragnar pelaje negro","H",100,"ragnar-blackmane"],["Portador Rapier","V",90,"rapier-carrier",1],["Razorback","T",95,"razorback",1],["Dreadnought redentor","V",170,"redemptor-dreadnought"],["Escuadra de saqueadores","I",85,"reiver-squad",0,[[5,85],[10,165]]],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Razorback Reliquia","T",105,"relic-razorback",1],["Escuadra de Exterminadores Reliquia","I",200,"relic-terminator-squad",1,[[5,200],[10,400]]],["Repulsor","V",190,"repulsor"],["Repulsor ejecutor","V",260,"repulsor-executioner"],["Rhino","T",70,"rhino"],["Rhino Primaris","V",95,"rhino-primaris",1],["Escuadra de Motos de Exploración","M",75,"scout-bike-squad",1,[[3,75],[6,150]]],["Escuadra de Francotiradores Exploradores","I",75,"scout-sniper-squad",1,[[5,75],[10,150]]],["Escuadra de Exploradores","I",65,"scout-squad",0,[[5,65],[10,120]]],["Sicaran Arcus","V",160,"sicaran-arcus",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Omega","V",180,"sicaran-omega",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Garras Celestes","I",90,"skyclaws",1,[[5,90],[10,165],[15,240]]],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Stalker","V",140,"stalker",1],["Escuadra de veteranos de retaguardia","I",105,"sternguard-veteran-squad",0,[[5,105],[10,210]]],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Storm Speeder granizador","V",110,"storm-speeder-hailstrike"],["Storm Speeder martilleador","V",140,"storm-speeder-hammerstrike"],["Storm Speeder atronador","V",140,"storm-speeder-thunderstrike"],["Cañonera Stormfang","V",300,"stormfang-gunship",1],["Interceptor Stormhawk","V",155,"stormhawk-interceptor",1],["Cañonera Stormraven","V",280,"stormraven-gunship",1],["Cañonera Stormtalon","V",165,"stormtalon-gunship",1],["Stormwolf","V",250,"stormwolf",1],["Escuadra Suppressor","I",85,"suppressor-squad",1],["Batería Antiaérea Tarantula","V",70,"tarantula-air-defence-battery",1],["Batería Centinela Tarantula","V",30,"tarantula-sentry-battery",1,[[1,30],[2,60],[3,90]]],["Tecnomarine","P",55,"techmarine"],["Tecnomarine en Moto","P",110,"techmarine-on-bike",1],["Escuadra de exterminadores de asalto","I",170,"terminator-assault-squad",0,[[5,170],[10,340]]],["Escuadra de Exterminadores","I",190,"terminator-squad",0,[[5,190],[10,380]]],["Terminus Ultra","V",285,"terminus-ultra",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Cañón Thunderfire","V",90,"thunderfire-cannon",1],["Cañonera Thunderhawk","V",850,"thunderhawk-gunship"],["Thunderhawk Transporter","V",495,"thunderhawk-transporter",1],["Caballería de lobos de trueno","M",115,"thunderwolf-cavalry",0,[[3,115],[6,230]]],["Typhon","V",320,"typhon",1],["Ulrik el Matador","H",90,"ulrik-the-slayer"],["Escuadra de Veteranos Vanguard","I",120,"vanguard-veteran-squad",1,[[5,120],[10,240]]],["Escuadra de veteranos de vanguardia con propulsores de salto","I",110,"vanguard-veteran-squad-with-jump-packs",0,[[5,110],[10,220]]],["Dreadnought Venerable","V",130,"venerable-dreadnought"],["Vindicator","V",185,"vindicator",1],["Vindicator Destructor Láser","V",175,"vindicator-laser-destroyer",1],["Whirlwind","V",175,"whirlwind",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Guardia del Lobo","I",85,"wolf-guard",1,[[5,85],[10,170]]],["Jefe de batalla de la guardia del lobo","P",80,"wolf-guard-battle-leader"],["Jefe de batalla de la guardia del lobo con Armadura de Exterminador","P",75,"wolf-guard-battle-leader-in-terminator-armour",1],["Jefe de batalla de la guardia del lobo en Lobo del Trueno","P",80,"wolf-guard-battle-leader-on-thunderwolf",1],["Cortacabezas de la guardia del lobo","I",85,"wolf-guard-headtakers",0,[[3,85],[6,115],[6,170],[12,230]]],["Líder de Manada de la Guardia del Lobo","P",30,"wolf-guard-pack-leader",1],["Líder de Manada de la Guardia del Lobo con Armadura de Exterminador","P",40,"wolf-guard-pack-leader-in-terminator-armour",1],["Líder de Manada de la Guardia del Lobo con Retrorreactor","P",35,"wolf-guard-pack-leader-with-jump-pack",1],["Exterminadores de la Guardia del Lobo","I",180,"wolf-guard-terminators",0,[[5,180],[10,365]]],["Señor Lobo en Lobo del Trueno","P",100,"wolf-lord-on-thunderwolf",1],["Sacerdote Lobo","P",75,"wolf-priest"],["Exploradores Lobo","I",95,"wolf-scouts",0,[[6,95],[12,190]]],["Wulfen","I",90,"wulfen",0,[[5,90],[10,180]]],["Dreadnought Wulfen","V",140,"wulfen-dreadnought"],["Wulfen con escudos de tormenta","I",125,"wulfen-with-storm-shields",0,[[5,125],[10,250]]],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"tau-empire":[["Aun'shi","H",50,"aun-shi",1],["Aun'va","H",65,"aun-va",1],["Tiburón Tigre AX-1-0","V",315,"ax-1-0-tiger-shark"],["Barracuda","V",220,"barracuda",1],["Equipo de irruptores","L",80,"breacher-team"],["Exoarmaduras apocalipsis","V",75,"broadside-battlesuits",0,[[1,75],[2,150],[3,255]]],["Filoardiente","P",50,"cadre-fireblade"],["Comandante visionario","H",70,"commander-farsight"],["Comandante en exoarmadura estrella de hielo","P",95,"commander-in-coldstar-battlesuit"],["Comandante con Armadura de Combate Crisis","P",80,"commander-in-crisis-battlesuit",1],["Comandante en exoarmadura sentenciador","P",80,"commander-in-enforcer-battlesuit"],["Comandante solsombrío","H",100,"commander-shadowsun"],["Armaduras de Combate Crisis","V",200,"crisis-battlesuits",1,[[3,200],[6,400]]],["Exoarmaduras Crisis cuchilloígneo","V",100,"crisis-fireknife-battlesuits"],["Exoarmaduras Crisis siegaestrellas","V",100,"crisis-starscythe-battlesuits"],["Exoarmaduras Crisis forjasolar","V",125,"crisis-sunforge-battlesuits"],["Caminante de sombras","H",60,"darkstrider"],["Mantarraya","T",75,"devilfish"],["Torreta Centinela de Drones","F",50,"drone-sentry-turret",1],["Etéreo","P",50,"ethereal"],["Equipo ojo de fuego","P",55,"firesight-team"],["Exoarmadura fantasmal","V",150,"ghostkeel-battlesuit"],["Gran Knarloc","N",100,"great-knarloc",1],["Cañonera cabezamartillo","V",150,"hammerhead-gunship"],["Drones de Armas Pesadas","V",45,"heavy-gun-drones",1],["Jinetes Knarloc","M",110,"knarloc-riders",1],["Carnívoros Kroot","I",65,"kroot-carnivores",0,[[10,65],[20,130]]],["Acechantes Kroot","I",75,"kroot-farstalkers"],["Carnemorfo Kroot","P",45,"kroot-flesh-shaper"],["Mastines de guerra Kroot","B",45,"kroot-hounds",0,[[5,45],[10,65]]],["Lanza Solitaria Kroot","P",80,"kroot-lone-spear"],["Rastromorfo Kroot","P",50,"kroot-trail-shaper"],["Guerramorfo Kroot","P",60,"kroot-war-shaper"],["Arrasadores Krootox","M",85,"krootox-rampagers",0,[[3,85],[6,170]]],["Jinetes de Krootox","M",45,"krootox-riders",0,[[1,45],[2,60],[3,90]]],["Longstrike","H",140,"longstrike",1],["Manta","V",2100,"manta"],["Nave de Desembarco Orca","V",275,"orca-dropship",1],["Equipo de rastreadores","I",85,"pathfinder-team"],["Pirañas","V",65,"piranhas",0,[[1,65],[2,110],[3,165]]],["Armadura de Combate R'varna","V",200,"r-varna-battlesuit",1],["Caza tiburón lanza","V",160,"razorshark-strike-fighter"],["Drones Sigilosos Remora","V",160,"remora-stealth-drones",1],["Torre de Sensores Remota","F",50,"remote-sensor-tower",1],["Exoarmadura cataclismo","V",190,"riptide-battlesuit"],["Shas'O R'alai","H",80,"shas-o-r-alai",1],["Cañonera aerorraya","V",140,"sky-ray-gunship"],["Exoarmaduras sigilo","I",100,"stealth-battlesuits"],["Ciclón","V",375,"stormsurge"],["Equipo de Ataque","L",70,"strike-team"],["Bombardero tiburón solar","V",150,"sun-shark-bomber"],["Armadura supremacía Ta'unar","V",790,"ta-unar-supremacy-armour"],["Tetras","V",80,"tetras",1,[[2,80],[4,160]]],["La Lanza Gemela","H",240,"the-twin-lance"],["Dronopuerto rompeolas","F",85,"tidewall-droneport"],["Torreta rompeolas","F",90,"tidewall-gunrig"],["Línea de defensa rompeolas","F",85,"tidewall-shieldline"],["Tiburón Tigre","V",395,"tiger-shark"],["Tx42 Piranha","V",60,"tx42-piranha",1],["Aguijones alados Véspid","I",70,"vespid-stingwings",0,[[5,70],[10,115]]],["Armaduras de Combate de Peligro XV9","V",55,"xv9-hazard-battlesuits",1,[[1,55],[2,110]]],["Armadura de Combate Y'vahra","V",210,"y-vahra-battlesuit",1]],"thousand-sons":[["Ahriman","H",105,"ahriman"],["Horrores Azules","L",90,"blue-horrors"],["Cerberus","V",270,"cerberus",1],["Land Raider del Caos","V",220,"chaos-land-raider"],["Señor del Caos en Disco de Tzeentch","P",100,"chaos-lord-on-disc-of-tzeentch",1],["Predator del Caos aniquilador","V",140,"chaos-predator-annihilator"],["Predator del Caos Destructor","V",140,"chaos-predator-destructor"],["Rhino del Caos","T",80,"chaos-rhino"],["Engendro del Caos","B",65,"chaos-spawn"],["Thunderhawk del Caos","V",840,"chaos-thunderhawk",1],["Vindicator del Caos","V",185,"chaos-vindicator"],["Príncipe Daemon de Tzeentch","P",170,"daemon-prince-of-tzeentch"],["Príncipe Daemon de Tzeentch alado","P",170,"daemon-prince-of-tzeentch-with-wings"],["Profanador","V",300,"defiler"],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Hechicero Exaltado","P",100,"exalted-sorcerer"],["Hechicero Exaltado en Disco de Tzeentch","P",95,"exalted-sorcerer-on-disc-of-tzeentch"],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Incineradores","I",65,"flamers",0,[[3,65],[6,130]]],["Diablo de la Forja","V",135,"forgefiend"],["Bruto infernal","V",110,"helbrute"],["Dragón infernal","V",175,"heldrake"],["Espada Infernal","V",115,"hell-blade",1],["Garra Infernal","V",140,"hell-talon",1],["Amo infernal","P",105,"infernal-master"],["Kairos Tejedestinos","H",305,"kairos-fateweaver"],["Kratos","V",240,"kratos",1],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Señor de la Transformación","P",320,"lord-of-change"],["Magnus el Rojo","H",455,"magnus-the-red"],["Mastodon","V",540,"mastodon",1],["Diablo despedazador","V",120,"maulerfiend"],["Bestia mutalítica del vórtice","N",170,"mutalith-vortex-beast"],["Horrores rosa","L",115,"pink-horrors"],["Portador Rapier","V",90,"rapier-carrier",1],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Marines rúbrica","L",115,"rubric-marines",0,[[5,115],[10,210]]],["Exterminadores escarabeo oculto","I",200,"scarab-occult-terminators",0,[[5,200],[10,425]]],["Aulladores","B",80,"screamers",0,[[3,80],[6,160]]],["Robots Sekhetar","V",85,"sekhetar-robots",0,[[2,85],[4,175]]],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Hechicero","P",100,"sorcerer"],["Hechicero con armadura exterminador","P",110,"sorcerer-in-terminator-armour"],["Spartan","V",300,"spartan",1],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Typhon","V",320,"typhon",1],["Tzaangors Iluminados","M",50,"tzaangor-enlightened",0,[[3,50],[6,90]]],["Tzaangors iluminados con arcos largos del destino","M",55,"tzaangor-enlightened-with-fatecaster-greatbows",0,[[3,55],[6,110]]],["Chamán Tzaangor","P",65,"tzaangor-shaman"],["Tzaangors","I",75,"tzaangors",0,[[10,75],[20,145]]],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]],"tyranids":[["Hierodulo Espinado","N",340,"barbed-hierodule",1],["Espinogantes","I",50,"barbgaunts",0,[[5,50],[10,100]]],["Biovoros","I",60,"biovores",0,[[1,60],[2,100],[3,140]]],["Líder de progenie","P",80,"broodlord"],["Cárnifex","N",90,"carnifexes",0,[[1,90],[2,180]]],["Muerte silenciosa","H",80,"deathleaper"],["Dimachaeron","N",200,"dimachaeron",1],["Exocrino","N",135,"exocrine"],["Gárgolas","L",75,"gargoyles",0,[[10,75],[20,150]]],["Genestealers","I",75,"genestealers",0,[[5,75],[10,140]]],["Arpía","N",185,"harpy"],["Pérfida","N",610,"harridan"],["Harúspex","N",125,"haruspex"],["Hierofante","N",810,"hierophant"],["Aerovoro de la colmena","N",170,"hive-crone"],["Guardia de colmena","I",80,"hive-guard",0,[[3,80],[6,160]]],["Tirano de colmena","P",195,"hive-tyrant"],["Hormagantes","L",70,"hormagaunts",0,[[10,70],[20,120]]],["Mántifex hiperadaptados","P",165,"hyperadapted-raveners"],["Líctor","I",60,"lictor"],["Malanthrope","P",75,"malanthrope",1],["Maleceptor","N",180,"maleceptor"],["Mawloc","N",130,"mawloc"],["Esporas mucólidas","B",30,"mucolid-spores",0,[[1,30],[2,60]]],["Neurogantes","I",45,"neurogaunts",0,[[11,45],[22,90]]],["Neurolíctor","I",80,"neurolictor"],["Neurotirano","P",120,"neurotyrant"],["Asimilador Norn","N",250,"norn-assimilator"],["Emisario Norn","N",250,"norn-emissary"],["Viejo un ojo","H",130,"old-one-eye"],["Parásito de Mortrex","P",65,"parasite-of-mortrex"],["Psicófago","N",110,"psychophage"],["Pirovoros","I",40,"pyrovores",0,[[1,40],[2,70],[3,100]]],["Mántifex","I",125,"raveners"],["Enjambres devoradores","E",30,"ripper-swarms",0,[[1,30],[2,40],[3,50]]],["Asesino aullante","N",125,"screamer-killer"],["Hierodulo Guadañador","N",330,"scythed-hierodule",1],["Enjambres Tajacielos","E",60,"sky-slasher-swarms",1],["Minas espora","B",55,"spore-mines",0,[[3,55],[6,110]]],["Quistespora","N",145,"sporocyst"],["Termagantes","L",55,"termagants",0,[[10,55],[20,110]]],["Tervigón","P",150,"tervigon"],["El Terror Rojo","H",120,"the-red-terror"],["Señor de la horda","H",210,"the-swarmlord"],["Toxicreno","N",120,"toxicrene"],["Trigón","N",135,"trygon"],["Tiránido Primus con látigo orgánico","P",75,"tyranid-prime-with-lash-whip"],["Guerreros Tiránidos con Bioarmas de Combate","I",75,"tyranid-warriors-with-melee-bio-weapons",0,[[3,75],[6,150]]],["Guerreros Tiránidos con Bioarmas a Distancia","I",60,"tyranid-warriors-with-ranged-bio-weapons",0,[[3,60],[6,120]]],["Tiranocito","T",80,"tyrannocyte"],["Tiránofex","N",170,"tyrannofex"],["Guardia tiránida","I",80,"tyrant-guard",0,[[3,80],[6,170]]],["Venóntropos","I",55,"venomthropes",0,[[3,55],[6,110]]],["Saltadores de Von Ryan","I",55,"von-ryan-s-leapers",0,[[3,55],[6,105]]],["Tirano de colmena alado","P",185,"winged-hive-tyrant"],["Tiránido Primus alado","P",65,"winged-tyranid-prime"],["Zoántropos","I",90,"zoanthropes",0,[[3,90],[6,190]]]],"world-eaters":[["Angron","H",330,"angron"],["Carnicero de Sangre","V",160,"blood-slaughterer",1],["Aplastadores","M",95,"bloodcrushers",0,[[3,95],[6,190]]],["Desangradores","L",90,"bloodletters"],["Devorador de Almas","P",320,"bloodthirster"],["Cerberus","V",270,"cerberus",1],["Land Raider del Caos","V",200,"chaos-land-raider"],["Predator del Caos aniquilador","V",130,"chaos-predator-annihilator"],["Predator del Caos Destructor","V",130,"chaos-predator-destructor"],["Rhino del Caos","T",75,"chaos-rhino"],["Engendro del Caos","B",95,"chaos-spawn"],["Exterminadores del Caos","I",175,"chaos-terminators",0,[[5,175],[10,350]]],["Thunderhawk del Caos","V",840,"chaos-thunderhawk",1],["Príncipe Daemon de Khorne","P",200,"daemon-prince-of-khorne"],["Príncipe Daemon de Khorne alado","P",170,"daemon-prince-of-khorne-with-wings"],["Profanador","V",270,"defiler"],["Dreadnought Deredeo","V",160,"deredeo-dreadnought",1],["Octojurados","I",125,"eightbound",0,[[3,125],[6,250]]],["Octojurado exaltado","I",130,"exalted-eightbound",0,[[3,130],[6,260]]],["Falchion","V",420,"falchion",1],["Fellblade","V",480,"fellblade",1],["Cañonera Fire Raptor","V",290,"fire-raptor-gunship",1],["Mastines de Khorne","B",75,"flesh-hounds",0,[[5,75],[10,150]]],["Diablo de la Forja","V",140,"forgefiend"],["Siembrasangres","I",70,"goremongers"],["Gran Escorpión de Bronce","V",500,"greater-brass-scorpion",1],["Bruto infernal","V",120,"helbrute"],["Dragón infernal","V",175,"heldrake"],["Espada Infernal","V",115,"hell-blade",1],["Garra Infernal","V",140,"hell-talon",1],["Chakales","I",65,"jakhals",0,[[10,65],[20,120]]],["Khârn el Traidor","H",115,"kharn-the-betrayer"],["Bersérkeres de Khorne","L",170,"khorne-berzerkers",0,[[10,170],[20,330]]],["Señor de los Cráneos de Khorne","V",505,"khorne-lord-of-skulls"],["Kratos","V",240,"kratos",1],["Devastador Kytan","V",400,"kytan-ravager",1],["Land Raider Achilles","V",230,"land-raider-achilles",1],["Land Raider Proteus","V",220,"land-raider-proteus",1],["Dreadnought Leviathan","V",160,"leviathan-dreadnought",1],["Lord Invocatus","H",100,"lord-invocatus"],["Señor en Juggernaut","P",95,"lord-on-juggernaut"],["Maestro verdugo","P",60,"master-of-executions"],["Mastodon","V",540,"mastodon",1],["Diablo despedazador","V",140,"maulerfiend"],["Portador Rapier","V",90,"rapier-carrier",1],["Dreadnought Contemptor Reliquia","V",140,"relic-contemptor-dreadnought",1],["Tanque de Batalla Sicaran","V",180,"sicaran-battle-tank",1],["Sicaran Punisher","V",160,"sicaran-punisher",1],["Sicaran Venator","V",180,"sicaran-venator",1],["Skarbrand","H",315,"skarbrand"],["Masacrejurado","P",90,"slaughterbound"],["Stormbird patrón Sokar","V",900,"sokar-pattern-stormbird",1],["Spartan","V",300,"spartan",1],["Cañonera Storm Eagle","V",250,"storm-eagle-gunship",1],["Termite patrón Terrax","V",200,"terrax-pattern-termite",1],["Typhon","V",320,"typhon",1],["Whirlwind Scorpius","V",115,"whirlwind-scorpius",1],["Interceptor Xiphon","V",115,"xiphon-interceptor",1]]};
const CAT_ORDER = ["H","P","L","I","M","B","N","E","V","T","F","G"];
const CAT_LABEL = {H:"Héroes épicos",P:"Personajes",L:"Línea de batalla",I:"Infantería",M:"Montados",B:"Bestias",N:"Monstruos",E:"Enjambres",V:"Vehículos",T:"Transportes asignados",F:"Fortificaciones",G:"Leyendas"};
const CAT_ROLE = {H:"Héroe épico",P:"Personaje",L:"Línea",T:"Transporte dedicado"};
/* las unidades de Leyendas van juntas al final (grupo «G»), como en warmind */
const dbUnits = fid => (DB[fid]||[]).map(([name,cat,pts,id,lg,sz])=>({name,cat,pts,id,lg:!!lg,group:lg?"G":cat,sizes:sz||null}));
const dbRow = (fid,name) => (DB[fid]||[]).find(r=>r[0]===name);

const uid = () => Math.random().toString(36).slice(2,10);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const readLS = k => { try{ return localStorage.getItem(k); }catch(e){ return null; } };
const writeLS = (k,v) => { try{ v==null ? localStorage.removeItem(k) : localStorage.setItem(k,v); }catch(e){} };

function unit(name, role, sizes, faction=DEFAULT_FAC){
  return {id:uid(), name, role, faction, sizes:sizes.map(([n,pts])=>({n,pts})), stats:{M:"",T:"",SV:"",W:"",LD:"",OC:""}, notes:""};
}

/* Puntos y perfiles detallados de tu ejército de ejemplo */
const PTS_VERSION = "11ed-2026-10-02";
const DA_POINTS = {
  "Lion El'Jonson":          {role:"Héroe épico", sizes:[[1,415]], stats:['8"',"10","2+","16","5+","4"], notes:"INV 3+ · No hay dolor 4+"},
  "Deathwing Knights":       {role:"Otra", sizes:[[5,255]],         stats:['5"',"6","2+","4","6+","1"],   notes:"INV 4+"},
  "Exterminadores Deathwing":{role:"Otra", sizes:[[5,190],[10,380]],stats:['5"',"6","2+","3","6+","1"],   notes:"INV 4+"},
  "Intercesores":            {role:"Línea",sizes:[[5,85],[10,170]], stats:['6"',"5","3+","2","6+","2"],   notes:""},
  "Inceptors":               {role:"Otra", sizes:[[3,130],[6,260]], stats:['10"',"6","3+","3","6+","1"],  notes:""},
  "Infernus":                {role:"Otra", sizes:[[5,95],[10,190]], stats:['6"',"5","3+","2","6+","1"],   notes:""},
  "Caballeros Negros del Ala de Cuervo":{role:"Otra", sizes:[[3,85],[6,170]], stats:['12"',"6","3+","3","6+","2"], notes:"INV 5+"}
};
/* Cada usuario nuevo empieza vacío: sin unidades y con una lista en blanco */
function blankData(){
  const l = {id:uid(), name:"Mi primera lista", limit:1500, faction:DEFAULT_FAC, units:[]};
  return {ptsVersion:PTS_VERSION, catalog:[], lists:[l], activeList:l.id, battle:null, updatedAt:0};
}
function loadPrefs(){
  try{
    const p = JSON.parse(readLS(PREFS_KEY)||"null");
    if(p) return {theme:p.theme||"", tab:p.tab||"facciones"};
    // primera vez con esta versión: se aprovecha solo el tema de la copia antigua
    const old = JSON.parse(readLS(LEGACY_KEY)||"null");
    return {theme:old?.theme||"", tab:"facciones"};
  }catch(e){ return {theme:"", tab:"facciones"}; }
}
let S = {...loadPrefs(), ...blankData(), editing:null};
/* Borra de memoria todo lo privado (al cerrar sesión o cambiar de usuario) */
function resetPrivate(){
  const keep = {theme:S.theme, tab:S.tab};
  S = {...keep, ...blankData(), editing:null};
  migrate(); lastData = dataStr();
}

function migrate(){
  S.catalog.forEach(u=>{ if(!u.faction) u.faction=DEFAULT_FAC; if(!u.stats) u.stats={M:"",T:"",SV:"",W:"",LD:"",OC:""}; });
  S.lists.forEach(l=>{ if(!l.faction) l.faction=DEFAULT_FAC; });
  if(!S.lists.length){ const l={id:uid(),name:"Nueva lista",limit:1500,faction:DEFAULT_FAC,units:[]}; S.lists.push(l); S.activeList=l.id; }
  if(!S.lists.some(l=>l.id===S.activeList)) S.activeList=S.lists[0].id;
  if(S.facFilter===undefined) S.facFilter="all";
  if(S.ptsVersion!==PTS_VERSION){
    Object.entries(DA_POINTS).forEach(([name,d])=>{
      const u = S.catalog.find(x=>x.name===name && x.faction===DEFAULT_FAC);
      if(!u) return;
      u.sizes = d.sizes.map(([n,pts])=>({n,pts}));
      if(!STATS.some(k=>u.stats[k])) STATS.forEach((k,i)=>u.stats[k]=d.stats[i]);
      if(!u.notes) u.notes = d.notes;
    });
    S.ptsVersion = PTS_VERSION;
  }
  // las unidades sacadas de la base siguen sus puntos actuales
  S.catalog.forEach(u=>{
    if(u.src!=="db") return;
    const d = dbRow(u.faction, u.name); if(!d) return;
    if(d[5]) u.sizes = d[5].map(([n,pts])=>({n,pts}));
    else if(u.sizes[0] && (u.sizes[0].n===0 || u.sizes.length===1)) u.sizes = [{n:u.sizes[0].n, pts:d[2]}];
  });
  S.lists.forEach(l=>l.units.forEach(e=>{ const u=byId(e.unitId); if(u && e.sizeIdx>=u.sizes.length) e.sizeIdx=0; }));
}

const byId = id => S.catalog.find(u=>u.id===id);
const curList = () => S.lists.find(l=>l.id===S.activeList) || S.lists[0];
function sizeOf(e){ const u = byId(e.unitId); if(!u) return null; return u.sizes[e.sizeIdx] || u.sizes[0] || null; }
const ptsOf = e => (sizeOf(e)?.pts) || 0;
const total = l => l.units.reduce((a,e)=>a+ptsOf(e),0);
const sizeLabel = s => !s ? "" : s.n ? `${s.n} mod.` : "Tamaño mín.";
const isChar = u => u.role==="Héroe épico" || u.role==="Personaje";
function maxCopies(role){ return role==="Héroe épico" ? 1 : (role==="Línea" || role==="Transporte dedicado") ? 6 : 3; }
migrate();

/* ---------- guardado: preferencias en el navegador, datos en la nube ---------- */
const dataStr = () => JSON.stringify({catalog:S.catalog, lists:S.lists, battle:S.battle, ptsVersion:S.ptsVersion});
let lastData = dataStr();
function save(){
  const ds = dataStr();
  if(ds!==lastData){ lastData=ds; S.updatedAt=Date.now(); Cloud.schedulePush(); }
  writeLS(PREFS_KEY, JSON.stringify({theme:S.theme, tab:S.tab}));
}

function validate(l){
  const out = []; const t = total(l);
  if(t > l.limit) out.push(["err", `Te pasas por ${t-l.limit} pts del límite de ${l.limit}.`]);
  const counts = {};
  l.units.forEach(e=>{ counts[e.unitId]=(counts[e.unitId]||0)+1; });
  Object.entries(counts).forEach(([id,n])=>{
    const u = byId(id); if(!u) return;
    const m = maxCopies(u.role);
    if(n > m) out.push(["err", `${u.name}: ${n} copias (máximo ${m}${u.role==="Héroe épico"?", es héroe épico":""}).`]);
  });
  if(!l.units.some(e=>{const u=byId(e.unitId); return u && isChar(u);}))
    out.push(["warn","No hay ningún personaje: necesitas uno como Señor de la Guerra."]);
  const foreign = l.units.map(e=>byId(e.unitId)).filter(u=>u && u.faction!==l.faction);
  if(foreign.length) out.push(["warn", `${[...new Set(foreign.map(u=>u.name))].join(", ")} no es de ${fac(l.faction).name}.`]);
  if(l.units.some(e=>!byId(e.unitId))) out.push(["warn","Hay una unidad borrada del catálogo en la lista."]);
  if(!out.length) out.push(["ok", `Lista válida · quedan ${l.limit-t} pts libres.`]);
  return out;
}

/* ---------- diálogos propios (funcionan también dentro de iframes) ---------- */
function modal({title, text="", input=null, buttons=[["ok","Aceptar","pri"]], output=null}){
  return new Promise(resolve=>{
    const o = document.createElement("div"); o.className="overlay";
    o.innerHTML = `<div class="panel" role="dialog" aria-modal="true">
      <div class="ttl">${esc(title)}</div>
      ${text?`<div class="muted">${esc(text)}</div>`:""}
      ${input!==null?`<input type="text" class="mi" value="${esc(input)}">`:""}
      ${output!==null?`<textarea class="out" readonly>${esc(output)}</textarea>`:""}
      <div class="row" style="justify-content:flex-end">${buttons.map(([v,l,k])=>`<button class="btn ${k||""}" data-v="${esc(v)}">${esc(l)}</button>`).join("")}</div>
    </div>`;
    const done = v => { o.remove(); document.removeEventListener("keydown", key); resolve(v); };
    const key = ev => { if(ev.key==="Escape") done(null); if(ev.key==="Enter" && input!==null) done(o.querySelector(".mi").value.trim()||null); };
    o.addEventListener("click", async ev=>{
      if(ev.target===o) return done(null);
      const b = ev.target.closest("button[data-v]"); if(!b) return;
      if(b.dataset.v==="copy"){ try{ await navigator.clipboard.writeText(output); b.textContent="¡Copiado!"; }catch(e){ o.querySelector(".out").select(); } return; }
      if(input!==null) return done(b.dataset.v==="ok" ? (o.querySelector(".mi").value.trim()||null) : null);
      done(b.dataset.v);
    });
    document.addEventListener("keydown", key);
    document.body.appendChild(o);
    (o.querySelector(".mi")||o.querySelector(".btn.pri")||o.querySelector(".btn"))?.focus();
  });
}
const ask = (title, text, yes="Aceptar", danger=false) => modal({title, text, buttons:[["no","Cancelar"],["yes",yes,danger?"pri bad":"pri"]]}).then(v=>v==="yes");
const askText = (title, value) => modal({title, input:value, buttons:[["no","Cancelar"],["ok","Aceptar","pri"]]});
const tell = (title, text) => modal({title, text});
let toastTimer;
function toast(msg){
  document.querySelector(".toast")?.remove();
  const t = document.createElement("div"); t.className="toast"; t.textContent=msg; document.body.appendChild(t);
  clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.remove(), 2600);
}

/* ---------- emblemas (dibujo propio, uno por alianza) ---------- */
function emblem(align){
  if(align==="cha"){
    const rays = [0,45,90,135,180,225,270,315].map(a=>`<g transform="rotate(${a} 50 50)"><path d="M50 50V8" /><path d="M42 18 50 6 58 18" /></g>`).join("");
    return `<svg class="emb" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" aria-hidden="true">${rays}<circle cx="50" cy="50" r="13"/></svg>`;
  }
  if(align==="xen"){
    return `<svg class="emb" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" aria-hidden="true"><path d="M70 14A38 38 0 1 0 70 86 30 30 0 1 1 70 14z"/><circle cx="64" cy="50" r="7"/><path d="M64 30v-8M64 78v-8M84 50h-8"/></svg>`;
  }
  return `<svg class="emb" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round" aria-hidden="true"><path d="M50 6 86 20v24c0 22-15 39-36 48C29 83 14 66 14 44V20z"/><path d="M50 22v54M32 40h36"/></svg>`;
}

/* ---------- render ---------- */
const app = document.getElementById("app");
function activeFaction(){
  if(S.tab==="facciones" && S.facOpen) return fac(S.facOpen);
  return fac(curList().faction);
}
function render(){
  const root = document.documentElement;
  root.dataset.theme = S.theme || "";
  root.style.setProperty("--accent", activeFaction().color);
  document.getElementById("tabs").innerHTML = [["facciones","Facciones"],["lista","Ejército"],["catalogo","Unidades"],["batalla","Batalla"],["cuenta","Cuenta"]]
    .map(([k,t])=>`<button class="tab ${S.tab===k?"on":""}" data-act="tab" data-v="${k}">${t}</button>`).join("");
  app.innerHTML = Cloud.loadingUser && S.tab!=="cuenta" ? `<div class="panel">Cargando tus datos…</div>`
    : S.tab==="facciones" ? (S.facOpen ? viewFaction() : viewFactions())
    : S.tab==="lista" ? viewList() : S.tab==="catalogo" ? viewCatalog() : S.tab==="batalla" ? viewBattle() : viewAccount();
  Cloud.paint();
  save();
}

function facCard(f, opts={}){
  const units = (DB[f.id]||[]).length;
  const lists = S.lists.filter(l=>l.faction===f.id).length;
  const isActive = curList().faction===f.id;
  const tagName = opts.big ? "div" : "button";
  return `<${tagName} class="fac ${opts.big?"big":""}" style="--fc:${f.color}" ${opts.big?"":`data-act="openFac" data-v="${f.id}"`}>
    ${emblem(f.align)}
    ${isActive?`<span class="badge">Activa</span>`:""}
    <div class="body">
      ${opts.big?`<div class="kicker" style="color:${f.color}">${ALIGN[f.align]}</div>`:""}
      <div class="nm">${esc(f.name)}</div>
      <div class="sub">${units}<span>hojas de datos</span>${lists}<span>${lists===1?"lista tuya":"listas tuyas"}</span></div>
    </div>
  </${tagName}>`;
}

function viewFactions(){
  const q = (S.facQ||"").toLowerCase();
  const shown = FACTIONS.filter(f=>(S.facFilter==="all"||f.align===S.facFilter) && f.name.toLowerCase().includes(q));
  return `
  <div class="hero-panel">
    <div class="kicker">Bastión de Mando · 11.ª edición</div>
    <h1>Elige una facción</h1>
  </div>
  <div class="row" style="margin:14px 0 12px">
    <div class="chips">${[["all","Todas"],["imp","Imperio"],["cha","Caos"],["xen","Xenos"]].map(([k,t])=>`<button class="chip ${S.facFilter===k?"on":""}" data-act="facFilter" data-v="${k}">${t}</button>`).join("")}</div>
    <input type="text" class="grow" style="min-width:180px" placeholder="Buscar facción…" value="${esc(S.facQ||"")}" data-in="facQ">
  </div>
  <div class="fac-grid">${shown.map(f=>facCard(f)).join("") || `<div class="empty">Ninguna facción coincide.</div>`}</div>`;
}

/* lista de unidades de la base agrupadas por categoría */
function rosterHTML(fid, filter, q, actLabel){
  const rows = dbUnits(fid).filter(r=>{
    if(filter==="HP" && !(r.group==="H"||r.group==="P")) return false;
    if(filter!=="all" && filter!=="HP" && r.group!==filter) return false;
    return !q || r.name.toLowerCase().includes(q);
  });
  if(!rows.length) return `<div class="muted small">Ninguna unidad coincide.</div>`;
  return CAT_ORDER.filter(c=>rows.some(r=>r.group===c)).map(c=>`<div class="cat-h">${CAT_LABEL[c]}</div>`+
    rows.filter(r=>r.group===c).map(r=>`<div class="add-item"><span class="grow">${esc(r.name)}</span><span class="pts">${r.pts}</span>${actLabel?`<button class="btn sm pri" data-act="addDb" data-f="${fid}" data-v="${esc(r.name)}">${actLabel}</button>`:""}</div>`).join("")).join("");
}
function catChips(fid, cur, act){
  const present = CAT_ORDER.filter(c=>dbUnits(fid).some(r=>r.group===c));
  const opts = [["HP","Personajes"],["all","Todas"],...present.filter(c=>c!=="H"&&c!=="P").map(c=>[c,CAT_LABEL[c]])];
  return `<div class="chips">${opts.map(([k,t])=>`<button class="chip ${cur===k?"on":""}" data-act="${act}" data-v="${k}">${t}</button>`).join("")}</div>`;
}

/* ---------- hojas de datos: data/<facción>.json, se cargan al abrir la facción ---------- */
const SHEETS = {};
function loadSheets(fid){
  if(SHEETS[fid]) return;
  SHEETS[fid] = "loading";
  fetch(`data/${fid}.json`).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(d=>{ SHEETS[fid]=d; }).catch(()=>{ SHEETS[fid]="error"; })
    .finally(()=>{ if(S.tab==="facciones" && S.facOpen===fid) render(); });
}
const sheetOf = (fid,id) => Array.isArray(SHEETS[fid]) ? SHEETS[fid].find(u=>u.id===id) : null;
const ROLE_ONE = {H:"Héroe épico",P:"Personaje",L:"Línea de batalla",I:"Infantería",M:"Montado",B:"Bestia",N:"Monstruo",E:"Enjambre",V:"Vehículo",T:"Transporte asignado",F:"Fortificación",G:"Leyendas"};

function viewFaction(){
  const f = fac(S.facOpen);
  loadSheets(f.id);
  if(S.facUnit) return viewSheet(f);
  const lists = S.lists.filter(l=>l.faction===f.id);
  const q = (S.rosterQ||"").toLowerCase().trim();
  const sheets = Array.isArray(SHEETS[f.id]) ? SHEETS[f.id] : null;
  // con las hojas cargadas también se busca por palabra clave y habilidad
  const hit = r => {
    if(!q || r.name.toLowerCase().includes(q)) return true;
    const d = sheets && sheets.find(x=>x.id===r.id);
    return !!d && (d.kw.some(k=>k.toLowerCase().includes(q)) || d.ab.some(a=>a[0].toLowerCase().includes(q)));
  };
  const rows = dbUnits(f.id).filter(hit);
  const groups = CAT_ORDER.filter(c=>rows.some(r=>r.group===c)).map(c=>{
    const rs = rows.filter(r=>r.group===c);
    return `<div class="cat-h">${ROLE_ONE[c]} · ${rs.length}</div>
    <div class="unit-grid">${rs.map(r=>`<button class="unit-tile" data-act="openUnit" data-v="${esc(r.id)}">
      <span class="grow">${esc(r.name)}${r.lg?`<em class="tag">Leyendas</em>`:""}</span><span class="pts">${r.pts}</span>
    </button>`).join("")}</div>`;
  }).join("");
  return `
  <div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="closeFac">← Facciones</button></div>
  ${facCard(f,{big:true})}
  <div class="row" style="margin-top:12px">
    <button class="btn pri" data-act="newListFac" data-v="${f.id}">+ Nueva lista</button>
    <button class="btn" data-act="newUnitFac" data-v="${f.id}">+ Unidad personalizada</button>
    <span class="spacer"></span>
    <input type="text" style="max-width:320px" class="grow" placeholder="Buscar nombre, palabra clave o habilidad…" value="${esc(S.rosterQ||"")}" data-in="rosterQ">
  </div>
  <h2>Hojas de datos · ${(DB[f.id]||[]).length}</h2>
  ${groups || `<div class="empty">Ninguna unidad coincide.</div>`}
  <h2>Tus listas · ${lists.length}</h2>
  <div class="cards">${lists.length ? lists.map(l=>`<div class="card">
    <div class="row"><span class="uname grow">${esc(l.name)}</span><span class="pts">${total(l)} / ${l.limit}</span></div>
    <div class="row"><span class="muted small grow">${l.units.length} unidades</span><button class="btn sm pri" data-act="openList" data-v="${l.id}">Abrir</button></div>
  </div>`).join("") : `<div class="empty">Aún no tienes listas de ${esc(f.name)}.</div>`}</div>`;
}

function weaponTable(title, skill, ws){
  if(!ws.length) return "";
  return `<div>
    <h2>${title}</h2>
    <div class="wtable"><table>
      <thead><tr><th></th><th>Alcance</th><th>A</th><th>${skill}</th><th>S</th><th>AP</th><th>D</th></tr></thead>
      <tbody>${ws.map(([n,rg,a,sk,s,ap,d,kw])=>`<tr>
        <td class="wn">${esc(n)}${kw.length?`<div class="wkw">${kw.map(k=>`<span>${esc(k)}</span>`).join("")}</div>`:""}</td>
        <td>${esc(rg)}</td><td>${esc(a)}</td><td>${esc(sk)}</td><td>${esc(s)}</td><td>${esc(ap)}</td><td>${esc(d)}</td>
      </tr>`).join("")}</tbody>
    </table></div>
  </div>`;
}

function viewSheet(f){
  const back = `<div class="row" style="margin-bottom:12px"><button class="btn sm" data-act="closeUnit">← ${esc(f.name)}</button></div>`;
  const st = SHEETS[f.id];
  if(st==="error") return back+`<div class="panel">No se pudieron cargar las hojas de datos. <button class="btn sm" data-act="retrySheets" data-v="${f.id}">Reintentar</button></div>`;
  if(!Array.isArray(st)) return back+`<div class="panel">Cargando hoja de datos…</div>`;
  const u = sheetOf(f.id, S.facUnit);
  if(!u) return back+`<div class="empty">Esta hoja de datos no existe.</div>`;
  const target = curList().faction===f.id ? curList() : S.lists.find(l=>l.faction===f.id);
  const STAT_KEYS = [["M","M"],["T","T"],["SV","SV"],["INV",""],["W","W"],["LD","LD"],["OC","OC"]];
  const profile = u.st.map(s=>`${u.st.length>1?`<div class="muted small" style="margin:8px 0 4px">${esc(s.l)}</div>`:""}
    <div class="stats sheet-stats">${STAT_KEYS.filter(([k])=>k!=="INV"||u.inv).map(([k,f])=>`<div><small>${k}</small>${esc(k==="INV"?u.inv:s[f]||"–")}</div>`).join("")}</div>
    ${s.b?`<div class="muted small" style="margin-top:6px"><span class="lbl">Base</span> ${esc(s.b)}</div>`:""}`).join("");
  const models = u.mo.length ? `<h2>Armas por miniatura</h2>
    <div class="panel sheet-models">${u.mo.map(m=>`<div>
      <div class="mn">${esc(m.n)}${m.min===m.max&&m.max===1?"":` <span class="muted small">(${m.min===m.max?m.min:`${m.min}–${m.max}`})</span>`}</div>
      ${m.r.length?`<div class="small"><span class="lbl">A distancia</span> ${esc(m.r.join(", "))}</div>`:""}
      ${m.m.length?`<div class="small"><span class="lbl">Cuerpo a cuerpo</span> ${esc(m.m.join(", "))}</div>`:""}
    </div>`).join("")}</div>` : "";
  const chips = (title, arr) => arr.length ? `<h2>${title}</h2><div class="kw">${arr.map(k=>`<span>${esc(k)}</span>`).join("")}</div>` : "";
  return `${back}
  <div class="hero-panel sheet-head">
    <div class="grow">
      <div class="kicker">${ROLE_ONE[u.c]||""}${u.lg?" · Leyendas":""}</div>
      <h1>${esc(u.n)}</h1>
      ${u.sz.length>1?`<div class="muted small" style="margin-top:4px">${u.sz.map(([n,p])=>`${n} miniaturas · <span class="pts">${p}</span>`).join("  ·  ")}</div>`:""}
    </div>
    <div class="pts-box"><b>${u.p}</b> pts</div>
  </div>
  ${target?`<div class="row" style="margin-top:12px"><button class="btn pri" data-act="addDb" data-f="${f.id}" data-v="${esc(u.n)}">+ Añadir a ${esc(target.name)}</button></div>`:""}
  <h2>Perfil</h2>
  ${profile}
  ${models}
  <div class="wgrid">
    ${weaponTable("Armas a distancia","BS",u.rw)}
    ${weaponTable("Armas cuerpo a cuerpo","WS",u.mw)}
  </div>
  ${u.ab.length?`<h2>Habilidades</h2><div class="panel sheet-ab">${u.ab.map(([n,d,army])=>`<div>
    <div class="an">${esc(n)}${army?`<em class="tag">Ejército</em>`:""}</div>
    <div class="ad">${esc(d)}</div>
  </div>`).join("")}</div>`:""}
  ${chips("Palabras clave", u.kw)}
  ${chips("Palabras clave de facción", u.fk)}
  ${chips("Puede liderar", u.at)}
  <div class="muted small" style="margin-top:18px">Hoja de datos de 11.ª edición según warmind.online.</div>`;
}

function statsHTML(u){
  if(!u || !STATS.some(k=>u.stats[k])) return "";
  return `<div class="stats">${STATS.map(k=>`<div><small>${k}</small>${esc(u.stats[k]||"–")}</div>`).join("")}</div>`;
}

function viewList(){
  const l = curList(); const f = fac(l.faction); const t = total(l); const pct = Math.min(100, t/l.limit*100);
  const q = (S.q||"").toLowerCase();
  const filt = S.addCat || "HP";
  const dbNames = new Set(dbUnits(l.faction).map(r=>r.name));
  const custom = S.catalog.filter(u=>u.faction===l.faction && u.src!=="db" && !dbNames.has(u.name) && u.name.toLowerCase().includes(q));
  return `
  <h2>Lista activa · <span style="color:var(--accent-bright)">${esc(f.name)}</span></h2>
  <div class="panel">
    <div class="row">
      <select class="grow" data-chg="pickList">${S.lists.map(x=>`<option value="${x.id}" ${x.id===l.id?"selected":""}>${esc(x.name)} — ${esc(fac(x.faction).name)}</option>`).join("")}</select>
      <select style="width:auto" data-chg="limit">${LIMITS.map(v=>`<option ${v===l.limit?"selected":""}>${v}</option>`).join("")}</select>
    </div>
    <div class="row" style="margin-top:8px">
      <button class="btn sm" data-act="newList">Nueva</button>
      <button class="btn sm" data-act="renameList">Renombrar</button>
      <button class="btn sm" data-act="dupList">Duplicar</button>
      <button class="btn sm bad" data-act="delList">Borrar</button>
    </div>
    <div class="points" style="margin-top:14px"><b>${t}</b><span class="muted">/ ${l.limit} pts</span></div>
    <div class="meter ${t>l.limit?"over":""}"><i style="width:${pct}%"></i></div>
    <ul class="warns">${validate(l).map(([k,m])=>`<li class="${k}">${esc(m)}</li>`).join("")}</ul>
  </div>
  <div class="grid2">
    <div>
      <h2>Unidades en la lista · ${l.units.length}</h2>
      <div class="cards">
      ${l.units.length ? l.units.map(e=>{
        const u = byId(e.unitId);
        if(!u) return `<div class="card"><div class="row"><span class="grow muted">Unidad eliminada</span><button class="btn sm bad" data-act="rmEntry" data-v="${e.uid}">Quitar</button></div></div>`;
        return `<div class="card ${isChar(u)?"hero":""}">
          <div class="row"><span class="uname grow">${esc(u.name)}</span><span class="pts">${ptsOf(e)} pts</span></div>
          <div class="row">
            <span class="tag">${esc(u.role)}</span>
            ${u.sizes.length>1?`<select style="width:auto" data-chg="size" data-v="${e.uid}">${u.sizes.map((s,i)=>`<option value="${i}" ${i===e.sizeIdx?"selected":""}>${sizeLabel(s)} · ${s.pts} pts</option>`).join("")}</select>`:`<span class="muted small">${sizeLabel(u.sizes[0])}</span>`}
            <span class="grow"></span>
            <button class="btn sm" data-act="dupEntry" data-v="${e.uid}">+1</button>
            <button class="btn sm bad" data-act="rmEntry" data-v="${e.uid}">Quitar</button>
          </div>
          <input type="text" placeholder="Equipo, líder adjunto, mejoras…" value="${esc(e.note)}" data-in="note" data-v="${e.uid}">
        </div>`;}).join("") : `<div class="empty">Lista vacía. Añade unidades desde «Añadir».</div>`}
      </div>
    </div>
    <div>
      <h2>Añadir · ${esc(f.name)}</h2>
      <div class="panel">
        ${catChips(l.faction, filt, "addCat")}
        <input type="text" style="margin-top:10px" placeholder="Buscar unidad…" value="${esc(S.q||"")}" data-in="q">
        <div class="add-list" style="margin-top:10px">
          ${custom.length?`<div class="cat-h">Mis unidades</div>`+custom.map(u=>`<div class="add-item"><span class="grow">${esc(u.name)}</span><span class="pts">${u.sizes[0]?.pts||0}</span><button class="btn sm pri" data-act="add" data-v="${u.id}">Añadir</button></div>`).join(""):""}
          ${rosterHTML(l.faction, filt, q, "Añadir")}
        </div>
        <div class="muted small" style="margin-top:8px">Puntos del tamaño mínimo. Para tamaños mayores, edita la unidad en «Unidades».</div>
      </div>
      <h2>Compartir y copias</h2>
      <div class="panel row">
        <button class="btn" data-act="exportText">Lista en texto</button>
        <button class="btn" data-act="exportJSON">Exportar copia</button>
        <button class="btn" data-act="importJSON">Importar copia</button>
      </div>
    </div>
  </div>`;
}

function viewCatalog(){
  const ed = S.editing ? (S.editing==="new" ? unit("","Otra",[[1,0]], S.newUnitFac || curList().faction) : byId(S.editing)) : null;
  const filt = S.catFilter || "all";
  const shown = S.catalog.filter(u=>filt==="all" || u.faction===filt);
  return `
  ${ed ? `<h2>${S.editing==="new"?"Nueva unidad":"Editar unidad"}</h2>
  <div class="panel form" id="unitForm">
    <label>Nombre<input type="text" name="name" value="${esc(ed.name)}"></label>
    <div class="row">
      <label class="grow">Facción<select name="faction">${FACTIONS.map(f=>`<option value="${f.id}" ${f.id===ed.faction?"selected":""}>${esc(f.name)}</option>`).join("")}</select></label>
      <label class="grow">Tipo<select name="role">${ROLES.map(r=>`<option ${r===ed.role?"selected":""}>${r}</option>`).join("")}</select></label>
    </div>
    <label>Tamaños y puntos (modelos:puntos, separados por comas; 0 = tamaño mínimo)<input type="text" name="sizes" value="${esc(ed.sizes.map(s=>s.n+":"+s.pts).join(", "))}" placeholder="5:80, 10:160"></label>
    <label>Perfil</label>
    <div class="statin">${STATS.map(k=>`<input type="text" name="st_${k}" placeholder="${k}" value="${esc(ed.stats[k])}">`).join("")}</div>
    <label>Notas (armas, habilidades clave, recordatorios)<textarea name="notes">${esc(ed.notes)}</textarea></label>
    <div class="row"><button class="btn pri" data-act="saveUnit">Guardar</button><button class="btn" data-act="cancelEdit">Cancelar</button></div>
  </div>` : ""}
  <h2>Tus unidades · ${shown.length}</h2>
  <div class="row" style="margin-bottom:10px">
    <button class="btn pri" data-act="newUnit">+ Nueva unidad</button>
    <select class="grow" style="max-width:320px" data-chg="catFilter"><option value="all">Todas las facciones</option>${FACTIONS.map(f=>`<option value="${f.id}" ${f.id===filt?"selected":""}>${esc(f.name)}</option>`).join("")}</select>
  </div>
  <div class="cards">
    ${shown.map(u=>`<div class="card ${isChar(u)?"hero":""}" style="${isChar(u)?"":`border-left-color:${fac(u.faction).color}`}">
      <div class="row"><span class="uname grow">${esc(u.name)}</span><span class="tag">${esc(u.role)}</span></div>
      <div class="muted small">${esc(fac(u.faction).name)} · ${u.sizes.map(s=>`${sizeLabel(s)} · <span class="pts">${s.pts}</span>`).join("  ·  ")}</div>
      ${statsHTML(u)}
      ${u.notes?`<div class="small" style="white-space:pre-wrap">${esc(u.notes)}</div>`:""}
      <div class="row"><button class="btn sm" data-act="editUnit" data-v="${u.id}">Editar</button><button class="btn sm bad" data-act="delUnit" data-v="${u.id}">Borrar</button></div>
    </div>`).join("") || `<div class="empty">No hay unidades con este filtro. Las que añadas desde la base aparecerán aquí para que completes su perfil.</div>`}
  </div>`;
}

function viewBattle(){
  const b = S.battle;
  if(!b){
    return `<h2>Preparar partida</h2>
    <div class="panel form">
      <label>Tu ejército<select id="bList">${S.lists.map(l=>`<option value="${l.id}" ${l.id===S.activeList?"selected":""}>${esc(l.name)} · ${total(l)} pts</option>`).join("")}</select></label>
      <div class="row"><label class="grow">Tu nombre<input type="text" id="bP1" value="Yo"></label><label class="grow">Rival<input type="text" id="bP2" value="Rival"></label></div>
      <label>Facción del rival<select id="bFac">${FACTIONS.map(f=>`<option value="${f.id}">${esc(f.name)}</option>`).join("")}</select></label>
      <label>¿Quién empieza?<select id="bFirst"><option value="0">Yo</option><option value="1">El rival</option></select></label>
      <label style="display:flex;gap:8px;align-items:center;color:var(--text);text-transform:none;letter-spacing:0;font-size:13px"><input type="checkbox" id="bAuto" checked style="width:auto"> Sumar 1 PM a cada jugador en cada fase de Mando</label>
      <button class="btn pri" data-act="startBattle">Empezar partida</button>
    </div>`;
  }
  const l = S.lists.find(x=>x.id===b.listId);
  const pfac = [l ? fac(l.faction) : fac(DEFAULT_FAC), fac(b.oppFaction)];
  const active = b.turn===0 ? b.first : 1-b.first;
  const tot = p => b.score[p].reduce((a,[x,y])=>a+(+x||0)+(+y||0),0);
  return `
  ${b.ended?`<div class="banner">Partida terminada · ${esc(b.names[0])} ${tot(0)} – ${tot(1)} ${esc(b.names[1])}</div>`:""}
  <h2>Ronda ${b.round} de 5 · turno de ${esc(b.names[active])}</h2>
  <div class="phases">${PHASES.map((p,i)=>`<div class="phase ${i===b.phase?"on":i<b.phase?"done":""}" data-act="setPhase" data-v="${i}">${p}</div>`).join("")}</div>
  <div class="row" style="margin-top:10px">
    <button class="btn" data-act="prevPhase">← Atrás</button>
    <button class="btn pri grow" data-act="nextPhase">Siguiente fase →</button>
  </div>
  <h2>Puntos de mando y victoria</h2>
  <div class="players">
    ${[0,1].map(p=>`<div class="player ${p===active?"active":""}" style="--pc:${pfac[p].color}">
      <div class="nm">${esc(b.names[p])}</div>
      <div class="muted small">${esc(pfac[p].name)}</div>
      <div class="muted small" style="margin-top:6px">Puntos de mando</div>
      <div class="counter"><button data-act="cp" data-v="${p}" data-d="-1">−</button><span class="big">${b.cp[p]}</span><button data-act="cp" data-v="${p}" data-d="1">+</button></div>
      <div class="muted small" style="margin-top:8px">Puntos de victoria</div>
      <div class="big" style="color:var(--gold-bright)">${tot(p)}</div>
    </div>`).join("")}
  </div>
  <div class="panel" style="margin-top:10px;overflow-x:auto">
    <table class="score">
      <tr><th>Ronda</th><th colspan="2">${esc(b.names[0])}</th><th colspan="2">${esc(b.names[1])}</th></tr>
      <tr><th></th><th>Prim.</th><th>Sec.</th><th>Prim.</th><th>Sec.</th></tr>
      ${[0,1,2,3,4].map(r=>`<tr class="${r===b.round-1?"cur":""}"><td>${r+1}</td>${[0,1].map(p=>[0,1].map(k=>`<td><input type="number" inputmode="numeric" min="0" value="${b.score[p][r][k]||""}" data-chg="score" data-v="${p},${r},${k}"></td>`).join("")).join("")}</tr>`).join("")}
    </table>
  </div>
  <h2>Tus unidades · ${l?esc(l.name):"lista borrada"}</h2>
  <div class="cards">
    ${l ? l.units.map(e=>{ const u=byId(e.unitId); if(!u) return ""; const st=b.units[e.uid]||{w:0,dead:false};
      return `<div class="card ${st.dead?"dead":""} ${isChar(u)?"hero":""}">
        <div class="row"><span class="uname grow">${esc(u.name)}</span><span class="pts">${ptsOf(e)} pts</span></div>
        ${e.note?`<div class="muted small">${esc(e.note)}</div>`:""}
        ${statsHTML(u)}
        <div class="row">
          <span class="muted small">Heridas sufridas</span>
          <div class="counter"><button data-act="wound" data-v="${e.uid}" data-d="-1">−</button><span class="big" style="font-size:24px;min-width:28px">${st.w}</span><button data-act="wound" data-v="${e.uid}" data-d="1">+</button></div>
          <span class="grow"></span>
          <button class="btn sm ${st.dead?"":"bad"}" data-act="dead" data-v="${e.uid}">${st.dead?"Revivir":"Destruida"}</button>
        </div>
      </div>`;}).join("") : ""}
  </div>
  <div class="muted small" style="margin-top:8px">Destruido: ${l?l.units.filter(e=>b.units[e.uid]?.dead).reduce((a,e)=>a+ptsOf(e),0):0} pts de ${l?total(l):0}</div>
  <h2>Notas de partida</h2>
  <textarea data-in="bnotes" placeholder="Misión, secundarias, objetivos, recordatorios…">${esc(b.notes)}</textarea>
  <div class="row" style="margin-top:14px"><button class="btn bad" data-act="endBattle">Cerrar partida</button></div>`;
}

const RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isOwner(uid) {
      return request.auth != null && request.auth.uid == uid;
    }
    function validUserDoc() {
      let d = request.resource.data;
      return d.keys().hasOnly(['data', 'updatedAtMs', 'client', 'version'])
        && d.data is string && d.data.size() < 1000000
        && d.updatedAtMs is number;
    }
    match /users/{uid} {
      allow read, delete: if isOwner(uid);
      allow create, update: if isOwner(uid) && validUserDoc();
    }
  }
}`;
function viewAccount(){
  const c = Cloud;
  if(!c.config()){
    return `<h2>Cuenta en la nube</h2>
    <div class="panel form">
      <div>Para crear cuentas y abrir tus listas desde cualquier dispositivo, conecta un proyecto de Firebase (es gratis):</div>
      <ol class="steps">
        <li>Entra en <b>console.firebase.google.com</b> y crea un proyecto.</li>
        <li>En <b>Authentication → Sign-in method</b>, activa <b>Correo electrónico/contraseña</b> y <b>Google</b>.</li>
        <li>En <b>Firestore Database</b>, crea la base de datos y pega estas reglas en la pestaña <b>Reglas</b>:</li>
      </ol>
      <pre>${esc(RULES)}</pre>
      <ol class="steps" start="4">
        <li>En <b>Configuración del proyecto → Tus apps</b>, añade una app web y copia el objeto <code>firebaseConfig</code>.</li>
        <li>Pégalo aquí debajo (o en <code>FIREBASE_CONFIG</code> al principio del archivo, para que valga para todo el mundo).</li>
      </ol>
      <div class="note">Importante: el inicio de sesión solo funciona con la app abierta desde una dirección web <b>https</b>. Si la subes a <b>Firebase Hosting</b> se configura sola y no hace falta pegar nada. Dentro de la vista publicada de Claude o abriendo el archivo con doble clic, Google bloquea la conexión.</div>
      <ol class="steps" start="6" hidden>
      </ol>
      <label>firebaseConfig<textarea id="cfgIn" placeholder='{ apiKey: "...", authDomain: "...", projectId: "...", appId: "..." }' style="min-height:120px;font-family:var(--font-mono);font-size:12.5px"></textarea></label>
      <div class="row"><button class="btn pri" data-act="saveCfg">Conectar</button></div>
    </div>`;
  }
  if(c.state==="loading") return `<h2>Cuenta en la nube</h2><div class="panel">Conectando con Firebase…</div>`;
  if(c.state==="unavailable"){
    return `<h2>Cuenta en la nube</h2>
    <div class="panel form">
      <div class="note err">${esc(c.msg||"No se pudo conectar con Firebase.")}</div>
      <div class="row"><button class="btn pri" data-act="retryCloud">Reintentar</button>${FIREBASE_CONFIG||Cloud.hostingCfg?"":`<button class="btn bad" data-act="clearCfg">Quitar configuración</button>`}</div>
    </div>
    ${diagHTML()}`;
  }
  if(!c.user){
    return `<h2>Cuenta en la nube</h2>
    <div class="panel form" style="max-width:460px" id="authBox">
      <div class="muted small">Entra o crea una cuenta para guardar tus listas en la nube y abrirlas desde cualquier dispositivo. Sin sesión iniciada, los cambios no se guardan.</div>
      <div id="authMsg" class="note ${c.msgErr?"err":""}" ${c.msg?"":"hidden"}>${esc(c.msg)}</div>
      <div class="row"><button class="btn" data-act="signInGoogle">Entrar con Google</button></div>
      <div class="muted small">o con correo y contraseña:</div>
      <label>Correo electrónico<input type="email" id="authEmail" autocomplete="email" value="${esc(c.lastEmail||"")}"></label>
      <label>Contraseña
        <span class="pass-wrap"><input type="password" id="authPass" autocomplete="current-password" placeholder="Mínimo 6 caracteres"><button type="button" class="eye" data-act="togglePass" aria-label="Mostrar contraseña" aria-pressed="false" title="Mostrar contraseña">${EYE}</button></span>
      </label>
      <div class="row">
        <button class="btn pri" data-act="signIn">Entrar</button>
        <button class="btn" data-act="signUp">Crear cuenta</button>
        <span class="grow"></span>
        <button class="btn sm" data-act="resetPass">¿Olvidaste la contraseña?</button>
      </div>
    </div>
    ${diagHTML()}
    ${FIREBASE_CONFIG||Cloud.hostingCfg?"":`<div class="row" style="margin-top:12px"><button class="btn sm bad" data-act="clearCfg">Quitar configuración de Firebase</button></div>`}`;
  }
  return `<h2>Cuenta en la nube</h2>
  <div class="panel form" style="max-width:520px">
    <div><span class="muted small">Sesión iniciada como</span><br><b>${esc(c.user.email)}</b></div>
    <div class="note ${c.state==="error"?"err":""}">${esc(c.statusText())}</div>
    <div class="row">
      <button class="btn pri" data-act="syncNow">Sincronizar ahora</button>
      <button class="btn" data-act="signOut">Cerrar sesión</button>
    </div>
    <div class="muted small">Tus listas, unidades y la partida en curso se guardan solas en la nube unos segundos después de cada cambio, y se actualizan en tus otros dispositivos.</div>
  </div>
  ${legacyHTML()}
  ${diagHTML()}`;
}
/* Datos guardados en este navegador por versiones anteriores (antes de las cuentas) */
function legacyInfo(){
  try{
    const s = JSON.parse(readLS(LEGACY_KEY)||"null");
    if(!s || !Array.isArray(s.catalog) || !Array.isArray(s.lists)) return null;
    const origin = !s.syncedUid ? "none" : s.syncedUid===Cloud.user?.uid ? "mine" : "other";
    return {s, origin};
  }catch(e){ return null; }
}
function legacyHTML(){
  const L = Cloud.user && !Cloud.loadingUser && legacyInfo(); if(!L) return "";
  if(L.origin==="other") return `<h2>Datos antiguos en este dispositivo</h2>
  <div class="panel form" style="max-width:520px">
    <div class="note">Este navegador guarda una copia antigua de las listas de <b>otra cuenta</b>. No se ha cargado en la tuya ni se mostrará.</div>
    <div class="row"><button class="btn bad" data-act="legacyDelete">Borrar esa copia de este dispositivo</button></div>
  </div>`;
  return `<h2>Datos antiguos en este dispositivo</h2>
  <div class="panel form" style="max-width:520px">
    <div class="note">Este navegador guarda una copia antigua (${L.s.lists.length} lista${L.s.lists.length===1?"":"s"}, ${L.s.catalog.length} unidad${L.s.catalog.length===1?"":"es"}) ${L.origin==="mine"?"que se sincronizó con esta cuenta":"creada <b>sin cuenta</b>: no se sabe a quién pertenece"}. No se ha mezclado con tus datos.</div>
    <div class="row">
      <button class="btn" data-act="legacyExport">Descargar copia</button>
      <button class="btn pri" data-act="legacyImport">Importar a mi cuenta</button>
      <button class="btn bad" data-act="legacyDelete">Borrar de este dispositivo</button>
    </div>
  </div>`;
}
const EYE = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.4 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.1M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a10 10 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>`;
function diagHTML(){
  return `<h2>Diagnóstico</h2>
  <div class="panel form" style="max-width:520px">
    <div class="muted small">Comprueba la conexión con tu proyecto de Firebase sin crear ni cambiar nada.</div>
    <div class="row"><button class="btn" data-act="diagnose">Probar conexión</button></div>
    <pre id="diagOut" ${Cloud.diag?"":"hidden"}>${esc(Cloud.diag||"")}</pre>
  </div>`;
}

/* ---------- Firebase: cuentas y sincronización ---------- */
const Cloud = {
  state:"off", user:null, msg:"", msgErr:false, lastEmail:"", fb:null, unsub:null, timer:null, lastSync:0,
  session:0, loadingUser:false,
  config(){
    if(FIREBASE_CONFIG) return FIREBASE_CONFIG;
    if(this.hostingCfg) return this.hostingCfg;
    try{ return JSON.parse(readLS(CFG_KEY)||"null"); }catch(e){ return null; }
  },
  statusText(){
    return {pending:"Cambios pendientes de subir…", syncing:"Sincronizando…", error:"Error al sincronizar: "+(this.msg||""),
      ok: this.lastSync ? "Sincronizado a las "+new Date(this.lastSync).toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}) : "Sincronizado"}[this.state] || "";
  },
  paint(){
    const el = document.getElementById("sync"); if(!el) return;
    const st = !this.config() ? "off" : this.user ? this.state : "off";
    el.className = "sync "+st;
    el.querySelector("span").textContent = !this.user ? "Sin guardar" : this.loadingUser ? "Cargando" :
      ({pending:"Pendiente",syncing:"Sincronizando",error:"Error",ok:"En la nube"}[this.state]||"En la nube");
    if(S.tab==="cuenta" && this.user){ const n = app.querySelector(".note"); if(n){ n.textContent=this.statusText(); n.classList.toggle("err", this.state==="error"); } }
  },
  loadScript(src){
    return new Promise((res,rej)=>{ const s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=()=>rej(new Error("No se pudo descargar "+src.split("/").pop())); document.head.appendChild(s); });
  },
  async init(){
    // En Firebase Hosting la configuración del proyecto se lee sola de /__/firebase/init.json
    if(!FIREBASE_CONFIG && !this.hostingCfg && location.protocol.startsWith("http")){
      try{
        const r = await fetch("/__/firebase/init.json", {cache:"no-store"});
        if(r.ok){ const j = await r.json(); if(j && j.apiKey && j.projectId) this.hostingCfg = j; }
      }catch(e){}
    }
    const cfg = this.config(); if(!cfg){ if(S.tab==="cuenta") render(); return; }
    this.state="loading"; this.msg=""; this.loadingUser=true; render();
    try{
      if(!window.firebase?.firestore){
        const base = `https://cdn.jsdelivr.net/npm/firebase@${FIREBASE_SDK}/`;
        await this.loadScript(base+"firebase-app-compat.js");
        await this.loadScript(base+"firebase-auth-compat.js");
        await this.loadScript(base+"firebase-firestore-compat.js");
      }
      const appFb = firebase.apps.length ? firebase.app() : firebase.initializeApp(cfg);
      this.fb = {auth:appFb.auth(), db:appFb.firestore()};
      try{ await this.fb.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL); }
      catch(e){ try{ await this.fb.auth.setPersistence(firebase.auth.Auth.Persistence.NONE); }catch(_){} }
      this.state="off";
      this.fb.auth.onAuthStateChanged(u=>this.onUser(u));
      // errores de un inicio con Google por redirección (cuando el navegador bloquea la ventana)
      this.fb.auth.getRedirectResult().catch(e=>{ this.msg=this.err(e); this.msgErr=true; render(); });
    }catch(e){
      this.state="unavailable"; this.loadingUser=false; this.msg = e.message || "No se pudo conectar con Firebase. Comprueba tu conexión a internet.";
    }
    if(S.tab==="cuenta") render(); else this.paint();
  },
  ref(){ return this.fb.db.collection("users").doc(this.user.uid); },
  /* Cada cambio de usuario (entrar, salir o cambiar de cuenta) empieza de cero:
     se vacía lo privado y se cargan solo los datos de users/{uid}. */
  async onUser(u){
    const session = ++this.session;
    if(this.unsub){ this.unsub(); this.unsub=null; }
    clearTimeout(this.timer); this.timer=null;
    this.ready = false; this.user = u;
    resetPrivate();
    if(!u){ this.state="off"; this.loadingUser=false; render(); return; }
    this.state="syncing"; this.msg=""; this.msgErr=false; this.loadingUser=true; render();
    try{
      const snap = await this.ref().get();
      if(session!==this.session) return;
      if(snap.exists) this.apply(snap.data());
      else { S.updatedAt = Date.now(); await this.push(); }   // cuenta nueva: documento propio vacío
      if(session!==this.session) return;
      this.ready = true;
      this.unsub = this.ref().onSnapshot(s=>{
        if(session!==this.session || !s.exists || s.metadata.hasPendingWrites) return;
        const r = s.data();
        if(r.client===CLIENT_ID) return;
        if((r.updatedAtMs||0) > (S.updatedAt||0)){ this.apply(r); toast("Listas actualizadas desde otro dispositivo"); }
      }, e=>{ this.state="error"; this.msg=this.err(e); this.paint(); });
      this.state="ok"; this.lastSync=Date.now();
    }catch(e){
      if(session!==this.session) return;
      // sin datos cargados no se sube nada, para no pisar la nube con una lista vacía
      this.state="error"; this.msg=this.err(e)+" Pulsa «Sincronizar ahora» para reintentar.";
    }
    this.loadingUser=false;
    if(this.legacyPending()) toast("Hay datos antiguos en este dispositivo: revisa la pestaña Cuenta");
    render();
  },
  legacyPending(){ const L = legacyInfo(); return !!L && L.origin!=="other"; },
  apply(r){
    try{
      const d = JSON.parse(r.data);
      S.catalog = d.catalog||[]; S.lists = d.lists||[]; S.battle = d.battle||null; S.ptsVersion = d.ptsVersion;
      S.updatedAt = r.updatedAtMs||Date.now(); S.editing=null;
      migrate(); lastData = dataStr();
      this.lastSync = Date.now(); render();
    }catch(e){ this.state="error"; this.msg="Los datos de la nube no se pudieron leer."; }
  },
  async push(){
    if(!this.user) return;
    if(!S.updatedAt) S.updatedAt = Date.now();
    await this.ref().set({data:dataStr(), updatedAtMs:S.updatedAt, client:CLIENT_ID, version:2});
    this.lastSync = Date.now();
  },
  /* sube ya lo pendiente (antes de cerrar sesión) */
  async flush(){
    if(!this.timer || !this.ready) return;
    clearTimeout(this.timer); this.timer=null;
    try{ await this.push(); }catch(e){ console.error("[Bastión] flush", e); }
  },
  async signOut(){
    await this.flush();
    this.lastEmail = ""; this.msg = "";
    await this.fb.auth.signOut();
  },
  async google(){
    if(!this.fb){ this.msg="Firebase todavía no está listo. Pulsa «Probar conexión»."; this.msgErr=true; return render(); }
    const p = new firebase.auth.GoogleAuthProvider();
    p.setCustomParameters({prompt:"select_account"});
    this.busy(true, "Entrando con Google…");
    try{ await this.fb.auth.signInWithPopup(p); this.msg=""; }
    catch(e){
      if(e?.code==="auth/popup-blocked" || e?.code==="auth/operation-not-supported-in-this-environment"){
        try{ return await this.fb.auth.signInWithRedirect(p); }catch(e2){ e = e2; }
      }
      if(e?.code==="auth/popup-closed-by-user" || e?.code==="auth/cancelled-popup-request"){ this.msg=""; return render(); }
      console.error("[Bastión] google", e); this.msg=this.err(e)+(e?.code?` (${e.code})`:""); this.msgErr=true; render();
    }
  },
  schedulePush(){
    if(!this.user || !this.ready) return;
    clearTimeout(this.timer); this.state="pending"; this.paint();
    this.timer = setTimeout(async ()=>{
      this.timer = null; this.state="syncing"; this.paint();
      try{ await this.push(); this.state="ok"; }catch(e){ this.state="error"; this.msg=this.err(e); }
      this.paint();
    }, 1200);
  },
  err(e){
    const m = {
      "auth/invalid-email":"El correo no es válido.",
      "auth/missing-password":"Escribe la contraseña.",
      "auth/user-not-found":"Correo o contraseña incorrectos.",
      "auth/wrong-password":"Correo o contraseña incorrectos.",
      "auth/invalid-credential":"Correo o contraseña incorrectos.",
      "auth/invalid-login-credentials":"Correo o contraseña incorrectos.",
      "auth/email-already-in-use":"Ya existe una cuenta con ese correo. Pulsa «Entrar».",
      "auth/weak-password":"La contraseña debe tener al menos 6 caracteres.",
      "auth/too-many-requests":"Demasiados intentos. Espera un momento y vuelve a probar.",
      "auth/network-request-failed":"Sin conexión con Firebase. Revisa internet.",
      "auth/operation-not-allowed":"Ese método de acceso no está activado: actívalo en Authentication → Sign-in method de tu proyecto Firebase.",
      "auth/unauthorized-domain":"Este dominio no está autorizado: añádelo en Authentication → Settings → Authorized domains.",
      "auth/account-exists-with-different-credential":"Ya existe una cuenta con ese correo creada con otro método. Entra con correo y contraseña.",
      "auth/popup-blocked":"El navegador ha bloqueado la ventana de Google. Permite las ventanas emergentes y vuelve a probar.",
      "auth/operation-not-supported-in-this-environment":"Abre la app desde una dirección web (http o https), no como archivo suelto.",
      "auth/admin-restricted-operation":"El registro de usuarios está desactivado en tu proyecto Firebase.",
      "auth/configuration-not-found":"Authentication no está activado en tu proyecto Firebase.",
      "auth/api-key-not-valid.-please-pass-a-valid-api-key.":"La apiKey del firebaseConfig no es válida.",
      "auth/internal-error":"Firebase ha devuelto un error interno. Pulsa «Probar conexión».",
      "permission-denied":"Firestore ha rechazado el acceso: revisa las reglas de seguridad.",
      "unavailable":"Firestore no responde. Revisa la conexión."
    }[e?.code];
    return m || e?.message || "Error desconocido.";
  },
  timeout(p, ms=15000){
    return Promise.race([p, new Promise((_,rej)=>setTimeout(()=>{ const e=new Error("Firebase no ha respondido en 15 segundos. Pulsa «Probar conexión» para ver qué falla."); e.code="timeout"; rej(e); }, ms))]);
  },
  busy(on, label){
    app.querySelectorAll("#authBox .btn").forEach(b=>b.disabled=on);
    const n = document.getElementById("authMsg");
    if(n && on){ n.className="note"; n.textContent=label; n.hidden=false; }
  },
  async auth(kind){
    const email = document.getElementById("authEmail")?.value.trim();
    const pass = document.getElementById("authPass")?.value || "";
    this.lastEmail = email; this.msgErr=false;
    if(!this.fb){ this.msg="Firebase todavía no está listo. Pulsa «Probar conexión»."; this.msgErr=true; return render(); }
    if(!email){ this.msg="Escribe tu correo electrónico."; this.msgErr=true; return render(); }
    if(kind!=="reset" && !pass){ this.msg="Escribe la contraseña."; this.msgErr=true; return render(); }
    if(kind==="up" && pass.length<6){ this.msg="La contraseña debe tener al menos 6 caracteres."; this.msgErr=true; return render(); }
    this.busy(true, kind==="up"?"Creando la cuenta…":kind==="reset"?"Enviando el correo…":"Entrando…");
    try{
      if(kind==="reset"){
        await this.timeout(this.fb.auth.sendPasswordResetEmail(email));
        this.msg="Si existe una cuenta con ese correo, te llegará un enlace para cambiar la contraseña (revisa también el spam).";
        return render();
      }
      if(kind==="up") await this.timeout(this.fb.auth.createUserWithEmailAndPassword(email, pass));
      else await this.timeout(this.fb.auth.signInWithEmailAndPassword(email, pass));
      this.msg="";
    }catch(e){ console.error("[Bastión] auth", e); this.msg=this.err(e)+(e?.code&&e.code!=="timeout"?` (${e.code})`:""); this.msgErr=true; render(); }
  },
  /* comprobaciones sin modificar nada: SDK, servicio de cuentas y base de datos */
  async diagnose(){
    const cfg = this.config(); const out = [];
    const line = (ok, txt) => out.push((ok===true?"✔ ":ok===false?"✘ ":"• ")+txt);
    line(location.protocol.startsWith("http"), "Dirección de la página: "+location.protocol+"//"+(location.host||"(archivo local)")+(location.protocol.startsWith("http")?"":" — Firebase necesita http o https"));
    line(!!cfg, cfg ? `Configuración encontrada (proyecto «${cfg.projectId}»)` : "No hay firebaseConfig");
    line(!!window.firebase?.firestore, window.firebase?.firestore ? "SDK de Firebase cargado" : "El SDK de Firebase no se ha cargado");
    if(cfg){
      try{
        const r = await this.timeout(fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(cfg.apiKey)}`, {method:"POST", headers:{"Content-Type":"application/json"}, body:"{}"}), 10000);
        const j = await r.json().catch(()=>({}));
        const m = j?.error?.message || "";
        if(/MISSING_ID_TOKEN|INVALID_ID_TOKEN/.test(m)) line(true, "Servicio de cuentas accesible y apiKey válida");
        else if(/API_KEY_INVALID|API key not valid/i.test(m)) line(false, "La apiKey no es válida: revisa que copiaste bien el firebaseConfig");
        else if(/referer|referrer|blocked/i.test(m)) line(false, "La apiKey bloquea esta dirección (restricción de sitios en Google Cloud): "+m);
        else if(/CONFIGURATION_NOT_FOUND/.test(m)) line(false, "Authentication no está activado en el proyecto: entra en Authentication y pulsa «Comenzar»");
        else line(null, "Respuesta del servicio de cuentas: "+(m||r.status));
      }catch(e){ line(false, "No se puede conectar con el servicio de cuentas de Google ("+(e.message||e)+"). Si estás dentro de la vista publicada de Claude o en un archivo local, abre la app desde Firebase Hosting."); }
      try{
        const r = await this.timeout(fetch(`https://firestore.googleapis.com/v1/projects/${encodeURIComponent(cfg.projectId)}/databases/(default)/documents/users/__prueba?key=${encodeURIComponent(cfg.apiKey)}`), 10000);
        const j = await r.json().catch(()=>({}));
        const st = j?.error?.status || "";
        if(r.status===403 && st==="PERMISSION_DENIED" && /rules|permission/i.test(j.error.message||"")) line(true, "Firestore accesible y protegido por tus reglas");
        else if(r.status===404 && /database/i.test(j?.error?.message||"")) line(false, "No existe la base de datos Firestore: créala en Firestore Database");
        else if(r.status===404) line(true, "Firestore accesible");
        else if(st==="PERMISSION_DENIED") line(false, "Firestore: "+(j.error.message||"").slice(0,160));
        else line(null, "Respuesta de Firestore: "+(st||r.status));
      }catch(e){ line(false, "No se puede conectar con Firestore ("+(e.message||e)+")"); }
    }
    return out.join("\n");
  }
};

/* ---------- acciones ---------- */
function download(name, text){
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text],{type:"application/json"}));
  a.download = name; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function advance(dir){
  const b = S.battle; if(!b) return;
  if(dir>0){
    if(b.ended) return;
    if(b.phase<4){ b.phase++; return; }
    b.phase = 0;
    if(b.turn===0) b.turn = 1;
    else if(b.round<5){ b.turn = 0; b.round++; }
    else { b.phase = 4; b.ended = true; return; }
    if(b.autoCp){ b.cp[0]++; b.cp[1]++; }
  } else {
    if(b.ended){ b.ended=false; return; }
    if(b.phase>0){ b.phase--; return; }
    if(b.turn===1){ b.turn=0; b.phase=4; }
    else if(b.round>1){ b.round--; b.turn=1; b.phase=4; }
  }
}
async function createList(faction){
  const n = await askText(`Nueva lista de ${fac(faction).name}`, fac(faction).name); if(!n) return false;
  const x = {id:uid(), name:n, limit:1500, faction, units:[]}; S.lists.push(x); S.activeList=x.id; return true;
}
function addFromDb(fid, name){
  const r = dbRow(fid, name); if(!r) return;
  let u = S.catalog.find(x=>x.faction===fid && x.name===name);
  if(!u){
    u = unit(name, CAT_ROLE[r[1]]||"Otra", r[5] || [[0, r[2]]], fid); u.src="db"; u.cat=r[1];
    const ds = sheetOf(fid, r[3]);
    if(ds && ds.st[0]){ const s=ds.st[0]; u.stats={M:s.M,T:s.T,SV:s.SV,W:s.W,LD:s.LD,OC:s.OC}; if(ds.inv) u.notes=`INV ${ds.inv}`; }
    S.catalog.push(u);
  }
  const l = curList().faction===fid ? curList() : S.lists.find(x=>x.faction===fid);
  if(!l) return;
  l.units.push({uid:uid(), unitId:u.id, sizeIdx:0, note:""});
  toast(`${name} añadido a ${l.name}`);
}

app.addEventListener("click", async ev=>{
  const t = ev.target.closest("[data-act]"); if(!t) return;
  const v = t.dataset.v, l = curList(), b = S.battle;
  switch(t.dataset.act){
    case "openFac": S.facOpen=v; S.facUnit=null; S.rosterQ=""; window.scrollTo({top:0}); break;
    case "closeFac": S.facOpen=null; S.facUnit=null; break;
    case "openUnit": S.facUnit=v; window.scrollTo({top:0}); break;
    case "closeUnit": S.facUnit=null; break;
    case "retrySheets": delete SHEETS[v]; break;
    case "facFilter": S.facFilter=v; break;
    case "addCat": S.addCat=v; break;
    case "openList": S.activeList=v; S.tab="lista"; S.facOpen=null; break;
    case "newListFac": if(!await createList(v)) return; S.tab="lista"; S.facOpen=null; break;
    case "newUnitFac": S.newUnitFac=v; S.editing="new"; S.tab="catalogo"; S.catFilter=v; S.facOpen=null; break;
    case "addDb": addFromDb(t.dataset.f, v); break;
    case "add": l.units.push({uid:uid(), unitId:v, sizeIdx:0, note:""}); break;
    case "rmEntry": l.units = l.units.filter(e=>e.uid!==v); break;
    case "dupEntry": { const e=l.units.find(x=>x.uid===v); l.units.splice(l.units.indexOf(e)+1,0,{...e,uid:uid()}); break; }
    case "newList": if(!await createList(l.faction)) return; break;
    case "renameList": { const n=await askText("Nuevo nombre", l.name); if(!n) return; l.name=n; break; }
    case "dupList": { const x=JSON.parse(JSON.stringify(l)); x.id=uid(); x.name=l.name+" (copia)"; x.units.forEach(e=>e.uid=uid()); S.lists.push(x); S.activeList=x.id; break; }
    case "delList":
      if(S.lists.length<2){ await tell("No se puede borrar", "Necesitas al menos una lista."); return; }
      if(!await ask(`¿Borrar «${l.name}»?`, "Esta acción no se puede deshacer.", "Borrar", true)) return;
      S.lists=S.lists.filter(x=>x!==l); S.activeList=S.lists[0].id; break;
    case "exportText":
      modal({title:"Lista en texto", output:`${l.name} — ${fac(l.faction).name} — ${total(l)}/${l.limit} pts\n\n` + l.units.map(e=>{const u=byId(e.unitId); const s=sizeOf(e); return u?`• ${u.name} (${sizeLabel(s)}) · ${ptsOf(e)} pts${e.note?"\n   "+e.note:""}`:"";}).filter(Boolean).join("\n"),
        buttons:[["close","Cerrar"],["copy","Copiar","pri"]]}); return;
    case "exportJSON": download("bastion-copia.json", JSON.stringify({catalog:S.catalog, lists:S.lists},null,2)); return;
    case "importJSON": document.getElementById("importFile").click(); return;
    case "newUnit": S.newUnitFac=null; S.editing="new"; break;
    case "editUnit": S.editing=v; S.tab="catalogo"; S.facOpen=null; window.scrollTo({top:0,behavior:"smooth"}); break;
    case "cancelEdit": S.editing=null; break;
    case "saveUnit": {
      const f = document.getElementById("unitForm"); const g = n => f.querySelector(`[name="${n}"]`).value.trim();
      const name = g("name"); if(!name){ await tell("Falta el nombre", "Ponle un nombre a la unidad."); return; }
      const sizes = g("sizes").split(",").map(s=>s.split(":").map(x=>parseInt(x,10))).filter(([n,p])=>n>=0&&p>=0).map(([n,pts])=>({n,pts}));
      if(!sizes.length){ await tell("Faltan los puntos", "Indica al menos un tamaño, por ejemplo 5:80."); return; }
      const stats = {}; STATS.forEach(k=>stats[k]=g("st_"+k));
      const data = {name, role:g("role"), faction:g("faction"), sizes, stats, notes:g("notes")};
      if(S.editing==="new") S.catalog.push({id:uid(), ...data});
      else { const u=byId(S.editing); const custom = u.src==="db" && (sizes.length>1 || sizes[0].n!==0); Object.assign(u, data); if(custom) delete u.src; }
      S.lists.forEach(x=>x.units.forEach(e=>{ if(e.unitId===S.editing && e.sizeIdx>=sizes.length) e.sizeIdx=0; }));
      S.editing=null; S.newUnitFac=null; break;
    }
    case "delUnit": { const u=byId(v); if(!await ask(`¿Borrar «${u.name}»?`, "Se quitará del catálogo y de todas las listas.", "Borrar", true)) return; S.catalog=S.catalog.filter(x=>x.id!==v); S.lists.forEach(x=>x.units=x.units.filter(e=>e.unitId!==v)); break; }
    case "startBattle": {
      const p1=document.getElementById("bP1").value.trim()||"Yo", p2=document.getElementById("bP2").value.trim()||"Rival";
      S.battle = {listId:document.getElementById("bList").value, names:[p1,p2], oppFaction:document.getElementById("bFac").value, first:+document.getElementById("bFirst").value,
        round:1, turn:0, phase:0, cp:[1,1], autoCp:document.getElementById("bAuto").checked,
        score:[0,1].map(()=>[0,1,2,3,4].map(()=>[0,0])), units:{}, notes:"", ended:false};
      break;
    }
    case "nextPhase": advance(1); break;
    case "prevPhase": advance(-1); break;
    case "setPhase": b.phase=+v; break;
    case "cp": b.cp[+v]=Math.max(0,b.cp[+v]+(+t.dataset.d)); break;
    case "wound": { const st=b.units[v]||(b.units[v]={w:0,dead:false}); st.w=Math.max(0,st.w+(+t.dataset.d)); break; }
    case "dead": { const st=b.units[v]||(b.units[v]={w:0,dead:false}); st.dead=!st.dead; break; }
    case "endBattle": if(!await ask("¿Cerrar la partida?", "Se borrará el marcador.", "Cerrar partida", true)) return; S.battle=null; break;
    case "saveCfg": {
      const raw = document.getElementById("cfgIn").value.trim();
      const cfg = parseConfig(raw);
      if(!cfg){ await tell("Configuración no válida", "Pega el objeto firebaseConfig completo, con apiKey, authDomain, projectId y appId."); return; }
      writeLS(CFG_KEY, JSON.stringify(cfg)); Cloud.init(); break;
    }
    case "clearCfg": if(!await ask("¿Quitar la configuración de Firebase?", "Los datos de tu cuenta siguen en la nube.", "Quitar", true)) return;
      if(Cloud.user) await Cloud.signOut(); writeLS(CFG_KEY, null); location.reload(); return;
    case "signInGoogle": await Cloud.google(); return;
    case "legacyExport": { const L=legacyInfo(); if(L) download("bastion-copia-antigua.json", JSON.stringify({catalog:L.s.catalog, lists:L.s.lists},null,2)); return; }
    case "legacyImport": {
      const L = legacyInfo(); if(!L || L.origin==="other" || !Cloud.ready) return;
      if(!await ask("¿Importar la copia antigua?", `Sustituirá las listas y unidades de ${Cloud.user.email||"tu cuenta"} por las de esta copia. Si quieres conservar las actuales, descárgalas antes con «Exportar copia» en la pestaña Ejército.`, "Importar", true)) return;
      S.catalog=L.s.catalog; S.lists=L.s.lists; S.activeList=L.s.activeList; S.battle=L.s.battle||null; S.ptsVersion=L.s.ptsVersion; S.editing=null;
      migrate(); S.updatedAt=Date.now(); lastData=dataStr(); render();
      // la copia local solo se borra cuando ya está guardada en la cuenta
      try{ await Cloud.push(); writeLS(LEGACY_KEY, null); Cloud.state="ok"; toast("Copia importada a tu cuenta"); }
      catch(e){ Cloud.state="error"; Cloud.msg=Cloud.err(e); }
      break;
    }
    case "legacyDelete":
      if(!await ask("¿Borrar la copia antigua de este dispositivo?", "Solo se borra de este navegador; no afecta a ninguna cuenta en la nube. No se puede deshacer.", "Borrar", true)) return;
      writeLS(LEGACY_KEY, null); break;
    case "retryCloud": Cloud.init(); return;
    case "signIn": await Cloud.auth("in"); return;
    case "signUp": await Cloud.auth("up"); return;
    case "resetPass": await Cloud.auth("reset"); return;
    case "togglePass": {
      const inp = document.getElementById("authPass"); const show = inp.type==="password";
      inp.type = show ? "text" : "password";
      t.innerHTML = show ? EYE_OFF : EYE; t.setAttribute("aria-pressed", String(show));
      t.setAttribute("aria-label", show?"Ocultar contraseña":"Mostrar contraseña"); t.title = t.getAttribute("aria-label");
      inp.focus(); return;
    }
    case "diagnose": {
      const out = document.getElementById("diagOut"); t.disabled=true;
      out.hidden=false; out.textContent="Comprobando…";
      Cloud.diag = await Cloud.diagnose(); out.textContent = Cloud.diag; t.disabled=false; return;
    }
    case "signOut": await Cloud.signOut(); toast("Sesión cerrada. Tus datos siguen guardados en tu cuenta."); return;
    case "syncNow":
      if(!Cloud.ready){ Cloud.onUser(Cloud.user); return; }   // la carga inicial falló: reintentar
      try{ Cloud.state="syncing"; Cloud.paint(); await Cloud.push(); Cloud.state="ok"; toast("Sincronizado"); }
      catch(e){ Cloud.state="error"; Cloud.msg=Cloud.err(e); }
      Cloud.paint(); return;
  }
  render();
});
function parseConfig(raw){
  if(!raw) return null;
  const body = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}")+1);
  let obj = null;
  try{ obj = JSON.parse(body); }catch(e){
    try{ obj = JSON.parse(body.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g,'$1"$2":').replace(/'/g,'"').replace(/,\s*}/g,"}")); }catch(_){ obj=null; }
  }
  return obj && obj.apiKey && obj.projectId ? obj : null;
}
document.getElementById("tabs").addEventListener("click", ev=>{
  const t = ev.target.closest("[data-act=tab]"); if(!t) return;
  S.tab=t.dataset.v; S.editing=null; S.facOpen=null; render();
});
document.getElementById("sync").addEventListener("click", ()=>{ S.tab="cuenta"; S.facOpen=null; S.editing=null; render(); });
app.addEventListener("change", ev=>{
  const t = ev.target, k = t.dataset.chg; if(!k) return;
  const l = curList();
  if(k==="pickList") S.activeList=t.value;
  if(k==="limit") l.limit=+t.value;
  if(k==="catFilter") S.catFilter=t.value;
  if(k==="size") l.units.find(e=>e.uid===t.dataset.v).sizeIdx=+t.value;
  if(k==="score"){ const [p,r,i]=t.dataset.v.split(",").map(Number); S.battle.score[p][r][i]=Math.max(0,parseInt(t.value,10)||0); }
  render();
});
app.addEventListener("input", ev=>{
  const t = ev.target, k = t.dataset.in; if(!k) return;
  if(k==="note") curList().units.find(e=>e.uid===t.dataset.v).note=t.value;
  if(k==="bnotes") S.battle.notes=t.value;
  if(k==="q" || k==="facQ" || k==="rosterQ"){ S[k]=t.value; const pos=t.selectionStart; render(); const n=app.querySelector(`[data-in="${k}"]`); n.focus(); n.setSelectionRange(pos,pos); return; }
  save();
});
document.getElementById("importFile").addEventListener("change", ev=>{
  const f = ev.target.files[0]; if(!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try{
      const d = JSON.parse(r.result);
      if(!Array.isArray(d.catalog) || !Array.isArray(d.lists) || !d.lists.length) throw 0;
      if(!await ask("¿Importar la copia?", "Esto sustituirá tus unidades y listas actuales.", "Importar", true)) return;
      S.catalog=d.catalog; S.lists=d.lists; S.activeList=d.lists[0].id; S.battle=null; migrate(); render();
    }catch(e){ tell("Archivo no válido", "El archivo no es una copia válida de Bastión."); }
    finally{ ev.target.value=""; }
  };
  r.readAsText(f);
});
document.getElementById("theme").addEventListener("click", ()=>{
  S.theme = S.theme==="light" ? "dark" : "light"; render();
});
render();
Cloud.init();
