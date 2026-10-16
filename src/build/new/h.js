// ===== Lucario (Combat/Acier) et Amphinobi (Eau/Ténèbres) : mécaniques et effets =====
Object.assign(DESC,{
  icebeam:"Rayon de glace rapide. Counter naturel de Carchacrok (Dragon/Sol).",fwave:"Onde féerique en ligne droite. Counter naturel de Carchacrok (Dragon).",
  fpalm:"Frappe de la paume devant soi : rapide, ralentit la cible 1,4 s.",
  asph:"Sphère d'aura rapide qui infléchit sa course vers la cible. Difficile à esquiver de face.",
  ccombat:"Fonce, puis 3 coups en rafale (armure pendant la rafale). Baisse tes défenses 4 s. Un bouclier arrête la rafale.",
  riposte:"Posture de 1,2 s : le prochain coup reçu, même à distance, est rendu à 160 %.",
  wshuri:"Trois shurikens d'eau en éventail. Chacun touche séparément.",
  sucker:"Fonce à travers l'adversaire. Dégâts x1,6 s'il est en train de lancer un sort.",
  wpulse:"Zone d'eau qui jaillit après un court délai : dégâts et ralentit 1,8 s.",
  decoy:"Esquive éclair dans la direction visée (intouchable 0,3 s), laisse un clone et remet Coup Bas à zéro."
});
const punishable=t=>(t.anim==="attack"&&!t.hit)||(t.rush&&t.rush.ph==="chan")||!!t.chan;

// ---- Forte-Paume : onde de choc de la paume ----
ACE2.fpalm={hit(e){
  const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
  const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
  const px=bx+f[0]*reach, py=by+f[1]*reach;
  fx.push({k:"wave",x:px,y:py,sy:e.y+f[1]*reach+.01,f,t:0,pal:["#c03028","#ff8a60","#ffffff"]});
  fx.push({k:"palm",x:px,y:py,sy:e.y+f[1]*reach+.02,f,t:0,life:.3});
  colorBurst(px,py+8,10,FIGHT,40,130);
  logFor(e,e.sp.name+" utilise Forte-Paume !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16)){
    if(strike(e,t,SPL.fpalm,{from:e,push:CONF.push,contact:true})){t.slow=Math.max(t.slow,1.4);pops.push({x:t.x,y:t.y-46,t:0,txt:"Ralenti"});shake=Math.max(shake,.1)}
  }
}};
// ---- Aurasphère / Sheauriken : projectiles ----
ACE2.asph=ACE2.icebeam=ACE2.fwave={hit(e,id){fireBolt(e,id)}};
ACE2.wshuri={hit(e,id){
  const f=e.aim||FACE[e.dir];
  for(const a of [-.28,0,.28]){
    const c=Math.cos(a), s=Math.sin(a), vx=f[0]*c-f[1]*s, vy=f[0]*s+f[1]*c;
    orbs.push({x:e.x+vx*12,y:e.y+vy*12,vx,vy,trav:0,t:0,o:e,id});
  }
  colorBurst(e.x+f[0]*10,e.y-e.sp.body+6,12,WATERC,30,110);
  logFor(e,e.sp.name+" utilise Sheauriken !",1600);
}};
// L'aurasphère infléchit sa course : appelé par updateOrbs avant le déplacement.
function orbHoming(o,P,dt){
  if(!P.home)return;
  const t=foeOf(o.o); if(!alive(t)||t.tunnel)return;
  const ang=Math.atan2(o.vy,o.vx), want=Math.atan2(t.y-o.y,t.x-o.x); let d=want-ang;
  while(d>Math.PI)d-=2*Math.PI; while(d<-Math.PI)d+=2*Math.PI;
  const m=P.home*dt, a=ang+clamp(d,-m,m); o.vx=Math.cos(a); o.vy=Math.sin(a);
}
// ---- Close Combat : charge puis rafale de 5 coups ----
function beginFlurry(e,R){
  R.ph="flurry"; R.t=FLURRY.gap*.5; R.hits=0; e.run=false; e.altA=null; setAnim(e,"attack"); e.hit=true; e.cast=null;
  rings.push({x:e.x,y:e.y,t:0,dur:.3,max:26,c:"#ff8a60"}); colorBurst(e.x,e.y-8,14,FIGHT,40,140);
}
function endFlurry(e,R){
  R.ph="rec"; R.t=0; e.cd[R.id]=cdFor(e,R.id); e.run=false; setAnim(e,"idle"); e.rest=rand(.3,.8);
  e.bf.ccdown=BUFF.ccdown.dur; pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:BUFF.ccdown.label});
}
function updateFlurry(e,dt){
  const R=e.rush, t=foeOf(e); R.t+=dt;
  if(!alive(t)||t.tunnel){endFlurry(e,R);return}
  const dx=t.x-e.x, dy=t.y-e.y, d=Math.hypot(dx,dy)||1; e.dir=dirFromVector(dx,dy);
  if(e.anim!=="attack"){e.altA=null;setAnim(e,"attack");e.hit=true}
  if(d>FLURRY.reach){const m=Math.min(d-FLURRY.reach,420*dt);e.x=clampX(e.x+dx/d*m);e.y=clampY(e.y+dy/d*m)}
  if(R.t<FLURRY.gap)return;
  R.t-=FLURRY.gap; R.hits++;
  const last=R.hits>=FLURRY.n;
  const ok=strike(e,t,SPL.ccombat,{from:e,push:last?95:14,stun:last?.5:0,contact:true,shieldCost:14,mult:last?1.3:1});
  if(!ok){endFlurry(e,R);return}
  const cx=t.x+rand(-8,8), cy=t.y-t.sp.body+rand(-8,8);
  fx.push({k:"palm",x:cx,y:cy,sy:t.y+.5,f:[dx/d,dy/d],t:0,life:.26});
  fx.push({k:"star",x:cx,y:cy,sy:t.y+.7,t:0,life:.22,r:last?18:9});
  colorBurst(cx,cy+8,last?26:8,FIGHT,40,last?220:130); shake=Math.max(shake,last?.32:.07); hitstop=Math.max(hitstop,last?.1:.018);
  if(last){rings.push({x:t.x,y:t.y,t:0,dur:.4,max:44,c:"#ff8a60"});rings.push({x:t.x,y:t.y,t:0,dur:.25,max:26,c:"#ffffff"});endFlurry(e,R)}
}
// ---- Riposte : contre, plus long que Métal Burst et rend plus ----
function castRiposte(e){
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||e.lock>0||cdOf(e,"riposte")>0||e.shieldOn)return;
  if(!spendPP(e,SPL.riposte.cost))return;
  e.cd.riposte=SPL.riposte.cd; gcd(e,.4); e.moveTarget=null; e.counter={t:RIPOSTE.dur,kind:"rip"};
  rings.push({x:e.x,y:e.y,t:0,dur:.4,max:24,c:"#ff8a60"}); colorBurst(e.x,e.y-8,14,FIGHT,30,100);
  pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"Riposte !"});
  logFor(e,e.sp.name+" utilise Riposte !",1600);
}
// ---- Vibraqua : zone d'eau qui jaillit et ralentit ----
function dropWpulse(e){
  const sp=zoneSpot(e,WP.range);
  zones.push({k:"wpulse",x:sp.x,y:sp.y,t:0,o:e,done:false,delay:WP.delay});
  logFor(e,e.sp.name+" utilise Vibraqua !",1600);
}
ACE2.wpulse={hit(e){dropWpulse(e)}};
ZONE2.wpulse=(z,i,dt)=>{
  if(!z.done&&z.t>=WP.delay){
    z.done=true; const t=foeOf(z.o);
    rings.push({x:z.x,y:z.y,t:0,dur:.45,max:WP.r+14,c:"#90c8ff"}); rings.push({x:z.x,y:z.y,t:0,dur:.3,max:WP.r,c:"#ffffff"});
    fx.push({k:"pillar",x:z.x,y:z.y,sy:z.y+.5,top:84,w:WP.r*.4,t:0,life:.42,pal:["#1a4aa0","#90c8ff","#ffffff"]});
    colorBurst(z.x,z.y,28,WATERC,50,170); shake=Math.max(shake,.14);
    for(let k=0;k<18;k++){const a=rand(0,Math.PI*2),r=rand(0,WP.r);spark(z.x+Math.cos(a)*r,z.y+Math.sin(a)*r*ISO,rand(-14,14),rand(-130,-50),rand(.4,.8),WATERC[k%5],260,k%3?2:3)}
    if(alive(t)&&!t.tunnel&&gdist(t.x-z.x,t.y-z.y)<WP.r){
      if(strike(z.o,t,SPL.wpulse,{from:{x:z.x,y:z.y},push:WP.push})){t.slow=Math.max(t.slow,WP.slowT);pops.push({x:t.x,y:t.y-46,t:0,txt:"Ralenti"})}
    }
  }
  return z.t>WP.delay+.5;
};
// ---- Clonage : esquive, laisse un clone, remet Coup Bas à zéro ----
function castDecoy(e){
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||cdOf(e,"decoy")>0||e.shieldOn||e.counter)return;
  if(!spendPP(e,SPL.decoy.cost))return;
  e.cd.decoy=SPL.decoy.cd; gcd(e,.3);
  lockAim(e); const v=aimVec(e,true)||[FACE[e.dir][0],FACE[e.dir][1],DECOY.dist]; e.lockPt=null;
  const len=clamp(v[2],DECOY.min,DECOY.dist), ox=e.x, oy=e.y;
  fx.push({k:"clone",x:ox,y:oy,sy:oy-.5,t:0,life:DECOY.life,sp:e.sp,anim:e.anim,frame:e.frame,dir:e.dir});
  e.decoSeq=(e.decoSeq||0)+1; e.decoFrom={x:ox,y:oy,anim:e.anim,frame:e.frame,dir:e.dir}; DSEEN.set(e,e.decoSeq);
  colorBurst(ox,oy,16,TYPE_PAL.dark,30,110); colorBurst(ox,oy,10,WATERC,30,100); rings.push({x:ox,y:oy,t:0,dur:.3,max:22,c:"#90c8ff"});
  e.x=clampX(ox+v[0]*len); e.y=clampY(oy+v[1]*len); e.kb=null; e.moveTarget=null; if(e===player)marker=null; e.lx=e.x; e.ly=e.y; setAnim(e,"idle");
  const n=Math.max(1,Math.round(Math.hypot(e.x-ox,e.y-oy)/5));
  for(let i=0;i<n;i++){const k=i/n;spark(ox+(e.x-ox)*k,oy+(e.y-oy)*k-10,rand(-8,8),rand(-20,0),rand(.25,.5),WATERC[i%5],0,3)}
  e.inv=DECOY.inv; e.cd.sucker=0;
  rings.push({x:e.x,y:e.y,t:0,dur:.3,max:22,c:"#ffffff"}); colorBurst(e.x,e.y,14,WATERC,30,110);
  pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"Clonage !"});
  logFor(e,e.sp.name+" utilise Clonage !",1400);
}
// ---- Effets visuels ----
function drawPalm(c){
  const u=clamp(c.t/c.life,0,1), x=Math.round(c.x), y=Math.round(c.y); ctx.globalAlpha=1-u*.8;
  const r0=2+Math.round(4*u), r1=6+Math.round(13*u);
  for(let a=0;a<8;a++){const an=a*Math.PI/4+.4, ux=Math.cos(an), uy=Math.sin(an);
    pxLine(x+ux*r0,y+uy*r0,x+ux*r1,y+uy*r1,a%2?FIGHT[2]:FIGHT[3])}
  const k=Math.round(4*(1-u)); ctx.fillStyle="#ffffff"; ctx.fillRect(x-k,y-k,k*2+1,k*2+1); ctx.fillStyle=FIGHT[2]; ctx.fillRect(x-k+1,y-k+1,Math.max(1,k*2-1),Math.max(1,k*2-1));
  pixelRing(x,y,Math.round(4+10*u),FIGHT[1]); ctx.globalAlpha=1;
}
function drawClone(c){
  const s=SHT(c), a=ANF(c); if(!s.img.complete)return;
  const u=clamp(c.t/c.life,0,1), x=Math.round(snap(c.x))-a[0], y=Math.round(snap(c.y))-a[1];
  tctx.clearRect(0,0,96,96); tctx.globalCompositeOperation="source-over";
  tctx.drawImage(s.img,c.frame*s.w,c.dir*s.h,s.w,s.h,0,0,s.w,s.h);
  tctx.globalCompositeOperation="source-atop"; tctx.fillStyle=Math.floor(c.t*14)%2?"#4a8af0":"#90c8ff"; tctx.globalAlpha=.55; tctx.fillRect(0,0,s.w,s.h); tctx.globalAlpha=1; tctx.globalCompositeOperation="source-over";
  ctx.globalAlpha=.7*(1-u)*(Math.floor(c.t*30)%3?1:.6);
  const jx=Math.round((u*u)*3*Math.sin(c.t*70));
  ctx.drawImage(tmp,0,0,s.w,s.h,x+jx,y,s.w,s.h); ctx.globalAlpha=1;
}
const dsc=(x,y,r,c)=>{ctx.fillStyle=c;for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r+r-dy*dy));ctx.fillRect(x-hw,y+dy,hw*2+1,1)}};
ORB2.asph=o=>{ // sphère d'aura bleue, anneaux, étincelles en orbite et longue traînée
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14+Math.round(Math.sin(o.t*14)*1.5), pul=Math.sin(o.t*26)>0?1:0;
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-3,gy,7,1); ctx.fillRect(x-2,gy+1,5,1);
  for(let k=9;k>=1;k--){const tx=Math.round(x-o.vx*k*4), ty=Math.round(y-o.vy*k*4), w=Math.max(1,6-Math.floor(k*.55)); ctx.fillStyle=k>4?AURA[1]:AURA[2]; ctx.globalAlpha=1-k*.09; ctx.fillRect(tx-w+1,ty-w+1,w*2-1,w*2-1)}
  ctx.globalAlpha=1;
  pixelRing(x,y,10+pul,"rgba(144,208,255,.45)");
  dsc(x,y,6+pul,AURA[1]); dsc(x,y,5,AURA[2]); dsc(x,y,3,AURA[3]); ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-1,3,2);
  for(let i=0;i<3;i++){const a=o.t*11+i*2.09; ctx.fillStyle=i?AURA[3]:"#ffffff"; ctx.fillRect(Math.round(x+Math.cos(a)*9),Math.round(y+Math.sin(a)*7),2,2)}
};
ORB2.wshuri=o=>{ // shuriken d'eau qui tourne, avec gouttes derrière
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14;
  ctx.fillStyle="rgba(0,0,0,.25)"; ctx.fillRect(x-2,gy,5,1);
  for(let k=5;k>=1;k--){const tx=Math.round(x-o.vx*k*4), ty=Math.round(y-o.vy*k*4+Math.sin(o.t*40+k)*1.5); ctx.globalAlpha=.9-k*.15; ctx.fillStyle=k%2?WATERC[2]:WATERC[1]; ctx.fillRect(tx,ty,2,2)}
  ctx.globalAlpha=1;
  const ang=o.t*32;
  for(let i=0;i<4;i++){const a=ang+i*Math.PI/2, ux=Math.cos(a), uy=Math.sin(a); pxLine(x,y,x+ux*6,y+uy*6,WATERC[0]); pxLine(x+1,y,x+ux*5+1,y+uy*5,WATERC[2]); ctx.fillStyle=WATERC[3]; ctx.fillRect(Math.round(x+ux*6),Math.round(y+uy*6),1,1)}
  dsc(x,y,2,WATERC[1]); ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-1,2,2);
};
ZONE2D.wpulse=z=>{
  const x=Math.round(z.x), y=Math.round(z.y), R=WP.r, ry=Math.round(R*ISO);
  if(!z.done){
    const u=clamp(z.t/WP.delay,0,1);
    ellipseRows(x,y,R,ry,"rgba(74,138,240,"+(.15+.25*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#90c8ff");
    for(let k=0;k<3;k++){const f=(u*1.4+k/3)%1; ellipseLine(x,y,Math.max(2,Math.round(R*(1-f))),Math.max(1,Math.round(ry*(1-f))),"rgba(224,244,255,"+(.7*(1-f)).toFixed(2)+")")}
    return;
  }
  const u=clamp((z.t-WP.delay)/.5,0,1); ctx.globalAlpha=1-u;
  for(let k=0;k<3;k++){const f=clamp(u*1.2-k*.15,0,1); if(f>0)ellipseLine(x,y,Math.round(R*(.5+.7*f)),Math.max(1,Math.round(ry*(.5+.7*f))),k?"#e0f4ff":"#4a8af0")}
  ellipseRows(x,y,Math.round(R*(1-u*.5)),Math.round(ry*(1-u*.5)),"rgba(144,200,255,.25)"); ctx.globalAlpha=1;
};
// ---- IA : choix des sorts de Lucario et Amphinobi ----
function botAce(e,t,d,threat,go,ok,rnd){
  if(ok("riposte")&&threat&&d<150&&rnd(.55)){go("riposte");return true}
  if(ok("decoy")&&(threat||d<45)&&rnd(.5)){const ux=(e.x-t.x)/d, uy=(e.y-t.y)/d, sg=Math.random()<.5?-1:1; e.aimPt={wx:e.x+(ux-uy*sg*.6)*DECOY.dist,wy:e.y+(uy+ux*sg*.6)*DECOY.dist*.8}; cast(e,"decoy"); return true}
  if(ok("ccombat")&&d>30&&d<RUSHES.ccombat.dist-5&&rnd(.5)){go("ccombat",false,.12);return true}
  if(ok("sucker")&&d>25&&d<RUSHES.sucker.dist-5&&(punishable(t)||rnd(.35))){go("sucker",false,.1);return true}
  if(ok("fpalm")&&d<CONF.assist+4&&rnd(.8)){go("fpalm",true);return true}
  if(ok("wpulse")&&d<WP.range+8&&rnd(.5)){go("wpulse",false,WP.delay*.9);return true}
  if(ok("asph")&&d>45&&d<PROJ.asph.range-15&&rnd(.6)){go("asph",true,.2);return true}
  if(ok("icebeam")&&d>40&&d<PROJ.icebeam.range-15&&rnd(.6)){go("icebeam",false,.25);return true}
  if(ok("fwave")&&d>40&&d<PROJ.fwave.range-15&&rnd(.6)){go("fwave",false,.25);return true}
  if(ok("wshuri")&&d>35&&d<PROJ.wshuri.range-15&&rnd(.65)){go("wshuri",false,.25);return true}
  return false;
}
// ---- Clone d'Amphinobi vu par l'autre joueur (les effets locaux ne voyagent pas dans les instantanés) ----
const DSEEN=new WeakMap();
function watchDecoy(e){
  if(!e.decoSeq||DSEEN.get(e)===e.decoSeq)return;
  const first=!DSEEN.has(e); DSEEN.set(e,e.decoSeq);
  if(first||!NET.on||e===player||!e.decoFrom)return;
  const d=e.decoFrom; fx.push({k:"clone",x:d.x,y:d.y,sy:d.y-.5,t:0,life:DECOY.life,sp:e.sp,anim:d.anim,frame:d.frame,dir:d.dir});
  colorBurst(d.x,d.y,16,TYPE_PAL.dark,30,110); colorBurst(d.x,d.y,10,WATERC,30,100); rings.push({x:d.x,y:d.y,t:0,dur:.3,max:22,c:"#90c8ff"});
}
