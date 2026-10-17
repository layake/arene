import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
S=ROOT; D=os.path.join(ROOT,"out")+os.sep; os.makedirs(D,exist_ok=True)
import subprocess,time,sys
from playwright.sync_api import sync_playwright
procs=[subprocess.Popen(["node","server/dev.js"],cwd=REPO),subprocess.Popen(["node",ROOT+"/node_modules/peer/dist/bin/peerjs.js","--host","127.0.0.1","--port","9000","--path","/"])]
time.sleep(2)
lib=open(ROOT+"/node_modules/peerjs/dist/peerjs.min.js").read()
URL="file://"+REPO+"/index.html?api=http://localhost:8787&peerhost=127.0.0.1&peerport=9000"
try:
 with sync_playwright() as p:
  b=p.chromium.launch(args=["--allow-file-access-from-files"])
  pg=[]
  for n in ("Alice","Bob"):
    c=b.new_context(); c.route("**/peerjs.min.js",lambda r:r.fulfill(body=lib,content_type="application/javascript"))
    g=c.new_page(); g.on("pageerror",lambda e:print("PAGEERR",e)); g.goto(URL); g.wait_for_timeout(800); g.evaluate("leaveTitle(\"online\")"); g.wait_for_timeout(300); pg.append((n,g))
  for n,g in pg:
    g.fill("#rkName",n); g.click("#rkReg"); g.wait_for_timeout(500)
    print(n,g.inner_text("#rkBox")[:80].replace("\n"," | "))
    print(n,"kit",g.evaluate("(()=>{const k=Object.keys(SPECIES).filter(k=>SPECIES[k].playable).slice(0,3);picks=k;return k.map(x=>draftOf(x).length)})()"))
  for n,g in pg: g.click("#rkGo")
  for t in range(40):
    time.sleep(1)
    st=[g.evaluate("[RK.state,NET.started,!!NET.on]") for n,g in pg]
    if t%3==0: print(t,st,[g.inner_text("#rkMsg") for n,g in pg])
    if all(s[1] for s in st): break
  print("started",st)
  for n,g in pg: g.evaluate("window.__r=0")
  time.sleep(2)
  # fin de match : l hote force la victoire de Alice (role host?)
  print("roles",[g.evaluate("NET.rk&&NET.rk.role") for n,g in pg])
  for n,g in pg: print(n,"fighting",g.evaluate("[matchMode,bestOf,typeof player]"))
  b.close() if False else None
  # forfait de Bob : il quitte
  time.sleep(20); bob=pg[1][1]; bob.evaluate("NET.leave()")
  time.sleep(4)
  print("alice after",pg[0][1].evaluate("[RK.match&&RK.match.reported]"))
  pg[0][1].evaluate("NET.leave()"); time.sleep(3)
  import urllib.request as u
  print(u.urlopen("http://localhost:8787/api/leaderboard").read().decode())
  print("alice elo",pg[0][1].evaluate("RK.prof.elo"))
  b.close()
finally:
  [q.terminate() for q in procs]
