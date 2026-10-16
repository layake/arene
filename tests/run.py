"""Tests de fumée du jeu. Usage : python3 tests/run.py [chemin/index.html]   (nécessite playwright)
Construire d'abord : cd src/build && python3 build.py && cp carchacrok_new.html ../../index.html"""
import os,sys
from playwright.sync_api import sync_playwright
HTML=os.path.abspath(sys.argv[1] if len(sys.argv)>1 else os.path.join(os.path.dirname(__file__),'..','index.html'))
fails=[]
def check(name,ok,info=""):
    print(("OK   " if ok else "FAIL ")+name+(" "+str(info) if info!="" else "")); 
    if not ok: fails.append(name)
START="([keys,mode])=>{menuEl.hidden=true;menuOpen=false;startMatch(keys,mode||'duel');hideVersus();document.getElementById('title').style.display='none'}"
FREEZE="()=>{const e=entities[0],t=entities[1];OBST.forEach(c=>c.dead=true);t.stun=60;t.hp=t.maxHp;e.pp=999;e.cd={};e.stun=0;e.lock=0;t.x=e.x+110;t.y=e.y;mouse={wx:t.x,wy:t.y};clearInterval(window.__iv);window.__iv=setInterval(()=>{t.stun=60;t.hp=Math.max(t.hp,1);e.hp=Math.max(e.hp,1)},20)}"
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e))); pg.goto('file://'+HTML); pg.wait_for_timeout(700)
    check("chargement sans erreur",not errs,errs)
    # 1. données : chaque capacité a description, traduction (si FR!=EN), son et un utilisateur
    d=pg.evaluate("""()=>{const skip=['swap','flash','tackle'],ids=Object.keys(SPL).filter(i=>!i.startsWith('~')&&!skip.includes(i));
      return {nosfx:ids.filter(i=>!SFX_MAP[i]),nodesc:ids.filter(i=>!DESC[i]),noen:Object.keys(DESC).filter(i=>!EN[DESC[i]]),
      unused:ids.filter(i=>!Object.values(SPECIES).some(s=>(s.pool||s.kit||[]).includes(i))),
      kit:Object.keys(SPECIES).filter(k=>SPECIES[k].playable&&(SPECIES[k].kit.length!==4||SPECIES[k].kit.some(i=>!SPL[i])))}}""")
    for k,v in d.items(): check("données "+k,not v,v)
    # 2. chaque capacité de chaque Pokémon se lance sans erreur et fait quelque chose
    ids=pg.evaluate("()=>Object.keys(SPECIES).filter(k=>SPECIES[k].playable).map(k=>[k,SPECIES[k].pool||SPECIES[k].kit])")
    noeff=[]
    for sp,pool in ids:
        pg.evaluate(START,[[sp,'garchomp','gengar'],None]); pg.wait_for_timeout(2700)
        for mv in pool:
            n0=len(errs); got=False
            for attempt in range(3):
                pg.evaluate("""(mv)=>{const e=entities[0],t=entities[1];("""+FREEZE+""")();e.kit=[mv].concat(e.kit.filter(x=>x!==mv)).slice(0,4);e.lock=0;e.anim='idle';e.counter=null;e.bf={};e.shieldOn=false;e.rush=null;e.chan=null;e.tunnel=null;e.strm=null;e.gcd=0;window.__sx=e.x;window.__h0=Math.round(e.maxHp/2);e.hp=window.__h0;
                  const near=SPL[mv].melee||MELEE_DEFS.some(d=>d.id===mv), short=STREAM_DEFS.some(d=>d.id===mv);if(near||short){t.x=e.x+(near?26:60);t.y=e.y;mouse={wx:t.x,wy:t.y}}cast(e,mv)}""",mv)
                pg.wait_for_timeout(1100)
                eff=pg.evaluate("()=>{const e=entities[0],t=entities[1];return {hp:t.hp<t.maxHp||t.slow>0||t.burn>0||t.psn>0,self:Object.keys(e.bf||{}).length>0||e.hp>window.__h0+1||!!e.counter||!!e.shieldOn||!!e.decoy,world:zones.length+orbs.length+fx.length+holes.length+beams.length>0,moved:Math.abs(e.x-window.__sx)>2||e.rush||e.tunnel||e.chan}}")
                if any(eff.values()): got=True; break
            if not got: noeff.append(sp+':'+mv)
            if len(errs)>n0: check(f"lancer {mv} ({sp})",False,errs[n0:])
    check("toutes les capacités se lancent sans erreur",not errs,errs[:2])
    check("toutes les capacités ont un effet observable",not noeff,noeff)
    # 3. jets : maintenir, immobile, relâcher coupe
    pg.evaluate(START,[['empoleon','garchomp','gengar'],None]); pg.wait_for_timeout(2700)
    pg.evaluate(FREEZE); pg.evaluate("()=>{const e=entities[0];e.kit=['hydrocanon'].concat(e.kit.slice(1))}")
    pg.keyboard.down('q'); pg.wait_for_timeout(300)
    pg.evaluate("()=>{const e=entities[0];window.__x=e.x;e.moveTarget={x:e.x-80,y:e.y}}"); pg.wait_for_timeout(1500)
    r=pg.evaluate("()=>{const e=entities[0];return [!!e.strm,Math.abs(e.x-window.__x)<1,entities[1].hp<entities[1].maxHp]}")
    check("jet maintenu : actif, immobile, touche",all(r),r)
    pg.keyboard.up('q'); pg.wait_for_timeout(500)
    check("jet relâché : coupé",pg.evaluate("()=>!entities[0].strm"))
    # 4. cooldowns du banc
    pg.evaluate("()=>{const e=entities[0];e.stun=0;e.lock=0;e.swapCd=0;e.cd.hydrocanon=5;cast(e,'swap')}"); pg.wait_for_timeout(1500)
    a=pg.evaluate("()=>entities[0].team[0].cd.hydrocanon"); pg.wait_for_timeout(4000)
    check("cooldown du banc baisse",0<a<4.5 and pg.evaluate("()=>entities[0].team[0].cd.hydrocanon")==0,a)
    # 4b. F en équipe : le nouvel Ace arrive au curseur ; seul : Flash
    pg.evaluate(START,[['garchomp','lucario','mewtwo'],'duel']); pg.wait_for_timeout(4500)
    pg.evaluate("()=>{foe.stun=99;player.lock=0;window.__p=[player.x,player.y];mouse={wx:player.x+60,wy:player.y+40};cast(player,'flash')}"); pg.wait_for_timeout(800)
    r=pg.evaluate("()=>[player.key,Math.round(Math.hypot(player.x-__p[0],player.y-__p[1])),player.swapCd>0,!(player.cd.flash>0)]")
    check("F en équipe : swap au curseur",r[0]!='garchomp' and r[1]>40 and r[2] and r[3],r)
    pg.evaluate("()=>{player.team.forEach((s,i)=>{if(i!==player.ti)s.dead=true});player.lock=0;window.__p=[player.x,player.y];mouse={wx:player.x-60,wy:player.y};cast(player,'flash')}"); pg.wait_for_timeout(800)
    r=pg.evaluate("()=>[Math.round(Math.hypot(player.x-__p[0],player.y-__p[1])),player.cd.flash>0]")
    check("F seul : Flash classique",r[0]>40 and r[1],r)
    # 5. marathon
    pg.evaluate(START,[['empoleon','garchomp','gengar'],'rush']); pg.wait_for_timeout(2800)
    pg.evaluate("()=>{foe.hp=1;strike(player,foe,SPL[player.kit[0]],{})}"); pg.wait_for_timeout(2600)
    check("marathon : combat suivant",pg.evaluate("()=>MARA.i")==1)
    pg.evaluate("()=>{player.team.forEach(s=>s.dead=true);player.hp=1;strike(foe,player,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}"); pg.wait_for_timeout(4000)
    check("marathon : écran de fin",pg.evaluate("()=>!endEl.hidden"))
    # 6. bots contournent les obstacles
    pg.evaluate(START,[['empoleon','garchomp','gengar'],None]); pg.wait_for_timeout(2900)
    r=pg.evaluate("""()=>new Promise(res=>{const e=entities[0],f=entities[1],o=OBST.find(c=>!c.dead);if(!o){res({skip:1});return}
      e.stun=60;f.x=o.x-110;f.y=o.y;e.x=o.x+110;e.y=o.y;let inside=0,t=0;const iv=setInterval(()=>{t++;e.stun=60;e.hp=e.maxHp;if(Math.hypot(f.x-o.x,(f.y-o.y)/ISO)<o.r+2)inside++;
        if(t>150||f.x>o.x+60){clearInterval(iv);res({inside,passed:f.x>o.x+40})}},50)})""")
    check("bot contourne l'obstacle",r.get('skip') or (r['inside']==0 and r['passed']),r)
    check("aucune erreur pendant les tests",not errs,errs[:3])
    b.close()
print("\n"+("TOUT PASSE" if not fails else "ECHECS : "+", ".join(fails))); sys.exit(1 if fails else 0)
