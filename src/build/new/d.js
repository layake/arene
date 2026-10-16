// ---- Animation ----
// Animation d'attaque alternative par sort (Swing, Shoot...) : e.altA désigne la clé dans sp.alt
const ALTOF=e=>e.anim==="attack"&&e.altA&&e.sp.alt&&e.sp.alt[e.altA]||null;
const SHT=e=>{const a=ALTOF(e);return a?a.sheet:e.sp.sheets[e.anim]};
const ANC=e=>{const a=ALTOF(e);return a?a.anch:e.sp.anch[e.anim]};
// Point d'ancrage de l'image courante ; l'image est bornée si l'animation a moins d'images que la précédente (swap d'espèce)
const ANF=e=>{const r=ANC(e)[e.dir]||ANC(e)[0];return r[Math.min(e.frame||0,r.length-1)]};
const HITF=e=>{const a=ALTOF(e);return a?a.hit:e.sp.hitFrame};
const ATKR=e=>{const a=ALTOF(e);return a&&a.rate||e.sp.atkRate||1};
function setAnim(e,name){ if(name!=="attack")e.lockPt=null; if(e.anim!==name){e.anim=name;e.frame=0;e.tick=0;e.hit=false;if(name==="idle")e.rest=rand(.8,2)} }
// Idle plays once, then holds its first frame for a random pause before looping again.
function advance(e,dt){
  if(e.anim==="idle"&&e.rest>0){e.rest-=dt;e.frame=0;e.tick=0;return}
  const s=SHT(e); if(e.frame>=s.dur.length){e.frame=0;e.tick=0} e.tick+=dt*60*(e.anim==="walk"&&e.run?RUN_MULT:e.anim==="attack"?ATKR(e):e.anim==="guard"&&e.frame>=6?.35:1);
  while(e.tick>=s.dur[e.frame]){
    e.tick-=s.dur[e.frame]; e.frame++;
    if(e.frame>=s.dur.length){
      e.frame=s.loopFrom||0;
      if(e.anim==="idle"){e.tick=0;e.rest=rand(1.2,3);return}
      if(!s.loop){e.tick=0;const was=e.anim;setAnim(e,"idle");if(e.fighter&&was==="attack")e.lock=e.comboClaw?COMBO_RECOVERY:ATTACK_RECOVERY;return}
    }
  }
}
function dirFromVector(dx,dy){return(((2-Math.round(Math.atan2(dy,dx)/(Math.PI/4)))%8)+8)%8}
// ---- Visée : l'angle exact du curseur (joueur) ou du point visé (IA), pas les 8 directions du sprite ----
// La visée est figée au moment du lancer : bouger la souris ensuite ne redirige plus le sort.
const locked=e=>e.lockPt&&e.anim==="attack"?e.lockPt:null;
function aimPoint(e){return locked(e)||(e===player&&!e.bot?mouse:e.aimPt)}
function lockAim(e){
  const pt=e===player&&!e.bot?mouse:e.aimPt; if(!pt){e.lockPt=null;return}
  const hov=e===player&&!e.bot&&hoverEnemy();
  e.lockPt={wx:pt.wx,wy:pt.wy,hov,hx:hov?foe.x:0,hy:hov?foe.y:0,hb:hov?foe.sp.body:0};
}
// Aide à la visée : un curseur posé près de l'ennemi (panique, cible qui bouge) vise l'ennemi, avec une légère avance sur son déplacement.
const ASSIST=26, LEAD=.12;
const AIM={mode:"assist",modes:[["off","Manuelle"],["assist","Assistée"],["lock","Verrouillée"]]};
try{const m=localStorage.getItem("aimMode");if(AIM.modes.some(x=>x[0]===m))AIM.mode=m}catch(_){}
function setAimMode(m){AIM.mode=m;try{localStorage.setItem("aimMode",m)}catch(_){} document.querySelectorAll("#aimModes button").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.m===m)))}
function snapAim(e,tx,ty,ground){
  const t=foeOf(e); if(!t||t===e||!alive(t)||t.tunnel)return [tx,ty];
  const bx=t.x, by=t.y-t.sp.body; // centre du corps : le curseur se pose là où on voit l'ennemi, même si le sort vise le sol
  const m=e.aimMode||(e===player?AIM.mode:"assist");
  if(m==="off")return [tx,ty];
  if(m!=="lock"&&Math.hypot(tx-bx,(ty-by)*1.1)>ASSIST+t.sp.body*.9)return [tx,ty];
  const L=ground?0:LEAD;
  return [(ground?t.x:bx)+clamp((t.vx||0)*L,-14,14), (ground?t.y:by)+clamp((t.vy||0)*L,-10,10)];
}
function aimVec(e,ground){
  const pt=aimPoint(e); if(!pt)return null;
  const ob=ground?0:e.sp.body, ox=e.x, oy=e.y-ob;
  let tx=pt.wx, ty=pt.wy;
  if(pt.hov){tx=pt.hx;ty=pt.hy-(ground?0:pt.hb)}
  else if(!locked(e)&&e===player&&!e.bot&&hoverEnemy()){tx=foe.x;ty=foe.y-(ground?0:foe.sp.body)}
  else if(e.fighter&&!e.bot){const s=snapAim(e,tx,ty,ground);tx=s[0];ty=s[1]}
  const dx=tx-ox, dy=ty-oy, d=Math.hypot(dx,dy);
  if(d<1)return null;
  return [dx/d,dy/d,d];
}
function aimAt(e,ground){const v=aimVec(e,ground); if(v)e.dir=dirFromVector(v[0],v[1]); return v}
// Perspective du sol : un cercle au sol apparaît comme une ellipse de rapport ISO. Tous les sorts de zone testent la touche avec cette même forme, pour que l'aperçu soit exact.
const ISO=.55, gdist=(dx,dy)=>Math.hypot(dx,dy/ISO);
function groundTarget(e){
  const pt=aimPoint(e)||{wx:e.x+FACE[e.dir][0]*80,wy:e.y+FACE[e.dir][1]*80};
  let tx=pt.wx, ty=pt.wy; if(pt.hov){tx=pt.hx;ty=pt.hy}else if(!locked(e)&&e===player&&!e.bot&&hoverEnemy()){tx=foe.x;ty=foe.y}
  else if(e.fighter&&!e.bot){const s=snapAim(e,tx,ty,true);tx=s[0];ty=s[1]}
  return [tx-e.x,ty-e.y];
}
function zoneSpot(e,range){const [dx,dy]=groundTarget(e), k=Math.min(1,range/(gdist(dx,dy)||1)); return {x:clampX(e.x+dx*k),y:clampY(e.y+dy*k)}}
function slideSpots(e){const [dx,dy]=groundTarget(e), d=Math.hypot(dx,dy)||1; return RS.dist.map(r=>({x:clampX(e.x+dx/d*r),y:clampY(e.y+dy/d*r)}))}
const zoneR=z=>z.k==="wpulse"?WP.r:z.k==="heat"?HEAT.r:z.k==="aval"?AVAL.r:z.k==="stomp"?STOMP.r:z.k==="quake"?QUAKE.r:z.k==="rock"?RS.r:z.k==="grav"?GRAV.r:z.k==="fs"?FS.r:z.k==="sbomb"||z.k==="pois"?SB.r:z.k==="hex"?HX.r:z.k==="trap"?TRAP.r:PSY.r;
const clampX=x=>clamp(x,AB.x0,AB.x1), clampY=y=>clamp(y,AB.y0,AB.y1);
function showLog(text,ms){logEl.textContent=text;logEl.hidden=false;logTimer=ms/1000}
const logFor=(e,text,ms)=>{if(e===player)showLog(text,ms)};
// ---- PP (mana) : chaque sort en coûte, ils se régénèrent. Le bouclier a sa propre barre. ----
const PP_MAX=100, PP_REGEN=8;
let ppLogAt=0;
function spendPP(e,n){
  if(e.pp>=n){e.pp-=n;if(SND.pe===e&&SND.pend){sfxCast(e,SND.pend);SND.pend=null}return true}
  if(e===player&&performance.now()-ppLogAt>600){ppLogAt=performance.now();showLog("Pas assez de PP !",900)}
  return false;
}
const cdOf=(e,id)=>e.cd[id]||0;
// Les sorts de corps à corps de la panoplie partagent une courte recharge globale ; Tunnel les remet à zéro.
const meleeIds=e=>e.kit.filter(id=>SPL[id].melee);
const gcd=(e,x)=>{meleeIds(e).forEach(id=>{e.cd[id]=Math.max(cdOf(e,id),x)})};
// ---- Constantes des sorts ----
const COMBO_RECOVERY=.4, ATTACK_RECOVERY=.06, ATTACK_RANGE=30;
const CLAW_ASSIST=44, CLAW_CONE=Math.cos(35*Math.PI/180), CLAW_COMBO_PUSH=75, CLAW_PUSH=ATTACK_RANGE+12;
const TUNNEL={windup:.1,dist:100,speed:520,rise:.16,recovery:.1,radius:32}, TUNNEL_ASSIST=24, TUNNEL_CONE=Math.cos(55*Math.PI/180);
const RUSH={chan:1.2,min:50,dist:140,speed:380,push:100,stun:1,rec:.6,cdHit:4,hit:15};
const PROJ={mud:{speed:230,range:190,hit:11},moon:{speed:250,range:200,hit:11}};
const RS={dist:[42,78,114],delay:[.5,.65,.8],r:20,mult:.55,push:50,stun:.35};
const QUAKE={r:54,delay:.65,push:110,stun:.6};
const MBURST={dur:1.4,mult:1.5,rec:.5};
const IRON={step:12,reach:30,stun:.6,push:90};
const GRAV={range:140,r:34,delay:.35,life:2.4,pull:85};
const PSY={range:150,r:26,delay:.75,push:70};
const TELE={range:130};
const FS={range:150,r:30,delay:1.5,push:60};
const TRAP={range:120,r:18,arm:.4,life:9,slow:.6,slowT:2.5};
const EDGE={len:120,half:12,delay:.55,push:70,stun:.3,from:12};
PROJ.fcannon={speed:300,range:230,hit:12};
PROJ.shball={speed:240,range:200,hit:11}; PROJ.tbolt={speed:340,range:230,hit:10}; PROJ.hypno={speed:130,range:150,hit:14};
const SB={range:130,r:24,delay:.5,push:40,life:3.2,tick:.55,dotMult:.22};
const HX={range:110,r:22,delay:.45,push:50};
const SLEEP={t:1.4};
// Charges : Draco-Charge canalise puis fonce ; Ombre Portée part tout de suite, plus courte, sans étourdir.
const RUSHES={
  rush:{id:"rush",chan:RUSH.chan,min:RUSH.min,dist:RUSH.dist,speed:RUSH.speed,hit:RUSH.hit,push:RUSH.push,stun:RUSH.stun,rec:RUSH.rec,cdHit:RUSH.cdHit},
  ssneak:{id:"ssneak",chan:0,min:40,dist:90,speed:520,hit:14,push:45,stun:0,rec:.25,cdHit:0}
};
const GLEAM={chan:1,len:190,half:11,stun:1,rec:.35,cdHit:4};
const CONF={reach:34,assist:50,cone:Math.cos(40*Math.PI/180),push:CLAW_PUSH};
const FIRE=["#7b3fe4","#a77bff","#d8c4ff","#ffffff","#5a2fc0"]; // énergie Dragon
const PINK=["#ff8ec4","#ffc2e0","#ffffff","#c05aa8","#f060a8"]; // énergie Fée
const PSYC=["#b060ff","#e0a0ff","#ffffff","#7030c0","#f85888"]; // énergie Psy
const STEELC=["#a8a8c8","#d8d8f0","#ffffff","#606080","#8090d0"]; // énergie Acier
const ROCKC=["#b8a038","#8a7a40","#d8c890","#6a5a30","#e8e0b0"];
// Palette d'énergie par type : charge, lancement et impact reprennent la couleur du type du sort.
const TYPE_PAL={ghost:["#2a1840","#705898","#b090d8","#e0c8ff","#a070d8"],poison:["#a040a0","#d070d0","#ffffff","#601870","#80e060"],electric:["#f8d030","#fff080","#ffffff","#c09010","#fffbe0"],dark:["#201020","#705848","#a08070","#403030","#c0a090"],dragon:FIRE,fairy:PINK,psychic:PSYC,steel:STEELC,rock:ROCKC,ground:["#d1a35c","#8a6030","#e8d8a0","#6a5a30","#f0e8c0"],normal:["#ffffff","#d8d8d8","#a8a8a8","#f0e0c0","#ffffff"]};
const DIRT=["#b8965f","#a3814f","#8a6a3e","#6e5330"];
const spark=(x,y,vx,vy,life,c,g,s)=>parts.push({x,y,vx,vy,t:0,life,c,g,s});
function burst(x,y,n){for(let i=0;i<n;i++){const a=rand(Math.PI,Math.PI*2),v=rand(25,75);parts.push({x,y:y-2,vx:Math.cos(a)*v,vy:Math.sin(a)*v,t:0,life:rand(.3,.55),c:DIRT[i%4]})}}
function colorBurst(x,y,n,pal,sp0,sp1){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(sp0,sp1);spark(x,y-8,Math.cos(a)*v,Math.sin(a)*v*.7,rand(.35,.7),pal[i%5],40,i%3?2:3)}}
const rushBurst=(x,y,n,a,b)=>colorBurst(x,y,n,FIRE,a,b);
// ---- Touches et dégâts ----
const BLOCK_GAIN={hp:.04,pp:10}; // se faire taper sous bouclier rend un peu de PV et de PP
function blockHit(t,from,cost,att,contact){
  const hpGain=Math.max(1,Math.round(t.maxHp*BLOCK_GAIN.hp)), hpBefore=t.hp;
  t.hp=Math.min(t.maxHp,t.hp+hpGain); t.pp=Math.min(PP_MAX,t.pp+BLOCK_GAIN.pp);
  if(t.hp>hpBefore){t.hpShow=3;pops.push({x:t.x+8,y:t.y-42,t:0,txt:"+"+(t.hp-hpBefore)})}
  sfxUI("block"); t.shieldE=Math.max(0,t.shieldE-cost); burst(t.x,t.y-10,10); shake=.12; hitstop=.05;
  pops.push({x:t.x,y:t.y-34,t:0,txt:"Bloqué"});
  if(contact&&att){const dx=t.x-att.x, dy=t.y-att.y, d=Math.hypot(dx,dy)||1; att.kb={vx:-dx/d*170,vy:-dy/d*170}; if(att.ai&&att.ai.atk)att.ai.atk.t=-.5}
  if(t.shieldE<=0)breakShield(t);
}
// Un sort touche : bouclier (bloque), sous terre (intouchable), sinon dégâts selon stats et types.
function strike(att,tgt,spell,o){
  o=o||{};
  if(!alive(tgt)||tgt.tunnel)return false;
  if(tgt.inv>0)return false;
  if((o.contact||spell===SPL.gleam)&&typeof obstBlock==="function"&&obstBlock(att,tgt,spell))return false;
  if(tgt.shieldOn){blockHit(tgt,o.from||att,o.shieldCost||30,att,!!o.contact);return false}
  if(!o.pal)o.pal=TYPE_PAL[spell.type];
  const dm=Math.round(calcDamage(att,tgt,spell)*(o.mult||1));
  applyDamage(tgt,att,o.from||att,dm,o);
  if(!o.dot)sfxHit(att,tgt,spell,dm);
  if(!o.dot&&spell.type&&tgt.sp.types){const k=typeMult(spell.type,tgt.sp.types); if(k>1.05){pops.push({x:tgt.x,y:tgt.y-56,t:0,txt:k>1.5?"Très efficace !!":"Super efficace !",col:"#ff9a3c"});if(k>1.5)shake=Math.max(shake,.22)} else if(k<.95)pops.push({x:tgt.x,y:tgt.y-56,t:0,txt:k<.7?"Quasi inutile...":"Peu efficace...",col:"#9ab4d8"})}
  return true;
}
function applyDamage(t,att,from,dmg,o){
  if(o.dot){t.hp=Math.max(0,t.hp-dmg);t.hpShow=3;t.flash=.08;pops.push({x:t.x,y:t.y-34,t:0,txt:"-"+dmg});if(t.hp<=0)knockOut(t,att);return}
  if(t.sleep){t.sleep=false;t.stun=0;pops.push({x:t.x,y:t.y-50,t:0,txt:"Réveillé"})}
  const reflecting=!!t.counter&&!o.reflected&&att&&att!==t&&att.hp>0;
  if(reflecting){
    const rip=t.counter.kind==="rip", cid=rip?"riposte":"mburst";
    t.counter=null; t.cd[cid]=Math.max(t.cd[cid]||0,SPL[cid].cd*.5);
    fx.push({k:"star",x:t.x,y:t.y-t.sp.body,sy:t.y+.7,t:0,life:.5,r:16,col:rip?"#ffd0a0":"#ffffff"});
    pops.push({x:t.x,y:t.y-44,t:0,txt:rip?"Riposte !":"Métal Burst !"}); rings.push({x:t.x,y:t.y,t:0,dur:.35,max:30,c:rip?"#ff8a60":"#d8d8f0"});
    if(rip)colorBurst(t.x,t.y-8,18,FIGHT,50,170);
    const back=Math.round(dmg*(rip?RIPOSTE.mult:MBURST.mult));
    if(!att.tunnel)applyDamage(att,t,t,back,{reflected:true,push:70});
    if(t.hp>0){t.hp=Math.max(0,t.hp-dmg);t.hpShow=3;t.flash=.14;pops.push({x:t.x,y:t.y-34,t:0,txt:"-"+dmg});if(t.hp<=0)knockOut(t,att)}
    return;
  }
  const armor=t.rush&&(t.rush.ph==="dash"||t.rush.ph==="flurry"); // la charge ne peut pas être interrompue, seulement la canalisation
  if(t.rush&&t.rush.ph==="chan")cancelRush(t,true);
  if(t.chan)cancelChan(t,true);
  t.hp=Math.max(0,t.hp-dmg); t.hpShow=3; t.flash=.14;
  pops.push({x:t.x,y:t.y-34,t:0,txt:"-"+dmg});
  if(!armor){
    const dx=t.x-from.x, dy=t.y-from.y, d=Math.hypot(dx,dy)||1;
    const v=o.push?clamp((o.push-d)*9,110,950):(t.ai?120:150); // la distance de recul vaut environ v/9 pixels d'art
    t.kb={vx:dx/d*v,vy:dy/d*v};
    if(t.ai){t.dir=dirFromVector(from.x-t.x,from.y-t.y);t.anim="hurt";t.frame=0;t.tick=0;t.ai.wait=Math.max(rand(1,2),o.stun||0);t.ai.atk=null;t.ai.atkCd=rand(2.5,4);t.run=false}
    else{
      t.stun=Math.max(t.stun,o.stun||.4); t.dizzy=!!o.stun; t.moveTarget=null; if(t===player)marker=null;
      if(t.sp.sheets.hurt){t.dir=dirFromVector(from.x-t.x,from.y-t.y);t.anim="hurt";t.frame=0;t.tick=0}
    }
  }
  const pal=o.pal||["#ffffff","#8fdcff","#7b6bff","#ffffff","#8fdcff"];
  for(let i=0;i<10;i++){const a=rand(0,Math.PI*2),v=rand(30,80);parts.push({x:t.x,y:t.y-12,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,t:0,life:rand(.25,.45),c:pal[i%5]})}
  if(o.pal){rings.push({x:t.x,y:t.y-8,t:0,dur:.28,max:20,c:pal[1]});colorBurst(t.x,t.y,14,pal,50,140)}
  hitstop=.07; shake=.18;
  if(t.hp<=0)knockOut(t,att);
}
function knockOut(t,att){
  sfxUI("ko");
  t.ko=1.6; t.kb=null; t.counter=null; t.rush=null; t.chan=null; t.tunnel=null; t.shieldOn=false;
  const more=teamKO(t);
  if(matchMode==="rush"&&!more){rushKO(t);return}
  if(!more&&matchMode==="duel"&&!NET.guest){if(t===player)score.foe++;else score.me++}
  if(!more&&matchMode==="duel"){t.ko=2.6; if(typeof showBanner==="function"){const over=typeof matchWon==="function"&&matchWon(); showBanner(over?(t===player?"DÉFAITE":"VICTOIRE"):(t===player?"ROUND PERDU":"ROUND GAGNÉ"),t===player?"lose":"win")}}
  showLog(t.sp.name+" est K.O. !",1600);
}
function updateKO(e,dt){
  if(e.ko<=0)return;
  e.ko-=dt;
  if(e.ko<=0){
    if(e.team&&!NET.guest&&teamAlive(e)>0)teamEnter(e);
    else if(e.ai){e.x=clampX(player.x+rand(-110,110));e.y=clampY(player.y+rand(-70,70));e.hp=e.maxHp;e.hpShow=0;e.kb=null;setAnim(e,"idle");e.ai.wait=rand(.6,1.4);e.ai.tx=e.x;e.ai.ty=e.y}
    else if(matchMode==="rush"){if(e===foe)rushNext();else rushEnd(false)}
    else if(!NET.guest){if(matchWon()&&typeof showResult==="function")showResult();else resetRound()}
  }
}
function updateKb(e,dt){
  const k=e.kb; if(!k)return;
  e.x=clampX(e.x+k.vx*dt); e.y=clampY(e.y+k.vy*dt);
  const f=Math.exp(-9*dt); k.vx*=f; k.vy*=f; if(Math.hypot(k.vx,k.vy)<6)e.kb=null;
}
// Collision douce entre les deux combattants sur le plan du sol (une ellipse), adoucie pour que personne ne saute.
function resolveCollision(dt){
  const a=player,b=foe;
  if(a.tunnel||b.tunnel||b.ko>0||a.ko>0)return;
  const sx=(a.x-b.x)/18, sy=(a.y-b.y)/7, L=Math.hypot(sx,sy);
  if(L>=1)return;
  const ux=L>1e-4?sx/L:0, uy=L>1e-4?sy/L:1, px=ux*18*(1-L), py=uy*7*(1-L);
  const k=Math.min(1,140*dt/Math.max(1e-4,Math.hypot(px,py)));
  a.x=clampX(a.x+px*.65*k); a.y=clampY(a.y+py*.65*k);
  b.x=clampX(b.x-px*.35*k); b.y=clampY(b.y-py*.35*k);
}
// ---- Bouclier ----
// Maintenir Espace : on ne bouge ni ne lance rien. Il se vide en maintien et se recharge au repos. À zéro il casse et reste inactif jusqu'à 30.
let btnShield=false;
const SHIELD_DRAIN=40, SHIELD_REGEN=25, STUN_TIME=1.5;
const shieldPat=(()=>{const c=document.createElement("canvas");c.width=2;c.height=2;const g=c.getContext("2d");g.fillStyle="#bfeaff";g.fillRect(0,0,1,1);g.fillRect(1,1,1,1);return ctx.createPattern(c,"repeat")})();
function breakShield(e){sfxUI("sbreak");e.shieldOn=false;e.shieldBroken=true;e.stun=STUN_TIME;e.dizzy=true;e.moveTarget=null;if(e===player)marker=null;e.tunnel=null;burst(e.x,e.y-16,14);logFor(e,"Bouclier brisé, étourdi !",1400)}
function updateShield(e,dt){
  if(e.stun>0){e.stun-=dt;e.shieldOn=false;e.shieldT=0;if(e.stun<=0){e.stun=0;e.sleep=false;if(e.dizzy)logFor(e,"Remis !",500)}return}
  const want=e.wantShield&&!e.counter&&!e.tunnel&&!e.rush&&!e.chan&&e.anim!=="attack"&&e.lock<=0;
  if(e.shieldBroken&&e.shieldE>=30)e.shieldBroken=false;
  if(want&&!e.shieldBroken&&e.shieldE>0){
    if(!e.shieldOn)sfxUI("shield");
    e.shieldT=(e.shieldT||0)+dt; e.shieldOn=true; e.shieldE=Math.max(0,e.shieldE-SHIELD_DRAIN*dt);
    if(e.shieldE<=0)breakShield(e);
  }else{e.shieldT=0;e.shieldOn=false;e.shieldE=Math.min(100,e.shieldE+SHIELD_REGEN*dt)}
}
// ---- Déplacement : clic droit, ou point visé par l'IA ----
function updateMove(e,dt){
  if(e.stun>0){e.moveTarget=null;if(e===player)marker=null;e.run=false;if(e.anim!=="idle"&&e.anim!=="hurt")setAnim(e,"idle");return}
  // Une fois le sort parti, un ordre de déplacement annule la fin de l'animation, comme en MOBA.
  if(e.anim==="attack"){if(e.hit&&e.moveTarget){setAnim(e,"idle");e.lock=0}else return}
  if(e.lock>0){e.lock-=dt;return}
  if(e.shieldOn||e.counter){e.moveTarget=null;setAnim(e,"guard");return}
  const mt=e.moveTarget, t=foeOf(e);
  if(mt&&mt.chase){
    if(!alive(t))e.moveTarget=null;
    else{mt.x=t.x;mt.y=t.y;if(e===player&&marker){marker.x=t.x;marker.y=t.y}}
  }
  if(e.moveTarget){
    const m=e.moveTarget, dx=m.x-e.x, dy=m.y-e.y, d=Math.hypot(dx,dy);
    if(Math.hypot(dx,dy*1.4)<=(m.chase?ATTACK_RANGE:1.5)){
      if(m.chase)e.dir=dirFromVector(dx,dy);
      e.moveTarget=null;
    }else{
      e.dir=dirFromVector(dx,dy);
      e.run=true; // courir est la seule façon de se déplacer
      const step=Math.min(SPEED*e.sp.spd*RUN_MULT*(e.slow>0?TRAP.slow:1)*bfOf(e,"ddance","spe")*bfOf(e,"bboost","spe")*dt,d);
      e.x=clampX(e.x+dx/d*step); e.y=clampY(e.y+dy/d*step);
      e.stepD=(e.stepD||0)+step; if(e.stepD>=20){e.stepD-=20;sfxStep(e)}
      setAnim(e,"walk"); return;
    }
  }
  setAnim(e,"idle");
}
