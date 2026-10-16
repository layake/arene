// ===== Tortipousse (mannequin) : se promène, et charge de temps en temps (télégraphiée). Le bouclier la bloque, Tunnel l'esquive. =====
const TURT={wind:.55,dist:85,speed:190,rec:.7,hit:13};
function startTurtAttack(e){
  const dx=player.x-e.x, dy=player.y-e.y, d=Math.hypot(dx,dy)||1;
  e.ai.atk={ph:"wind",t:0,fx:dx/d,fy:dy/d,trav:0,hit:false}; e.dir=dirFromVector(dx,dy); setAnim(e,"idle"); e.rest=99;
}
function endTurtAttack(e){e.ai.atk=null; e.ai.atkCd=rand(2.5,4.5); e.ai.wait=rand(.4,1); e.run=false; setAnim(e,"idle")}
function updateTurtAttack(e,dt){
  const A=e.ai.atk; A.t+=dt;
  if(!alive(player)){endTurtAttack(e);return}
  if(A.ph==="wind"){
    if(A.t<TURT.wind*.6){const dx=player.x-e.x,dy=player.y-e.y,d=Math.hypot(dx,dy)||1;A.fx=dx/d;A.fy=dy/d;e.dir=dirFromVector(dx,dy)}
    if(A.t>=TURT.wind){A.ph="dash";A.t=0;e.run=true;setAnim(e,"walk")}
  }else if(A.ph==="dash"){
    let left=Math.min(TURT.speed*dt,TURT.dist-A.trav);
    while(left>0&&A.ph==="dash"){
      const st=Math.min(4,left); left-=st; e.x=clampX(e.x+A.fx*st); e.y=clampY(e.y+A.fy*st); A.trav+=st;
      if(!A.hit&&!player.tunnel&&Math.hypot(player.x-e.x,(player.y-e.y)*1.3)<TURT.hit){
        A.hit=true; strike(e,player,SPL.tackle,{from:e,contact:true});
        if(e.ai.atk){A.ph="rec";A.t=Math.min(A.t,0);e.run=false;setAnim(e,"idle")}
      }
      else if(A.trav>=TURT.dist-.01){A.ph="rec";A.t=0;e.run=false;setAnim(e,"idle")}
    }
  }else if(A.t>=TURT.rec)endTurtAttack(e);
}
function updateWanderer(e,dt){
  const ai=e.ai;
  if(e.kb){
    e.x=clampX(e.x+e.kb.vx*dt); e.y=clampY(e.y+e.kb.vy*dt);
    const k=Math.exp(-9*dt); e.kb.vx*=k; e.kb.vy*=k;
    if(Math.hypot(e.kb.vx,e.kb.vy)<6)e.kb=null;
  }
  if(e.ko>0)return;
  if(e.anim==="hurt")return;
  if(!alive(player)){setAnim(e,"idle");return}
  if(ai.atk){updateTurtAttack(e,dt);return}
  ai.atkCd-=dt;
  {const d0=Math.hypot(player.x-e.x,player.y-e.y); if(ai.atkCd<=0&&d0<130&&d0>25){startTurtAttack(e);return}}
  if(ai.wait>0){
    ai.wait-=dt; setAnim(e,"idle");
    if(ai.wait<=0){const a=rand(0,Math.PI*2),r=rand(40,110);ai.tx=clampX(player.x+Math.cos(a)*r);ai.ty=clampY(player.y+Math.sin(a)*r*.7)}
    return;
  }
  const dx=ai.tx-e.x, dy=ai.ty-e.y, d=Math.hypot(dx,dy);
  if(d<2){ai.wait=rand(2,5);setAnim(e,"idle");return}
  e.dir=dirFromVector(dx,dy); setAnim(e,"walk");
  e.x=clampX(e.x+dx/d*ai.speed*dt); e.y=clampY(e.y+dy/d*ai.speed*dt);
}
// ===== IA du champion : mêmes règles que le joueur (PP, recharges, bouclier, étourdissement), elle appuie simplement sur les mêmes sorts =====
const botBusy=e=>e.stun>0||e.tunnel||e.rush||e.chan||e.lock>0||e.anim==="attack";
const DIFFS={
  easy:{think:[.9,1.5],shield:0,dodge:0,lead:0,aggr:.35,kit:0},
  normal:{think:[.35,.7],shield:3,dodge:0,lead:.5,aggr:.7,kit:1},
  hard:{think:[.15,.35],shield:7,dodge:1,lead:1,aggr:1.1,kit:2}
};
let diff="normal";
const DF=()=>DIFFS[(typeof MARA!=="undefined"&&MARA&&matchMode==="rush")?rushStage(MARA.i):diff]||DIFFS.normal;
function aimTo(e,t,chest,lead){
  const l=(lead||0)*DF().lead;
  e.aimPt={wx:t.x+(t.vx||0)*l,wy:t.y+(t.vy||0)*l-(chest?t.sp.body:0)};
}
function botThreat(e,t,d){
  if(t.rush&&t.rush.ph!=="rec"&&d<175)return true;
  if(t.chan&&d<215)return true;
  if(t.tunnel&&d<130)return true;
  if(t.anim==="attack"&&!t.hit&&d<55)return true;
  if(orbs.some(o=>o.o===t&&Math.hypot(o.x-e.x,(o.y-e.y)*1.3)<48))return true;
  if(zones.some(z=>z.o===t&&z.k!=="grav"&&z.k!=="trap"&&z.k!=="pois"&&!z.done&&z.t>(z.delay||(z.k==="quake"?QUAKE.delay:PSY.delay))-.3&&gdist(z.x-e.x,z.y-e.y)<zoneR(z)+8))return true;
  if(t.ai&&t.ai.atk&&t.ai.atk.ph==="wind")return true;
  return false;
}
// Le bot n'utilise que les sorts de sa panoplie, avec les mêmes conditions que le joueur (PP, recharge).
function botDecide(e,t,d){
  const punish=t.stun>0||t.lock>0||(t.anim==="attack"&&!t.hit&&d<90)||(t.rush&&t.rush.ph==="rec"), has=id=>e.kit.includes(id), ok=id=>has(id)&&cdOf(e,id)<=0&&e.pp>=SPL[id].cost, A=DF().aggr*(punish&&DF().dodge>0?1.7:1), rnd=p=>Math.random()<Math.min(.95,p*A);
  const go=(id,chest,lead)=>{aimTo(e,t,chest,lead||0);cast(e,id);return true};
  const gd=gdist(t.x-e.x,t.y-e.y), threat=botThreat(e,t,d);
  // défense et bonus
  if(threat&&d<80&&ok("mburst")&&rnd(.5))return go("mburst");
  if(threat&&d<100&&ok("tele")&&rnd(.45)){const ux=(e.x-t.x)/d, uy=(e.y-t.y)/d; e.aimPt={wx:e.x+ux*TELE.range,wy:e.y+uy*TELE.range*.8}; cast(e,"tele"); return}
  if(botAce(e,t,d,threat,go,ok,rnd)||botAce2(e,t,d,threat,go,ok,rnd)||botAce3(e,t,d,threat,go,ok,rnd)||(typeof botAce5!=="undefined"&&botAce5(e,t,d,threat,go,ok,rnd))||(typeof botAce4!=="undefined"&&botAce4(e,t,d,threat,go,ok,rnd)))return;
  if(ok("calm")&&!e.bf.calm&&d>70&&e.pp>=60)return go("calm");
  if(ok("nplot")&&!e.bf.nplot&&d>80&&e.pp>=60)return go("nplot");
  if(ok("idef")&&!e.bf.idef&&d<110&&e.pp>=55&&rnd(.6))return go("idef");
  if(ok("sdance")&&!e.bf.sdance&&d<150&&e.pp>=60&&rnd(.6))return go("sdance");
  // corps à corps
  const melee=meleeIds(e).find(id=>ok(id));
  if(melee&&d<ATTACK_RANGE+(melee==="ihead"?10:8))return go(melee,true);
  if(gd<QUAKE.r-8&&ok("quake")&&rnd(.55))return go("quake");
  if(ok("rush")&&d>70&&d<135&&rnd(.5))return go("rush",false,.15);
  if(ok("tun")&&d>55&&d<115&&rnd(.45))return go("tun",false,.1);
  if(ok("sedge")&&d>25&&d<EDGE.len-10&&rnd(.5))return go("sedge",false,.1);
  if(ok("gleam")&&d>60&&d<GLEAM.len-30&&rnd(.35))return go("gleam",true,.2);
  if(ok("ssneak")&&d>50&&d<110&&rnd(.4))return go("ssneak",false,.1);
  if(ok("hypno")&&d>70&&d<150&&rnd(.4))return go("hypno",false,.3);
  if(ok("hex")&&d<HX.range+6&&(hexBoost(t)||rnd(.35)))return go("hex",false,HX.delay*.8);
  // à distance
  if(ok("sbomb")&&d>40&&d<SB.range+6&&rnd(.5))return go("sbomb",false,SB.delay*.8);
  if(ok("tbolt")&&d>50&&d<230&&rnd(.5))return go("tbolt",true,.3);
  if(ok("shball")&&d<200&&rnd(.65))return go("shball",false,.3);
  if(ok("fsight")&&d<FS.range+8&&rnd(.4))return go("fsight",false,FS.delay*.9);
  if(ok("grav")&&d>45&&d<GRAV.range+6&&rnd(.45))return go("grav",false,.1);
  if(ok("psy")&&d<PSY.range+10&&rnd(.6))return go("psy",false,PSY.delay*.8);
  if(ok("trap")&&d<TRAP.range+10&&!zones.some(z=>z.k==="trap"&&z.o===e)&&rnd(.35))return go("trap",false,.5);
  if(ok("rslide")&&d>35&&d<RS.dist[2]+8&&rnd(.5))return go("rslide",false,.3);
  if(ok("fcannon")&&d>40&&d<220&&rnd(.5))return go("fcannon",true,.3);
  if(ok("moon")&&d<200&&rnd(.65))return go("moon",false,.3);
  if(ok("mud")&&d>45&&d<175&&rnd(.45))return go("mud",false,.25);
}
// Esquive : on sort de la trajectoire d'un projectile ou d'une zone qui va exploser. Le délai de réaction dépend de la difficulté.
function botEvade(e,t,d,dt,lvl){
  const b=e.bot, react=dt*(lvl>=2?16:8);
  if(Math.random()>react)return false;
  for(const o of orbs){
    if(o.o!==t)continue; const P=PROJ[o.id]; if(!P)continue;
    const rx=e.x-o.x, ry=e.y-o.y, along=rx*o.vx+ry*o.vy; if(along<0||along>P.range)continue;
    const perp=rx*o.vy-ry*o.vx, tm=along/P.speed;
    if(Math.abs(perp)<P.hit+e.sp.body*.5+6&&tm<(lvl>=2?.7:.5)){
      const sg=perp>=0?-1:1, px=-o.vy*sg, py=o.vx*sg;
      e.moveTarget={x:clampX(e.x+px*50),y:clampY(e.y+py*40)}; return true;
    }
  }
  for(const z of zones){
    if(z.o!==t||z.done||z.k==="grav"||z.k==="trap"||z.k==="pois")continue;
    const R=zoneR(z)+10, dz=gdist(z.x-e.x,z.y-e.y);
    if(dz<R&&z.t>0){const ux=(e.x-z.x)/(dz||1), uy=(e.y-z.y)/(dz||1);e.moveTarget={x:clampX(e.x+ux*(R-dz+22)),y:clampY(e.y+uy*(R-dz+22)*.8)};return true}
  }
  return false;
}
function botSteer(e,t,d,dt){
  const b=e.bot, dx=t.x-e.x, dy=t.y-e.y, ux=dx/d, uy=dy/d, px=-uy, py=ux, lvl=DF().dodge;
  b.strafeT-=dt; if(b.strafeT<=0){b.strafeT=rand(.9,1.8);b.strafe=Math.random()<.5?-1:1}
  // esquive : un adversaire qui canalise une visée longue, on sort de sa ligne
  const ch=(t.rush&&t.rush.ph==="chan"&&t.rush)||t.chan;
  if(ch&&d<230&&lvl){
    const sd=(e.x-t.x)*ch.fy-(e.y-t.y)*ch.fx, sg=sd>=0?1:-1;
    if(Math.abs(sd)<24){e.moveTarget={x:clampX(e.x+ch.fy*sg*55),y:clampY(e.y-ch.fx*sg*55)};return}
  }
  if(lvl&&botEvade(e,t,d,dt,lvl))return;
  const wall=e.x<AB.x0+29||e.x>AB.x1-29||e.y<AB.y0+28||e.y>AB.y1-25;
  if(e.sp.style==="melee"){
    if(d>ATTACK_RANGE-4&&!(e.moveTarget&&e.moveTarget.chase))e.moveTarget={x:t.x,y:t.y,chase:true};
  }else{
    const near=lvl>=2?100:85, far=lvl>=2?150:155;
    if(d<near){
      // on recule, mais acculé au mur on contourne par le côté
      const tx=clampX(e.x-ux*70+px*b.strafe*25), ty=clampY(e.y-uy*70+py*b.strafe*25);
      e.moveTarget=(wall&&Math.hypot(tx-e.x,ty-e.y)<40)?{x:clampX(e.x+px*b.strafe*60+ux*20),y:clampY(e.y+py*b.strafe*60+uy*20)}:{x:tx,y:ty};
    }
    else if(d>far)e.moveTarget={x:clampX(t.x-ux*125),y:clampY(t.y-uy*125)};
    else if(!e.moveTarget||Math.random()<dt*.8)e.moveTarget={x:clampX(e.x+px*b.strafe*40),y:clampY(e.y+py*b.strafe*40)};
  }
}
// Panoplie de l'IA : elle remplace un de ses sorts par un sort de sa liste qui touche en super efficace le type de l'adversaire.
function botEquip(e,o){
  const lvl=DF().kit; if(!lvl||!e||!o||!e.sp.pool)return;
  const kit=e.sp.kit.slice();
  const val=id=>{const s=SPL[id]; if(s.cat==="status"||s.self||!s.power)return 999; return s.power*typeMult(s.type,o.sp.types)*(e.sp.types.includes(s.type)?MULT.stab:1)};
  let best=null,bv=0;
  for(const id of e.sp.pool){if(kit.includes(id))continue; const s=SPL[id]; if(s.cat==="status"||!s.power)continue; const m=typeMult(s.type,o.sp.types); if(m>1.25&&val(id)>bv){best=id;bv=val(id)}}
  if(best){let wi=-1,wv=1e9; kit.forEach((id,i)=>{const v=val(id); if(v<wv){wv=v;wi=i}}); if(wi>=0&&bv>wv)kit[wi]=best}
  e.kit=kit;
}
function thinkBot(e,dt){
  const b=e.bot, t=foeOf(e);
  if(e.ko>0||!alive(t)){e.wantShield=false;e.moveTarget=null;return}
  const dx=t.x-e.x, dy=t.y-e.y, d=Math.hypot(dx,dy)||1;
  const chest=e.anim==="attack"&&(!e.cast||SPL[e.cast].ground===false);
  if(e.anim==="attack"||e.rush||e.chan)aimTo(e,t,chest,({psy:PSY.delay*.8,fsight:FS.delay*.9,sbomb:SB.delay*.8,hex:HX.delay*.8,heat:HEAT.delay*.8,avalanche:AVAL.delay*.8,wpulse:WP.delay*.9})[e.cast]||0);
  b.shieldT=Math.max(0,b.shieldT-dt);
  if(botThreat(e,t,d)&&b.shieldT<=0&&e.shieldE>25&&!e.shieldBroken&&!e.tunnel&&!e.rush&&!e.chan&&Math.random()<dt*DF().shield)b.shieldT=rand(.4,.8);
  e.wantShield=b.shieldT>0;
  if(e.shieldOn||e.stun>0)return;
  b.think-=dt;
  if(!botBusy(e)&&b.think<=0){b.think=rand(DF().think[0],DF().think[1]);botDecide(e,t,d)}
  if(!botBusy(e)){botSteer(e,t,d,dt);botAvoid(e)}
}
// Contournement : si la ligne droite vers la destination traverse un obstacle, on vise un point de détour sur le côté.
function botAvoid(e){
  const m=e.moveTarget; if(!m||typeof OBST==="undefined"||!OBST.length||e.tunnel||e.rush)return;
  const g=m.orig||m, ax=e.x, ay=e.y/ISO, bx=g.x, by=g.y/ISO, vx=bx-ax, vy=by-ay, L2=vx*vx+vy*vy; if(L2<1)return;
  let hit=null, ht=2;
  for(const c of OBST){ if(c.dead)continue;
    const R=c.r+e.sp.body*.3+4, cx=c.x, cy=c.y/ISO, u=((cx-ax)*vx+(cy-ay)*vy)/L2; if(u<=0||u>=1.05)continue;
    const px=ax+vx*u-cx, py=ay+vy*u-cy, dd=Math.hypot(px,py);
    if(dd<R&&u<ht){hit=c;ht=u}
  }
  if(!hit){ if(m.orig)e.moveTarget=m.orig; return }
  const R=hit.r+e.sp.body*.3+16, cx=hit.x, cy=hit.y/ISO, L=Math.sqrt(L2), nx=-vy/L, ny=vx/L;
  const side=((cx-ax)*nx+(cy-ay)*ny)>=0?-1:1; // du côté opposé au centre par rapport à la trajectoire
  const wx=clampX(cx+nx*R*side), wy=clampY((cy+ny*R*side)*ISO);
  e.moveTarget={x:wx,y:wy,det:true,orig:m.orig||{x:m.x,y:m.y,chase:m.chase}};
}
