// ===== Musique par fichier : un contexte = une piste qui boucle (voir docs/MUSIQUE.md) =====
// Ajouter une piste : déposer le fichier dans music/ (à côté de index.html) et ajouter UNE ligne ci-dessous.
// Clés : "battle" (tous les combats), "menu", ou "battle:<id d'arène>" pour une arène précise (ex. "battle:glace").
// Sans ligne pour un contexte, l'écran garde son comportement actuel (chiptune synthétisé). Aucune musique dynamique, rien n'est synchronisé en réseau.
const MUSIC_TRACKS={
  menu:"music/lobby.ogg",    // lobby et menus : chaleureux, synthés et basse (tools/music/gen_lobby.py)
  battle:"music/donjon.ogg", // combats : cuivres, cordes staccato, timbales, esprit « donjon » (tools/music/gen_donjon.py)
};
const MUSIC_FADE=1; // secondes de fondu à l'entrée et à la sortie
const MFILE={key:null,src:null,gain:null,buf:{},bad:{},want:null,fading:false};
function musicTrackFor(mode){
  const a=typeof ARENA_PICK!=="undefined"?ARENA_PICK:"", ks=[mode+":"+a,mode];
  for(const k of ks)if(MUSIC_TRACKS[k])return {key:k,url:MUSIC_TRACKS[k]};
  return null;
}
function musicFileStop(fade){
  const s=MFILE.src, g=MFILE.gain; MFILE.src=null; MFILE.gain=null; MFILE.key=null; MFILE.want=null; MFILE.fading=false;
  if(!s)return; const t=SND.ctx.currentTime, f=Math.max(.02,fade||0);
  try{g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0,t+f); s.stop(t+f+.05)}catch(_){}
}
function musicFileStart(tr){
  const b=MFILE.buf[tr.url]; if(!b||!SND.ctx)return;
  musicFileStop(.3);
  if(SND.ctx.state==="suspended")SND.ctx.resume();
  const c=SND.ctx, src=c.createBufferSource(), g=c.createGain(), t=c.currentTime;
  src.buffer=b; src.loop=true; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(1,t+MUSIC_FADE);
  src.connect(g); g.connect(SND.bus.music); src.start(t);
  MFILE.src=src; MFILE.gain=g; MFILE.key=tr.url; MFILE.want=tr.url; MFILE.fading=false;
  MUS.mode=null; // le chiptune se tait (musTick sort tout de suite)
}
function musicFileLoad(tr,then){
  if(MFILE.buf[tr.url]){then();return}
  if(MFILE.loading&&MFILE.loading[tr.url])return;
  (MFILE.loading=MFILE.loading||{})[tr.url]=true;
  fetch(tr.url).then(r=>{if(!r.ok)throw new Error(r.status);return r.arrayBuffer()})
    .then(ab=>new Promise((ok,ko)=>SND.ctx.decodeAudioData(ab,ok,ko)))
    .then(buf=>{MFILE.buf[tr.url]=buf; delete MFILE.loading[tr.url]; then()})
    .catch(()=>{MFILE.bad[tr.url]=true; delete MFILE.loading[tr.url]}); // fichier absent ou illisible (ex. file://) : le chiptune reste
}
{const _musicSet=musicSet;
  musicSet=function(mode){
    if(!SND.ctx)return;
    const tr=musicTrackFor(mode);
    if(tr&&!MFILE.bad[tr.url]){
      if(MFILE.key===tr.url&&MFILE.src)return; // déjà en cours
      if(MFILE.buf[tr.url]){musicFileStart(tr);return}
      MFILE.want=tr.url; _musicSet(mode); // en attendant le chargement, le chiptune joue
      musicFileLoad(tr,()=>{if(MFILE.want===tr.url)musicFileStart(tr)}); // want est remis à zéro si le contexte a changé entre-temps
      return;
    }
    musicFileStop(MUSIC_FADE); _musicSet(mode);
  };}
// écran de résultat : fondu de sortie, la musique du menu reprend au retour au menu
setInterval(()=>{ if(MFILE.src&&!MFILE.fading&&typeof endShown!=="undefined"&&endShown){MFILE.fading=true; musicFileStop(MUSIC_FADE); MFILE.fading=false} },250);
// coupure de la musique, séparée du curseur de volume (et des bruitages)
{const el=document.getElementById("vMusic"); if(el&&el.parentNode){
  const lab=document.createElement("label"); lab.className="mmute"; lab.style.cssText="display:flex!important;gap:8px;align-items:center;justify-content:flex-start!important;justify-self:start;grid-column:1/-1;text-align:left;margin:2px 0 6px;font-size:13px";
  lab.innerHTML='<input type="checkbox" id="vMusicMute"> <span>Couper la musique</span>';
  el.parentNode.insertBefore(lab,el.nextSibling);
  const cb=lab.querySelector("input"); cb.checked=!!SND.muteMusic;
  cb.addEventListener("change",()=>{SND.muteMusic=cb.checked; try{localStorage.setItem("sndMuteMusic",cb.checked?"1":"0")}catch(_){} sndInit(); sndApply()});
}}
