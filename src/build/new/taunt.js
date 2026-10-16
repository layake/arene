/* ===== Danse (taunt), pseudos au-dessus des Pokémon et cercles de couleur au sol ===== */
const TAUNT={dur:2.2,cd:3};
function startTaunt(e){
  if(!e||e.ko>0||e.stun>0||e.rush||e.chan||e.tunnel||e.swapC||e.flashC||(e.anim==="attack"&&!e.hit)||(e.tauntCd||0)>0)return;
  e.taunt={t:0}; e.moveTarget=null; e.shieldOn=false; e.tauntCd=TAUNT.cd; if(e===player)marker=null;
  rings.push({x:e.x,y:e.y,t:0,dur:.35,max:20,c:"#ffe45e"});
}
function tauntTick(dt){
  fighters.forEach(e=>{
    if(e.tauntCd>0)e.tauntCd=Math.max(0,e.tauntCd-dt);
    const T=e.taunt; if(!T)return;
    if(e.ko>0||e.stun>0||e.moveTarget||e.rush||e.chan||e.tunnel||(e.anim==="attack"&&!e.hit)){e.taunt=null;return}
    T.t+=dt; if(T.t>=TAUNT.dur){e.taunt=null;return}
    const step=Math.floor(T.t/.14); if(step!==T.s){T.s=step; e.dir=(e.dir+1)%8; if(e.anim!=="idle")setAnim(e,"idle")} // il tourne sur lui-même
    if(Math.random()<dt*5)pops.push({x:e.x+rand(-10,10),y:e.y-e.sp.body-14,t:0,txt:Math.random()<.5?"♪":"♫",col:["#ffe45e","#ff8ec4","#7fe0ff"][Math.floor(rand(0,3))]});
    if(Math.random()<dt*3)rings.push({x:e.x,y:e.y,t:0,dur:.4,max:16,c:"#ffe45e"});
  });
}
FX_UPDATERS.push(tauntTick);
// cercle de couleur sous chaque joueur en mêlée
function drawRings(){
  if(matchMode!=="ffa")return;
  fighters.forEach(e=>{ if(e.gone||e.out)return; const c=e.col||"#fff", x=Math.round(e.x), y=Math.round(e.y), R=Math.round(e.sp.body*.9)+4, ry=Math.max(2,Math.round(R*ISO));
    ctx.globalAlpha=.85; ellipseLine(x,y+1,R,ry,c); if(e===player){ctx.globalAlpha=.4; ellipseLine(x,y+1,R+2,ry+1,c)} ctx.globalAlpha=1 });
}
// pseudo au-dessus de chaque Pokémon (mêlée, et en ligne)
function drawTags(){
  const show=matchMode==="ffa"||NET.on; if(!show)return;
  ctx.save(); ctx.textAlign="center"; ctx.font="700 "+Math.max(11,Math.round(PX*3.2))+"px 'Pixelify Sans',monospace"; ctx.lineWidth=Math.max(3,Math.round(PX*.9)); ctx.lineJoin="round";
  fighters.forEach(e=>{ if(e.gone||e.out||e.tunnel)return;
    const name=matchMode==="ffa"&&typeof ffaName==="function"?ffaName(e):(e===player?(playerName()||(LANG==="en"?"You":"Toi")):(e.pname||"")); if(!name)return;
    const sx=(e.x-cam.x)*PX, sy=(e.y-e.sp.body*2-16-cam.y)*PX;
    ctx.strokeStyle="#0b0d18"; ctx.strokeText(name,sx,sy); ctx.fillStyle=e.col||(e===player?"#7fe0ff":"#ff8a8a"); ctx.fillText(name,sx,sy) });
  ctx.restore();
}
// pseudo du joueur (Paramètres) ; sinon celui du classé
function playerName(){ try{const n=(localStorage.getItem("aceName")||"").trim(); if(n)return n.slice(0,16)}catch(_){} return (typeof RK!=="undefined"&&RK.prof&&RK.prof.name)||"" }
