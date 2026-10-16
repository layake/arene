/* ===== Effets sonores synthétisés par le code (aucun fichier audio, aucune licence à respecter) =====
   Chaque identifiant de son (voir snd_map.js) a une famille ; une variation déterministe par numéro les distingue. */
const SND_FAM={212:"win",306:"ui",307:"ui",336:"hit",337:"rock",344:"hit",355:"guard",362:"buff",392:"tele",402:"dash",414:"buff",416:"ko",420:"rock",602:"rock",604:"psy",614:"psy",623:"ice",631:"slash",651:"rock",653:"rock",657:"water",662:"fire",664:"ice",667:"psy",668:"psy",669:"fire",674:"fire",678:"slash",683:"bite",684:"bite",685:"elec",687:"rock",692:"psy",698:"hit",699:"poison",707:"slash",708:"guard",711:"fire",720:"hit",725:"bite",726:"slash",735:"slash",741:"poison",744:"buff",745:"slash",750:"rock",752:"rock",762:"hit",766:"buff",768:"buff",769:"psy",770:"ice",771:"psy",772:"psy",773:"psy",774:"elec",783:"ice",788:"beam",790:"ice",794:"psy",798:"water",801:"fire",803:"water",807:"poison",810:"buff",811:"buff",813:"rock",818:"hit",819:"slash",821:"psy",827:"rock",828:"ice",829:"ice",831:"poison",840:"buff",841:"hit",845:"guard",848:"slash",849:"fire",850:"guard",851:"beam",852:"guard",853:"guard",856:"psy",858:"fire",859:"water",860:"water",861:"water",862:"water",863:"water",864:"beam",873:"fire",876:"water",877:"rock",879:"slash",880:"slash",884:"guard",891:"psy",922:"rock"};
function sndRng(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
function sndTone(d,sr,o){ // oscillateur avec glissando exponentiel et enveloppe attaque/décroissance
  const t0=Math.floor((o.t||0)*sr),n=Math.floor(o.dur*sr),f0=o.f0,f1=o.f1||o.f0,att=Math.max(1,Math.floor((o.att||.004)*sr));let ph=0;
  for(let i=0;i<n&&t0+i<d.length;i++){
    const k=i/n,f=f0*Math.pow(f1/f0,k)*(1+(o.fm?Math.sin(i/sr*o.fm)*.04:0));ph+=f/sr;const p=ph%1;
    const v=o.type==="saw"?2*p-1:o.type==="sq"?(p<.5?1:-1):o.type==="tri"?4*Math.abs(p-.5)-1:Math.sin(6.2832*p);
    d[t0+i]+=v*(o.vol||.5)*Math.min(1,i/att)*Math.pow(1-k,o.curve||2);
  }
}
function sndNoise(d,sr,o,rnd){ // bruit filtré (passe-bas qui balaie lp0 vers lp1, passe-haut optionnel)
  const t0=Math.floor((o.t||0)*sr),n=Math.floor(o.dur*sr),att=Math.max(1,Math.floor((o.att||.004)*sr));let y=0,h=0;
  for(let i=0;i<n&&t0+i<d.length;i++){
    const k=i/n,fc=(o.lp0||4000)*Math.pow((o.lp1||o.lp0||4000)/(o.lp0||4000),k),a=Math.min(.95,6.2832*fc/sr);
    y+=a*((rnd()*2-1)-y); if(o.hp){h+=Math.min(.95,6.2832*o.hp/sr)*(y-h)}
    d[t0+i]+=(y-(o.hp?h:0))*(o.vol||.5)*(o.hp?2.2:1.6)*Math.min(1,i/att)*Math.pow(1-k,o.curve||2);
  }
}
const SND_REC={
  hit:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.1,lp0:3200,lp1:300,vol:.7},r);sndTone(d,sr,{dur:.16,f0:170*v,f1:50,vol:.8})},
  slash:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.2,lp0:9000,lp1:2500*v,hp:1500,vol:.6,att:.02,curve:1.4},r);sndTone(d,sr,{dur:.12,f0:2200*v,f1:700,vol:.15})},
  bite:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.05,lp0:4000,lp1:800,vol:.7},r);sndNoise(d,sr,{t:.07,dur:.06,lp0:3000,lp1:500,vol:.8},r);sndTone(d,sr,{t:.07,dur:.14,f0:200*v,f1:80,vol:.5})},
  fire:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.55,lp0:500,lp1:2600*v,vol:.6,att:.12,curve:1.2},r);for(let i=0;i<14;i++)sndNoise(d,sr,{t:r()*.5,dur:.015,lp0:6000,lp1:2000,vol:.5},r);sndTone(d,sr,{dur:.5,f0:90*v,f1:160,type:"saw",vol:.2,att:.1})},
  water:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.5,lp0:1400*v,lp1:2800,hp:350,vol:.5,att:.08,curve:1.3},r);for(let i=0;i<5;i++){const f=500+r()*700;sndTone(d,sr,{t:r()*.4,dur:.09,f0:f,f1:f*1.6,vol:.25})}},
  ice:(d,sr,r,v)=>{[2200,2900,3700,4600].forEach((f,i)=>sndTone(d,sr,{t:i*.05,dur:.32,f0:f*v,vol:.22,curve:2.5}));sndNoise(d,sr,{dur:.2,lp0:9000,lp1:6000,hp:4000,vol:.4},r)},
  elec:(d,sr,r,v)=>{let t=0;while(t<.34){sndTone(d,sr,{t,dur:.02,f0:(300+r()*1500)*v,type:"sq",vol:.3,curve:1});t+=.02}sndNoise(d,sr,{dur:.3,lp0:7000,lp1:3000,hp:2500,vol:.4},r)},
  psy:(d,sr,r,v)=>{sndTone(d,sr,{dur:.55,f0:420*v,f1:900*v,vol:.4,fm:38,att:.05,curve:1.2});sndTone(d,sr,{t:.04,dur:.5,f0:630*v,f1:300*v,vol:.25,fm:23,att:.05,curve:1.2})},
  rock:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.55,lp0:700,lp1:120,vol:.8,curve:1.5},r);sndTone(d,sr,{dur:.4,f0:95*v,f1:35,vol:.9})},
  beam:(d,sr,r,v)=>{sndTone(d,sr,{dur:.6,f0:300*v,f1:1300*v,type:"saw",vol:.3,att:.1,curve:1});sndNoise(d,sr,{dur:.55,lp0:3000,lp1:1200,hp:600,vol:.3,att:.1,curve:1},r)},
  poison:(d,sr,r,v)=>{for(let i=0;i<4;i++){const f=280+r()*260;sndTone(d,sr,{t:i*.06,dur:.12,f0:f*v,f1:f*1.5,type:"tri",vol:.4})}sndNoise(d,sr,{dur:.2,lp0:1500,lp1:500,vol:.3},r)},
  buff:(d,sr,r,v)=>{[523,659,784].forEach((f,i)=>sndTone(d,sr,{t:i*.07,dur:.3,f0:f*v,type:"tri",vol:.35,curve:2}))},
  guard:(d,sr,r,v)=>{sndTone(d,sr,{dur:.4,f0:1200*v,vol:.3,curve:3});sndTone(d,sr,{dur:.35,f0:1810*v,vol:.2,curve:3});sndNoise(d,sr,{dur:.04,lp0:7000,lp1:3000,vol:.5},r)},
  dash:(d,sr,r,v)=>{sndNoise(d,sr,{dur:.22,lp0:500,lp1:5000*v,hp:300,vol:.5,att:.05,curve:1},r)},
  tele:(d,sr,r,v)=>{sndTone(d,sr,{dur:.2,f0:1500,f1:200,vol:.3,curve:1});sndTone(d,sr,{t:.2,dur:.25,f0:200,f1:1700,vol:.3,curve:1.2})},
  ko:(d,sr,r,v)=>{sndTone(d,sr,{dur:.7,f0:520,f1:70,type:"saw",vol:.4,curve:1.4});sndNoise(d,sr,{dur:.3,lp0:2000,lp1:200,vol:.4},r)},
  win:(d,sr,r,v)=>{[523,659,784,1047].forEach((f,i)=>sndTone(d,sr,{t:i*.12,dur:i==3?.7:.25,f0:f,type:"tri",vol:.4,curve:1.6}))},
  ui:(d,sr,r,v)=>{sndTone(d,sr,{dur:.07,f0:900*v,f1:1300*v,type:"sq",vol:.18,curve:1.2})}
};
function sndRender(id){ // fabrique (une seule fois) le son d'un identifiant
  const ctx=SND.ctx,fam=SND_FAM[id]; if(!ctx||!fam||!SND_REC[fam])return null;
  const sr=ctx.sampleRate,r=sndRng(+id*2654435761),v=.88+(+id%13)/13*.28,n=Math.ceil(sr*(fam==="win"?1.1:.9)),b=ctx.createBuffer(1,n,sr),d=b.getChannelData(0);
  SND_REC[fam](d,sr,r,v);
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[i])); const g=pk>0?.85/pk:1; for(let i=0;i<n;i++)d[i]*=g;
  const f=Math.min(n,Math.floor(sr*.01));for(let i=0;i<f;i++)d[n-1-i]*=i/f; // fondu final anti-clic
  return b;
}
