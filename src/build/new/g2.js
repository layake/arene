// ===== Dessin =====
let last=performance.now();
function ellipseRows(cx,cy,rx,ry,col){ctx.fillStyle=col;for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry+.01))));ctx.fillRect(cx-w,cy+dy,w*2+1,1)}}
function ellipseLine(cx,cy,rx,ry,col){ctx.fillStyle=col;for(let a=0;a<Math.PI*2;a+=1/Math.max(rx,4))ctx.fillRect(Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry),1,1)}
function drawShield(e){
  const gx=snap(e.x), gy=snap(e.y), sc=e.sp.body/16; // sous-pixel comme le sprite, pour que les surcouches ne glissent pas
  if(e.shieldOn){
    const cx=gx, cy=gy-(e.anim==="guard"?e.sp.body*.8:e.sp.body), r=Math.max(4,Math.round((14+7*e.shieldE/100)*sc*clamp(.55+(e.shieldT||0)/.15,0,1))), pulse=Math.floor(performance.now()/110)%2;
    ctx.fillStyle="rgba(150,225,255,.16)";
    for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r-dy*dy));ctx.fillRect(cx-hw,cy+dy,hw*2+1,1)}
    pixelRing(cx,cy,r-1,"rgba(150,225,255,.35)");
    pixelRing(cx,cy,r,pulse?"#c4f0ff":"#9fe3ff");
    ctx.fillStyle="rgba(255,255,255,.9)";
    for(let d=200;d<=250;d+=10){const t=d*Math.PI/180;ctx.fillRect(Math.round(cx+Math.cos(t)*(r-3)),Math.round(cy+Math.sin(t)*(r-3)),1,1)}
  }
  if(e.stun>0&&e.dizzy){
    const t=performance.now()/180, hy=gy-e.sp.body-14;
    for(let i=0;i<3;i++){const a=t+i*2.094, sx=gx+Math.round(Math.cos(a)*8), sy=hy+Math.round(Math.sin(a)*3);
      ctx.fillStyle="#ffe24a";ctx.fillRect(sx-1,sy,3,1);ctx.fillRect(sx,sy-1,1,3);ctx.fillStyle="#fff7c2";ctx.fillRect(sx,sy,1,1)}
  }
  if(e.shieldOn||e.shieldE<100){
    ctx.fillStyle="#14171c"; ctx.fillRect(gx-10,gy+7,21,4);
    ctx.fillStyle="#3a4048"; ctx.fillRect(gx-9,gy+8,19,2);
    ctx.fillStyle=e.shieldBroken?"#e0503c":"#6fd0ff"; ctx.fillRect(gx-9,gy+8,Math.round(19*e.shieldE/100),2);
  }
}
function drawOrb(o){
  if(ORB2[o.id]){ORB2[o.id](o);return}
  if(o.id==="mud"){drawMud(o);return}
  const OPS={fcannon:["#606080","#a8a8c8","#d8d8f0","#ffffff","#8090d0"],shball:["#201030","#705898","#a070d8","#2a1840","#0e0618"],tbolt:["#c09010","#f8d030","#f8d030","#fff080","#ffffff"],hypno:["#a040a0","#e0a0ff","#a070d8","#f0c0ff","#ffffff"]};
  const OP=OPS[o.id]||["#a0409a","#d870b8","#b0409a","#ff8ec4","#ffc2e0"];
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14+Math.round(Math.sin(o.t*18));
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-3,gy,7,1); ctx.fillRect(x-2,gy+1,5,1);
  for(let k=3;k>=1;k--){const tx=Math.round(x-o.vx*k*5), ty=Math.round(y-o.vy*k*5); ctx.fillStyle=k===3?OP[0]:OP[1]; const w=4-k; ctx.fillRect(tx-w+1,ty-w+1,w*2-1,w*2-1)}
  const disc=(r,c)=>{ctx.fillStyle=c;for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r+r-dy*dy));ctx.fillRect(x-hw,y+dy,hw*2+1,1)}};
  if(o.id==="hypno"){ // grosse orbe lente, deux anneaux qui tournent
    const R2=Math.round(6+2*Math.sin(o.t*8));
    disc(R2,OP[2]); disc(R2-2,OP[1]); disc(2,"#ffffff");
    pixelRing(x,y,R2+3,"rgba(224,160,255,.7)"); pixelRing(x,y,R2+6,"rgba(224,160,255,.35)");
    return;
  }
  if(o.id==="tbolt"){ // éclair en zigzag qui crépite, avec étincelles
    const nx=-o.vy, ny=o.vx, fr=Math.floor(o.t*36); let prev=null;
    for(let k=0;k<=34;k+=2){
      const h=((k*131+fr*977)%7)-3, px=Math.round(x-o.vx*k+nx*h*(k>0?.9:0)), py=Math.round(y-o.vy*k+ny*h*(k>0?.9:0)), w=k<6?3:2;
      if(prev){const n=Math.max(Math.abs(px-prev[0]),Math.abs(py-prev[1]));ctx.fillStyle="#c09010";for(let i=0;i<=n;i++)ctx.fillRect(Math.round(prev[0]+(px-prev[0])*i/Math.max(1,n))-1,Math.round(prev[1]+(py-prev[1])*i/Math.max(1,n))-1,w+1,w+1);
        ctx.fillStyle="#fff080";for(let i=0;i<=n;i++)ctx.fillRect(Math.round(prev[0]+(px-prev[0])*i/Math.max(1,n)),Math.round(prev[1]+(py-prev[1])*i/Math.max(1,n)),w,w)}
      prev=[px,py];
    }
    ctx.fillStyle="#ffffff"; ctx.fillRect(x-1,y-1,3,3);
    disc(4,OP[1]); disc(2,"#ffffff"); return;
  }
  if(o.id==="fcannon"){ // grosse boule de lumière argentée, rayons en croix et longue traînée
    for(let k=8;k>=1;k--){const tx=Math.round(x-o.vx*k*4), ty=Math.round(y-o.vy*k*4), w=Math.max(1,6-Math.floor(k*.6)); ctx.fillStyle=k>4?OP[2]:OP[3]; ctx.globalAlpha=1-k*.07; ctx.fillRect(tx-w+1,ty-w+1,w*2-1,w*2-1)}
    ctx.globalAlpha=1; disc(7,OP[2]); disc(5,OP[3]); disc(3,"#ffffff");
    const r=Math.round(9+2*Math.sin(o.t*30)); ctx.fillStyle=OP[3]; ctx.fillRect(x-r,y,r*2+1,1); ctx.fillRect(x,y-r,1,r*2+1);
    return;
  }
  disc(5,OP[2]); disc(4,OP[3]); disc(3,OP[4]);
  ctx.fillStyle="#ffffff"; ctx.fillRect(x-2,y-2,2,1); ctx.fillRect(x-1,y-1,1,1);
}
function drawWave(c){
  const u=clamp(c.t/.3,0,1), r=5+13*u, x=Math.round(c.x), y=Math.round(c.y);
  ctx.globalAlpha=1-u;
  const pal=c.pal||["#7030c0","#e0a0ff","#ffffff"];
  pixelRing(x,y,Math.round(r+2),pal[0]); pixelRing(x,y,Math.round(r),pal[1]); pixelRing(x,y,Math.round(r-2),pal[2]);
  ctx.globalAlpha=1;
}
// Flèches de bonus de stat (comme dans les jeux) : des chevrons qui montent autour du lanceur
function drawUp(c){
  const u=clamp(c.t/c.life,0,1), x0=Math.round(c.x), P=c.pal; ctx.globalAlpha=Math.min(1,(1-u)*1.6);
  [-9,0,9].forEach((dx,col)=>{for(let i=0;i<3;i++){
    const f=(u*1.4+i*.28+col*.11)%1, y=Math.round(c.y-4-f*(c.h+10)), x=x0+dx;
    ctx.fillStyle=P[1]; for(let k=0;k<=3;k++){ctx.fillRect(x-k,y+k,1,2);ctx.fillRect(x+k,y+k,1,2)}
    ctx.fillStyle=P[2]; ctx.fillRect(x,y,1,2);
  }});
  ctx.globalAlpha=1;
}
// Colonne de lumière verticale (Prescience, Téléport, Psyko)
function drawPillar(c){
  const u=clamp(c.t/c.life,0,1), w=Math.max(1,Math.round(c.w*(1-u))), x=Math.round(c.x), y1=Math.round(c.y), y0=y1-c.top;
  ctx.globalAlpha=.85*(1-u*u);
  ctx.fillStyle=c.pal[0]; ctx.fillRect(x-w-2,y0,w*2+5,y1-y0);
  ctx.fillStyle=c.pal[1]; ctx.fillRect(x-w,y0,w*2+1,y1-y0);
  ctx.fillStyle="#ffffff"; ctx.fillRect(x-Math.max(0,w-3),y0,Math.max(0,w-3)*2+1,y1-y0);
  ctx.globalAlpha=1;
}
// Fissures au sol (Séisme)
function drawCracks(c){
  const u=clamp(c.t/c.life,0,1), g=Math.min(1,c.t/.15); ctx.globalAlpha=1-u*u;
  c.rays.forEach(r=>{
    let px=c.x, py=c.y; const n=Math.round(r.len*g/4);
    for(let i=0;i<n;i++){const j=((i*7+r.s)%5-2)*.5, a=r.a+j*.35; const nx=px+Math.cos(a)*4, ny=py+Math.sin(a)*4*ISO;
      ctx.fillStyle="#2a1c08"; ctx.fillRect(Math.round(nx),Math.round(ny),2,1); ctx.fillStyle="#6a5030"; ctx.fillRect(Math.round(nx),Math.round(ny)+1,1,1); px=nx; py=ny}
  });
  ctx.globalAlpha=1;
}
// Étincelle en étoile à quatre branches (reflet métallique)
function drawStar(c){
  const u=clamp(c.t/c.life,0,1), L=Math.round((c.r||9)*Math.sin(Math.PI*Math.min(1,u*1.1))), x=Math.round(c.x), y=Math.round(c.y);
  ctx.globalAlpha=1-u*u; ctx.fillStyle=c.col||"#ffffff";
  ctx.fillRect(x-L,y,L*2+1,1); ctx.fillRect(x,y-L,1,L*2+1);
  const d=Math.round(L*.5); ctx.fillStyle="#d8d8f0"; for(let i=1;i<=d;i++){ctx.fillRect(x-i,y-i,1,1);ctx.fillRect(x+i,y-i,1,1);ctx.fillRect(x-i,y+i,1,1);ctx.fillRect(x+i,y+i,1,1)}
  ctx.globalAlpha=1;
}
function drawFx(c){if(c.k==="star")return drawStar(c);if(c.k==="palm")return drawPalm(c);if(c.k==="flame")return drawFlame(c);if(c.k==="clone")return drawClone(c);if(c.k==="wave")drawWave(c);else if(c.k==="up")drawUp(c);else if(c.k==="pillar")drawPillar(c);else if(c.k==="cracks")drawCracks(c);else drawClaw(c)}
// Rocher en pixel art : disque ombré, arêtes claires en haut à gauche, fissures
function boulder(x,y,r,rot){
  const disc=(rr,dx,dy,c)=>{ctx.fillStyle=c;for(let j=-rr;j<=rr;j++){const hw=Math.round(Math.sqrt(rr*rr+rr-j*j));ctx.fillRect(x+dx-hw,y-rr+dy+j,hw*2+1,1)}};
  disc(r,0,0,"#3c3220"); disc(r-1,0,0,"#6a5a3a"); disc(r-2,-1,-1,"#8a7a50"); disc(Math.round(r*.45),-2,-2,"#b8a878");
  ctx.fillStyle="#3c3220"; const a=rot*.4; ctx.fillRect(x+Math.round(Math.cos(a)*2),y-4,1,5); ctx.fillRect(x+Math.round(Math.cos(a)*2)+1,y+1,3,1);
  ctx.fillStyle="#e8e0b0"; ctx.fillRect(x-3,y-r+2,2,1);
}
function drawZone(z){
  if(ZONE2D[z.k]){ZONE2D[z.k](z);return}
  if(z.k==="sbomb"){
    const x=Math.round(z.x), y=Math.round(z.y), R=SB.r, ry=Math.round(R*ISO), u=clamp(z.t/SB.delay,0,1);
    ellipseRows(x,y,R,ry,"rgba(160,64,160,"+(.12+.2*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#d070d0");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    const fall=Math.pow(1-u,1.4)*80, bx=x, by=Math.round(y-fall-6); // la bombe retombe du ciel
    const sr=Math.round(R*.45*(.4+.6*u)); ellipseRows(x,y,sr,Math.max(1,Math.round(sr*ISO)),"rgba(0,0,0,"+(.15+.25*u).toFixed(2)+")");
    const gd=(rr,c)=>{ctx.fillStyle=c;for(let j=-rr;j<=rr;j++){const hw=Math.round(Math.sqrt(rr*rr+rr-j*j));ctx.fillRect(bx-hw,by+j,hw*2+1,1)}};
    ctx.fillStyle="#a040a0"; for(let k=1;k<=4;k++)ctx.fillRect(bx-1,by-6-k*3,3,2); // traînée
    gd(7,"#401050"); gd(6,"#a040a0"); gd(4,"#d070d0"); ctx.fillStyle="#80e060"; ctx.fillRect(bx+1,by+1,3,2); ctx.fillRect(bx-4,by+3,2,2); ctx.fillStyle="#ffffff"; ctx.fillRect(bx-3,by-4,2,2);
    return;
  }
  if(z.k==="pois"){
    const x=Math.round(z.x), y=Math.round(z.y), R=SB.r, ry=Math.round(R*ISO), fade=clamp((SB.life-z.t)/.6,0,1), now=performance.now()/1000;
    ctx.globalAlpha=fade;
    ellipseRows(x,y,R,ry,"rgba(96,24,112,.5)"); ellipseRows(x,y,Math.round(R*.7),Math.round(ry*.7),"rgba(160,64,160,.45)"); ellipseLine(x,y,R,ry,"#a040a0");
    for(let i=0;i<5;i++){const a=i*1.7+z.x, f=(now*.7+i*.2)%1, bx=Math.round(x+Math.cos(a)*R*.6*(1-f*.3)), by=Math.round(y+Math.sin(a)*ry*.6-f*8); ctx.fillStyle=i%2?"#80e060":"#d070d0"; ctx.fillRect(bx,by,2,2); ctx.fillStyle="#ffffff"; ctx.fillRect(bx,by,1,1)}
    ctx.globalAlpha=1; return;
  }
  if(z.k==="hex"){
    const x=Math.round(z.x), y=Math.round(z.y), R=HX.r, ry=Math.round(R*ISO), u=clamp(z.t/HX.delay,0,1);
    if(z.done)return;
    ellipseRows(x,y,R,ry,"rgba(42,24,64,"+(.2+.3*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,Math.floor(performance.now()/70)%2&&u>.7?"#ffffff":"#b090d8");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    // flammes spectrales qui montent sur le pourtour
    const nowt=performance.now()/1000;
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7+nowt*.8, fx0=Math.round(x+Math.cos(a)*(R-3)*u), fy0=Math.round(y+Math.sin(a)*(ry-1)*u), h=Math.round((4+5*u)*(.6+.4*Math.sin(nowt*14+i*2)));
      ctx.fillStyle="#2a1840"; ctx.fillRect(fx0-2,fy0-h,5,h); ctx.fillStyle="#705898"; ctx.fillRect(fx0-1,fy0-h-2,3,h); ctx.fillStyle="#e0c8ff"; ctx.fillRect(fx0,fy0-h-3,1,Math.max(2,h-2));
    }
    return;
  }
  if(z.k==="rock"||z.k==="quake"){
    const Q=z.k==="quake", R=Q?QUAKE.r:RS.r, dl=Q?QUAKE.delay:z.delay, x=Math.round(z.x), y=Math.round(z.y), ry=Math.round(R*.55), u=clamp(z.t/dl,0,1);
    if(z.done){
      const v=clamp((z.t-dl)/(Q?.45:.35),0,1);ctx.globalAlpha=1-v;ellipseRows(x,y,Math.round(R*(1+.15*v)),Math.round(ry*(1+.15*v)),"rgba(216,200,144,.5)");
      if(!Q){ctx.globalAlpha=1-v*v; boulder(x,y-1,10,0)} // le rocher reste un instant au sol
      ctx.globalAlpha=1;return}
    const blink=u>.7&&Math.floor(performance.now()/70)%2;
    ellipseRows(x,y,R,ry,"rgba(138,106,48,"+(.16+.24*u).toFixed(2)+")");
    ellipseLine(x,y,R,ry,blink?"#ffffff":"#d8c890");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    if(Q){ctx.fillStyle="#3a2a10";for(let i=0;i<8;i++){const a=i*Math.PI/4+.3, l=u*R*.9;for(let d=4;d<l;d+=3)ctx.fillRect(Math.round(x+Math.cos(a)*d),Math.round(y+Math.sin(a)*d*.55+((d>>2)%2)),1,1)}}
    else{ // gros rocher qui tombe du ciel, son ombre grandit au sol
      const fall=Math.pow(1-u,1.6)*90, sr=Math.round(R*.5*(.4+.6*u));
      ellipseRows(x,y,sr,Math.max(1,Math.round(sr*ISO)),"rgba(0,0,0,"+(.15+.25*u).toFixed(2)+")");
      boulder(x,Math.round(y-fall-2),10,Math.round(u*10));
    }
    return;
  }
  if(z.k==="fs"){
    const x=Math.round(z.x), y=Math.round(z.y), R=FS.r, ry=Math.round(R*ISO), u=clamp(z.t/FS.delay,0,1);
    if(z.done){const v=clamp((z.t-FS.delay)/.45,0,1);ctx.globalAlpha=1-v;ellipseRows(x,y,Math.round(R*(1+.2*v)),Math.round(ry*(1+.2*v)),"rgba(255,176,224,.55)");ctx.globalAlpha=1;return}
    const blink=u>.8&&Math.floor(performance.now()/70)%2;
    ellipseRows(x,y,R,ry,"rgba(240,96,168,"+(.1+.22*u).toFixed(2)+")"); ellipseLine(x,y,R,ry,blink?"#ffffff":"#ffb0e0");
    ellipseLine(x,y,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
    const sp=performance.now()/500; ctx.fillStyle="#ffd0f0";
    for(let i=0;i<5;i++){const a=sp+i*Math.PI*2/5;ctx.fillRect(Math.round(x+Math.cos(a)*(R-4)),Math.round(y+Math.sin(a)*(ry-2)),2,1)}
    return;
  }
  if(z.k==="trap"){
    const x=Math.round(z.x), y=Math.round(z.y), R=TRAP.r, ry=Math.round(R*ISO), armed=z.t>=TRAP.arm, fade=clamp((TRAP.life-z.t)/.8,0,1);
    ctx.globalAlpha=fade*(armed?1:.5);
    ellipseRows(x,y,R,ry,"rgba(138,106,48,.22)"); ellipseLine(x,y,R,ry,armed?"#d8c890":"rgba(216,200,144,.6)");
    [[-9,0,5],[8,-1,4],[0,3,5],[-3,-3,4],[11,3,3]].forEach(([dx,dy,h])=>{ctx.fillStyle="#6a5a30";ctx.fillRect(x+dx-1,y+dy-h,3,h);ctx.fillStyle="#d8c890";ctx.fillRect(x+dx,y+dy-h-1,1,2);ctx.fillRect(x+dx-1,y+dy-h+1,1,1)});
    ctx.globalAlpha=1; return;
  }
  if(z.k==="edge"){
    const u=clamp(z.t/EDGE.delay,0,1), pts=edgePts(z.x,z.y,z.f);
    if(!z.done){
      const blink=u>.7&&Math.floor(performance.now()/70)%2;
      pts.forEach((p,k)=>{if(k%2)return;const x=Math.round(p.x), y=Math.round(p.y); ellipseRows(x,y,EDGE.half,Math.round(EDGE.half/1.3),"rgba(138,106,48,"+(.1+.2*u).toFixed(2)+")")});
      pts.forEach((p,k)=>{if(k%3)return;ellipseLine(Math.round(p.x),Math.round(p.y),EDGE.half,Math.round(EDGE.half/1.3),blink?"#ffffff":"rgba(216,200,144,.8)")});
    }else{
      const v=clamp((z.t-EDGE.delay)/.5,0,1);ctx.globalAlpha=1-v*v;
      pts.forEach((p,k)=>{if(k%2)return;const x=Math.round(p.x), y=Math.round(p.y), h=Math.round(18*Math.min(1,(z.t-EDGE.delay)*10+.3)*(1-.3*((k/2)%2)));
        ctx.fillStyle="#4a3a20";ctx.fillRect(x-3,y-Math.round(h*.4),7,Math.round(h*.4));ctx.fillStyle="#6a5a30";ctx.fillRect(x-2,y-Math.round(h*.7),5,Math.round(h*.7));
        ctx.fillStyle="#b8a038";ctx.fillRect(x-1,y-h,3,h);ctx.fillStyle="#e8e0b0";ctx.fillRect(x,y-h-2,1,h);ctx.fillRect(x-1,y-Math.round(h*.5),1,Math.round(h*.4))});
      ctx.globalAlpha=1;
    }
    return;
  }
  if(z.k==="grav"){
    const x=Math.round(z.x), y=Math.round(z.y), R=GRAV.r, ry=Math.round(R*.55), u=clamp(z.t/GRAV.delay,0,1), fade=clamp((GRAV.delay+GRAV.life-z.t)/.4,0,1)*u;
    ctx.globalAlpha=fade;
    ellipseRows(x,y,R,ry,"rgba(40,10,70,.35)"); ellipseRows(x,y,Math.round(R*.55),Math.round(ry*.55),"rgba(15,0,30,.55)"); ellipseRows(x,y,Math.round(R*.22),Math.max(1,Math.round(ry*.22)),"#05000c");
    ellipseLine(x,y,R,ry,"#b060ff"); ellipseLine(x,y,Math.round(R*.55),Math.round(ry*.55),"#7030c0");
    const sp=-performance.now()/380; ctx.fillStyle="#e0a0ff";
    for(let i=0;i<10;i++){const f=((i/10+z.t*.6)%1), r=1-f, a=sp+i*.9+f*3; ctx.fillRect(Math.round(x+Math.cos(a)*R*r),Math.round(y+Math.sin(a)*ry*r),2,1)}
    ctx.globalAlpha=1; return;
  }
  const x=Math.round(z.x), y=Math.round(z.y), rx=PSY.r, ry=Math.round(PSY.r*.55), u=clamp(z.t/PSY.delay,0,1);
  if(z.done){
    const v=clamp((z.t-PSY.delay)/.4,0,1); ctx.globalAlpha=1-v;
    ellipseRows(x,y,Math.round(rx*(1+.2*v)),Math.round(ry*(1+.2*v)),"rgba(240,200,255,.55)"); ctx.globalAlpha=1; return;
  }
  const blink=u>.7&&Math.floor(performance.now()/70)%2;
  ellipseRows(x,y,rx,ry,"rgba(176,96,255,"+(.14+.2*u).toFixed(2)+")");
  ellipseLine(x,y,rx,ry,blink?"#ffffff":"#e0a0ff");
  ellipseLine(x,y,Math.max(2,Math.round(rx*(1-u))),Math.max(1,Math.round(ry*(1-u))),"#ffffff");
  const sp=performance.now()/260; ctx.fillStyle="#f0d0ff";
  for(let i=0;i<4;i++){const a=sp+i*Math.PI/2;ctx.fillRect(Math.round(x+Math.cos(a)*(rx-3)),Math.round(y+Math.sin(a)*(ry-1)),2,1)}
}
function drawBeam(b){
  const u=clamp(b.t/b.life,0,1), w=Math.max(1,Math.round(9*(1-u))), ox=b.x, oy=b.y-8;
  ctx.globalAlpha=1-u*.5;
  [["#b0409a",w+4],["#ff8ec4",w+2],["#ffffff",w]].forEach(([col,ww])=>{ctx.fillStyle=col;for(let d=0;d<=b.len;d++)ctx.fillRect(Math.round(ox+b.fx*d-ww/2),Math.round(oy+b.fy*d-ww/2),ww,ww)});
  ctx.globalAlpha=1;
}
function drawEntity(e){
  if(e.gone)return; // éliminé en mêlée générale
  if(e.swapC&&!e.tunnel){drawSwap(e);return}
  if(e.tunnel){drawTunnelSprite(e);return}
  if(e.ko>0&&Math.floor(e.ko*12)%2)return;
  const s=SHT(e), a=ANF(e), lift=(e.rush&&e.rush.cfg&&e.rush.cfg.fly&&e.rush.ph==="dash")?14:0, x=snap(e.x)-a[0], y=snap(e.y)-a[1]-lift;
  if(!s.img.complete)return;
  if(e.rush&&e.rush.cfg&&e.rush.cfg.ghost)ctx.globalAlpha=.4+.1*Math.sin(performance.now()/40);
  else if(e.sleep&&Math.floor(performance.now()/500)%2)ctx.globalAlpha=.85;
  if(e.hover){
    tctx.clearRect(0,0,96,96); tctx.globalCompositeOperation="source-over";
    tctx.drawImage(s.img,e.frame*s.w,e.dir*s.h,s.w,s.h,0,0,s.w,s.h);
    tctx.globalCompositeOperation="source-atop"; tctx.fillStyle="#ff4a3d"; tctx.fillRect(0,0,s.w,s.h); tctx.globalCompositeOperation="source-over";
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(([ox,oy])=>ctx.drawImage(tmp,0,0,s.w,s.h,x+ox,y+oy,s.w,s.h));
  }
  if(e.flash>0){
    tctx.clearRect(0,0,96,96); tctx.globalCompositeOperation="source-over";
    tctx.drawImage(s.img,e.frame*s.w,e.dir*s.h,s.w,s.h,0,0,s.w,s.h);
    tctx.globalCompositeOperation="source-atop"; tctx.fillStyle="#ffffff"; tctx.fillRect(0,0,s.w,s.h); tctx.globalCompositeOperation="source-over";
    ctx.drawImage(tmp,0,0,s.w,s.h,x,y,s.w,s.h);
  }else ctx.drawImage(s.img,e.frame*s.w,e.dir*s.h,s.w,s.h,x,y,s.w,s.h);
  ctx.globalAlpha=1;
  if(e.fighter)drawShield(e);
  if(e.hat){const hd=T_HEAD[e.anim][e.dir][e.frame];ctx.drawImage(hatImg,x+hd[0]-4,y+hd[1]-14)}
  if(e.hp>0){
    const bx=snap(e.x)-9, by=snap(e.y)-e.sp.bar, w=Math.round(16*e.hp/e.maxHp);
    ctx.fillStyle="#14171c"; ctx.fillRect(bx,by,18,4);
    ctx.fillStyle="#3a4048"; ctx.fillRect(bx+1,by+1,16,2);
    ctx.fillStyle=e.hp/e.maxHp>.5?"#6fd35a":e.hp/e.maxHp>.25?"#f0c040":"#e0503c"; ctx.fillRect(bx+1,by+1,w,2);
    if(false){ // barre de PP (retiree) : plus étroite, juste dessous
      ctx.fillStyle="#14171c"; ctx.fillRect(bx+2,by+3,14,3);
      ctx.fillStyle="#2a3050"; ctx.fillRect(bx+3,by+4,12,1);
      ctx.fillStyle="#7b8cff"; ctx.fillRect(bx+3,by+4,Math.round(12*clamp(e.pp/PP_MAX,0,1)),1);
    }
  }
}
function drawTelegraph(e){
  const A=e.ai&&e.ai.atk; if(!A||A.ph!=="wind")return;
  const gx=Math.round(snap(e.x)), gy=Math.round(snap(e.y))-e.sp.body-22;
  ctx.fillStyle="#14171c"; ctx.fillRect(gx-2,gy-6,5,9); ctx.fillStyle="#e0503c"; ctx.fillRect(gx-1,gy-5,3,5); ctx.fillRect(gx-1,gy+1,3,1);
  if(Math.floor(performance.now()/90)%2){ctx.fillStyle="rgba(224,80,60,.55)";for(let d=10;d<=TURT.dist;d+=4)ctx.fillRect(Math.round(snap(e.x)+A.fx*d),Math.round(snap(e.y)+A.fy*d),1,1)}
}
function axis(pos,view,world){const v=view>=world?-(view-world)/2:Math.max(0,Math.min(world-view,pos-view/2));return Math.round(v*PX)/PX}
const snap=v=>Math.round(v*PX)/PX;
// Aperçu de visée, comme dans LoL : la forme montrée est exactement la zone qui touche.
// melee : cercles de portée ; shot : couloir du projectile ; dash : trajet puis cercle d'arrivée ; zone : cercle de portée + zone visée ; slide : trois zones ; burst : cercle autour du lanceur.
const PREV={
  claw:{k:"melee",r:14,d:[20,32]},conf:{k:"melee",r:16,d:[22,CONF.reach]},ihead:{k:"melee",r:16,d:[IRON.step+22,IRON.step+IRON.reach]},
  mud:{k:"shot",len:()=>PROJ.mud.range,hw:PROJ.mud.hit,from:14},moon:{k:"shot",len:()=>PROJ.moon.range,hw:PROJ.moon.hit,from:14},
  rush:{k:"shot",len:v=>rushLen(v,RUSHES.rush),hw:RUSH.hit,from:0},gleam:{k:"shot",len:()=>GLEAM.len,hw:GLEAM.half,from:0},
  tun:{k:"dash",len:()=>TUNNEL.dist,r:TUNNEL.radius},
  psy:{k:"zone",Z:PSY},sbomb:{k:"zone",Z:SB},hex:{k:"zone",Z:HX},scl:{k:"melee",r:16,d:[22,CONF.reach]},shball:{k:"shot",len:()=>PROJ.shball.range,hw:PROJ.shball.hit,from:14},tbolt:{k:"shot",len:()=>PROJ.tbolt.range,hw:PROJ.tbolt.hit,from:14},hypno:{k:"shot",len:()=>PROJ.hypno.range,hw:PROJ.hypno.hit,from:14},ssneak:{k:"shot",len:v=>rushLen(v,RUSHES.ssneak),hw:RUSHES.ssneak.hit,from:0},fsight:{k:"zone",Z:FS},trap:{k:"zone",Z:TRAP},tele:{k:"zone",Z:{range:TELE.range,r:10}},fcannon:{k:"shot",len:()=>PROJ.fcannon.range,hw:PROJ.fcannon.hit,from:14},sedge:{k:"shot",len:()=>EDGE.len,hw:EDGE.half,from:EDGE.from},grav:{k:"zone",Z:GRAV},rslide:{k:"slide"},quake:{k:"burst",r:QUAKE.r},
  flame:{k:"shot",len:()=>FLAME.reach,hw:15,from:10},fly:{k:"shot",len:v=>rushLen(v,RUSHES.fly),hw:RUSHES.fly.hit,from:0},heat:{k:"zone",Z:HEAT},icepunch:{k:"melee",r:16,d:[22,CONF.reach]},avalanche:{k:"zone",Z:AVAL},stomp:{k:"burst",r:STOMP.r},
  fpalm:{k:"melee",r:16,d:[22,CONF.reach]},asph:{k:"shot",len:()=>PROJ.asph.range,hw:PROJ.asph.hit,from:14},ccombat:{k:"shot",len:v=>rushLen(v,RUSHES.ccombat),hw:RUSHES.ccombat.hit,from:0},riposte:{k:"burst",r:14},
  icebeam:{k:"shot",len:()=>PROJ.icebeam.range,hw:PROJ.icebeam.hit,from:14},fwave:{k:"shot",len:()=>PROJ.fwave.range,hw:PROJ.fwave.hit,from:14},
  wshuri:{k:"shot",len:()=>PROJ.wshuri.range,hw:PROJ.wshuri.hit+8,from:12},sucker:{k:"shot",len:v=>rushLen(v,RUSHES.sucker),hw:RUSHES.sucker.hit,from:0},wpulse:{k:"zone",Z:WP},decoy:{k:"shot",len:v=>clamp(v[2],DECOY.min,DECOY.dist),hw:6,from:0}
};
function pxLine(x0,y0,x1,y1,col){
  ctx.fillStyle=col; const n=Math.max(1,Math.ceil(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
  for(let i=0;i<=n;i++)ctx.fillRect(Math.round(x0+(x1-x0)*i/n),Math.round(y0+(y1-y0)*i/n),1,1);
}
// Couloir d'un projectile : deux bords parallèles (décalés selon la perspective) et la forme d'arrivée.
function shotLane(px,py,ux,uy,from,len,hw,col){
  const rx=hw, ry=Math.max(1,hw/1.3), nx=-uy, ny=ux, den=Math.hypot(rx*nx,ry*ny)||1, ox=rx*rx*nx/den, oy=ry*ry*ny/den;
  const x0=px+ux*from, y0=py+uy*from, x1=px+ux*len, y1=py+uy*len;
  pxLine(x0+ox,y0+oy,x1+ox,y1+oy,col); pxLine(x0-ox,y0-oy,x1-ox,y1-oy,col);
  ellipseLine(Math.round(x1),Math.round(y1),Math.round(rx),Math.round(ry),col);
}
const channeling=()=>!!player&&((player.rush&&player.rush.ph==="chan")||!!player.chan);
function draw(){
  const vw=cv.width/PX, vh=cv.height/PX, sk=shake>0?(Math.floor(shake*45)%2?1:-1):0;
  cam.x=axis(snap(player.x),vw,WORLD.w)+sk; cam.y=axis(snap(player.y),vh,WORLD.h);
  ctx.setTransform(1,0,0,1,0,0); ctx.fillStyle=BG; ctx.fillRect(0,0,cv.width,cv.height);
  ctx.setTransform(PX,0,0,PX,-cam.x*PX,-cam.y*PX); ctx.imageSmoothingEnabled=false;
  ctx.drawImage(ground,0,0); if(arenaDeco)arenaDeco(ctx,performance.now()/1000);
  holes.forEach(drawHole);
  trail.forEach(q=>{ctx.globalAlpha=clamp(1-q.t/.8,0,1);drawMound(q.x,q.y,.6)});
  ctx.globalAlpha=1;
  fighters.forEach(e=>{if(e.tunnel&&e.tunnel.phase==="dash")drawMound(e.x,e.y,1)});
  if(marker)drawMarker(marker);
  zones.forEach(drawZone); fighters.forEach(drawFlashMark);
  glows.forEach(g=>{
    const u=g.t/g.life, hw=Math.round(8*(1-.35*u)), a=(1-u)*.65, x=Math.round(g.x), y=Math.round(g.y);
    for(let dy=-3;dy<=3;dy++){const w=Math.round(hw*Math.sqrt(1-dy*dy/12));
      ctx.globalAlpha=a*.55; ctx.fillStyle="#5a2fc0"; ctx.fillRect(x-w,y+dy,w*2+1,1);
      const w2=Math.round(w*.55); ctx.globalAlpha=a; ctx.fillStyle="#d8c4ff"; if(Math.abs(dy)<=1)ctx.fillRect(x-w2,y+dy,w2*2+1,1)}
    ctx.globalAlpha=1});
  // Runes au sol pendant une canalisation (Draco-Charge ou Éclat Magique) : elles grandissent et tournent avec la charge
  fighters.forEach(e=>{
    const C=e.rush&&e.rush.ph==="chan"?e.rush:e.chan; if(!C)return;
    const dur=e.rush?RUSH.chan:GLEAM.chan, fill=clamp(C.t/dur,0,1), rx=Math.round(8+16*fill), ry=Math.round(rx*.55), cx=Math.round(snap(e.x)), cy=Math.round(snap(e.y)), pink=!!e.chan;
    ctx.fillStyle=pink?"rgba(192,90,168,.35)":"rgba(90,47,192,.35)"; for(let dy=-ry;dy<=ry;dy++){const w=Math.round(rx*Math.sqrt(1-dy*dy/(ry*ry+.01)));ctx.fillRect(cx-w,cy+dy,w*2+1,1)}
    ctx.fillStyle=fill>=1?"#ffffff":pink?"#ff8ec4":"#a77bff";
    for(let a=0;a<Math.PI*2;a+=1/rx)ctx.fillRect(Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry),1,1);
    const spin=performance.now()/260; ctx.fillStyle=pink?"#ffc2e0":"#d8c4ff";
    for(let i=0;i<6;i++){const a=spin+i*Math.PI/3;ctx.fillRect(Math.round(cx+Math.cos(a)*(rx-3)),Math.round(cy+Math.sin(a)*(ry-2)),2,2)}
  });
  if(aiming){
    if(player.stun>0||player.tunnel||player.ko>0)aiming=null;
    else{
      const P=PREV[aiming], v=aimVec(player,true)||[FACE[player.dir][0],FACE[player.dir][1],1], ready=cdOf(player,aiming)<=0&&player.pp>=SPL[aiming].cost;
      const col=ready?"rgba(255,255,255,.8)":"rgba(255,110,90,.75)", faint=ready?"rgba(255,255,255,.35)":"rgba(255,110,90,.35)", fill=ready?"rgba(176,200,255,.16)":"rgba(255,110,90,.14)";
      const px0=Math.round(snap(player.x)), py0=Math.round(snap(player.y)), ux=v[0], uy=v[1];
      if(P.k==="melee"){
        pxLine(px0,py0,Math.round(px0+ux*P.d[0]),Math.round(py0+uy*P.d[0]),faint);
        const cx=px0+ux*P.d[0], cy=py0+uy*P.d[0];
        pixelRing(Math.round(px0+ux*P.d[1]),Math.round(py0+uy*P.d[1]),P.r,faint);
        pixelRing(Math.round(cx),Math.round(cy),P.r,col);
      }else if(P.k==="shot"){
        shotLane(px0,py0,ux,uy,P.from,P.len(v),P.hw,col);
      }else if(P.k==="dash"){
        const len=P.len(v), ex=Math.round(px0+ux*len), ey=Math.round(py0+uy*len);
        pxLine(px0+ux*10,py0+uy*10,ex,ey,faint);
        ellipseRows(ex,ey,P.r,Math.round(P.r*ISO),fill); ellipseLine(ex,ey,P.r,Math.round(P.r*ISO),col);
      }else if(P.k==="zone"){
        const Z=P.Z, sp=zoneSpot(player,Z.range), zx=Math.round(sp.x), zy=Math.round(sp.y);
        ellipseLine(px0,py0,Z.range,Math.round(Z.range*ISO),faint);
        ellipseRows(zx,zy,Z.r,Math.round(Z.r*ISO),fill); ellipseLine(zx,zy,Z.r,Math.round(Z.r*ISO),col);
      }else if(P.k==="slide"){
        const sp=slideSpots(player); pxLine(px0,py0,Math.round(sp[2].x),Math.round(sp[2].y),faint);
        sp.forEach(p=>{const zx=Math.round(p.x), zy=Math.round(p.y); ellipseRows(zx,zy,RS.r,Math.round(RS.r*ISO),fill); ellipseLine(zx,zy,RS.r,Math.round(RS.r*ISO),col)});
      }else if(P.k==="burst"){
        ellipseRows(px0,py0,P.r,Math.round(P.r*ISO),fill); ellipseLine(px0,py0,P.r,Math.round(P.r*ISO),col);
      }
    }
  }
  fighters.forEach(e=>{ if(e!==player)return;
    const C=e.rush&&e.rush.ph==="chan"?e.rush:e.chan; if(!C)return;
    // Canalisation : la voie se remplit vers la fin au fil de la charge et suit la visée
    const isR=!!e.rush, len=isR?C.len:GLEAM.len, px0=snap(e.x), py0=snap(e.y), fill=clamp(C.t/(isR?RUSH.chan:GLEAM.chan),0,1), blink=fill>.85&&Math.floor(performance.now()/70)%2;
    for(let d=10;d<=len;d+=3){const on=d<=10+fill*(len-10), x=Math.round(px0+C.fx*d), y=Math.round(py0+C.fy*d);
      ctx.fillStyle=on?(blink?"#ffffff":isR?"#ff9a3c":"#ff8ec4"):"rgba(255,255,255,.35)";
      ctx.fillRect(x,y,1,1);ctx.fillRect(x+Math.round(-C.fy),y+Math.round(C.fx),1,1);ctx.fillRect(x-Math.round(-C.fy),y-Math.round(C.fx),1,1)}
    pixelRing(Math.round(px0+C.fx*len),Math.round(py0+C.fy*len),8,fill>=1?"#ffffff":isR?"rgba(167,123,255,.9)":"rgba(255,142,196,.9)");
  });
  fighters.forEach(e=>{
    let n=0;
    for(const k in e.bf){
      const B=BUFF[k], T=e.bf[k], cx=Math.round(snap(e.x)), cy=Math.round(snap(e.y)), pulse=(performance.now()/500+n*.3)%1, low=T<1.5&&Math.floor(performance.now()/120)%2;
      n++; if(low)continue;
      pixelRing(cx,cy,Math.round(12+3*pulse+3*(n-1)),B.col+"b0");
      ctx.fillStyle=B.pal[2]; for(let i=0;i<3;i++){const f=(pulse+i/3)%1; ctx.fillRect(cx+(i-1)*6+(n-1)*2,Math.round(cy-4-f*e.sp.body*1.4),1,2)}
    }
  });
  fighters.forEach(e=>{
    if(!e.counter)return;
    const cx=Math.round(snap(e.x)), cy=Math.round(snap(e.y)), p=(performance.now()/160)%1;
    pixelRing(cx,cy,Math.round(14-4*p),"rgba(216,216,240,"+(.9-.5*p).toFixed(2)+")"); pixelRing(cx,cy,Math.round(8+3*p),"rgba(255,255,255,"+(.7-.5*p).toFixed(2)+")");
  });
  // Guide de visée : une courte ligne pointillée au sol vers le curseur, pour que les sorts ne surprennent jamais.
  if(mouse&&!aiming&&player.stun<=0&&!player.tunnel&&!player.shieldOn&&player.ko<=0){
    const v=aimVec(player,true); if(v){ctx.fillStyle="rgba(255,255,255,.4)";for(let d=14;d<=38;d+=6)ctx.fillRect(Math.round(snap(player.x)+v[0]*d),Math.round(snap(player.y)+v[1]*d),1,1)}
  }
  const order=entities.slice().sort((a,b)=>a.y-b.y);
  ctx.fillStyle="rgba(0,0,0,.32)";
  order.forEach(e=>{
    if(e.gone)return;
    if(e.ko>0&&Math.floor(e.ko*12)%2)return;
    if(e.tunnel&&e.tunnel.phase==="dash")return;
    const gx=snap(e.x), gy=snap(e.y), [rx,ry]=e.sp.shadow;
    for(let r=-ry+1;r<=ry-1;r++){const hw=Math.round(rx*Math.sqrt(1-(r*r)/(ry*ry+.5)));ctx.fillRect(Math.round(gx)-hw,Math.round(gy)+r,hw*2+1,1)}
  });
  // Sprites et effets partagent un ordre de profondeur : une griffe vers le haut est dessinée derrière son lanceur.
  entities.map(e=>({k:e.y,d:()=>{drawEntity(e);drawTelegraph(e)}})).concat(fx.map(c=>({k:c.sy,d:()=>drawFx(c)}))).concat(orbs.map(o=>({k:o.y,d:()=>drawOrb(o)}))).concat(OBST.map(c=>({k:c.dead?c.y-30:c.y,d:()=>{const sh=!c.dead&&performance.now()-c.hurtAt<160?(Math.floor(performance.now()/40)%2?1:-1):0;ctx.drawImage(c.spr[obstStage(c)],Math.round(c.x)-OX+sh,Math.round(c.y)-OY)}}))).sort((a,b)=>a.k-b.k).forEach(i=>i.d());
  beams.forEach(drawBeam);
  rings.forEach(drawRing);
  parts.forEach(q=>{ctx.globalAlpha=clamp(1-q.t/q.life,0,1);ctx.fillStyle=q.c;ctx.fillRect(Math.round(q.x),Math.round(q.y),q.s||2,q.s||2)});
  ctx.globalAlpha=1;
  // chiffres de dégâts : texte d'interface dessiné en espace écran
  ctx.setTransform(1,0,0,1,0,0); ctx.textAlign="center"; ctx.font="700 "+Math.round(PX*5)+"px 'Pixelify Sans','Chakra Petch',monospace"; ctx.lineWidth=Math.round(PX*1.2); ctx.lineJoin="round";
  pops.forEach(q=>{
    const sx=(q.x-cam.x)*PX, sy=(q.y-q.t*16-cam.y)*PX; ctx.globalAlpha=clamp(1.6-q.t*1.6,0,1);
    ctx.strokeStyle="#1a1405"; ctx.strokeText(q.txt,sx,sy); ctx.fillStyle=q.col||"#ffd24a"; ctx.fillText(q.txt,sx,sy);
  });
  ctx.globalAlpha=1;
}
function resize(){
  const r=stage.getBoundingClientRect(), d=window.devicePixelRatio||1;
  cv.width=Math.round(r.width*d); cv.height=Math.round(r.height*d);
  PX=Math.max(2,Math.round(4*d)); // pixels écran par pixel d'art, toujours un entier
}
