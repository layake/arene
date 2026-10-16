// ===== Corvaillus (Vol/Acier, tank), Lugulabre (Spectre/Feu, lanceur), Nymphalie (Fée, soutien offensif), Pikachu (Électrik, vif) =====
// Écarts volontaires : Pikachu porte l'Orbe Lumière (Attaque et Attaque Spé. doublées, comme dans les jeux), sinon il serait injouable.
// Mégaphone est de type Fée (talent Peau Féérique de Nymphalie). Rapace et Électacle blessent le lanceur à chaque coup réussi (1/8 et 1/7 de ses PV max).
var ANIM_IDS=typeof ANIM_IDS!=="undefined"?ANIM_IDS:new Set();
Object.assign(SPL,{
  bravebird:{name:"Rapace",type:"flying",cat:"phys",power:38,cost:0,cd:7,ground:true},
  willowisp:{name:"Feu Follet",type:"fire",cat:"spec",power:4,cost:0,cd:9,ground:false},
  hypervoice:{name:"Mégaphone",type:"fairy",cat:"spec",power:22,cost:0,cd:4.5,ground:false},
  drainkiss:{name:"Vampibaiser",type:"fairy",cat:"spec",power:18,cost:0,cd:6,ground:false},
  volttackle:{name:"Électacle",type:"electric",cat:"phys",power:40,cost:0,cd:8,ground:true},
  electroball:{name:"Boule Élek",type:"electric",cat:"spec",power:20,cost:0,cd:3,ground:false}
});
Object.values(SPL).forEach(s=>{if(s.pp0===undefined)s.pp0=0});
Object.assign(DESC,{
  bravebird:"Fonce en piqué à travers l'adversaire. Très puissant, mais te blesse aussi.",
  willowisp:"Flamme spectrale lente qui suit la cible. Presque pas de dégâts, mais brûle à coup sûr.",
  volttackle:"Charge électrique à pleine vitesse. Très puissant, étourdit, mais te blesse aussi.",
  electroball:"Boule électrique rapide en ligne droite."
});
Object.assign(I18N_EXTRA,{
  "Rapace":"Brave Bird","Feu Follet":"Will-O-Wisp","Mégaphone":"Hyper Voice","Vampibaiser":"Draining Kiss","Électacle":"Volt Tackle","Boule Élek":"Electro Ball",
  "Fonce en piqué à travers l'adversaire. Très puissant, mais te blesse aussi.":"Dives through the opponent. Very strong, but hurts you too.",
  "Flamme spectrale lente qui suit la cible. Presque pas de dégâts, mais brûle à coup sûr.":"Slow ghostly flame that follows the target. Almost no damage, but always burns.",
  "Charge électrique à pleine vitesse. Très puissant, étourdit, mais te blesse aussi.":"Full-speed electric charge. Very strong, stuns, but hurts you too.",
  "Boule électrique rapide en ligne droite.":"Fast electric ball in a straight line.",
  "Corvaillus":"Corviknight","Lugulabre":"Chandelure","Nymphalie":"Sylveon","Pikachu":"Pikachu"
});
Object.assign(SFX_MAP,{bravebird:{cast:788,hit:877},willowisp:{cast:891,hit:849},hypervoice:{cast:772,hit:850},drainkiss:{cast:614,hit:699},volttackle:{cast:774,hit:685},electroball:{cast:774,hit:685},bodypress:{cast:344,hit:818},irontail:{cast:726,hit:819}});
// ---- charges avec recul ----
RUSHES.bravebird={id:"bravebird",chan:0,min:50,dist:150,speed:600,hit:16,push:60,stun:0,rec:.35,cdHit:0,pal:"flying",recoilHit:.125};
RUSHES.volttackle={id:"volttackle",chan:0,min:50,dist:160,speed:650,hit:15,push:70,stun:.35,rec:.4,cdHit:0,pal:"electric",recoilHit:.14};
PREV.bravebird={k:"shot",len:v=>rushLen(v,RUSHES.bravebird),hw:RUSHES.bravebird.hit,from:0};
PREV.volttackle={k:"shot",len:v=>rushLen(v,RUSHES.volttackle),hw:RUSHES.volttackle.hit,from:0};
// ---- projectiles : Feu Follet (lent, à tête chercheuse, brûle) et Boule Élek (rapide) ----
PROJ.willowisp={speed:150,range:230,hit:12,home:2.4};
PROJ.electroball={speed:340,range:215,hit:11};
["willowisp","electroball"].forEach(id=>{ACE2[id]={hit(e,id){fireBolt(e,id)}}; ANIM_IDS.add(id); PREV[id]={k:"shot",len:()=>PROJ[id].range,hw:PROJ[id].hit,from:14}});
ORBHIT.willowisp=(o,t)=>{applyBurn(t,o.o); if(t.burn)t.burn=Math.max(t.burn,BURN.dur*1.5)};
ORB2.willowisp=o=>{ // flamme bleue-violette qui ondule
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-16+Math.round(Math.sin(o.t*6)*2), P=["#3a1870","#6a3ac8","#9a7aff","#d8c8ff","#ffffff"];
  ctx.fillStyle="rgba(0,0,0,.25)"; ctx.fillRect(x-3,gy,7,1);
  for(let k=4;k>=0;k--){const w=Math.max(1,5-k), tx=Math.round(x-o.vx*k*3+Math.sin(o.t*12+k)*1.5), ty=Math.round(y-o.vy*k*3+k*1.5); ctx.fillStyle=P[Math.min(4,k)]; ctx.fillRect(tx-w,ty-w,w*2,w*2)}
  ctx.fillStyle=P[1]; ctx.fillRect(x-4,y-3,8,7); ctx.fillStyle=P[2]; ctx.fillRect(x-3,y-5,6,7); ctx.fillStyle=P[3]; ctx.fillRect(x-2,y-6,4,6); ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-3,2,3);
};
ORB2.electroball=o=>{ // boule jaune crépitante
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14, P=TYPE_PAL.electric;
  ctx.fillStyle="rgba(0,0,0,.25)"; ctx.fillRect(x-3,gy,7,1);
  for(let k=3;k>=1;k--){ctx.fillStyle=P[k===3?3:0]; const w=4-k; ctx.fillRect(Math.round(x-o.vx*k*5)-w,Math.round(y-o.vy*k*5)-w,w*2+1,w*2+1)}
  ctx.fillStyle=P[0]; ctx.fillRect(x-4,y-4,9,9); ctx.fillStyle=P[1]; ctx.fillRect(x-3,y-3,7,7); ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-1,3,3);
  ctx.fillStyle="#ffffff"; for(let i=0;i<3;i++){const a=o.t*25+i*2.1; ctx.fillRect(Math.round(x+Math.cos(a)*7),Math.round(y+Math.sin(a)*6),1,2)}
};
// ---- mêlée : Big Splash (Corvaillus), Queue de Fer (Pikachu) ----
defMelee({id:"bodypress",name:"Big Splash",type:"fighting",power:24,cd:1.6,fx:"slam",pal:["#606080","#a8a8c8","#d8d8f0","#ffffff"],
  desc:"Se jette de tout son poids devant soi et repousse fort.",en:{name:"Body Press",desc:"Throws its whole weight forward and knocks back hard."},sfx:{cast:344,hit:818},
  sparks:(x,y)=>{shake=Math.max(shake,.12);for(let i=0;i<6;i++)spark(x,y+6,rand(-70,70),-rand(20,70),rand(.3,.6),i%2?"#d8d8f0":"#ffffff",200,2)}});
defMelee({id:"irontail",name:"Queue de Fer",type:"steel",power:28,cd:2.2,fx:"slash",pal:STEELC,
  desc:"Coup de queue d'acier devant soi.",en:{name:"Iron Tail",desc:"Steel tail strike in front of you."},sfx:{cast:726,hit:819},
  sparks:(x,y,f)=>{for(let i=0;i<5;i++)spark(x,y-4,f[0]*rand(60,120),f[1]*rand(30,70)-rand(10,50),rand(.25,.5),i%2?"#ffffff":STEELC[1],0,2)}});
// ---- Mégaphone : onde sonore en éventail ; Vampibaiser : baiser qui draine et soigne ----
defWave({id:"hypervoice",style:"fire",pal:PINK,reach:105,r0:12,cone:Math.PI*.75,dur:.45,push:42,noise:[.5,.45,1800,900,1.4],
  desc:"Onde sonore en éventail devant soi. Repousse.",en:"Fan-shaped sound wave in front of you. Knocks back."});
defTether({id:"drainkiss",pal:["#c05aa8","#f060a8","#ffc2e0","#ffffff"],dur:1.2,tick:.2,tickPower:3,reach:72,leash:100,cone:1.3,heal:.75,
  desc:"Un baiser draine la cible proche pendant 1,2 s et te soigne beaucoup.",en:"A kiss drains a nearby target for 1.2 s and heals you a lot."});
ANIM_IDS.add("hypervoice"); ANIM_IDS.add("drainkiss");
// ---- IA ----
function botAce6(e,t,d,threat,go,ok,rnd){
  if(ok("bravebird")&&d>45&&d<RUSHES.bravebird.dist-12&&e.hp>e.maxHp*.25&&rnd(.4)){go("bravebird",false,.1);return true}
  if(ok("volttackle")&&d>45&&d<RUSHES.volttackle.dist-12&&e.hp>e.maxHp*.25&&rnd(.4)){go("volttackle",false,.1);return true}
  if(ok("drainkiss")&&d<66&&(e.hp<e.maxHp*.8||rnd(.4))){go("drainkiss",true);return true}
  if(ok("hypervoice")&&d<98&&rnd(.55)){go("hypervoice",true);return true}
  if(ok("willowisp")&&d<210&&!(t.burn>0)&&rnd(.5)){go("willowisp",false,.3);return true}
  if(ok("electroball")&&d>40&&d<205&&rnd(.55)){go("electroball",true,.25);return true}
  return false;
}
Object.assign(SPECIES,{
  corviknight:{name:"Corvaillus",num:823,types:["flying","steel"],base:{hp:98,atk:87,def:105,spa:53,spd:85,spe:67},sheets:CV_SHEETS,anch:CV_ANCH,shadow:[11,4],body:22,bar:46,hitFrame:6,atkRate:1.4,kit:["bravebird","bodypress","wsteel","idef"],style:"melee",pool:["bravebird","bodypress","wsteel","idef","ihead","wingatk","fly","recover"],playable:true},
  chandelure:{name:"Lugulabre",num:609,types:["ghost","fire"],base:{hp:60,atk:55,def:90,spa:145,spd:90,spe:80},sheets:CD_SHEETS,anch:CD_ANCH,shadow:[9,3],body:22,bar:46,hitFrame:2,atkRate:1.2,kit:["shball","flame","hex","willowisp"],style:"range",pool:["shball","flame","hex","willowisp","heat","embers","curse","calm"],playable:true},
  sylveon:{name:"Nymphalie",num:700,types:["fairy"],base:{hp:95,atk:65,def:65,spa:110,spd:130,spe:60},sheets:SY_SHEETS,anch:SY_ANCH,shadow:[9,3],body:16,bar:38,hitFrame:2,atkRate:1.2,kit:["hypervoice","moon","drainkiss","calm"],style:"range",pool:["hypervoice","moon","drainkiss","calm","fwave","gleam","lscreen","shball"],playable:true},
  pikachu:{name:"Pikachu",num:25,types:["electric"],base:{hp:35,atk:110,def:40,spa:100,spd:50,spe:90},sheets:PK_SHEETS,anch:PK_ANCH,shadow:[7,3],body:12,bar:32,hitFrame:3,atkRate:1.0,kit:["volttackle","tbolt","qatk","electroball"],style:"melee",pool:["volttackle","tbolt","qatk","electroball","irontail","nplot","decoy"],playable:true}
});
["corviknight","chandelure","sylveon","pikachu"].forEach(k=>{const sp=SPECIES[k]; sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1); Object.values(sp.sheets).forEach(s=>{s.img=new Image();s.img.src=s.src})});
buildMenu();
