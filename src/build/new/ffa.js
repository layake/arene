/* ===== Mêlée générale (chacun pour soi, 3 ou 4 combattants, 2 Pokémon chacun) : le dernier debout gagne =====
   Le moteur gère N combattants via foesOf/foeOf (c.js). Ici : départ, élimination, cibles des bots, HUD et fin de partie. */
let FFA={n:4,out:[],endT:0};
function ffaSpawn(i,n){ // en cercle autour du centre de l'arène, jamais collé à un obstacle
  const cx=(AB.x0+AB.x1)/2, cy=(AB.y0+AB.y1)/2, a=-Math.PI*.75+i*2*Math.PI/n, P=[clampX(cx+Math.cos(a)*120),clampY(cy+Math.sin(a)*78)];
  for(let it=0;it<6;it++)OBST.forEach(c=>{if(c.dead)return; const dx=P[0]-c.x, dy=P[1]-c.y, d=Math.hypot(dx,dy)||1, m=c.r+30; if(d<m){P[0]+=dx/d*(m-d); P[1]+=dy/d*(m-d)}});
  return P;
}
function ffaBot(keys){ // un bot avec 2 Pokémon
  const e=makeFighter(keys[0],0,0,true); initTeam(e,keys,keys.map(k=>SPECIES[k].kit)); return e;
}
function ffaStart(keys,roster){ // roster (en ligne) : liste de combattants déjà créés ; sinon : le joueur + des bots
  matchMode="ffa"; endShown=false; score.me=0; score.foe=0; FFA.out=[]; FFA.endT=0;
  if(roster){entities=roster}
  else{
    keys=keys.slice(0,2);
    player=makeFighter(keys[0],0,0,false,kitOf(keys[0])); if(keys.length>1)initTeam(player,keys);
    const pool=Object.keys(SPECIES).filter(k=>SPECIES[k].playable&&!keys.includes(k)).sort(()=>Math.random()-.5);
    entities=[player]; for(let i=1;i<FFA.n;i++)entities.push(ffaBot(pool.splice(0,2)));
  }
  fighters=entities.filter(e=>e.fighter); foe=fighters.find(e=>e!==player)||player;
  resetRound();
  fighters.forEach(e=>{if(e.bot)botEquip(e,foeOf(e))});
  if(typeof applyKit==="function")applyKit();
  if(typeof showVersus==="function")showVersus(player.team?player.team.map(s=>s.key):[player.key],fighters.filter(e=>e!==player).map(e=>e.key),"TOI",fighters.length+" JOUEURS");
  ffaHud();
}
function ffaOut(t,att){ // plus aucun Pokémon : le combattant est éliminé
  t.out=true; t.ko=2.2; FFA.out.push(t);
  const left=fighters.filter(e=>!e.out);
  if(typeof showBanner==="function"){
    if(t===player)showBanner(LANG==="en"?"ELIMINATED":"ÉLIMINÉ","lose");
    else if(left.length>1)showLog((t.name||t.sp.name)+" est éliminé !",1600);
  }
  if(left.length<=1&&!NET.guest)FFA.endT=2.4;
}
function ffaRank(e){ // 1 = vainqueur
  const i=FFA.out.indexOf(e); return i<0?1:fighters.length-i;
}
function ffaTick(dt){
  if(matchMode!=="ffa"||endShown)return;
  // les bots choisissent leur cible : la plus proche, avec une préférence pour la plus affaiblie
  fighters.forEach(e=>{
    if(!e.bot||e.out)return; e.tgtT=(e.tgtT||0)-dt; if(e.tgtT>0&&e.tgt&&!e.tgt.out&&alive(e.tgt))return; e.tgtT=rand(1.2,2.2);
    let best=null,bs=1e9; for(const t of foesOf(e)){if(t.out||!alive(t))continue; const s=Math.hypot(t.x-e.x,t.y-e.y)*(.6+.4*t.hp/t.maxHp); if(s<bs){bs=s;best=t}} e.tgt=best;
  });
  if(FFA.endT>0){FFA.endT-=dt; if(FFA.endT<=0&&typeof showResult==="function")showResult()}
  ffaHud();
}
FX_UPDATERS.push(ffaTick);
// ---- HUD : liste des autres combattants (nom, PV, Pokémon restants) ----
const ffaEl=document.createElement("div"); ffaEl.id="ffaList"; ffaEl.hidden=true; (document.getElementById("stage")||document.body).appendChild(ffaEl);
{const st=document.createElement("style"); st.textContent='#ffaList{position:absolute;right:12px;top:118px;z-index:3;display:flex;flex-direction:column;gap:4px;pointer-events:none;font:700 12px "Pixelify Sans",system-ui,sans-serif;color:#fff}#ffaList .fr{display:flex;align-items:center;gap:6px;background:rgba(14,16,28,.78);border:2px solid #e8e8f0;border-radius:6px;padding:3px 6px;min-width:180px}#ffaList .fr.tg{border-color:#ffe45e}#ffaList .fr.out{opacity:.4}#ffaList img{width:24px;height:24px;image-rendering:pixelated}#ffaList u{flex:1;height:6px;background:#202838;display:block}#ffaList u s{display:block;height:100%;background:#5fd35f}#ffaList em{font-style:normal;color:#ffe45e}'; document.head.appendChild(st)}
let ffaSig="";
function ffaHud(){
  const on=matchMode==="ffa"&&!menuOpen; ffaEl.hidden=!on; if(!on)return;
  const rows=fighters.filter(e=>e!==player).map(e=>{const hp=e.out?0:Math.max(0,e.hp/e.maxHp), rest=e.team?teamAlive(e):(alive(e)?1:0);
    return '<div class="fr'+(e===foe&&!e.out?' tg':'')+(e.out?' out':'')+'"><img alt="" src="'+(PORTRAITS[e.key]||"")+'"><span>'+(e.pname||e.sp.name)+'</span><u><s style="width:'+Math.round(hp*100)+'%"></s></u><em>'+(e.out?(LANG==="en"?"OUT":"OUT"):rest+"/"+(e.team?e.team.length:1))+'</em></div>'});
  const sig=rows.join(""); if(sig!==ffaSig){ffaSig=sig; ffaEl.innerHTML=sig}
}
// ---- Fin de partie : classement ----
setTimeout(()=>{const _sr=showResult; showResult=function(){
  if(matchMode!=="ffa")return _sr.apply(this,arguments);
  if(endShown)return; endShown=true; hideBanner();
  const r=ffaRank(player), win=r===1, order=fighters.slice().sort((a,b)=>ffaRank(a)-ffaRank(b));
  endEl.className=win?"win":"lose";
  endEl.innerHTML='<div class="ebox"><h2>'+(win?"VICTOIRE":r+(r===1?"er":"e")+" / "+fighters.length)+'</h2><ol class="frank">'+order.map(e=>'<li'+(e===player?' class="me"':'')+'><img alt="" src="'+(PORTRAITS[e.key]||"")+'">'+(e===player?"Toi":(e.pname||e.sp.name))+'</li>').join("")+'</ol><div class="ebtn">'+(NET.on?"":'<button type="button" id="eRe">Rejouer</button>')+'<button type="button" id="eMenu">'+(NET.on?"Retour au salon":"Sélection d'équipe")+'</button></div></div>';
  endEl.hidden=false; try{sfxUI(win?"ko":"click")}catch(_){}
  const re=endEl.querySelector("#eRe"); if(re)re.onclick=()=>{hideResult(); startMatch(picks.slice(),"ffa")};
  endEl.querySelector("#eMenu").onclick=()=>{hideResult(); openMenu()};
}},0);
{const st=document.createElement("style"); st.textContent='#endscr .frank{margin:0;padding:0 0 0 22px;text-align:left;color:#cfd8ff;font-size:15px}#endscr .frank li{margin:2px 0}#endscr .frank li.me{color:#ffe45e}#endscr .frank img{width:22px;height:22px;image-rendering:pixelated;vertical-align:middle;margin-right:6px}'; document.head.appendChild(st)}
// ---- bouton « Mêlée » dans la sélection solo ----
{const modes=document.querySelector("#menu .modes"); if(modes){const b=document.createElement("button"); b.type="button"; b.dataset.mode="ffa"; b.innerHTML='Mêlée<small>4 combattants, chacun pour soi</small>'; const after=modes.querySelector('[data-mode="duel"]'); modes.insertBefore(b,after?after.nextSibling:null); b.addEventListener("click",()=>{pickMode="ffa";refreshMenu()})}}
