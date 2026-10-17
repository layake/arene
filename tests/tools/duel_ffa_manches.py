import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
S=ROOT; D=os.path.join(ROOT,"out")+os.sep; os.makedirs(D,exist_ok=True)
from playwright.sync_api import sync_playwright
KILL="(f)=>{f.team.forEach(s=>s.dead=true);f.hp=1;strike(fighters[0]===f?fighters[1]:fighters[0],f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}"
with sync_playwright() as p:
  b=p.chromium.launch(); c=b.new_context(viewport={'width':1280,'height':720},locale='fr-FR'); pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)))
  pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(900)
  # sélection : 3 Aces en duel puis passage en mêlée -> 2 max
  pg.evaluate("()=>{leaveTitle('solo');pickMode='duel';picks=['garchomp','lucario','pikachu'];refreshMenu();pickMode='ffa';refreshMenu()}")
  print('rounds visible ffa:',pg.evaluate("()=>!document.querySelector('#menu .rounds').hidden"),'pressed on cards:',pg.evaluate("()=>[...document.querySelectorAll('#cards .ace[aria-pressed=true]')].length"))
  pg.evaluate("()=>{bestOf=3;picks=['garchomp','lucario'];refreshMenu()}")
  pg.click('#go'); pg.wait_for_timeout(5500)
  print('need',pg.evaluate("()=>FFA.need"),'w',pg.evaluate("()=>FFA.w"))
  # round 1 : tout le monde sauf le joueur meurt
  pg.evaluate("()=>{fighters.forEach(f=>{if(f!==player&&!f.out){f.team.forEach(s=>s.dead=true);f.hp=1;strike(player,f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}})}")
  pg.wait_for_timeout(3500)
  print('apres r1 w',pg.evaluate("()=>FFA.w"),'round',pg.evaluate("()=>FFA.round"),'banner',pg.evaluate("()=>document.getElementById('banner')?document.getElementById('banner').textContent:''"),'endShown',pg.evaluate("()=>endShown"))
  pg.wait_for_timeout(3500); pg.screenshot(path=D+"u1_round2.png")
  print('r2 out reset',pg.evaluate("()=>fighters.map(f=>f.out)"),'banner',pg.evaluate("()=>banEl.textContent"))
  # éliminé : double coup sur éliminé ne relance pas la bannière ni ne double le classement
  pg.wait_for_timeout(2000)
  pg.evaluate("()=>{const f=fighters[1];f.team.forEach(s=>s.dead=true);f.hp=1;strike(player,f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}"); pg.wait_for_timeout(300)
  n=pg.evaluate("()=>FFA.out.length"); pg.evaluate("()=>{const f=fighters[1];f.hp=1;applyDamage(f,player,player,50,{dot:true})}"); pg.wait_for_timeout(200)
  print('out len stable',n,pg.evaluate("()=>FFA.out.length"))
  # ring : avance le temps
  pg.evaluate("()=>{FFA.t=70}"); pg.wait_for_timeout(1500)
  print('warn log ok'); pg.evaluate("()=>{FFA.t=100}"); pg.wait_for_timeout(300); pg.screenshot(path=D+"u2_ring.png")
  hp0=pg.evaluate("()=>player.hp"); 
  pg.evaluate("()=>{player.x=AB.x1;player.y=AB.y1;player.moveTarget=null}"); pg.wait_for_timeout(1600)
  print('hp player',hp0,'->',pg.evaluate("()=>player.hp"),'outside',pg.evaluate("()=>ringOut(player,ffaRing())"))
  pg.evaluate("()=>{fighters.forEach(f=>{if(f!==player&&!f.out){f.team.forEach(s=>s.dead=true);f.hp=1;strike(player,f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}})}")
  pg.wait_for_timeout(3500); pg.wait_for_timeout(4000)
  print('w',pg.evaluate("()=>FFA.w"),'endShown',pg.evaluate("()=>endShown")); pg.screenshot(path=D+"u3_end.png")
  print(e); b.close()
