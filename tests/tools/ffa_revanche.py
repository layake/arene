import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
S=ROOT; D=os.path.join(ROOT,"out")+os.sep; os.makedirs(D,exist_ok=True)
import subprocess,time
from playwright.sync_api import sync_playwright
procs=[subprocess.Popen(["node",ROOT+"/node_modules/peer/dist/bin/peerjs.js","--host","127.0.0.1","--port","9000","--path","/"],stdout=subprocess.DEVNULL)]
time.sleep(2)
lib=open(ROOT+"/node_modules/peerjs/dist/peerjs.min.js").read()
URL="file://"+REPO+"/index.html?peerhost=127.0.0.1&peerport=9000"
TEAMS=[['garchomp','lucario'],['mewtwo','pikachu'],['sylveon','tyranitar'],['charizard','gengar']]
N=int(__import__('sys').argv[1]) if len(__import__('sys').argv)>1 else 3
try:
 with sync_playwright() as p:
  b=p.chromium.launch(); pg=[]
  for i in range(N):
    c=b.new_context(); c.route("**/peerjs.min.js",lambda r:r.fulfill(body=lib,content_type="application/javascript"))
    g=c.new_page(); g.on("pageerror",lambda e,i=i:print("PAGEERR",i,e)); g.goto(URL); g.wait_for_timeout(900)
    g.evaluate("(t)=>{picks=t; leaveTitle('online')}",TEAMS[i]); g.wait_for_timeout(300); pg.append(g)
  pg[0].evaluate('()=>{bestOf=3}'); pg[0].click("#ffaCreate")
  for t in range(20):
    time.sleep(.5); code=pg[0].evaluate("NET.ffaState.code")
    if code: break
  print("code",code)
  for g in pg[1:]:
    g.fill("#ffaCode",code); g.click("#ffaJoin")
  time.sleep(4)
  for g in pg: g.click("#ffaReady"); time.sleep(.4)
  time.sleep(1.5)
  print("lobby",pg[0].evaluate("NET.ffaState.players.map(p=>p&&(p.name+':'+p.ready+':'+(p.team||[]).length))"), pg[0].inner_text("#ffaMsg"), [g.inner_text("#ffaMsg") for g in pg[1:]])
  pg[0].click("#ffaGo"); time.sleep(5)
  print("need",[g.evaluate("[FFA.need,FFA.round,FFA.w.join()]") for g in pg])
  KILL="()=>{fighters.forEach(f=>{if(f!==player&&!f.out){f.team.forEach(s=>s.dead=true);f.hp=1;strike(player,f,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}})}"
  pg[0].evaluate(KILL); time.sleep(3.5)
  print("apres r1",[g.evaluate("[FFA.round,FFA.w.join(),banEl.textContent,endShown]") for g in pg])
  time.sleep(5)
  print("r2 depart",[g.evaluate("[FFA.out.length,fighters.map(f=>f.out).join(),FFA.t|0]") for g in pg])
  pg[0].evaluate("()=>{FFA.t=100}"); time.sleep(1.5)
  print("ring t",[g.evaluate("FFA.t|0") for g in pg])
  pg[0].evaluate(KILL); time.sleep(3.5); time.sleep(3)
  print("fin",[g.evaluate("[endShown,FFA.w.join()]") for g in pg])
  print("boutons fin",[g.evaluate("[...document.querySelectorAll('#endscr button')].filter(b=>b.offsetParent).map(b=>b.id+':'+b.textContent)") for g in pg])
  # enchainement : retour au salon puis deuxieme partie
  for g in pg: g.evaluate("document.getElementById('eMenu').click()"); time.sleep(.5)
  time.sleep(2)
  print("salon apres fin",[g.evaluate("[NET.ffa,NET.started,ffaBox.hidden,document.getElementById('ffaReady')&&document.getElementById('ffaReady').textContent,menuOpen,NET.ffaState.started,NET.ffaState.ready]") for g in pg])
  for g in pg:
    if g.evaluate("!!document.getElementById('ffaReady')&&NET.ffaState.ready===false"): g.click("#ffaReady"); time.sleep(.4)
  time.sleep(1.5)
  print("lobby2",pg[0].evaluate("NET.ffaState.players.map(p=>p&&(p.name+':'+p.ready))"), pg[0].evaluate("document.getElementById('ffaGo')&&document.getElementById('ffaGo').disabled"))
  pg[0].click("#ffaGo"); time.sleep(6)
  print("partie2",[g.evaluate("[NET.started,matchMode,FFA.round,FFA.w.join(),FFA.out.length,endShown,fighters.length,menuOpen,menuEl.hidden]") for g in pg])
  pg[0].evaluate(KILL); time.sleep(4)
  print("partie2 apres kill",[g.evaluate("[FFA.round,FFA.w.join(),endShown]") for g in pg])
  b.close()
finally:
  [q.terminate() for q in procs]
