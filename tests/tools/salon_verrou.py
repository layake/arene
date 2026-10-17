"""Salon en ligne unique : l'équipe se verrouille à 3 Aces à 2 joueurs et à 2 Aces dès 3 joueurs ; revient à 3 quand le 3e part. Usage : python salon_verrou.py"""
import os,time,subprocess
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
os.makedirs(ROOT+"/out",exist_ok=True)
procs=[subprocess.Popen(["node",ROOT+"/node_modules/peer/dist/bin/peerjs.js","--host","127.0.0.1","--port","9000","--path","/"],stdout=subprocess.DEVNULL)]
time.sleep(2)
lib=open(ROOT+"/node_modules/peerjs/dist/peerjs.min.js").read()
URL="file://"+REPO+"/index.html?peerhost=127.0.0.1&peerport=9000"
TEAM=['garchomp','lucario','gengar']
fails=[]
def check(n,ok,i=""):
    print(("OK   " if ok else "FAIL ")+n+(" "+str(i) if i!="" else "")); 
    if not ok:fails.append(n)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(); pg=[]
  for i in range(3):
    c=b.new_context(viewport={'width':1280,'height':720}); c.route("**/peerjs.min.js",lambda r:r.fulfill(body=lib,content_type="application/javascript"))
    g=c.new_page(); g.on("pageerror",lambda e,i=i:print("PAGEERR",i,e)); g.goto(URL); g.wait_for_timeout(900)
    g.evaluate("(t)=>{picks=t.slice(); leaveTitle('online')}",TEAM); g.wait_for_timeout(300); pg.append(g)
  cap=lambda g:g.evaluate("teamCap()")
  info=lambda g:g.evaluate("[NET.ffaState.n,NET.ffaState.ready,NET.ffaState.players.map(p=>p?(p.team||[]).length+':'+p.ready:null).join(' ')]")
  check("avant le salon : 3 Aces sélectionnables",cap(pg[0])==3)
  pg[0].click("#ffaCreate")
  for t in range(20):
    time.sleep(.5); code=pg[0].evaluate("NET.ffaState.code")
    if code:break
  pg[1].fill("#ffaCode",code); pg[1].click("#ffaJoin"); time.sleep(3)
  check("2 joueurs : plafond 3 Aces chez l'hôte et l'invité",cap(pg[0])==3 and cap(pg[1])==3,[cap(pg[0]),cap(pg[1])])
  for g in pg[:2]: g.click("#ffaReady"); time.sleep(.5)
  time.sleep(1.5); i0=info(pg[0]); check("2 joueurs prêts avec 3 Aces",i0[2]=="3:true 3:true",i0)
  check("l'hôte peut lancer à 2 joueurs",pg[0].evaluate("!document.getElementById('ffaGo').disabled"))
  pg[0].screenshot(path=ROOT+"/out/salon_2.png")
  pg[2].fill("#ffaCode",code); pg[2].click("#ffaJoin"); time.sleep(3)
  check("3 joueurs : plafond 2 Aces pour tout le monde",[cap(g) for g in pg]==[2,2,2],[cap(g) for g in pg])
  i0=info(pg[0]); check("le 3e joueur remet les équipes à 2 Aces, plus personne n'est prêt",i0[0]==3 and "3:" not in i0[2] and "true" not in i0[2],i0)
  check("l'hôte ne peut plus lancer tant que personne n'est prêt",pg[0].evaluate("document.getElementById('ffaGo').disabled"))
  pg[0].screenshot(path=ROOT+"/out/salon_3.png")
  for g in pg: g.click("#ffaReady"); time.sleep(.5)
  time.sleep(1.5); check("3 joueurs prêts avec 2 Aces, lancement possible",pg[0].evaluate("!document.getElementById('ffaGo').disabled"),info(pg[0]))
  pg[2].click("#ffaQuit"); time.sleep(3)
  check("retour à 2 joueurs : plafond 3 Aces",[cap(pg[0]),cap(pg[1])]==[3,3],[cap(pg[0]),cap(pg[1])])
  i0=info(pg[0]); check("retour à 2 joueurs : équipes de 3 Aces, à revalider",i0[0]==2 and "2:" not in i0[2] and "true" not in i0[2],i0)
  b.close()
finally:
  [q.terminate() for q in procs]
print("TOUT PASSE" if not fails else "ECHECS : "+", ".join(fails))
