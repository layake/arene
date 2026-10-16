// ---- Multijoueur en ligne : l'hôte fait autorité, l'invité joue en prédiction locale et se recale sur les instantanés ----
// Le combat tourne chez les deux joueurs avec le même code. L'hôte reçoit les ordres de l'invité (déplacement, sort, bouclier)
// et envoie 20 fois par seconde l'état de jeu (combattants, boules, zones). L'invité applique cet état sans saccade.
(function(){
const SNAP_DT=.05, PING_DT=2;
const SKIP=new Set(["sp","hover","lx","ly","vx","vy","x","y","tick","frame","hpShow","flash","rest","hit","key","anim","remote"]);
const OWN_SKIP=new Set(["moveTarget","wantShield","aimPt","run"]);
const PRED=new Set(["cast","rush","chan","tunnel","counter","pp","cd","comboT","lock","lockPt","shieldOn","shieldE","dir","stun"]);
const q=s=>document.querySelector(s);
const lobbyEl=q("#netRoom"), rowEl=q("#netRow"), codeEl=q("#netRoomCode"), slotMe=q("#slotMe"), slotOpp=q("#slotOpp"), btnR=q("#netReady"), menuRoot=q("#menu"), menuH2=q("#menu h2"), menuBtn=q("#menuBtn");
const st=q("#netStatus"), codeIn=q("#netCode"), btnC=q("#netCreate"), btnJ=q("#netJoin");
const relayOnly=/[?&]relay=1/.test(location.search);
let roomCode="", peerHere=false, oppPick=null, lastSig="", pickAt=0, myReady=false, oppReady=false, inLobby=false, mode="ws", peer=null, connR=null, connF=null, ws=null, pc=null, dcR=null, dcF=null, pend=[], role="", myHello=null, oppHello=null, seq=0, lastSnapSeq=-1;
let castSeq=0, castAt=0, ackSeq=0, snapAcc=0, mvAcc=0, lastMv="", lastSh=false, lastMvAt=0, pingAcc=0, pingMs=0, pingTs=0;
let info=document.createElement("div"); info.id="netInfo"; info.hidden=true; (q("#stage")||document.body).appendChild(info);
const say=t=>{if(st)st.textContent=t};
const rtcOpen=()=>dcR&&dcR.readyState==="open"&&dcF&&dcF.readyState==="open";
function wsSend(o){if(ws&&ws.readyState===1)ws.send(JSON.stringify(o))}
// fast=true : messages périssables (instantanés, déplacements) ; sinon fiables
function relay(o){ if(mode==="peer"){if(connR&&connR.open)connR.send(o)} else wsSend({t:"rel",d:JSON.stringify(o)}) }
function send(o,reliable){
  if(mode==="peer"){const c=(reliable||!(connF&&connF.open))?connR:connF; if(c&&c.open)c.send(o); return}
  const s=JSON.stringify(o);
  if(rtcOpen()){ (reliable?dcR:dcF).send(s); return }
  wsSend({t:"rel",d:s});
}
NET.send=o=>send(o,o.t!=="snap"&&o.t!=="mv");
NET.rk=null; NET.rankedEvent=null;
NET.leave=function(){
  if(NET.rk&&NET.rankedEvent)NET.rankedEvent("leave",NET.started); NET.rk=null;
  NET.on=false;NET.host=false;NET.guest=false;NET.started=false;role="";info.hidden=true;
  try{if(pc)pc.close()}catch(_){} pc=dcR=dcF=null; pend=[];
  if(ws){try{ws.onclose=null;ws.close()}catch(_){} ws=null}
  if(peer){try{peer.destroy()}catch(_){} peer=connR=connF=null}
  btnC.disabled=btnJ.disabled=false; myReady=oppReady=false; inLobby=false; peerHere=false; oppHello=oppPick=null; roomCode=""; menuBtn.textContent="Changer d'Ace"; refreshLobby();
};
// ---- Sérialisation : les références vers les deux combattants deviennent {"$e":index} ----
const rd=v=>Math.round(v*100)/100;
function enc(v,idx,depth){
  if(v===null||v===undefined)return v;
  const t=typeof v;
  if(t==="number")return isFinite(v)?rd(v):0;
  if(t==="string"||t==="boolean")return v;
  if(t!=="object"||depth>7)return undefined;
  const i=idx.get(v); if(i!==undefined)return {$e:i};
  if(Array.isArray(v))return v.map(x=>{const r=enc(x,idx,depth+1);return r===undefined?null:r});
  if(Object.getPrototypeOf(v)!==Object.prototype)return undefined;
  const o={}; for(const k in v){const r=enc(v[k],idx,depth+1); if(r!==undefined)o[k]=r} return o;
}
function dec(v){
  if(v===null||typeof v!=="object")return v;
  if(Array.isArray(v))return v.map(dec);
  if("$e" in v)return entities[v.$e];
  const o={}; for(const k in v)o[k]=dec(v[k]); return o;
}
function snapshot(){
  const idx=new Map(entities.map((e,i)=>[e,i]));
  player.aimPt=mouse?{wx:mouse.wx,wy:mouse.wy}:null; // l'invité voit où l'hôte vise
  const ents=entities.map(e=>{const o={}; for(const k in e){if(k==="sp"||k==="hover")continue; const r=enc(e[k],idx,0); if(r!==undefined)o[k]=r} o.x=rd(e.x);o.y=rd(e.y);o.anim=e.anim;o.frame=e.frame;o.tick=rd(e.tick);o.hit=e.hit; return o});
  return {t:"snap",n:++seq,ack:ackSeq,sc:[score.me,score.foe],E:ents,O:enc(orbs,idx,0),Z:enc(zones,idx,0),B:OBST.map(c=>Math.round(c.hp))};
}
const pending=()=>castSeq>ackSeq&&performance.now()-castAt<500;
function applyEnt(e,s,own,pend){
  for(const k in s){
    if(SKIP.has(k)||(own&&(OWN_SKIP.has(k)||(pend&&PRED.has(k)))))continue;
    e[k]=dec(s[k]);
  }
  for(const k in e){
    if(SKIP.has(k)||k in s||(own&&(OWN_SKIP.has(k)||(pend&&PRED.has(k)))))continue;
    delete e[k];
  }
  if(s.key&&e.key!==s.key&&SPECIES[s.key]){e.key=s.key;e.sp=SPECIES[s.key];if(own&&typeof applyKit==="function")applyKit()}
  if(own){
    // le serveur a arrêté mon déplacement : on s'arrête aussi (sauf ordre tout récent)
    if(!s.moveTarget&&e.moveTarget&&performance.now()-lastMvAt>300)e.moveTarget=null;
  }
  if(!(own&&pend)){
    if(s.anim!==e.anim){e.anim=s.anim;e.frame=s.frame;e.tick=s.tick;e.hit=s.hit}
    else if(Math.abs(s.frame-e.frame)>1){e.frame=s.frame;e.tick=s.tick}
  }
  const dx=s.x-e.x, dy=s.y-e.y, d=Math.hypot(dx,dy);
  if(d>70){e.x=s.x;e.y=s.y;e.lx=e.x;e.ly=e.y}
  else if(d>(own?3:.5)){const k=own?.14:.3; e.x+=dx*k; e.y+=dy*k}
}
function applySnap(m){
  if(m.n<=lastSnapSeq)return; lastSnapSeq=m.n;
  score.me=m.sc[1]; score.foe=m.sc[0];
  const pend=pending(); if(m.ack>ackSeq)ackSeq=m.ack;
  entities.forEach((e,i)=>applyEnt(e,m.E[i],e===player,pend&&e===player));
  const keep=arr=>pend?arr.filter(o=>o.o===player):[];
  const mix=(dst,src)=>{const loc=keep(dst), h=dec(src).filter(o=>!(pend&&o.o===player)); dst.length=0; dst.push(...h,...loc)};
  mix(orbs,m.O); mix(zones,m.Z); if(m.B)m.B.forEach((h,i)=>obstSet(i,h));
}
// ---- Ordres de l'invité (côté hôte) ----
function onGuestInput(m){
  const g=foe; if(!g||!NET.started)return;
  if(m.t==="mv"){ if(g.ko<=0&&g.stun<=0)g.moveTarget=m.c?{x:m.x,y:m.y,chase:true}:{x:clampX(m.x),y:clampY(m.y)} }
  else if(m.t==="sh"){ g.wantShield=!!m.v&&g.ko<=0 }
  else if(m.t==="cast"){
    ackSeq=Math.max(ackSeq,m.seq);
    if(g.ko>0||!SPL[m.id])return;
    g.aimPt={wx:m.wx,wy:m.wy}; g.aimMode=["off","assist","lock"].includes(m.am)?m.am:"assist"; cast(g,m.id);
  }
  else if(m.t==="cancel"){ if(g.rush&&g.rush.ph==="chan")cancelRush(g,false);else if(g.chan)cancelChan(g,false) }
}
NET.sendCast=function(id){
  castSeq++; castAt=performance.now();
  const hov=hoverEnemy(), p=hov?{wx:foe.x,wy:foe.y}:(mouse||{wx:player.x,wy:player.y});
  send({t:"cast",id,seq:castSeq,wx:p.wx,wy:p.wy,am:AIM.mode},true);
};
// ---- Boucle réseau (appelée par frame) ----
NET.tick=function(dt){
  if(!NET.on||!NET.started)return;
  if(NET.host){
    snapAcc+=dt; if(snapAcc>=SNAP_DT){snapAcc=0; send(snapshot(),false)}
  }else{
    mvAcc+=dt;
    const mt=player.moveTarget;
    if(mt&&mvAcc>=.04){
      const k=mt.chase?"c":Math.round(mt.x)+","+Math.round(mt.y);
      if(k!==lastMv){lastMv=k;lastMvAt=performance.now();mvAcc=0;send({t:"mv",x:mt.x,y:mt.y,c:!!mt.chase},false)}
    }
    if(!mt)lastMv="";
    if(player.wantShield!==lastSh){lastSh=player.wantShield;send({t:"sh",v:lastSh},true)}
  }
  pingAcc+=dt; if(pingAcc>=PING_DT){pingAcc=0;pingTs=performance.now();send({t:"ping",ts:pingTs},true)}
};
const cache={me:"",opp:""};
function slotHtml(team,ready,label){
  if(!team||!team.length)return '<h4>'+label+'</h4><div class="lbwait">Choisit son Ace…</div>';
  const rows=team.map((t,i)=>'<div class="lbm"><img alt="" src="'+PORTRAITS[t.key]+'"><span><b>'+(i+1)+'</b> '+SPECIES[t.key].name+'</span></div>').join("");
  return '<h4>'+label+'</h4>'+rows+'<em class="'+(ready?"lbrdy":"")+'">'+(ready?"Prêt":"En attente")+'</em>';
}
function refreshLobby(){
  lobbyEl.hidden=!inLobby; rowEl.hidden=inLobby; menuRoot.classList.toggle("locked",inLobby&&myReady);
  const so=q('#menu .tabs [data-tab="solo"]'); if(so)so.disabled=inLobby;
  if(!inLobby)return;
  codeEl.textContent=roomCode;
  const me=slotHtml(teamPicks(),myReady,"Toi");
  const opp=peerHere?slotHtml(oppPick&&oppPick.team,oppReady,"Adversaire"):'<h4>Adversaire</h4><div class="lbwait">En attente…<br><small>Donne-lui le code '+roomCode+'</small></div>';
  if(me!==cache.me){slotMe.innerHTML=me;cache.me=me} if(opp!==cache.opp){slotOpp.innerHTML=opp;cache.opp=opp}
  slotMe.classList.toggle("ok",myReady); slotOpp.classList.toggle("ok",oppReady&&peerHere);
  {let al=document.getElementById("netArena"); if(!al){const d=document.createElement("div"); d.className="lbarena"; d.innerHTML='<span>Arène</span><select id="netArena" aria-label="Arène"></select><small></small>';
     ARENA_IDS.forEach(k=>{const o=document.createElement("option"); o.value=k; o.textContent=ARENAS[k].name; d.querySelector("select").appendChild(o)});
     d.querySelector("select").addEventListener("change",e=>{ARENA_PICK=e.target.value; try{localStorage.setItem("aceArena",ARENA_PICK)}catch(_){}});
     lobbyEl.insertBefore(d,lobbyEl.querySelector(".lbbtns")); al=d.querySelector("select")}
   al.disabled=role!=="host"; al.parentNode.querySelector("small").textContent=role==="host"?"":"choix de l'hôte"; if(role==="host")al.value=ARENA_PICK}
  btnR.disabled=!peerHere; btnR.textContent=myReady?"Annuler":"Prêt";
}
function setTab(t){
  menuRoot.classList.toggle("tab-online",t==="online");
  menuH2.textContent=t==="online"?"Multijoueur":"Sélection d'équipe";
  document.querySelectorAll("#menu .tabs button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.tab===t)));
}
NET.tab=setTab;
document.querySelectorAll("#menu .tabs button").forEach(b=>b.addEventListener("click",()=>{if(!b.disabled)setTab(b.dataset.tab)}));
function sendPick(force){
  if(!inLobby||!peerHere||NET.started)return;
  const team=teamPicks(), sig=JSON.stringify(team), now=performance.now();
  if(!force&&sig===lastSig&&now-pickAt<2000)return;
  lastSig=sig; pickAt=now; relay({t:"pick",team});
}
setInterval(()=>{if(inLobby&&!NET.started){refreshLobby();sendPick(false)}},300);
function openRoom(code){inLobby=true;roomCode=code;peerHere=false;myReady=oppReady=false;oppHello=oppPick=null;say("");refreshLobby()}
function lobbyOn(){peerHere=true;myReady=oppReady=false;oppHello=oppPick=null;say("");refreshLobby();sendPick(true); if(NET.rk)setTimeout(autoReady,600)}
function autoReady(){ // combat classé : pas de salon à valider, chacun se déclare prêt tout de suite
  if(!NET.rk||!inLobby||myReady||NET.started||!peerHere)return;
  myReady=true; myHello=mineHello(); relay({t:"ready",on:true,team:myHello.team}); refreshLobby(); maybeStart();
}
function peerGone(){
  if(NET.rk&&NET.rankedEvent)NET.rankedEvent("peergone",NET.started);
  if(role!=="host"){const was=NET.started;NET.leave();say("L'adversaire a quitté le salon");if(was)openMenu();return}
  const was=NET.started; NET.started=false; info.hidden=true; peerHere=false; myReady=oppReady=false; oppHello=oppPick=null;
  try{if(pc)pc.close()}catch(_){} pc=dcR=dcF=null; pend=[]; if(mode==="peer")connR=connF=null;
  say("L'adversaire a quitté le salon. Le salon reste ouvert."); refreshLobby(); if(was)openMenu();
}
function maybeStart(){ if(role==="host"&&myReady&&oppReady&&oppHello&&!NET.started)beginHost() }
btnR.addEventListener("click",()=>{
  if(!inLobby||NET.started)return;
  if(!myReady&&!saveKit())return;
  myReady=!myReady; myHello=mineHello();
  relay({t:"ready",on:myReady,team:myHello.team});
  refreshLobby(); maybeStart();
});
// Retour au salon sans quitter la connexion : l'autre joueur est prévenu et revient aussi.
NET.toLobby=function(fromPeer){
  if(!NET.started||!role)return;
  if(!fromPeer)send({t:"back"},true);
  NET.started=false; info.hidden=true; lastSnapSeq=-1;
  myReady=oppReady=false; oppHello=null; inLobby=true; refreshLobby(); sendPick(true);
  say(fromPeer?"L'adversaire est de retour. Valide ton équipe avec Prêt.":"Sélectionne ton équipe puis valide avec Prêt.");
  if(fromPeer)openMenu();
};
q("#netCopy").addEventListener("click",()=>{try{navigator.clipboard.writeText(roomCode).then(()=>say("Code copié"),()=>{})}catch(_){}});
q("#netQuit").addEventListener("click",()=>{NET.leave();say("Salon quitté")});
function onMsg(m){
  if(m.t==="ping")send({t:"pong",ts:m.ts},true);
  else if(m.t==="pong"){pingMs=Math.round(performance.now()-m.ts);info.hidden=false;info.textContent=(mode==="peer"||rtcOpen()?"P2P ":"Relais ")+pingMs+" ms"}
  else if(m.t==="back"){NET.toLobby(true)}
  else if(m.t==="pick"||m.t==="ready"){
    if(NET.started||!validTeam(m.team))return;
    oppPick={team:m.team,key:m.team[0].key,kit:m.team[0].kit};
    if(m.t==="ready"){oppReady=!!m.on; if(m.on)oppHello=oppPick}
    refreshLobby(); maybeStart();
  }
  else if(m.t==="start"&&role==="guest"){beginGuest(m)}
  else if(m.t==="snap"&&role==="guest"&&NET.started)applySnap(m);
  else if(m.t==="sfxc"&&role==="guest"&&NET.started){try{sfxCast(foe,m.id)}catch(_){}}
  else if(role==="host")onGuestInput(m);
  else if(m.t==="cancel"||m.t==="cast"||m.t==="mv"||m.t==="sh"){}
}
// ---- Démarrage du match ----
function begin(hostH,guestH,asHost){
  bestOf=3; endShown=false; musicSet("battle"); matchMode="duel"; score.me=0; score.foe=0; seq=0; lastSnapSeq=-1; castSeq=ackSeq=0; lastMv=""; lastSh=false;
  const A=makeFighter(hostH.team[0].key,START_A[0],START_A[1],false,hostH.team[0].kit), B=makeFighter(guestH.team[0].key,START_B[0],START_B[1],false,guestH.team[0].kit);
  initTeam(A,hostH.team.map(x=>x.key),hostH.team.map(x=>x.kit)); initTeam(B,guestH.team.map(x=>x.key),guestH.team.map(x=>x.kit));
  entities=[A,B]; fighters=entities.slice();
  if(asHost){player=A;foe=B;B.remote=true}else{player=B;foe=A;A.remote=true}
  playerKey=player.key; resetRound();
  if(typeof applyKit==="function")applyKit();
  if(typeof showVersus==="function")showVersus(player.team.map(s=>s.key),foe.team.map(s=>s.key),"TOI","ADVERSAIRE");
  NET.on=true;NET.host=asHost;NET.guest=!asHost;NET.started=true;
  menuOpen=false; menuEl.hidden=true; last=performance.now(); info.hidden=false; say(""); menuBtn.textContent="Retour au salon";
}
function beginHost(){
  myHello=mineHello(); const h=myHello, g=oppHello;
  if(!h||!g||!validTeam(g.team)){say("Équipe de l'adversaire invalide");return}
  const arena=NET.rk?"colisee":ARENA_PICK; setArena(arena); relay({t:"start",h:{team:h.team},g:{team:g.team},a:arena});
  begin(h,g,true);
}
function beginGuest(m){ if(!m.h||!validTeam(m.h.team)||!validTeam(m.g&&m.g.team))return; setArena(ARENAS[m.a]?m.a:"colisee"); begin(m.h,m.g,false) }
const validTeam=t=>Array.isArray(t)&&t.length===3&&new Set(t.map(x=>x&&x.key)).size===3&&t.every(x=>x&&SPECIES[x.key]&&SPECIES[x.key].playable&&validKit(x.key,x.kit));
const validKit=(key,kit)=>Array.isArray(kit)&&kit.length===4&&kit.every(id=>SPECIES[key].pool.includes(id))&&new Set(kit).size===4;
// ---- Connexion : serveur de signalisation (WebSocket) puis liaison directe WebRTC ----
function onChan(c){
  c.onmessage=e=>{try{onMsg(JSON.parse(e.data))}catch(_){}};
  c.onopen=()=>{if(rtcOpen())say("Connecté")};
}
function startRTC(isHost){
  if(relayOnly||typeof RTCPeerConnection==="undefined")return;
  pc=new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]});
  pc.onicecandidate=e=>{if(e.candidate)wsSend({t:"sig",d:{c:e.candidate}})};
  if(isHost){
    dcR=pc.createDataChannel("r"); dcF=pc.createDataChannel("f",{ordered:false,maxRetransmits:0}); onChan(dcR); onChan(dcF);
    pc.createOffer().then(o=>pc.setLocalDescription(o)).then(()=>wsSend({t:"sig",d:{s:pc.localDescription}})).catch(()=>{});
  }else pc.ondatachannel=e=>{if(e.channel.label==="r")dcR=e.channel;else dcF=e.channel; onChan(e.channel)};
}
async function onSig(d){
  if(!pc)return;
  try{
    if(d.s){
      await pc.setRemoteDescription(d.s);
      while(pend.length)await pc.addIceCandidate(pend.shift());
      if(d.s.type==="offer"){const a=await pc.createAnswer();await pc.setLocalDescription(a);wsSend({t:"sig",d:{s:pc.localDescription}})}
    }else if(d.c){ if(pc.remoteDescription)await pc.addIceCandidate(d.c);else pend.push(d.c) }
  }catch(_){}
}
// Sans serveur (GitHub Pages, fichier local) : liaison directe via le courtier public PeerJS.
function loadPeerLib(){
  return new Promise((ok,ko)=>{
    if(window.Peer)return ok();
    const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js";
    s.onload=ok; s.onerror=()=>ko(new Error("lib")); document.head.appendChild(s);
  });
}
const peerOpts=()=>{const u=new URLSearchParams(location.search); return u.get("peerhost")?{host:u.get("peerhost"),port:+u.get("peerport")||9000,path:"/",secure:false}:{}};
const rcode=()=>{let c="";for(let i=0;i<4;i++)c+="ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random()*24)];return c};
function onLeft(){peerGone()}
function attach(c){
  c.on("data",d=>{try{onMsg(d)}catch(_){}});
  c.on("close",()=>{if(c===connR)onLeft()});
}
function peerFail(msg){say(msg); if(NET.rk&&NET.rankedEvent)NET.rankedEvent("fail",msg);btnC.disabled=btnJ.disabled=false;if(peer){try{peer.destroy()}catch(_){}peer=null}}
function peerHost(fixed){
  const go=n=>{
    if(n>5)return peerFail("Courtier injoignable");
    const code=fixed||rcode(); const p=new Peer("arene-"+code,peerOpts()); peer=p;
    p.on("open",()=>openRoom(code));
    p.on("error",e=>{ if(e.type==="unavailable-id"&&!fixed){try{p.destroy()}catch(_){}go(n+1)} else peerFail("Courtier injoignable ("+e.type+")") });
    p.on("connection",c=>{
      const k=c.metadata&&c.metadata.c; if(peerHere&&k==="r"){c.close();return} attach(c);
      if(k==="r"){connR=c; c.on("open",()=>lobbyOn())} else connF=c;
    });
  };
  go(0);
}
function peerJoin(code,tries){
  const p=new Peer(peerOpts()); peer=p; tries=tries||0;
  p.on("error",e=>{
    if(NET.rk&&e.type==="peer-unavailable"&&tries<15){try{p.destroy()}catch(_){} peer=null; return setTimeout(()=>{if(NET.rk&&!peer)peerJoin(code,tries+1)},1500)} // l'hôte n'est peut-être pas encore prêt
    peerFail(e.type==="peer-unavailable"?"Salon introuvable":"Courtier injoignable ("+e.type+")");
  });
  p.on("open",()=>{
    const id="arene-"+code;
    connR=p.connect(id,{reliable:true,metadata:{c:"r"}}); connF=p.connect(id,{reliable:false,metadata:{c:"f"}});
    attach(connR); attach(connF);
    connR.on("open",()=>{openRoom(code);lobbyOn()});
  });
}
async function useServer(){
  if(!/^https?:$/.test(location.protocol))return false;
  try{const c=new AbortController();setTimeout(()=>c.abort(),2500);const r=await fetch("/health",{signal:c.signal});return r.ok&&(await r.text())==="ok"}catch(_){return false}
}
async function connectAny(host,code){
  btnC.disabled=btnJ.disabled=true; say("Connexion…");
  if(await useServer()){mode="ws";btnC.disabled=btnJ.disabled=false;return connect(()=>wsSend(host?{t:"create"}:{t:"join",code}))}
  mode="peer";
  try{await loadPeerLib()}catch(_){return peerFail("Bibliothèque PeerJS injoignable")}
  if(host)peerHost();else peerJoin(code);
}
function connect(onOpen){
  const url=(location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws";
  
  btnC.disabled=btnJ.disabled=true; say("Connexion…");
  try{ws=new WebSocket(url)}catch(_){say("Serveur injoignable");btnC.disabled=btnJ.disabled=false;return}
  ws.onopen=onOpen;
  ws.onerror=()=>{say("Serveur injoignable");btnC.disabled=btnJ.disabled=false};
  ws.onclose=()=>{ if(NET.on||role){ const was=NET.started; NET.leave(); say("Connexion perdue"); openMenu() } };
  ws.onmessage=ev=>{
    let m; try{m=JSON.parse(ev.data)}catch(_){return}
    if(m.t==="created"){openRoom(m.code)}
    else if(m.t==="peer"){try{if(pc)pc.close()}catch(_){} pc=dcR=dcF=null; pend=[]; startRTC(true);lobbyOn()}
    else if(m.t==="joined"){openRoom(codeIn.value.trim().toUpperCase());startRTC(false);lobbyOn()}
    else if(m.t==="sig")onSig(m.d);
    else if(m.t==="rel"){try{onMsg(JSON.parse(m.d))}catch(_){}}
    else if(m.t==="left"){peerGone()}
    else if(m.t==="err"){say(m.msg||"Erreur");btnC.disabled=btnJ.disabled=false}
  };
}
const teamPicks=()=>picks.map(k=>({key:k,kit:draftOf(k).slice()}));
function mineHello(){const t=teamPicks(); return {key:t[0].key,kit:t[0].kit,team:t}}
function saveKit(){if(picks.length!==3||!picks.every(k=>draftOf(k).length===4))return false; picks.forEach(k=>{KITS[k]=draftOf(k).slice()}); try{localStorage.setItem("aceKits",JSON.stringify(KITS));localStorage.setItem("aceTeam",JSON.stringify(picks));localStorage.setItem("aceKey",pick)}catch(_){} return true}
btnC.addEventListener("click",()=>{ if(!saveKit())return; role="host"; myHello=mineHello(); connectAny(true) });
btnJ.addEventListener("click",()=>{
  const c=(codeIn.value||"").trim().toUpperCase(); if(c.length!==4){say("Saisis le code du salon (4 lettres)");return}
  if(!saveKit())return; role="guest"; connectAny(false,c);
});
// Combat classé : la liaison passe toujours par PeerJS avec le code donné par le serveur de classement.
NET.saveKit=saveKit;
NET.rankedStart=function(info){
  NET.leave(); NET.rk={matchId:info.matchId,code:info.code,role:info.role}; role=info.role; myHello=mineHello(); mode="peer";
  btnC.disabled=btnJ.disabled=true; say("Connexion à l'adversaire…");
  loadPeerLib().then(()=>{ if(!NET.rk)return; if(info.role==="host")peerHost(info.code); else peerJoin(info.code,0) },()=>peerFail("Bibliothèque PeerJS injoignable"));
};
// Tout message relayé avant le démarrage passe par le serveur ; ensuite le canal direct prend le relais.
})();
