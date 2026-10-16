// ===== Archétype "jet continu" : un flux qui sort du Pokémon, suit la visée et touche à chaque tick =====
// defStream({id,dur,tick,tickPower,reach,width,style,pal,burn,noise,...}) ; voir docs/AJOUTER_UNE_CAPACITE.md
var STREAM_DEFS=[];
const strm_h=n=>{n=(n*374761393+668265263)|0;n=(n^(n>>>13))*1274126177|0;return((n^(n>>>16))>>>0)/4294967295};
const STREAM_STYLE={
  // blobs de feu qui montent et s'étalent
  fire:{n:20,flow:2,size:s=>Math.max(3,Math.round(8*(1-s*.55))),wob:s=>2+s*7,lift:s=>-s*s*9,cols:s=>s<.25?2:s<.6?1:0,core:s=>s<.3?4:s<.65?3:2},
  // blobs d'eau mous qui retombent en arc, avec des gouttes d'écume
  // rafale de neige : petits flocons qui s'étalent en cône large
  snow:{n:40,flow:1.5,size:s=>s<.5?3:2,wob:s=>1+s*3,lift:s=>s*s*6,cols:s=>s<.3?3:s<.7?2:1,core:s=>3},
  water:{n:22,flow:1.7,size:s=>Math.round(3+s*4),wob:s=>1+s*3,lift:s=>s*s*8,cols:s=>s<.3?2:s<.7?1:0,core:s=>s<.5?4:3}
};
function strmPoint(c,s,i,T){
  const f=c.e.aim||FACE[c.e.dir], nx=-f[1], ny=f[0], S=STREAM_STYLE[c.d.style]||STREAM_STYLE.fire, grow=Math.min(1,T*7);
  const R=c.s.len||c.d.reach, d=6+s*R*grow, w=Math.sin(T*13+i*1.9)*S.wob(s)+(strm_h(i+7)-.5)*2*(c.d.spread||0)*s;
  return {x:c.e.x+f[0]*(8+d)+nx*w, y:c.e.y-c.e.sp.body+f[1]*d*.8+ny*w*.8+S.lift(s), s, S};
}
function drawStream(c){
  const S=STREAM_STYLE[c.d.style]||STREAM_STYLE.fire, T=c.t, P=c.d.pal, fade=!c.s.hold&&T>c.d.dur-.12?Math.max(0,(c.d.dur-T)/.12):1;
  ctx.globalAlpha=fade;
  for(let i=0;i<S.n;i++){ // contour sombre derrière tout le flux
    const s=(i/S.n+T*S.flow)%1, p=strmPoint(c,s,i,T), w=S.size(s)+1; ctx.fillStyle=P[0]; ctx.fillRect(Math.round(p.x)-(w>>1),Math.round(p.y)-(w>>1),w,w);
  }
  for(let i=0;i<S.n;i++){
    const s=(i/S.n+T*S.flow)%1, p=strmPoint(c,s,i,T), w=S.size(s), x=Math.round(p.x), y=Math.round(p.y);
    ctx.fillStyle=P[S.cols(s)]; ctx.fillRect(x-(w>>1),y-(w>>1),w,w);
    if(w>3){ctx.fillStyle=P[S.core(s)]; ctx.fillRect(x-(w>>1)+1,y-(w>>1)+1,w-2,w-2)}
    if(c.d.style==="water"&&w>4){ctx.fillStyle="#ffffff"; ctx.fillRect(x-(w>>1)+1,y-(w>>1)+1,2,1)}
  }
  ctx.globalAlpha=1;
}
{const _d0=drawFx; drawFx=function(c){return c.k==="strm"?drawStream(c):_d0(c)}}
function startStream(e,d){
  e.strm={d,t:0,nt:0,burned:false,on:true,nz:.4,hold:e===player&&!e.bot};
  fx.push({k:"strm",e,d,s:e.strm,x:e.x,y:e.y,sy:e.y+.5,t:0,life:d.dur});
  logFor(e,e.sp.name+" utilise "+SPL[d.id].name+" !",1600);
  if(d.noise)synNoise(e.strm.hold?.45:d.dur,d.noise[0],d.noise[1],d.noise[2],d.noise[3],"bandpass");
}
function updateStreams(dt){
  fighters.forEach(e=>{
    const S=e.strm; if(!S)return;
    const d=S.d, t=foeOf(e);
    const end=S.hold?(S.t>=(d.max||3)||(!e.holdKey&&S.t>=.25)):S.t>=d.dur;
    if(!alive(e)||e.stun>0||e.tunnel||end){S.on=false;e.strm=null;e.lock=Math.min(e.lock||0,.1);fx.forEach(c=>{if(c.s===S)c.life=c.t});return}
    S.t+=dt; if(S.hold){fx.forEach(c=>{if(c.s===S)c.life=c.t+1}); S.nz-=dt; if(S.nz<=0&&d.noise){S.nz=.4;synNoise(.45,d.noise[0],d.noise[1],d.noise[2],d.noise[3],"bandpass")}} // maintenu : le jet dure tant que la touche est enfoncée
    // canalisation : le lanceur s'arrête de marcher, le jet suit le curseur, relâcher la touche coupe
    e.moveTarget=null; if(e===player)marker=null; e.lock=Math.max(e.lock||0,.06);
    const av=aimAt(e,false); if(av)e.aim=av; const f=e.aim||FACE[e.dir];
    const mx=e.x+f[0]*10, my=e.y-e.sp.body+f[1]*8;
    for(let k=0;k<2;k++){ if(Math.random()<dt*70) spark(mx+f[0]*rand(10,d.reach),my+f[1]*rand(10,d.reach)*.8,rand(-20,20)+f[0]*30,rand(-40,-5),rand(.2,.4),d.pal[Math.floor(rand(0,5))],d.style==="water"?220:-40,2) }
    S.nt-=dt;
    if(S.nt<=0){ S.nt=d.tick;
      let len=d.reach; for(let q=12;q<=d.reach;q+=6){ if(arenaShot({x:e.x+f[0]*q,y:e.y+f[1]*q,id:"~"+d.id})){len=q;break} } S.len=len;
      if(alive(t)&&!t.tunnel){
        const dx=t.x-mx, dy=(t.y-t.sp.body)-my, along=dx*f[0]+dy*f[1], lat=Math.abs(dx*-f[1]+dy*f[0]);
        if(along>0&&along<len+t.sp.body*.5&&lat<d.width+(d.spread||0)*Math.max(0,along)/d.reach+t.sp.body*.5){
          const sp=Object.assign({},SPL[d.id],{power:d.tickPower});
          if(strike(e,t,sp,{from:e,dot:true,contact:true,shieldCost:6})){
            colorBurst(t.x,t.y-t.sp.body*.6,4,d.pal,30,90);
            if(!S.burned&&d.burn){S.burned=true;applyBurn(t,e)}
            if(d.slow)t.slow=Math.max(t.slow||0,d.slow);
          }
        }
      }
    }
  });
}
{const _u0=updateOrbs; updateOrbs=function(dt){_u0(dt);updateStreams(dt)}}
// Déclare une capacité en jet continu. keep:true = ne remplace que le comportement/FX d'une capacité existante.
function defStream(d){
  STREAM_DEFS.push(d);
  if(!d.keep){SPL[d.id]={name:d.name,type:d.type,cat:d.cat||"spec",power:d.power||d.tickPower*d.dur/d.tick,cost:d.cost||0,cd:d.cd,ground:false,pp0:0}; SFX_MAP[d.id]=d.sfx}
  if(d.desc){DESC[d.id]=d.desc; if(d.en)I18N_EXTRA[d.desc]=d.en}
  SPL["~"+d.id]={name:"",type:SPL[d.id].type,cat:"spec",power:d.tickPower,cost:0,cd:0}; // dégâts d'obstacle par tick
  PREV[d.id]={k:"shot",len:()=>d.reach,hw:Math.round(d.width+(d.spread||0)*.6),from:10};
  ACE2[d.id]={hit(e){startStream(e,d)}};
}
defStream({keep:true,id:"flame",style:"fire",pal:FLAMEC,dur:1,tick:.125,tickPower:3,reach:84,width:11,burn:true,noise:[.38,2600,900,1.2],
  desc:"Maintenir la touche : souffle un jet de flammes vers le curseur, on reste immobile, lâcher coupe (3 s max). Brûle la cible.",
  en:"Hold the key: breathes flames toward the cursor, you stand still, release to stop (3 s max). Burns the target."});

defStream({keep:true,id:"hydrocanon",style:"water",pal:WATERC,dur:1.1,tick:.1,tickPower:3.6,reach:170,width:13,slow:.7,noise:[.5,1600,500,1.0],
  desc:"Maintenir la touche : jet d'eau vers le curseur, on reste immobile, lâcher coupe (3 s max). Ralentit la cible.",
  en:"Hold the key: water jet toward the cursor, you stand still, release to stop (3 s max). Slows the target."});
defStream({keep:true,id:"blizzard",style:"snow",pal:ICEC,dur:1.6,tick:.2,tickPower:2.4,reach:125,width:12,spread:38,slow:1.4,noise:[.55,3200,1200,1.1],
  desc:"Maintenir la touche : rafale glacée en cône vers le curseur, on reste immobile, lâcher coupe (3 s max). Ralentit fortement.",
  en:"Hold the key: wide icy blast toward the cursor, you stand still, release to stop (3 s max). Slows heavily."});
