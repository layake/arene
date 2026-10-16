// ---- Pixel-art ground, drawn once at 1 px = 1 art pixel ----
let ground=null;
function genPrairie(g){
  let s=445; const rnd=()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
  const R=n=>Math.floor(rnd()*n);
  const px=(x,y,c)=>{g.fillStyle=c;g.fillRect(x,y,1,1)};
  const rect=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
  const G={base:"#5b8c3a",dark:"#4a7a31",deep:"#3d6628",light:"#76a64a",tip:"#8dbb5c"};
  const D={base:"#a3814f",dark:"#8a6a3e",light:"#b8965f"};
  const S={base:"#9aa3a0",dark:"#6e7876",light:"#bcc4c0",mortar:"#4f5958"};
  rect(0,0,WORLD.w,WORLD.h,G.base);
  for(let i=0;i<2600;i++)px(R(WORLD.w),R(WORLD.h),rnd()<.55?G.dark:G.light);
  for(let i=0;i<90;i++){const x=R(WORLD.w),y=R(WORLD.h),w=2+R(3);rect(x,y,w,1,G.dark);rect(x+1,y+1,w-1,1,G.deep)}
  // dirt path
  const yc=x=>Math.round(WORLD.h/2+Math.sin(x/45)*22), half=16;
  for(let x=0;x<WORLD.w;x++){const c=yc(x);rect(x,c-half,1,half*2+1,D.base);px(x,c-half,D.dark);px(x,c+half,D.dark);px(x,c+half-1,D.dark)}
  for(let i=0;i<700;i++){const x=R(WORLD.w),c=yc(x);px(x,c-half+1+R(half*2-1),rnd()<.5?D.dark:D.light)}
  for(let i=0;i<45;i++){const x=R(WORLD.w),y=yc(x)-half+3+R(half*2-6);px(x,y,S.light);px(x+1,y,S.base);px(x+1,y+1,S.dark)}
  // tufts and flowers (kept off the path)
  const offPath=(x,y)=>Math.abs(y-yc(x))>half+3;
  for(let i=0;i<150;){const x=6+R(WORLD.w-12),y=8+R(WORLD.h-16);if(!offPath(x,y))continue;i++;
    px(x,y,G.deep);px(x,y-1,G.dark);px(x-1,y-2,G.dark);px(x+1,y-2,G.dark);px(x,y-2,G.tip)}
  for(let i=0;i<50;){const x=6+R(WORLD.w-12),y=8+R(WORLD.h-16);if(!offPath(x,y))continue;i++;
    const c=["#f2e27a","#f0f0f4","#e8789a"][R(3)];px(x,y,c);px(x-1,y,c);px(x+1,y,c);px(x,y-1,c);px(x,y+1,c);px(x,y,"#d8a030")}
  // rocks with a shadow row
  for(let i=0;i<14;){const x=12+R(WORLD.w-30),y=12+R(WORLD.h-26);if(!offPath(x,y))continue;i++;
    rect(x+1,y+4,6,1,"rgba(0,0,0,.3)");rect(x+1,y,4,1,S.light);rect(x,y+1,6,2,S.base);rect(x,y+3,6,1,S.dark);px(x+1,y+1,S.light)}
  // stone wall, 4 px thick, bricks 8x4
  const brick=(x0,y0,w,hh)=>{rect(x0,y0,w,hh,S.base);
    for(let y=y0;y<y0+hh;y+=4){rect(x0,y,w,1,S.mortar);const off=((y-y0)/4)%2?4:0;
      for(let x=x0+off;x<x0+w;x+=8){rect(x,y,1,4,S.mortar)}}
    rect(x0,y0,w,1,S.light)};
  brick(0,0,WORLD.w,8);brick(0,WORLD.h-8,WORLD.w,8);brick(0,0,8,WORLD.h);brick(WORLD.w-8,0,8,WORLD.h);
}


function pixelRing(cx,cy,r,col){
  ctx.fillStyle=col; let x=r,y=0,err=1-r;
  while(x>=y){
    [[x,y],[y,x],[-y,x],[-x,y],[-x,-y],[-y,-x],[y,-x],[x,-y]].forEach(([u,v])=>ctx.fillRect(cx+u,cy+v,1,1));
    y++; if(err<0)err+=2*y+1; else{x--;err+=2*(y-x)+1}
  }
}

function drawHole(h){
  ctx.globalAlpha=clamp(h.life-h.t,0,1);
  const x=Math.round(h.x), y=Math.round(h.y);
  for(let r=-3;r<=3;r++){
    const rim=Math.round(13*Math.sqrt(1-r*r/12)), inner=Math.round(10*Math.sqrt(1-r*r/11));
    ctx.fillStyle=r<0?"#b8965f":"#8a6a3e"; ctx.fillRect(x-rim,y+r,rim*2+1,1);
    if(inner>0){ctx.fillStyle="#2a1d11";ctx.fillRect(x-inner,y+r,inner*2+1,1)}
  }
  ctx.globalAlpha=1;
}

function drawMound(x,y,k){
  const bob=Math.floor(performance.now()/60)%2, rows=[[1,15,"#2e2012"],[-4,3,"#e6cb91"],[-3,7,"#cfae72"],[-2,11,"#a3814f"],[-1,13,"#6e5330"],[0,15,"#3d2c18"]];
  rows.forEach(([dy,w,c])=>{const ww=Math.max(1,Math.round(w*k)),hh=Math.round(dy*k);ctx.fillStyle=c;ctx.fillRect(Math.round(x)-(ww>>1),Math.round(y)+hh-(k===1?bob:0),ww,1)});
}

function drawMarker(m){
  const rad=Math.round(11-7*clamp(m.t/.18,0,1));
  ctx.globalAlpha=player.moveTarget?1:clamp(1-(m.t-.2)/.15,0,1); ctx.fillStyle=m.chase?"#ffb0a6":"#d6f1ff";
  for(let a=0;a<Math.PI*2;a+=Math.PI/12)ctx.fillRect(Math.round(m.x+Math.cos(a)*rad),Math.round(m.y+Math.sin(a)*rad*.55),1,1);
  ctx.fillStyle=m.chase?"#ff4a3d":"#7fd0ff"; ctx.fillRect(Math.round(m.x)-1,Math.round(m.y),3,1); ctx.fillRect(Math.round(m.x),Math.round(m.y)-1,1,3);
  ctx.globalAlpha=1;
}

function drawRing(r){
  const u=clamp(r.t/r.dur,0,1), rad=4+((r.max||TUNNEL.radius)-4)*(1-(1-u)*(1-u));
  ctx.globalAlpha=1-u; ctx.fillStyle=r.c||"#e0c48a";
  for(let a=0;a<Math.PI*2;a+=1/(rad+2))ctx.fillRect(Math.round(r.x+Math.cos(a)*rad),Math.round(r.y+Math.sin(a)*rad*.55),2,2);
  ctx.globalAlpha=1;
}

function drawTunnelSprite(e){
  const T=e.tunnel; if(T.phase==="dash")return;
  const s=e.sp.sheets.idle, a=e.sp.anch.idle[e.dir][0], gy=Math.round(snap(e.y));
  const hidden=T.phase==="sink"?clamp(T.t/TUNNEL.windup,0,1):1-(1-(1-clamp(T.t/.16,0,1))*(1-clamp(T.t/.16,0,1)));
  const off=Math.round(hidden*(a[1]+2)), x=snap(e.x)-a[0], y=snap(e.y)-a[1]+off;
  if(!s.img.complete)return;
  ctx.save(); ctx.beginPath(); ctx.rect(x-2,gy-a[1]-4,s.w+4,a[1]+4+1); ctx.clip();
  ctx.drawImage(s.img,0,e.dir*s.h,s.w,s.h,x,y,s.w,s.h); ctx.restore();
  const gx=Math.round(snap(e.x)); ctx.fillStyle=DIRT[2]; ctx.fillRect(gx-7,gy+1,15,1); ctx.fillStyle=DIRT[3]; ctx.fillRect(gx-5,gy+2,11,1);
}

function drawClaw(c){
  const L=30, f=c.f; let dx=-f[1]+f[0]*.5, dy=f[0]+f[1]*.5+.35; const n=Math.hypot(dx,dy); dx/=n; dy/=n;
  const nx=-dy, ny=dx, life=.3, alpha=c.t>life-.1?Math.max(0,(life-c.t)/.1):1;
  const layers=c.pal?[[c.pal[0],2],[c.pal[1],0],[c.pal[2],-2]]:[["#5a4bc2",2],["#8fdcff",0],["#ffffff",-2]];
  ctx.globalAlpha=alpha;
  layers.forEach(([col,grow])=>{
    ctx.fillStyle=col;
    for(let i=-1;i<=1;i++){
      const u=clamp((c.t-(i+1)*.03)/.09,0,1), sx=c.x-dx*L/2+nx*i*5, sy=c.y-dy*L/2+ny*i*5;
      for(let k=0;k<=L*u;k++){
        const w=Math.max(1,Math.round(1+2.4*Math.sin(Math.PI*k/L))+grow);
        if(w<1)continue;
        ctx.fillRect(Math.round(sx+dx*k-w/2),Math.round(sy+dy*k-w/2),w,w);
      }
    }
  });
  ctx.globalAlpha=1;
}

function drawMud(o){
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14+Math.round(Math.sin(o.t*18));
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-3,gy,7,1); ctx.fillRect(x-2,gy+1,5,1);
  for(let k=3;k>=1;k--){const tx=Math.round(x-o.vx*k*5), ty=Math.round(y-o.vy*k*5)-0; ctx.fillStyle=k===3?"#6b4a2a":"#8a6a3e"; const w=4-k; ctx.fillRect(tx-w+1,ty-w+1,w*2-1,w*2-1)}
  const disc=(r,c)=>{ctx.fillStyle=c;for(let dy=-r;dy<=r;dy++){const hw=Math.round(Math.sqrt(r*r+r-dy*dy));ctx.fillRect(x-hw,y+dy,hw*2+1,1)}};
  disc(5,"#4a3320"); disc(4,"#7a5a34"); disc(3,"#a07c48"); 
  ctx.fillStyle="#d8b878"; ctx.fillRect(x-2,y-2,2,1); ctx.fillRect(x-2,y-1,1,1);
}
