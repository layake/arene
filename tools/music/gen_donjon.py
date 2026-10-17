"""Musique de combat « donjon » : composition ORIGINALE dans l'esprit des musiques de Pokémon Donjon Mystère (cuivres héroïques, cordes staccato,
basse qui pousse, timbales et caisse claire marquées, léger grain de console portable). Synthétisée par le code (numpy + scipy), sans échantillon ni soundfont.
Mi mineur, 148 BPM, 28 mesures = 45,4 s, boucle sans trou (la queue des effets est repliée sur le début).
Usage : python tools/music/gen_donjon.py   ->  music/donjon.wav (et music/donjon.ogg si le module soundfile est installé)"""
import os,math,wave
import numpy as np
from scipy import signal
SR=44100; BPM=148; BEAT=60/BPM; BAR=4*BEAT; BARS=28; TAIL=3.5
N=int(round(BARS*BAR*SR)); BUF=N+int(TAIL*SR)
rng=np.random.default_rng(21)
L=np.zeros(BUF); R=np.zeros(BUF); RVL=np.zeros(BUF); RVR=np.zeros(BUF)
mid2hz=lambda m:440.0*2**((m-69)/12)
def add(start,sig,pan=0.0,gain=1.0,rev=0.0):
    i=int(start*SR); n=min(len(sig),BUF-i)
    if n<=0:return
    s=sig[:n]*gain; l=s*math.cos((pan+1)*math.pi/4); r=s*math.sin((pan+1)*math.pi/4)
    L[i:i+n]+=l; R[i:i+n]+=r
    if rev:RVL[i:i+n]+=l*rev; RVR[i:i+n]+=r*rev
def adsr(n,a,d,s,r):
    e=np.full(n,float(s)); na=min(n,max(1,int(a*SR))); nd=min(max(1,int(d*SR)),max(0,n-na)); nr=min(n,max(1,int(r*SR)))
    e[:na]=np.linspace(0,1,na)
    if nd>0:e[na:na+nd]=np.linspace(1,s,nd)
    e[-nr:]*=np.linspace(1,0,nr); return e
def osc(kind,f,n,vib=None):
    t=np.arange(n)/SR; nh=max(1,int(min(15000,SR/2-1000)/f))
    ph=2*np.pi*f*t if vib is None else np.cumsum(2*np.pi*f*vib/SR)
    if kind=="sine":return np.sin(ph)
    if kind=="saw":return sum(np.sin(h*ph)/h for h in range(1,min(nh,50)))*2/np.pi
    if kind=="sq":return sum(np.sin(h*ph)/h for h in range(1,min(nh,50),2))*4/np.pi
    if kind=="pulse":
        d=.25; return sum(np.sin(np.pi*h*d)/h*np.cos(h*ph-np.pi*h*d)*2/np.pi for h in range(1,min(nh,40)))
def lp(x,fc,order=2):
    b,a=signal.butter(order,min(.99,fc/(SR/2)),"low"); return signal.lfilter(b,a,x)
def hp(x,fc,order=2):
    b,a=signal.butter(order,fc/(SR/2),"high"); return signal.lfilter(b,a,x)
# ---------- harmonie (Mi mineur) ----------
CH={"Em":([0,3,7],40),"C":([-4,0,3],36),"D":([-2,2,5],38),"G":([3,7,10],43),"Am":([5,8,12],33),"B":([7,11,14],35)}
SEC=["Em","Em"]+["Em","Em","C","D","Em","G","D","B"]+["Am","C","G","D","Am","C","B","B"]+["Em","Em","C","D","Em","G","D","B"]+["B","B"]
assert len(SEC)==BARS
INTRO,A1,B1,A2,OUT=(0,2),(2,10),(10,18),(18,26),(26,28)
# ---------- basse : sciée, qui pousse en croches (doubles croches dans la partie B) ----------
for b,c in enumerate(SEC):
    root=CH[c][1]; fast=B1[0]<=b<B1[1]
    steps=16 if fast else 8
    for q in range(steps):
        tb=q*(4/steps); oc=12 if (q%4==2 or (fast and q%8==6)) else 0
        f=mid2hz(root+oc); n=int(((4/steps)*BEAT+.06)*SR)
        s=(osc("saw",f,n)*.55+osc("sq",f/2,n)*.45)
        s=lp(s,900 if not fast else 1100)*adsr(n,.003,.08,.7,.04)
        if b<2 and q%2:continue
        add(b*BAR+tb*BEAT,s,gain=.30 if not fast else .26)
# ---------- cordes staccato : accords courts sur les croches décalées ----------
STAB=[1,0,1,1,0,1,1,0]
for b,c in enumerate(SEC):
    if b<2:continue
    tones=[64+x for x in CH[c][0]]; fast=B1[0]<=b<B1[1]
    for q in range(8):
        if not STAB[q] and not fast:continue
        for k,m in enumerate(tones+[tones[0]+12]):
            f=mid2hz(m); n=int(.16*SR)
            s=lp(osc("saw",f,n)+osc("saw",f*1.004,n),3000)*adsr(n,.004,.05,.4,.07)
            add(b*BAR+q*BEAT/2,s,pan=(k-1.5)*.4,gain=.030,rev=.3)
# ---------- cuivres : thèmes originaux ----------
A=[ [(0,.5,76),(.5,.5,76),(1,1,79),(2,.5,83),(2.5,.5,81),(3,1,79)],
    [(0,.5,81),(.5,.5,79),(1,1,76),(2,.5,74),(2.5,.5,76),(3,1,79)],
    [(0,.5,84),(.5,.5,84),(1,1,83),(2,.5,79),(2.5,.5,76),(3,1,79)],
    [(0,.5,78),(.5,.5,81),(1,1.5,86),(2.5,.5,83),(3,1,81)],
    [(0,.5,76),(.5,.5,76),(1,1,79),(2,.5,83),(2.5,.5,86),(3,1,83)],
    [(0,.5,86),(.5,.5,83),(1,1,79),(2,1,83),(3,1,79)],
    [(0,1,78),(1,1,81),(2,1,86),(3,.5,83),(3.5,.5,81)],
    [(0,2,83),(2,1,78),(3,1,75)] ]
B=[ [(0,.5,81),(.5,.5,81),(1,.5,84),(1.5,.5,81),(2,1,79),(3,1,76)],
    [(0,.5,79),(.5,.5,79),(1,.5,84),(1.5,.5,79),(2,1,76),(3,1,72)],
    [(0,.5,83),(.5,.5,83),(1,.5,86),(1.5,.5,83),(2,1,79),(3,1,74)],
    [(0,.5,81),(.5,.5,78),(1,.5,74),(1.5,.5,78),(2,1,81),(3,1,86)],
    [(0,1,88),(1,.5,86),(1.5,.5,84),(2,1,81),(3,1,84)],
    [(0,1,84),(1,1,88),(2,1,84),(3,1,79)],
    [(0,1,86),(1,1,83),(2,1,78),(3,1,75)],
    [(0,3,83)] ]
def brass(tb,du,m,gain,pan=0.0,octave=True):
    f=mid2hz(m); n=int((du*BEAT+.25)*SR); t=np.arange(n)/SR
    vib=1+.0035*np.sin(2*np.pi*5.5*t)*np.clip((t-.2)/.25,0,1)
    s=osc("saw",f,n,vib)*.6+osc("saw",f*1.006,n,vib)*.4+osc("pulse",f,n,vib)*.35
    cut=np.clip(1100+3800*(1-np.exp(-t*22)),0,5200)  # le filtre s'ouvre à l'attaque : le « coup » des cuivres
    out=np.zeros(n); blk=512
    for i in range(0,n,blk):
        b2,a2=signal.butter(2,min(.99,cut[min(n-1,i+blk//2)]/(SR/2)),"low"); out[i:i+blk]=signal.lfilter(b2,a2,s[i:i+blk]) # approximation par blocs
    out=out*adsr(n,.018,.12,.8,.18)
    add(tb*BEAT,out,pan=pan,gain=gain,rev=.3)
    if octave:
        o=osc("saw",f/2,n,vib); o=lp(o,1800)*adsr(n,.02,.12,.7,.18); add(tb*BEAT,o,pan=pan,gain=gain*.45,rev=.2)
for part,(s0,s1),th,g in((1,A1,A,.075),(2,B1,B,.08),(3,A2,A,.085)):
    for k in range(s1-s0):
        for (tb,du,m) in th[k]:
            brass(((s0+k)*4+tb),du,m,g)
            if part==3:  # reprise : seconde voix à la tierce en dessous (écriture simple, jamais de quinte parallèle de tout le thème)
                brass(((s0+k)*4+tb),du,m-3 if k%2==0 else m-5,g*.55,pan=-.3,octave=False)
# sortie : montée sur Si (pédale) puis frappe finale
for k,(tb,du,m) in enumerate([(0,.5,83),(.5,.5,83),(1,.5,83),(1.5,.5,86),(2,.5,83),(2.5,.5,86),(3,.5,88),(3.5,.5,90)]):
    brass(OUT[0]*4+tb,du,m,.06+.004*k,octave=False)
# intro : appels courts, tension
for (tb,du,m) in[(0,.75,64),(1,.25,64),(2,.5,67),(3,.5,71),(4,.75,64),(5,.25,64),(6,.5,67),(7,.5,66)]:
    brass(tb,du,m,.06,pan=-.1,octave=False)
# ---------- percussions : timbales, caisse claire marquée, charleston, cymbale ----------
def tom(f0,n=int(.38*SR),amp=1.0):
    t=np.arange(n)/SR; f=f0*(1+1.2*np.exp(-t*28)); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*8)*amp
def kick(n=int(.28*SR)):
    t=np.arange(n)/SR; f=140*np.exp(-t*26)+44; return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*10)
def snare(n=int(.26*SR)):
    t=np.arange(n)/SR; nz=hp(rng.standard_normal(n),1500); return nz*np.exp(-t*20)*.9+np.sin(2*np.pi*200*t)*np.exp(-t*26)*.6
def hat(op=False):
    n=int((.18 if op else .04)*SR); t=np.arange(n)/SR; return hp(rng.standard_normal(n),7500)*np.exp(-t*(18 if op else 110))
def crash():
    n=int(1.6*SR); t=np.arange(n)/SR; return hp(rng.standard_normal(n),3500)*np.exp(-t*2.6)
for b in range(BARS):
    t0=b*BAR
    if b<2:
        for beat,(f0) in((0,70),(2,70),(2.5,62),(3,66),(3.5,66)):add(t0+beat*BEAT,tom(f0),gain=.55,rev=.25)
        continue
    for beat in(0,1.5,2,3.5):add(t0+beat*BEAT,kick(),gain=.55)
    for beat in(1,3):add(t0+beat*BEAT,snare(),gain=.30,rev=.3)
    fast=B1[0]<=b<B1[1]
    for q in range(16 if fast else 8):
        add(t0+q*BEAT*(.25 if fast else .5),hat(op=(q%8==7)),pan=.3,gain=.08 if q%2 else .12)
    if b in(A1[0],B1[0],A2[0],OUT[0]):add(t0,crash(),gain=.22,rev=.3)
    if (b+1) in(A1[0]+4,B1[0]+4,A2[0]+4) or b in(9,17,25,27):  # roulement avant les changements de section
        for q in range(8):add(t0+(3+q/8)*BEAT,tom(90-q*3 if q<4 else 110-q*4),gain=.28+.03*q,rev=.2)
# ---------- effets : réverbération courte ----------
def rev_ir(sec=1.3,seed=1):
    r=np.random.default_rng(seed); n=int(sec*SR); t=np.arange(n)/SR
    return lp(r.standard_normal(n),6000)*np.exp(-t*4.2)*(1-np.exp(-t*80))
wetL=signal.fftconvolve(RVL,rev_ir(seed=3))[:BUF]*.05; wetR=signal.fftconvolve(RVR,rev_ir(seed=4))[:BUF]*.05
outL=L+wetL; outR=R+wetR
# ---------- boucle sans trou ----------
tl=BUF-N; outL[:tl]+=outL[N:]; outR[:tl]+=outR[N:]; outL=outL[:N]; outR=outR[:N]
# ---------- master : grain de console portable (bande passante réduite, légère quantification), compression, niveau ----------
mix=np.stack([hp(outL,35,1),hp(outR,35,1)]); mix=np.stack([lp(mix[0],11000,3),lp(mix[1],11000,3)])
q=2**11; mix=np.round(mix*q)/q+rng.standard_normal(mix.shape)*(.5/q)
env=np.maximum(np.abs(mix[0]),np.abs(mix[1])); win=int(.05*SR)
rms=np.sqrt(signal.fftconvolve(env**2,np.ones(win)/win,mode="same"))
gain=np.where(rms>.25,(.25/np.maximum(rms,1e-9))**.5,1.0); mix=mix*lp(gain,8,1)
mix*=10**(-15.5/20)/np.sqrt(np.mean(mix**2))
mix=np.tanh(mix*1.2)/np.tanh(1.2); mix*=min(1,.89/np.max(np.abs(mix)))
out=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)),"..","..","music")); os.makedirs(out,exist_ok=True)
pcm=(np.clip(mix,-1,1).T*32767).astype("<i2")
with wave.open(out+"/donjon.wav","wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
rep={"duree_s":round(N/SR,2),"pic_dBFS":round(20*math.log10(np.max(np.abs(mix))),1),"rms_dBFS":round(20*math.log10(np.sqrt(np.mean(mix**2))),1),
     "saut_couture":round(float(np.max(np.abs(mix[:,0]-mix[:,-1]))),4),"diff_typique_p99.9":round(float(np.percentile(np.abs(np.diff(mix,axis=1)).max(axis=0),99.9)),4)}
try:
    import soundfile as sf; sf.write(out+"/donjon.ogg",mix.T,SR,format="OGG",subtype="VORBIS"); rep["ogg"]=True
except Exception: rep["ogg"]=False
print(rep)
