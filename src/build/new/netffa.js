/* ===== Mêlée en ligne (3 ou 4 joueurs, chacun pour soi) : un hôte fait autorité, jusqu'à 3 invités en étoile via PeerJS =====
   L'hôte simule la partie et envoie l'état 20 fois par seconde à chaque invité ; chaque invité envoie ses ordres et prédit son propre combattant. */
(function(){
const MAXP=4, MINP=3, SNAP_DT=.05;
const GV=(((document.getElementById("ver")||{}).textContent)||"").trim().split(" ")[0]||"?";
const SKIP=new Set(["sp","hover","lx","ly","vx","vy","x","y","tick","frame","hpShow","flash","rest","hit","key","anim","remote","tgt","tgtT"]);
const OWN_SKIP=new Set(["moveTarget","wantShield","aimPt","run","bot","holdKey"]); // pilotés localement par le joueur (ou son bot de test)
const PRED=new Set(["cast","rush","chan","tunnel","counter","pp","cd","comboT","lock","lockPt","shieldOn","shieldE","dir","stun"]);
const M={peer:null,role:"",code:"",slot:0,players:[],conns:[],host:null,ready:false,started:false,seq:0,lastSeq:-1,castSeq:0,ackSeq:{},snapAcc:0,mvAcc:0,lastMv:"",lastSh:false,lastMvAt:0,castAt:0};
// ---------- interface : cadre dans l'onglet en ligne ----------
const box=document.createElement("div"); box.id="ffaBox";
const st=document.createElement("style");
st.textContent='#ffaBox{margin:0 0 10px;padding:10px 12px;border:3px solid #7fe0ff;background:#0b1340;font:600 14px "Pixelify Sans",var(--display);color:#cfd8ff;display:flex;flex-direction:column;gap:8px}#ffaBox h3{margin:0;font-size:16px;color:#7fe0ff}#ffaBox .frow{display:flex;gap:8px;flex-wrap:wrap;align-items:center}#ffaBox input{font:inherit;padding:5px 8px;background:#050a28;color:#fff;border:2px solid #7f95e8;width:90px;text-transform:uppercase}#ffaBox button{font:inherit;color:#7fe0ff;background:#1b2a8a;border:3px solid #7fe0ff;padding:5px 14px;cursor:pointer}#ffaBox button:disabled{opacity:.45;cursor:default}#ffaBox .fslots{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}#ffaBox .fslot{border:2px solid #4a68c8;padding:5px;min-height:62px;font-size:12px;text-align:center}#ffaBox .fslot.ok{border-color:#8aff8a}#ffaBox .fslot img{width:28px;height:28px;image-rendering:pixelated}#ffaBox .fcode{font-size:20px;color:#fff;letter-spacing:3px}#ffaMsg{min-height:16px;color:#9fb4ff}';
document.head.appendChild(st);
const onl=document.getElementById("onl"), rowEl=document.getElementById("netRow");
if(onl)onl.insertBefore(box,rowEl||null);
const say=t=>{const m=document.getElementById("ffaMsg"); if(m)m.textContent=t||""};
const myTeam=()=>picks.slice(0,2).map(k=>({key:k,kit:draftOf(k).slice()}));
const validKit=(key,kit)=>Array.isArray(kit)&&kit.length===4&&kit.every(id=>SPECIES[key]&&SPECIES[key].pool.includes(id))&&new Set(kit).size===4;
const validTeam=t=>Array.isArray(t)&&t.length===2&&t[0].key!==t[1].key&&t.every(x=>x&&SPECIES[x.key]&&SPECIES[x.key].playable&&validKit(x.key,x.kit));
const myName=()=>playerName()||(typeof RK!=="undefined"&&RK.prof&&RK.prof.name)||((LANG==="en"?"Player ":"Joueur ")+(M.slot+1));
function render(){
  const L=LANG==="en"; let h='<h3>'+(L?"Online brawl (3-4 players, free-for-all, 2 Pokémon each)":"Mêlée en ligne (3-4 joueurs, chacun pour soi, 2 Pokémon chacun)")+'</h3>';
  if(!M.role){
    h+='<div class="frow"><button type="button" id="ffaCreate">'+(L?"Create a brawl":"Créer une mêlée")+'</button><span>'+(L?"or":"ou")+'</span><input id="ffaCode" maxlength="4" placeholder="CODE" autocomplete="off" spellcheck="false" aria-label="Code"><button type="button" id="ffaJoin">'+(L?"Join":"Rejoindre")+'</button></div>';
  }else{
    h+='<div class="frow"><span>'+(L?"Room code":"Code du salon")+'</span><b class="fcode">'+M.code+'</b></div><div class="fslots">';
    for(let i=0;i<MAXP;i++){const p=M.players[i];
      h+='<div class="fslot'+(p&&p.ready?' ok':'')+'">'+(p?('<b>'+(p.name||"?")+(i===M.slot?(L?" (you)":" (toi)"):"")+'</b><br>'+(p.team||[]).map(t=>'<img alt="" src="'+(PORTRAITS[t.key]||"")+'">').join("")+'<br>'+(p.ready?(L?"Ready":"Prêt"):(L?"Waiting":"En attente"))):(L?"Free slot":"Place libre"))+'</div>'}
    h+='</div><div class="frow"><button type="button" id="ffaReady">'+(M.ready?(L?"Cancel":"Annuler"):(L?"Ready":"Prêt"))+'</button>'+(M.role==="host"?'<button type="button" id="ffaGo"'+(canStart()?'':' disabled')+'>'+(L?"Start":"Lancer")+'</button>':'')+'<button type="button" id="ffaQuit">'+(L?"Leave":"Quitter")+'</button></div>';
  }
  h+='<div class="fteam" id="ffaTeam"></div>';
  h+='<div id="ffaMsg"></div>';
  const keep=(document.getElementById("ffaMsg")||{}).textContent;
  box.innerHTML=h; if(keep)say(keep);
  const g=id=>document.getElementById(id);
  if(g("ffaCreate"))g("ffaCreate").onclick=()=>{if(!teamOk())return; host()};
  if(g("ffaJoin"))g("ffaJoin").onclick=()=>{const c=(g("ffaCode").value||"").trim().toUpperCase(); if(c.length!==4)return say(L?"Enter the 4-letter code":"Saisis le code (4 lettres)"); if(!teamOk())return; join(c)};
  if(g("ffaCode"))g("ffaCode").onkeydown=e=>e.stopPropagation();
  if(g("ffaReady"))g("ffaReady").onclick=()=>{if(!M.ready&&!teamOk())return; M.ready=!M.ready; sendHello(); render()};
  if(g("ffaGo"))g("ffaGo").onclick=()=>hostStart();
  if(g("ffaQuit"))g("ffaQuit").onclick=()=>{leave(); say("")};
}
function teamOk(){ if(validTeam(myTeam()))return true; say(LANG==="en"?"Pick 2 Aces with 4 moves each in the Solo tab (you have "+picks.length+")":"Choisis 2 Aces avec 4 sorts chacun dans l'onglet Solo (tu en as "+picks.length+")"); return false }
const canStart=()=>{const P=M.players.filter(Boolean); return P.length>=MINP&&P.every(p=>p.ready&&validTeam(p.team))};
// ---------- connexion ----------
const peerOpts=()=>{const u=new URLSearchParams(location.search); return u.get("peerhost")?{host:u.get("peerhost"),port:+u.get("peerport")||9000,path:"/",secure:false}:{}};
const rcode=()=>{let c="";for(let i=0;i<4;i++)c+="ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random()*24)];return c};
function loadLib(){return new Promise((ok,ko)=>{if(window.Peer)return ok(); const s=document.createElement("script"); s.src="https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js"; s.onload=ok; s.onerror=ko; document.head.appendChild(s)})}
async function host(){
  try{await loadLib()}catch(_){return say("PeerJS injoignable")}
  NET.leave(); M.role="host"; M.slot=0; M.ready=false; M.players=[{name:myName(),team:myTeam(),ready:false}]; M.conns=[];
  const go=n=>{ if(n>5)return say("Courtier injoignable");
    const code=rcode(), p=new Peer("arene-m-"+code,peerOpts()); M.peer=p;
    p.on("open",()=>{M.code=code; render(); say(LANG==="en"?"Share the code with 2 or 3 friends":"Donne le code à 2 ou 3 amis")});
    p.on("error",e=>{if(e.type==="unavailable-id"){try{p.destroy()}catch(_){} go(n+1)} else say("Courtier : "+e.type)});
    p.on("connection",c=>{
      const kind=c.metadata&&c.metadata.c, gid=c.metadata&&c.metadata.g;
      let slot=M.conns.findIndex(x=>x&&x.gid===gid);
      if(slot<0){ if(M.started){c.close();return} slot=[1,2,3].find(i=>!M.conns[i]); if(slot===undefined){c.close();return} M.conns[slot]={gid}; }
      const C=M.conns[slot]; if(kind==="f")C.f=c; else C.r=c;
      c.on("data",d=>{try{onHostMsg(slot,d)}catch(_){}});
      c.on("close",()=>{if(kind==="r")dropGuest(slot)});
      if(kind==="r")c.on("open",()=>{c.send({t:"welcome",slot,code:M.code,v:GV}); broadcastLobby()});
    });
  };
  go(0); render();
}
async function join(code){
  try{await loadLib()}catch(_){return say("PeerJS injoignable")}
  NET.leave(); M.role="guest"; M.code=code; M.ready=false; M.players=[]; const gid=Math.random().toString(36).slice(2);
  const p=new Peer(peerOpts()); M.peer=p;
  p.on("error",e=>say(e.type==="peer-unavailable"?(LANG==="en"?"Room not found":"Salon introuvable"):"Courtier : "+e.type));
  p.on("open",()=>{
    const id="arene-m-"+code; M.host={r:p.connect(id,{reliable:true,metadata:{c:"r",g:gid}}),f:p.connect(id,{reliable:false,metadata:{c:"f",g:gid}})};
    [M.host.r,M.host.f].forEach(c=>c.on("data",d=>{try{onGuestMsg(d)}catch(_){}}));
    M.host.r.on("close",()=>{if(M.role==="guest"){const was=M.started; leave(); say(LANG==="en"?"The host left":"L'hôte a quitté la partie"); if(was)openMenu()}});
  });
  render();
}
function sendHost(o,fast){const c=M.host&&(fast&&M.host.f&&M.host.f.open?M.host.f:M.host.r); if(c&&c.open)c.send(o)}
function sendAll(o,fast){M.conns.forEach(C=>{if(!C)return; const c=fast&&C.f&&C.f.open?C.f:C.r; if(c&&c.open)c.send(o)})}
function sendHello(){ const h={t:"hello",name:myName(),team:myTeam(),ready:M.ready,v:GV}; if(M.role==="host"){M.players[0]=Object.assign(M.players[0]||{},h); broadcastLobby()} else sendHost(h) }
function broadcastLobby(){ if(M.role!=="host")return; sendAll({t:"lobby",players:M.players}); render() }
function dropGuest(slot){
  M.conns[slot]=null; if(!M.started){M.players[slot]=null; broadcastLobby(); return}
  const e=entities[slot]; if(e&&!e.out){e.team&&e.team.forEach(s=>{s.dead=true}); e.hp=0; ffaOut(e); showLog((M.players[slot]&&M.players[slot].name||"?")+(LANG==="en"?" left":" a quitté la partie"),1600)}
}
// ---------- messages ----------
function onHostMsg(slot,m){
  (M.seen||(M.seen={}))[slot]=performance.now();
  if(m.t==="hello"){ if(m.v!==GV){const c=M.conns[slot]; if(c&&c.r)c.r.send({t:"bye",msg:"Versions différentes (hôte "+GV+") : recharge la page (Ctrl+F5)."}); return}
    M.players[slot]={name:String(m.name||"?").slice(0,16),team:validTeam(m.team)?m.team:[],ready:!!m.ready&&validTeam(m.team)}; broadcastLobby(); return }
  if(!M.started)return;
  const g=entities[slot]; if(!g||g.out)return;
  if(m.t==="mv"){ if(g.ko<=0&&g.stun<=0)g.moveTarget=m.c?{x:m.x,y:m.y,chase:true}:{x:clampX(m.x),y:clampY(m.y)} }
  else if(m.t==="sh"){ g.wantShield=!!m.v&&g.ko<=0 }
  else if(m.t==="cast"){ M.ackSeq[slot]=Math.max(M.ackSeq[slot]||0,m.seq); if(g.ko>0||!(SPL[m.id]||m.id==="swap"||m.id==="flash"||m.id==="taunt"))return;
    g.aimPt={wx:m.wx,wy:m.wy}; g.aimMode=["off","assist","lock"].includes(m.am)?m.am:"assist"; cast(g,m.id) }
  else if(m.t==="cancel"){ if(g.rush&&g.rush.ph==="chan")cancelRush(g,false);else if(g.chan)cancelChan(g,false) }
  else if(m.t==="hold"){ g.holdKey=!!m.v }
}
function onGuestMsg(m){
  M.hostSeen=performance.now();
  if(m.t==="welcome"){ M.slot=m.slot; if(m.v!==GV){say("Versions différentes (hôte "+m.v+", toi "+GV+") : recharge la page (Ctrl+F5).")} sendHello(); return }
  if(m.t==="bye"){ say(m.msg); leave(); return }
  if(m.t==="lobby"){ M.players=m.players; render(); return }
  if(m.t==="fstart"){ begin(m.roster,m.arena); return }
  if(m.t==="snap"&&M.started){ applySnap(m); return }
  if(m.t==="fround"&&M.started){ FFA.w=m.w; FFA.round=m.r; ffaRoundMsg(m.win); setTimeout(()=>{if(M.started)introPending=true},2600); return } // même délai que l'hôte (FFA.nextT) : le décompte ne démarre pas tout de suite chez les invités
  if(m.t==="fend"&&M.started){ FFA.out=m.out.map(i=>entities[i]); if(m.w)FFA.w=m.w; if(typeof showResult==="function")showResult(); return }
}
// ---------- départ ----------
function hostStart(){
  if(M.role!=="host"||!canStart())return;
  const roster=[]; M.players.forEach((p,i)=>{if(p)roster.push({slot:i,name:p.name,team:p.team})});
  const arena=ARENA_PICK||"colisee"; sendAll({t:"fstart",roster,arena}); begin(roster,arena);
}
function begin(roster,arena){
  M.seen={}; M.hostSeen=performance.now(); roster.forEach(r=>{M.seen[r.slot]=performance.now()});
  setArena(ARENAS[arena]?arena:"colisee");
  M.started=true; M.seq=0; M.lastSeq=-1; M.castSeq=0; M.ackSeq={}; M.lastMv=""; M.lastSh=false;
  const ents=[]; // l'ordre des combattants suit les places du salon (0 = hôte), identique chez tout le monde
  roster.forEach(r=>{const t=r.team, e=makeFighter(t[0].key,0,0,false,t[0].kit); initTeam(e,t.map(x=>x.key),t.map(x=>x.kit)); e.pname=r.name; e.slotId=r.slot; ents.push(e)});
  const me=ents.find(e=>e.slotId===M.slot)||ents[0];
  player=me; ents.forEach(e=>{if(e!==me)e.remote=true});
  NET.on=true; NET.host=M.role==="host"; NET.guest=M.role==="guest"; NET.started=true; NET.ffa=true;
  menuOpen=false; menuEl.hidden=true; endShown=false; musicSet("battle");
  ffaStart(null,ents); playerKey=player.key; last=performance.now();
  M.slotIdx=ents.map(e=>e.slotId); // place du salon -> index dans entities
}
// ---------- état de jeu ----------
const rd=v=>Math.round(v*100)/100;
function enc(v,idx,depth){
  if(v===null||v===undefined)return v; const t=typeof v;
  if(t==="number")return isFinite(v)?rd(v):0; if(t==="string"||t==="boolean")return v;
  if(t!=="object"||depth>7)return undefined; const i=idx.get(v); if(i!==undefined)return {$e:i};
  if(Array.isArray(v))return v.map(x=>{const r=enc(x,idx,depth+1);return r===undefined?null:r});
  if(Object.getPrototypeOf(v)!==Object.prototype)return undefined;
  const o={}; for(const k in v){const r=enc(v[k],idx,depth+1); if(r!==undefined)o[k]=r} return o;
}
function dec(v){ if(v===null||typeof v!=="object")return v; if(Array.isArray(v))return v.map(dec); if("$e" in v)return entities[v.$e]; const o={}; for(const k in v)o[k]=dec(v[k]); return o }
function snapshot(ack){
  const idx=new Map(entities.map((e,i)=>[e,i])); player.aimPt=mouse?{wx:mouse.wx,wy:mouse.wy}:null;
  const E=entities.map(e=>{const o={}; for(const k in e){if(k==="sp"||k==="hover"||k==="tgt")continue; const r=enc(e[k],idx,0); if(r!==undefined)o[k]=r} o.x=rd(e.x);o.y=rd(e.y);o.anim=e.anim;o.frame=e.frame;o.tick=rd(e.tick);o.hit=e.hit;o.key=e.key; return o});
  return {t:"snap",n:++M.seq,E,O:enc(orbs,idx,0),Z:enc(zones,idx,0),B:OBST.map(c=>Math.round(c.hp)),out:FFA.out.map(e=>entities.indexOf(e)),fw:FFA.w,fn:FFA.need,fr:FFA.round,ft:Math.round(FFA.t*10)/10};
}
const pending=()=>M.castSeq>(M.ackMine||0)&&performance.now()-M.castAt<500;
function applyEnt(e,s,own,pend){
  for(const k in s){ if(SKIP.has(k)||(own&&(OWN_SKIP.has(k)||(pend&&PRED.has(k)))))continue; e[k]=dec(s[k]) }
  for(const k in e){ if(SKIP.has(k)||k in s||(own&&(OWN_SKIP.has(k)||(pend&&PRED.has(k)))))continue; if(k==="pname"||k==="slotId")continue; delete e[k] }
  if(s.key&&e.key!==s.key&&SPECIES[s.key]){e.key=s.key;e.sp=SPECIES[s.key];if(own&&typeof applyKit==="function")applyKit()}
  if(own&&!s.moveTarget&&e.moveTarget&&performance.now()-M.lastMvAt>300)e.moveTarget=null;
  if(!(own&&pend)){ if(s.anim!==e.anim){e.anim=s.anim;e.frame=s.frame;e.tick=s.tick;e.hit=s.hit} else if(Math.abs(s.frame-e.frame)>1){e.frame=s.frame;e.tick=s.tick} }
  const dx=s.x-e.x, dy=s.y-e.y, d=Math.hypot(dx,dy);
  if(d>70){e.x=s.x;e.y=s.y;e.lx=e.x;e.ly=e.y} else if(d>(own?3:.5)){const k=own?.14:.3; e.x+=dx*k; e.y+=dy*k}
}
function applySnap(m){
  if(m.n<=M.lastSeq)return; M.lastSeq=m.n; if(m.ack!==undefined)M.ackMine=Math.max(M.ackMine||0,m.ack);
  const pend=pending();
  entities.forEach((e,i)=>{if(m.E[i])applyEnt(e,m.E[i],e===player,pend&&e===player)});
  const keep=arr=>pend?arr.filter(o=>o.o===player):[];
  const mix=(dst,src)=>{const loc=keep(dst), h=dec(src||[]).filter(o=>!(pend&&o.o===player)); dst.length=0; dst.push(...h,...loc)};
  mix(orbs,m.O); mix(zones,m.Z); if(m.B&&typeof obstSet==="function")m.B.forEach((h,i)=>obstSet(i,h));
  if(m.out)FFA.out=m.out.map(i=>entities[i]).filter(Boolean);
  if(m.fw){FFA.w=m.fw; FFA.need=m.fn||1; FFA.round=m.fr||1; if(m.ft!==undefined)FFA.t=m.ft}
}
// ---------- branchement sur le réseau existant (NET) ----------
const _tick=NET.tick, _send=NET.send, _sendCast=NET.sendCast, _leave=NET.leave, _toLobby=NET.toLobby;
NET.tick=function(dt){
  if(!NET.ffa)return _tick(dt);
  if(!NET.started)return;
  // présence : un joueur muet depuis 6 s est considéré comme parti (une fermeture d'onglet n'est pas toujours signalée)
  const now=performance.now();
  if(NET.host){ M.conns.forEach((C,slot)=>{if(C&&M.seen&&M.seen[slot]&&now-M.seen[slot]>6000){M.seen[slot]=0; try{C.r&&C.r.close()}catch(_){} dropGuest(slot)}}) }
  else{ M.kaAcc=(M.kaAcc||0)+dt; if(M.kaAcc>1){M.kaAcc=0; sendHost({t:"ka"})} if(M.hostSeen&&now-M.hostSeen>6000){M.hostSeen=0; const was=M.started; leave(); say(LANG==="en"?"Lost connection to the host":"Connexion perdue avec l'hôte"); if(was)openMenu(); return} }
  if(NET.host){ M.snapAcc+=dt; if(M.snapAcc>=SNAP_DT){M.snapAcc=0; const s=snapshot(); M.conns.forEach((C,slot)=>{if(!C)return; s.ack=M.ackSeq[slot]||0; const c=C.f&&C.f.open?C.f:C.r; if(c&&c.open)c.send(s)})} }
  else{
    M.mvAcc+=dt; const mt=player.moveTarget;
    if(mt&&M.mvAcc>=.04){const k=mt.chase?"c"+Math.round(mt.x)+","+Math.round(mt.y):Math.round(mt.x)+","+Math.round(mt.y); if(k!==M.lastMv){M.lastMv=k;M.lastMvAt=performance.now();M.mvAcc=0;sendHost({t:"mv",x:mt.x,y:mt.y,c:!!mt.chase},true)}}
    if(!mt)M.lastMv="";
    if(player.wantShield!==M.lastSh){M.lastSh=player.wantShield; sendHost({t:"sh",v:M.lastSh})}
    if(player.holdKey!==M.lastHold){M.lastHold=player.holdKey; sendHost({t:"hold",v:!!player.holdKey})}
  }
};
NET.ffaSend=function(o){ if(NET.host)sendAll(o) };
NET.send=function(o,rel){ if(!NET.ffa)return _send(o,rel); if(NET.host)sendAll(o,!rel); else sendHost(o,!rel) };
NET.sendCast=function(id){ if(!NET.ffa)return _sendCast(id); M.castSeq++; M.castAt=performance.now(); const hov=hoverEnemy(), p=hov?{wx:foe.x,wy:foe.y}:((player.bot&&player.aimPt)||mouse||{wx:player.x,wy:player.y}); sendHost({t:"cast",id,seq:M.castSeq,wx:p.wx,wy:p.wy,am:AIM.mode}) };
function leave(){
  if(M.peer){try{M.peer.destroy()}catch(_){}} M.peer=null; M.host=null; M.conns=[]; M.players=[]; M.role=""; M.code=""; M.ready=false; M.started=false;
  if(NET.ffa){NET.ffa=false; NET.on=false; NET.host=false; NET.guest=false; NET.started=false}
  render();
}
NET.leave=function(){ if(NET.ffa||M.role)leave(); return _leave.apply(this,arguments) };
NET.toLobby=function(){ if(!NET.ffa)return _toLobby&&_toLobby.apply(this,arguments); // fin de partie : tout le monde revient au salon
  M.started=false; NET.started=false; M.ready=false; if(NET.host){M.players.forEach(p=>{if(p)p.ready=false}); broadcastLobby()} else sendHello(); render() };
// l'hôte annonce la fin aux invités
setTimeout(()=>{const _sr=showResult; showResult=function(){ if(NET.ffa&&NET.host&&!endShown)sendAll({t:"fend",out:FFA.out.map(e=>entities.indexOf(e)),w:FFA.w}); return _sr.apply(this,arguments) }},0);
setInterval(()=>{ if(M.role&&!M.started){ box.hidden=false } },500);
let _ffaLang=LANG; setInterval(()=>{ if(LANG!==_ffaLang){_ffaLang=LANG; render()} },500); // le cadre mêlée suit la langue choisie
// rappel des 2 Aces joués (mis à jour sans reconstruire le cadre : le code saisi reste)
setInterval(()=>{const el=document.getElementById("ffaTeam"); if(!el)return; const L=LANG==="en", t=picks.slice(0,2).map(k=>(SPECIES[k]&&SPECIES[k].name)||k);
  el.style.color=t.length===2?"#7fe0a0":"#ffd24a";
  const m=document.getElementById("ffaMsg"); if(m&&t.length===2&&validTeam(myTeam())&&/^(Choisis 2|Pick 2)/.test(m.textContent))m.textContent="";
  el.textContent=(L?"Your 2 Aces: ":"Tes 2 Aces : ")+(t.length===2?t.join(" + ")+(picks.length>2?(L?" (3rd ignored)":" (le 3e est ignoré)"):""):(L?"pick 2 in the Solo tab":"choisis-en 2 dans l'onglet Solo"))},400);
render();
NET.ffaState=M;
})();
