// ===== Luxray (Électrik, assassin), Cizayox (Insecte/Acier, duelliste), Lokhlass (Eau/Glace, artilleur), Nidoking (Poison/Sol, bruiser), Leuphorie (Normal, soutien) =====
// 20 nouvelles capacités. Écarts volontaires par rapport au vrai jeu :
//  - Équilibrage (simulations bot contre bot) : Luxray Atq 100 (120), Cizayox Atq 95 (130), Lokhlass Atq. Spé 78 (85), Nidoking PV 75 / Atq 84 (81 / 102), Leuphorie Atq 70 / Déf 30 (10 / 10, injouable sinon) : jauge jaune dans la fiche.
//  - Taillade, Écho : les paliers sont limités à 4 et se remettent à zéro après 2,5 s (3 s pour Écho) sans toucher.
//  - Pisto-Poing, Torgnoles : une seule capacité qui frappe 3 fois de suite (90 ms d'écart), 2e et 3e coups si la cible est encore à portée.
//  - Vœu : soigne 40 % des PV max au bout de 3 s (le vrai jeu soigne 50 % du lanceur au tour suivant), annulé si le lanceur est KO.
//  - Danse Pluie : champ de pluie qui ralentit les ennemis et soigne légèrement le lanceur (pas de météo globale en arène).
var ANIM_IDS=typeof ANIM_IDS!=="undefined"?ANIM_IDS:new Set();
TYPE_PAL.bug=["#4a5a10","#a8b820","#d8e870","#f0ffb0","#7a9a18"];
Object.assign(SPL,{
  thfang:{name:"Crocs Éclair",type:"electric",cat:"phys",power:21,cost:0,cd:1.3,ground:false,melee:true},
  wildchg:{name:"Éclair Fou",type:"electric",cat:"phys",power:34,cost:0,cd:7.5,ground:true},
  chgbeam:{name:"Rayon Chargé",type:"electric",cat:"spec",power:17,cost:0,cd:4.6,ground:false},
  growl:{name:"Rugissement",type:"normal",cat:"spec",power:5,cost:0,cd:9,ground:false},
  xscis:{name:"Plaie-Croix",type:"bug",cat:"phys",power:24,cost:0,cd:1.8,ground:false,melee:true},
  bpunch:{name:"Pisto-Poing",type:"steel",cat:"phys",power:10,cost:0,cd:1.3,ground:false,melee:true},
  furycut:{name:"Taillade",type:"bug",cat:"phys",power:13,cost:0,cd:.9,ground:false,melee:true},
  agility:{name:"Hâte",type:"psychic",cat:"status",power:0,cost:0,cd:13,ground:true,buff:"bboost"},
  aurbeam:{name:"Onde Boréale",type:"ice",cat:"spec",power:19,cost:0,cd:4.8,ground:false},
  echo:{name:"Écho",type:"normal",cat:"spec",power:9,cost:0,cd:1.5,ground:false},
  waterfall:{name:"Cascade",type:"water",cat:"phys",power:26,cost:0,cd:6,ground:true},
  raindance:{name:"Danse Pluie",type:"water",cat:"status",power:2,cost:0,cd:14,ground:true},
  megahorn:{name:"Mégacorne",type:"bug",cat:"phys",power:30,cost:0,cd:2.4,ground:false,melee:true},
  thpunch:{name:"Poing-Tonnerre",type:"electric",cat:"phys",power:22,cost:0,cd:1.4,ground:false,melee:true},
  psting:{name:"Dard-Venin",type:"poison",cat:"phys",power:9,cost:0,cd:1.8,ground:false},
  acid:{name:"Acide",type:"poison",cat:"spec",power:13,cost:0,cd:4.2,ground:false},
  eggbomb:{name:"Bomb'Œuf",type:"normal",cat:"phys",power:34,cost:0,cd:6.5,ground:false},
  dslap:{name:"Torgnoles",type:"normal",cat:"phys",power:9,cost:0,cd:1.3,ground:false,melee:true},
  wish:{name:"Vœu",type:"normal",cat:"status",power:0,cost:0,cd:15,ground:true},
  charm:{name:"Charme",type:"fairy",cat:"spec",power:3,cost:0,cd:7,ground:false}
});
Object.values(SPL).forEach(s=>{if(s.pp0===undefined)s.pp0=0});
Object.assign(SFX_MAP,{thfang:{cast:684,hit:685},wildchg:{cast:774,hit:685},chgbeam:{cast:774,hit:828},growl:{cast:772,hit:850},xscis:{cast:726,hit:879},bpunch:{cast:726,hit:344},furycut:{cast:726,hit:879},agility:{cast:884},
  aurbeam:{cast:829,hit:828},echo:{cast:772,hit:850},waterfall:{cast:859,hit:344},raindance:{cast:798},megahorn:{cast:402,hit:336},thpunch:{cast:623,hit:685},psting:{cast:794,hit:856},acid:{cast:876,hit:856},
  eggbomb:{cast:860,hit:863},dslap:{cast:344,hit:337},wish:{cast:768},charm:{cast:614,hit:811}});
// ---- buffs et débuffs génériques (champs atk / spa / def / spd / spe lus par bfN dans calcDamage et le déplacement) ----
Object.assign(BUFF,{
  chgbeam:{dur:7,spa:1.25,col:"#f8d030",pal:TYPE_PAL.electric,label:"Atq. Spé +"},
  growl:{dur:5,atk:.75,col:"#a8a8c8",pal:["#606080","#a8a8c8","#d8d8f0","#ffffff","#8090d0"],label:"Attaque -"},
  acid:{dur:5,spd:.75,col:"#a040a0",pal:TYPE_PAL.poison,label:"Déf. Spé -"},
  charm:{dur:5,atk:.65,col:"#ee99ac",pal:TYPE_PAL.fairy,label:"Attaque --"}
});
["chgbeam","growl","acid","charm"].forEach(k=>NEWBF.add(k));
const bfGive=(t,k)=>{if(!t||!BUFF[k])return; t.bf=t.bf||{}; t.bf[k]=BUFF[k].dur; pops.push({x:t.x,y:t.y-t.sp.body-26,t:0,txt:BUFF[k].label,col:BUFF[k].col}); rings.push({x:t.x,y:t.y,t:0,dur:.4,max:20,c:BUFF[k].col})};
// ---- coups supplémentaires (Pisto-Poing, Torgnoles) : 3 frappes à 90 ms d'écart ----
function extraHits(e,t,id,n,gapMs){
  for(let i=1;i<n;i++)setTimeout(()=>{
    if(!alive(e)||!alive(t)||e.ko>0||e.stun>0||t.tunnel||Math.hypot(t.x-e.x,(t.y-e.y)*1.3)>CONF.reach+t.sp.body*.6)return;
    if(strike(e,t,SPL[id],{from:e,push:0,contact:true})){const P=TYPE_PAL[SPL[id].type]||TYPE_PAL.normal; colorBurst(t.x,t.y-t.sp.body*.6,6,P,30,90)}
  },gapMs*i);
}
// ---- style de mêlée « croix » : deux entailles qui se croisent ----
MELEE_FX.cross=function(k){const{x,y,P,T}=k, up=clamp(T/.1,0,1), L=Math.round(20*up);
  [[1,1],[1,-1]].forEach(([sx,sy])=>{[[P[0],5],[P[1],3],[P[3],1]].forEach(([col,w])=>{ctx.fillStyle=col;for(let s=-L;s<=L;s++)ctx.fillRect(Math.round(x+s*sx*.85-w/2),Math.round(y+s*sy*.6-w/2),w,w)})});
  if(T>.08&&T<.22){ctx.fillStyle="#ffffff";for(let i=0;i<5;i++)ctx.fillRect(Math.round(x+Math.cos(i*1.3+T*30)*(4+T*40)),Math.round(y+Math.sin(i*1.3+T*30)*(3+T*28)),2,2)}};
const BUGP=TYPE_PAL.bug;
// ================= LUXRAY =================
defMelee({id:"thfang",name:"Crocs Éclair",type:"electric",power:21,cd:1.3,fx:"bite",pal:["#c09010","#f8d030","#fff080","#ffffff"],
  desc:"Morsure électrique devant soi. Peut paralyser brièvement.",en:{name:"Thunder Fang",desc:"Electric bite in front of you. May briefly paralyze."},sfx:{cast:684,hit:685},
  sparks:(x,y)=>{for(let i=0;i<6;i++)spark(x,y,rand(-70,70),-rand(10,70),rand(.25,.5),i%2?"#fff080":"#ffffff",120,2)},after:(e,t)=>{if(Math.random()<.3){t.stun=Math.max(t.stun||0,.35);t.slow=Math.max(t.slow||0,.8)}}});
RUSHES.wildchg={id:"wildchg",chan:0,min:50,dist:155,speed:620,hit:15,push:55,stun:.25,rec:.35,cdHit:0,pal:"electric",recoilHit:.1};
PREV.wildchg={k:"shot",len:v=>rushLen(v,RUSHES.wildchg),hw:RUSHES.wildchg.hit,from:0};
DESC.wildchg="Fonce à pleine vitesse en se chargeant d'électricité. Puissant, étourdit un instant, mais te blesse un peu.";
I18N_EXTRA["Éclair Fou"]="Wild Charge"; I18N_EXTRA[DESC.wildchg]="Charges at full speed, crackling with electricity. Strong, briefly stuns, but hurts you a little.";
defRay({id:"chgbeam",style:"flash",pal:["#c09010","#f8d030","#fff080","#ffffff","#fffbe0"],reach:190,half:8,push:12,noise:[.4,.4,3000,1200,1.5],
  onHit:(e,t)=>{bfGive(e,"chgbeam")},
  desc:"Rayon électrique instantané en ligne droite. Chaque touche augmente ton Attaque Spéciale.",en:"Instant electric beam in a straight line. Each hit raises your Special Attack."});
ANIM_IDS.add("chgbeam");
defWave({id:"growl",style:"fire",pal:["#606080","#a8a8c8","#d8d8f0","#ffffff","#8090d0"],reach:105,r0:12,cone:Math.PI*.7,dur:.5,push:20,noise:[.45,.5,900,500,1.3],
  onHit:(e,t)=>{bfGive(t,"growl"); t.slow=Math.max(t.slow||0,1.2)},
  desc:"Rugissement en éventail devant soi. Baisse l'Attaque des ennemis touchés et les ralentit.",en:"Fan-shaped roar in front of you. Lowers the Attack of enemies hit and slows them."});
ANIM_IDS.add("growl");
// ================= CIZAYOX =================
defMelee({id:"xscis",name:"Plaie-Croix",type:"bug",power:24,cd:1.8,fx:"cross",pal:BUGP,
  desc:"Deux coups de pinces en croix devant soi.",en:{name:"X-Scissor",desc:"Two crossing claw strikes in front of you."},sfx:{cast:726,hit:879},
  sparks:(x,y,f)=>{for(let i=0;i<6;i++)spark(x,y,f[0]*rand(40,110),f[1]*rand(20,60)-rand(10,40),rand(.25,.5),i%2?"#d8e870":"#ffffff",0,2)}});
defMelee({id:"bpunch",name:"Pisto-Poing",type:"steel",power:10,cd:1.3,fx:"slam",pal:STEELC,
  desc:"Rafale de 3 coups de pince d'acier, très rapides.",en:{name:"Bullet Punch",desc:"Burst of 3 very fast steel claw punches."},sfx:{cast:726,hit:344},
  sparks:(x,y)=>{for(let i=0;i<4;i++)spark(x,y,rand(-60,60),-rand(10,50),rand(.2,.4),i%2?"#ffffff":STEELC[1],120,2)},after:(e,t)=>extraHits(e,t,"bpunch",3,90)});
defMelee({id:"furycut",name:"Taillade",type:"bug",power:13,cd:.9,fx:"slash",pal:BUGP,
  desc:"Entaille rapide. Enchaînée sans la rater, chaque coup frappe plus fort (jusqu'à 4 fois).",en:{name:"Fury Cutter",desc:"Quick slash. Chained without missing, each hit hits harder (up to 4 times)."},sfx:{cast:726,hit:879},
  sparks:(x,y,f)=>{for(let i=0;i<5;i++)spark(x,y,f[0]*rand(40,110),f[1]*rand(20,60)-rand(10,40),rand(.25,.45),i%2?"#d8e870":"#ffffff",0,2)},
  after:(e,t)=>{const n=Math.min(4,(e.furyN||0)+1); e.furyN=n; e.furyT=2.5; if(n>1&&alive(t)){strike(e,t,Object.assign({},SPL.furycut,{power:3*(n-1)}),{from:e,push:0,contact:true}); pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"x"+n,col:"#d8e870"})}}});
FX_UPDATERS.push(dt=>{fighters.forEach(e=>{if(e.furyT>0){e.furyT-=dt; if(e.furyT<=0)e.furyN=0}})});
DESC.agility="Accélère nettement ta vitesse pendant quelques secondes.";
I18N_EXTRA["Hâte"]="Agility"; I18N_EXTRA[DESC.agility]="Greatly raises your speed for a few seconds.";
// ================= LOKHLASS =================
defRay({id:"aurbeam",style:"ice",pal:["#3a78c8","#78b8e8","#c8f0ff","#ffffff","#98f0d8"],reach:200,half:9,push:16,noise:[.4,.4,3600,1300,1.6],
  onHit:(e,t)=>{if(Math.random()<.5)bfGive(t,"growl"); else t.slow=Math.max(t.slow||0,1.4)},
  desc:"Rayon arc-en-ciel glacé instantané. Peut baisser l'Attaque de la cible ou la ralentir.",en:"Instant icy rainbow beam. May lower the target's Attack or slow it."});
ANIM_IDS.add("aurbeam");
PROJ.echo={speed:300,range:205,hit:11};
ORB2.echo=o=>{const x=Math.round(o.x),y=Math.round(o.y)-14,P=TYPE_PAL.normal,r=4+Math.round(Math.sin(o.t*30)*1.5);
  for(let k=0;k<3;k++){const rr=r+k*3, a=.9-k*.28; ctx.globalAlpha=a; ctx.fillStyle=k?P[2]:"#ffffff";
    for(let i=0;i<16;i++){const g=i/16*Math.PI*2; ctx.fillRect(Math.round(x-o.vx*k*3+Math.cos(g)*rr),Math.round(y-o.vy*k*3+Math.sin(g)*rr*.85),2,2)}}
  ctx.globalAlpha=1; ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-1,3,3)};
ACE2.echo={hit(e){fireBolt(e,"echo")}}; ANIM_IDS.add("echo"); PREV.echo={k:"shot",len:()=>PROJ.echo.range,hw:PROJ.echo.hit,from:14};
ORBHIT.echo=(o,t)=>{const e=o.o; const n=Math.min(4,(e.echoN||0)+1); e.echoN=n; e.echoT=3; if(n>1&&alive(t)){strike(e,t,Object.assign({},SPL.echo,{power:5*(n-1)}),{from:e,push:0}); pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"Écho x"+n,col:"#e8e0c8"})}};
FX_UPDATERS.push(dt=>{fighters.forEach(e=>{if(e.echoT>0){e.echoT-=dt; if(e.echoT<=0)e.echoN=0}})});
DESC.echo="Onde sonore rapide en ligne droite. Répétée sans la rater, chaque tir frappe plus fort (jusqu'à 4 fois).";
I18N_EXTRA["Écho"]="Echoed Voice"; I18N_EXTRA[DESC.echo]="Fast sound wave in a straight line. Repeated without missing, each shot hits harder (up to 4 times).";
RUSHES.waterfall={id:"waterfall",chan:0,min:50,dist:145,speed:540,hit:16,push:50,stun:.3,rec:.3,cdHit:0,pal:"aqj"};
PREV.waterfall={k:"shot",len:v=>rushLen(v,RUSHES.waterfall),hw:RUSHES.waterfall.hit,from:0};
DESC.waterfall="Remonte en cascade à travers l'adversaire. Peut l'étourdir un instant.";
I18N_EXTRA["Cascade"]="Waterfall"; I18N_EXTRA[DESC.waterfall]="Surges forward like a waterfall through the opponent. May stun it briefly.";
GZ.raindance={kind:"field",range:0,r:52,delay:.3,life:6,tick:.5,dot:.1,slow:.6,healOwner:.025,style:"rain"};
ACE2.raindance={hit(e,id){spawnGZ(e,id)}}; PREV.raindance={k:"zone",Z:{range:1,r:GZ.raindance.r}}; ANIM_IDS.add("raindance");
DESC.raindance="Fait tomber une pluie autour de toi pendant 6 s : ralentit les ennemis dedans et te soigne légèrement.";
I18N_EXTRA["Danse Pluie"]="Rain Dance"; I18N_EXTRA[DESC.raindance]="Makes rain fall around you for 6 s: slows enemies inside and heals you slightly.";
// ================= NIDOKING =================
defMelee({id:"megahorn",name:"Mégacorne",type:"bug",power:30,cd:2.4,fx:"slam",pal:BUGP,
  desc:"Coup de corne puissant devant soi. Repousse fort.",en:{name:"Megahorn",desc:"Powerful horn thrust in front of you. Knocks back hard."},sfx:{cast:402,hit:336},
  sparks:(x,y)=>{shake=Math.max(shake,.12);for(let i=0;i<6;i++)spark(x,y+6,rand(-70,70),-rand(20,70),rand(.3,.6),i%2?"#d8e870":"#ffffff",200,2)}});
defMelee({id:"thpunch",name:"Poing-Tonnerre",type:"electric",power:22,cd:1.4,fx:"slam",pal:["#c09010","#f8d030","#fff080","#ffffff"],
  desc:"Coup de poing électrique devant soi. Peut étourdir brièvement.",en:{name:"Thunder Punch",desc:"Electric punch in front of you. May briefly stun."},sfx:{cast:623,hit:685},
  sparks:(x,y)=>{for(let i=0;i<6;i++)spark(x,y,rand(-70,70),-rand(10,70),rand(.25,.5),i%2?"#fff080":"#ffffff",120,2)},after:(e,t)=>{if(Math.random()<.25)t.stun=Math.max(t.stun||0,.3)}});
PROJ.psting={speed:400,range:215,hit:8};
ORB2.psting=o=>{const x=o.x,y=o.y-14; for(let k=0;k<7;k++){ctx.fillStyle=k<2?"#ffffff":k<5?"#d070d0":"#a040a0"; const w=k<3?2:1; ctx.fillRect(Math.round(x-o.vx*k*2)-(w>>1),Math.round(y-o.vy*k*1.8)-(w>>1),w,w)} ctx.fillStyle="#80e060"; ctx.fillRect(Math.round(x+o.vx*3)-1,Math.round(y+o.vy*3)-1,2,2)};
ACE2.psting={hit(e){fireBolt(e,"psting")}}; ANIM_IDS.add("psting"); PREV.psting={k:"shot",len:()=>PROJ.psting.range,hw:PROJ.psting.hit,from:14};
ORBHIT.psting=(o,t)=>{t.psn=Math.max(t.psn||0,2.5)};
DESC.psting="Dard empoisonné rapide en ligne droite. Empoisonne la cible.";
I18N_EXTRA["Dard-Venin"]="Poison Sting"; I18N_EXTRA[DESC.psting]="Fast poisoned dart in a straight line. Poisons the target.";
defWave({id:"acid",style:"fire",pal:["#2a5a1a","#80e060","#c0f0a0","#ffffff","#a040a0"],reach:105,r0:12,cone:Math.PI*.55,dur:.5,push:14,noise:[.5,.45,1500,700,1.2],
  onHit:(e,t)=>{bfGive(t,"acid"); t.psn=Math.max(t.psn||0,1.2)},
  desc:"Gerbe d'acide devant soi. Baisse la Défense Spéciale des ennemis touchés et les empoisonne un peu.",en:"Spray of acid in front of you. Lowers the Special Defense of enemies hit and poisons them slightly."});
ANIM_IDS.add("acid");
// ================= LEUPHORIE =================
PROJ.eggbomb={speed:210,range:195,hit:14};
ORB2.eggbomb=o=>{const x=Math.round(o.x),gy=Math.round(o.y),y=gy-16-Math.round(Math.abs(Math.sin(o.t*7))*4);
  ctx.fillStyle="rgba(0,0,0,.25)"; ctx.fillRect(x-4,gy,9,1);
  const rows=[[3,4],[2,6],[1,8],[1,8],[1,8],[2,6],[3,4]]; rows.forEach((r,j)=>{ctx.fillStyle=j<3?"#fff4d0":"#f0d8a0"; ctx.fillRect(x-4+r[0],y-4+j,r[1],1)});
  ctx.fillStyle="#ffffff"; ctx.fillRect(x-2,y-3,2,2); ctx.fillStyle="#c0a060"; ctx.fillRect(x-3,y+2,6,1)};
ACE2.eggbomb={hit(e){fireBolt(e,"eggbomb")}}; ANIM_IDS.add("eggbomb"); PREV.eggbomb={k:"shot",len:()=>PROJ.eggbomb.range,hw:PROJ.eggbomb.hit,from:14};
ORBHIT.eggbomb=(o,t)=>{shake=Math.max(shake,.1); for(let i=0;i<6;i++)spark(o.x,o.y-10,rand(-80,80),-rand(30,90),rand(.3,.5),i%2?"#fff4d0":"#f0d8a0",300,2)};
DESC.eggbomb="Lance un gros œuf explosif, lent mais très puissant.";
I18N_EXTRA["Bomb'Œuf"]="Egg Bomb"; I18N_EXTRA[DESC.eggbomb]="Throws a big explosive egg, slow but very strong.";
defMelee({id:"dslap",name:"Torgnoles",type:"normal",power:9,cd:1.3,fx:"slam",pal:["#d890a8","#f0b8c8","#ffe8f0","#ffffff"],
  desc:"Rafale de 3 gifles rapides devant soi.",en:{name:"Double Slap",desc:"Burst of 3 quick slaps in front of you."},sfx:{cast:344,hit:337},
  sparks:(x,y)=>{for(let i=0;i<4;i++)spark(x,y,rand(-60,60),-rand(10,50),rand(.2,.4),i%2?"#ffe8f0":"#ffffff",120,2)},after:(e,t)=>extraHits(e,t,"dslap",3,90)});
BUFF.wish={dur:3,col:"#ffe8a0",pal:["#f0d070","#ffe8a0","#fff4d0","#ffffff","#ffffff"],label:"Vœu en attente"};
ACE2.wish={hit(e){e.wish={t:3}; e.bf=e.bf||{}; e.bf.wish=BUFF.wish.dur; fx.push({k:"up",x:e.x,y:e.y,sy:e.y+.5,h:e.sp.body+8,t:0,life:.9,pal:["#ffe8a0","#fff4d0","#ffffff","#f0d070","#ffffff"]}); pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"Vœu",col:"#ffe8a0"}); rings.push({x:e.x,y:e.y,t:0,dur:.5,max:26,c:"#ffe8a0"}); colorBurst(e.x,e.y-e.sp.body,16,["#ffe8a0","#fff4d0","#ffffff","#f0d070","#ffffff"],30,110); logFor(e,e.sp.name+" fait un Vœu !",1600)}};
ANIM_IDS.add("wish"); PREV.wish={k:"zone",Z:{range:1,r:14}};
FX_UPDATERS.push(dt=>{fighters.forEach(e=>{const W=e.wish; if(!W)return; if(!alive(e)||e.ko>0){e.wish=null;return}
  if(Math.random()<dt*14)spark(e.x+rand(-10,10),e.y-e.sp.body*rand(.2,1.6),rand(-6,6),-rand(20,60),rand(.4,.7),Math.random()<.5?"#ffe8a0":"#ffffff",-10,2);
  W.t-=dt; if(W.t<=0){e.wish=null; const h=Math.round(e.maxHp*.4); e.hp=Math.min(e.maxHp,e.hp+h); pops.push({x:e.x,y:e.y-e.sp.body-22,t:0,txt:"+"+h,col:"#8ae068"}); colorBurst(e.x,e.y-12,18,["#ffe8a0","#fff4d0","#ffffff","#8ae068","#ffffff"],40,120); rings.push({x:e.x,y:e.y,t:0,dur:.5,max:30,c:"#ffe8a0"})}})});
DESC.wish="Fait un Vœu : au bout de 3 s, tu récupères 40 % de tes PV max (annulé si tu es mis KO).";
I18N_EXTRA["Vœu"]="Wish"; I18N_EXTRA[DESC.wish]="Makes a Wish: after 3 s you recover 40% of your max HP (cancelled if you are knocked out).";
PROJ.charm={speed:250,range:205,hit:10};
ORB2.charm=o=>{const x=Math.round(o.x),y=Math.round(o.y)-14+Math.round(Math.sin(o.t*14)*1.5);
  for(let k=3;k>=1;k--){ctx.globalAlpha=.5-k*.1; ctx.fillStyle="#ee99ac"; ctx.fillRect(Math.round(x-o.vx*k*5)-2,Math.round(y-o.vy*k*5)-2,4,4)} ctx.globalAlpha=1;
  const H=[[1,0],[2,0],[4,0],[5,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[1,3],[2,3],[3,3],[4,3],[5,3],[2,4],[3,4],[4,4],[3,5]];
  ctx.fillStyle="#f060a8"; H.forEach(([a,b])=>ctx.fillRect(x-3+a,y-3+b,1,1)); ctx.fillStyle="#ffc2e0"; ctx.fillRect(x-2,y-2,2,1); ctx.fillRect(x-3,y-1,1,1)};
ACE2.charm={hit(e){fireBolt(e,"charm")}}; ANIM_IDS.add("charm"); PREV.charm={k:"shot",len:()=>PROJ.charm.range,hw:PROJ.charm.hit,from:14};
ORBHIT.charm=(o,t)=>{bfGive(t,"charm")};
DESC.charm="Lance un regard enjôleur. Baisse beaucoup l'Attaque de la cible touchée.";
I18N_EXTRA["Charme"]="Charm"; I18N_EXTRA[DESC.charm]="Casts an alluring look. Greatly lowers the Attack of the target hit.";
Object.assign(I18N_EXTRA,{"Luxray":"Luxray","Cizayox":"Scizor","Lokhlass":"Lapras","Nidoking":"Nidoking","Leuphorie":"Blissey"});
// ---- IA ----
function botAce7(e,t,d,threat,go,ok,rnd){
  const k=e.key;
  if(k==="luxray"){
    if(ok("wildchg")&&d>45&&d<RUSHES.wildchg.dist-12&&e.hp>e.maxHp*.3&&rnd(.4)){go("wildchg",false,.1);return true}
    if(ok("chgbeam")&&d>45&&d<185&&rnd(.45)){go("chgbeam",true,.15);return true}
    if(ok("growl")&&d<85&&!(t.bf&&t.bf.growl)&&rnd(.35)){go("growl",true);return true}
    if(ok("thfang")&&d<58&&rnd(.8)){go("thfang",true);return true}
  }
  if(k==="scizor"){
    if(ok("agility")&&d>90&&rnd(.3)){go("agility",false);return true}
    if(ok("xscis")&&d<58&&rnd(.6)){go("xscis",true);return true}
    if(ok("bpunch")&&d<56&&rnd(.6)){go("bpunch",true);return true}
    if(ok("furycut")&&d<56&&rnd(.9)){go("furycut",true);return true}
  }
  if(k==="lapras"){
    if(ok("raindance")&&d<110&&rnd(.3)){go("raindance",false);return true}
    if(ok("waterfall")&&d>45&&d<RUSHES.waterfall.dist-10&&rnd(.35)){go("waterfall",false,.1);return true}
    if(ok("aurbeam")&&d>40&&d<195&&rnd(.5)){go("aurbeam",true,.15);return true}
    if(ok("echo")&&d>30&&d<200&&rnd(.8)){go("echo",true,.25);return true}
  }
  if(k==="nidoking"){
    if(ok("megahorn")&&d<56&&rnd(.55)){go("megahorn",true);return true}
    if(ok("acid")&&d<100&&!(t.bf&&t.bf.acid)&&rnd(.4)){go("acid",true);return true}
    if(ok("thpunch")&&d<56&&rnd(.8)){go("thpunch",true);return true}
    if(ok("psting")&&d>40&&d<210&&!(t.psn>0)&&rnd(.6)){go("psting",true,.2);return true}
  }
  if(k==="blissey"){
    if(ok("wish")&&e.hp<e.maxHp*.7&&!e.wish&&rnd(.6)){go("wish",false);return true}
    if(ok("charm")&&d>40&&d<200&&!(t.bf&&t.bf.charm)&&rnd(.4)){go("charm",true,.25);return true}
    if(ok("eggbomb")&&d>40&&d<190&&rnd(.5)){go("eggbomb",true,.3);return true}
    if(ok("dslap")&&d<56&&rnd(.9)){go("dslap",true);return true}
  }
  return false;
}
Object.assign(SPECIES,{
  luxray:{name:"Luxray",num:405,types:["electric"],base:{hp:80,atk:100,def:79,spa:95,spd:79,spe:70},sheets:LX_SHEETS,anch:LX_ANCH,shadow:[12,4],body:18,bar:40,hitFrame:2,atkRate:1.2,kit:["thfang","wildchg","chgbeam","growl"],style:"melee",pool:["thfang","wildchg","chgbeam","growl","tbolt","crunch","irontail","qatk"],playable:true,official:{atk:120}},
  scizor:{name:"Cizayox",num:212,types:["bug","steel"],base:{hp:70,atk:95,def:100,spa:55,spd:80,spe:65},sheets:SZ_SHEETS,anch:SZ_ANCH,shadow:[11,4],body:18,bar:40,hitFrame:3,atkRate:1.2,kit:["furycut","xscis","bpunch","agility"],style:"melee",pool:["furycut","xscis","bpunch","agility","wsteel","idef","sdance","nslash"],playable:true,official:{atk:130}},
  lapras:{name:"Lokhlass",num:131,types:["water","ice"],base:{hp:130,atk:85,def:80,spa:78,spd:95,spe:60},sheets:LP_SHEETS,anch:LP_ANCH,shadow:[15,5],body:24,bar:46,hitFrame:4,atkRate:1.2,kit:["echo","aurbeam","waterfall","raindance"],style:"range",pool:["echo","aurbeam","waterfall","raindance","hydrocanon","icebeam","blizzard","tidal"],playable:true,official:{spa:85}},
  nidoking:{name:"Nidoking",num:34,types:["poison","ground"],base:{hp:75,atk:84,def:77,spa:85,spd:75,spe:85},sheets:NK_SHEETS,anch:NK_ANCH,shadow:[11,4],body:20,bar:42,hitFrame:4,atkRate:1.2,kit:["thpunch","megahorn","psting","acid"],style:"melee",pool:["thpunch","megahorn","psting","acid","sbomb","quake","rslide","mud"],playable:true,official:{hp:81,atk:102}},
  blissey:{name:"Leuphorie",num:242,types:["normal"],base:{hp:255,atk:70,def:30,spa:75,spd:135,spe:55},sheets:BL_SHEETS,anch:BL_ANCH,shadow:[10,4],body:16,bar:38,hitFrame:2,atkRate:1.2,kit:["dslap","eggbomb","wish","charm"],style:"melee",pool:["dslap","eggbomb","wish","charm","lscreen","calm","recover","bodyslam"],playable:true,official:{atk:10,def:10}}
});
["luxray","scizor","lapras","nidoking","blissey"].forEach(k=>{const sp=SPECIES[k]; sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1); Object.values(sp.sheets).forEach(s=>{s.img=new Image();s.img.src=s.src})});
buildMenu();
