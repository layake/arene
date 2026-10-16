// ===== Pingoléon (Eau/Acier, tank de contrôle) et Braségali (Feu/Combat, bretteur explosif) =====
PORTRAITS.empoleon="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoBAMAAAB+0KVeAAAAMFBMVEUA/wAnLz8PH0cPL18fR39/v9+Xz8+/58c3b6dfVz+/n1f312/v97d3x9en37/X/7/DNWS4AAACeElEQVQokU3RzU8aQRQA8P0XYEsKe2lgXUvV1LCLTbEn3OXQ2pqIHWwvTaTpRo41Vo4NGsmmhyaYYNJdxKxyQUgaTC8we/IGzLEXD3AwkMjBNdiQtD2wnVn86Etm5s1v3pvLo1qt1ss9vIkGQifg7Suctii85ut4+zmPUAHM793giwZ5DxvNCHh2i6dGgZRqjQiYKtwh6W9NECza2G63Tw2Ux8fz5sLrXBUnbap7cdEpo3q32+2hbKdMki5l4sghlDXNHsr3UJ3cbdQQOjTNMyPfK92hihqPMZaz5rcf726wh3TzXBHLBbNXW7hFQz/3+Rzlqtk5+g8rTkEQcsdfTfUOyxVBCIq5E7ep5m+wk6uyQUmaOgksjHD68vLyTKvREsa6OMbs4zuVGg6H/VlIz0nSZF3imXx/OKT849ZndhZmngSlyUZwidl34sqr99O/6RDU06L4pTEWZ3ailkUNHs5dYazI8blEk/7AcGsYrZl1pxCCx7I8lmjuyIzrI8FoMsyGStW0PJ5o7q6qtI2/wCeaL9WcaTmBduMqa+OAS64IGrzvS6+gXa++aaPlX95gJ2G+H/Aamb6+uWjjEkiuzcIi3Q/DQ8/BNV4BsDEBaxmHA+qMf2uE0W2wHC/BGkHNPeOzkeUASD7CmoHFmp9zjdAFAFidgCQqCvfARppgLKUSPLjFAE3Uo8FSyb21OD1CgXf4t0H8SMXdqREOaDyzgBPEvLrHraSiNv5lBUGSeDdYdSiKMsPauMgKeGgSfw+8cSsKRxMceFhciCPgiqWeYuQw/inahZIkeiOyT+FYHmOxco2S4IqtO6MC/92itINRN/kALIcxqtY/1kLKkAlu5NEAAAAASUVORK5CYII=";
PORTRAITS.blaziken="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoBAMAAAB+0KVeAAAAMFBMVEUA/wA8Pz+iSDzNqXHVSiX6imzPtnF3x9ePz8fbyYiv17f86abn97c/gc342wDXamc9q3ZKAAAB6ElEQVQokU3QvYrbQBAH8H2Fkday5RxnljgPsEl1JI3MpBY+rNoIg8AkjdOcmyuuknBnHASL7wGMuSYcBMxWaYObe4A8xIFcO7MfijON2B//md0Ru3PVvfuvmP/ChboXBPDhRYv38D5UuUt/83gP2x9iq3+CH2QRCII3Wj93PS6Xy8VHrTV/q/VB0kEsl6wsy5BMy+SLVptu+dAtS1ZVi63B9W2slepVQa+qWFXGREo/c6GUkhW3aIKHfF53khul1g9JRWiCB5XTMzEilK8GKXigQ3KTT6i/5jYZG1ObYbiemP5Bb7Vasa2xesbhQ4f6a97b7XaMrNgADK7DDgq14f39fs8oF9XrNLt+CZAGi73DOqZRhC8NRjLxuCGUn1//DKYoeIv5nJ70bgqnDEfDvkdJY4M0o2oQ+7+pmKrNImB1gqOrJypmRxomnWLy6UjF1HpusJgBpISPDs1IwiIYBWcUR4tmpLFCCjkMYoduZF0Us/B7IB4dyhxgbqPhL3DBIwvS8yi20ejYFqOXNJFFCfDV44lQqIL65WkCTw7tk02wkGl2e9Vig8ncYI5pFnk8I9JNhDOOp7HDKVLFtp9jOnZrNhcMELO+RWMjhxLxJP5h4lbKh5ja+y0Kvz2nKLQY+X9CQ9MxbfUXcKhuT9VE4y4AAAAASUVORK5CYII=";
TYPE_PAL.aqj=WATERC; TYPE_PAL.hjk=FLAMEC; TYPE_PAL.water=TYPE_PAL.water||WATERC; TYPE_PAL.fire=TYPE_PAL.fire||FLAMEC; TYPE_PAL.fighting=TYPE_PAL.fighting||AURA; TYPE_PAL.ice=TYPE_PAL.ice||ICEC;
Object.assign(SPL,{
  wsteel:{name:"Aile d'Acier",type:"steel",cat:"phys",power:22,cost:0,cd:1.2,ground:false,melee:true},
  hydrocanon:{name:"Hydrocanon",type:"water",cat:"spec",power:40,cost:0,cd:8,ground:true},
  aquajet:{name:"Aqua-Jet",type:"water",cat:"phys",power:17,cost:0,cd:5,ground:true},
  whirl:{name:"Tourbillon",type:"water",cat:"spec",power:12,cost:0,cd:12,ground:true},
  steelwall:{name:"Mur d'Acier",type:"steel",cat:"status",power:0,cost:0,cd:13,ground:true},
  blazekick:{name:"Pied Brûleur",type:"fire",cat:"phys",power:25,cost:0,cd:1.3,ground:false,melee:true},
  hjk:{name:"Pied Voltige",type:"fighting",cat:"phys",power:40,cost:0,cd:7,ground:true},
  bboost:{name:"Boost Flamme",type:"fire",cat:"status",power:0,cost:0,cd:14,self:true,buff:"bboost"},
  firering:{name:"Cercle de Feu",type:"fire",cat:"spec",power:18,cost:0,cd:10,ground:true},
  embermine:{name:"Mine de Braises",type:"fire",cat:"phys",power:24,cost:0,cd:12,ground:true}
});
Object.values(SPL).forEach(s=>{if(s.pp0===undefined)s.pp0=0});
BUFF.bboost={dur:6,spe:1.45,col:"#ff7a3a",pal:["#c03018","#ff7a3a","#ffe0a0","#ffffff","#ffb030"],label:"Vitesse +"};
Object.assign(DESC,{
  wsteel:"Coup d'aile devant soi, large et rapide.",
  hydrocanon:"Énorme jet d'eau lent en ligne droite. Dégâts très élevés, ralentit.",
  aquajet:"Fonce en jet d'eau à travers l'adversaire et le repousse.",
  whirl:"Tourbillon d'eau 4 s sur la zone visée : dégâts et gros ralentissement.",
  steelwall:"Mur d'acier 4 s : bloque projectiles et déplacements de tous.",
  blazekick:"Coup de pied enflammé devant soi. Peut brûler.",
  hjk:"Saut et coup de pied très puissant. Si le coup rate, il se blesse.",
  bboost:"Bonus de Vitesse pendant 6 s.",
  firering:"Deux cercles de flammes autour de toi, le second plus large. Brûle et repousse.",
  embermine:"Mine de braises : explose au contact, brûle et étourdit brièvement."
});
PROJ.hydrocanon={speed:200,range:260,hit:17};
RUSHES.aquajet={id:"aquajet",chan:0,min:50,dist:140,speed:560,hit:15,push:55,stun:0,rec:.25,cdHit:0,pal:"aqj"};
RUSHES.hjk={id:"hjk",chan:0,min:45,dist:150,speed:540,hit:17,push:70,stun:.3,rec:.4,cdHit:0,pal:"hjk",recoil:.1};
// ---- mêlée générique (Aile d'Acier, Pied Brûleur) ----
function mkMelee(id,pal,sfx,after){
  ACE2[id]={hit(e){
    const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
    const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
    const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
    const px=bx+f[0]*reach, py=by+f[1]*reach;
    fx.push({k:"wave",x:px,y:py,sy:e.y+f[1]*reach+.01,f,t:0,pal:[pal[0],pal[2],pal[3]]});
    fx.push({k:"claw",x:px,y:py,sy:e.y+f[1]*reach+.02,f,t:0,pal:[pal[0],pal[2],pal[3]]});
    colorBurst(px,py+8,14,pal,40,140); if(sfx)sfx(px,py,f);
    logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1800);
    if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16)){ if(strike(e,t,SPL[id],{from:e,push:CONF.push,contact:true})&&after)after(e,t) }
  }};
}
mkMelee("wsteel",STEELC,(x,y,f)=>{for(let i=0;i<5;i++)spark(x,y-4,f[0]*rand(60,120),f[1]*rand(30,70)-rand(10,50),rand(.25,.5),i%2?"#ffffff":STEELC[1],0,2)});
mkMelee("blazekick",FLAMEC,(x,y,f)=>{for(let i=0;i<7;i++)spark(x,y-4,f[0]*rand(30,90),-rand(40,110),rand(.4,.7),FLAMEC[1+i%3],-40,i%3?2:3)},(e,t)=>{if(Math.random()<.4)applyBurn(t,e)});
// ---- Hydrocanon ----
ACE2.hydrocanon={hit(e,id){fireBolt(e,id)}};
ORBHIT.hydrocanon=(o,t)=>{t.slow=Math.max(t.slow,1.4)};
ORBEND.hydrocanon=o=>{
  rings.push({x:o.x,y:o.y-8,t:0,dur:.45,max:44,c:WATERC[2]}); rings.push({x:o.x,y:o.y-8,t:0,dur:.3,max:26,c:"#ffffff"});
  fx.push({k:"pillar",x:o.x,y:o.y,sy:o.y+.5,top:70,w:9,t:0,life:.45,pal:[WATERC[0],WATERC[2],"#ffffff"]});
  colorBurst(o.x,o.y-8,34,WATERC,60,220); shake=Math.max(shake,.16);
  for(let i=0;i<14;i++){const a=rand(0,Math.PI*2);spark(o.x,o.y-6,Math.cos(a)*rand(30,110),-rand(90,200),rand(.4,.8),i%2?WATERC[2]:"#ffffff",420,i%3?2:3)}
};
ORB2.hydrocanon=o=>{
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-16+Math.round(Math.sin(o.t*10)*2);
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-5,gy,11,1); ctx.fillRect(x-3,gy+1,7,1);
  for(let k=10;k>=1;k--){ctx.globalAlpha=1-k*.08; ctx.fillStyle=k%2?WATERC[1]:WATERC[2]; const w=Math.max(2,9-Math.floor(k*.7)); ctx.fillRect(Math.round(x-o.vx*k*5)-w+1,Math.round(y-o.vy*k*5)-w+1+(k%3-1),w*2-1,w*2-1)}
  ctx.globalAlpha=1; pixelRing(x,y,14,"rgba(144,200,255,.5)");
  dsc(x,y,10,WATERC[0]); dsc(x,y,9,WATERC[1]); dsc(x,y,7,WATERC[2]); dsc(x,y,4,WATERC[3]);
  for(let i=0;i<5;i++){const a=-o.t*11+i*1.26; ctx.fillStyle=i%2?"#ffffff":WATERC[3]; ctx.fillRect(Math.round(x+Math.cos(a)*12),Math.round(y+Math.sin(a)*9),2,2)}
};
PREV.wsteel={k:"melee",r:16,d:[22,CONF.reach]}; PREV.blazekick={k:"melee",r:16,d:[22,CONF.reach]};
PREV.hydrocanon={k:"shot",len:()=>PROJ.hydrocanon.range,hw:PROJ.hydrocanon.hit,from:14};
PREV.aquajet={k:"shot",len:v=>rushLen(v,RUSHES.aquajet),hw:RUSHES.aquajet.hit,from:0};
PREV.hjk={k:"shot",len:v=>rushLen(v,RUSHES.hjk),hw:RUSHES.hjk.hit,from:0};
// ---- sorts de terrain supplémentaires ----
Object.assign(GZ,{
  whirl:{kind:"field",range:120,r:46,delay:.4,life:4,tick:.5,dot:.45,slow:.9,style:"whirl"},
  steelwall:{kind:"wall",range:75,n:5,cr:9,life:4,block:"all",style:"steel"},
  firering:{kind:"impacts",range:0,r:22,style:"fire",pr:70,push:45,burn:true,pts:e=>{const a=[];for(let i=0;i<8;i++){const g=GR(i*45+10),p=gpt(e.x,e.y,Math.cos(g)*48,Math.sin(g)*48);p.d=.45;a.push(p)}for(let i=0;i<12;i++){const g=GR(i*30),p=gpt(e.x,e.y,Math.cos(g)*92,Math.sin(g)*92);p.d=.8;a.push(p)}return a}},
  embermine:{kind:"mine",range:120,r:25,life:20,stun:.35,burn:true,style:"fire",push:60}
});
["whirl","steelwall","firering","embermine"].forEach(id=>{ACE2[id]={hit(e,id){spawnGZ(e,id)}}; const C=GZ[id];
  PREV[id]={k:"zone",Z:{range:C.range||1,r:C.kind==="impacts"?C.pr:C.kind==="wall"?C.n*C.cr:C.r}}});
// ---- Boost Flamme : traînée de feu ----
const _tickBf=typeof tickBuffFx==="function"?tickBuffFx:null;
// ---- IA ----
function botAce5(e,t,d,threat,go,ok,rnd){
  if(ok("bboost")&&!e.bf.bboost&&d>70&&rnd(.5)){go("bboost");return true}
  if(ok("hjk")&&d>45&&d<RUSHES.hjk.dist-12&&(punishable(t)||rnd(.35))){go("hjk",false,.1);return true}
  if(ok("hydrocanon")&&d>60&&d<PROJ.hydrocanon.range-30&&rnd(.45)){go("hydrocanon",false,.4);return true}
  if(ok("aquajet")&&d>45&&d<RUSHES.aquajet.dist-10&&rnd(.35)){go("aquajet",false,.1);return true}
  return false;
}
Object.assign(SPECIES,{
  empoleon:{name:"Pingoléon",num:395,types:["water","steel"],base:{hp:84,atk:86,def:88,spa:111,spd:101,spe:60},sheets:EM_SHEETS,anch:EM_ANCH,shadow:[10,4],body:22,bar:46,hitFrame:4,atkRate:1.6,kit:["wsteel","hydrocanon","aquajet","whirl"],style:"range",pool:["wsteel","hydrocanon","aquajet","whirl","steelwall","fcannon","ihead","icebeam"],playable:true},
  blaziken:{name:"Braségali",num:257,types:["fire","fighting"],base:{hp:80,atk:110,def:70,spa:110,spd:70,spe:80},sheets:BZ_SHEETS,anch:BZ_ANCH,shadow:[9,3],body:20,bar:44,hitFrame:2,atkRate:1.3,kit:["blazekick","hjk","ccombat","bboost"],style:"melee",pool:["blazekick","hjk","ccombat","bboost","firering","embermine","flame","heat"],playable:true}
});
["empoleon","blaziken"].forEach(k=>{const sp=SPECIES[k]; sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1); Object.values(sp.sheets).forEach(s=>{s.img=new Image();s.img.src=s.src})});
// ---- animations d'attaque par sort ----
(function(){
  const reg=(k,ALT,map,rates)=>{const sp=SPECIES[k];sp.alt={};for(const a in ALT){const A=ALT[a];sp.alt[a]={sheet:A.sheet,anch:A.anch,hit:A.hit,rate:(rates&&rates[a])||0};A.sheet.img=new Image();A.sheet.img.src=A.sheet.src}sp.altAtk=map};
  reg("empoleon",EMP_ALT,{wsteel:"swing",hydrocanon:"shoot",whirl:"shoot",steelwall:"shoot"},{swing:1.2,shoot:1});
  reg("blaziken",BZ_ALT,{blazekick:"kick",firering:"shoot",embermine:"shoot"},{kick:1.1,shoot:1});
  reg("sceptile",J_ALT,{leafblade:"strike",seedbomb:"shoot",megadrain:"shoot",leech:"shoot",thorns:"shoot"},{strike:1.1,shoot:1});
  reg("mewtwo",M2_ALT,{mbarrier:"shoot",epsy:"shoot",psystrike:"shoot"},{shoot:1});
})();
buildMenu();
