"""Simulation bot contre bot (équilibrage). Usage : python sim_balance.py [N par paire] [clé1,clé2,...]
Chaque Ace affronte tous les autres (1 Ace chacun, difficulté normale, une manche), N combats par côté. Affiche le taux de victoire par Ace."""
import os,sys,json
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
N=int(sys.argv[1]) if len(sys.argv)>1 else 6
ONLY=sys.argv[2].split(",") if len(sys.argv)>2 else None
JS="""async([N,only])=>{
  const keys=Object.keys(SPECIES).filter(k=>SPECIES[k].playable), focus=only||keys, W={}, G={};
  keys.forEach(k=>{W[k]=0;G[k]=0});
  window.requestAnimationFrame=()=>0; const _draw=draw; draw=function(){};
  diff='normal'; let T=0;
  function fight(a,b){
    menuEl.hidden=true; menuOpen=false; document.getElementById('title').style.display='none'; foePick=b; startMatch(a,'duel'); hideVersus(); vsT=0; introPending=true; cdT=0;
    player.bot={think:.5,shieldT:0,strafe:1,strafeT:0,nextMove:0}; botEquip(player,foe);
    last=T*1000; let steps=0;
    while(steps<7200){ T+=1/60; frame(T*1000); steps++;
      if(score.me+score.foe>=1||endShown)break; }
    return score.me>score.foe?a:score.foe>score.me?b:null;
  }
  for(const a of focus)for(const b of keys){ if(a===b)continue;
    for(let i=0;i<N;i++){ const w=fight(a,b); G[a]++;G[b]++; if(w)W[w]++; const w2=fight(b,a); G[a]++;G[b]++; if(w2)W[w2]++; } }
  draw=_draw; return keys.map(k=>[k,G[k]?Math.round(1000*W[k]/G[k])/10:null,G[k]]);
}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(800)
    r=pg.evaluate(JS,[N,ONLY])
    for k,wr,g in sorted(r,key=lambda x:-(x[1] or 0)): print(f"{k:12s} {wr}%  ({g} combats)")
    print("erreurs:",errs[:3])
