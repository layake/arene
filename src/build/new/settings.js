/* ===== Menu Paramètres : touches, son, langue, visée, souris. Ouvrable depuis l'accueil, la sélection d'équipe et la pause ===== */
(function(){
const ACTIONS=[["s0","Sort 1"],["s1","Sort 2"],["s2","Sort 3"],["s3","Sort 4"],["shield","Bouclier (maintenir)"],["swap","Changer d'Ace"],["flash","Flash"],["aim","Mode de visée"]];
const RESERVED=new Set(["Escape","KeyP"]);
const ov=document.createElement("div"); ov.id="settings"; ov.hidden=true; ov.setAttribute("role","dialog"); ov.setAttribute("aria-label","Paramètres");
ov.innerHTML='<div class="sbox"><h2>Paramètres</h2><button type="button" class="sclose" id="sClose">Fermer</button>'+
  '<section id="sGen"><h3>Général</h3></section>'+
  '<section id="sSnd"></section>'+
  '<section id="sPlay"><h3>Jeu</h3><label class="srow"><input type="checkbox" id="sLock"> <span>Bloquer la souris dans la fenêtre pendant le combat</span></label></section>'+
  '<section id="sKeys"><h3>Touches</h3><div class="kgrid"></div><button type="button" id="sKeyReset">Touches par défaut</button><p class="shint">Clique sur une action puis appuie sur la nouvelle touche. Échap annule. Échap et P restent réservés à la pause.</p></section></div>';
document.body.appendChild(ov);
const st=document.createElement("style");
st.textContent='#settings{position:fixed;inset:0;z-index:200;background:rgba(5,8,24,.78);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px;box-sizing:border-box;font-family:"Pixelify Sans",var(--display)}#settings[hidden]{display:none}#settings .sbox{position:relative;width:min(680px,100%);background:linear-gradient(#1f3290,#0f1b55);border:3px solid #e6eeff;border-radius:8px;box-shadow:0 0 0 2px #070c24,inset 0 0 0 2px #4a68c8;padding:14px 22px 18px;color:#fff;margin:auto 0}#settings h2{margin:0 0 6px;text-align:center;font-size:26px}#settings h3{margin:14px 0 6px;color:#ffe45e;font-size:16px;border-bottom:2px solid #4a68c8;padding-bottom:3px}#settings .sclose{position:absolute;right:14px;top:12px}#settings button{font:inherit;color:#ffe45e;background:#1b2a8a;border:2px solid #ffe45e;padding:4px 12px;cursor:pointer}#settings .kgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px 14px}#settings .krow{display:flex;justify-content:space-between;align-items:center;gap:8px;background:rgba(7,12,36,.55);border:2px solid #4a68c8;padding:4px 8px}#settings .krow b{min-width:72px;text-align:center;color:#fff;background:#0b1340;border:2px solid #7f95e8;padding:2px 8px}#settings .krow.wait b{color:#ffe45e;border-color:#ffe45e;animation:sblink .6s steps(2) infinite}@keyframes sblink{50%{opacity:.4}}#settings .srow{display:flex;gap:8px;align-items:center;cursor:pointer}#settings .shint{font-size:12px;color:#9fb4ff;margin:6px 0 0}#settings #sKeyReset{margin-top:8px}#settings .vols,#settings .langrow,#settings .pmenu{margin:0}#sOpen,#tSet,#pSet{cursor:pointer}#menu #sOpen{position:absolute;left:120px;top:12px;z-index:2;font:500 13px "Pixelify Sans",monospace;color:#c9d6ff;background:rgba(7,12,36,.55);border:2px solid #4a68c8;padding:4px 10px}@media(max-width:640px){#settings .kgrid{grid-template-columns:1fr}}';
document.head.appendChild(st);
const $=s=>ov.querySelector(s);
// on déplace les réglages existants de la pause (ils gardent leurs écouteurs) ; fait au premier affichage, quand tout est construit
const pb=document.querySelector("#pause .pbox");
let moved=false;
function moveExisting(){ if(moved||!pb)return; moved=true;
  const lang=pb.querySelector(".langrow"), vols=[...pb.querySelectorAll(".vols")], cast=pb.querySelector("#pCast");
  if(lang)$("#sGen").appendChild(lang);
  vols.forEach(v=>(v.classList.contains("aimsel")?$("#sPlay"):$("#sSnd")).appendChild(v));
  if(cast){const r=document.createElement("div"); r.className="srow"; r.appendChild(cast); $("#sPlay").insertBefore(r,$("#sPlay .srow"))}
}
if(pb){const b=document.createElement("button"); b.type="button"; b.id="pSet"; b.textContent="Paramètres"; const pm=pb.querySelector(".pmenu"); (pm||pb).appendChild(b); b.onclick=()=>openSettings()}
// entrées : accueil et sélection d'équipe
{const tb=document.querySelector("#title .tbtns"); if(tb){const b=document.createElement("button"); b.type="button"; b.id="tSet"; b.textContent="Paramètres"; tb.appendChild(b); b.onclick=e=>{e.stopPropagation();openSettings()}}}
{const mb=document.querySelector("#menu .mbox"); if(mb){const b=document.createElement("button"); b.type="button"; b.id="sOpen"; b.textContent="⚙ Paramètres"; mb.insertBefore(b,mb.firstChild); b.onclick=()=>openSettings()}}
// souris
$("#sLock").checked=PL_ON(); $("#sLock").onchange=e=>{try{localStorage.setItem("aceLock",e.target.checked?"1":"0")}catch(_){}};
// touches
let waiting=null;
function renderKeys(){
  $(".kgrid").innerHTML=ACTIONS.map(([k,l])=>'<button type="button" class="krow'+(waiting===k?' wait':'')+'" data-k="'+k+'"><span>'+l+'</span><b>'+(waiting===k?"…":keyLabel(BIND[k]))+'</b></button>').join("");
  ov.querySelectorAll(".krow").forEach(b=>b.onclick=()=>{waiting=b.dataset.k; renderKeys()});
  if(typeof retranslateAll==="function"&&LANG==="en")retranslateAll();
}
function saveKeys(){try{localStorage.setItem("aceKeys",JSON.stringify(BIND))}catch(_){} refreshKeyLabels(); renderKeys()}
$("#sKeyReset").onclick=()=>{Object.assign(BIND,BIND_DEF); waiting=null; saveKeys()};
addEventListener("keydown",e=>{
  if(ov.hidden)return;
  e.stopImmediatePropagation(); // le jeu ne reçoit rien tant que le menu est ouvert
  if(e.code==="Tab"&&!waiting)return; // navigation clavier dans le menu
  e.preventDefault();
  if(!waiting){if(e.key==="Escape")closeSettings();return}
  if(e.key==="Escape"){waiting=null;renderKeys();return}
  if(RESERVED.has(e.code))return;
  const prev=BIND[waiting]; for(const k in BIND)if(k!==waiting&&BIND[k]===e.code)BIND[k]=prev; // échange si la touche était déjà prise
  BIND[waiting]=e.code; if(e.key&&e.key.length===1&&e.key.trim())KEY_LBL[e.code]=e.key.toUpperCase();
  waiting=null; saveKeys();
},true);
addEventListener("keyup",e=>{if(!ov.hidden)e.stopImmediatePropagation()},true);
$("#sClose").onclick=()=>closeSettings();
ov.addEventListener("pointerdown",e=>{if(e.target===ov)closeSettings()});
function openSettings(){moveExisting(); waiting=null; renderKeys(); ov.hidden=false; keys.clear(); try{if(document.pointerLockElement)document.exitPointerLock()}catch(_){}}
function closeSettings(){waiting=null; ov.hidden=true}
window.openSettings=openSettings;
})();
// met à jour tous les libellés de touches affichés (barre de sorts, aide, menu)
function refreshKeyLabels(){
  for(let i=0;i<4;i++)SLOT_KEYS[i]=keyLabel(BIND["s"+i]);
  const short=c=>c==="Space"?"Esp":keyLabel(c).slice(0,4);
  const set=(el,c)=>{const k=el&&el.querySelector(".k"); if(k)k.textContent=short(c)};
  const pk=document.querySelector("#pause .pk"); if(pk)pk.innerHTML="<b>Clic droit</b> se déplacer<br><b>"+SLOT_KEYS.join(" ")+"</b> sorts, <b>clic gauche</b> pour lancer<br><b>"+keyLabel(BIND.shield)+"</b> bouclier (maintenir)<br><b>Échap</b> libère la souris (bloquée en combat)";
  set(document.getElementById("shd"),BIND.shield); set(document.getElementById("swapb"),BIND.swap); set(flashBtn,BIND.flash);
  if(typeof player!=="undefined"&&player&&typeof applyKit==="function")applyKit();
  if(typeof refreshMenu==="function"&&!document.getElementById("menu").hidden)refreshMenu();
}
refreshKeyLabels();
