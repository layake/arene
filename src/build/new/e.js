// ===== Sorts =====
const rushLen=(v,C)=>{C=C||RUSHES.rush;return v?clamp(v[2],C.min,C.dist):C.dist};
// Corps à corps (Draco-Griffe, Choc Mental). Le combo après Tunnel annule la récupération et envoie la cible plus loin.
function castMelee(e,id){
  const T=e.tunnel, combo=e.comboT>0&&cdOf(e,id)<=0&&(!T||T.phase==="rise");
  if(!(e.stun>0)&&!e.rush&&!e.chan&&(e.anim!=="attack"||e.hit)&&(!T||combo)&&(e.lock<=0||combo)&&cdOf(e,id)<=0&&!e.shieldOn){
    if(!spendPP(e,SPL[id].cost))return;
    if(T){e.tunnel=null;e.cd.tun=SPL.tun.cd}
    lockAim(e); e.cast=id; e.comboClaw=combo; e.comboT=0; e.lock=0; e.cd[id]=SPL[id].cd; e.aim=aimAt(e,false); e.moveTarget=null; e.anim="idle"; e.altA=(e.sp.altAtk&&e.sp.altAtk[id])||null; setAnim(e,"attack");
  }
}
// Sorts lancés avec la pose d'attaque : le projectile ou la zone part sur la frame de contact.
function castAnim(e,id){
  if(e.stun>0||e.tunnel||e.rush||e.chan||e.lock>0||cdOf(e,id)>0||e.shieldOn||(e.anim==="attack"&&!e.hit))return;
  if(!spendPP(e,SPL[id].cost))return;
  e.cd[id]=SPL[id].cd; gcd(e,.5);
  lockAim(e); e.aim=aimAt(e,true)||FACE[e.dir]; e.cast=id; e.comboClaw=false; e.moveTarget=null; e.anim="idle"; e.altA=(e.sp.altAtk&&e.sp.altAtk[id])||null; setAnim(e,"attack");
}
function animHit(e){
  const id=e.cast; if(typeof obstMelee==="function")obstMelee(e,id);
  if(id&&!SPL[id].melee&&SPL[id].type){const P=TYPE_PAL[SPL[id].type]||FIRE; rings.push({x:e.x,y:e.y-e.sp.body,t:0,dur:.22,max:18,c:P[2]}); colorBurst(e.x,e.y-e.sp.body+8,10,P,40,120)}
  if(ACE2[id])ACE2[id].hit(e,id); else if(id==="mud"||id==="moon"||id==="fcannon"||id==="shball"||id==="tbolt"||id==="hypno")fireBolt(e,id); else if(id==="sbomb")dropSb(e); else if(id==="hex")dropHex(e); else if(id==="scl")waveHit(e,"scl"); else if(id==="fsight")dropFs(e); else if(id==="trap")dropTrap(e); else if(id==="sedge")dropEdge(e); else if(id==="ihead")ironHead(e); else if(id==="rslide")dropSlide(e); else if(id==="quake")dropQuake(e); else if(id==="psy")dropPsy(e); else if(id==="grav")dropGrav(e); else if(id==="conf")waveHit(e); else clawHit(e);
}
// Draco-Griffe : trois griffures devant le lanceur. Si l'ennemi est proche (44) et à peu près où le curseur pointe (35 degrés), les griffes s'étirent jusqu'à lui.
function clawHit(e){
  const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
  const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CLAW_ASSIST&&along/td>=CLAW_CONE, reach=assist?clamp(along,20,32):20;
  fx.push({k:"claw",x:bx+f[0]*reach,y:by+f[1]*reach,sy:e.y+f[1]*reach+.01,f,t:0});
  logFor(e,e.sp.name+" utilise Draco-Griffe !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*20,ty-f[1]*20)<14))strike(e,t,SPL.claw,{from:e,push:e.comboClaw?CLAW_COMBO_PUSH:CLAW_PUSH,contact:true});
}
// Choc Mental : une onde psychique devant le lanceur, portée un peu plus longue.
function waveHit(e,id){
  id=id||"conf"; const WP=id==="scl"?["#2a1840","#b090d8","#ffffff"]:undefined;
  const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
  const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
  fx.push({k:id==="scl"?"claw":"wave",x:bx+f[0]*reach,y:by+f[1]*reach,sy:e.y+f[1]*reach+.01,f,t:0,pal:WP});
  logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16))strike(e,t,SPL[id],{from:e,push:CONF.push,contact:true});
}
// Projectiles (Tir de Boue, Pouvoir Lunaire)
function fireBolt(e,id){
  const f=e.aim||FACE[e.dir];
  orbs.push({x:e.x+f[0]*14,y:e.y+f[1]*14,vx:f[0],vy:f[1],trav:0,t:0,o:e,id});
  logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1600);
}
function updateOrbs(dt){
  for(let i=orbs.length-1;i>=0;i--){
    const o=orbs[i], P=PROJ[o.id]; o.t+=dt; orbHoming(o,P,dt);
    if(o.id==="hypno"&&Math.random()<dt*9)rings.push({x:o.x,y:o.y-14,t:0,dur:.4,max:18,c:"#e0a0ff"});
    if(o.id!=="mud"&&Math.random()<dt*40){const pl=TYPE_PAL[SPL[o.id].type];spark(o.x+rand(-3,3),o.y-14+rand(-3,3),rand(-14,14),rand(-14,14),rand(.25,.45),pl[Math.floor(rand(0,5))],0,2)} let left=P.speed*dt, gone=false;
    while(left>0&&!gone){
      const st=Math.min(4,left); left-=st; o.x+=o.vx*st; o.y+=o.vy*st; o.trav+=st;
      const t=foeOf(o.o);
      if(alive(t)&&!t.tunnel&&!(t.inv>0)&&Math.hypot(t.x-o.x,(t.y-o.y)*1.3)<P.hit+t.sp.body*.55&&o.id==="hypno"){
        if(t.shieldOn)blockHit(t,{x:o.x-o.vx*10,y:o.y-o.vy*10},10,o.o,false);
        else{sfxUI("sleep");pops.push({x:t.x,y:t.y-46,t:0,txt:"Endormi"});colorBurst(t.x,t.y-10,18,TYPE_PAL.psychic,20,80);
          if(t.ai){t.ai.wait=Math.max(t.ai.wait,SLEEP.t)}else{t.stun=Math.max(t.stun,SLEEP.t);t.sleep=true;t.dizzy=false;t.moveTarget=null;if(t===player)marker=null;t.rush=null;t.chan=null}}
        gone=true}
      else if(alive(t)&&!t.tunnel&&!(t.inv>0)&&Math.hypot(t.x-o.x,(t.y-o.y)*1.3)<P.hit+t.sp.body*.55){const hp0=t.hp; strike(o.o,t,SPL[o.id],{from:{x:o.x-o.vx*10,y:o.y-o.vy*10}}); if(ORBHIT[o.id])ORBHIT[o.id](o,t,hp0-t.hp); gone=true}
      else if(typeof wallOrb!=="undefined"&&wallOrb(o))gone=true;
      else if(o.trav>=P.range||arenaShot(o))gone=true;
    }
    if(gone&&ORBEND[o.id])ORBEND[o.id](o);
    if(gone&&o.id==="tbolt"){fx.push({k:"pillar",x:o.x,y:o.y,sy:o.y+.5,top:130,w:5,t:0,life:.28,pal:["#c09010","#f8d030","#ffffff"]});rings.push({x:o.x,y:o.y,t:0,dur:.3,max:22,c:"#fff080"});colorBurst(o.x,o.y,22,TYPE_PAL.electric,60,200);shake=Math.max(shake,.12)}
    if(gone&&(o.id==="asph"||o.id==="wshuri")){const pl=o.id==="asph"?AURA:WATERC;rings.push({x:o.x,y:o.y-10,t:0,dur:.28,max:o.id==="asph"?24:14,c:pl[2]});colorBurst(o.x,o.y,o.id==="asph"?20:8,pl,40,150);if(o.id==="asph")fx.push({k:"star",x:o.x,y:o.y-12,sy:o.y+.7,t:0,life:.35,r:12,col:"#e0f4ff"})}
    if(gone){if(o.id==="fcannon"){rings.push({x:o.x,y:o.y,t:0,dur:.3,max:22,c:"#ffffff"});fx.push({k:"star",x:o.x,y:o.y-12,sy:o.y+.7,t:0,life:.4,r:14})};if(o.id==="moon")colorBurst(o.x,o.y+8,12,PINK,30,90);else if(o.id==="fcannon")colorBurst(o.x,o.y+8,14,STEELC,30,100);else burst(o.x,o.y,10);orbs.splice(i,1)}
  }
}
// Psyko : une zone posée au sol à l'endroit visé (portée limitée). Elle explose après un court délai, on peut l'esquiver.
function dropPsy(e){
  const sp=zoneSpot(e,PSY.range);
  zones.push({x:sp.x,y:sp.y,t:0,o:e,done:false});
  logFor(e,e.sp.name+" utilise Psyko !",1600);
}
function dropGrav(e){
  const sp=zoneSpot(e,GRAV.range);
  zones.push({k:"grav",x:sp.x,y:sp.y,t:0,o:e});
  logFor(e,e.sp.name+" utilise Gravité !",1600);
}
// Sorts de bonus (Plénitude, Danse-Lames, Mur de Fer) : sur soi, sans visée ; relancer rafraîchit la durée.
function castBuff(e,id){
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||cdOf(e,id)>0||e.shieldOn)return;
  const B=BUFF[SPL[id].buff];
  if(!spendPP(e,SPL[id].cost))return;
  e.cd[id]=SPL[id].cd; gcd(e,.4); e.bf[SPL[id].buff]=B.dur;
  rings.push({x:e.x,y:e.y,t:0,dur:.5,max:26,c:B.col}); colorBurst(e.x,e.y,22,B.pal,30,110);
  fx.push({k:"up",x:e.x,y:e.y,sy:e.y+.5,h:e.sp.body+8,t:0,life:.9,pal:B.pal});
  pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:B.label});
  if(SPL[id].type==="steel")fx.push({k:"star",x:e.x+6,y:e.y-e.sp.body,sy:e.y+.7,t:0,life:.5,r:12});
  logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1600);
}
// Téléport : on réapparaît à l'endroit visé (portée limitée), sans animation, mais le sort a une recharge.
function castTele(e){
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||cdOf(e,"tele")>0||e.shieldOn||e.counter)return;
  if(!spendPP(e,SPL.tele.cost))return;
  e.cd.tele=SPL.tele.cd; gcd(e,.3);
  lockAim(e); const sp=zoneSpot(e,TELE.range); e.lockPt=null;
  fx.push({k:"pillar",x:e.x,y:e.y,sy:e.y+.5,top:60,w:7,t:0,life:.35,pal:PSYC});
  colorBurst(e.x,e.y,20,PSYC,30,120); rings.push({x:e.x,y:e.y,t:0,dur:.3,max:22,c:"#e0a0ff"});
  e.x=sp.x; e.y=sp.y; e.kb=null; e.moveTarget=null; if(e===player)marker=null; e.lx=e.x; e.ly=e.y; setAnim(e,"idle");
  colorBurst(e.x,e.y,24,PSYC,30,130); rings.push({x:e.x,y:e.y,t:0,dur:.35,max:26,c:"#ffffff"});
  fx.push({k:"pillar",x:e.x,y:e.y,sy:e.y+.5,top:60,w:7,t:0,life:.35,pal:PSYC});
  logFor(e,e.sp.name+" utilise Téléport !",1400);
}
// Prescience : une zone visée qui explose bien plus tard (1,5 s). Il faut anticiper l'adversaire.
function dropFs(e){
  const sp=zoneSpot(e,FS.range);
  zones.push({k:"fs",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:FS.delay});
  logFor(e,e.sp.name+" utilise Prescience !",1600);
}
// Bomb Beurk : un projectile lobé retombe sur la zone visée, explose puis laisse une flaque empoisonnée.
function dropSb(e){
  const sp=zoneSpot(e,SB.range);
  zones.push({k:"sbomb",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:SB.delay,fx:e.x,fy:e.y});
  logFor(e,e.sp.name+" utilise Bomb Beurk !",1600);
}
// Hex : une zone visée, deux fois plus forte si la cible est déjà affaiblie (empoisonnée, ralentie, étourdie ou endormie).
const hexBoost=t=>t.stun>0||t.slow>0||t.psn>0||t.sleep;
function dropHex(e){
  const sp=zoneSpot(e,HX.range);
  zones.push({k:"hex",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:HX.delay});
  logFor(e,e.sp.name+" utilise Hex !",1600);
}
// Piège de Roc : une zone posée qui reste. Le premier qui marche dedans prend des dégâts et est ralenti.
function dropTrap(e){
  zones.forEach((z,i)=>{if(z.k==="trap"&&z.o===e)z.t=Math.max(z.t,TRAP.life)}); // un seul piège à la fois
  const sp=zoneSpot(e,TRAP.range);
  zones.push({k:"trap",x:sp.x,y:sp.y,t:0,o:e,done:false});
  logFor(e,e.sp.name+" utilise Piège de Roc !",1600);
}
// Lame de Roc : une ligne de pointes qui jaillissent devant le lanceur après un court délai.
function edgePts(x,y,f){const a=[];for(let d=EDGE.from;d<=EDGE.len;d+=4)a.push({x:x+f[0]*d,y:y+f[1]*d});return a}
function dropEdge(e){
  const f=aimAt(e,true)||FACE[e.dir];
  zones.push({k:"edge",x:e.x,y:e.y,f,t:0,o:e,done:false,delay:EDGE.delay});
  logFor(e,e.sp.name+" utilise Lame de Roc !",1600);
}
// Tête de Fer : petit élan vers la cible, coup au front qui fait flancher (étourdissement bref).
function ironHead(e){
  const f=e.aim||FACE[e.dir], t=foeOf(e);
  e.x=clampX(e.x+f[0]*IRON.step); e.y=clampY(e.y+f[1]*IRON.step*.77);
  const bx=e.x, by=e.y-e.sp.body, tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CLAW_ASSIST+8&&along/td>=CLAW_CONE, reach=assist?clamp(along,20,IRON.reach):22;
  fx.push({k:"wave",x:bx+f[0]*reach,y:by+f[1]*reach,sy:e.y+f[1]*reach+.01,f,t:0,pal:["#606080","#c8c8e0","#ffffff"]});
  fx.push({k:"star",x:bx+f[0]*reach,y:by+f[1]*reach,sy:e.y+f[1]*reach+.02,t:0,life:.35,r:10,col:"#ffffff"});
  logFor(e,e.sp.name+" utilise Tête de Fer !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16))strike(e,t,SPL.ihead,{from:e,push:IRON.push,stun:IRON.stun,contact:true});
}
// Éboulement : trois rochers tombent en ligne devant le lanceur, l'un après l'autre.
function dropSlide(e){
  slideSpots(e).forEach((p,i)=>zones.push({k:"rock",x:p.x,y:p.y,t:0,o:e,delay:RS.delay[i],done:false}));
  logFor(e,e.sp.name+" utilise Éboulement !",1600);
}
// Séisme : une onde centrée sur le lanceur, grosse poussée, aucun besoin de viser.
function dropQuake(e){
  zones.push({k:"quake",x:e.x,y:e.y,t:0,o:e,done:false});
  logFor(e,e.sp.name+" utilise Séisme !",1600);
}
// Métal Burst : posture de riposte. Le prochain coup reçu est rendu à 150 %, sinon récupération.
function castBurst(e){
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||e.lock>0||cdOf(e,"mburst")>0||e.shieldOn)return;
  if(!spendPP(e,SPL.mburst.cost))return;
  e.cd.mburst=SPL.mburst.cd; gcd(e,.4); e.moveTarget=null; e.counter={t:MBURST.dur};
  rings.push({x:e.x,y:e.y,t:0,dur:.4,max:22,c:"#d8d8f0"});
  pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"Riposte !"});
  logFor(e,e.sp.name+" utilise Métal Burst !",1600);
}
function updateZones(dt){
  for(let i=zones.length-1;i>=0;i--){
    const z=zones[i]; z.t+=dt;
    if(ZONE2[z.k]){if(ZONE2[z.k](z,i,dt))zones.splice(i,1);continue}
    if(z.k==="rock"){
      if(!z.done&&z.t>=z.delay){
        z.done=true; const t=foeOf(z.o);
        rings.push({x:z.x,y:z.y,t:0,dur:.3,max:RS.r+8,c:"#d8c890"}); colorBurst(z.x,z.y,18,ROCKC,40,150); shake=Math.max(shake,.12);
        for(let i=0;i<10;i++){const a=rand(0,Math.PI*2);spark(z.x+Math.cos(a)*4,z.y-4,Math.cos(a)*rand(30,90),rand(-170,-80),rand(.35,.6),["#6a5a3a","#8a7a50","#b8a878"][i%3],380,3)}
        for(let i=0;i<8;i++){const a=rand(0,Math.PI*2);spark(z.x+Math.cos(a)*6,z.y-2,Math.cos(a)*rand(40,80),Math.sin(a)*rand(10,25)-15,rand(.4,.7),"rgba(216,200,144,.6)",-10,4)}
        if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<RS.r)strike(z.o,t,SPL.rslide,{from:{x:z.x,y:z.y},push:RS.push,stun:RS.stun,mult:RS.mult});
      }
      if(z.t>z.delay+.35)zones.splice(i,1);
      continue;
    }
    if(z.k==="quake"){
      if(!z.done&&z.t>=QUAKE.delay){
        z.done=true; const t=foeOf(z.o);
        rings.push({x:z.x,y:z.y,t:0,dur:.5,max:QUAKE.r+10,c:"#d8c890"}); rings.push({x:z.x,y:z.y,t:0,dur:.3,max:QUAKE.r*.6,c:"#ffffff"});
        colorBurst(z.x,z.y,44,["#d1a35c","#8a6030","#e8d8a0","#6a5a30","#f0e8c0"],70,200); shake=Math.max(shake,.3);
        fx.push({k:"cracks",x:z.x,y:z.y,sy:z.y-.5,t:0,life:1,rays:Array.from({length:9},(_,i)=>({a:i*Math.PI*2/9+rand(-.2,.2),len:QUAKE.r*rand(.8,1.1),s:Math.floor(rand(0,9))}))});
        for(let i=0;i<14;i++){const a=rand(0,Math.PI*2),r=rand(8,QUAKE.r*.8);spark(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ISO,rand(-15,15),rand(-150,-70),rand(.35,.6),["#6a5030","#8a6a3e","#b8965f"][i%3],360,3)}
        if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<QUAKE.r)strike(z.o,t,SPL.quake,{from:{x:z.x,y:z.y},push:QUAKE.push,stun:QUAKE.stun});
      }
      if(z.t>QUAKE.delay+.45)zones.splice(i,1);
      continue;
    }
    if(z.k==="sbomb"){
      if(!z.done&&z.t>=SB.delay){
        z.done=true; const t=foeOf(z.o);
        rings.push({x:z.x,y:z.y,t:0,dur:.4,max:SB.r+12,c:"#d070d0"}); colorBurst(z.x,z.y,34,TYPE_PAL.poison,50,170); shake=Math.max(shake,.15);
        for(let k=0;k<14;k++){const a=rand(0,Math.PI*2),v=rand(40,110);spark(z.x,z.y-4,Math.cos(a)*v,Math.sin(a)*v*.4-rand(60,130),rand(.4,.7),TYPE_PAL.poison[k%5],330,3)} // éclaboussures
        if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<SB.r)strike(z.o,t,SPL.sbomb,{from:{x:z.x,y:z.y},push:SB.push});
        z.k="pois"; z.t=0; z.tick=SB.tick; z.done=false; // devient une flaque
      }
      continue;
    }
    if(z.k==="pois"){
      const t=foeOf(z.o); z.tick-=dt;
      if(Math.random()<dt*10)spark(z.x+rand(-SB.r,SB.r)*.8,z.y+rand(-SB.r,SB.r)*ISO*.8,rand(-6,6),rand(-40,-20),rand(.4,.7),TYPE_PAL.poison[Math.floor(rand(0,5))],-20,2);
      if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<SB.r){
        t.psn=.8;
        if(z.tick<=0){z.tick=SB.tick; if(!t.shieldOn){applyDamage(t,z.o,{x:z.x,y:z.y},Math.max(1,Math.round(calcDamage(z.o,t,SPL.sbomb)*SB.dotMult)),{dot:true});colorBurst(t.x,t.y-8,4,TYPE_PAL.poison,10,40)}}
      }
      if(z.t>SB.life)zones.splice(i,1);
      continue;
    }
    if(z.k==="hex"){
      if(!z.done&&z.t>=HX.delay){
        z.done=true; const t=foeOf(z.o), boost=alive(t)&&hexBoost(t);
        rings.push({x:z.x,y:z.y,t:0,dur:.4,max:HX.r+12,c:"#b090d8"}); colorBurst(z.x,z.y,30,TYPE_PAL.ghost,50,170); shake=Math.max(shake,.15);
        fx.push({k:"pillar",x:z.x,y:z.y,sy:z.y+.5,top:80,w:HX.r*.45,t:0,life:.4,pal:["#2a1840","#a070d8","#e0c8ff"]});
        for(let k=0;k<16;k++){const a=rand(0,Math.PI*2),r=rand(0,HX.r);spark(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ISO,rand(-10,10),rand(-90,-40),rand(.4,.8),TYPE_PAL.ghost[k%5],-30,3)}
        if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<HX.r){if(boost)pops.push({x:z.x,y:z.y-56,t:0,txt:"x1,6 !"});strike(z.o,t,SPL.hex,{from:{x:z.x,y:z.y},push:HX.push,mult:boost?1.6:1})}
      }
      if(z.t>HX.delay+.4)zones.splice(i,1);
      continue;
    }
    if(z.k==="fs"){
      if(!z.done&&z.t>=FS.delay){
        z.done=true; const t=foeOf(z.o);
        rings.push({x:z.x,y:z.y,t:0,dur:.45,max:FS.r+14,c:"#ffb0e0"}); rings.push({x:z.x,y:z.y,t:0,dur:.25,max:FS.r,c:"#ffffff"});
        colorBurst(z.x,z.y,42,PSYC,60,200); shake=Math.max(shake,.25);
        fx.push({k:"pillar",x:z.x,y:z.y,sy:z.y+.5,top:170,w:FS.r*.6,t:0,life:.5,pal:["#f060a8","#ffb0e0","#ffffff"]});
        if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<FS.r)strike(z.o,t,SPL.fsight,{from:{x:z.x,y:z.y},push:FS.push,stun:.3});
      }
      if(z.t>FS.delay+.45)zones.splice(i,1);
      continue;
    }
    if(z.k==="trap"){
      const t=foeOf(z.o);
      if(z.t>=TRAP.arm&&!z.done&&alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<TRAP.r){
        z.done=true; z.t=TRAP.life; // se déclenche : disparaît juste après
        rings.push({x:z.x,y:z.y,t:0,dur:.3,max:TRAP.r+10,c:"#d8c890"}); colorBurst(z.x,z.y,18,["#b8a038","#8a7a40","#d8c890","#6a5a30","#e8e0b0"],40,140);
        if(strike(z.o,t,SPL.trap,{from:{x:z.x,y:z.y},push:30})){t.slow=TRAP.slowT;pops.push({x:t.x,y:t.y-46,t:0,txt:"Ralenti"})}
      }
      if(z.t>TRAP.life)zones.splice(i,1);
      continue;
    }
    if(z.k==="edge"){
      if(!z.done&&z.t>=EDGE.delay){
        z.done=true; const t=foeOf(z.o), pts=edgePts(z.x,z.y,z.f);
        pts.forEach((p,k)=>{if(k%2===0)colorBurst(p.x,p.y,3,["#b8a038","#8a7a40","#d8c890","#6a5a30","#e8e0b0"],20,80)}); shake=Math.max(shake,.15);
        if(alive(t)&&!t.tunnel&&pts.some(p=>Math.hypot(t.x-p.x,(t.y-p.y)*1.3)<EDGE.half))strike(z.o,t,SPL.sedge,{from:{x:z.x,y:z.y},push:EDGE.push,stun:EDGE.stun});
      }
      if(z.t>EDGE.delay+.5)zones.splice(i,1);
      continue;
    }
    if(z.k==="grav"){
      const t=foeOf(z.o);
      if(z.t>GRAV.delay&&alive(t)&&!t.tunnel&&!t.shieldOn&&!(t.rush&&t.rush.ph==="dash")){
        const dx=z.x-t.x, dy=z.y-t.y, d=gdist(dx,dy);
        if(d<GRAV.r&&d>1){const st=Math.min(d,GRAV.pull*(.55+.45*d/GRAV.r)*dt); t.x=clampX(t.x+dx/d*st); t.y=clampY(t.y+dy/d*st*ISO)}
      }
      if(Math.random()<dt*14&&z.t>GRAV.delay){const a=rand(0,Math.PI*2);spark(z.x+Math.cos(a)*GRAV.r,z.y+Math.sin(a)*GRAV.r*.55-8,-Math.cos(a)*50,-Math.sin(a)*28,.5,PSYC[Math.floor(rand(0,5))],40,2)}
      if(z.t>GRAV.delay+GRAV.life)zones.splice(i,1);
      continue;
    }
    if(!z.done&&z.t>=PSY.delay){
      z.done=true; const t=foeOf(z.o);
      rings.push({x:z.x,y:z.y,t:0,dur:.4,max:PSY.r+14,c:"#e0a0ff"}); rings.push({x:z.x,y:z.y,t:0,dur:.25,max:PSY.r,c:"#ffffff"});
      colorBurst(z.x,z.y,36,PSYC,60,190); shake=Math.max(shake,.2);
      fx.push({k:"pillar",x:z.x,y:z.y,sy:z.y+.5,top:90,w:PSY.r*.5,t:0,life:.4,pal:["#7030c0","#e0a0ff","#ffffff"]});
      if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<PSY.r)strike(z.o,t,SPL.psy,{from:{x:z.x,y:z.y},push:PSY.push});
    }
    if(z.t>PSY.delay+.4)zones.splice(i,1);
  }
}
// ---- Tunnel ----
// On s'enfonce (0.1 s), on file sous terre sur une distance fixe, on surgit et on touche tout autour du trou. Un ennemi sur le chemin fait surgir sur place.
function startTunnel(e){
  if(e.rush||e.chan||e.stun>0||e.tunnel||(e.anim==="attack"&&!e.hit)||e.lock>0||cdOf(e,"tun")>0||e.shieldOn)return;
  if(!spendPP(e,SPL.tun.cost))return;
  const f=aimAt(e,true)||FACE[e.dir]; e.moveTarget=null; meleeIds(e).forEach(m=>e.cd[m]=0);
  e.tunnel={phase:"sink",t:0,fx:f[0],fy:f[1],trav:0,trailAt:0};
  setAnim(e,"idle"); e.frame=0; e.tick=0; e.rest=99;
  holes.push({x:e.x,y:e.y,t:0,life:4}); burst(e.x,e.y,12);
  logFor(e,e.sp.name+" utilise Tunnel !",1400);
}
function emerge(e){
  const T=e.tunnel, x=e.x, y=e.y;
  meleeIds(e).forEach(m=>e.cd[m]=0); e.comboT=.6; // Tunnel remet la griffe à zéro et ouvre une fenêtre de combo
  T.phase="rise"; T.t=0;
  holes.push({x,y,t:0,life:4}); rings.push({x,y,t:0,dur:.35}); burst(x,y,24);
  shake=.25; hitstop=.06;
  const t=foeOf(e);
  if(alive(t)&&gdist(t.x-x,t.y-y)<=TUNNEL.radius)strike(e,t,SPL.tun,{from:{x,y}});
}
function updateTunnel(e,dt){
  const T=e.tunnel; T.t+=dt;
  if(T.phase==="sink"){
    if(Math.random()<dt*30)burst(e.x,e.y,1);
    if(T.t>=TUNNEL.windup){T.phase="dash";T.t=0}
  }else if(T.phase==="dash"){
    if(Math.random()<.8)burst(e.x,e.y,1);
    // Pas de 4 pixels d'art au plus pour qu'une ruée rapide ne saute pas un Pokémon sur son chemin.
    let left=Math.min(TUNNEL.speed*dt,TUNNEL.dist-T.trav);
    while(left>0&&T.phase==="dash"){
      const step=Math.min(4,left), t=foeOf(e); left-=step;
      // Guidage léger : si l'ennemi est à peu près devant et à portée, on infléchit la ruée vers lui pour qu'un petit pas de côté ne la rate pas.
      {const ex=t.x-e.x, ey=t.y-e.y, ed=Math.hypot(ex,ey);
       if(alive(t)&&ed>1&&ed<=TUNNEL.dist-T.trav+TUNNEL_ASSIST&&(ex*T.fx+ey*T.fy)/ed>TUNNEL_CONE){
         let nx=T.fx+ex/ed*.45, ny=T.fy+ey/ed*.45; const nl=Math.hypot(nx,ny); T.fx=nx/nl; T.fy=ny/nl}}
      e.x=clampX(e.x+T.fx*step); e.y=clampY(e.y+T.fy*step); T.trav+=step;
      T.trailAt+=step; if(T.trailAt>=5){T.trailAt=0;trail.push({x:e.x,y:e.y,t:0})}
      const contact=alive(t)&&!t.tunnel&&Math.hypot(t.x-e.x,(t.y-e.y)*1.3)<15+t.sp.body*.4;
      const blocked=(T.fx>0&&e.x>=AB.x1)||(T.fx<0&&e.x<=AB.x0)||(T.fy>0&&e.y>=AB.y1)||(T.fy<0&&e.y<=AB.y0);
      if(contact||blocked||T.trav>=TUNNEL.dist-.01)emerge(e);
    }
  }else if(T.t>=TUNNEL.rise){
    e.tunnel=null; e.cd.tun=SPL.tun.cd; setAnim(e,"idle"); e.rest=rand(.3,.8); e.lock=TUNNEL.recovery;
  }
}
// ---- Draco-Charge : canalisation (la visée suit le curseur), puis charge longue et rapide qui étourdit le premier touché. ----
function startRush(e,id){
  id=id||"rush"; const C=RUSHES[id];
  if(e.stun>0||e.tunnel||e.rush||e.chan||e.lock>0||cdOf(e,id)>0||e.shieldOn||(e.anim==="attack"&&!e.hit))return;
  if(!spendPP(e,SPL[id].cost))return;
  if(e===player){aiming=null;marker=null} e.moveTarget=null; gcd(e,.3);
  const f=aimAt(e,true)||FACE[e.dir];
  e.rush={ph:C.chan?"chan":"dash",t:0,fx:f[0],fy:f[1],trav:0,len:rushLen(aimVec(e,true),C),cfg:C,id};
  if(C.chan)setAnim(e,"guard"); else{setAnim(e,"walk");e.run=true;rings.push({x:e.x,y:e.y,t:0,dur:.25,max:16,c:C.pal?TYPE_PAL[C.pal][2]:"#b090d8"});colorBurst(e.x,e.y,12,C.pal?TYPE_PAL[C.pal]:TYPE_PAL.ghost,30,100)}
  logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1600);
}
function cancelRush(e,hurt){
  const R=e.rush; e.rush=null; if(hurt)e.cd[R.id]=R.cfg.cdHit; setAnim(e,"idle"); e.rest=rand(.3,.8);
  if(!hurt)logFor(e,SPL[R.id].name+" annulée",900);
}
function updateRush(e,dt){
  const R=e.rush; if(R.ph==="flurry"){updateFlurry(e,dt);return} R.t+=dt;
  if(R.ph==="chan"){
    const v=aimVec(e,true); if(v){R.fx=v[0];R.fy=v[1];R.len=rushLen(v,R.cfg);e.dir=dirFromVector(v[0],v[1])}
    setAnim(e,"guard");
    const fill=clamp(R.t/R.cfg.chan,0,1), cx=e.x, cy=e.y-10;
    // L'énergie est aspirée dans le corps, plus vite et plus dense au fil de la charge
    if(Math.random()<dt*(30+140*fill)){const a=rand(0,Math.PI*2),rad=rand(20,36)*(1.15-.35*fill),sp=rand(55,100);spark(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.8,-Math.cos(a)*sp,-Math.sin(a)*sp*.8,rad/sp,FIRE[Math.floor(rand(0,5))],0,fill>.6?3:2)}
    if(fill>.4&&Math.random()<dt*50)spark(cx+rand(-14,14),e.y+rand(-2,3),rand(-10,10),rand(-70,-30),rand(.3,.55),FIRE[Math.floor(rand(0,3))],-30,2);
    if(fill>.7&&Math.random()<dt*14)shake=Math.max(shake,.05);
    if(Math.random()<dt*10)burst(e.x+rand(-10,10),e.y,1);
    if(R.t>=R.cfg.chan){R.ph="dash";R.t=0;setAnim(e,"charge");shake=.2;burst(e.x,e.y,14);rushBurst(cx,e.y,28,60,150);
      rings.push({x:e.x,y:e.y,t:0,dur:.35,max:34,c:"#a77bff"});rings.push({x:e.x,y:e.y,t:0,dur:.22,max:20,c:"#ffffff"})}
  }else if(R.ph==="dash"){
    const C=R.cfg, ghost=!!C.ghost, custom=!!C.pal; let left=Math.min(C.speed*dt,R.len-R.trav); if(ghost||custom){e.dir=dirFromVector(R.fx,R.fy);e.run=true;setAnim(e,"walk")}
    while(left>0&&R.ph==="dash"){
      const st=Math.min(4,left); left-=st;
      e.x=clampX(e.x+R.fx*st); e.y=clampY(e.y+R.fy*st); R.trav+=st;
      if(C.fly)e.inv=Math.max(e.inv||0,.12);
      const PAL=custom?TYPE_PAL[C.pal]:ghost?TYPE_PAL.ghost:FIRE, plain=!ghost&&!custom;
      if(plain&&Math.random()<.7)burst(e.x,e.y,1);
      if(plain&&Math.floor((R.trav-st)/5)!==Math.floor(R.trav/5))glows.push({x:e.x,y:e.y,t:0,life:.8});
      if(!plain&&Math.floor((R.trav-st)/5)!==Math.floor(R.trav/5)){for(let q=0;q<3;q++)spark(e.x+rand(-4,4),e.y-rand(4,18),rand(-6,6),rand(-20,0),.4,TYPE_PAL.ghost[q%3],0,4)}
      for(let k=0;k<2;k++){const n=rand(-5,5);spark(e.x+(-R.fy)*n,e.y-8+R.fx*n*.5,-R.fx*rand(30,90)+rand(-10,10),-R.fy*rand(30,90)*.7+rand(-10,10),rand(.2,.4),PAL[Math.floor(rand(0,4))],0,k?3:2)}
      const t=foeOf(e), contact=alive(t)&&!t.tunnel&&Math.hypot(t.x-e.x,(t.y-e.y)*1.3)<C.hit+t.sp.body*.4;
      const blocked=(R.fx>0&&e.x>=AB.x1)||(R.fx<0&&e.x<=AB.x0)||(R.fy>0&&e.y>=AB.y1)||(R.fy<0&&e.y<=AB.y0);
      if(contact&&C.flurry){beginFlurry(e,R);break}
      const pun=contact&&C.punish&&punishable(t);
      const hitOk=contact&&strike(e,t,SPL[R.id],{from:e,push:C.push,stun:C.stun,contact:true,mult:pun?C.punish:1});
      if(hitOk&&pun){pops.push({x:t.x,y:t.y-56,t:0,txt:"x"+String(C.punish).replace(".",",")+" !"});fx.push({k:"star",x:t.x,y:t.y-t.sp.body,sy:t.y+.7,t:0,life:.4,r:14});shake=Math.max(shake,.25)}
      if(hitOk&&C.fly)rushHitFx(e,t,C);
      if(hitOk&&plain){
        rings.push({x:t.x,y:t.y,t:0,dur:.45,max:46,c:"#a77bff"}); rings.push({x:t.x,y:t.y,t:0,dur:.28,max:28,c:"#ffffff"}); rushBurst(t.x,t.y,44,80,220); burst(t.x,t.y,22); shake=.42; hitstop=.11;
      }
      if(contact||blocked||R.trav>=R.len-.01){if(C.recoil&&!hitOk&&alive(e)){const rd=Math.max(1,Math.round(e.maxHp*C.recoil));e.hp=Math.max(1,e.hp-rd);e.hpShow=3;e.flash=.1;pops.push({x:e.x,y:e.y-e.sp.body-20,t:0,txt:"-"+rd+" Contrecoup"});colorBurst(e.x,e.y-10,12,FLAMEC,30,100)} R.ph="rec";R.t=0;e.cd[R.id]=SPL[R.id].cd;e.run=false;setAnim(e,"idle");e.rest=rand(.3,.8);if(!plain)colorBurst(e.x,e.y,14,PAL,30,110);else burst(e.x,e.y,16)}
    }
  }else if(R.t>=R.cfg.rec){e.rush=null}
}
// ---- Éclat Magique : canalisation mobile (la visée suit), puis un rayon long qui traverse tout et étourdit ----
function startGleam(e){
  if(e.stun>0||e.tunnel||e.rush||e.chan||e.lock>0||cdOf(e,"gleam")>0||e.shieldOn||(e.anim==="attack"&&!e.hit))return;
  if(!spendPP(e,SPL.gleam.cost))return;
  if(e===player){aiming=null;marker=null} e.moveTarget=null; gcd(e,.3);
  const f=aimAt(e,true)||FACE[e.dir];
  e.chan={t:0,fx:f[0],fy:f[1]}; setAnim(e,"guard");
  logFor(e,e.sp.name+" utilise Éclat Magique !",1600);
}
function cancelChan(e,hurt){
  e.chan=null; if(hurt)e.cd.gleam=GLEAM.cdHit; setAnim(e,"idle"); e.rest=rand(.3,.8);
  if(!hurt)logFor(e,"Éclat Magique annulé",900);
}
function updateChan(e,dt){
  const C=e.chan; C.t+=dt;
  const v=aimVec(e,true); if(v){C.fx=v[0];C.fy=v[1];e.dir=dirFromVector(v[0],v[1])}
  setAnim(e,"guard");
  const fill=clamp(C.t/GLEAM.chan,0,1), cx=e.x, cy=e.y-9;
  if(Math.random()<dt*(30+140*fill)){const a=rand(0,Math.PI*2),rad=rand(18,32)*(1.15-.35*fill),sp=rand(55,100);spark(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.8,-Math.cos(a)*sp,-Math.sin(a)*sp*.8,rad/sp,PINK[Math.floor(rand(0,5))],0,fill>.6?3:2)}
  if(fill>.7&&Math.random()<dt*14)shake=Math.max(shake,.05);
  if(C.t>=GLEAM.chan)fireBeam(e);
}
function fireBeam(e){
  const C=e.chan, t=foeOf(e); e.chan=null; e.cd.gleam=SPL.gleam.cd; e.lock=GLEAM.rec; setAnim(e,"idle");
  beams.push({x:e.x,y:e.y,fx:C.fx,fy:C.fy,len:GLEAM.len,t:0,life:.45});
  shake=.3; hitstop=.05;
  rings.push({x:e.x,y:e.y,t:0,dur:.3,max:30,c:"#ff8ec4"}); rings.push({x:e.x,y:e.y,t:0,dur:.2,max:18,c:"#ffffff"});
  for(let d=14;d<GLEAM.len;d+=10)spark(e.x+C.fx*d,e.y-8+C.fy*d*.7,rand(-12,12),rand(-30,-8),rand(.3,.6),PINK[Math.floor(rand(0,5))],-10,2);
  if(alive(t)&&!t.tunnel){
    const dx=t.x-e.x, dy=t.y-e.y, proj=dx*C.fx+dy*C.fy, perp=Math.abs(dx*C.fy-dy*C.fx);
    if(proj>6&&proj<GLEAM.len&&perp<GLEAM.half&&strike(e,t,SPL.gleam,{from:e,push:100,stun:GLEAM.stun}))colorBurst(t.x,t.y,40,PINK,80,220);
  }
}
// Lance un sort par son identifiant
function cast(e,id){
  if(e.counter||e.ko>0||vsT>0)return;
  if(id==="swap"){if(NET.guest&&e===player){NET.sendCast(id);return}startSwap(e);return}
  if(id==="flash"){if(NET.guest&&e===player)NET.sendCast(id);castFlash(e);return}
  if(!e.kit.includes(id))return;
  if(NET.guest&&e===player)NET.sendCast(id);
  SND.pe=e;SND.pend=id;
  if(SPL[id].melee)castMelee(e,id);
  else if(id==="mud"||id==="moon"||id==="fcannon"||id==="psy"||id==="grav"||id==="rslide"||id==="quake"||id==="fsight"||id==="trap"||id==="sedge"||id==="shball"||id==="tbolt"||id==="hypno"||id==="sbomb"||id==="hex"||id==="asph"||id==="wshuri"||id==="wpulse"||id==="icebeam"||id==="fwave"||id==="flame"||id==="heat"||id==="avalanche"||id==="stomp"||id==="seedbomb"||id==="megadrain"||id==="psystrike"||id==="hydrocanon")castAnim(e,id);
  else if(id==="recover")castRecover(e);
  else if(typeof GZ!=="undefined"&&GZ[id])castAnim(e,id);
  else if(id==="riposte")castRiposte(e);
  else if(id==="decoy")castDecoy(e);
  else if(SPL[id].buff)castBuff(e,id);
  else if(id==="tele")castTele(e);
  else if(id==="mburst")castBurst(e);
  else if(id==="tun")startTunnel(e);
  else if(id==="rush"||id==="ssneak"||id==="ccombat"||id==="sucker"||id==="fly"||id==="qatk"||id==="aquajet"||id==="hjk")startRush(e,id);
  else if(id==="gleam")startGleam(e);
  SND.pend=null;
}
