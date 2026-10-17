"""Test du gestionnaire de musique avec une piste de test jetable (jamais livrée) : boucle, fondus, volume, coupure, repli, bruitages inchangés.
Usage : python music_test.py"""
import os,math,struct,wave,shutil,threading,http.server,socketserver,functools
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.abspath(__file__)); REPO=os.path.abspath(os.path.join(ROOT,"..",".."))
D=os.path.join(ROOT,"out","music_site"); shutil.rmtree(D,ignore_errors=True); os.makedirs(D+"/music")
shutil.copy(REPO+"/index.html",D+"/index.html")
sr=22050; n=sr*3; f=220  # 660 périodes exactes : la fin enchaîne sur le début sans à-coup
with wave.open(D+"/music/test.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
    w.writeframes(b"".join(struct.pack("<h",int(12000*math.sin(2*math.pi*f*i/sr))) for i in range(n)))
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=D)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=socketserver.TCPServer(("127.0.0.1",0),functools.partial(Q,directory=D)); port=srv.server_address[1]
threading.Thread(target=srv.serve_forever,daemon=True).start()
fails=[]
def check(name,ok,info=""):
    print(("OK   " if ok else "FAIL ")+name+(" "+str(info) if info!="" else ""))
    if not ok: fails.append(name)
START="([keys,mode])=>{menuEl.hidden=true;menuOpen=false;startMatch(keys,mode||'duel');hideVersus();document.getElementById('title').style.display='none'}"
with sync_playwright() as p:
    b=p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"]); pg=b.new_page(viewport={'width':1280,'height':720}); errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:{port}/index.html"); pg.wait_for_timeout(800); pg.mouse.click(300,300); pg.wait_for_timeout(500)
    sfx0=pg.evaluate("[Object.keys(SND_B64).length,SND.bus.fight.gain.value,SND.bus.ui.gain.value,JSON.stringify(SFX_MAP).length]")
    # 1. sans piste configurée : comportement actuel (chiptune)
    pg.evaluate(START,[['garchomp','gengar','lucario'],None]); pg.wait_for_timeout(600)
    check("sans piste : le chiptune de combat joue",pg.evaluate("[MUS.mode,!!MFILE.src]")==["battle",False],pg.evaluate("[MUS.mode,!!MFILE.src]"))
    # 2. avec piste : démarre, boucle, fondu d'entrée
    pg.evaluate("()=>{MUSIC_TRACKS.battle='music/test.wav'}")
    pg.evaluate(START,[['garchomp','gengar','lucario'],None]); pg.wait_for_timeout(3000)
    r=pg.evaluate("()=>[!!MFILE.src,MFILE.src&&MFILE.src.loop,MUS.mode,MFILE.key,MFILE.gain&&+MFILE.gain.gain.value.toFixed(2)]")
    check("avec piste : le fichier joue en boucle, le chiptune se tait",r[0] and r[1] and r[2] is None and r[3]=='music/test.wav' and r[4]>=.98,r)
    dur=pg.evaluate("MFILE.buf['music/test.wav'].duration")
    check("piste de test de 3 s décodée",abs(dur-3)<.05,dur)
    # boucle : on écoute pendant 7 s (deux passages de la fin au début) : le niveau ne tombe jamais à zéro
    rms=pg.evaluate("""async()=>{const c=SND.ctx,an=c.createAnalyser();an.fftSize=1024;SND.bus.music.connect(an);const d=new Float32Array(1024),o=[];
      for(let i=0;i<70;i++){await new Promise(r=>setTimeout(r,100));an.getFloatTimeDomainData(d);let s=0;for(const v of d)s+=v*v;o.push(Math.sqrt(s/d.length))}
      SND.bus.music.disconnect(an);return o}""")
    check("la boucle ne coupe pas pendant 7 s (niveau toujours > 0,02)",min(rms)>.02 and pg.evaluate("!!MFILE.src&&MFILE.src.loop"),[round(min(rms),3),round(max(rms),3)])
    # 3. volume et coupure séparés des effets
    pg.evaluate("()=>{const e=document.getElementById('vMusic');e.value=20;e.dispatchEvent(new Event('input'))}"); pg.wait_for_timeout(200)
    check("curseur musique : bus musique à 0,2",abs(pg.evaluate("SND.bus.music.gain.value")-.2)<.01,pg.evaluate("SND.bus.music.gain.value"))
    pg.evaluate("()=>{const c=document.getElementById('vMusicMute');c.checked=true;c.dispatchEvent(new Event('change'))}"); pg.wait_for_timeout(200)
    check("case Couper : bus musique à 0",pg.evaluate("SND.bus.music.gain.value")==0)
    check("effets inchangés par le volume et la coupure musique",pg.evaluate("[SND.bus.fight.gain.value,SND.bus.ui.gain.value]")==[sfx0[1],sfx0[2]],pg.evaluate("[SND.bus.fight.gain.value,SND.bus.ui.gain.value]"))
    pg.evaluate("()=>{const c=document.getElementById('vMusicMute');c.checked=false;c.dispatchEvent(new Event('change'))}")
    # 4. écran de résultat : fondu de sortie d'environ 1 s
    pg.evaluate("()=>{endShown=true}"); pg.wait_for_timeout(250)
    g1=pg.evaluate("()=>MFILE.src?1:0"); pg.wait_for_timeout(1700)
    check("résultat : la musique s'arrête après le fondu",pg.evaluate("!MFILE.src"),pg.evaluate("!MFILE.src"))
    pg.evaluate("()=>{endShown=false}")
    # 5. retour au menu : chiptune du menu
    pg.evaluate("()=>{openMenu()}"); pg.wait_for_timeout(400)
    check("menu : chiptune du menu, pas de fichier",pg.evaluate("[MUS.mode,!!MFILE.src]")==["menu",False],pg.evaluate("[MUS.mode,!!MFILE.src]"))
    # 6. fichier absent : repli sur le chiptune sans erreur
    pg.evaluate("()=>{MUSIC_TRACKS.battle='music/absent.ogg'}")
    pg.evaluate(START,[['garchomp','gengar','lucario'],None]); pg.wait_for_timeout(1500)
    check("fichier absent : le chiptune continue",pg.evaluate("[MUS.mode,!!MFILE.src]")==["battle",False],pg.evaluate("[MUS.mode,!!MFILE.src]"))
    # 7. bruitages intacts
    sfx1=pg.evaluate("[Object.keys(SND_B64).length,SND.bus.fight.gain.value,SND.bus.ui.gain.value,JSON.stringify(SFX_MAP).length]")
    check("bruitages inchangés (nombre, bus, table)",sfx0==sfx1,[sfx0,sfx1])
    check("aucune erreur JS",not errs,errs)
    b.close()
srv.shutdown()
print("TOUT PASSE" if not fails else "ECHECS : "+", ".join(fails))
