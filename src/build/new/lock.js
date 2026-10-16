/* ===== Souris verrouillée dans la fenêtre pendant le combat : curseur virtuel, Échap libère et met en pause ===== */
const PL={on:false,x:0,y:0,rel:false};
function ptrXY(e){return PL.on?{clientX:PL.x,clientY:PL.y}:{clientX:e.clientX,clientY:e.clientY}}
const plCur=document.createElement("div"); plCur.id="plCur"; plCur.hidden=true; document.body.appendChild(plCur);
{const st=document.createElement("style");
 st.textContent='#plCur{position:fixed;left:0;top:0;width:18px;height:18px;margin:-9px 0 0 -9px;border:3px solid #ffe45e;border-radius:50%;box-shadow:0 0 0 2px #000,inset 0 0 0 2px #000;pointer-events:none;z-index:99999}#plCur[hidden]{display:none}';
 document.head.appendChild(st)}
const plWant=()=>!menuOpen&&!paused&&!endShown&&titleEl.hidden&&vsT<=0;
const plBox=()=>stage.getBoundingClientRect();
function plPlace(){plCur.style.transform="translate("+PL.x+"px,"+PL.y+"px)"}
document.addEventListener("pointermove",e=>{
  if(!PL.on)return;
  const r=plBox(); PL.x=Math.max(r.left,Math.min(r.right-1,PL.x+(e.movementX||0))); PL.y=Math.max(r.top,Math.min(r.bottom-1,PL.y+(e.movementY||0))); plPlace();
},true);
document.addEventListener("pointerdown",e=>{
  if(PL.on){ // sous verrou, les boutons se cliquent via le curseur virtuel
    const el=document.elementFromPoint(PL.x,PL.y), b=el&&el.closest&&el.closest("button");
    if(b){e.stopPropagation();e.preventDefault();b.click()}
    return;
  }
  if(!plWant()||e.button!==0&&e.button!==2||(e.target.closest&&e.target.closest("button")))return;
  if(!stage.requestPointerLock)return;
  PL.x=e.clientX; PL.y=e.clientY;
  try{const p=stage.requestPointerLock(); if(p&&p.catch)p.catch(()=>{})}catch(_){}
},true);
document.addEventListener("pointerlockchange",()=>{
  PL.on=document.pointerLockElement===stage; plCur.hidden=!PL.on; if(PL.on)plPlace();
  if(!PL.on){ if(!PL.rel&&plWant())setPause(true); PL.rel=false }
});
setInterval(()=>{if(PL.on&&!plWant()){PL.rel=true; try{document.exitPointerLock()}catch(_){}}},150);
