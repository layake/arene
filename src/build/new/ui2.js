/* ===== Habillage : ecran titre, ecran de versus, bannieres, favicon ===== */
var vsT=0;
const stageEl=document.getElementById("stage");
// --- favicon : la Pokeball en pixel art ---
(function(){
  try{const c=document.createElement("canvas");c.width=c.height=36;const x=c.getContext("2d");
    BALL_PIX.forEach((row,j)=>{for(let i=0;i<9;i++){const ch=row[i]; if(ch==="."||!ch)continue; x.fillStyle=BALL_COL[ch]; x.fillRect(i*4,j*4,4,4)}});
    const l=document.createElement("link");l.rel="icon";l.href=c.toDataURL("image/png");document.head.appendChild(l)}catch(_){}
})();
// --- ecran titre ---
var titleEl=document.createElement("div"); titleEl.id="title"; titleEl.hidden=true;
titleEl.innerHTML='<canvas id="tcv"></canvas><div class="tbox"><div class="tpre">Combat 3 contre 3</div><h1><span>ACES</span><b>ARENA</b></h1><div class="tbtns"><button type="button" id="tPlay">Jouer</button></div></div><div class="tfoot">Entrée : jouer<span id="tVer"></span></div>';
stageEl.appendChild(titleEl);
const tcv=titleEl.querySelector("#tcv"), tctx2=tcv.getContext("2d");
const T_SKY=["#1b2368","#26338a","#3a4fb0","#5c6fd0","#8d8ae0","#d98fb0","#f0a478"];
const T_KEYS=Object.keys(SPECIES).filter(k=>SPECIES[k].playable);
let tRaf=0, tT0=0;
function titleResize(){const r=stageEl.getBoundingClientRect(); tcv.height=180; tcv.width=Math.max(240,Math.round(180*r.width/Math.max(1,r.height)))}
function titleDraw(now){
  if(titleEl.hidden){tRaf=0;return}
  const W=tcv.width,H=tcv.height,c=tctx2, t=Math.max(0,(now-tT0)/1000); c.imageSmoothingEnabled=false;
  const gy=Math.round(H*.74);
  T_SKY.forEach((col,i)=>{c.fillStyle=col;c.fillRect(0,Math.round(gy*i/T_SKY.length),W,Math.ceil(gy/T_SKY.length)+1)});
  c.fillStyle="#fff6c8"; for(let i=0;i<26;i++){const x=(i*97+13)%W,y=(i*53)%Math.round(gy*.5); if((Math.floor(t*2+i)%5)!==0)c.fillRect(x,y,1,1)}
  c.fillStyle="rgba(255,255,255,.85)"; for(let i=0;i<4;i++){const x=Math.round(((i*140+t*6)%(W+80))-40),y=20+i*22; c.fillRect(x,y,34,4);c.fillRect(x+6,y-3,22,3);c.fillRect(x+10,y+4,24,3)}
  c.fillStyle="#2a4a7a"; for(let x=0;x<W;x+=2){const h=14+Math.round(10*Math.sin(x*.035)+6*Math.sin(x*.11)); c.fillRect(x,gy-h,2,h)}
  c.fillStyle="#3f8f3a"; c.fillRect(0,gy,W,H-gy); c.fillStyle="#58b04a"; c.fillRect(0,gy,W,3); c.fillStyle="#2f7230"; for(let x=0;x<W;x+=6)c.fillRect(x+(x>>2&3),gy+8+(x%3)*9,3,1);
  c.fillStyle="#7a5a32"; c.fillRect(0,gy+Math.round((H-gy)*.55),W,10);
  const sp=44, span=T_KEYS.length*sp, off=(t*18)%span;
  for(let k=0;k<T_KEYS.length+3;k++){
    const key=T_KEYS[k%T_KEYS.length], S=SPECIES[key], s=S.sheets.walk, n=s.dur.length, fr=Math.floor((t*8+k*3)%n), a=S.anch.walk[2][fr];
    const x=Math.round(-sp+k*sp+off-span*0+ (off>0?-off*0:0));
    const px=Math.round(((k*sp+off)%(span+sp*3))-sp*1.5), y=gy+Math.round((H-gy)*.55)+8;
    if(s.img.complete){c.fillStyle="rgba(0,0,0,.25)";c.fillRect(px-8,y-1,16,3);c.drawImage(s.img,fr*s.w,2*s.h,s.w,s.h,px-a[0],y-a[1],s.w,s.h)}
  }
  tRaf=requestAnimationFrame(titleDraw);
}
function showTitle(){
  titleEl.hidden=false; menuEl.hidden=true; menuOpen=true; try{musicSet("menu")}catch(_){}
  const v=document.getElementById("ver"); document.getElementById("tVer").textContent="";
  titleResize(); tT0=performance.now(); if(!tRaf)tRaf=requestAnimationFrame(titleDraw);
}
function leaveTitle(tab){
  titleEl.hidden=true; menuEl.hidden=false; menuOpen=true; if(NET&&NET.tab)NET.tab(tab||"solo"); refreshMenu(); try{sfxUI("click")}catch(_){}
}
titleEl.querySelector("#tPlay").addEventListener("click",()=>leaveTitle("solo"));
if(titleEl.querySelector("#tHelp"))titleEl.querySelector("#tHelp").addEventListener("click",()=>{const b=document.getElementById("helpBtn")||[...document.querySelectorAll("button")].find(x=>/Commandes/.test(x.textContent)&&!titleEl.contains(x)); if(b)b.click()});
addEventListener("keydown",e=>{if(!titleEl.hidden&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.stopPropagation();leaveTitle("solo")}},true);
addEventListener("resize",()=>{if(!titleEl.hidden)titleResize()});
// retour a l'accueil depuis le menu
(function(){const b=document.createElement("button");b.type="button";b.id="toTitle";b.textContent="← Accueil";const m=document.querySelector("#menu .mbox"); if(m){m.insertBefore(b,m.firstChild); b.addEventListener("click",()=>{if(NET.on)NET.leave(); showTitle()})}})();
// --- ecran de versus ---
var vsEl=document.createElement("div"); vsEl.id="vs"; vsEl.hidden=true; stageEl.appendChild(vsEl);
function vsSide(keys,label,cls){
  const lead=SPECIES[keys[0]], rest=keys.slice(1);
  return '<div class="vsside '+cls+'"><h4>'+label+'</h4><div class="vslead"><img alt="" src="'+PORTRAITS[keys[0]]+'"><b>'+lead.name+'</b><div class="vst">'+lead.types.map(t=>'<i style="background:'+TYPE_COL[t]+'">'+TYPE_FR[t]+'</i>').join("")+'</div></div><div class="vsbn">'+rest.map(k=>'<div><img alt="" src="'+PORTRAITS[k]+'"><span>'+SPECIES[k].name+'</span></div>').join("")+'</div></div>';
}
function showVersus(meKeys,foeKeys,meL,foeL){
  vsEl.innerHTML=vsSide(meKeys,meL,"l")+'<div class="vsx"><b>VS</b></div>'+vsSide(foeKeys,foeL,"r");
  vsEl.hidden=false; vsEl.classList.remove("go"); void vsEl.offsetWidth; vsEl.classList.add("go"); vsT=2.6;
}
function hideVersus(){vsT=0; if(vsEl)vsEl.hidden=true}
vsEl.addEventListener("click",()=>{if(vsT>0&&vsT<2.2)hideVersus()});
addEventListener("keydown",e=>{if(!vsEl.hidden&&vsT<2.2&&(e.key==="Enter"||e.key===" ")){e.preventDefault();e.stopPropagation();hideVersus()}},true);
// --- banniere de manche ---
var banEl=document.createElement("div"); banEl.id="roundban"; banEl.hidden=true; stageEl.appendChild(banEl);
function showBanner(txt,cls){banEl.textContent=txt;banEl.className=cls||"";banEl.hidden=false;void banEl.offsetWidth;banEl.classList.add("in")}
function hideBanner(){if(banEl)banEl.hidden=true}
// --- fin de match ---
function winsNeeded(){return (bestOf+1)/2}
function matchWon(){return matchMode==="duel"&&(score.me>=winsNeeded()||score.foe>=winsNeeded())}
var endEl=document.createElement("div"); endEl.id="endscr"; endEl.hidden=true; stageEl.appendChild(endEl);
function hideResult(){endShown=false; endEl.hidden=true}
function showResult(){
  if(endShown)return; endShown=true; hideBanner();
  const win=score.me>score.foe;
  endEl.className=win?"win":"lose";
  endEl.innerHTML='<div class="ebox"><h2>'+(win?"VICTOIRE":"DÉFAITE")+'</h2><div class="esc"><b>'+score.me+'</b><i>-</i><b>'+score.foe+'</b></div><small>'+(bestOf===1?'Match en 1 round':'Premier à '+winsNeeded()+' rounds')+'</small><div class="ebtn">'+(NET.on?"":'<button type="button" id="eRe">Revanche</button>')+'<button type="button" id="eMenu">'+(NET.on?"Retour au salon":"Sélection d\'équipe")+'</button>'+'</div></div>';
  endEl.hidden=false; try{sfxUI(win?"ko":"click")}catch(_){}
  if(NET.rk&&typeof rankedFinished==="function")rankedFinished(win,endEl);
  const re=endEl.querySelector("#eRe"); if(re)re.onclick=()=>{hideResult(); startMatch(picks.slice(),matchMode)};
  endEl.querySelector("#eMenu").onclick=()=>{hideResult(); openMenu()};
}
// invite : detecte la fin de match via le score
setInterval(()=>{if(NET.guest&&NET.started&&!endShown&&matchWon()&&!menuOpen&&(!player||player.ko<=0.0001||true)){if(!window._endT)window._endT=setTimeout(()=>{window._endT=0;if(matchWon()&&!menuOpen)showResult()},2400)}},250);
// --- habillage : plus de barre, menu pause propre ---
var _helpEl=document.getElementById("help"); stageEl.appendChild(_helpEl);
var _credit=document.querySelector("footer").innerHTML;
var _pb=document.querySelector("#pause .pbox");
(function(){
  const wrap=document.createElement("div"); wrap.className="pmenu";
  wrap.innerHTML='<button type="button" id="pCast"></button><button type="button" id="pMenu">Sélection d\'équipe</button>';
  _pb.insertBefore(wrap,_pb.querySelector(".vols"));
  const cast=wrap.querySelector("#pCast"), lab=()=>{cast.textContent=document.getElementById("mode").textContent};
  cast.onclick=()=>{document.getElementById("mode").click();lab()}; lab();
  wrap.querySelector("#pMenu").onclick=()=>{_helpEl.hidden=true;hideResult();setPause(false);openMenu()};
  setInterval(()=>{const l=NET.on?"Retour au salon":"Sélection d'équipe"; const p=wrap.querySelector("#pMenu"); if(p.__l!==l){p.__l=l;p.textContent=l}},300);
    const t=document.createElement("div"); t.className="credit tcredit"; t.innerHTML=_credit; titleEl.appendChild(t);
  const g=document.createElement("button"); g.id="gear"; g.type="button"; g.title="Pause (Échap)"; g.textContent="II"; g.onclick=()=>setPause(true); stageEl.appendChild(g);
  setInterval(()=>{g.hidden=menuOpen||!titleEl.hidden||endShown||vsT>0||paused},200);
})();
// --- compte a rebours 3-2-1 COMBAT ! (le jeu est fige pendant le decompte) ---
var introPending=false, cdT=0, cdN=0, cdHide=0;
var CD_STEP=.4;
function countdownTick(dt){
  if(introPending&&vsT<=0&&!menuOpen&&!endShown){introPending=false; cdT=CD_STEP*3; cdN=0}
  if(cdT<=0)return false;
  cdT-=dt;
  if(cdT>0){const n=Math.ceil(cdT/CD_STEP-1e-6); if(n!==cdN){cdN=n; showBanner(String(n),"intro"); try{sfxUI("click")}catch(_){}} return true}
  cdN=0; showBanner("COMBAT !","intro go"); try{sfxUI("go")}catch(_){}
  clearTimeout(cdHide); cdHide=setTimeout(()=>{if(banEl.classList.contains("go"))hideBanner()},700);
  return false;
}
// affiche le titre au chargement
showTitle();
