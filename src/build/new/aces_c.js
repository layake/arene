// ===== Sorts de terrain : impacts, champs, pièges, murs (2 par Ace) =====
const GPAL={fire:FLAMEC,water:WATERC,ice:ICEC,psychic:PSYC,grass:GRASSC,steel:STEELC,rock:ROCKC,ghost:TYPE_PAL.ghost,dragon:FIRE,fighting:AURA,
  ground:["#d1a35c","#8a6030","#e8d8a0","#6a5a30","#f0e8c0"],fairy:PINK,poison:TYPE_PAL.poison,dark:TYPE_PAL.dark,normal:TYPE_PAL.normal};
const gpal=id=>GPAL[SPL[id].type]||FIRE;
const GR=a=>a*Math.PI/180;
// vecteur sol unitaire du lanceur vers un point (en unités de sol, y corrigé de ISO)
function gdir(e,sp){const dx=sp.x-e.x, dy=(sp.y-e.y)/ISO, L=Math.hypot(dx,dy)||1; return [dx/L,dy/L,L]}
const gpt=(x,y,ox,oy)=>({x:clampX(x+ox),y:clampY(y+oy*ISO)});
const SCAT=(n,R,d0,dd)=>(e,sp)=>{const a=[];for(let i=0;i<n;i++){if(i===0){const p=gpt(sp.x,sp.y,0,0);p.d=d0;a.push(p);continue}const ang=Math.random()*Math.PI*2, r=Math.sqrt(Math.random())*R, p=gpt(sp.x,sp.y,Math.cos(ang)*r,Math.sin(ang)*r); p.d=d0+dd*i; a.push(p)} return a};
const GZ={
  // ---- impacts : plusieurs frappes retardées ----
  dmeteor:{kind:"impacts",range:130,r:19,style:"fire",pr:55,push:25,pts:SCAT(5,55,.55,.16)},
  shands:{kind:"impacts",range:120,r:27,style:"ghost",pr:36,push:10,slow:1.2,pts:(e,sp)=>[0,1,2].map(i=>{const a=GR(-90+i*120), p=gpt(sp.x,sp.y,Math.cos(a)*28,Math.sin(a)*28); p.d=.55+.18*i; return p})},
  awave:{kind:"impacts",range:0,r:26,style:"aura",pr:92,push:70,pts:(e)=>{const a=[];for(let i=0;i<6;i++){const g=GR(i*60+15),p=gpt(e.x,e.y,Math.cos(g)*46,Math.sin(g)*46);p.d=.45;a.push(p)}for(let i=0;i<10;i++){const g=GR(i*36),p=gpt(e.x,e.y,Math.cos(g)*88,Math.sin(g)*88);p.d=.75;a.push(p)}return a}},
  tidal:{kind:"impacts",range:200,r:22,style:"water",pr:30,push:35,slow:1.3,pts:(e,sp)=>{const [ux,uy]=gdir(e,sp), a=[];for(let i=0;i<6;i++){const d=44+i*30,p=gpt(e.x,e.y,ux*d,uy*d);p.d=.3+.13*i;a.push(p)}return a}},
  embers:{kind:"impacts",range:130,r:17,style:"fire",pr:62,push:15,burn:true,pts:SCAT(7,62,.5,.1)},
  epsy:{kind:"impacts",range:130,r:24,style:"psy",pr:48,push:45,pts:(e,sp)=>{const a=[[40,0],[-40,0],[0,40],[0,-40]].map(([x,y],i)=>{const p=gpt(sp.x,sp.y,x,y);p.d=.55+.05*i;return p}),c=gpt(sp.x,sp.y,0,0);c.d=.95;a.push(c);return a}},
  // ---- champs : zone persistante ----
  sandstorm:{kind:"field",range:130,r:44,delay:.4,life:4.5,tick:.5,dot:.4,slow:.6,style:"sand"},
  psyterrain:{kind:"field",range:120,r:46,delay:.4,life:5,tick:.5,dot:.25,slow:.7,healOwner:.03,style:"psyfield"},
  blizzard:{kind:"field",range:110,r:56,delay:.5,life:4,tick:.5,dot:.45,slow:.8,style:"snow"},
  leech:{kind:"field",range:130,r:32,delay:.4,life:6,tick:.6,dot:.5,slow:.3,drain:.9,style:"leech"},
  // ---- pièges : se déclenchent quand l'ennemi marche dessus ----
  spikes:{kind:"mine",range:120,r:24,life:20,stun:.55,slow:2.4,style:"spikes",push:20},
  curse:{kind:"mine",range:120,r:25,life:20,psn:3.5,slow:1.5,style:"curse",push:0},
  amine:{kind:"mine",range:120,r:28,life:20,stun:.35,slow:0,style:"aura",push:150},
  tspikes:{kind:"mine",range:120,r:25,life:20,psn:4,slow:2.2,style:"toxic",push:10},
  icespike:{kind:"mine",range:120,r:24,life:20,stun:.8,slow:2,style:"ice",push:0},
  // ---- murs ----
  lscreen:{kind:"wall",range:75,n:5,cr:9,life:4.5,block:"foe",style:"screen"},
  rwall:{kind:"wall",range:70,n:3,cr:14,life:5,block:"all",style:"rocks"},
  fwall:{kind:"wall",range:75,n:5,cr:10,life:4.2,block:"none",touch:"burn",style:"flames"},
  thorns:{kind:"wall",range:75,n:5,cr:9,life:5,block:"foe",touch:"dmg",tick:.45,dot:.5,style:"thorns"},
  mbarrier:{kind:"wall",range:75,n:5,cr:9,life:3.2,block:"foe",reflect:true,style:"mirror"}
};
Object.assign(SPL,{
  sandstorm:{name:"Tempête de Sable",type:"ground",cat:"spec",power:14,cost:0,cd:11,ground:true},
  dmeteor:{name:"Draco-Météore",type:"dragon",cat:"spec",power:19,cost:0,cd:13,ground:true},
  psyterrain:{name:"Champ Psychique",type:"psychic",cat:"spec",power:10,cost:0,cd:14,ground:true},
  lscreen:{name:"Mur Lumière",type:"fairy",cat:"status",power:0,cost:0,cd:12,ground:true},
  rwall:{name:"Rempart de Roc",type:"rock",cat:"status",power:0,cost:0,cd:13,ground:true},
  spikes:{name:"Picots d'Acier",type:"steel",cat:"phys",power:22,cost:0,cd:12,ground:true},
  shands:{name:"Mains d'Ombre",type:"ghost",cat:"spec",power:22,cost:0,cd:9,ground:true},
  curse:{name:"Marque Funeste",type:"ghost",cat:"spec",power:30,cost:0,cd:12,ground:true},
  awave:{name:"Vague d'Aura",type:"fighting",cat:"spec",power:19,cost:0,cd:10,ground:true},
  amine:{name:"Mine d'Aura",type:"fighting",cat:"spec",power:28,cost:0,cd:11,ground:true},
  tidal:{name:"Vague Déferlante",type:"water",cat:"spec",power:17,cost:0,cd:9,ground:true},
  tspikes:{name:"Pics Toxik",type:"poison",cat:"phys",power:16,cost:0,cd:11,ground:true},
  fwall:{name:"Mur de Flammes",type:"fire",cat:"status",power:0,cost:0,cd:11,ground:true},
  embers:{name:"Pluie de Braises",type:"fire",cat:"spec",power:13,cost:0,cd:10,ground:true},
  blizzard:{name:"Blizzard",type:"ice",cat:"spec",power:14,cost:0,cd:13,ground:true},
  icespike:{name:"Pointes de Glace",type:"ice",cat:"phys",power:24,cost:0,cd:12,ground:true},
  leech:{name:"Vampigraine",type:"grass",cat:"spec",power:12,cost:0,cd:13,ground:true},
  thorns:{name:"Ronces",type:"grass",cat:"phys",power:12,cost:0,cd:12,ground:true},
  mbarrier:{name:"Barrière",type:"psychic",cat:"status",power:0,cost:0,cd:14,ground:true},
  epsy:{name:"Éclat Psy",type:"psychic",cat:"spec",power:25,cost:0,cd:12,ground:true}
});
Object.values(SPL).forEach(s=>{if(s.pp0===undefined)s.pp0=0});
Object.assign(DESC,{
  dmeteor:"Cinq météores s'abattent au hasard autour de la zone visée. Chacun touche séparément.",
  shands:"Trois mains d'ombre jaillissent en triangle autour de la zone visée et ralentissent.",
  awave:"Deux ondes d'aura s'étendent autour de toi, la seconde plus large. Repousse.",
  tidal:"Une vague déferle en ligne vers la cible : six impacts qui ralentissent.",
  embers:"Sept braises tombent autour de la zone visée. Chaque touche enflamme.",
  epsy:"Quatre ondes en croix, puis un éclat central plus fort. Repousse.",
  sandstorm:"Tempête de sable sur la zone visée 4,5 s : dégâts et gros ralentissement.",
  psyterrain:"Terrain psychique 5 s : ralentit l'ennemi et te soigne tant que tu y restes.",
  blizzard:"Blizzard 4 s sur une grande zone : dégâts et ralentissement.",
  leech:"Graines 6 s sur la zone visée : drainent l'ennemi et te rendent des PV.",
  spikes:"Piège invisible à moitié : étourdit et ralentit le premier qui marche dessus. Un seul à la fois.",
  curse:"Marque posée au sol : empoisonne et ralentit l'ennemi qui la touche.",
  amine:"Mine d'aura : explose au contact et projette l'ennemi au loin.",
  tspikes:"Pics empoisonnés : poison 4 s et ralentissement au contact.",
  icespike:"Pointes de glace : gèlent un instant l'ennemi qui marche dessus.",
  lscreen:"Mur de lumière 4,5 s : arrête les projectiles ennemis. Tu peux passer.",
  rwall:"Trois gros rochers 5 s : bloquent tout, projectiles et déplacements.",
  fwall:"Mur de flammes 4 s : enflamme qui le traverse. Ne bloque pas.",
  thorns:"Mur de ronces 5 s : bloque l'ennemi et le blesse au contact.",
  mbarrier:"Barrière psychique 3 s : renvoie les projectiles ennemis vers leur lanceur."
});
// ---------- lancement ----------
function spawnGZ(e,id){
  const C=GZ[id], sp=C.range?zoneSpot(e,C.range):{x:e.x,y:e.y};
  const z={k:"gz",g:id,x:sp.x,y:sp.y,t:0,o:e,done:false,u:Math.floor(Math.random()*1e9)};
  if(C.kind==="impacts"){z.pts=C.pts(e,sp).map(p=>({x:p.x,y:p.y,d:p.d,f:0}))}
  else if(C.kind==="mine"){zones.forEach(q=>{if(q.k==="gz"&&q.g===id&&q.o===e)q.t=Math.max(q.t,GZ[id].life+1)})}
  else if(C.kind==="wall"){
    const [ux,uy]=gdir(e,sp), px=-uy, py=ux, step=C.cr*2-2; z.c=[];
    for(let i=0;i<C.n;i++){const k=i-(C.n-1)/2; z.c.push({x:clampX(sp.x+px*k*step),y:clampY(sp.y+py*k*step*ISO)})}
    zones.forEach(q=>{if(q.k==="gz"&&q.g===id&&q.o===e)q.t=Math.max(q.t,GZ[id].life+1)});
  }
  zones.push(z);
  logFor(e,e.sp.name+" utilise "+SPL[id].name+" !",1600);
}
Object.keys(GZ).forEach(id=>{ACE2[id]={hit(e,id){spawnGZ(e,id)}}; const C=GZ[id];
  PREV[id]={k:"zone",Z:{range:C.range||1,r:C.kind==="impacts"?C.pr:C.kind==="wall"?C.n*C.cr:C.r}}});
// ---------- effets visuels ----------
function gThump(a,b){try{synThump(a,b,45,.45);synNoise(.18,.35,1800,260,1,"bandpass")}catch(_){}}
function gImpact(x,y,pal,style,R,big,gid){
  if(gid)sfxG(gid,"imp",big?.9:.65,null,x);
  rings.push({x,y,t:0,dur:.38,max:R+14,c:pal[2]}); rings.push({x,y,t:0,dur:.24,max:R*.7,c:"#ffffff"});
  fx.push({k:"pillar",x,y,sy:y+.5,top:big?95:70,w:Math.max(5,R*.45),t:0,life:.42,pal:[pal[0],pal[2],"#ffffff"]});
  colorBurst(x,y,big?34:24,pal,50,180); shake=Math.max(shake,big?.2:.12);
  if(style==="fire"||style==="psy"||style==="aura")fx.push({k:"star",x,y:y-12,sy:y+.7,t:0,life:.4,r:R*.6,col:pal[3]});
  const n=big?16:11;
  for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(30,100);
    if(style==="fire")spark(x+Math.cos(a)*4,y-4,Math.cos(a)*v*.5,-rand(60,150),rand(.5,.9),pal[1+i%3],-30,i%3?2:3);
    else if(style==="ghost")spark(x+Math.cos(a)*R*.5,y-2,Math.cos(a)*10,-rand(40,100),rand(.6,1),pal[1+i%3],-20,3);
    else if(style==="water"||style==="ice")spark(x,y-4,Math.cos(a)*v,-rand(90,190),rand(.4,.7),i%2?pal[2]:"#ffffff",420,i%3?2:3);
    else if(style==="psy"||style==="aura")spark(x+Math.cos(a)*R*.4,y-6,Math.cos(a)*v*.6,Math.sin(a)*v*.35-rand(20,60),rand(.5,.8),pal[1+i%4],0,2);
    else spark(x,y-4,Math.cos(a)*v,-rand(80,170),rand(.35,.6),pal[i%5],380,i%3?2:3)}
  if(style==="rock"||style==="sand")fx.push({k:"cracks",x,y,sy:y-.5,t:0,life:.8,rays:Array.from({length:7},(_,i)=>({a:i*Math.PI*2/7+rand(-.2,.2),len:R*rand(.8,1.2),s:Math.floor(rand(0,9))}))});
  gThump(.4,110);
}
// ---------- logique ----------
const gHost=()=>!NET.guest;
// Sons des sorts de terrain : cast = lancer, imp = impact ou déclenchement, blk = mur qui bloque
const SFXG={dmeteor:{imp:752},shands:{imp:856},awave:{imp:664},tidal:{imp:803},embers:{imp:849},epsy:{imp:771},
  sandstorm:{imp:779},psyterrain:{imp:766},blizzard:{imp:790},leech:{imp:808},
  spikes:{imp:735},curse:{imp:891},amine:{imp:818},tspikes:{imp:876},icespike:{imp:790},whirl:{imp:755},firering:{imp:669},embermine:{imp:801},
  lscreen:{blk:851},rwall:{blk:789},steelwall:{blk:789},thorns:{blk:745},mbarrier:{blk:852}};
let _sfxAt=0;
function sfxG(id,key,vol,rate,x){const m=SFXG[id]; if(!m||!m[key]||typeof sfx!=="function")return; const t=performance.now(); if(t-_sfxAt<45)return; _sfxAt=t; sfx(m[key],"fight",vol==null?.7:vol,rate||(0.94+Math.random()*.12),x)}
const GSEEN=new Set(); function once(k){if(GSEEN.has(k))return false; if(GSEEN.size>800)GSEEN.clear(); GSEEN.add(k); return true}
function gHit(z,t,spell,x,y,C,mult){
  const ok=strike(z.o,t,spell,{from:{x,y},pal:gpal(z.g),push:C.push||0,stun:C.stun||0,mult:mult||1});
  if(ok){if(C.slow)t.slow=Math.max(t.slow,C.slow); if(C.burn)applyBurn(t,z.o); if(C.psn)t.psn=Math.max(t.psn||0,C.psn)}
  return ok;
}
ZONE2.gz=(z,i,dt)=>{
  const C=GZ[z.g], sp=SPL[z.g], pal=gpal(z.g), t=foeOf(z.o), live=alive(t)&&!t.tunnel;
  if(C.kind==="impacts"){
    let allDone=true;
    z.pts.forEach((p,pi)=>{
      if(p.f&&!(z.t<p.d))return;
      if(z.t>=p.d){p.f=1; if(once(z.u+"i"+pi))gImpact(p.x,p.y,pal,C.style,C.r,false,z.g); if(gHost()&&live&&gdist(t.x-p.x,t.y-p.y)<C.r+t.sp.body*.3&&once(z.u+"h"+pi))gHit(z,t,sp,p.x,p.y,C)}
      else allDone=false;
    });
    return allDone&&z.t>Math.max(...z.pts.map(p=>p.d))+.45;
  }
  if(C.kind==="field"){
    if(!z.done&&z.t>=C.delay){z.done=true; z.tk=C.tick}
    if(z.done&&once(z.u+"f"))gImpact(z.x,z.y,pal,C.style,C.r,true,z.g);
    if(z.done&&z.tk===undefined)z.tk=C.tick;
    if(z.done){
      z.tk-=dt; const inside=live&&gdist(t.x-z.x,t.y-z.y)<C.r, own=alive(z.o)&&gdist(z.o.x-z.x,z.o.y-z.y)<C.r;
      // particules d'ambiance
      const R=C.r, N=C.style==="snow"?40:C.style==="sand"?30:16;
      if(Math.random()<dt*N){const a=rand(0,Math.PI*2),r=Math.sqrt(Math.random())*R,px=z.x+Math.cos(a)*r,py=z.y+Math.sin(a)*r*ISO;
        if(C.style==="snow")spark(px+rand(-20,20),py-rand(30,60),rand(-40,-15),rand(90,140),rand(.4,.6),Math.random()<.5?"#ffffff":ICEC[2],0,Math.random()<.3?3:2);
        else if(C.style==="sand")spark(px-20,py-rand(0,10),rand(120,190),rand(-12,12),rand(.3,.5),["#d1a35c","#e8d8a0","#8a6030"][Math.floor(rand(0,3))],0,2);
        else if(C.style==="whirl"){const ang=Math.atan2(py-z.y,(px-z.x)),sp2=70;spark(px,py,-Math.sin(ang)*sp2,Math.cos(ang)*sp2*.5-rand(0,25),rand(.4,.7),Math.random()<.5?WATERC[2]:"#ffffff",0,2)}
        else if(C.style==="psyfield")spark(px,py,rand(-6,6),-rand(30,80),rand(.5,.9),PSYC[1+Math.floor(rand(0,3))],-20,2);
        else spark(px,py,rand(-8,8),-rand(20,60),rand(.5,.9),GRASSC[1+Math.floor(rand(0,3))],-10,2)}
      if(C.style==="leech"&&inside&&Math.random()<dt*14){const sx=t.x+rand(-6,6),sy=t.y-t.sp.body*.6,dx=z.o.x-sx,dy=(z.o.y-z.o.sp.body*.6)-sy,d=Math.hypot(dx,dy)||1;spark(sx,sy,dx/d*120,dy/d*120,Math.min(.6,d/120),GRASSC[2+Math.floor(rand(0,2))],0,2)}
      if(inside&&C.slow&&gHost())t.slow=Math.max(t.slow,.3);
      if(z.tk<=0){z.tk=C.tick;
        if(gHost()){
          if(inside&&!t.shieldOn){const dm=Math.max(1,Math.round(calcDamage(z.o,t,sp)*C.dot)); applyDamage(t,z.o,{x:z.x,y:z.y},dm,{dot:true}); colorBurst(t.x,t.y-8,5,pal,10,50);
            if(C.drain&&alive(z.o)){const h=Math.max(1,Math.round(dm*C.drain));z.o.hp=Math.min(z.o.maxHp,z.o.hp+h);pops.push({x:z.o.x,y:z.o.y-z.o.sp.body-22,t:0,txt:"+"+h});colorBurst(z.o.x,z.o.y-12,6,pal,10,50)}}
          if(own&&C.healOwner){const h=Math.round(z.o.maxHp*C.healOwner);z.o.hp=Math.min(z.o.maxHp,z.o.hp+h);pops.push({x:z.o.x,y:z.o.y-z.o.sp.body-22,t:0,txt:"+"+h});colorBurst(z.o.x,z.o.y-12,8,pal,10,60)}
        }
      }
    }
    return z.t>C.delay+C.life;
  }
  if(C.kind==="mine"){
    if(z.done){if(once(z.u+"m"))gImpact(z.x,z.y,pal,C.style==="spikes"?"rock":C.style,C.r,true,z.g); return z.t>z.tt+.5}
    if(z.t>C.life)return true;
    if(z.t>=.7&&live&&gdist(t.x-z.x,t.y-z.y)<C.r&&gHost()){
      z.done=true; z.tt=z.t;
      gHit(z,t,sp,z.x,z.y,C,1);
    }
    return false;
  }
  if(C.kind==="wall"){
    if(C.touch&&gHost()&&live&&alive(t)){
      z.tk=(z.tk===undefined?0:z.tk)-dt;
      const near=z.c.some(c=>gdist(t.x-c.x,t.y-c.y)<C.cr+10);
      if(C.touch==="burn"&&near&&!t.shieldOn){applyBurn(t,z.o)}
      if(C.touch==="dmg"&&near&&z.tk<=0&&!t.shieldOn){z.tk=C.tick;applyDamage(t,z.o,{x:z.x,y:z.y},Math.max(1,Math.round(calcDamage(z.o,t,sp)*C.dot)),{dot:true});colorBurst(t.x,t.y-8,4,GRASSC,10,40)}
    }
    // poussière et énergie le long du mur
    if(Math.random()<dt*10){const c=z.c[Math.floor(Math.random()*z.c.length)];
      if(C.style==="flames")spark(c.x+rand(-5,5),c.y-6,rand(-6,6),-rand(40,90),rand(.4,.7),FLAMEC[1+Math.floor(rand(0,3))],-30,Math.random()<.4?3:2);
      else if(C.style==="screen"||C.style==="mirror")spark(c.x+rand(-5,5),c.y-rand(4,28),0,-rand(10,40),rand(.5,.9),(C.style==="mirror"?PSYC:PINK)[1+Math.floor(rand(0,3))],0,2);
      else if(C.style==="thorns")spark(c.x+rand(-5,5),c.y-4,rand(-8,8),-rand(10,30),rand(.4,.7),GRASSC[1+Math.floor(rand(0,3))],10,2);
      else if(z.t<.4)spark(c.x+rand(-8,8),c.y-2,rand(-30,30),-rand(10,50),rand(.3,.5),"rgba(216,200,144,.7)",-10,4)}
    return z.t>C.life;
  }
  return true;
};
// blocage des projectiles et des déplacements
function wallsOf(){return zones.filter(z=>z.k==="gz"&&GZ[z.g]&&GZ[z.g].kind==="wall"&&z.t>.12&&z.t<GZ[z.g].life)}
function wallOrb(o){
  if(NET.guest)return false;
  for(const z of wallsOf()){
    const C=GZ[z.g]; if(C.block==="none")continue;
    if(C.block==="foe"&&o.o===z.o)continue;
    for(const c of z.c){
      if(gdist(o.x-c.x,o.y-c.y)<C.cr+4){
        const pal=gpal(z.g); rings.push({x:o.x,y:o.y-10,t:0,dur:.25,max:16,c:pal[2]}); colorBurst(o.x,o.y-10,10,pal,30,110);
        if(C.reflect){o.vx=-o.vx;o.vy=-o.vy;sfxG(z.g,"blk",.9,null,o.x); o.o=z.o;o.trav=0;o.x+=o.vx*8;o.y+=o.vy*8;pops.push({x:o.x,y:o.y-24,t:0,txt:"Renvoyé !"});fx.push({k:"star",x:o.x,y:o.y-12,sy:o.y+.7,t:0,life:.35,r:12,col:"#ffe0f8"});return false}
        sfxG(z.g,"blk",.8,null,o.x); gThump(.2,160); return true;
      }
    }
  }
  return false;
}
function wallPush(e){
  if(e.rush||e.tunnel||e.ko>0||e.swapC)return;
  for(const z of wallsOf()){
    const C=GZ[z.g]; if(C.block==="none")continue; if(C.block==="foe"&&e===z.o)continue;
    for(const c of z.c){
      const min=C.cr+e.sp.body*.35+2; let dx=e.x-c.x, dy=(e.y-c.y)/ISO, d=Math.hypot(dx,dy);
      if(d<min){if(d<.01){dx=1;dy=0;d=1} e.x=c.x+dx/d*min; e.y=c.y+dy/d*min*ISO; e.x=clampX(e.x); e.y=clampY(e.y)}
    }
  }
}
// ---------- dessin ----------
function gPanel(x0,y0,x1,y1,h,col,a,scan){
  const n=Math.max(1,Math.round(Math.max(Math.abs(x1-x0),Math.abs(y1-y0))));
  for(let i=0;i<=n;i++){const x=Math.round(x0+(x1-x0)*i/n), y=Math.round(y0+(y1-y0)*i/n);
    ctx.globalAlpha=a*(.55+.45*Math.sin(scan*6+i*.5)); ctx.fillStyle=col; ctx.fillRect(x-2,y-h,5,h);}
  ctx.globalAlpha=1;
}
ZONE2D.gz=z=>{
  const C=GZ[z.g], pal=gpal(z.g), now=performance.now()/1000, x=Math.round(z.x), y=Math.round(z.y);
  if(C.kind==="impacts"){
    const many=z.pts.length>7?.55:1; z.pts.forEach(p=>{ if(p.f)return; ctx.globalAlpha=many; const u=clamp(z.t/p.d,0,1), R=C.r, ry=Math.round(R*ISO), px=Math.round(p.x), py=Math.round(p.y);
      ellipseRows(px,py,R,ry,"rgba(255,255,255,"+(.05+.14*u).toFixed(2)+")");
      ellipseRows(px,py,R,ry,hexA(pal[1],.12+.22*u)); ellipseLine(px,py,R,ry,Math.floor(now*14)%2&&u>.7?"#ffffff":pal[2]);
      ellipseLine(px,py,Math.max(2,Math.round(R*(1-u))),Math.max(1,Math.round(ry*(1-u))),pal[3]);
      if(C.style==="fire"||C.style==="ghost"){ctx.fillStyle=pal[2];for(let k=0;k<3;k++)ctx.fillRect(px-R*.5+k*R*.5,py-Math.round(2+u*6+Math.sin(now*10+k)*2),2,Math.round(3+u*6))}ctx.globalAlpha=1});
    return;
  }
  if(C.kind==="field"){
    const R=C.r, ry=Math.round(R*ISO);
    if(!z.done){const u=clamp(z.t/C.delay,0,1); ellipseRows(x,y,R,ry,hexA(pal[1],.1+.2*u)); ellipseLine(x,y,R,ry,Math.floor(now*12)%2&&u>.7?"#ffffff":pal[2]); return}
    const u=clamp((z.t-C.delay)/C.life,0,1), fade=clamp((1-u)/.2,0,1); ctx.globalAlpha=fade;
    ellipseRows(x,y,R,ry,hexA(pal[0],.38)); ellipseRows(x,y,Math.round(R*.72),Math.round(ry*.72),hexA(pal[1],.28)); ellipseRows(x,y,Math.round(R*.4),Math.round(ry*.4),hexA(pal[2],.16));
    ellipseLine(x,y,R,ry,pal[2]);
    for(let k=0;k<12;k++){const a=now*(C.style==="sand"||C.style==="snow"?2.2:-1.2)+k*Math.PI/6; ctx.fillStyle=k%2?pal[3]:pal[2]; ctx.fillRect(Math.round(x+Math.cos(a)*R),Math.round(y+Math.sin(a)*ry),2,2)}
    if(C.style==="psyfield"||C.style==="leech"){const r2=Math.round(R*(.5+.2*Math.sin(now*3)));ellipseLine(x,y,r2,Math.round(r2*ISO),pal[3])}
    ctx.globalAlpha=1; return;
  }
  if(C.kind==="mine"){
    const R=C.r, ry=Math.round(R*ISO), mine=z.o===player||(NET.on&&z.o===foe&&false);
    if(z.done){const u=clamp((z.t-z.tt)/.5,0,1); ctx.globalAlpha=1-u; ellipseLine(x,y,Math.round(R*(1+u)),Math.round(ry*(1+u)),pal[3]); ctx.globalAlpha=1; return}
    const armed=z.t>=.7, a=(z.o===player?1:.55)*(armed?1:.5)*(z.t>C.life-2?(.4+.6*Math.abs(Math.sin(now*8))):1), pulse=Math.sin(now*5)*.5+.5;
    ctx.globalAlpha=a; ellipseRows(x,y,R,ry,hexA(pal[0],.28)); ellipseLine(x,y,R,ry,armed?pal[2]:pal[1]); ellipseLine(x,y,Math.round(R*.55),Math.round(ry*.55),hexA(pal[3],.4+.5*pulse));
    ctx.fillStyle=pal[3];
    if(C.style==="spikes"||C.style==="ice"){for(let k=0;k<6;k++){const g=k*Math.PI/3+.3,px=Math.round(x+Math.cos(g)*R*.45),py=Math.round(y+Math.sin(g)*ry*.45),h=4+Math.round(pulse*2);ctx.fillRect(px,py-h,1,h);ctx.fillRect(px-1,py-h+2,3,h-2);ctx.fillRect(px,py-h-1,1,1)}}
    else if(C.style==="curse"){for(let k=0;k<4;k++){const g=k*Math.PI/2+now*1.5,px=Math.round(x+Math.cos(g)*R*.5),py=Math.round(y+Math.sin(g)*ry*.5);ctx.fillStyle=pal[3];ctx.fillRect(px,py-5-Math.round(pulse*3),2,5)}ctx.fillStyle=pal[2];ctx.fillRect(x-3,y-3,7,1);ctx.fillRect(x,y-6,1,7)}
    else if(C.style==="aura"){ctx.fillStyle=pal[3];for(let k=0;k<3;k++){const g=k*Math.PI*2/3-Math.PI/2+now,px=Math.round(x+Math.cos(g)*R*.5),py=Math.round(y+Math.sin(g)*ry*.5);ctx.fillRect(px-1,py-1,3,3)}pxLine(x-6,y+2,x,y-5,pal[2]);pxLine(x,y-5,x+6,y+2,pal[2]);pxLine(x+6,y+2,x-6,y+2,pal[2])}
    else {for(let k=0;k<3;k++){const bx=Math.round(x+Math.cos(k*2.1+now)*R*.4),by=Math.round(y+Math.sin(k*2.1+now)*ry*.4)-Math.round(((now*2+k)%1)*8);ctx.fillStyle=pal[2];ctx.fillRect(bx,by,3,3);ctx.fillStyle=pal[3];ctx.fillRect(bx+1,by,1,1)}}
    ctx.globalAlpha=1; return;
  }
  if(C.kind==="wall"){
    const rise=clamp(z.t/.25,0,1), fade=clamp((C.life-z.t)/.5,0,1), H=Math.round(30*rise);
    ctx.globalAlpha=fade;
    ctx.fillStyle="rgba(0,0,0,.25)"; z.c.forEach(c=>ellipseRows(Math.round(c.x),Math.round(c.y),C.cr,Math.round(C.cr*ISO),"rgba(0,0,0,.22)"));
    if(C.style==="rocks"){z.c.forEach((c,i)=>boulder(Math.round(c.x),Math.round(c.y)-Math.round((1-rise)*-14)-C.cr+4+Math.round((1-rise)*14),C.cr-1,i*1.7+z.x))}
    else if(C.style==="screen"||C.style==="mirror"){
      const col1=C.style==="mirror"?PSYC[1]:PINK[1], col2=C.style==="mirror"?"#ffffff":PINK[2];
      for(let i=0;i<z.c.length-1;i++){const a=z.c[i],b=z.c[i+1]; gPanel(a.x,a.y,b.x,b.y,H,col1,.45,now+i); gPanel(a.x,a.y,b.x,b.y,Math.round(H*.5),col2,.25,now*1.7+i);ctx.fillStyle=col2;ctx.globalAlpha=fade*.9;pxLine(a.x,a.y-H,b.x,b.y-H,col2);ctx.globalAlpha=fade}
      z.c.forEach(c=>{ellipseRows(Math.round(c.x),Math.round(c.y),7,4,hexA(col1,.35));ctx.fillStyle=PSYC[3];ctx.fillRect(Math.round(c.x)-1,Math.round(c.y)-H,3,H);ctx.fillStyle=col2;ctx.fillRect(Math.round(c.x),Math.round(c.y)-H-2,1,3)});
      const sy=((now*60)%Math.max(1,H)); ctx.fillStyle="rgba(255,255,255,.5)"; for(let i=0;i<z.c.length-1;i++){const a=z.c[i],b=z.c[i+1];pxLine(a.x,a.y-sy,b.x,b.y-sy,"rgba(255,255,255,.5)")}
    }
    else if(C.style==="steel"){
      z.c.forEach((c,i)=>{const cx=Math.round(c.x),cy=Math.round(c.y),h=Math.round(26*rise);
        ctx.fillStyle=STEELC[3];ctx.fillRect(cx-6,cy-h,13,h);ctx.fillStyle=STEELC[0];ctx.fillRect(cx-5,cy-h,11,h);ctx.fillStyle=STEELC[1];ctx.fillRect(cx-5,cy-h,3,h);ctx.fillStyle="#ffffff";ctx.fillRect(cx-4,cy-h+2,1,Math.max(1,h-6));
        ctx.fillStyle=STEELC[3];ctx.fillRect(cx-6,cy-Math.round(h*.5),13,1);ctx.fillStyle=STEELC[2];ctx.fillRect(cx-6,cy-h-1,13,2);
        const gl=Math.floor(now*5+i)%6===0;if(gl){ctx.fillStyle="#ffffff";ctx.fillRect(cx+1,cy-h+4,2,2)}})}
    else if(C.style==="flames"){
      z.c.forEach((c,i)=>{for(let k=-1;k<=1;k++){const h=Math.round((10+8*Math.sin(now*11+i*2+k))*rise+4), fx0=Math.round(c.x)+k*4;
        ctx.fillStyle=FLAMEC[0];ctx.fillRect(fx0-2,Math.round(c.y)-h,5,h);ctx.fillStyle=FLAMEC[1];ctx.fillRect(fx0-1,Math.round(c.y)-h-3,3,h);ctx.fillStyle=FLAMEC[2];ctx.fillRect(fx0,Math.round(c.y)-h-6,2,h-2);ctx.fillStyle=FLAMEC[3];ctx.fillRect(fx0,Math.round(c.y)-h+1,1,Math.max(2,h-5))}})}
    else if(C.style==="thorns"){
      z.c.forEach((c,i)=>{const cx=Math.round(c.x),cy=Math.round(c.y);for(let k=-1;k<=1;k++){const h=Math.round((12+Math.sin(i*3+k)*4)*rise),px=cx+k*4;
        ctx.fillStyle=GRASSC[0];ctx.fillRect(px-1,cy-h,3,h);ctx.fillStyle=GRASSC[1];ctx.fillRect(px,cy-h,1,h);
        ctx.fillStyle="#d8e8a0";ctx.fillRect(px-3,cy-Math.round(h*.6),2,1);ctx.fillRect(px+2,cy-Math.round(h*.35),2,1);ctx.fillRect(px,cy-h-2,1,2)}})}
    ctx.globalAlpha=1;
  }
};
function hexA(hex,a){const n=parseInt(hex.slice(1),16);return "rgba("+((n>>16)&255)+","+((n>>8)&255)+","+(n&255)+","+a.toFixed(2)+")"}
// ---------- IA ----------
function botAce4(e,t,d,threat,go,ok,rnd){
  for(const id of e.kit){
    const C=GZ[id]; if(!C||!ok(id))continue;
    if(C.kind==="wall"){ if((threat||C.touch)&&d>55&&d<150&&rnd(C.touch?.35:.5)){go(id,false,0);return true} continue }
    if(C.kind==="impacts"&&C.range===0){ if(d<95&&rnd(.55)){go(id,false,0);return true} continue }
    if(C.kind==="impacts"){ if(d<C.range+25&&rnd(.5)){go(id,false,.5);return true} continue }
    if(C.kind==="field"){ if(d<C.range&&rnd(.4)){go(id,false,.35);return true} continue }
    if(C.kind==="mine"){ if(d<C.range&&rnd(.3)){go(id,false,.6);return true} continue }
  }
  return false;
}
// ---------- ajout aux kits ----------
const NEWPOOL={garchomp:["sandstorm","dmeteor"],gardevoir:["psyterrain","lscreen"],aggron:["rwall","spikes"],gengar:["shands","curse"],lucario:["awave","amine"],greninja:["tidal","tspikes"],charizard:["fwall","embers"],mamoswine:["blizzard","icespike"],sceptile:["leech","thorns"],mewtwo:["mbarrier","epsy"]};
Object.keys(NEWPOOL).forEach(k=>{if(SPECIES[k])NEWPOOL[k].forEach(id=>{if(!SPECIES[k].pool.includes(id))SPECIES[k].pool.push(id)})});

// les bots emportent parfois un sort de terrain
const _botEquip=botEquip;
botEquip=function(e,o){
  _botEquip(e,o); if(!e||!e.sp||!e.sp.pool||!DF().kit||Math.random()<.4)return;
  const c=e.sp.pool.filter(id=>GZ[id]&&!e.kit.includes(id)); if(!c.length)return;
  const val=id=>{const s=SPL[id]; return (s.cat==="status"||s.self||!s.power)?999:s.power};
  let wi=-1,wv=1e9; e.kit.forEach((id,i)=>{const v=val(id); if(v<wv){wv=v;wi=i}});
  if(wi>=0)e.kit[wi]=c[Math.floor(Math.random()*c.length)];
};
buildMenu();
