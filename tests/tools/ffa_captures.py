import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
S=ROOT; D=os.path.join(ROOT,"out")+os.sep; os.makedirs(D,exist_ok=True)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
  b=p.chromium.launch()
  for w,h in [(1280,720),(1920,1080)]:
    c=b.new_context(viewport={'width':w,'height':h},locale='fr-FR'); pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)))
    pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(900)
    pg.evaluate("()=>{localStorage.setItem('aceName','Lensslo');leaveTitle('solo');picks=['garchomp','lucario'];pickMode='ffa';refreshMenu()}"); pg.wait_for_timeout(300)
    pg.screenshot(path=D+f"s1_menu_{w}.png")
    pg.click('#go'); pg.wait_for_timeout(700); pg.screenshot(path=D+f"s2_versus_{w}.png")
    pg.wait_for_timeout(2500); pg.screenshot(path=D+f"s3_fight_{w}.png")
    # le joueur est éliminé : spectateur
    pg.evaluate("()=>{player.team.forEach(s=>s.dead=true); player.hp=1; strike(fighters[1],player,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}"); pg.wait_for_timeout(1200); pg.screenshot(path=D+f"s4_out_{w}.png")
    pg.wait_for_timeout(3000); pg.screenshot(path=D+f"s5_spect_{w}.png")
    pg.evaluate("()=>{fighters.forEach((f,i)=>{if(i>1&&!f.out){f.team.forEach(s=>s.dead=true);f.hp=1;strike(fighters[1],f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}})}"); pg.wait_for_timeout(4000); pg.screenshot(path=D+f"s6_end_{w}.png")
    print(w,e)
  b.close()
