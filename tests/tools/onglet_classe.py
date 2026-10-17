import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
S=ROOT; D=os.path.join(ROOT,"out")+os.sep; os.makedirs(D,exist_ok=True)
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
  b=p.chromium.launch(); c=b.new_context(viewport={'width':1280,'height':720},locale='fr-FR'); pg=c.new_page(); e=[]; pg.on('pageerror',lambda x:e.append(str(x)))
  pg.goto('file://'+REPO+'/index.html'); pg.wait_for_timeout(900)
  pg.evaluate("()=>leaveTitle('solo')"); pg.wait_for_timeout(300)
  pg.click('#menu .tabs [data-tab=online]'); pg.wait_for_timeout(300); pg.screenshot(path=D+"r_online.png")
  print('rkBox visible online:',pg.evaluate("()=>getComputedStyle(rkBox).display"))
  pg.click('#menu .tabs [data-tab=ranked]'); pg.wait_for_timeout(600); pg.screenshot(path=D+"r_ranked.png")
  print('ranked:',pg.evaluate("()=>[getComputedStyle(rkBox).display,getComputedStyle(document.getElementById('netRow')).display,document.querySelector('#menu h2').textContent]"))
  pg.click('#menu .tabs [data-tab=solo]'); pg.wait_for_timeout(200)
  print('solo go visible:',pg.evaluate("()=>getComputedStyle(document.getElementById('go')).display"),e); b.close()
