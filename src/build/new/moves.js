// ===== Pipeline des capacités de mêlée : 1 appel defMelee() = SPL + DESC + FX + son + aperçu + traduction =====
// Voir docs/AJOUTER_UNE_CAPACITE.md. Un style de FX = une fonction de dessin dans MELEE_FX.
var I18N_EXTRA={}, MELEE_DEFS=[];
function mfxLine(x0,y0,x1,y1,w,col){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);ctx.fillStyle=col;for(let i=0;i<=n;i++){const k=i/n;ctx.fillRect(Math.round(x0+(x1-x0)*k-w/2),Math.round(y0+(y1-y0)*k-w/2),w,w)}}
function mfxDisc(x,y,r,col){ctx.fillStyle=col;for(let j=-r;j<=r;j++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-j*j)));ctx.fillRect(Math.round(x-hw),Math.round(y+j),hw*2+1,1)}}
// Contexte passé à chaque style : c (fx), P (palette), f (visée), n (normale), x,y, T (temps), u (0..1 sur .3 s)
const MELEE_FX={
  // onde de choc au sol + lignes d'impact (coup lourd, écrasement)
  slam(k){const{x,y,P,T,u}=k, rx=8+28*u, ry=rx*.5, gy=y+8;
    for(let a=0;a<64;a++){const g=a/64*Math.PI*2; [[P[2],0],[P[0],2]].forEach(([col,d])=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x+Math.cos(g)*(rx-d)),Math.round(gy+Math.sin(g)*(ry-d*.5)),2,2)})}
    for(let i=0;i<8;i++){const g=i*Math.PI/4+.3, a=6+u*14, b=a+6+u*6; mfxLine(x+Math.cos(g)*a,gy+Math.sin(g)*a*.5,x+Math.cos(g)*b,gy+Math.sin(g)*b*.5,2,i%2?P[3]:P[0])}
    if(T<.1)mfxDisc(x,y,7-Math.round(T*40),"#ffffff")},
  // deux mâchoires de crocs qui se referment (morsure)
  bite(k){const{x,y,P,f,n,T}=k, gap=Math.max(2,14*(1-clamp(T/.13,0,1))+2);
    [-1,1].forEach(sd=>{for(let i=-2;i<=2;i++){
      const bx=x+f[0]*i*5+n[0]*sd*gap, by=y+f[1]*i*5+n[1]*sd*gap;
      for(let h=0;h<6;h++){const w=Math.max(0,3-Math.floor(h*.6)); ctx.fillStyle=P[3]; ctx.fillRect(Math.round(bx-n[0]*sd*h-w-1),Math.round(by-n[1]*sd*h-w-1),w*2+3,w*2+3)}
      for(let h=0;h<6;h++){const w=Math.max(0,2-Math.floor(h*.5)); ctx.fillStyle=h>3?P[2]:"#ffffff"; ctx.fillRect(Math.round(bx-n[0]*sd*h-w),Math.round(by-n[1]*sd*h-w),w*2+1,w*2+1)}
    }});
    if(T>.12&&T<.24){ctx.fillStyle="#ffffff";[[-5,-4],[6,3],[0,0],[-8,5],[8,-5]].forEach(([a,b])=>ctx.fillRect(Math.round(x+a),Math.round(y+b),2,2))}},
  // une seule entaille en croissant (lame, griffe unique)
  slash(k){const{x,y,P,f,T}=k; let dx=-f[1]+f[0]*.55, dy=f[0]+f[1]*.55+.4; const nn=Math.hypot(dx,dy); dx/=nn; dy/=nn; const qx=-dy, qy=dx, L=36, up=clamp(T/.09,0,1);
    [[P[0],3],[P[1],1],[P[4],-1]].forEach(([col,gw])=>{ctx.fillStyle=col;for(let i=0;i<=L*up;i++){const s=i/L*2-1, w=Math.max(1,Math.round(1+3*Math.sin(Math.PI*i/L))+gw), cv=-9*(1-s*s); ctx.fillRect(Math.round(k.x-dx*L/2+dx*i+qx*cv-w/2),Math.round(k.y-dy*L/2+dy*i+qy*cv-w/2),w,w)}})},
  // grand balayage en arc avec plumes (aile)
  wing(k){const{x,y,P,f,T,u}=k, R=19, a0=Math.atan2(f[1],f[0]), sw=Math.PI*.8, up=clamp(T/.12,0,1);
    for(let i=0;i<=40*up;i++){const g=a0-sw/2+sw*i/40, w=Math.max(1,Math.round(1+4*Math.sin(Math.PI*i/40)));
      [[R+3,P[0],w+1],[R,P[1],w],[R-3,P[4],Math.max(1,w-1)]].forEach(([r,col,ww])=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x+Math.cos(g)*r*.9-ww/2),Math.round(y+Math.sin(g)*r*.9-ww/2),ww,ww)})}
    for(let i=0;i<5;i++){const g=a0-sw/2+sw*(i+1)/6, d=R+6+u*12; ctx.fillStyle=i%2?"#ffffff":P[1]; ctx.fillRect(Math.round(x+Math.cos(g)*d*.9),Math.round(y+Math.sin(g)*d*.9+u*6),3,2)}},
  // coup de pied : arc bas et épais qui remonte, langues de flamme (ou d'énergie)
  kick(k){const{x,y,P,f,T,u}=k, R=15, a0=Math.atan2(f[1],f[0]), up=clamp(T/.1,0,1), g0=a0+1.25, g1=a0-.35;
    for(let i=0;i<=34*up;i++){const g=g0+(g1-g0)*i/34, w=Math.max(2,Math.round(2+5*Math.sin(Math.PI*i/34)));
      [[R+2,P[0],w+2],[R,P[1],w],[R-2,P[3],Math.max(1,w-2)]].forEach(([r,col,ww])=>{ctx.fillStyle=col;ctx.fillRect(Math.round(x+Math.cos(g)*r-ww/2),Math.round(y+4+Math.sin(g)*r*.7-ww/2),ww,ww)})}
    for(let i=0;i<7;i++){const g=g0+(g1-g0)*(i+1)/8, bx=x+Math.cos(g)*(R+3), by=y+4+Math.sin(g)*(R+3)*.7, h=3+Math.round(((i*5)%4)+u*8); ctx.fillStyle=i%2?P[2]:P[3]; ctx.fillRect(Math.round(bx),Math.round(by-h),3,h); ctx.fillStyle="#ffffff"; ctx.fillRect(Math.round(bx+1),Math.round(by-h+2),1,Math.max(1,h-3))}}
};
function drawMfx(c){
  const f=c.f, T=c.t, k={c,P:c.pal,f,n:[-f[1],f[0]],x:c.x,y:c.y,T,u:clamp(T/.3,0,1)}, fade=T>.22?Math.max(0,(.34-T)/.12):1;
  ctx.globalAlpha=fade; (MELEE_FX[c.s]||MELEE_FX.slash)(k); ctx.globalAlpha=1;
}
// Registres : chaque archétype déclare son dessin (par c.k) et sa mise à jour par image, au lieu d'empiler des wrappers.
var FX_DRAW={}, FX_UPDATERS=[];
{const _drawFx0=drawFx; drawFx=function(c){const f=FX_DRAW[c.k]; return f?f(c):_drawFx0(c)}}
{const _updOrbs0=updateOrbs; updateOrbs=function(dt){_updOrbs0(dt); for(const f of FX_UPDATERS)f(dt)}}
FX_DRAW.mfx=drawMfx;

// Déclare une capacité de mêlée. Champs :
//  id, name, type, power, cd, cost(=0), fx(style de MELEE_FX), pal(optionnel, sinon palette du type),
//  desc (FR), en:{name,desc} (EN), sfx:{cast,hit} (ids de sons), sparks(x,y,f) (étincelles), after(e,t) (effet secondaire),
//  keep:true pour conserver le SPL/DESC existant et ne remplacer que le FX (refonte d'une capacité déjà en jeu).
function defMelee(d){
  MELEE_DEFS.push(d);
  const pal=d.pal||TYPE_PAL[d.type]||TYPE_PAL.normal;
  if(!d.keep){
    SPL[d.id]={name:d.name,type:d.type,cat:"phys",power:d.power,cost:d.cost||0,cd:d.cd,ground:false,melee:true,pp0:0};
    DESC[d.id]=d.desc; SFX_MAP[d.id]=d.sfx;
    if(d.en){I18N_EXTRA[d.name]=d.en.name; I18N_EXTRA[d.desc]=d.en.desc}
  }
  PREV[d.id]={k:"melee",r:16,d:[22,CONF.reach]};
  ACE2[d.id]={hit(e){
    const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
    const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
    const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
    const px=bx+f[0]*reach, py=by+f[1]*reach;
    fx.push({k:"mfx",s:d.fx,x:px,y:py,sy:e.y+f[1]*reach+.01,f,t:0,life:.34,pal});
    colorBurst(px,py+8,10,pal,40,120); if(d.sparks)d.sparks(px,py,f);
    logFor(e,e.sp.name+" utilise "+SPL[d.id].name+" !",1800);
    const one=v=>{ if(strike(e,v,SPL[d.id],{from:e,push:CONF.push,contact:true})&&d.after)d.after(e,v) }, p=ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16);
    if(p)one(t); meleeOthers(e,p?t:null,px,py,16,one);
  }};
}
// ---- capacités ----
defMelee({id:"bodyslam",name:"Plaquage",type:"normal",power:26,cd:1.5,fx:"slam",pal:["#a8a8a8","#d8d8d8","#f0e0c0","#ffffff"],
  desc:"Plaquage lourd devant soi. Peut étourdir brièvement.",en:{name:"Body Slam",desc:"Heavy slam in front of you. May briefly stun."},sfx:{cast:402,hit:344},
  sparks:(x,y)=>{shake=Math.max(shake,.1);for(let i=0;i<6;i++)spark(x,y+6,rand(-70,70),-rand(20,70),rand(.3,.6),i%2?"#f0e0c0":"#ffffff",200,2)},after:(e,t)=>{if(Math.random()<.25)t.stun=Math.max(t.stun||0,.4)}});
defMelee({id:"crunch",name:"Mâchouille",type:"dark",power:24,cd:1.2,fx:"bite",pal:["#201020","#705848","#a08070","#403030"],
  desc:"Coup de croc puissant devant soi.",en:{name:"Crunch",desc:"Powerful bite in front of you."},sfx:{cast:678,hit:856},
  sparks:(x,y)=>{for(let i=0;i<5;i++)spark(x,y,rand(-60,60),-rand(10,60),rand(.3,.5),i%2?"#c0a090":"#ffffff",160,2)}});
defMelee({id:"nslash",name:"Tranche-Nuit",type:"dark",power:19,cd:.9,fx:"slash",pal:["#201020","#705898","#b090d8","#403030","#ffffff"],
  desc:"Griffade rapide devant soi.",en:{name:"Night Slash",desc:"Quick slash in front of you."},sfx:{cast:707,hit:891},
  sparks:(x,y,f)=>{for(let i=0;i<5;i++)spark(x,y,f[0]*rand(40,110),f[1]*rand(20,60)-rand(10,40),rand(.25,.45),i%2?"#b090d8":"#ffffff",0,2)}});
defMelee({id:"wingatk",name:"Cru-Aile",type:"flying",power:19,cd:1,fx:"wing",pal:["#5880c0","#a0c0f0","#d8ecff","#ffffff","#ffffff"],
  desc:"Coup d'aile rapide devant soi.",en:{name:"Wing Attack",desc:"Quick wing strike in front of you."},sfx:{cast:678,hit:819},
  sparks:(x,y)=>{for(let i=0;i<6;i++)spark(x,y,rand(-60,60),-rand(0,50),rand(.4,.7),i%2?"#ffffff":"#a0c0f0",-30,2)}});
// ---- refonte FX de capacités existantes (stats et textes inchangés) ----
defMelee({keep:true,id:"leafblade",fx:"slash",type:"grass",pal:["#1a6a2a","#3aa83a","#8ae068","#3aa83a","#e8ffd0"],
  sparks:(x,y,f)=>{for(let i=0;i<6;i++)spark(x,y,f[0]*rand(30,100),f[1]*rand(10,60)-rand(20,60),rand(.4,.7),i%2?"#8ae068":"#e8ffd0",60,2)}});
defMelee({keep:true,id:"wsteel",fx:"wing",type:"steel",pal:["#606080","#a8a8c8","#d8d8f0","#ffffff","#ffffff"],
  sparks:(x,y,f)=>{for(let i=0;i<5;i++)spark(x,y-4,f[0]*rand(60,120),f[1]*rand(30,70)-rand(10,50),rand(.25,.5),i%2?"#ffffff":STEELC[1],0,2)}});
defMelee({keep:true,id:"blazekick",fx:"kick",type:"fire",pal:["#a01808","#e8481c","#ff9a30","#ffe070","#ffffff"],
  sparks:(x,y,f)=>{for(let i=0;i<7;i++)spark(x,y-4,f[0]*rand(30,90),-rand(40,110),rand(.4,.7),FLAMEC[1+i%3],-40,i%3?2:3)},after:(e,t)=>{if(Math.random()<.4)applyBurn(t,e)}});
