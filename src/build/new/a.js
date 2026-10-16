// ===== Types, stats, spells =====
// Efficacité : super efficace x1.3, peu efficace x0.8, immunité x0.7, STAB x1.05. Table Gen 6+ (avec Fée).
const TYPE_CHART={
  normal:[[],["rock","steel"],["ghost"]],
  fire:[["grass","ice","bug","steel"],["fire","water","rock","dragon"],[]],
  water:[["fire","ground","rock"],["water","grass","dragon"],[]],
  electric:[["water","flying"],["electric","grass","dragon"],["ground"]],
  grass:[["water","ground","rock"],["fire","grass","poison","flying","bug","dragon","steel"],[]],
  ice:[["grass","ground","flying","dragon"],["fire","water","ice","steel"],[]],
  fighting:[["normal","ice","rock","dark","steel"],["poison","flying","psychic","bug","fairy"],["ghost"]],
  poison:[["grass","fairy"],["poison","ground","rock","ghost"],["steel"]],
  ground:[["fire","electric","poison","rock","steel"],["grass","bug"],["flying"]],
  flying:[["grass","fighting","bug"],["electric","rock","steel"],[]],
  psychic:[["fighting","poison"],["psychic","steel"],["dark"]],
  bug:[["grass","psychic","dark"],["fire","fighting","poison","flying","ghost","steel","fairy"],[]],
  rock:[["fire","ice","flying","bug"],["fighting","ground","steel"],[]],
  ghost:[["psychic","ghost"],["dark"],["normal"]],
  dragon:[["dragon"],["steel"],["fairy"]],
  dark:[["psychic","ghost"],["fighting","dark","fairy"],[]],
  steel:[["ice","rock","fairy"],["fire","water","electric","steel"],[]],
  fairy:[["fighting","dragon","dark"],["fire","poison","steel"],[]]
};
const TYPE_FR={normal:"Normal",fire:"Feu",water:"Eau",electric:"Électrik",grass:"Plante",ice:"Glace",fighting:"Combat",poison:"Poison",ground:"Sol",flying:"Vol",psychic:"Psy",bug:"Insecte",rock:"Roche",ghost:"Spectre",dragon:"Dragon",dark:"Ténèbres",steel:"Acier",fairy:"Fée"};
const TYPE_COL={normal:"#a8a878",fire:"#f08030",water:"#6890f0",electric:"#f8d030",grass:"#78c850",ice:"#98d8d8",fighting:"#c03028",poison:"#a040a0",ground:"#d1a35c",flying:"#a890f0",psychic:"#f85888",bug:"#a8b820",rock:"#b8a038",ghost:"#705898",dragon:"#7b3fe4",dark:"#705848",steel:"#b8b8d0",fairy:"#ee99ac"};
const MULT={se:1.3,nve:.8,imm:.7,stab:1.05};
function typeMult(atkType,defTypes){
  let m=1; const c=TYPE_CHART[atkType];
  for(const d of defTypes){ if(c[0].includes(d))m*=MULT.se; else if(c[1].includes(d))m*=MULT.nve; else if(c[2].includes(d))m*=MULT.imm }
  return m;
}
// Stats au niveau 50, IV 31, EV 0, nature neutre (formule officielle). PV réduits pour garder des combats courts.
const LV=50, IV=31, HP_SCALE=1.3, DMG_EXP=.5;
const calcStat=(b,hp)=>Math.floor((2*b+IV)*LV/100)+(hp?LV+10:5);
const statsOf=b=>({hp:calcStat(b.hp,true),atk:calcStat(b.atk),def:calcStat(b.def),spa:calcStat(b.spa),spd:calcStat(b.spd),spe:calcStat(b.spe)});
// Catalogue de sorts : type, catégorie (phys = Atq/Déf, spec = Atq.Spé/Déf.Spé), puissance, coût en PP, recharge.
const SPL={
  claw:{name:"Draco-Griffe",type:"dragon",cat:"phys",power:20,cost:10,cd:1,ground:false,melee:true},
  mud:{name:"Tir de Boue",type:"ground",cat:"spec",power:16,cost:20,cd:3,ground:true},
  tun:{name:"Tunnel",type:"ground",cat:"phys",power:23,cost:25,cd:4,ground:true},
  rush:{name:"Draco-Charge",type:"dragon",cat:"phys",power:35,cost:50,cd:14,ground:true},
  conf:{name:"Choc Mental",type:"psychic",cat:"spec",power:18,cost:10,cd:1,ground:false,melee:true},
  moon:{name:"Pouvoir Lunaire",type:"fairy",cat:"spec",power:20,cost:20,cd:3,ground:true},
  psy:{name:"Psyko",type:"psychic",cat:"spec",power:30,cost:25,cd:4,ground:true},
  gleam:{name:"Éclat Magique",type:"fairy",cat:"spec",power:34,cost:50,cd:12,ground:true},
  grav:{name:"Gravité",type:"psychic",cat:"status",power:0,cost:30,cd:9,ground:true},
  calm:{name:"Plénitude",type:"psychic",cat:"status",power:0,cost:25,cd:12,self:true,buff:"calm"},
  ihead:{name:"Tête de Fer",type:"steel",cat:"phys",power:28,cost:20,cd:2,ground:false,melee:true},
  rslide:{name:"Éboulement",type:"rock",cat:"phys",power:36,cost:25,cd:4,ground:true},
  quake:{name:"Séisme",type:"ground",cat:"phys",power:44,cost:40,cd:9,ground:true},
  mburst:{name:"Métal Burst",type:"steel",cat:"phys",power:0,cost:30,cd:10,self:true},
  sdance:{name:"Danse-Lames",type:"normal",cat:"status",power:0,cost:30,cd:14,self:true,buff:"sdance"},
  idef:{name:"Mur de Fer",type:"steel",cat:"status",power:0,cost:25,cd:12,self:true,buff:"idef"},
  tele:{name:"Téléport",type:"psychic",cat:"status",power:0,cost:25,cd:8,ground:true},
  fsight:{name:"Prescience",type:"psychic",cat:"spec",power:46,cost:40,cd:10,ground:true},
  trap:{name:"Piège de Roc",type:"rock",cat:"phys",power:26,cost:25,cd:14,ground:true,trap:true},
  fcannon:{name:"Luminocanon",type:"steel",cat:"spec",power:34,cost:30,cd:5,ground:true},
  sedge:{name:"Lame de Roc",type:"rock",cat:"phys",power:40,cost:35,cd:8,ground:true},
  scl:{name:"Griffe Ombre",type:"ghost",cat:"phys",power:20,cost:10,cd:1,ground:false,melee:true},
  shball:{name:"Ball'Ombre",type:"ghost",cat:"spec",power:22,cost:22,cd:3.5,ground:true},
  sbomb:{name:"Bomb Beurk",type:"poison",cat:"spec",power:24,cost:30,cd:7,ground:true},
  ssneak:{name:"Ombre Portée",type:"ghost",cat:"phys",power:20,cost:20,cd:5,ground:true},
  hypno:{name:"Hypnose",type:"psychic",cat:"status",power:0,cost:35,cd:14,ground:true},
  hex:{name:"Hex",type:"ghost",cat:"spec",power:24,cost:25,cd:5,ground:true},
  nplot:{name:"Machination",type:"dark",cat:"status",power:0,cost:30,cd:14,self:true,buff:"nplot"},
  tbolt:{name:"Tonnerre",type:"electric",cat:"spec",power:30,cost:30,cd:5,ground:true},
  tackle:{name:"Charge",type:"normal",cat:"phys",power:14,cost:0,cd:0}
};
// Bonus temporaires : l'exposant des stats compresse l'effet (x1.5 sur une stat donne environ +22 % de dégâts).
const BUFF={
  calm:{dur:8,spa:1.5,spd:1.5,col:"#e0a0ff",pal:["#b060ff","#e0a0ff","#ffffff","#7030c0","#f85888"],label:"Atq. Spé et Déf. Spé +"},
  sdance:{dur:8,atk:1.7,col:"#ff7a5a",pal:["#ff7a5a","#ffb090","#ffffff","#c04030","#ffd060"],label:"Attaque +"},
  nplot:{dur:8,spa:1.7,col:"#c060ff",pal:["#2a1840","#a070d8","#ffffff","#705898","#e0c8ff"],label:"Atq. Spé ++"},
  idef:{dur:8,def:1.7,col:"#d8d8f0",pal:["#a8a8c8","#d8d8f0","#ffffff","#606080","#8090d0"],label:"Défense +"}
};
const bfOf=(e,k,s)=>e.bf&&e.bf[k]&&BUFF[k][s]?BUFF[k][s]:1;
function calcDamage(att,def,spell){
  const sp=spell.cat!=="phys", A=(sp?att.sp.stats.spa*bfOf(att,"calm","spa")*bfOf(att,"nplot","spa"):att.sp.stats.atk*bfOf(att,"sdance","atk")*bfOf(att,"ddance","atk")), D=(sp?def.sp.stats.spd*bfOf(def,"calm","spd")*bfOf(def,"iwall","spd"):def.sp.stats.def*bfOf(def,"idef","def")*bfOf(def,"iwall","def"));
  const stab=att.sp.types.includes(spell.type)?MULT.stab:1;
  return Math.max(1,Math.round(spell.power*Math.pow(A/D,DMG_EXP)*stab*typeMult(spell.type,def.sp.types)*rand(.94,1.06)));
}
const SPECIES={
  garchomp:{name:"Carchacrok",num:445,types:["dragon","ground"],base:{hp:108,atk:120,def:95,spa:80,spd:85,spe:102},sheets:G_SHEETS,anch:G_ANCH,shadow:[11,4],body:16,bar:40,hitFrame:2,atkRate:1.8,kit:["claw","mud","tun","rush"],style:"melee",pool:["claw","mud","tun","rush","quake","rslide","ihead","sdance"],playable:true},
  gardevoir:{name:"Gardevoir",num:282,types:["psychic","fairy"],base:{hp:85,atk:65,def:80,spa:125,spd:115,spe:80},sheets:V_SHEETS,anch:V_ANCH,shadow:[8,3],body:13,bar:30,hitFrame:3,atkRate:.9,kit:["moon","psy","grav","calm"],style:"range",pool:["moon","psy","grav","calm","gleam","conf","tele","fsight"],playable:true},
  aggron:{name:"Galeking",num:306,types:["steel","rock"],base:{hp:85,atk:110,def:180,spa:60,spd:60,spe:60},sheets:A_SHEETS,anch:A_ANCH,shadow:[12,4],body:22,bar:46,hitFrame:3,atkRate:1,kit:["ihead","rslide","quake","mburst"],style:"melee",pool:["ihead","rslide","quake","mburst","idef","trap","fcannon","sedge"],playable:true},
  gengar:{name:"Ectoplasma",num:94,types:["ghost","poison"],base:{hp:66,atk:65,def:60,spa:130,spd:75,spe:110},sheets:E_SHEETS,anch:E_ANCH,shadow:[8,3],body:14,bar:32,hitFrame:4,atkRate:1.25,kit:["shball","sbomb","ssneak","nplot"],style:"range",pool:["scl","shball","sbomb","ssneak","hypno","hex","nplot","tbolt","fwave"],playable:true},
  turtwig:{name:"Tortipousse",num:387,types:["grass"],base:{hp:55,atk:68,def:64,spa:45,spd:55,spe:31},sheets:T_SHEETS,anch:T_ANCH,shadow:[7,3],body:12,bar:32,kit:[]}
};
/*ACES_A*/
// Plus de PP : le cout des gros sorts est converti en recharge supplementaire
Object.values(SPL).forEach(s=>{if(s.cost>20)s.cd=Math.round((s.cd+(s.cost-20)*.15)*10)/10;s.pp0=s.cost;s.cost=0});
Object.values(SPECIES).forEach(sp=>{sp.stats=statsOf(sp.base);sp.maxHp=Math.round(sp.stats.hp/HP_SCALE);sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1)});
