"""Musique du lobby et des menus : composition ORIGINALE, synthétisée par le code (numpy + scipy), sans échantillon ni soundfont.
Ambiance : chaleureux et aventureux, synthés et basse, 108 BPM, Do majeur, 20 mesures = 44,4 s, boucle sans trou (la queue des effets est repliée sur le début).
Usage : python tools/music/gen_lobby.py   ->  music/lobby.wav (et music/lobby.ogg si le module soundfile est installé)"""
import os,math,wave
import numpy as np
from scipy import signal
SR=44100; BPM=108; BEAT=60/BPM; BAR=4*BEAT; BARS=20; TAIL=4.0
N=int(round(BARS*BAR*SR)); BUF=N+int(TAIL*SR)
rng=np.random.default_rng(7)
L=np.zeros(BUF); R=np.zeros(BUF)               # bus secs
RVL=np.zeros(BUF); RVR=np.zeros(BUF)           # envoi réverbération
DLL=np.zeros(BUF); DLR=np.zeros(BUF)           # envoi delay
mid2hz=lambda m:440.0*2**((m-69)/12)
def add(start,sig,pan=0.0,gain=1.0,rev=0.0,dly=0.0):
    i=int(start*SR); n=min(len(sig),BUF-i)
    if n<=0:return
    s=sig[:n]*gain; l=s*math.cos((pan+1)*math.pi/4); r=s*math.sin((pan+1)*math.pi/4)
    L[i:i+n]+=l; R[i:i+n]+=r
    if rev:RVL[i:i+n]+=l*rev; RVR[i:i+n]+=r*rev
    if dly:DLL[i:i+n]+=l*dly; DLR[i:i+n]+=r*dly
def adsr(n,a,d,s,r):
    e=np.full(n,float(s)); na=min(n,max(1,int(a*SR))); nd=min(max(1,int(d*SR)),max(0,n-na)); nr=min(n,max(1,int(r*SR)))
    e[:na]=np.linspace(0,1,na);
    if nd>0:e[na:na+nd]=np.linspace(1,s,nd)
    e[-nr:]*=np.linspace(1,0,nr); return e
def osc(kind,f,n):
    t=np.arange(n)/SR; nh=max(1,int(min(16000,SR/2-1000)/f)); ph=2*np.pi*f*t
    if kind=="sine":return np.sin(ph)
    if kind=="saw":return sum(np.sin(h*ph)/h for h in range(1,min(nh,60)))*2/np.pi
    if kind=="pulse":
        d=.3; return sum(np.sin(np.pi*h*d)/h*np.cos(h*ph-np.pi*h*d)*2/np.pi for h in range(1,min(nh,50)))
def lp(x,fc,order=2):
    b,a=signal.butter(order,fc/(SR/2),"low"); return signal.lfilter(b,a,x)
def hp(x,fc,order=2):
    b,a=signal.butter(order,fc/(SR/2),"high"); return signal.lfilter(b,a,x)
# ---------- harmonie ----------
CH={"C":[0,4,7],"G":[7,11,14],"Am":[9,12,16],"F":[5,9,12],"Em":[4,7,11]}
PROG=["C","G","Am","F","C","G","Am","F", "F","G","Em","Am","F","G","C","C", "Am","F","G","G"]
ROOT={"C":0,"G":7,"Am":9,"F":5,"Em":4}
# ---------- nappe : saw désaccordées, filtre doux, attaque lente ----------
for b,c in enumerate(PROG):
    for k,semi in enumerate(CH[c]):
        for det in(-7,0,7):
            f=mid2hz(60+semi)*2**(det/1200); n=int((BAR+1.2)*SR)
            s=lp(osc("saw",f,n),1500)*adsr(n,.5,.3,.8,1.0)
            add(b*BAR,s,pan=(k-1)*.45,gain=.030,rev=.55)
# ---------- basse : sinus + saw filtrée ----------
BASSPAT=[(0,.5,0),(.75,.25,0),(1.5,.5,12),(2,.5,0),(2.75,.25,0),(3.25,.5,12)]  # (temps, durée, octave)
for b,c in enumerate(PROG):
    r=36+ROOT[c]
    if ROOT[c]>=7:r-=12
    for (tb,du,oc) in BASSPAT:
        f=mid2hz(r+oc); n=int((du*BEAT+.15)*SR)
        s=(osc("sine",f,n)*.8+lp(osc("saw",f,n),700)*.45)*adsr(n,.005,.12,.55,.08)
        add(b*BAR+tb*BEAT,s,pan=0,gain=.20)
# ---------- arpège : pluck de doubles croches, ping-pong ----------
ARP=[0,1,2,1,2,1,0,1]
for b,c in enumerate(PROG):
    if b<2:continue
    tones=[72+x for x in CH[c]]
    for q in range(16):
        k=q%8; m=tones[ARP[k]]
        if k==7:m=tones[2]+12 if b%2 else tones[1]
        f=mid2hz(m); n=int(.34*SR)
        s=lp(osc("pulse",f,n),3200)*adsr(n,.003,.10,.12,.18)
        add(b*BAR+q*BEAT/4,s,pan=-.6 if q%2 else .6,gain=.040 if b<8 else .052,rev=.4,dly=.5)
# ---------- mélodie ----------
MEL=[ # (temps global, durée en temps, note midi)
 (0,1.5,76),(1.5,.5,79),(2,1,81),(3,1,79),
 (4,1.5,79),(5.5,.5,74),(6,1,76),(7,1,74),
 (8,1,72),(9,1,76),(10,1,81),(11,1,79),
 (12,1.5,77),(13.5,.5,76),(14,1,74),(15,1,72),
 (16,1.5,76),(17.5,.5,79),(18,1,84),(19,1,81),
 (20,1.5,83),(21.5,.5,79),(22,1,74),(23,1,79),
 (24,1,81),(25,1,79),(26,1,76),(27,1,72),
 (28,2,74),(30,1,77),(31,1,79),
 (32,1,81),(33,.5,81),(33.5,.5,84),(34,1,81),(35,1,77),
 (36,1,79),(37,.5,79),(37.5,.5,83),(38,1,79),(39,1,74),
 (40,1,76),(41,1,79),(42,1,83),(43,1,79),
 (44,2,81),(46,1,84),(47,1,81),
 (48,1,84),(49,.5,81),(49.5,.5,84),(50,1,86),(51,1,84),
 (52,1,83),(53,.5,79),(53.5,.5,83),(54,1,86),(55,1,83),
 (56,1.5,84),(57.5,.5,79),(58,1,76),(59,1,79),
 (60,3,84),
 (64,1,81),(65,1,84),(66,1,81),(67,1,79),
 (68,1,77),(69,1,81),(70,1,84),(71,1,81),
 (72,1,79),(73,1,83),(74,1,86),(75,1,83),
 (76,1.5,86),(77.5,.5,83),(78,1,79),(79,1,74)]
for (tb,du,m) in MEL:
    f=mid2hz(m); n=int((du*BEAT+.4)*SR); t=np.arange(n)/SR
    vib=1+.004*np.sin(2*np.pi*5.2*t)*np.clip((t-.25)/.3,0,1)
    ph=np.cumsum(2*np.pi*f*vib/SR)
    s=(np.sin(ph)*.55+lp(sum(np.sin(h*ph)/h for h in range(1,14))*.5,3800))*adsr(n,.012,.15,.7,.25)
    add(tb*BEAT,s,pan=.08,gain=.10 if tb<32 else .115,rev=.35,dly=.28)
# ---------- batterie douce ----------
def kick(n=int(.30*SR)):
    t=np.arange(n)/SR; f=130*np.exp(-t*22)+42; return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
def snare(n=int(.22*SR)):
    t=np.arange(n)/SR; nz=hp(rng.standard_normal(n),1800); return nz*np.exp(-t*24)*.8+np.sin(2*np.pi*190*t)*np.exp(-t*30)*.5
def hat(op=False):
    n=int((.20 if op else .05)*SR); t=np.arange(n)/SR; return hp(rng.standard_normal(n),7000)*np.exp(-t*(16 if op else 90))
for b in range(BARS):
    if b<2:continue
    for beat in(0,2):add(b*BAR+beat*BEAT,kick(),gain=.50)
    if b>=8 and b%2==1:add(b*BAR+3.5*BEAT,kick(),gain=.32)
    for beat in(1,3):add(b*BAR+beat*BEAT,snare(),gain=.17,rev=.25)
    for q in range(8):add(b*BAR+q*BEAT/2,hat(op=(q==7 and b%4==3)),pan=.25,gain=.10 if q%2 else .07)
    if b in(7,15,19):
        for q in range(4):add(b*BAR+(3+q/4)*BEAT,snare(),gain=.10+.04*q,rev=.2)
# ---------- effets : réverbération (réponse impulsionnelle bruitée) et delay ping-pong ----------
def rev_ir(sec=1.9,seed=1):
    r=np.random.default_rng(seed); n=int(sec*SR); t=np.arange(n)/SR
    return lp(r.standard_normal(n),5000)*np.exp(-t*3.2)*(1-np.exp(-t*60))
wetL=signal.fftconvolve(RVL,rev_ir(seed=11))[:BUF]*.045; wetR=signal.fftconvolve(RVR,rev_ir(seed=12))[:BUF]*.045
d=int(BEAT*.75*SR); fb=.38
dl=np.zeros(BUF); dr=np.zeros(BUF)
for k in range(1,7):
    sh=k*d; amp=fb**(k-1)*.55
    if sh>=BUF:break
    if k%2:dr[sh:]+=DLL[:BUF-sh]*amp; dl[sh:]+=DLR[:BUF-sh]*amp
    else:dl[sh:]+=DLL[:BUF-sh]*amp; dr[sh:]+=DLR[:BUF-sh]*amp
outL=L+wetL+lp(dl,6000); outR=R+wetR+lp(dr,6000)
# ---------- boucle sans trou : la queue est repliée sur le début ----------
tl=BUF-N; outL[:tl]+=outL[N:]; outR[:tl]+=outR[N:]
outL=outL[:N]; outR=outR[:N]
# ---------- master : filtre grave, compression douce, niveau cible ----------
mix=np.stack([hp(outL,30,1),hp(outR,30,1)])
env=np.maximum(np.abs(mix[0]),np.abs(mix[1])); win=int(.05*SR)
rms=np.sqrt(signal.fftconvolve(env**2,np.ones(win)/win,mode="same"))
gain=np.where(rms>.25,(.25/np.maximum(rms,1e-9))**.5,1.0); mix=mix*lp(gain,8,1)
mix*=10**(-17/20)/np.sqrt(np.mean(mix**2))
mix=np.tanh(mix*1.15)/np.tanh(1.15); mix*=min(1,.89/np.max(np.abs(mix)))
# ---------- sortie ----------
out=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","music")); os.makedirs(out,exist_ok=True)
pcm=(np.clip(mix,-1,1).T*32767).astype("<i2")
with wave.open(out+"/lobby.wav","wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
rep={"duree_s":round(N/SR,2),"pic_dBFS":round(20*math.log10(np.max(np.abs(mix))),1),"rms_dBFS":round(20*math.log10(np.sqrt(np.mean(mix**2))),1),
     "raccord_ecart":round(float(np.max(np.abs(mix[:,0]-mix[:,-1]))),4)}
try:
    import soundfile as sf
    x32=np.ascontiguousarray(mix.T.astype("float32"))
    with sf.SoundFile(out+"/lobby.ogg","w",samplerate=SR,channels=2,format="OGG",subtype="VORBIS") as fo:  # par blocs : l'écriture d'un seul bloc plante libsndfile
        for i in range(0,len(x32),SR):fo.write(x32[i:i+SR])
    rep["ogg"]=True
except Exception: rep["ogg"]=False
print(rep)
