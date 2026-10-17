// ---- Sons : effets de Pokémon Donjon Mystère (usage privé). WebAudio, 3 jauges (général, combat, interface). ----
const SFX_MAP={ // cast = départ du sort, hit = impact (sinon son selon l'efficacité)
  claw:{cast:726,hit:848},mud:{cast:860,hit:863},tun:{cast:602,hit:344},rush:{cast:402,hit:336},
  quake:{cast:420,hit:750},rslide:{cast:653,hit:651},ihead:{cast:819,hit:344},sdance:{cast:744},
  conf:{cast:769},moon:{cast:810,hit:811},psy:{cast:769},gleam:{cast:851},grav:{cast:392},calm:{cast:840},
  tele:{cast:392},fsight:{cast:604},mburst:{cast:845,hit:336},idef:{cast:845},trap:{cast:827},fcannon:{cast:851},
  sedge:{cast:819},scl:{cast:762,hit:856},shball:{cast:794},sbomb:{cast:856},ssneak:{cast:402},fpalm:{cast:762,hit:856},flame:{cast:810,hit:856},fly:{cast:402,hit:344},heat:{cast:856},ddance:{cast:744},icepunch:{cast:762,hit:856},avalanche:{cast:653,hit:651},stomp:{cast:420,hit:750},iwall:{cast:845},icebeam:{cast:851},fwave:{cast:810,hit:811},asph:{cast:851},ccombat:{cast:402,hit:762},riposte:{cast:845,hit:336},wshuri:{cast:794},sucker:{cast:402,hit:762},wpulse:{cast:856},decoy:{cast:392},
  hypno:{cast:772},hex:{cast:692},nplot:{cast:362},tbolt:{cast:774,hit:685},tackle:{cast:344}
};
const SFX_UI={click:306,go:307,shield:355,block:344,sbreak:336,ko:416,sleep:772,buff:362,win:212};
const SND={ctx:null,gain:null,bus:{},vol:{master:.8,fight:.8,ui:.8,music:.5},buf:{},ready:false,idmap:null};
try{const v=JSON.parse(localStorage.getItem("sndVol")||"null");if(v)Object.assign(SND.vol,v)}catch(e){}
function sndInit(){
  if(SND.ctx)return; const AC=window.AudioContext||window.webkitAudioContext; if(!AC||typeof SND_B64==="undefined")return;
  SND.ctx=new AC(); SND.gain=SND.ctx.createGain(); const cmp=SND.ctx.createDynamicsCompressor(); cmp.threshold.value=-14; cmp.ratio.value=5; cmp.attack.value=.003; cmp.release.value=.18; const mk=SND.ctx.createGain(); mk.gain.value=1.7; SND.gain.connect(cmp); cmp.connect(mk); mk.connect(SND.ctx.destination);
  ["fight","ui","music"].forEach(k=>{const g=SND.ctx.createGain();g.connect(SND.gain);SND.bus[k]=g});
  sndApply(); musicSet(menuOpen?"menu":"battle");
  Object.keys(SND_B64).forEach(id=>{
    const bin=atob(SND_B64[id]), u=new Uint8Array(bin.length); for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    SND.ctx.decodeAudioData(u.buffer,b=>{SND.buf[id]=b},()=>{});
  });
}
function sndApply(){ if(!SND.ctx)return; SND.gain.gain.value=SND.vol.master; SND.bus.fight.gain.value=SND.vol.fight; SND.bus.ui.gain.value=SND.vol.ui; SND.bus.music.gain.value=SND.vol.music*(SND.duck?.3:1) }
function sndSave(){ try{localStorage.setItem("sndVol",JSON.stringify(SND.vol))}catch(e){} }
function sfx(id,bus,vol,rate,x){
  if(!SND.ctx||!id)return; const b=SND.buf[id]; if(!b)return;
  if(SND.ctx.state==="suspended")SND.ctx.resume();
  const s=SND.ctx.createBufferSource(), g=SND.ctx.createGain(); s.buffer=b; if(rate)s.playbackRate.value=rate;
  g.gain.value=(vol==null?1:vol)*((typeof SFX_GAIN!=="undefined"&&SFX_GAIN[id])||1); s.connect(g);
  // Spatialisation : le son se place à gauche ou à droite selon la position dans l'arène
  if(x!=null&&SND.ctx.createStereoPanner&&typeof WORLD!=="undefined"){const pn=SND.ctx.createStereoPanner(); pn.pan.value=clamp((x/WORLD.w*2-1)*.65,-.7,.7); g.connect(pn); pn.connect(SND.bus[bus||"fight"])}
  else g.connect(SND.bus[bus||"fight"]);
  s.start();
}
function sfxSpellId(sp){ if(!SND.idmap){SND.idmap=new Map();Object.keys(SPL).forEach(k=>SND.idmap.set(SPL[k],k))} return SND.idmap.get(sp) }
// Couches synthétisées : donnent du poids aux gros sorts (les sons d'origine sont courts et légers).
let _noise=null,_thumpAt=0;
function noiseBuf(){ if(!_noise){const n=SND.ctx.sampleRate;_noise=SND.ctx.createBuffer(1,n,n);const d=_noise.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1} return _noise }
function synThump(vol,f0,f1,dur,bus){
  if(!SND.ctx||vol<=0)return; const c=SND.ctx,t=c.currentTime; if(t-_thumpAt<.03)return; _thumpAt=t;
  const o=c.createOscillator(),g=c.createGain(); o.type="sine"; o.frequency.setValueAtTime(f0,t); o.frequency.exponentialRampToValueAtTime(Math.max(20,f1),t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.008); g.gain.exponentialRampToValueAtTime(.001,t+dur); o.connect(g); g.connect(SND.bus[bus||"fight"]); o.start(t); o.stop(t+dur+.05);
}
function synNoise(vol,dur,f0,f1,q,type,bus){
  if(!SND.ctx||vol<=0)return; const c=SND.ctx,t=c.currentTime, s=c.createBufferSource(), fl=c.createBiquadFilter(), g=c.createGain();
  s.buffer=noiseBuf(); s.loop=true; fl.type=type||"bandpass"; fl.Q.value=q||1; fl.frequency.setValueAtTime(f0,t); fl.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+Math.min(.03,dur/3)); g.gain.exponentialRampToValueAtTime(.001,t+dur); s.connect(fl); fl.connect(g); g.connect(SND.bus[bus||"fight"]); s.start(t); s.stop(t+dur+.05);
}
const SFX_BEAM={gleam:1,fcannon:1,tbolt:1,psy:1}, SFX_QUAKE={quake:1,rslide:1};
function sfxCast(e,id){
  if(NET.host&&e===player)NET.send({t:"sfxc",id},true);
  const m=SFX_MAP[id], k=e===player?1:.75, pw=(SPL[id]&&SPL[id].power)||0;
  if(m)sfx(m.cast,"fight",k,null,e.x);
  if(pw>0){ synNoise(.10+pw/260,.22+pw/300,1800,220,.9,"bandpass"); } // souffle du lancer, plus long pour les gros sorts
  if(SFX_BEAM[id]){ synNoise(.22,.55,3200,500,2.5,"bandpass"); synThump(.4,160,60,.4) }
  if(SFX_QUAKE[id]){ synNoise(.5,1.1,260,60,.8,"lowpass"); synThump(.9,70,28,.9); sfx(750,"fight",.8,.8) }
  if(id==="tun"||(typeof RUSHES!=="undefined"&&RUSHES[id])){ synNoise(.25,.4,2200,300,1,"bandpass"); synThump(.4,120,50,.3) }
}
function sfxHit(att,tgt,spell,dmg){
  const id=sfxSpellId(spell), m=SFX_MAP[id]||{}, k=typeMult(spell.type,tgt.sp.types);
  const base=k>1.01?336:(k<.99?338:337);
  const r=Math.min(.35,(dmg||0)/(tgt.maxHp||100)), v=tgt===player?1:.9;
  sfx(m.hit||base,"fight",v,null,tgt.x);
  synThump(.35+r*2.2,150+r*60,45,.18+r*.6); synNoise(.12+r,.12+r*.5,4000,800,.7,"bandpass");
  if(r>.1)sfx(336,"fight",.7,.8,tgt.x); // gros dégât : impact lourd en plus
  if(m.hit&&m.hit!==base&&k>1.01)sfx(336,"fight",.5);
}
// Action impossible (sort en recharge, pas assez de PP) : un son du jeu d'origine (307), plus grave et discret, jamais plus d'un toutes les 0,3 s
let _denyAt=0;
function sfxDeny(){ const n=performance.now(); if(n-_denyAt<300)return; _denyAt=n; try{sfx(307,"ui",.8,.55)}catch(_){} }
function sfxUI(k){ sfx(SFX_UI[k],k==="click"||k==="go"||k==="win"?"ui":"fight",k==="shield"?.5:1) }
// Jauges du menu pause
function initVolumeUI(){
  [["vMaster","master"],["vMusic","music"],["vFight","fight"],["vUi","ui"]].forEach(([id,key])=>{
    const el=document.getElementById(id); if(!el)return;
    el.value=Math.round(SND.vol[key]*100); const lab=document.getElementById(id+"V"); if(lab)lab.textContent=el.value+"%";
    el.addEventListener("input",()=>{SND.vol[key]=el.value/100;if(lab)lab.textContent=el.value+"%";sndInit();sndApply();sndSave()});
    el.addEventListener("change",()=>{sndInit();if(key!=="music")sfxUI(key==="ui"?"click":"shield")});
  });
}
document.addEventListener("pointerdown",sndInit,{once:true});
document.addEventListener("keydown",sndInit,{once:true});
document.addEventListener("click",e=>{const b=e.target.closest("#menu button, #pause button, .tools button");if(b)sfxUI(b.id==="go"?"go":"click")});
initVolumeUI();

// Pas silencieux pour ceux qui volent ou lévitent (type Vol, Ectoplasma, Lugulabre)
const NO_STEPS=e=>!!(e.sp&&(e.sp.types.includes("flying")||e.key==="gengar"||e.key==="chandelure"));
// Pas : bruit de terre étouffé + petit choc, plus grave et plus fort pour les gros Aces, alterne les pieds.
function sfxStep(e){
  if(!SND.ctx||menuOpen||paused||NO_STEPS(e))return; e.stepN=(e.stepN||0)+1;
  const heavy=Math.min(1.4,(e.sp.body||14)/16), k=(e===player?.30:.18)*(.8+heavy*.4), alt=e.stepN%2?1:.88;
  synNoise(k*1.6,.07+heavy*.03,900*alt,250,.7,"lowpass");
  synThump(k*1.3,(120-heavy*30)*alt,45,.09+heavy*.04);
}

// ---- Musique : boucle chiptune originale (synthétisée), une version calme pour le menu et une rapide pour le combat. ----
const MUS={mode:null,timer:null,step:0,next:0,pulse:null};
const MUS_CH=[[45,57,60,64],[41,53,57,60],[48,55,60,64],[43,55,59,62],[45,57,60,64],[41,53,57,60],[40,52,56,59],[40,52,56,59]]; // basse + accord (La mineur)
const MUS_LEAD=[[76,0,72,76,81,0,79,76],[77,0,72,77,81,0,77,72],[76,0,72,76,79,0,76,72],[74,0,71,74,79,0,74,71],
                [81,0,76,81,84,0,81,76],[77,79,81,77,84,81,79,77],[80,0,76,80,83,0,80,76],[83,81,80,76,71,0,0,0]];
const mHz=n=>440*Math.pow(2,(n-69)/12);
function musPulse(){ if(!MUS.pulse){const N=32,re=new Float32Array(N),im=new Float32Array(N);for(let n=1;n<N;n++)re[n]=2/(n*Math.PI)*Math.sin(n*Math.PI*.25);MUS.pulse=SND.ctx.createPeriodicWave(re,im)} return MUS.pulse }
function musNote(type,hz,t,dur,vol){
  const c=SND.ctx,o=c.createOscillator(),g=c.createGain(); if(type==="pulse")o.setPeriodicWave(musPulse());else o.type=type; o.frequency.value=hz;
  g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+.006); g.gain.setValueAtTime(vol,t+dur*.6); g.gain.linearRampToValueAtTime(0,t+dur);
  o.connect(g); g.connect(SND.bus.music); o.start(t); o.stop(t+dur+.02);
}
function musDrum(kind,t,vol){
  const c=SND.ctx;
  if(kind==="k"){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.14);o.connect(g);g.connect(SND.bus.music);o.start(t);o.stop(t+.16);return}
  const s=c.createBufferSource(),fl=c.createBiquadFilter(),g=c.createGain(); s.buffer=noiseBuf(); fl.type="highpass"; fl.frequency.value=kind==="s"?1500:6000;
  const d=kind==="s"?.12:.04; g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.001,t+d); s.connect(fl); fl.connect(g); g.connect(SND.bus.music); s.start(t); s.stop(t+d+.02);
}
function musStep(s,t,sp,calm){
  const bar=Math.floor(s/16)%(calm?8:16), pos=s%16, ch=MUS_CH[bar%8];
  if(pos%2===0){ // basse sur les croches
    const r=ch[0]; musNote("triangle",mHz(pos%4===2?r+12:r),t,sp*1.8,.22);
  }
  if(bar<8){ if(pos%2===0){const n=MUS_LEAD[bar][pos/2]; if(n)musNote("pulse",mHz(n),t,sp*1.8,calm?.07:.10)} }
  else { const a=[ch[1],ch[2],ch[3],ch[2]+12][pos%4]+12; musNote("pulse",mHz(a),t,sp*.9,.07) }
  if(!calm){
    if(pos%8===0||pos===10)musDrum("k",t,.5);
    if(pos%8===4)musDrum("s",t,.22);
    if(pos%2===0)musDrum("h",t,.07);
  }else if(pos%4===0)musDrum("h",t,.03);
}
function musTick(){
  if(!SND.ctx||!MUS.mode)return; const calm=MUS.mode==="menu", sp=60/(calm?100:158)/4;
  while(MUS.next<SND.ctx.currentTime+.25){ musStep(MUS.step,MUS.next,sp,calm); MUS.step=(MUS.step+1)%256; MUS.next+=sp }
}
function musicSet(mode){
  if(!SND.ctx||MUS.mode===mode)return; MUS.mode=mode; MUS.step=0; MUS.next=SND.ctx.currentTime+.08;
  if(!MUS.timer)MUS.timer=setInterval(musTick,40);
}
function musicDuck(v){ SND.duck=v; sndApply() }
