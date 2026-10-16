/* ===== Classé : file d'attente, combat par Elo (comme aux échecs), classement. Serveur : dossier server/ du dépôt ===== */
const RANKED_API=(()=>{try{const a=new URLSearchParams(location.search).get("api"); if(a)return a.replace(/\/$/,"")}catch(_){} return "https://arene-ranked.lensslo.workers.dev"})();
const RK={prof:null,state:"idle",poll:0,match:null,since:0,board:false};
try{RK.prof=JSON.parse(localStorage.getItem("aceRk"))}catch(_){}
const rkSave=()=>{try{localStorage.setItem("aceRk",JSON.stringify(RK.prof))}catch(_){}};
async function rkCall(path,body,get){
  const c=new AbortController(); const to=setTimeout(()=>c.abort(),10000);
  try{
    const r=await fetch(RANKED_API+path,get?{signal:c.signal}:{method:"POST",body:JSON.stringify(body||{}),signal:c.signal});
    const j=await r.json().catch(()=>({})); if(!r.ok)throw Object.assign(new Error(j.error||"Erreur"),{status:r.status});
    return j;
  }finally{clearTimeout(to)}
}
const rkBox=document.createElement("div"); rkBox.id="rkBox";
{
  const st=document.createElement("style");
  st.textContent='#rkBox{margin:0 0 10px;padding:10px 12px;border:3px solid #ffe45e;background:#0b1340;font:600 14px "Pixelify Sans",var(--display);color:#cfd8ff;display:flex;flex-direction:column;gap:8px}#rkBox h3{margin:0;font-size:16px;color:#ffe45e;display:flex;justify-content:space-between;gap:8px;align-items:baseline}#rkBox h3 b{color:#fff;font-size:20px}#rkBox .rkrow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#rkBox input{font:inherit;padding:5px 8px;background:#050a28;color:#fff;border:2px solid #7f95e8;width:150px}#rkBox button{font:inherit;color:#ffe45e;background:#1b2a8a;border:3px solid #ffe45e;padding:5px 14px;cursor:pointer}#rkBox button:disabled{opacity:.5;cursor:default}#rkMsg{min-height:18px;color:#9fb4ff}#rkMsg.err{color:#ff8a8a}#rkLb{max-height:160px;overflow:auto;width:100%;border-collapse:collapse}#rkLb td{padding:2px 6px;border-bottom:1px solid #1b2a8a}#rkLb td:nth-child(3){text-align:right;color:#fff}#rkElo{font-size:14px;margin-top:6px;color:#ffe45e}';
  document.head.appendChild(st);
}
const rkOnl=document.getElementById("onl"), rkRow=document.getElementById("netRow");
if(rkOnl&&rkRow)rkOnl.insertBefore(rkBox,rkRow);
const rkMsg=(t,err)=>{const m=document.getElementById("rkMsg"); if(m){m.textContent=t||"";m.className=err?"err":""}};
function rkRender(){
  const L=LANG==="en", P=RK.prof;
  let h='<h3><span>'+(L?"Ranked":"Classé")+'</span>'+(P?'<span>'+P.name+' · <b>'+P.elo+'</b> Elo</span>':'')+'</h3>';
  if(!P){
    h+='<div class="rkrow"><input id="rkName" maxlength="16" placeholder="'+(L?"Your name":"Ton pseudo")+'" autocomplete="off" spellcheck="false" aria-label="Pseudo"><button type="button" id="rkReg">'+(L?"Create my profile":"Créer mon profil")+'</button></div>';
  }else{
    const q=RK.state==="queue", m=RK.state==="found";
    h+='<div class="rkrow"><button type="button" id="rkGo"'+(m?" disabled":"")+'>'+(q?(L?"Cancel search":"Annuler la recherche"):(L?"Find a ranked fight":"Chercher un combat classé"))+'</button><button type="button" id="rkTop">'+(L?"Leaderboard":"Classement")+'</button></div>';
  }
  h+='<small id="rkVer" style="opacity:.6">'+(RK.sv?"Serveur "+RK.sv:"")+'</small><div id="rkMsg"></div>'+(RK.board?'<table id="rkLb"></table>':'');
  rkBox.innerHTML=h;
  const g=id=>document.getElementById(id);
  if(g("rkReg"))g("rkReg").onclick=rkRegister;
  if(g("rkName"))g("rkName").onkeydown=e=>{e.stopPropagation();if(e.key==="Enter")rkRegister()};
  if(g("rkGo"))g("rkGo").onclick=()=>RK.state==="queue"?rkCancel():rkSearch(false);
  if(g("rkTop"))g("rkTop").onclick=()=>{RK.board=!RK.board;rkRender();if(RK.board)rkBoard()};
}
async function rkRegister(){
  const name=(document.getElementById("rkName")||{}).value||"";
  try{RK.prof=await rkCall("/api/register",{name}); rkSave(); rkRender(); rkMsg(LANG==="en"?"Profile created. Starting rating: 1200.":"Profil créé. Elo de départ : 1200.")}
  catch(e){rkMsg(e.status?e.message:(LANG==="en"?"Ranking server unreachable":"Serveur de classement injoignable"),true)}
}
async function rkBoard(){
  try{
    const lb=await rkCall("/api/leaderboard",null,true), t=document.getElementById("rkLb"); if(!t)return;
    t.innerHTML=lb.length?lb.map(r=>'<tr><td>'+r.rank+'</td><td>'+r.name.replace(/[<>&]/g,"")+'</td><td>'+r.elo+'</td></tr>').join(""):'<tr><td>'+(LANG==="en"?"No ranked games yet":"Aucune partie classée pour l'instant")+'</td></tr>';
  }catch(_){rkMsg(LANG==="en"?"Ranking server unreachable":"Serveur de classement injoignable",true)}
}
function rkSearch(auto){
  if(!RK.prof)return; if(!auto)RK.retries=0;
  if(!NET.saveKit()||!NET.teamOk()){RK.retries=99;rkMsg(LANG==="en"?"Invalid team: pick 3 different Aces with 4 valid moves each":"Équipe invalide : choisis 3 Aces différents avec 4 sorts valides chacun",true);return}
  RK.state="queue"; RK.since=performance.now(); RK.fresh=true; rkRender(); rkPoll();
}
async function rkPoll(){
  clearTimeout(RK.poll); if(RK.state!=="queue")return;
  try{
    const r=await rkCall("/api/queue",{id:RK.prof.id,token:RK.prof.token,fresh:!!RK.fresh}); RK.fresh=false;
    if(RK.state!=="queue")return;
    if(r.status==="matched"){
      RK.state="found"; RK.match={matchId:r.matchId,reported:false,started:false,oppName:r.opp.name,t0:performance.now()}; // chien de garde : tant que le combat n'a pas démarré, on renvoie "prêt" ; au bout de 40 s on abandonne proprement
setInterval(()=>{const M=RK.match; if(RK.state!=="found"||!M||M.finished||NET.started)return;
  if(NET.rankedKick)NET.rankedKick();
  if(performance.now()-M.t0>40000)rkAbort(LANG==="en"?"The fight could not start (opponent unreachable). No rating change.":"Le combat n'a pas pu démarrer (adversaire injoignable). Aucun changement d'Elo.",true)},2000);
async function rkMe(){if(!RK.prof)return; try{const m=await rkCall("/api/me",{id:RK.prof.id,token:RK.prof.token}); if(m&&m.elo){RK.prof.elo=m.elo;rkSave();if(RK.state==="idle")rkRender()}}catch(_){}}
rkRender(); rkMe();

rkCall("/api/health",null,true).then(h=>{const v=document.getElementById("rkVer");RK.sv=h.version;if(v)v.textContent="Serveur "+h.version}).catch(()=>{});
      rkMsg((LANG==="en"?"Opponent found: ":"Adversaire trouvé : ")+r.opp.name+" ("+r.opp.elo+")");
      NET.rankedStart({matchId:r.matchId,code:r.code,role:r.role}); NET.rankedEvent=rkEvent; return;
    }
    rkMsg((LANG==="en"?"Searching… ":"Recherche… ")+r.waited+" s · ±"+r.range+" Elo");
  }catch(e){
    if(e.status===401){RK.prof=null;rkSave();RK.state="idle";rkRender();return rkMsg(LANG==="en"?"Profile no longer valid, create a new one":"Profil invalide, recrée-le",true)}
    rkMsg(LANG==="en"?"Ranking server unreachable":"Serveur de classement injoignable",true);
  }
  RK.poll=setTimeout(rkPoll,2000);
}
function rkCancel(){
  clearTimeout(RK.poll); RK.state="idle"; rkRender(); rkMsg("");
  if(RK.prof)rkCall("/api/queue/leave",{id:RK.prof.id,token:RK.prof.token}).catch(()=>{});
}
// ---- événements du réseau et de la fin de combat ----
function rkBeacon(path,body){try{return navigator.sendBeacon(RANKED_API+path,new Blob([JSON.stringify(body)],{type:"text/plain"}))}catch(_){return false}}
function rkReport(result,beacon){
  const M=RK.match; if(!M||M.reported||!RK.prof)return;
  M.reported=true; const b={id:RK.prof.id,token:RK.prof.token,matchId:M.matchId,result};
  if(beacon)return rkBeacon("/api/report",b);
  return rkCall("/api/report",b).catch(()=>{M.reported=false});
}
function rkAbort(msg,retry){ // le combat n'a pas pu démarrer : on nettoie, on prévient, on relance la recherche (3 fois max)
  const M=RK.match; RK.match=null; RK.state="idle";
  try{NET.leave()}catch(_){}
  if(RK.prof)rkCall("/api/queue/leave",{id:RK.prof.id,token:RK.prof.token}).catch(()=>{});
  rkRender(); rkMsg(msg,true);
  if(retry&&(RK.retries=(RK.retries||0)+1)<=3)setTimeout(()=>{if(RK.state==="idle"&&!RK.match){rkMsg((LANG==="en"?"New search… ":"Nouvelle recherche… ")+RK.retries+"/3");rkSearch(true)}},1800);
}
function rkEvent(ev,arg){
  const M=RK.match; if(!M)return;
  if(ev==="fail"&&!M.started&&!M.finished)return rkAbort(LANG==="en"?"Could not connect to the opponent. No rating change.":"Connexion impossible avec l'adversaire. Aucun changement d'Elo.",true);
  if(ev==="badteam"&&!M.finished&&!NET.started)return rkAbort(LANG==="en"?"Opponent's team invalid or different game version: reload the page (Ctrl+F5). No rating change.":"Équipe adverse invalide ou version du jeu différente : rechargez la page (Ctrl+F5). Aucun changement d'Elo.",true);
  if(ev==="peergone"&&!arg&&!M.finished)return rkAbort(LANG==="en"?"Opponent left before the fight. No rating change.":"L'adversaire est parti avant le combat. Aucun changement d'Elo.",true);
  if(ev==="peergone"&&arg&&!M.reported&&!M.finished){rkReport("win",true)}   // l'adversaire est parti en plein combat
  if(ev==="leave"&&arg&&!M.reported&&!M.finished){rkReport("loss",true)}      // je quitte en plein combat : défaite
  if(ev==="leave"){setTimeout(rkMe,3000);RK.state="idle"; if(!M.finished)RK.match=null; rkRender()}
}
addEventListener("pagehide",()=>{const M=RK.match; if(M&&NET.started&&!M.reported&&!M.finished)rkReport("loss",true)});
function rkFinished(win,endEl){ // appelée à la fin d'un combat classé
  const M=RK.match; if(!M)return; M.finished=true; M.started=true;
  const box=endEl.querySelector(".ebox"), line=document.createElement("small"); line.id="rkRes"; line.textContent=LANG==="en"?"Updating rating…":"Calcul de l'Elo…"; box.insertBefore(line,box.querySelector(".ebtn"));
  const bt=endEl.querySelector(".ebtn"); bt.innerHTML="";
  const mk=(t,f)=>{const b=document.createElement("button");b.type="button";b.textContent=t;b.onclick=f;bt.appendChild(b)};
  mk(LANG==="en"?"New ranked fight":"Nouveau combat classé",()=>{hideResult();NET.leave();openMenu();setTimeout(rkSearch,400)});
  mk("Menu",()=>{hideResult();NET.leave();openMenu()});
  rkReport(win?"win":"loss",false);
  let n=0;
  const ask=async()=>{
    if(!RK.prof||!RK.match)return;
    try{
      const r=await rkCall("/api/result",{id:RK.prof.id,token:RK.prof.token,matchId:M.matchId});
      if(r.status==="done"){RK.prof.elo=r.to;rkSave();line.innerHTML=(LANG==="en"?"Rating ":"Elo ")+r.from+" → <b>"+r.to+"</b> ("+(r.delta>=0?"+":"")+r.delta+")";line.style.color=r.delta>=0?"#8aff8a":"#ff8a8a";return}
      if(r.status==="disputed"){line.textContent=LANG==="en"?"Result disputed: no rating change":"Résultat contesté : aucun changement d'Elo";return}
    }catch(_){}
    if(++n<30)setTimeout(ask,2000); else line.textContent=LANG==="en"?"Result not confirmed yet, check your rating later":"Résultat pas encore confirmé, reviens voir ton Elo plus tard";
  };
  setTimeout(ask,1500);
}
const rankedFinished=rkFinished;
// la fiche se met à jour quand on revient dans l'onglet en ligne ; masquée dans un salon
let rkLang=LANG; // la fiche suit le changement de langue
setInterval(()=>{rkBox.hidden=!!(rkRow&&rkRow.hidden); if(LANG!==rkLang){rkLang=LANG; const m=document.getElementById("rkMsg"), t=m&&m.textContent; rkRender(); if(t)rkMsg(t)}},300);
// chien de garde : tant que le combat n'a pas démarré, on renvoie "prêt" ; au bout de 40 s on abandonne proprement
setInterval(()=>{const M=RK.match; if(RK.state!=="found"||!M||M.finished||NET.started)return;
  if(NET.rankedKick)NET.rankedKick();
  if(performance.now()-M.t0>40000)rkAbort(LANG==="en"?"The fight could not start (opponent unreachable). No rating change.":"Le combat n'a pas pu démarrer (adversaire injoignable). Aucun changement d'Elo.",true)},2000);
async function rkMe(){if(!RK.prof)return; try{const m=await rkCall("/api/me",{id:RK.prof.id,token:RK.prof.token}); if(m&&m.elo){RK.prof.elo=m.elo;rkSave();if(RK.state==="idle")rkRender()}}catch(_){}}
rkRender(); rkMe();
rkCall("/api/health",null,true).then(h=>{const v=document.getElementById("rkVer");RK.sv=h.version;if(v)v.textContent="Serveur "+h.version}).catch(()=>{});
