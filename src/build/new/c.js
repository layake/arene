Object.values(SPECIES).forEach(sp=>Object.values(sp.sheets).forEach(s=>{s.img=new Image();s.img.src=s.src}));
const tmp=document.createElement("canvas"); tmp.width=96; tmp.height=96; const tctx=tmp.getContext("2d");

// ---- Combattants ----
let player=null, foe=null, entities=[], fighters=[], matchMode="train", playerKey="garchomp";
const fx=[], parts=[], pops=[], orbs=[], zones=[], beams=[], holes=[], trail=[], rings=[], glows=[];
const score={me:0,foe:0};
const alive=e=>e.ko<=0&&e.hp>0;
// ---- Adversaires : en 1 contre 1, "l'autre" ; en mêlée générale (matchMode "ffa"), tous les autres combattants ----
const isMulti=()=>matchMode==="ffa";
function foesOf(e){ // tous les adversaires de e (en 1v1 : une liste à un seul élément, comportement inchangé)
  if(!isMulti())return [e===player?foe:player];
  return fighters.filter(x=>x!==e&&!x.out);
}
function foeOf(e){ // cible principale : en 1v1 l'autre ; en multi l'adversaire vivant le plus proche du point visé (ou de soi)
  if(!isMulti())return e===player?foe:player;
  const L=foesOf(e).filter(alive); if(!L.length)return foesOf(e)[0]||e;
  const p=(e===player&&!e.bot&&typeof mouse!=="undefined"&&mouse)?{x:mouse.wx,y:mouse.wy}:(e.tgt&&L.includes(e.tgt)?e.tgt:e);
  let best=L[0],bd=1e9; for(const t of L){const d=Math.hypot(t.x-p.x,t.y-p.y); if(d<bd){bd=d;best=t}} return best;
}
// mêlée en multi : les autres adversaires proches du point d'impact sont touchés aussi (en 1v1 : rien ne change)
function meleeOthers(e,skip,px,py,r,hit){ if(!isMulti())return; for(const t of foesOf(e))if(t!==skip&&alive(t)&&!t.tunnel&&Math.hypot(t.x-px,(t.y-t.sp.body)-py)<r+t.sp.body*.4)hit(t) }
// premier adversaire touché par un objet au point (x,y) avec un rayon r (projectiles, charges)
function foeAt(owner,x,y,r){ for(const t of foesOf(owner))if(alive(t)&&!t.tunnel&&!(t.inv>0)&&Math.hypot(t.x-x,(t.y-y)*1.3)<r+t.sp.body*.55)return t; return null }
function makeEntity(species,x,y){
  const sp=SPECIES[species];
  return {sp,key:species,x,y,dir:0,anim:"idle",frame:0,tick:0,rest:rand(.6,1.5),run:false,ai:null,hit:false,kb:null,flash:0,hp:sp.maxHp,maxHp:sp.maxHp,hpShow:0,lock:0,ko:0,vx:0,vy:0,lx:x,ly:y,stun:0};
}
// Panoplies choisies (4 sorts parmi les 8 de l'Ace), mémorisées d'une session à l'autre.
const KITS={};
var KITS_RAW={}; try{KITS_RAW=JSON.parse(localStorage.getItem("aceKits")||"{}")||{}}catch(_){} // relu dans ui2.js, une fois tous les Pokémon chargés
try{const k=KITS_RAW;for(const s in k)if(SPECIES[s]&&Array.isArray(k[s])&&k[s].length===4&&k[s].every(id=>SPECIES[s].pool.includes(id))&&new Set(k[s]).size===4)KITS[s]=k[s]}catch(_){}
const kitOf=key=>KITS[key]||SPECIES[key].kit;
function makeFighter(species,x,y,bot,kit){
  const e=makeEntity(species,x,y);
  e.kit=(kit||SPECIES[species].kit).slice(); e.slow=0; e.burn=0; e.inv=0; e.psn=0; e.flashC=null; e.sleep=false;
  e.fighter=true; e.bf={}; e.shieldE=100; e.shieldOn=false; e.shieldBroken=false; e.pp=PP_MAX; e.cd={}; e.comboT=0; e.moveTarget=null; e.wantShield=false; e.aimPt=null; e.cast=null;
  e.bot=bot?{think:rand(.3,.7),shieldT:0,strafe:1,strafeT:0,nextMove:0}:null;
  return e;
}
function makeDummy(x,y){
  const e=makeEntity("turtwig",x,y);
  e.ai={wait:rand(1,2.5),tx:x,ty:y,speed:26,atk:null,atkCd:3}; e.hat=true;
  return e;
}
const START_A=[WORLD.w/2-55,WORLD.h/2+10], START_B=[WORLD.w/2+55,WORLD.h/2+20]; // repris par setArena (arena.js)
function resetRound(){
  if(typeof hideBanner==="function")hideBanner(); if(typeof obstReset==="function")obstReset();
  if((matchMode==="duel"||matchMode==="rush"||matchMode==="ffa")&&typeof introPending!=="undefined")introPending=true;
  entities.forEach((e,i)=>{
    if(e.team&&matchMode!=="rush")resetTeam(e);
    const s=matchMode==="ffa"?ffaSpawn(i,entities.length):i===0?START_A:START_B; e.x=s[0]; e.y=s[1]; if(matchMode!=="rush"||e===foe)e.hp=e.maxHp; e.hpShow=0; e.ko=0; e.kb=null; e.stun=0; e.dizzy=false; e.flash=0; e.lock=0; e.hit=false; e.run=false;
    e.lx=e.x; e.ly=e.y; setAnim(e,"idle");
    if(e.fighter){e.pp=PP_MAX; e.shieldE=100; e.shieldOn=false; e.shieldBroken=false; e.tunnel=null; e.rush=null; e.chan=null; e.counter=null; e.bf={}; e.slow=0; e.burn=0; e.inv=0; e.psn=0; e.flashC=null; e.sleep=false; e.cd={}; e.comboT=0; e.moveTarget=null; e.cast=null; e.dir=matchMode==="ffa"?dirFromVector(WORLD.w/2-e.x,WORLD.h/2-e.y):i===0?2:6; e.out=false; e.gone=false}
    if(e.ai){e.ai.atk=null;e.ai.atkCd=3;e.ai.wait=rand(1,2.5);e.ai.tx=e.x;e.ai.ty=e.y; e.dir=6}
  });
  [fx,parts,pops,orbs,zones,beams,holes,trail,rings,glows].forEach(a=>a.length=0);
  marker=null; aiming=null;
}
let foePick="rand";
function pickFoe(key){
  const others=Object.keys(SPECIES).filter(k=>SPECIES[k].playable&&k!==key);
  return SPECIES[foePick]&&SPECIES[foePick].playable&&foePick!==key?foePick:others[Math.floor(Math.random()*others.length)];
}
function startMatch(key,mode){musicSet("battle");
  const keys=Array.isArray(key)?key.slice(0,3):[key]; key=keys[0];
  endShown=false; matchMode=mode; playerKey=key; score.me=0; score.foe=0;
  player=makeFighter(key,START_A[0],START_A[1],false,kitOf(key));
  if(keys.length>1)initTeam(player,keys);
  if(mode==="duel"){
    const others=Object.keys(SPECIES).filter(k=>SPECIES[k].playable&&!keys.includes(k)), pool=others.slice(), fk=[];
    const first=SPECIES[foePick]&&SPECIES[foePick].playable&&!keys.includes(foePick)?foePick:null;
    if(first){fk.push(first);pool.splice(pool.indexOf(first),1)}
    while(fk.length<keys.length&&pool.length)fk.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);
    foe=makeFighter(fk[0]||pickFoe(key),START_B[0],START_B[1],true);
    if(keys.length>1&&fk.length>1)initTeam(foe,fk,fk.map(k=>SPECIES[k].kit));
  }
  else if(mode==="ffa"){ffaStart(keys); return}
  else if(mode==="rush"){rushStart(); foe=makeFighter(MARA.order[0],START_B[0],START_B[1],true)}
  else foe=makeDummy(START_B[0],START_B[1]);
  entities=[player,foe]; fighters=entities.filter(e=>e.fighter);
  resetRound(); player.dir=2; foe.dir=6;
  if(typeof applyKit==="function")applyKit();
  if((mode==="duel"||mode==="rush")&&foe.bot)botEquip(foe,player);
  if(mode==="rush"&&typeof showVersus==="function")showVersus(player.team?player.team.map(s=>s.key):[player.key],[foe.key],"TOI","COMBAT 1/"+MARA.order.length);
  if(mode==="duel"&&typeof showVersus==="function")showVersus(player.team?player.team.map(s=>s.key):[player.key],foe.team?foe.team.map(s=>s.key):[foe.key],"TOI","BOT "+({easy:"FACILE",normal:"NORMAL",hard:"DIFFICILE"}[diff]||""));
}
