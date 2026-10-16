// ===== Dracaufeu et Mammochon : mécaniques et effets =====
Object.assign(DESC,{
  flame:"Souffle un cône de flammes court devant soi. Brûle la cible 3 s.",
  fly:"S'envole puis plonge sur la cible. Intouchable pendant l'élan.",
  heat:"Zone visée qui explose puis reste en feu 2,6 s : brûle ceux qui y restent.",
  ddance:"Bonus d'Attaque et de Vitesse pendant 8 s.",
  icepunch:"Coup de poing glacé devant soi : rapide, ralentit la cible 1,4 s.",
  avalanche:"Un bloc de glace s'écrase sur la zone visée après un court délai : dégâts, recul et ralentissement.",
  stomp:"Piétine le sol : onde autour de soi qui repousse et étourdit brièvement. Pas besoin de viser.",
  iwall:"Bonus de Défense et Déf. Spé pendant 8 s."
});
function applyBurn(t,src){
  if(!alive(t)||t.tunnel)return;
  if(!(t.burn>0)){pops.push({x:t.x,y:t.y-60,t:0,txt:"Brûlé",col:"#ff9a30"});colorBurst(t.x,t.y-8,10,FLAMEC,30,110)}
  t.burn=Math.max(t.burn||0,BURN.dur); t.burnT=Math.min(t.burnT||BURN.tick,BURN.tick);
}
function tickBurn(e,dt){
  if(!(e.burn>0))return;
  if(e.ko>0){e.burn=0;return}
  e.burn-=dt; e.burnT=(e.burnT||BURN.tick)-dt;
  if(Math.random()<dt*22)spark(e.x+rand(-5,5),e.y-rand(4,e.sp.body+4),rand(-6,6),rand(-50,-25),rand(.3,.55),FLAMEC[Math.floor(rand(0,4))],-20,Math.random()<.4?3:2);
  if(e.burnT<=0){
    e.burnT+=BURN.tick;
    const dmg=Math.max(1,Math.round(e.maxHp*BURN.pct)), by=foeOf(e);
    applyDamage(e,by,e,dmg,{dot:true});
    colorBurst(e.x,e.y-8,5,FLAMEC,20,70);
  }
}
// ---- Lance-Flammes ----
ACE2.flame={hit(e){
  const f=e.aim||FACE[e.dir], bx=e.x+f[0]*8, by=e.y-e.sp.body+f[1]*4, t=foeOf(e);
  fx.push({k:"flame",x:bx,y:by,sy:e.y+f[1]*14+.01,f,t:0,life:.5});
  for(let i=0;i<18;i++){const a=rand(-.4,.4),c=Math.cos(a),s=Math.sin(a),dx=f[0]*c-f[1]*s,dy=f[0]*s+f[1]*c,v=rand(60,150);spark(bx,by,dx*v,dy*v*.7-10,rand(.25,.45),FLAMEC[Math.floor(rand(0,5))],-40,Math.random()<.4?3:2)}
  logFor(e,e.sp.name+" utilise Lance-Flammes !",1600);
  if(alive(t)&&!t.tunnel){
    const dx=t.x-bx, dy=(t.y-t.sp.body)-by, d=Math.hypot(dx,dy)||1, along=dx*f[0]+dy*f[1];
    if(d<FLAME.reach+t.sp.body*.5&&(along/d>=FLAME.cone||d<22)){
      if(strike(e,t,SPL.flame,{from:e,push:26,contact:true,shieldCost:20}))applyBurn(t,e);
    }
  }
}};
function drawFlame(c){
  const u=clamp(c.t/c.life,0,1), g=Math.min(1,u*4), fr=Math.floor(c.t*30), x0=c.x, y0=c.y, f=c.f, nx=-f[1], ny=f[0];
  ctx.globalAlpha=1-u*u;
  for(let k=0;k<26;k++){
    const q=k/26, d=6+q*FLAME.reach*g, h=((k*131+fr*977)%9)-4, sp=h*(.3+q*1.1);
    const px=Math.round(x0+f[0]*d+nx*sp), py=Math.round(y0+f[1]*d*.8+ny*sp*.8-q*5*u), w=Math.max(2,Math.round(7*(1-q*.7)));
    ctx.fillStyle=FLAMEC[q<.35?3:q<.7?2:1]; ctx.fillRect(px-(w>>1),py-(w>>1),w,w);
    if(w>3){ctx.fillStyle=FLAMEC[q<.5?4:3]; ctx.fillRect(px-1,py-1,w-2,w-2)}
  }
  ctx.globalAlpha=1;
}
// ---- Vol : élan intouchable ----
function rushHitFx(e,t,C){
  rings.push({x:t.x,y:t.y,t:0,dur:.4,max:40,c:"#d8ecff"}); rings.push({x:t.x,y:t.y,t:0,dur:.25,max:24,c:"#ffffff"});
  colorBurst(t.x,t.y-8,26,SKYC,70,200); fx.push({k:"star",x:t.x,y:t.y-t.sp.body,sy:t.y+.7,t:0,life:.4,r:16});
  shake=Math.max(shake,.3); hitstop=Math.max(hitstop,.08);
}
// ---- Canicule : zone qui explose puis reste en feu ----
ACE2.heat={hit(e){
  const sp=zoneSpot(e,HEAT.range);
  zones.push({k:"heat",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:HEAT.delay});
  logFor(e,e.sp.name+" utilise Canicule !",1600);
}};
ZONE2.heat=(z,i,dt)=>{
  const t=foeOf(z.o);
  if(!z.done&&z.t>=HEAT.delay){
    z.done=true;
    rings.push({x:z.x,y:z.y,t:0,dur:.4,max:HEAT.r+12,c:"#ff9a30"}); rings.push({x:z.x,y:z.y,t:0,dur:.25,max:HEAT.r,c:"#ffffff"});
    fx.push({k:"pillar",x:z.x,y:z.y,sy:z.y+.5,top:70,w:HEAT.r*.4,t:0,life:.4,pal:["#a01808","#ff9a30","#ffffff"]});
    colorBurst(z.x,z.y,30,FLAMEC,50,170); shake=Math.max(shake,.15);
    if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<HEAT.r){if(strike(z.o,t,SPL.heat,{from:{x:z.x,y:z.y},push:30}))applyBurn(t,z.o)}
  }
  if(z.done){
    if(Math.random()<dt*16){const a=rand(0,Math.PI*2),r=rand(0,HEAT.r);spark(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ISO,rand(-5,5),rand(-60,-25),rand(.35,.6),FLAMEC[Math.floor(rand(0,4))],-30,Math.random()<.4?3:2)}
    if(alive(t)&&!t.tunnel&&!t.inv&&gdist(t.x-z.x,t.y-z.y)<HEAT.r&&!t.shieldOn)applyBurn(t,z.o);
  }
  return z.t>HEAT.delay+HEAT.life;
};
ZONE2D.heat=z=>{
  const x=Math.round(z.x), y=Math.round(z.y), R=HEAT.r, ry=Math.round(R*ISO);
  if(!z.done){
    const u=clamp(z.t/HEAT.delay,0,1);
    ellipseRows(x,y,R,ry,"rgba(232,72,28,"+(.14+.25*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#ff9a30");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffe070");
    return;
  }
  const u=clamp((z.t-HEAT.delay)/HEAT.life,0,1), fade=clamp((1-u)/.25,0,1), now=performance.now()/1000;
  ctx.globalAlpha=fade;
  ellipseRows(x,y,R,ry,"rgba(120,20,8,.45)"); ellipseRows(x,y,Math.round(R*.7),Math.round(ry*.7),"rgba(232,72,28,.4)"); ellipseLine(x,y,R,ry,"#e8481c");
  for(let i=0;i<9;i++){
    const a=i*2.4+z.x, rr=.75*((i%3)+1)/3, fx0=Math.round(x+Math.cos(a)*R*rr), fy0=Math.round(y+Math.sin(a)*ry*rr), h=Math.round(5+4*Math.sin(now*12+i*2));
    ctx.fillStyle="#a01808"; ctx.fillRect(fx0-2,fy0-h,5,h); ctx.fillStyle="#ff9a30"; ctx.fillRect(fx0-1,fy0-h-2,3,h); ctx.fillStyle="#ffe070"; ctx.fillRect(fx0,fy0-h-3,1,Math.max(2,h-2));
  }
  ctx.globalAlpha=1;
};
// ---- Poing Glace ----
ACE2.icepunch={hit(e){
  const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
  const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
  const px=bx+f[0]*reach, py=by+f[1]*reach;
  fx.push({k:"wave",x:px,y:py,sy:e.y+f[1]*reach+.01,f,t:0,pal:["#4a98c0","#98d8d8","#ffffff"]});
  fx.push({k:"star",x:px,y:py,sy:e.y+f[1]*reach+.02,t:0,life:.32,r:12,col:"#d8f4f8"});
  colorBurst(px,py+8,12,ICEC,40,130);
  logFor(e,e.sp.name+" utilise Poing Glace !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16)){
    if(strike(e,t,SPL.icepunch,{from:e,push:CONF.push,contact:true})){t.slow=Math.max(t.slow,1.4);pops.push({x:t.x,y:t.y-46,t:0,txt:"Ralenti"})}
  }
}};
// ---- Avalanche : un bloc de glace tombe sur la zone ----
ACE2.avalanche={hit(e){
  const sp=zoneSpot(e,AVAL.range);
  zones.push({k:"aval",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:AVAL.delay});
  logFor(e,e.sp.name+" utilise Avalanche !",1600);
}};
ZONE2.aval=(z,i,dt)=>{
  if(!z.done&&z.t>=AVAL.delay){
    z.done=true; const t=foeOf(z.o);
    rings.push({x:z.x,y:z.y,t:0,dur:.45,max:AVAL.r+16,c:"#d8f4f8"}); rings.push({x:z.x,y:z.y,t:0,dur:.28,max:AVAL.r,c:"#ffffff"});
    colorBurst(z.x,z.y,34,ICEC,50,190); shake=Math.max(shake,.26); hitstop=Math.max(hitstop,.04);
    for(let k=0;k<14;k++){const a=rand(0,Math.PI*2);spark(z.x+Math.cos(a)*5,z.y-4,Math.cos(a)*rand(30,100),rand(-170,-80),rand(.35,.6),ICEC[k%5],380,3)}
    if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<AVAL.r){if(strike(z.o,t,SPL.avalanche,{from:{x:z.x,y:z.y},push:AVAL.push})){t.slow=Math.max(t.slow,AVAL.slowT);pops.push({x:t.x,y:t.y-46,t:0,txt:"Ralenti"})}}
  }
  return z.t>AVAL.delay+.5;
};
function iceBlock(x,y,s){ // bloc de glace en pixel art : losange facetté
  for(let j=-s;j<=s;j++){const hw=s-Math.abs(j)+Math.round(s*.4);ctx.fillStyle=ICEC[0];ctx.fillRect(x-hw,y+j,hw*2+1,1)}
  for(let j=-s+1;j<=s-1;j++){const hw=s-Math.abs(j)-1+Math.round(s*.4);if(hw>=0){ctx.fillStyle=ICEC[1];ctx.fillRect(x-hw,y+j,hw*2+1,1)}}
  ctx.fillStyle=ICEC[2]; ctx.fillRect(x-Math.round(s*.5),y-Math.round(s*.5),Math.max(2,Math.round(s*.5)),1); ctx.fillStyle="#ffffff"; ctx.fillRect(x-Math.round(s*.4),y-Math.round(s*.3),2,2);
}
ZONE2D.aval=z=>{
  const x=Math.round(z.x), y=Math.round(z.y), R=AVAL.r, ry=Math.round(R*ISO);
  if(!z.done){
    const u=clamp(z.t/AVAL.delay,0,1);
    ellipseRows(x,y,R,ry,"rgba(120,200,230,"+(.12+.22*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#98d8d8");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    const fall=Math.pow(1-u,1.5)*110, s=Math.round(9+3*u);
    ctx.fillStyle="rgba(0,0,0,"+(.12+.25*u).toFixed(2)+")"; const sr=Math.round(R*.5*(.4+.6*u)); ellipseRows(x,y,sr,Math.max(1,Math.round(sr*ISO)),"rgba(0,0,0,"+(.12+.25*u).toFixed(2)+")");
    ctx.fillStyle=ICEC[1]; for(let k=1;k<=4;k++)ctx.fillRect(x-1,Math.round(y-fall-s-k*4),3,2);
    iceBlock(x,Math.round(y-fall-s),s); return;
  }
  const u=clamp((z.t-AVAL.delay)/.5,0,1); ctx.globalAlpha=1-u*u;
  ellipseRows(x,y,Math.round(R*(1+.2*u)),Math.round(ry*(1+.2*u)),"rgba(216,244,248,.5)");
  iceBlock(x-8,y-4,6); iceBlock(x+9,y-3,5); iceBlock(x,y-6,8); ctx.globalAlpha=1;
};
// ---- Piétinement : onde autour de soi ----
ACE2.stomp={hit(e){
  zones.push({k:"stomp",x:e.x,y:e.y,t:0,o:e,done:false,delay:STOMP.delay});
  logFor(e,e.sp.name+" utilise Piétinement !",1600);
}};
ZONE2.stomp=(z,i,dt)=>{
  if(!z.done&&z.t>=STOMP.delay){
    z.done=true; const t=foeOf(z.o);
    rings.push({x:z.x,y:z.y,t:0,dur:.45,max:STOMP.r+10,c:"#d8c890"}); rings.push({x:z.x,y:z.y,t:0,dur:.3,max:STOMP.r*.6,c:"#ffffff"});
    colorBurst(z.x,z.y,36,["#d1a35c","#8a6030","#e8d8a0","#98d8d8","#f0e8c0"],60,190); shake=Math.max(shake,.3);
    fx.push({k:"cracks",x:z.x,y:z.y,sy:z.y-.5,t:0,life:1,rays:Array.from({length:8},(_,k)=>({a:k*Math.PI*2/8+rand(-.2,.2),len:STOMP.r*rand(.8,1.1),s:Math.floor(rand(0,9))}))});
    for(let k=0;k<12;k++){const a=rand(0,Math.PI*2),r=rand(8,STOMP.r*.8);spark(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ISO,rand(-15,15),rand(-140,-60),rand(.35,.6),["#6a5030","#8a6a3e","#b8965f"][k%3],360,3)}
    if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<STOMP.r)strike(z.o,t,SPL.stomp,{from:{x:z.x,y:z.y},push:STOMP.push,stun:STOMP.stun});
  }
  return z.t>STOMP.delay+.45;
};
ZONE2D.stomp=z=>{
  const x=Math.round(z.x), y=Math.round(z.y), R=STOMP.r, ry=Math.round(R*ISO);
  if(!z.done){
    const u=clamp(z.t/STOMP.delay,0,1);
    ellipseRows(x,y,R,ry,"rgba(138,106,48,"+(.12+.2*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#d8c890");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    return;
  }
  const u=clamp((z.t-STOMP.delay)/.45,0,1); ctx.globalAlpha=1-u; ellipseRows(x,y,Math.round(R*(1+.15*u)),Math.round(ry*(1+.15*u)),"rgba(216,200,144,.5)"); ctx.globalAlpha=1;
};
// ---- IA ----
function botAce2(e,t,d,threat,go,ok,rnd){
  const gd=gdist(t.x-e.x,t.y-e.y);
  if(ok("ddance")&&!e.bf.ddance&&d>60&&e.pp>=60&&rnd(.6)){go("ddance");return true}
  if(ok("iwall")&&!e.bf.iwall&&d<130&&e.pp>=55&&rnd(.6)){go("iwall");return true}
  if(ok("stomp")&&gd<STOMP.r-8&&rnd(.55)){go("stomp");return true}
  if(ok("fly")&&d>60&&d<RUSHES.fly.dist-8&&rnd(.5)){go("fly",false,.12);return true}
  if(ok("heat")&&d<HEAT.range+8&&rnd(.5)){go("heat",false,HEAT.delay*.8);return true}
  if(ok("avalanche")&&d<AVAL.range+8&&rnd(.5)){go("avalanche",false,AVAL.delay*.8);return true}
  if(ok("flame")&&d<FLAME.reach-6&&rnd(.85)){go("flame",true);return true}
  return false;
}

/* ===== Flash (touche F) : court cast avec destination visible, puis blink; pas de recuperation ===== */
const FLASH={dist:110,cast:.5,inv:0,cd:12,pal:["#fff6b0","#ffe060","#ffffff","#f0b020","#ffd23c"]};
function castFlash(e){
  if(e.ko>0||e.stun>0||e.tunnel||e.rush||e.chan||e.counter||e.flashC||e.lock>0||(e.anim==="attack"&&!e.hit)||cdOf(e,"flash")>0)return;
  e.cd.flash=FLASH.cd;
  const pt=e===player&&!e.bot?mouse:e.aimPt, o=e===player?foe:player;
  let dx=pt?pt.wx-e.x:o.x-e.x, dy=pt?pt.wy-e.y:o.y-e.y, d=Math.hypot(dx,dy);
  if(d<4){dx=o.x-e.x;dy=o.y-e.y;d=Math.hypot(dx,dy)||1}
  const k=Math.min(FLASH.dist,d)/d;
  e.shieldOn=false; e.moveTarget=null; if(e===player)marker=null; e.lock=FLASH.cast+.02;
  e.flashC={t:0,x:clampX(e.x+dx*k),y:clampY(e.y+dy*k)};
  rings.push({x:e.x,y:e.y,t:0,dur:.3,max:14,c:"#ffe060"});
  SND.pe=e;SND.pend="tele";
}
function tickFlash(e,dt){
  const F=e.flashC; if(!F)return;
  if(e.ko>0||e.stun>0){e.flashC=null;e.lock=0;return}
  F.t+=dt; if(F.t<FLASH.cast)return;
  e.flashC=null; e.lock=0;
  const ox=e.x, oy=e.y;
  for(let i=0;i<=8;i++){const f=i/8; colorBurst(ox+(F.x-ox)*f,oy+(F.y-oy)*f,3,FLASH.pal,12,60)}
  rings.push({x:ox,y:oy,t:0,dur:.3,max:20,c:"#ffe060"});
  e.x=F.x; e.y=F.y; e.kb=null; e.moveTarget=null; if(e===player)marker=null; e.lx=e.x; e.ly=e.y; setAnim(e,"idle");
  e.inv=Math.max(e.inv||0,FLASH.inv);
  colorBurst(e.x,e.y,22,FLASH.pal,28,120); rings.push({x:e.x,y:e.y,t:0,dur:.35,max:26,c:"#ffffff"});
  logFor(e,e.sp.name+" utilise Flash !",900);
}
function drawFlashMark(e){
  const F=e.flashC; if(!F)return;
  const x=Math.round(F.x), y=Math.round(F.y), u=clamp(F.t/FLASH.cast,0,1), R=9, ry=Math.round(R*ISO), blink=Math.floor(performance.now()/60)%2;
  ellipseRows(x,y,R,ry,"rgba(255,224,96,"+(.12+.25*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,blink&&u>.6?"#ffffff":"#ffd23c");
  ellipseLine(x,y,Math.max(2,Math.round(R*(1-u)*1.6)),Math.max(1,Math.round(ry*(1-u)*1.6)),"#fff6b0");
}
