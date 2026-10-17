// ===== Contrôles, interface, boucle =====
function toWorld(e){const r=stage.getBoundingClientRect(),d=window.devicePixelRatio||1;return{wx:(e.clientX-r.left)*d/PX+cam.x,wy:(e.clientY-r.top)*d/PX+cam.y}}
stage.addEventListener("contextmenu",e=>e.preventDefault());
// Pointer l'ennemi transforme un ordre de déplacement en poursuite qui s'arrête à portée d'attaque.
function hoverEnemy(){
  if(isMulti()&&mouse){for(const x of foesOf(player))if(alive(x)&&!x.gone&&hoverOn(x)){foe=x;return true} return false}
  return hoverOn(foe);
}
function hoverOn(t){ if(!mouse||!t||!alive(t))return false;
  const s=SHT(t), a=ANF(t), x0=t.x-a[0], y0=t.y-a[1];
  return mouse.wx>=x0+2&&mouse.wx<=x0+s.w-2&&mouse.wy>=y0+2&&mouse.wy<=y0+s.h;
}
function setMoveTarget(e,fresh){
  const w=toWorld(e); mouse=w; const chase=hoverEnemy();
  player.moveTarget=chase?{x:foe.x,y:foe.y,chase:true}:{x:clampX(w.wx),y:clampY(w.wy)};
  const m=player.moveTarget;
  if(fresh)marker={x:m.x,y:m.y,t:0,chase}; else if(marker){marker.x=m.x;marker.y=m.y;marker.chase=chase}
}
function cancelChannel(){if(NET.guest)NET.send({t:"cancel"});if(player.rush&&player.rush.ph==="chan")cancelRush(player,false);else if(player.chan)cancelChan(player,false)}
stage.addEventListener("pointerdown",e=>{
  if(paused||menuOpen||player.ko>0||e.target.closest("button")||(e.button!==0&&e.button!==2))return;
  if(player.rush||player.chan){if(e.button===2)cancelChannel();return}
  if(aiming){const a=aiming; aiming=null; lastE=ptrXY(e); mouse=toWorld(lastE);
    if(e.button===0)cast(player,a); return}
  lastE=ptrXY(e); held=true; setMoveTarget(lastE,true); try{stage.setPointerCapture(e.pointerId)}catch(_){}});
stage.addEventListener("pointermove",e=>{lastE=ptrXY(e)});
["pointerup","pointercancel"].forEach(t=>stage.addEventListener(t,()=>{held=false}));
// ---- Barre de sorts : les 4 emplacements prennent le kit de l'Ace choisi ----
// ---- Touches configurables (menu Pause) : on retient la touche physique (e.code), affichée selon la disposition du clavier ----
const BIND_DEF={s0:"KeyQ",s1:"KeyW",s2:"KeyE",s3:"KeyR",shield:"Space",swap:"Tab",flash:"KeyF",aim:"KeyT",taunt:"KeyG"};
const BIND=Object.assign({},BIND_DEF); try{const b=JSON.parse(localStorage.getItem("aceKeys")||"{}"); for(const k in BIND_DEF)if(typeof b[k]==="string")BIND[k]=b[k]}catch(_){}
const KEY_LBL={};
if(/^fr/i.test(navigator.language||""))Object.assign(KEY_LBL,{KeyQ:"A",KeyW:"Z",KeyA:"Q",KeyZ:"W",Semicolon:"M",KeyM:","}); // AZERTY par défaut en français
function keyLabel(c){ if(KEY_LBL[c])return KEY_LBL[c]; if(c==="Space")return "Espace"; if(c.startsWith("Key"))return c.slice(3); if(c.startsWith("Digit"))return c.slice(5); if(c.startsWith("Numpad"))return "Pavé "+c.slice(6); return ({ShiftLeft:"Maj",ShiftRight:"Maj D",ControlLeft:"Ctrl",ControlRight:"Ctrl D",AltLeft:"Alt",ArrowUp:"↑",ArrowDown:"↓",ArrowLeft:"←",ArrowRight:"→",Backquote:"²",CapsLock:"Verr. Maj"})[c]||c }
try{if(navigator.keyboard&&navigator.keyboard.getLayoutMap)navigator.keyboard.getLayoutMap().then(m=>{m.forEach((v,k)=>{if(v&&v.trim())KEY_LBL[k]=v.toUpperCase()}); if(typeof refreshKeyLabels==="function")refreshKeyLabels()}).catch(()=>{})}catch(_){}
const SLOT_KEYS=[0,1,2,3].map(i=>keyLabel(BIND["s"+i]));
const slotBtns=["atk","pls","tun","rsh"].map(id=>document.getElementById(id));
const shdBtn=document.getElementById("shd");
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);const c=v=>clamp(Math.round(v*f),0,255);return"#"+((1<<24)+(c(n>>16)<<16)+(c(n>>8&255)<<8)+c(n&255)).toString(16).slice(1)};
function applyKit(){
  slotBtns.forEach((btn,i)=>{
    const id=player.kit[i], sp=SPL[id], c=TYPE_COL[sp.type];
    btn.querySelector(".k").textContent=SLOT_KEYS[i]; btn.querySelector(".c").textContent=sp.cost; btn.querySelector(".n").textContent=sp.name;
    btn.style.setProperty("--g1",shade(c,1.1)); btn.style.setProperty("--g2",shade(c,.5)); btn.title=sp.name+" ("+TYPE_FR[sp.type]+", "+catFr(sp.cat).toLowerCase()+")";
    SLOT_T.delete(btn);
  });
  const kit=player.kit.map((id,i)=>"<b>"+SLOT_KEYS[i]+"</b> "+SPL[id].name+" ("+Math.round(SPL[id].cd*10)/10+" s)").join(" · ");
  helpEl.innerHTML="<b>Clic droit</b> : se déplacer (maintenir pour suivre)<br><b>Clic droit sur l'ennemi</b> : le poursuivre<br><b>"+keyLabel(BIND.shield)+"</b> : bouclier (maintenir)<br><b>"+keyLabel(BIND.swap)+"</b> : changer d'Ace (0,5 s)<br><b>"+keyLabel(BIND.flash)+"</b> : Flash, téléportation vers le curseur (recharge 5 s)<br>"+kit+"<br><b>Clic gauche</b> : lancer le sort · <b>Clic droit</b> ou <b>Échap</b> : annuler<br><b>Souris</b> : bloquée dans la fenêtre pendant le combat, <b>Échap</b> la libère et met en pause<br><b>Jets (Lance-Flammes, Hydrocanon, Blizzard)</b> : maintenir la touche, on reste immobile, relâcher coupe<br>Le mode de lancer se règle dans le menu Pause.";
  scoreEl.textContent=""; scoreTxt="";
}
const SLOT_T=new WeakMap();
const flashBtn=document.createElement("button"); flashBtn.type="button"; flashBtn.className="slot flashb"; flashBtn.title="Flash (F) : blink vers le curseur";
flashBtn.innerHTML='<span class="k">F</span><span class="n">Flash</span><span class="cd"></span><span class="t"></span>'; flashBtn.style.setProperty("--g1","#f4d24a"); flashBtn.style.setProperty("--g2","#6a5410");
shdBtn.parentNode.insertBefore(flashBtn,shdBtn);
const swapBtn=document.createElement("button"); swapBtn.type="button"; swapBtn.className="slot flashb"; swapBtn.id="swapb"; swapBtn.title="Changer d'Ace (Tab)";
swapBtn.innerHTML='<span class="k">Tab</span><span class="n">Ace</span><span class="cd"></span><span class="t"></span>'; swapBtn.style.setProperty("--g1","#e85a4a"); swapBtn.style.setProperty("--g2","#5a1a14");
shdBtn.parentNode.insertBefore(swapBtn,flashBtn);
swapBtn.addEventListener("click",()=>{if(!menuOpen&&!paused&&player.ko<=0)cast(player,"swap")});
flashBtn.addEventListener("click",()=>{if(!menuOpen&&!paused&&player.ko<=0)cast(player,"flash")});
function setSlot(btn,cd,max,active,cost){
  let t=SLOT_T.get(btn); if(!t){t={cd:btn.querySelector(".cd"),t:btn.querySelector(".t"),last:""};SLOT_T.set(btn,t)}
  const f=cd>0?clamp(cd/max,0,1):0, txt=cd>0?(cd<10?cd.toFixed(1):String(Math.ceil(cd))):"", afford=cost===undefined||player.pp>=cost, key=f.toFixed(3)+txt+active+afford;
  if(key===t.last)return; t.last=key;
  btn.style.setProperty("--cd",f.toFixed(3)); t.t.textContent=txt; btn.setAttribute("aria-disabled",String(cd>0)); btn.classList.toggle("aim",active); btn.classList.toggle("nopp",!afford);
}

/* ===== HUD de combat ===== */
// texte lisible sur une pastille de type : sombre sur fond clair, blanc sur fond foncé (contraste WCAG)
const chipFg=h=>{const m=/#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(h||"");if(!m)return"#fff";const l=[1,2,3].map(i=>{const v=parseInt(m[i],16)/255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)}),L=.2126*l[0]+.7152*l[1]+.0722*l[2];return L>.3?"#10152a":"#fff"};
const HUD_TC={normal:"#a8a878",fire:"#f08030",water:"#6890f0",electric:"#f8d030",grass:"#78c850",ice:"#98d8d8",fighting:"#c03028",poison:"#a040a0",ground:"#e0c068",flying:"#a890f0",psychic:"#f85888",bug:"#a8b820",rock:"#b8a038",ghost:"#705898",dragon:"#7038f8",dark:"#705848",steel:"#b8b8d0",fairy:"#ee99ac"};
const hudEl=document.createElement("div"); hudEl.id="fhud";
hudEl.innerHTML=["me","foe"].map(s=>'<div class="ht '+s+'"><div class="hp-pt"><img alt=""></div><div class="hb"><div class="hn"><b></b><span class="hty"></span><span class="hst"></span></div><div class="hbar"><i class="gh"></i><i class="fl"></i><em></em></div><div class="pbar"><i></i></div><div class="pips"></div><div class="bench"></div></div></div>').join("");
document.getElementById("stage").appendChild(hudEl);
const HT={me:hudEl.querySelector(".ht.me"),foe:hudEl.querySelector(".ht.foe")};
Object.values(HT).forEach(t=>{t.img=t.querySelector("img");t.nm=t.querySelector(".hn b");t.ty=t.querySelector(".hty");t.st=t.querySelector(".hst");t.gh=t.querySelector(".gh");t.fl=t.querySelector(".fl");t.num=t.querySelector(".hbar em");t.pp=t.querySelector(".pbar i");t.pips=t.querySelector(".pips");t.bn=t.querySelector(".bench");t.k=""});
function hudTile(t,e,pts,show){
  const key=e.key+"|"+e.sp.name; if(t.k!==key){t.k=key;t.img.src=PORTRAITS[e.key]||"";t.nm.textContent=e.sp.name;t.ty.innerHTML=e.sp.types.map(x=>'<u style="background:'+(HUD_TC[x]||"#888")+';color:'+chipFg(HUD_TC[x])+';text-shadow:none">'+TYPE_FR[x]+'</u>').join("")}
  const f=clamp(e.hp/e.maxHp,0,1), c=(e!==player&&matchMode!=="ffa")?(f>.2?"#e0403a":"#ff7a5a"):f>.5?"#5fd35f":f>.2?"#f0c030":"#e84040";
  t.fl.style.width=(f*100).toFixed(1)+"%"; t.fl.style.background=c; t.gh.style.width=(f*100).toFixed(1)+"%";
  t.classList.toggle("low",f<=.2&&e.ko<=0); t.classList.toggle("ko",e.ko>0);
  const n=Math.max(0,Math.ceil(e.hp))+" / "+e.maxHp; if(t.num.textContent!==n)t.num.textContent=n;
  t.pp.parentNode.style.display=e===player?"":"none"; if(e===player)t.pp.style.width=(clamp(e.pp/PP_MAX,0,1)*100).toFixed(1)+"%";
  const st=[]; if(e.burn>0)st.push("🔥"); if(e.psn>0)st.push("☠"); if(e.slow>0)st.push("❄"); if(e.stun>0)st.push("💫"); if(e.shieldOn)st.push("🛡");
  if(e.bf)for(const k in e.bf)if(e.bf[k]>0)st.push("⬆");
  const s=st.join(" "); if(t.st.textContent!==s)t.st.textContent=s;
  if(e.team&&e.team.length>1){
    const sig=e.team.map((s,i)=>s.key+(i===e.ti?"*":"")+(s.dead?"x":"")+Math.round((i===e.ti?e.hp:s.hp)/s.maxHp*20)).join("|");
    if(t.bn.dataset.v!==sig){t.bn.dataset.v=sig;t.bn.innerHTML=e.team.map((s,i)=>{const hp=i===e.ti?e.hp:s.hp;return '<i class="'+(i===e.ti?"on ":"")+(s.dead?"dead":"")+'" title="'+SPECIES[s.key].name+'"><img alt="" src="'+PORTRAITS[s.key]+'"><u style="width:'+Math.round(clamp(hp/s.maxHp,0,1)*100)+'%"></u></i>'}).join("")}
  }else if(t.bn.dataset.v){t.bn.dataset.v="";t.bn.innerHTML=""}
  const p=show?String(pts):""; if(t.pips.dataset.v!==p){t.pips.dataset.v=p;t.pips.textContent=show?"Rounds "+pts:""}
}
function hudUpdate(){
  const duel=matchMode==="duel"; hudEl.style.display=(menuOpen||!player||!foe||matchMode==="ffa")?"none":"";
  if(!player||!foe)return;
  hudTile(HT.me,player,score.me,duel); hudTile(HT.foe,foe,score.foe,duel);
  hudDim();
}
// un panneau du HUD s'efface quand un Pokémon passe dessous, pour ne jamais le cacher
let hudDimN=0;
function hudDim(){
  if((hudDimN=(hudDimN+1)%6))return; // 10 fois par seconde suffit, évite de forcer la mise en page à chaque image
  const r=stage.getBoundingClientRect(), k=PX/(window.devicePixelRatio||1);
  [HT.me,HT.foe].forEach(el=>{
    if(!el)return; const b=el.getBoundingClientRect();
    const under=fighters.some(e=>{const sx=r.left+(e.x-cam.x)*k, sy=r.top+(e.y-cam.y)*k, h=(e.sp.body*2+10)*k;
      return sx>b.left-10&&sx<b.right+10&&sy-h<b.bottom+6&&sy>b.top});
    el.classList.toggle("hdim",under);
  });
}
const scoreEl=document.getElementById("score"); let scoreTxt="";
function updateHud(){
  hudUpdate();
  slotBtns.forEach((btn,i)=>{
    const id=player.kit[i], sp=SPL[id], ch=(id==="rush"&&player.rush&&player.rush.ph==="chan")||(id==="gleam"&&!!player.chan)||(!!SPL[id].buff&&!!player.bf[SPL[id].buff])||((id==="mburst"||id==="riposte")&&!!player.counter);
    setSlot(btn,cdOf(player,id),sp.cd,aiming===id||ch,sp.cost);
  });
  setSlot(flashBtn,cdOf(player,"flash"),FLASH.cd,false); swapBtn.hidden=!(player.team&&player.team.length>1); if(!swapBtn.hidden)setSlot(swapBtn,player.swapCd||0,SWAP.cd,!!player.swapC);
  const pr=String(!!player.shieldOn); if(shdBtn.getAttribute("aria-pressed")!==pr)shdBtn.setAttribute("aria-pressed",pr);
  const txt="";
  if(txt!==scoreTxt){scoreTxt=txt;scoreEl.textContent=txt}
}
slotBtns.forEach((btn,i)=>btn.addEventListener("click",()=>{if(!menuOpen&&!paused&&player.ko<=0)cast(player,player.kit[i])}));
shdBtn.addEventListener("pointerdown",e=>{btnShield=true;shdBtn.setPointerCapture(e.pointerId)});
["pointerup","pointercancel","lostpointercapture"].forEach(t=>shdBtn.addEventListener(t,()=>{btnShield=false}));
// ---- Clavier ----
// Comme dans LoL : on appuie sur la touche d'un sort pour voir sa portée, clic gauche pour lancer vers le curseur, clic droit ou Échap pour annuler.
const CAST_MODES=[["click","Sorts : visée au clic"],["quick","Sorts : lancer instantané"],["hold","Sorts : relâcher pour lancer"]];
let castMode="click"; try{const m=localStorage.getItem("castMode");if(CAST_MODES.some(c=>c[0]===m))castMode=m}catch(_){}
function pressSpell(slot){ const id=player.kit[slot]; if(!id||player.ko>0)return; if(typeof STREAM_DEFS!=="undefined"&&STREAM_DEFS.some(d=>d.id===id)){aiming=null;player.holdKey=true;player.holdSlot=slot;cast(player,id);return} if(castMode==="quick"||SPL[id].self){aiming=null;cast(player,id)} else aiming=id }
function releaseSpell(){ const n=aiming; aiming=null; if(n)cast(player,n) }
const slotOf=e=>{const i=[0,1,2,3].find(i=>e.code===BIND["s"+i]); return i===-1?undefined:i};
addEventListener("keydown",e=>{const k=e.key.toLowerCase();
  if(menuOpen)return;
  if(k==="escape"||k==="p"){
    if(paused){setPause(false);return}
    if(k==="escape"&&(aiming||channeling())){aiming=null;if(channeling())cancelChannel();return}
    setPause(true);return}
  if(paused)return;
  if(e.code===BIND.aim){const i=AIM.modes.findIndex(x=>x[0]===AIM.mode),n=AIM.modes[(i+1)%3];setAimMode(n[0]);showLog("Visée : "+n[1],900);return}
  if(e.code===BIND.shield){e.preventDefault();keys.add("shield");return}
  if(e.code===BIND.swap){e.preventDefault();if(!e.repeat&&player.ko<=0)cast(player,"swap");return}
  if(k==="tab"){e.preventDefault();return}
  if(e.code===BIND.taunt){e.preventDefault();if(!e.repeat&&player.ko<=0)cast(player,"taunt");return}
  if(e.code===BIND.flash){e.preventDefault();if(!e.repeat&&player.ko<=0)cast(player,"flash");return}
  const s=slotOf(e); if(s!==undefined){e.preventDefault();if(!e.repeat)pressSpell(s);return}
  if(["arrowup","arrowdown","arrowleft","arrowright"].includes(k))e.preventDefault();
  keys.add(k)});
addEventListener("keyup",e=>{if(e.code===BIND.shield){e.preventDefault();keys.delete("shield")} keys.delete(e.key.toLowerCase());
  if(player.holdKey&&slotOf(e)===player.holdSlot)player.holdKey=false;
  if(castMode==="hold"&&aiming){const s=slotOf(e); if(s!==undefined&&aiming===player.kit[s])releaseSpell()}});
document.querySelectorAll("#aimModes button").forEach(b=>b.addEventListener("click",()=>setAimMode(b.dataset.m)));setAimMode(AIM.mode);
const modeBtn=document.getElementById("mode");
function showMode(){modeBtn.textContent=CAST_MODES.find(c=>c[0]===castMode)[1]}
modeBtn.addEventListener("click",()=>{castMode=CAST_MODES[(CAST_MODES.findIndex(c=>c[0]===castMode)+1)%3][0];aiming=null;try{localStorage.setItem("castMode",castMode)}catch(_){}showMode()});
showMode();
const helpBtn=document.getElementById("helpBtn"), helpEl=document.getElementById("help");
helpBtn.addEventListener("click",e=>{e.stopPropagation();helpEl.hidden=!helpEl.hidden;helpBtn.setAttribute("aria-expanded",String(!helpEl.hidden))});
addEventListener("click",e=>{if(!helpEl.hidden&&!helpEl.contains(e.target)){helpEl.hidden=true;helpBtn.setAttribute("aria-expanded","false")}});
// ---- Pause : Échap (quand rien n'est à annuler) ou P. Aussi automatique quand l'onglet perd le focus. ----
let paused=false, menuOpen=true;
const pauseEl=document.getElementById("pause"), pauseBtn=document.getElementById("pauseBtn");
function setPause(v){
  if(menuOpen&&v)return;
  paused=v; document.body.classList.toggle("paused",v); musicDuck(v); pauseEl.hidden=!v; pauseBtn.textContent=v?"Reprendre":"Pause"; pauseBtn.setAttribute("aria-pressed",String(v));
  if(v){keys.clear();held=false;btnShield=false;aiming=null;if(channeling())cancelChannel()} else last=performance.now();
}
pauseBtn.addEventListener("click",()=>setPause(!paused));
document.getElementById("resume").addEventListener("click",()=>setPause(false));
document.addEventListener("visibilitychange",()=>{if(document.hidden)setPause(true)});
addEventListener("blur",()=>{keys.clear();aiming=null});
// ---- Choix de l'Ace ----
const menuEl=document.getElementById("menu"), cardsEl=document.getElementById("cards"), goBtn=document.getElementById("go");
var bestOf=3; try{const bo=+localStorage.getItem("aceBo"); if(bo===1||bo===3||bo===5)bestOf=bo}catch(_){}
var endShown=false;
let pick="garchomp", pickMode="train";
try{const d=localStorage.getItem("aceDiff"); if(DIFFS[d])diff=d; const fp=localStorage.getItem("aceFoe"); if(fp==="rand"||(SPECIES[fp]&&SPECIES[fp].playable))foePick=fp}catch(_){}
try{const k=localStorage.getItem("aceKey"); if(SPECIES[k]&&SPECIES[k].playable)pick=k; const m=localStorage.getItem("aceMode"); if(m==="duel"||m==="train"||m==="ffa")pickMode=m}catch(_){}
let picks=[];
try{const t=JSON.parse(localStorage.getItem("aceTeam")||"[]"); if(Array.isArray(t))picks=t.filter((k,i)=>SPECIES[k]&&SPECIES[k].playable&&t.indexOf(k)===i).slice(0,3)}catch(_){}
if(!picks.length)picks=[pick]; if(!picks.includes(pick))pick=picks[0];
// ---- Équipement : 4 sorts au choix parmi les 8 de l'Ace ----
const DESC={
  scl:"Griffures spectrales devant soi. Rapide.",shball:"Sphère d'ombre en ligne droite.",sbomb:"Projectile lobé : explose sur la zone visée puis laisse une flaque qui empoisonne 3 s.",
  ssneak:"Fonce à travers l'ombre sur une courte distance et frappe le premier touché.",hypno:"Orbe lent : endort la cible 1,4 s. Un coup la réveille.",hex:"Zone visée, dégâts x1,6 si la cible est empoisonnée, ralentie, étourdie ou endormie.",
  nplot:"Gros bonus d'Atq. Spé pendant 8 s.",tbolt:"Éclair rapide en ligne droite.",
  claw:"Trois griffures devant soi. Rapide, enchaîne après Tunnel.",mud:"Projectile de boue en ligne droite.",tun:"Fonce sous terre (intouchable) et surgit pour frapper autour du trou. Remet le corps à corps à zéro.",
  rush:"Canalise, puis charge longue qui étourdit le premier touché. Interrompue si on est touché pendant la canalisation.",quake:"Onde centrée sur soi, forte poussée et étourdissement.",rslide:"Trois rochers tombent en ligne devant soi.",
  ihead:"Petit élan et coup au front qui étourdit.",sdance:"Bonus d'Attaque pendant 8 s.",moon:"Orbe féerique en ligne droite.",psy:"Zone visée qui explose après un court délai.",grav:"Zone qui aspire l'adversaire pendant 2,4 s.",
  calm:"Bonus d'Atq. Spé et de Déf. Spé pendant 8 s.",gleam:"Canalise sur place, puis rayon long qui traverse tout et étourdit.",conf:"Onde psychique devant soi, légèrement plus longue que les griffes.",
  tele:"Se téléporte à l'endroit visé (portée 130). Aucun dégât.",fsight:"Zone visée qui n'explose qu'après 1,5 s : il faut anticiper l'adversaire.",mburst:"Posture de riposte : le prochain coup reçu est rendu à 150 %.",
  idef:"Bonus de Défense pendant 8 s.",trap:"Pose un piège qui reste 9 s. Le premier qui marche dessus est blessé et ralenti. Un seul à la fois.",fcannon:"Projectile d'acier rapide et précis.",sedge:"Ligne de pointes qui jaillit après un court délai."
};
const catFr=c=>c==="phys"?"Physique":c==="spec"?"Spécial":"Statut";
const draft={}; // panoplie en cours de choix, par Ace
const draftOf=k=>draft[k]||(draft[k]=kitOf(k).slice());
const equipEl=document.getElementById("equip");
const teamLineEl=document.createElement("div"); teamLineEl.id="teamLine"; equipEl.parentNode.insertBefore(teamLineEl,equipEl);
teamLineEl.addEventListener("click",e=>{const rm=e.target.closest("[data-rm]"), sl=e.target.closest(".tslot[data-i]"); if(rm){const i=+rm.dataset.rm; picks.splice(i,1); if(!picks.includes(pick))pick=picks[picks.length-1]||pick; refreshMenu()} else if(sl){pick=picks[+sl.dataset.i]; refreshMenu()}});
function moveInfo(id){const s=SPL[id];return catFr(s.cat)+" · "+TYPE_FR[s.type]+(s.power?" · Puiss. "+s.power:"")+" · Recharge "+s.cd+" s"}
function buildEquip(){
  const k=pick, sp=SPECIES[k], dk=draftOf(k);
  const stt=STAT_ROWS.map(([l,s])=>{const o=sp.official&&sp.official[s]!==undefined&&sp.official[s]!==sp.base[s]; // jauge jaune = stat ajustée pour l'équilibrage
    return '<div class="dsr'+(o?' adj':'')+'"'+(o?' title="Ajusté pour l\'équilibrage (officiel : '+sp.official[s]+')"':'')+'><span>'+l+'</span><u><s style="width:'+Math.round(sp.base[s]/190*100)+'%"></s></u><em>'+sp.base[s]+(o?'*':'')+'</em></div>'}).join("")+(sp.official?'<small class="adjnote">* ajusté pour l\'équilibrage</small>':'');
  const tys=sp.types.map(t=>'<i style="background:'+TYPE_COL[t]+';color:'+chipFg(TYPE_COL[t])+'">'+TYPE_FR[t]+'</i>').join("");
  equipEl.innerHTML='<div class="dhead"><img alt="" src="'+PORTRAITS[k]+'"><div><h3>'+sp.name+'</h3><div class="ty">'+tys+'</div></div></div><div class="dstats">'+stt+'</div><div class="eqh"><span>Sorts <em>'+dk.length+' / 4</em></span><button type="button" id="eqDef">Réinitialiser</button></div><div class="eqg"></div><p class="eqi" id="eqInfo">Sélectionne 4 sorts. Les plus puissants ont un temps de recharge plus long.</p>';
  const grid=equipEl.querySelector(".eqg"), info=equipEl.querySelector("#eqInfo");
  sp.pool.forEach(id=>{
    const s=SPL[id], b=document.createElement("button"), n=dk.indexOf(id); b.type="button"; b.className="mv"; b.setAttribute("aria-pressed",String(n>=0));
    b.innerHTML='<i style="background:'+TYPE_COL[s.type]+'"></i><span>'+s.name+'</span><small>'+spCd(k,id)+(spCd(k,id)!==s.cd?'*':'')+' s</small>'+(n>=0?'<b>'+SLOT_KEYS[n]+'</b>':'');
    const show=()=>{info.innerHTML="<b>"+s.name+"</b> "+moveInfo(id)+"<br>"+DESC[id]};
    b.addEventListener("mouseenter",show); b.addEventListener("focus",show);
    b.addEventListener("click",()=>{
      const i=dk.indexOf(id);
      if(i>=0)dk.splice(i,1); else if(dk.length<4)dk.push(id); else{info.textContent="4 sorts maximum : retire-en un d'abord.";return}
      refreshMenu(); show();
    });
    grid.appendChild(b);
  });
  equipEl.querySelector("#eqDef").addEventListener("click",()=>{draft[k]=SPECIES[k].kit.slice();refreshMenu()});
}
const STAT_ROWS=[["PV","hp"],["Atq","atk"],["Déf","def"],["Atq. Spé","spa"],["Déf. Spé","spd"],["Vit","spe"]];
function buildMenu(){
  cardsEl.innerHTML="";
  Object.keys(SPECIES).filter(k=>SPECIES[k].playable).forEach(k=>{
    const sp=SPECIES[k], b=document.createElement("button"); b.type="button"; b.className="ace"; b.dataset.key=k;
    const types=sp.types.map(t=>'<i style="background:'+TYPE_COL[t]+';color:'+chipFg(TYPE_COL[t])+'">'+TYPE_FR[t]+'</i>').join("");
    const stats=STAT_ROWS.map(([l,s])=>'<div class="sr"><span>'+l+'</span><u><s style="width:'+Math.round(sp.base[s]/190*100)+'%"></s></u><em>'+sp.base[s]+'</em></div>').join("");
    const spells="";
    b.innerHTML='<span class="tn"></span><img alt="" src="'+PORTRAITS[k]+'"><h3>'+sp.name+'</h3><div class="ty">'+types+'</div><div class="st">'+stats+'</div><ul>'+spells+'</ul>';
    b.addEventListener("click",()=>{
      const cap=teamCap(); let i=picks.indexOf(k);
      if(i>=cap){picks.splice(i,1); i=-1} // un Ace au-delà de la limite du mode compte comme non choisi
      if(i>=0){if(pick===k){picks.splice(i,1);if(picks.length)pick=picks[picks.length-1]}else pick=k}
      else if(picks.length<cap){picks.push(k);pick=k}
      else{teamLineEl.classList.add("full");setTimeout(()=>teamLineEl.classList.remove("full"),700);return}
      refreshMenu();
    });
    cardsEl.appendChild(b);
  });
  document.querySelectorAll("#menu .modes button").forEach(b=>b.addEventListener("click",()=>{pickMode=b.dataset.mode;refreshMenu()}));
  document.querySelectorAll("#menu .diffs button").forEach(b=>b.addEventListener("click",()=>{diff=b.dataset.diff;refreshMenu()}));
  document.querySelectorAll("#menu .rounds button").forEach(b=>b.addEventListener("click",()=>{bestOf=+b.dataset.r;try{localStorage.setItem("aceBo",bestOf)}catch(_){}refreshMenu()}));
  const fb=document.getElementById("foeBtns"); fb.innerHTML="";
  const fsel=document.createElement("select"); fsel.id="foeSel"; fsel.setAttribute("aria-label","Adversaire");
  [["rand","Aléatoire"]].concat(Object.keys(SPECIES).filter(k=>SPECIES[k].playable).map(k=>[k,SPECIES[k].name])).forEach(([k,n])=>{const o=document.createElement("option"); o.value=k; o.textContent=n; fsel.appendChild(o)});
  fsel.addEventListener("change",()=>{foePick=fsel.value;refreshMenu()}); fb.appendChild(fsel);
  {const al=document.createElement("span"); al.id="arenaLbl"; al.textContent="Arène";
   const as=document.createElement("select"); as.id="arenaSel"; as.setAttribute("aria-label","Arène");
   ARENA_IDS.forEach(k=>{const o=document.createElement("option"); o.value=k; o.textContent=ARENAS[k].name; as.appendChild(o)});
   as.addEventListener("change",()=>{ARENA_PICK=as.value; try{localStorage.setItem("aceArena",ARENA_PICK)}catch(_){} refreshMenu()});
   fb.appendChild(al); fb.appendChild(as)}
  refreshMenu();
}
function refreshMenu(){
  cardsEl.querySelectorAll(".ace").forEach(b=>{const i=picks.indexOf(b.dataset.key); const on=i>=0&&i<teamCap(); b.setAttribute("aria-pressed",String(on)); b.classList.toggle("focus",b.dataset.key===pick&&on); b.querySelector(".tn").textContent=on?String(i+1):""});
  teamLineEl.innerHTML=Array.from({length:teamCap()},(_,i)=>i).map(i=>{const k=picks[i]; return k?'<div class="tslot'+(k===pick?" on":"")+'" data-i="'+i+'"><b>'+(i+1)+'</b><img alt="" src="'+PORTRAITS[k]+'"><span>'+SPECIES[k].name+'</span><u data-rm="'+i+'" title="Retirer">×</u></div>':'<div class="tslot empty"><b>'+(i+1)+'</b><span>Choisir un Ace</span></div>'}).join("")+'<small>'+(pickMode==="ffa"?'Ordre d\'entrée 1, 2 · Tab : changer d\'Ace en combat':'Ordre d\'entrée 1, 2, 3 · Tab : changer d\'Ace en combat')+'</small>';
  document.querySelectorAll("#menu .modes button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.mode===pickMode)));
  document.querySelectorAll("#menu .diffs button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.diff===diff)));
  document.querySelector("#menu .diffs").hidden=pickMode!=="duel"&&pickMode!=="ffa";
  {const duel=pickMode==="duel", fl=document.querySelector("#menu .foes>span"), fs0=document.getElementById("foeSel"), as=document.getElementById("arenaSel"); if(fl)fl.hidden=!duel; if(fs0)fs0.hidden=!duel; if(as)as.value=ARENA_PICK}
  document.querySelector("#menu .rounds").hidden=pickMode!=="duel"&&pickMode!=="ffa";
  document.querySelectorAll("#menu .rounds button").forEach(b=>b.setAttribute("aria-pressed",String(+b.dataset.r===bestOf)));
  {const fs=document.getElementById("foeSel"); if(fs){fs.value=foePick; [...fs.options].forEach(o=>{o.disabled=picks.includes(o.value)})}}
  if(picks.includes(foePick)){foePick="rand"}
  buildEquip();
  cardsEl.querySelectorAll(".ace").forEach(b=>{b.querySelector("ul").innerHTML=draftOf(b.dataset.key).map(id=>'<li><b style="background:'+TYPE_COL[SPL[id].type]+'"></b>'+SPL[id].name+'</li>').join("")});
  goBtn.disabled=!teamReady();
  goBtn.textContent=teamReady()?"Combattre":(picks.length<teamNeed()?"Sélectionne "+teamNeed()+(teamNeed()>1?" Aces":" Ace"):"Sélectionne 4 sorts");
}
const teamCap=()=>{const c=typeof FFA_ONLINE_CAP==="function"?FFA_ONLINE_CAP():0; return c||(pickMode==="ffa"?2:3)}; // salon en ligne : 3 Aces à 2 joueurs, 2 à 3-4
const teamNeed=()=>pickMode==="ffa"?2:1; // Versus : de 1 à 3 Aces (1v1 possible) ; en ligne et classé gardent leurs 3 Aces (saveKit)
const teamReady=()=>picks.length>=teamNeed()&&picks.every(k=>draftOf(k).length===4);
function openMenu(){if(typeof hideBanner==="function")hideBanner(); if(NET.on){NET.toLobby();NET.tab("online")}musicSet("menu");setPause(false);menuOpen=true;menuEl.hidden=false;refreshMenu()}
goBtn.addEventListener("click",()=>{
  if(!teamReady())return;
  picks.forEach(k=>{KITS[k]=draftOf(k).slice()}); try{localStorage.setItem("aceKits",JSON.stringify(KITS));localStorage.setItem("aceTeam",JSON.stringify(picks))}catch(_){}
  try{localStorage.setItem("aceKey",pick);localStorage.setItem("aceMode",pickMode);localStorage.setItem("aceDiff",diff);localStorage.setItem("aceFoe",foePick)}catch(_){}
  NET.leave(); menuOpen=false; menuEl.hidden=true; setArena(ARENA_PICK); startMatch(picks.slice(),pickMode); last=performance.now();
});
document.getElementById("menuBtn").addEventListener("click",openMenu);
// ---- Boucle ----
function frame(now){
  const dt=Math.min(.05,(now-last)/1000); last=now;
  if(typeof endShown!=="undefined"&&endShown&&!menuOpen){draw(); requestAnimationFrame(frame); return}
  if(typeof countdownTick==="function"&&countdownTick(dt)){draw(); requestAnimationFrame(frame); return}
  if(vsT>0&&!menuOpen){vsT-=dt; if(vsT<=0)hideVersus(); draw(); requestAnimationFrame(frame); return}
  if((paused&&!NET.on)||menuOpen){draw();requestAnimationFrame(frame);return}
  if(lastE){if(held)setMoveTarget(lastE,false);else mouse=toWorld(lastE)}
  if(isMulti()){const T=foeOf(player); if(T&&T!==player)foe=T; fighters.forEach(x=>{if(x!==player)x.hover=false})}
  foe.hover=hoverEnemy(); stage.style.cursor=foe.hover?"crosshair":"default";
  player.wantShield=(keys.has("shield")||btnShield)&&player.ko<=0;
  NET.tick(dt);
  if(hitstop>0){hitstop-=dt}
  else{
    fighters.forEach(e=>{updateShield(e,dt);updateKb(e,dt)});
    updateOrbs(dt); updateZones(dt);
    fighters.forEach(e=>{
      if(e.bot)thinkBot(e,dt);
      if(e.ko>0)return;
      if(e.tunnel)updateTunnel(e,dt);else if(e.rush)updateRush(e,dt);else if(e.chan){updateMove(e,dt);updateChan(e,dt)}else updateMove(e,dt);
    });
    if(foe.ai)updateWanderer(foe,dt);
    resolveCollision(dt); if(typeof wallPush!=="undefined")fighters.forEach(wallPush); entities.forEach(arenaFix);
    entities.forEach(e=>advance(e,dt));
    fighters.forEach(e=>{
      if(e.ko<=0&&e.anim==="attack"&&e.frame>=HITF(e)&&!e.hit){e.hit=true;if(e.bot||e.remote){const a=aimAt(e,e.cast?SPL[e.cast].ground:false);if(a)e.aim=a} animHit(e)}
    });
    fighters.forEach(e=>{if(e.sleep&&Math.random()<dt*3)pops.push({x:e.x+6,y:e.y-e.sp.body-16,t:0,txt:"Zz"})});
    fighters.forEach(e=>{ // charge visible avant un sort lancé : l'énergie du type est aspirée vers le lanceur
      if(e.ko>0||e.anim!=="attack"||e.hit||!e.cast||SPL[e.cast].melee)return;
      const P=TYPE_PAL[SPL[e.cast].type]||FIRE, cx=e.x, cy=e.y-e.sp.body;
      if(Math.random()<dt*70){const a=rand(0,Math.PI*2),rad=rand(14,26),sp=rand(45,90);spark(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.8,-Math.cos(a)*sp,-Math.sin(a)*sp*.8,rad/sp,P[Math.floor(rand(0,5))],0,2)}
    });
    entities.forEach(e=>{const k=Math.min(1,dt*10);e.vx+=((e.x-e.lx)/Math.max(dt,1e-3)-e.vx)*k;e.vy+=((e.y-e.ly)/Math.max(dt,1e-3)-e.vy)*k;e.lx=e.x;e.ly=e.y});
    entities.forEach(e=>updateKO(e,dt));
  }
  entities.forEach(e=>{e.flash=Math.max(0,e.flash-dt);e.hpShow=Math.max(0,e.hpShow-dt)});
  fighters.forEach(watchDecoy); fighters.forEach(e=>tickBurn(e,dt)); fighters.forEach(e=>tickFlash(e,dt)); fighters.forEach(e=>tickSwap(e,dt)); if(!NET.on)fighters.forEach(e=>botSwapDecide(e,dt));
  fx.forEach(c=>c.t+=dt); for(let i=fx.length-1;i>=0;i--)if(fx[i].t>(fx[i].life||.3))fx.splice(i,1);
  beams.forEach(b=>b.t+=dt); for(let i=beams.length-1;i>=0;i--)if(beams[i].t>beams[i].life)beams.splice(i,1);
  parts.forEach(q=>{q.t+=dt;q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=(q.g===undefined?120:q.g)*dt}); for(let i=parts.length-1;i>=0;i--)if(parts[i].t>parts[i].life)parts.splice(i,1);
  pops.forEach(q=>q.t+=dt); for(let i=pops.length-1;i>=0;i--)if(pops[i].t>(pops[i].col?1.2:.9))pops.splice(i,1);
  shake=Math.max(0,shake-dt);
  if(marker){marker.t+=dt;if(!player.moveTarget&&marker.t>.35)marker=null}
  fighters.forEach(e=>{for(const k in e.cd)e.cd[k]=Math.max(0,e.cd[k]-dt); e.pp=Math.min(PP_MAX,e.pp+PP_REGEN*dt); e.comboT=Math.max(0,e.comboT-dt); for(const k in e.bf){e.bf[k]-=dt;if(e.bf[k]<=0)delete e.bf[k]} if(e.team)e.team.forEach((m,i)=>{if(i!==e.ti&&m.cd)for(const k in m.cd)m.cd[k]=Math.max(0,m.cd[k]-dt)}); e.slow=Math.max(0,e.slow-dt); if(e.inv>0)e.inv-=dt; e.psn=Math.max(0,e.psn-dt); if(e.counter){e.counter.t-=dt;if(e.counter.t<=0){e.counter=null;e.lock=MBURST.rec}}});
  glows.forEach(g=>g.t+=dt); for(let i=glows.length-1;i>=0;i--)if(glows[i].t>glows[i].life)glows.splice(i,1);
  rings.forEach(r=>r.t+=dt); for(let i=rings.length-1;i>=0;i--)if(rings[i].t>rings[i].dur)rings.splice(i,1);
  holes.forEach(q=>q.t+=dt); for(let i=holes.length-1;i>=0;i--)if(holes[i].t>holes[i].life)holes.splice(i,1);
  trail.forEach(q=>q.t+=dt); for(let i=trail.length-1;i>=0;i--)if(trail[i].t>.8)trail.splice(i,1);
  if(typeof rushTick==="function")rushTick(dt);
  updateHud();
  if(logTimer>0){logTimer-=dt;if(logTimer<=0)logEl.hidden=true}
  draw(); requestAnimationFrame(frame);
}
addEventListener("resize",resize);
buildMenu(); startMatch(pick,"train"); resize(); requestAnimationFrame(frame);
