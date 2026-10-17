/* ===== Equipes de 3 Aces : swap (Tab) avec animation Pokeball, KO = suivant entre, victoire a 3 KO ===== */
const SWAP={t:.5,cd:1.5,prot:1.5}; // prot : invulnérabilité de l'Ace qui entre après un KO (évite l'enchaînement)
function initTeam(e,keys,kits){
  e.team=keys.map((k,i)=>({key:k,kit:(kits&&kits[i]||kitOf(k)).slice(),hp:SPECIES[k].maxHp,maxHp:SPECIES[k].maxHp,dead:false,cd:{}}));
  e.ti=0; e.swapC=null; e.swapCd=0;
  const s=e.team[0]; e.sp=SPECIES[s.key]; e.key=s.key; e.kit=s.kit.slice(); e.maxHp=s.maxHp; e.hp=s.hp; e.cd=s.cd;
}
const teamAlive=e=>e.team?e.team.filter(s=>!s.dead).length:0;
function nextAlive(e,from){
  for(let k=1;k<=e.team.length;k++){const i=(from+k)%e.team.length; if(!e.team[i].dead&&i!==e.ti)return i}
  return -1;
}
function loadSlot(e,i,save){
  const old=e.team[e.ti], fcd=e.cd&&e.cd.flash||0;
  if(save!==false){old.hp=Math.max(0,e.hp); old.kit=e.kit.slice(); old.cd=e.cd}
  const s=e.team[i]; e.ti=i; e.sp=SPECIES[s.key]; e.key=s.key; e.kit=s.kit.slice(); e.maxHp=s.maxHp; e.hp=s.hp; e.cd=s.cd; e.cd.flash=Math.max(e.cd.flash||0,fcd);
  e.bf={}; e.rush=null; e.chan=null; e.tunnel=null; e.counter=null; e.stun=0; e.slow=0; e.burn=0; e.psn=0; e.sleep=false; e.inv=0; e.flashC=null; e.cast=null; e.kb=null; e.comboT=0; e.hit=false; e.shieldOn=false; e.shieldBroken=false; e.shieldE=100;
  e.hpShow=0; e.flash=0; e.entryProt=false; e.moveTarget=null; e.altA=null; setAnim(e,"idle"); e.frame=0; e.tick=0;
  if(e.bot&&typeof botEquip==="function"){botEquip(e,foeOf(e)); s.kit=e.kit.slice()}
  if(e===player&&typeof applyKit==="function")applyKit();
}
function resetTeam(e){
  if(!e.team)return;
  e.team.forEach(s=>{s.hp=SPECIES[s.key].maxHp; s.maxHp=s.hp; s.dead=false; s.cd={}});
  e.swapC=null; e.swapCd=0;
  if(e.ti!==0||e.key!==e.team[0].key)loadSlot(e,0,false); else{e.maxHp=e.team[0].maxHp; e.hp=e.maxHp; e.cd=e.team[0].cd}
}
function teamKO(t){ // renvoie true s'il reste un coequipier
  if(!t.team)return false;
  t.team[t.ti].dead=true; t.team[t.ti].hp=0; t.swapC=null;
  return teamAlive(t)>0;
}
function teamEnter(e){ // apres un KO : le suivant arrive tout de suite
  const j=nextAlive(e,e.ti); if(j<0)return false;
  loadSlot(e,j,false); e.ko=0; e.swapC={t:SWAP.t/2,to:-1}; e.lock=SWAP.t/2+.02; e.swapCd=SWAP.cd; e.inv=SWAP.prot; e.entryProt=true;
  ballFx(e); logFor(e,e.sp.name+" entre en jeu !",1100);
  return true;
}
function startSwap(e,to){
  if(!e.team||e.ko>0||e.stun>0||e.tunnel||e.rush||e.chan||e.counter||e.flashC||e.swapC||e.lock>0||(e.anim==="attack"&&!e.hit)||(e.swapCd||0)>0)return;
  const j=to!==undefined&&to>=0&&!e.team[to].dead&&to!==e.ti?to:nextAlive(e,e.ti); if(j<0)return;
  e.swapC={t:0,to:j}; e.lock=SWAP.t+.02; e.moveTarget=null; e.shieldOn=false; if(e===player)marker=null;
  rings.push({x:e.x,y:e.y,t:0,dur:.25,max:12,c:"#ff5a4a"}); SND.pe=e;SND.pend="tele";
}
function tickSwap(e,dt){
  if(e.swapCd>0)e.swapCd=Math.max(0,e.swapCd-dt);
  const S=e.swapC; if(!S)return;
  if(NET.guest){S.t=Math.min(SWAP.t,S.t+dt);return}
  if(e.ko>0&&S.to>=0){e.swapC=null;return}
  const before=S.t; S.t+=dt;
  if(S.to>=0&&before<SWAP.t/2&&S.t>=SWAP.t/2){loadSlot(e,S.to); S.to=-1; e.lock=SWAP.t/2+.02; ballFx(e)}
  if(S.t>=SWAP.t){e.swapC=null; e.lock=0; e.swapCd=SWAP.cd; if(e.team)logFor(e,e.sp.name+" !",700)}
}
function ballFx(e){
  const pal=["#ffffff","#ff5a4a","#ffd0c8","#e03020","#ffffff"];
  colorBurst(e.x,e.y-6,16,pal,24,90); rings.push({x:e.x,y:e.y-4,t:0,dur:.3,max:22,c:"#ffffff"});
}
const BALL_PIX=["..kkkkk..",".krrrrrk.","krhhrrrrk","krrrrrrrk","kkkkwkkkk","kwwwwwwwk","kwwwwwwgk",".kwwwggk.","..kkkkk.."];
const BALL_COL={k:"#14171c",r:"#e8402e",h:"#ff9a8a",w:"#f4f4f4",g:"#b8b8c8"};
function drawBall(x,y,r,open){
  const ox=Math.round(x)-4, oy=Math.round(y)-4;
  BALL_PIX.forEach((row,j)=>{for(let i=0;i<9;i++){const c=row[i]; if(c==="."||c===undefined)continue; ctx.fillStyle=BALL_COL[c]; ctx.fillRect(ox+i,oy+j,1,1)}});
  if(open>0){ // etincelles en pixels qui s'ecartent
    const d=Math.round(5+open*9); ctx.fillStyle="#ffffff";
    [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([dx,dy])=>{const k=dx&&dy?.7:1; ctx.fillRect(Math.round(x+dx*d*k)-1,Math.round(y+dy*d*k)-1,2,2)});
    ctx.fillStyle="#ffd0c8"; ctx.fillRect(Math.round(x)-1,Math.round(y)-d,2,2);
  }
}
function drawSwap(e){
  const S=e.swapC, half=SWAP.t/2, s=SHT(e), a=ANF(e);
  if(!s.img.complete)return;
  const out=S.to>=0, u=out?clamp(S.t/half,0,1):clamp((S.t-half)/half,0,1), sc=out?1-u:u, fx0=snap(e.x), fy0=snap(e.y);
  if(sc>.04){
    tctx.clearRect(0,0,96,96); tctx.globalCompositeOperation="source-over";
    tctx.drawImage(s.img,e.frame*s.w,e.dir*s.h,s.w,s.h,0,0,s.w,s.h);
    tctx.globalCompositeOperation="source-atop"; tctx.fillStyle=out?"rgba(255,70,50,"+(.4+.5*u).toFixed(2)+")":"rgba(255,255,255,"+(1-u).toFixed(2)+")"; tctx.fillRect(0,0,s.w,s.h); tctx.globalCompositeOperation="source-over";
    ctx.save(); ctx.translate(fx0,fy0-6); ctx.scale(sc,sc); ctx.drawImage(tmp,0,0,s.w,s.h,-a[0],-a[1]+6,s.w,s.h); ctx.restore();
  }
  const by=fy0-8-(out?Math.sin(u*Math.PI)*8:0);
  if(out&&u>.5)drawBall(fx0,by,4,0); else if(!out&&u<.6)drawBall(fx0,by,4,u/.6);
}
// IA : change d'Ace quand le sien est mal en point ou mal place face a l'adversaire (jamais en facile)
function botEdge(sp,kit,o){ // meilleur multiplicateur de type offensif moins celui que l'adversaire peut nous infliger
  const off=Math.max(1,...kit.filter(id=>SPL[id]&&SPL[id].power).map(id=>typeMult(SPL[id].type,o.sp.types)*(sp.types.includes(SPL[id].type)?1.05:1)));
  const def=Math.max(1,...o.kit.filter(id=>SPL[id]&&SPL[id].power).map(id=>typeMult(SPL[id].type,sp.types)));
  return off-def*.8;
}
function botSwapDecide(e,dt){
  if(!e.team||!e.bot||teamAlive(e)<2)return;
  e.bot.swapT=(e.bot.swapT||rand(1,2))-dt; if(e.bot.swapT>0)return; e.bot.swapT=rand(.8,1.6);
  if(e.swapC||e.lock>0||(e.swapCd||0)>0||e.ko>0||e.stun>0||DF().kit<1)return;
  const o=foeOf(e), cur=botEdge(e.sp,e.kit,o), hpf=e.hp/e.maxHp;
  let best=-1,bs=-9;
  e.team.forEach((s,i)=>{if(s.dead||i===e.ti)return; const sc=botEdge(SPECIES[s.key],s.kit,o)+s.hp/s.maxHp; if(sc>bs){bs=sc;best=i}});
  if(best<0)return;
  const cand=e.team[best], cf=cand.hp/cand.maxHp;
  if((hpf<.28&&cf>.55)||(cur<-.3&&cf>.5&&hpf>.3&&Math.random()<.5&&bs-(cur+hpf)>.5))startSwap(e,best);
}
