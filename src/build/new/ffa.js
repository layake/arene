/* ===== Mêlée générale (chacun pour soi, 3 ou 4 combattants, 2 Pokémon chacun) : le dernier debout gagne =====
   Le moteur gère N combattants via foesOf/foeOf (c.js). Ici : départ, élimination, cibles des bots, HUD et fin de partie. */
let FFA={n:4,out:[],endT:0,w:[],round:1,need:1,nextT:0,t:0,warned:false,hurt:0};
function ffaSpawn(i,n){ // en cercle autour du centre de l'arène, jamais collé à un obstacle
  const cx=(AB.x0+AB.x1)/2, cy=(AB.y0+AB.y1)/2, a=-Math.PI*.75+i*2*Math.PI/n, P=[clampX(cx+Math.cos(a)*120),clampY(cy+Math.sin(a)*78)];
  for(let it=0;it<6;it++)OBST.forEach(c=>{if(c.dead)return; const dx=P[0]-c.x, dy=P[1]-c.y, d=Math.hypot(dx,dy)||1, m=c.r+30; if(d<m){P[0]+=dx/d*(m-d); P[1]+=dy/d*(m-d)}});
  return P;
}
function ffaBot(keys){ // un bot avec 2 Pokémon
  const e=makeFighter(keys[0],0,0,true); initTeam(e,keys,keys.map(k=>SPECIES[k].kit)); return e;
}
function ffaStart(keys,roster){ // roster (en ligne) : liste de combattants déjà créés ; sinon : le joueur + des bots
  matchMode="ffa"; endShown=false; score.me=0; score.foe=0; FFA.out=[]; FFA.endT=0; FFA.nextT=0; FFA.round=1; FFA.t=0; FFA.warned=false; FFA.need=winsNeeded();
  if(roster){entities=roster}
  else{
    keys=keys.slice(0,2);
    player=makeFighter(keys[0],0,0,false,kitOf(keys[0])); if(keys.length>1)initTeam(player,keys);
    const pool=Object.keys(SPECIES).filter(k=>SPECIES[k].playable&&!keys.includes(k)).sort(()=>Math.random()-.5);
    entities=[player]; for(let i=1;i<FFA.n;i++)entities.push(ffaBot(pool.splice(0,2)));
  }
  fighters=entities.filter(e=>e.fighter); foe=fighters.find(e=>e!==player)||player; fighters.forEach((e,i)=>{e.col=FFA_COL[i%4]}); FFA.w=fighters.map(()=>0);
  resetRound();
  fighters.forEach(e=>{if(e.bot)botEquip(e,foeOf(e))});
  if(typeof applyKit==="function")applyKit();
  ffaVersus();
  ffaHud();
}
function ffaOut(t,att){ // plus aucun Pokémon : le combattant est éliminé
  if(t.out)return; // déjà éliminé : un projectile ou une zone qui traîne ne doit ni réafficher la bannière ni doubler le classement
  t.out=true; t.ko=2.2; FFA.out.push(t);
  const left=fighters.filter(e=>!e.out);
  if(typeof showBanner==="function"){
    if(t===player)showBanner(LANG==="en"?"ELIMINATED":"ÉLIMINÉ","lose");
    else if(left.length>1)showLog((t.pname||t.sp.name)+(LANG==="en"?" is out!":" est éliminé !"),1600);
  }
  if(left.length<=1&&!NET.guest)FFA.endT=2.4;
}
// fin d'une manche : le dernier debout marque un point ; le premier à `need` points gagne la partie
function ffaRoundEnd(){
  const win=fighters.find(e=>!e.out)||FFA.out[FFA.out.length-1], i=fighters.indexOf(win);
  if(i>=0)FFA.w[i]=(FFA.w[i]||0)+1;
  if(Math.max(0,...FFA.w)>=FFA.need){if(typeof showResult==="function")showResult();return}
  FFA.round++; FFA.nextT=2.6; ffaRoundMsg(i);
  if(NET.ffa&&NET.host&&NET.ffaSend)NET.ffaSend({t:"fround",w:FFA.w,r:FFA.round,win:i});
}
function ffaRoundMsg(i){
  const e=fighters[i], n=e?ffaName(e):"?";
  if(typeof showBanner==="function")showBanner((LANG==="en"?"ROUND WON: ":"MANCHE : ")+n,e===player?"win":"lose");
}
function ffaNextRound(){
  FFA.out=[]; FFA.endT=0; FFA.t=0; FFA.warned=false; resetRound();
}
function ffaRank(e){ // 1 = vainqueur
  const i=FFA.out.indexOf(e); return i<0?1:fighters.length-i;
}
// ---- ring : si la manche dure trop longtemps, la zone sûre se resserre vers le centre (proportionnelle à la taille de l'arène) ----
const RING={t0:75,dur:40,min:.3,dps:.05};
function ffaRing(){
  const cx=(AB.x0+AB.x1)/2, cy=(AB.y0+AB.y1)/2, hw=(AB.x1-AB.x0)/2, hh=(AB.y1-AB.y0)/2, k=clamp((FFA.t-RING.t0)/RING.dur,0,1), f=1.45+(RING.min-1.45)*k;
  return {cx,cy,rx:hw*f,ry:hh*f,k};
}
const ringOut=(e,R)=>{const dx=(e.x-R.cx)/R.rx, dy=(e.y-R.cy)/R.ry; return dx*dx+dy*dy>1};
function ffaRingTick(dt){
  if(matchMode!=="ffa"||endShown||FFA.endT>0||FFA.nextT>0||menuOpen)return;
  if((typeof introPending!=="undefined"&&introPending)||(typeof cdT!=="undefined"&&cdT>0)||(typeof vsT!=="undefined"&&vsT>0))return;
  FFA.t+=dt;
  if(!FFA.warned&&FFA.t>=RING.t0-10){FFA.warned=true; showLog(LANG==="en"?"The ring is closing in 10 s!":"Le ring se resserre dans 10 s !",2200)}
  if(FFA.t<RING.t0)return;
  const R=ffaRing();
  fighters.forEach(e=>{ if(e.bot&&!e.out&&e.ko<=0&&ringOut(e,R)&&!NET.guest)e.moveTarget={x:R.cx,y:R.cy} });
  if(NET.guest)return;
  FFA.hurt+=dt; if(FFA.hurt<.5)return; FFA.hurt-=.5;
  fighters.forEach(e=>{ if(e.out||e.gone||e.ko>0||!alive(e)||!ringOut(e,R))return; applyDamage(e,null,null,Math.max(1,Math.round(e.maxHp*RING.dps*.5)),{dot:true}) });
}
function ffaRingDraw(){
  if(FFA.t<RING.t0-10)return;
  const R=ffaRing(), a=FFA.t<RING.t0?.35+.25*Math.sin(performance.now()/160):.4;
  ctx.save(); ctx.globalAlpha=a; ctx.fillStyle="#c01830"; ctx.beginPath(); ctx.rect(-10,-10,WORLD.w+20,WORLD.h+20); ctx.ellipse(R.cx,R.cy,R.rx,R.ry,0,0,Math.PI*2); ctx.fill("evenodd");
  ctx.globalAlpha=.9; ctx.strokeStyle="#ff6a6a"; ctx.lineWidth=1.5; ctx.beginPath(); ctx.ellipse(R.cx,R.cy,R.rx,R.ry,0,0,Math.PI*2); ctx.stroke(); ctx.restore();
}
FX_UPDATERS.push(ffaRingTick);
function ffaTick(dt){
  if(matchMode!=="ffa"||endShown)return;
  // les bots choisissent leur cible : la plus proche, avec une préférence pour la plus affaiblie
  fighters.forEach(e=>{
    if(!e.bot||e.out)return; e.tgtT=(e.tgtT||0)-dt; if(e.tgtT>0&&e.tgt&&!e.tgt.out&&alive(e.tgt))return; e.tgtT=rand(1.2,2.2);
    let best=null,bs=1e9; for(const t of foesOf(e)){if(t.out||!alive(t))continue; const s=Math.hypot(t.x-e.x,t.y-e.y)*(.6+.4*t.hp/t.maxHp); if(s<bs){bs=s;best=t}} e.tgt=best;
  });
  if(FFA.endT>0){FFA.endT-=dt; if(FFA.endT<=0)ffaRoundEnd()}
  if(FFA.nextT>0){FFA.nextT-=dt; if(FFA.nextT<=0)ffaNextRound()}
  ffaHud();
}
FX_UPDATERS.push(ffaTick);
// ---- HUD de la mêlée : une barre en haut, un panneau par joueur (couleur, pseudo, Pokémon actif, PV, Pokémon restants) ----
const FFA_COL=["#4aa8ff","#ff5a4a","#5fd35f","#ffd23c"];
const ffaEl=document.createElement("div"); ffaEl.id="ffaBar"; ffaEl.hidden=true; (document.getElementById("stage")||document.body).appendChild(ffaEl);
{const st=document.createElement("style"); st.textContent='#ffaBar{position:absolute;left:50%;top:40px;transform:translateX(-50%);z-index:3;display:flex;gap:8px;pointer-events:none;font:700 12px "Pixelify Sans",system-ui,sans-serif;color:#fff}#ffaBar .fp{display:flex;gap:6px;align-items:center;background:rgba(14,16,28,.82);border:3px solid var(--c);border-radius:6px;padding:4px 7px;width:178px;box-shadow:0 2px 0 #000a}#ffaBar .fp.me{box-shadow:0 0 0 2px #fff,0 2px 0 #000a}#ffaBar .fp.out{opacity:.35;filter:grayscale(1)}#ffaBar .fp.tg{outline:2px dashed #ffe45e;outline-offset:2px}#ffaBar img{width:34px;height:34px;image-rendering:pixelated;background:#0b1340;border:2px solid var(--c)}#ffaBar .fi{flex:1;min-width:0}#ffaBar .fn{display:flex;justify-content:space-between;gap:4px;white-space:nowrap}#ffaBar .fn b{overflow:hidden;text-overflow:ellipsis;color:var(--c)}#ffaBar .fn em{font-style:normal;color:#cfd8ff;font-size:11px}#ffaBar u{display:block;height:7px;background:#202838;margin-top:3px;border:1px solid #000}#ffaBar u s{display:block;height:100%}#ffaBar .fd{display:flex;gap:3px;margin-top:3px}#ffaBar .fd i{width:8px;height:8px;border-radius:50%;background:var(--c);border:1px solid #000}#ffaBar .fd i.x{background:#333}#ffaBar .fw{margin-left:auto;color:#ffd23c;font-size:11px;letter-spacing:1px}#ffaBar .fw s{text-decoration:none;color:#555}@media(max-width:900px){#ffaBar .fp{width:140px}}'; document.head.appendChild(st)}
let ffaSig="";
const ffaCol=e=>e.col||FFA_COL[fighters.indexOf(e)%4];
const ffaName=e=>e===player?(playerName()||(LANG==="en"?"You":"Toi")):(e.pname||(e.bot?"Bot "+e.sp.name:e.sp.name));
function ffaHud(){
  const on=matchMode==="ffa"&&!menuOpen; ffaEl.hidden=!on; if(!on)return;
  const rows=fighters.map((e,i)=>{const W=FFA.need>1?'<span class="fw">'+'★'.repeat(FFA.w[i]||0)+'<s>'+'★'.repeat(Math.max(0,FFA.need-(FFA.w[i]||0)))+'</s></span>':'';const hp=e.out?0:Math.max(0,e.hp/e.maxHp), c=hp>.5?"#5fd35f":hp>.2?"#f0c030":"#e84040", T=e.team||[{dead:!alive(e)}];
    return '<div class="fp'+(ffaDim[i]?' dim':'')+(e===player?' me':'')+(e.out?' out':'')+(e===foe&&e!==player&&!e.out?' tg':'')+'" style="--c:'+ffaCol(e)+'"><img alt="" src="'+(PORTRAITS[e.key]||"")+'"><div class="fi"><div class="fn"><b>'+ffaName(e).replace(/[<>&]/g,"")+'</b><em>'+(e.out?"OUT":e.sp.name)+'</em></div><u><s style="width:'+Math.round(hp*100)+'%;background:'+c+'"></s></u><div class="fd">'+T.map(s=>'<i'+(s.dead?' class="x"':'')+'></i>').join("")+W+'</div></div></div>'});
  const sig=rows.join(""); if(sig!==ffaSig){ffaSig=sig; ffaEl.innerHTML=sig}
}
// ---- Fin de partie : classement ----
setTimeout(()=>{const _sr=showResult; showResult=function(){
  if(matchMode!=="ffa")return _sr.apply(this,arguments);
  if(endShown)return; endShown=true; hideBanner();
  const order=fighters.slice().sort((a,b)=>(FFA.w[fighters.indexOf(b)]||0)-(FFA.w[fighters.indexOf(a)]||0)||ffaRank(a)-ffaRank(b)), r=order.indexOf(player)+1, win=r===1;
  endEl.className=win?"win":"lose";
  endEl.innerHTML='<div class="ebox"><h2>'+(win?"VICTOIRE":(LANG==="en"?r+(["","st","nd","rd"][r]||"th"):r+"e")+" / "+fighters.length)+'</h2><ol class="frank">'+order.map(e=>'<li'+(e===player?' class="me"':'')+'><img alt="" src="'+(PORTRAITS[e.key]||"")+'">'+ffaName(e)+(FFA.need>1?' <small>('+(FFA.w[fighters.indexOf(e)]||0)+')</small>':'')+'</li>').join("")+'</ol><div class="ebtn">'+(NET.on?"":'<button type="button" id="eRe">Rejouer</button>')+'<button type="button" id="eMenu">'+(NET.on?"Retour au salon":"Sélection d'équipe")+'</button></div></div>';
  endEl.hidden=false; try{sfxUI(win?"ko":"click")}catch(_){}
  const re=endEl.querySelector("#eRe"); if(re)re.onclick=()=>{hideResult(); startMatch(picks.slice(),"ffa")};
  endEl.querySelector("#eMenu").onclick=()=>{hideResult(); openMenu()};
}},0);
{const st=document.createElement("style"); st.textContent='#endscr .frank{margin:0;padding:0 0 0 22px;text-align:left;color:#cfd8ff;font-size:15px}#endscr .frank li{margin:2px 0}#endscr .frank li.me{color:#ffe45e}#endscr .frank img{width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:6px}'; document.head.appendChild(st)}
// ---- bouton « Mêlée » dans la sélection solo ----
{const modes=document.querySelector("#menu .modes"); if(modes){const b=document.createElement("button"); b.type="button"; b.dataset.mode="ffa"; b.innerHTML='Mêlée<small>4 combattants, chacun pour soi</small>'; const after=modes.querySelector('[data-mode="duel"]'); modes.insertBefore(b,after?after.nextSibling:null); b.addEventListener("click",()=>{pickMode="ffa";refreshMenu()})}}

// ---- écran d'annonce de la mêlée : tous les joueurs côte à côte ----
function ffaVersus(){
  if(typeof vsEl==="undefined")return;
  vsEl.className="ffa"; vsEl.innerHTML='<div class="fvh">'+(LANG==="en"?"BRAWL":"MÊLÉE")+' · '+fighters.length+(LANG==="en"?" PLAYERS":" JOUEURS")+'</div><div class="fvr">'+fighters.map(e=>{const T=e.team?e.team.map(s=>s.key):[e.key];
    return '<div class="fvc'+(e===player?' me':'')+'" style="--c:'+ffaCol(e)+'"><b>'+ffaName(e).replace(/[<>&]/g,"")+'</b><img alt="" src="'+(PORTRAITS[T[0]]||"")+'"><div class="fvs">'+T.slice(1).map(k=>'<img alt="" src="'+(PORTRAITS[k]||"")+'">').join("")+'</div><span>'+T.map(k=>SPECIES[k].name).join(" · ")+'</span></div>'}).join("")+'</div>';
  vsEl.hidden=false; void vsEl.offsetWidth; vsEl.classList.add("go"); vsT=2.6;
}
{const st=document.createElement("style"); st.textContent='#vs.ffa{flex-direction:column;gap:22px}#vs.ffa::before{background:linear-gradient(135deg,#1f3a9e,#5a2a9e 50%,#a02a2a)}#vs.ffa .fvh{position:relative;z-index:1;font-size:clamp(28px,5vw,56px);color:#ffe45e;text-shadow:4px 4px 0 #000;letter-spacing:4px}#vs.ffa .fvr{position:relative;z-index:1;display:flex;gap:clamp(8px,2vw,24px);flex-wrap:wrap;justify-content:center;padding:0 16px}#vs.ffa .fvc{display:flex;flex-direction:column;align-items:center;gap:6px;background:rgba(7,12,36,.7);border:4px solid var(--c);padding:10px 12px;width:clamp(130px,18vw,220px);box-shadow:6px 6px 0 rgba(0,0,0,.5)}#vs.ffa .fvc.me{outline:3px solid #fff;outline-offset:3px}#vs.ffa .fvc b{color:var(--c);font-size:clamp(14px,1.6vw,20px);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#vs.ffa .fvc>img{width:clamp(80px,10vw,140px);height:auto;aspect-ratio:1;image-rendering:pixelated;border:3px solid #000;background:#0b1340}#vs.ffa .fvs img{width:40px;height:40px;image-rendering:pixelated;border:2px solid #000}#vs.ffa .fvc span{font-size:12px;color:#cfd8ff;text-align:center}#vs.ffa.go .fvc{animation:fvin .4s steps(6) both}#vs.ffa.go .fvc:nth-child(2){animation-delay:.08s}#vs.ffa.go .fvc:nth-child(3){animation-delay:.16s}#vs.ffa.go .fvc:nth-child(4){animation-delay:.24s}@keyframes fvin{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}'; document.head.appendChild(st)}
// remettre l'écran d'annonce du 1v1 dans son état normal
{const _sv=typeof showVersus==="function"?null:null; setTimeout(()=>{const o=showVersus; showVersus=function(){vsEl.className=""; return o.apply(this,arguments)}},0)}
// ---- spectateur : une fois éliminé, la caméra suit le combat et la barre de sorts disparaît ----
function ffaSpect(){ const A=fighters.filter(e=>!e.out); return (foe&&!foe.out&&foe!==player?foe:null)||A[0]||null }
const spEl=document.createElement("div"); spEl.id="ffaSpect"; spEl.hidden=true; spEl.textContent="Tu es éliminé : tu regardes la fin du combat"; (document.getElementById("stage")||document.body).appendChild(spEl);
{const st=document.createElement("style"); st.textContent='#ffaSpect{position:absolute;left:50%;bottom:22px;transform:translateX(-50%);z-index:4;background:rgba(14,16,28,.85);border:2px solid #ff8a8a;color:#ffd0d0;padding:6px 14px;font:700 14px "Pixelify Sans",system-ui,sans-serif;pointer-events:none}#ffaBar .fp.dim{opacity:.3}'; document.head.appendChild(st)}
let ffaDimN=0; const ffaDim=[];
FX_UPDATERS.push(()=>{
  const out=matchMode==="ffa"&&player&&player.out&&!endShown&&!menuOpen;
  spEl.hidden=!out; const bar=document.getElementById("bar"); if(bar)bar.style.visibility=out?"hidden":"";
  if(out&&typeof retranslateAll==="function"&&LANG==="en"&&!spEl.__t){spEl.__t=1; retranslateAll()}
  // un panneau de la barre s'efface quand un Pokémon passe dessous
  if(matchMode!=="ffa"||ffaEl.hidden||(ffaDimN=(ffaDimN+1)%6))return;
  const r=stage.getBoundingClientRect(), k=PX/(window.devicePixelRatio||1);
  ffaEl.querySelectorAll(".fp").forEach((el,i)=>{const b=el.getBoundingClientRect();
    ffaDim[i]=fighters.some(e=>{if(e.gone)return false; const sx=r.left+(e.x-cam.x)*k, sy=r.top+(e.y-cam.y)*k, h=(e.sp.body*2+30)*k; return sx>b.left-10&&sx<b.right+10&&sy-h<b.bottom+6&&sy>b.top});
    el.classList.toggle("dim",fighters.some(e=>{if(e.gone)return false; const sx=r.left+(e.x-cam.x)*k, sy=r.top+(e.y-cam.y)*k, h=(e.sp.body*2+30)*k; return sx>b.left-10&&sx<b.right+10&&sy-h<b.bottom+6&&sy>b.top}))});
});
