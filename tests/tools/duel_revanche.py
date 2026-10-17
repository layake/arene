"""Salon 1v1 en ligne : deux parties d'affilée (fin, retour au salon, nouveau Prêt, relance). Usage : python duel_revanche.py"""
import os
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
import subprocess,time
from playwright.sync_api import sync_playwright
procs=[subprocess.Popen(["node",ROOT+"/node_modules/peer/dist/bin/peerjs.js","--host","127.0.0.1","--port","9000","--path","/"],stdout=subprocess.DEVNULL)]
time.sleep(2)
lib=open(ROOT+"/node_modules/peerjs/dist/peerjs.min.js").read()
URL="file://"+REPO+"/index.html?peerhost=127.0.0.1&peerport=9000"
TEAMS=[['garchomp','lucario','gengar'],['mewtwo','pikachu','sylveon']]
ST="()=>[NET.on,NET.started,matchMode,typeof endShown!=='undefined'&&endShown,menuOpen,entities.length,typeof round!=='undefined'?round:null]"
KILL="()=>{const o=fighters.find(f=>f!==player);if(o){o.team&&o.team.forEach(s=>{if(s!==o.team[o.ti])s.dead=true});o.hp=1;strike(player,o,{name:'x',type:'normal',cat:'phys',power:999,cost:0,cd:0},{})}}"
try:
 with sync_playwright() as p:
  b=p.chromium.launch(); pg=[]
  for i in range(2):
    c=b.new_context(); c.route("**/peerjs.min.js",lambda r:r.fulfill(body=lib,content_type="application/javascript"))
    g=c.new_page(); g.on("pageerror",lambda e,i=i:print("PAGEERR",i,e)); g.goto(URL); g.wait_for_timeout(900)
    g.evaluate("(t)=>{picks=t; leaveTitle('online')}",TEAMS[i]); g.wait_for_timeout(300); pg.append(g)
  pg[0].click("#netCreate"); time.sleep(3); code=pg[0].evaluate("roomCode") if False else pg[0].inner_text("#netRoomCode")
  print("code",code)
  pg[1].fill("#netCode",code); pg[1].click("#netJoin"); time.sleep(4)
  for g in pg: g.click("#netReady"); time.sleep(.5)
  time.sleep(5)
  print("partie1 debut",[g.evaluate(ST) for g in pg])
  for rd in range(3):
    pg[0].evaluate(KILL); time.sleep(4)
    pg[0].evaluate("()=>{fighters.forEach(f=>{if(f!==player&&f.team){f.team.forEach(s=>s.dead=true)}})}"); time.sleep(.2)
  time.sleep(4)
  print("partie1 fin",[g.evaluate(ST) for g in pg])
  print("boutons",[g.evaluate("[...document.querySelectorAll('#endscr button')].filter(b=>b.offsetParent).map(b=>b.id+':'+b.textContent)") for g in pg])
  for g in pg:
    g.evaluate("(()=>{const m=document.getElementById('eMenu'); if(m)m.click()})()"); time.sleep(1)
  time.sleep(2)
  print("salon",[g.evaluate("[NET.on,NET.started,menuOpen,document.getElementById('netReady').textContent,document.getElementById('netReady').disabled,document.getElementById('netStatus').textContent]") for g in pg])
  for g in pg: g.click("#netReady"); time.sleep(.6)
  time.sleep(6)
  print("partie2 debut",[g.evaluate(ST) for g in pg])
  print("partie2 hp",[g.evaluate("fighters.map(f=>Math.round(f.hp)+'/'+f.team.filter(s=>!s.dead).length)") for g in pg])
  b.close()
finally:
  [q.terminate() for q in procs]
