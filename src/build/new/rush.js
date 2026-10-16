/* ===== Mode Marathon : tous les Aces à la suite, équipe de 1 à 3 sans soin entre les duels, classement victoires puis temps ===== */
var MARA=null;
const rushBst=k=>Object.values(SPECIES[k].base).reduce((a,b)=>a+b,0);
const rushStage=i=>{const n=(MARA&&MARA.order&&MARA.order.length)||16; return i<n*.25?"easy":i<n*.6?"normal":"hard"}; // difficulté des bots : croissante, quel que soit le nombre de Pokémon
function rushStart(){
  MARA={order:Object.keys(SPECIES).filter(k=>SPECIES[k].playable).sort((a,b)=>rushBst(a)-rushBst(b)),i:0,t:0,done:false};
}
function rushBest(){try{return JSON.parse(localStorage.getItem("aceRushBest"))||null}catch(_){return null}}
const rushFmt=t=>{const m=Math.floor(t/60), s=t-m*60; return String(m).padStart(2,"0")+":"+(s<10?"0":"")+s.toFixed(2)};
const rushHud=document.createElement("div"); rushHud.id="rushhud"; rushHud.hidden=true; stageEl.appendChild(rushHud);
{const st=document.createElement("style"); st.textContent='#rushhud{position:absolute;top:8px;left:50%;transform:translateX(-50%);z-index:30;font:600 18px "Pixelify Sans",var(--display);color:#ffe45e;background:rgba(5,8,24,.78);border:3px solid #ffe45e;padding:4px 14px;text-shadow:2px 2px 0 #000;white-space:nowrap;pointer-events:none}#rushhud[hidden]{display:none}#rushhud b{color:#fff}'; document.head.appendChild(st)}
let rushTxt="";
function rushTick(dt){
  const on=matchMode==="rush"&&MARA&&!menuOpen&&player;
  rushHud.hidden=!on; if(!on)return;
  if(!MARA.done&&foe.ko<=0&&player.ko<=0)MARA.t+=dt;
  const n=MARA.order.length, txt=(LANG==="en"?"Fight <b>":"Combat <b>")+Math.min(MARA.i+1,n)+"/"+n+"</b> · "+rushFmt(MARA.t);
  if(txt!==rushTxt){rushTxt=txt; rushHud.innerHTML=txt}
}
function rushKO(t){ // un des deux camps n'a plus personne
  sfxUI("ko"); t.ko=t===foe?1.5:2.6;
  if(t===foe&&typeof showBanner==="function")showBanner((LANG==="en"?"DEFEATED ":"VAINCU ")+(MARA.i+1)+"/"+MARA.order.length,"win");
  else if(typeof showBanner==="function")showBanner(LANG==="en"?"RUN OVER":"FIN DE RUN","lose");
  showLog(t.sp.name+" est K.O. !",1600);
}
function rushNext(){
  MARA.i++;
  if(MARA.i>=MARA.order.length){rushEnd(true);return}
  foe=makeFighter(MARA.order[MARA.i],START_B[0],START_B[1],true);
  entities=[player,foe]; fighters=entities.filter(e=>e.fighter);
  resetRound(); player.dir=2; foe.dir=6; botEquip(foe,player);
}
function rushEnd(win){
  if(endShown)return; MARA.done=true; endShown=true; hideBanner();
  const n=MARA.i, t=MARA.t, b=rushBest(), rec=n>0&&(!b||n>b.n||(n===b.n&&t<b.t));
  if(rec)try{localStorage.setItem("aceRushBest",JSON.stringify({n,t}))}catch(_){}
  const best=rec?{n,t}:b;
  endEl.className=win?"win":"lose";
  endEl.innerHTML='<div class="ebox"><h2>'+(LANG==="en"?(win?"MARATHON COMPLETE":"RUN OVER"):(win?"MARATHON TERMINÉ":"FIN DE RUN"))+'</h2><div class="esc"><b>'+n+'</b><i>/</i><b>'+MARA.order.length+'</b></div><small>'+(LANG==='en'?'Opponents defeated · time ':'Adversaires vaincus · temps ')+rushFmt(t)+'</small>'+(rec?'<small style="color:#ffe45e">'+(LANG==='en'?'NEW RECORD!':'NOUVEAU RECORD !')+'</small>':(best?'<small>'+(LANG==='en'?'Best: ':'Record : ')+best.n+'/'+MARA.order.length+' en '+rushFmt(best.t)+'</small>':""))+'<div class="ebtn"><button type="button" id="eRe">'+(LANG==='en'?'Play again':'Rejouer')+'</button><button type="button" id="eMenu">'+(LANG==='en'?'Team select':'Sélection d\'équipe')+'</button></div></div>';
  endEl.hidden=false; try{sfxUI(win?"ko":"click")}catch(_){}
  endEl.querySelector("#eRe").onclick=()=>{hideResult(); startMatch(picks.slice(),"rush")};
  endEl.querySelector("#eMenu").onclick=()=>{hideResult(); openMenu()};
}
