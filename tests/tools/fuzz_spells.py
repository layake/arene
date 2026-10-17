"""Fuzz des sorts : chaque capacité de chaque Ace, à plusieurs distances, cible protégée / étourdie / en tunnel, en duel et en mêlée. Cherche les erreurs JS. Usage : python fuzz_spells.py [mode duel|ffa]"""
import os,sys
from playwright.sync_api import sync_playwright
REPO=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..",".."))
MODE=sys.argv[1] if len(sys.argv)>1 else "duel"
JS=r"""async(mode)=>{
  const errs=[]; window.addEventListener('error',e=>errs.push(String(e.message)+' @'+(e.filename||'').slice(-12)+':'+e.lineno));
  window.requestAnimationFrame=()=>0; const _d=draw; let T=0; // dessin conservé pour attraper les erreurs de rendu
  const keys=Object.keys(SPECIES).filter(k=>SPECIES[k].playable), res=[];
  const step=n=>{for(let i=0;i<n;i++){T+=1/60; try{frame(T*1000)}catch(x){errs.push('FRAME '+x.message)}}};
  for(const k of keys){
    menuEl.hidden=true; menuOpen=false; document.getElementById('title').style.display='none';
    if(mode==='ffa'){startMatch([k,'garchomp'],'ffa')}else{startMatch([k,'garchomp','gengar'],'duel')}
    hideVersus(); vsT=0; introPending=false; cdT=0; last=T*1000; step(30);
    const pool=SPECIES[k].pool;
    for(const mv of pool){
      for(const cfg of [[26,'idle'],[70,'idle'],[130,'shield'],[200,'stun'],[60,'tunnel'],[90,'ko']]){
        const e=player, t=fighters.find(f=>f!==e&&!f.out)||foe; if(!t)continue;
        OBST.forEach(c=>c.dead=true); e.hp=e.maxHp; e.stun=0; e.lock=0; e.cd={}; e.pp=999; e.shieldOn=false; e.rush=null; e.chan=null; e.tunnel=null; e.counter=null; e.ko=0;
        t.hp=t.maxHp; t.stun=0; t.tunnel=null; t.shieldOn=false; t.ko=0; t.x=e.x+cfg[0]; t.y=e.y; mouse={wx:t.x,wy:t.y}; t.bot=null; t.moveTarget=null;
        if(cfg[1]==='shield')t.shieldOn=true; if(cfg[1]==='stun')t.stun=3;
        e.kit=[mv].concat(e.kit.filter(x=>x!==mv)).slice(0,4);
        const n0=errs.length;
        try{ cast(e,mv); step(60); if(cfg[1]==='ko'){t.hp=1; step(10)} if(cfg[1]==='tunnel'){t.tunnel={phase:'hold',t:0}; step(20); t.tunnel=null} step(30); }
        catch(x){errs.push('CAST '+k+':'+mv+' '+x.message)}
        if(errs.length>n0)res.push(k+':'+mv+'@'+cfg.join('/')+' => '+errs.slice(n0).join(' | '));
        if(entities.length&&matchMode==='duel'&&(score.me+score.foe)>=2){score.me=0;score.foe=0}
        if(endShown){endShown=false}
      }
    }
  }
  return {res:res.slice(0,40),total:errs.length};
}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(800)
    r=pg.evaluate(JS,MODE)
    print(MODE,'erreurs:',r['total'])
    for x in r['res']: print(' ',x)
    print('pageerror:',errs[:5])
