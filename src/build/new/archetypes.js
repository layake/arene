// ===== Archétypes : rayon instantané (defRay), vague en éventail (defWave), météores qui tombent (style "draco") =====
var RAY_DEFS=[], WAVE_DEFS=[];
const ray_h=n=>{n=(n*374761393+668265263)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967295};
// ---------- RAYON : touche instantanément la ligne devant soi, reste visible .4 s ----------
function startRay(e,d){
  const f=e.aim||FACE[e.dir], ox=e.x+f[0]*10, oy=e.y-e.sp.body+f[1]*6, t=foeOf(e);
  let len=d.reach; for(let s=14;s<=d.reach;s+=4){ if(arenaShot({x:e.x+f[0]*s,y:e.y+f[1]*s,id:d.id})){len=s;break} }
  fx.push({k:"ray",d,x:ox,y:oy,sy:e.y+.6,f,len,t:0,life:.42,seed:Math.floor(rand(0,9999))});
  logFor(e,e.sp.name+" utilise "+SPL[d.id].name+" !",1600);
  if(d.noise)synNoise(d.noise[0],d.noise[1],d.noise[2],d.noise[3],d.noise[4]||1,"bandpass");
  if(alive(t)&&!t.tunnel){
    const dx=t.x-e.x, dy=t.y-e.y, along=dx*f[0]+dy*f[1], perp=Math.abs(-dx*f[1]+dy*f[0]);
    if(along>6&&along<len+t.sp.body*.3&&perp<d.half+t.sp.body*.5){
      if(strike(e,t,SPL[d.id],{from:e,push:d.push||20})){ if(d.onHit)d.onHit(e,t); colorBurst(t.x,t.y-t.sp.body*.6,16,d.pal,40,150); rings.push({x:t.x,y:t.y,t:0,dur:.3,max:26,c:d.pal[2]}) }
    }
  }
}
const RAY_STYLE={
  // faisceau cristallin : cœur blanc, halo cyan, éclats de glace sur les bords
  ice(c,P,u,T){
    const w=Math.max(1,Math.round(5*Math.pow(1-u,.7))), f=c.f, nx=-f[1], ny=f[0], grow=Math.min(1,T/.05), L=Math.round(c.len*grow);
    [[P[0],w+4],[P[2],w+2],[P[3],w]].forEach(([col,ww],li)=>{ctx.fillStyle=col;
      for(let s=0;s<=L;s+=1){const j=Math.sin(s*.42+T*70)*(li===0?1.6:.8); ctx.fillRect(Math.round(c.x+f[0]*s+nx*j-ww/2),Math.round(c.y+f[1]*s+ny*j*.8-ww/2),ww,ww)}});
    for(let s=10;s<L;s+=9){const h=ray_h(c.seed+s), side=(h>.5?1:-1), off=(w+3+Math.round(h*4))*side, tx=c.x+f[0]*s+nx*off, ty=c.y+f[1]*s+ny*off*.8, k=2+Math.round(h*2);
      ctx.fillStyle=P[2]; ctx.fillRect(Math.round(tx-1),Math.round(ty-k),2,k*2); ctx.fillRect(Math.round(tx-k),Math.round(ty-1),k*2,2); ctx.fillStyle="#ffffff"; ctx.fillRect(Math.round(tx),Math.round(ty),1,1)}
    ctx.fillStyle=P[3]; const r=Math.round(6*(1-u)+2); for(let j=-r;j<=r;j++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));ctx.fillRect(Math.round(c.x-hw),Math.round(c.y+j),hw*2+1,1)}
    if(T>.04){const ex=c.x+f[0]*L, ey=c.y+f[1]*L; for(let i=0;i<4;i++){const a=i*1.57+T*8; ctx.fillStyle=i%2?P[2]:"#ffffff"; ctx.fillRect(Math.round(ex+Math.cos(a)*(3+u*8)),Math.round(ey+Math.sin(a)*(3+u*8)),2,2)}}
  }
};
RAY_STYLE.flash=function(c,P,u,T){ // faisceau de lumière métallique : droit, épais, pulsations qui avancent
  const f=c.f, nx=-f[1], ny=f[0], w=Math.max(2,Math.round(9*Math.pow(1-u,.6))), L=Math.round(c.len*Math.min(1,T/.04));
  [[P[4],w+6],[P[0],w+4],[P[1],w+2],["#ffffff",w]].forEach(([col,ww])=>{ctx.fillStyle=col;for(let s=0;s<=L;s++)ctx.fillRect(Math.round(c.x+f[0]*s-ww/2),Math.round(c.y+f[1]*s-ww/2),ww,ww)});
  for(let s=(T*420)%24;s<L;s+=24){ctx.fillStyle=P[2];for(let k=-(w+5);k<=w+5;k+=1)ctx.fillRect(Math.round(c.x+f[0]*s+nx*k),Math.round(c.y+f[1]*s+ny*k*.9),1,2)}
  const r=Math.round(9*(1-u)+3); ctx.fillStyle=P[2]; for(let j=-r;j<=r;j++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));ctx.fillRect(Math.round(c.x-hw),Math.round(c.y+j),hw*2+1,1)}
  ctx.fillStyle="#ffffff"; for(let j=-(r>>1);j<=(r>>1);j++){const hw=Math.round(Math.sqrt(Math.max(0,(r>>1)*(r>>1)-j*j)));ctx.fillRect(Math.round(c.x-hw),Math.round(c.y+j),hw*2+1,1)}
  if(T>.03){const ex=c.x+f[0]*L, ey=c.y+f[1]*L; for(let i=0;i<6;i++){const a=i*1.047+T*6, rr=3+u*10; ctx.fillStyle=i%2?"#ffffff":P[2]; ctx.fillRect(Math.round(ex+Math.cos(a)*rr),Math.round(ey+Math.sin(a)*rr),2,2)}}
};
function drawRay(c){const u=clamp(c.t/c.life,0,1); ctx.globalAlpha=1-u*.6; (RAY_STYLE[c.d.style]||RAY_STYLE.ice)(c,c.d.pal,u,c.t); ctx.globalAlpha=1}
function defRay(d){
  RAY_DEFS.push(d);
  if(d.desc){DESC[d.id]=d.desc; if(d.en)I18N_EXTRA[d.desc]=d.en}
  PREV[d.id]={k:"shot",len:()=>d.reach,hw:d.half,from:10};
  ACE2[d.id]={hit(e){startRay(e,d)}};
}
// ---------- VAGUE : un front qui s'étend en éventail devant soi et touche une fois ----------
function startWave(e,d){
  e.wv={d,t:0,hit:false}; e.lock=Math.max(e.lock,.25);
  fx.push({k:"hwave",e,d,s:e.wv,x:e.x,y:e.y,sy:e.y+.5,t:0,life:d.dur,f:e.aim||FACE[e.dir]});
  logFor(e,e.sp.name+" utilise "+SPL[d.id].name+" !",1600);
  if(d.noise)synNoise(d.noise[0],d.noise[1],d.noise[2],d.noise[3],d.noise[4]||1,"bandpass");
}
function waveR(d,T){return d.r0+(d.reach-d.r0)*Math.min(1,T/(d.dur*.8))}
function updateWaves(dt){
  fighters.forEach(e=>{const W=e.wv; if(!W)return; const d=W.d;
    if(!alive(e)||W.t>=d.dur){e.wv=null;return}
    W.t+=dt; const f=W.f||(W.f=e.aim||FACE[e.dir]), t=foeOf(e);
    if(!W.hit&&alive(t)&&!t.tunnel){
      const cx=e.x+f[0]*6, cy=e.y-e.sp.body*.5, dx=t.x-cx, dy=(t.y-t.sp.body*.5)-cy, dist=Math.hypot(dx,dy*1.15), r=waveR(d,W.t);
      if(dist<r+t.sp.body*.4&&dist>r-34&&(dx*f[0]+dy*f[1])/(dist||1)>=Math.cos(d.cone/2)){
        W.hit=true; if(strike(e,t,SPL[d.id],{from:e,push:d.push||30,contact:true,shieldCost:20}) && d.onHit)d.onHit(e,t);
      }
    }
  });
}
const WAVE_STYLE={
  // front de chaleur : bandes de flammes qui avancent en arc, plus chaudes devant
  fire(c,P,T,r){
    const e=c.e, f=c.f, a0=Math.atan2(f[1],f[0]), half=c.d.cone/2, cx=e.x+f[0]*6, cy=e.y-e.sp.body*.5, fr=Math.floor(T*24);
    for(let k=2;k>=0;k--){ const rr=r-k*8; if(rr<4)continue;
      for(let i=0;i<=26;i++){const g=a0-half+(half*2)*i/26, h=ray_h(i*7+k*131+fr*17), jit=(h-.5)*5, rad=rr+jit;
        const w=6-k+(h>.7?2:0), x=Math.round(cx+Math.cos(g)*rad), y=Math.round(cy+Math.sin(g)*rad*.82-k*2-(h>.8?4:0));
        ctx.fillStyle=P[k===0?3:k===1?2:1]; ctx.fillRect(x-(w>>1),y-(w>>1),w,w); if(k===0){ctx.fillStyle=P[4]; ctx.fillRect(x-1,y-1,w-3,w-3)}}}
  }
};
function drawWave2(c){const d=c.d, T=c.t, fade=T>d.dur*.75?Math.max(0,(d.dur-T)/(d.dur*.25)):1; ctx.globalAlpha=fade; (WAVE_STYLE[d.style]||WAVE_STYLE.fire)(c,d.pal,T,waveR(d,T)); ctx.globalAlpha=1}
function defWave(d){
  WAVE_DEFS.push(d);
  if(d.desc){DESC[d.id]=d.desc; if(d.en)I18N_EXTRA[d.desc]=d.en}
  PREV[d.id]={k:"shot",len:()=>d.reach,hw:Math.round(d.reach*Math.sin(d.cone/2)*.8),from:10};
  ACE2[d.id]={hit(e){startWave(e,d)}};
}
FX_DRAW.ray=drawRay; FX_DRAW.hwave=drawWave2;
FX_UPDATERS.push(updateWaves);
// ---------- capacités ----------
defRay({id:"icebeam",style:"ice",pal:["#2a78a8","#4a98c0","#98d8d8","#ffffff","#d8f4f8"],reach:215,half:9,push:20,noise:[.4,.4,3800,1400,1.6],
  onHit:(e,t)=>{t.slow=Math.max(t.slow||0,1.6)},
  desc:"Rayon de glace instantané en ligne droite. Ralentit la cible. Counter naturel de Carchacrok (Dragon/Sol).",
  en:"Instant ice beam in a straight line. Slows the target. Natural counter to Garchomp (Dragon/Ground)."});
defWave({id:"heat",style:"fire",pal:FLAMEC,reach:HEAT.range+6,r0:14,cone:Math.PI*.9,dur:.7,push:34,noise:[.6,.5,2200,700,1],
  onHit:(e,t)=>applyBurn(t,e),
  desc:"Vague de chaleur en éventail devant soi. Brûle la cible touchée.",
  en:"Fan-shaped heat wave in front of you. Burns the target hit."});
// ---------- Draco-Météore : de vrais météores qui tombent du ciel ----------
GZ.dmeteor.style="draco";
{const _gz=ZONE2D.gz; ZONE2D.gz=function(z){_gz(z); const C=GZ[z.g]; if(C.style!=="draco"||C.kind!=="impacts")return;
  const pal=gpal(z.g), now=performance.now()/1000;
  z.pts.forEach((p,i)=>{ if(p.f)return; const u=clamp(z.t/p.d,0,1); if(u<=0)return;
    const at=q=>[Math.round(p.x-70*(1-q)),Math.round(p.y-(44+90*(1-q)))], [mx,my]=at(u);
    for(let k=14;k>=1;k--){const q=Math.max(0,u-k*.014), [tx,ty]=at(q); ctx.globalAlpha=(1-k/15)*.8; ctx.fillStyle=k<4?pal[3]:k<9?pal[2]:pal[1]; const s=Math.max(1,5-Math.floor(k/3)); ctx.fillRect(tx-(s>>1),ty-(s>>1),s,s)}
    ctx.globalAlpha=1; ctx.fillStyle=pal[1]; ctx.fillRect(mx-4,my-4,9,9); ctx.fillStyle=pal[2]; ctx.fillRect(mx-3,my-3,7,7); ctx.fillStyle=pal[3]; ctx.fillRect(mx-2,my-2,4,4); ctx.fillStyle="#ffffff"; ctx.fillRect(mx-1,my-1,2,2);
  });
}}

defRay({id:"fcannon",style:"flash",pal:["#606080","#a8a8c8","#d8d8f0","#ffffff","#8090d0"],reach:PROJ.fcannon.range,half:13,push:35,noise:[.45,.5,2400,600,1.4],
  desc:"Rayon de lumière métallique instantané et puissant, droit devant soi.",
  en:"Instant powerful beam of metallic light straight ahead."});
// ---------- LIEN : un filament accroché à la cible, qui draine à chaque tick ----------
var TETHER_DEFS=[];
function startTether(e,d){
  const f=e.aim||FACE[e.dir], t=foeOf(e); let tgt=null;
  if(alive(t)&&!t.tunnel){const dx=t.x-e.x, dy=t.y-e.y, dist=Math.hypot(dx,dy*1.1); if(dist<d.reach+t.sp.body*.4&&(dx*f[0]+dy*f[1])/(dist||1)>=Math.cos(d.cone/2))tgt=t}
  e.tth={d,t:0,nt:0,tgt,len:0,dur:tgt?d.dur:.55};
  fx.push({k:"tether",e,d,s:e.tth,x:e.x,y:e.y,sy:e.y+.5,t:0,life:e.tth.dur,f});
  logFor(e,e.sp.name+" utilise "+SPL[d.id].name+(tgt?" !":" ... dans le vide"),1600);
}
function updateTethers(dt){
  fighters.forEach(e=>{const S=e.tth; if(!S)return; const d=S.d, t=S.tgt;
    if(!alive(e)||e.stun>0||e.tunnel||S.t>=S.dur){e.tth=null;return}
    S.t+=dt;
    if(!t){S.len=Math.min(d.reach*.7,S.len+d.reach*dt*4); return}
    if(!alive(t)||t.tunnel||Math.hypot(t.x-e.x,(t.y-e.y)*1.1)>d.leash){e.tth=null;pops.push({x:e.x,y:e.y-e.sp.body-30,t:0,txt:"Lien rompu"});return}
    S.nt-=dt;
    if(S.nt<=0){S.nt=d.tick;
      if(typeof obstBlock==="function"&&obstBlock(e,t,{power:d.tickPower})){e.tth=null;return}
      const hp0=t.hp, sp=Object.assign({},SPL[d.id],{power:d.tickPower});
      if(strike(e,t,sp,{from:e,dot:true,shieldCost:5})){
        const dmg=hp0-t.hp, h=Math.round(dmg*d.heal); if(h>0&&alive(e)){e.hp=Math.min(e.maxHp,e.hp+h);pops.push({x:e.x,y:e.y-e.sp.body-24,t:0,txt:"+"+h,col:"#8ae068"})}
        for(let i=0;i<3;i++){const k=Math.random();spark(t.x+(e.x-t.x)*k,t.y-t.sp.body*.5+((e.y-e.sp.body*.5)-(t.y-t.sp.body*.5))*k,0,-rand(10,40),rand(.3,.5),d.pal[2],0,2)}
      }
    }
  });
}
function drawTether(c){
  const e=c.e,S=c.s,d=c.d,T=c.t,P=d.pal; let tx,ty;
  const ox=e.x+(c.f[0])*8, oy=e.y-e.sp.body*.5;
  if(S.tgt){tx=S.tgt.x;ty=S.tgt.y-S.tgt.sp.body*.5}else{tx=ox+c.f[0]*S.len;ty=oy+c.f[1]*S.len*.9}
  const dx=tx-ox, dy=ty-oy, L=Math.max(1,Math.hypot(dx,dy)), ux=dx/L, uy=dy/L, nx=-uy, ny=ux, grow=Math.min(1,T/.12), fade=T>c.life-.15?Math.max(0,(c.life-T)/.15):1;
  ctx.globalAlpha=fade;
  [[P[0],4],[P[1],2],[P[2],1]].forEach(([col,w])=>{ctx.fillStyle=col;for(let s=0;s<=L*grow;s+=1){const k=s/L, amp=Math.sin(Math.PI*k)*5, j=Math.sin(s*.22-T*12)*amp; ctx.fillRect(Math.round(ox+ux*s+nx*j-w/2),Math.round(oy+uy*s+ny*j*.8-w/2),w,w)}});
  if(S.tgt)for(let i=0;i<5;i++){const k=1-((i/5+T*1.4)%1), s=k*L, amp=Math.sin(Math.PI*k)*5, j=Math.sin(s*.22-T*12)*amp; ctx.fillStyle=i%2?"#ffffff":P[3]; ctx.fillRect(Math.round(ox+ux*s+nx*j)-1,Math.round(oy+uy*s+ny*j*.8)-1,3,3)}
  ctx.globalAlpha=1;
}
function defTether(d){
  TETHER_DEFS.push(d);
  if(d.desc){DESC[d.id]=d.desc; if(d.en)I18N_EXTRA[d.desc]=d.en}
  PREV[d.id]={k:"shot",len:()=>d.reach,hw:Math.round(d.reach*Math.sin(d.cone/2)*.7),from:10};
  ACE2[d.id]={hit(e){startTether(e,d)}};
}
FX_DRAW.tether=drawTether;
FX_UPDATERS.push(updateTethers);
defTether({id:"megadrain",pal:["#1a6a2a","#3aa83a","#8ae068","#e8ffd0"],dur:2,tick:.25,tickPower:3,reach:115,leash:150,cone:1.2,heal:.5,
  desc:"Un filament s'accroche à la cible et l'aspire pendant 2 s : tu peux te déplacer, il se rompt si elle s'éloigne trop. Te soigne.",
  en:"A vine latches onto the target and drains it for 2 s: you can move, it breaks if the target gets too far. Heals you."});
// ---------- RAFALE : une salve de projectiles tirés à la suite, qui suivent la visée ----------
var BURST_DEFS=[];
function defBurst(d){
  BURST_DEFS.push(d);
  PROJ[d.id]={speed:d.speed,range:d.range,hit:d.hit};
  if(d.orb)ORB2[d.id]=d.orb;
  if(d.desc){DESC[d.id]=d.desc; if(d.en)I18N_EXTRA[d.desc]=d.en}
  PREV[d.id]={k:"shot",len:()=>d.range,hw:Math.round(d.range*Math.sin(d.spread/2)*.9+d.hit),from:14};
  ACE2[d.id]={hit(e){e.bst={d,t:0,n:0}; logFor(e,e.sp.name+" utilise "+SPL[d.id].name+" !",1600)}};
}
function updateBursts(dt){
  fighters.forEach(e=>{const S=e.bst; if(!S)return; const d=S.d;
    if(!alive(e)||e.stun>0||e.tunnel){e.bst=null;return}
    S.t+=dt;
    while(S.n<d.count&&S.t>=S.n*d.interval){
      const av=aimAt(e,false); if(av)e.aim=av; const f=e.aim||FACE[e.dir], a=Math.atan2(f[1],f[0])+(Math.random()-.5)*d.spread, vx=Math.cos(a), vy=Math.sin(a);
      orbs.push({x:e.x+vx*14,y:e.y+vy*14,vx,vy,trav:0,t:0,o:e,id:d.id}); S.n++;
      if(typeof sfx==="function"&&d.sfx)sfx(d.sfx,"fight",.5,.95+Math.random()*.2,e.x);
    }
    if(S.n>=d.count)e.bst=null;
  });
}
FX_UPDATERS.push(updateBursts);
SPL.icespike.power=7; SPL.icespike.cd=8; SPL.icespike.cost=0;
defBurst({id:"icespike",count:5,interval:.09,spread:.34,speed:330,range:190,hit:8,sfx:790,
  orb:o=>{const x=o.x,y=o.y-14,P=ICEC; for(let k=0;k<11;k++){const w=Math.max(1,Math.min(4,1+Math.round(k*.35))); ctx.fillStyle=k<2?"#ffffff":k<7?P[2]:P[1]; ctx.fillRect(Math.round(x-o.vx*k*1.7)-(w>>1),Math.round(y-o.vy*k*1.5)-(w>>1),w,w)} ctx.fillStyle="#ffffff"; ctx.fillRect(Math.round(x+o.vx*4)-1,Math.round(y+o.vy*3.5)-1,2,2)},
  desc:"Salve de 5 pointes de glace tirées à la suite en éventail, orientées par le curseur.",
  en:"Volley of 5 ice spikes fired in a fan, aimed by the cursor."});
