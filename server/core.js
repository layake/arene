// Cœur du classement : file d'attente, appariement par niveau, validation des résultats et Elo.
// Pur JavaScript sans dépendance : tourne dans un Durable Object Cloudflare (worker.js) et dans Node (dev.js, tests).
export const START_ELO=1200, ELO_FLOOR=100;
export const QUEUE_STALE_MS=6000;      // sans nouvelle de lui depuis 6 s, un joueur quitte la file
export const ASSIGN_TTL_MS=90000;      // un appariement non retiré reste redonné 90 s (réponse perdue)
export const MIN_MATCH_MS=20000;       // un résultat avant 20 s est refusé
export const SOLO_REPORT_MS=45000;     // un seul rapport suffit si l'autre ne répond pas pendant 45 s
export const MATCH_TTL_MS=15*60*1000;
const ALPHA="ABCDEFGHJKLMNPQRSTUVWXYZ";

export class HttpError extends Error{constructor(status,msg){super(msg);this.status=status}}
const bad=(msg,status=400)=>{throw new HttpError(status,msg)};
const hex=n=>{const a=new Uint8Array(n);crypto.getRandomValues(a);return [...a].map(b=>b.toString(16).padStart(2,"0")).join("")};
const rcode=()=>{const a=new Uint8Array(6);crypto.getRandomValues(a);return [...a].map(b=>ALPHA[b%ALPHA.length]).join("")};

// Elo : probabilité de victoire attendue puis ajustement. K = 40 pendant les 20 premières parties, 20 ensuite.
export const kFactor=games=>games<20?40:20;
export const expected=(ra,rb)=>1/(1+Math.pow(10,(rb-ra)/400));
export function eloDelta(ra,gamesA,rb,scoreA){return Math.round(kFactor(gamesA)*(scoreA-expected(ra,rb)))}

export function cleanName(raw){
  const n=String(raw||"").normalize("NFC").replace(/\s+/g," ").trim();
  if(n.length<2||n.length>16)bad("Le pseudo doit faire 2 à 16 caractères");
  if(!/^[\p{L}\p{N} _.-]+$/u.test(n))bad("Pseudo : lettres, chiffres, espace, _ . - seulement");
  return n;
}

export class Ranked{
  // persist(clé, valeur|undefined) est appelée à chaque changement durable ; now() renvoie des millisecondes.
  constructor({persist=()=>{},now=()=>Date.now()}={}){
    this.persist=persist; this.now=now;
    this.players=new Map(); this.names=new Map(); this.matches=new Map();
    this.queue=[]; this.assigned=new Map(); this.lbDirty=true; this.lb=[];
  }
  load(entries){ // entrées {clé: valeur} relues du stockage
    for(const [k,v] of entries){
      if(k.startsWith("p:")){this.players.set(v.id,v); this.names.set(v.name.toLowerCase(),v.id)}
      else if(k.startsWith("m:"))this.matches.set(v.id,v);
    }
  }
  auth(id,token){const p=this.players.get(String(id||"")); if(!p||p.token!==token)bad("Identifiants invalides",401); return p}
  savePlayer(p){this.persist("p:"+p.id,p); this.lbDirty=true}
  saveMatch(m){this.persist("m:"+m.id,m)}
  pub(p){return {id:p.id,name:p.name,elo:p.elo,games:p.games,wins:p.wins,losses:p.losses}}

  register(name){
    const n=cleanName(name);
    if(this.names.has(n.toLowerCase()))bad("Pseudo déjà pris",409);
    const p={id:hex(4),token:hex(16),name:n,elo:START_ELO,games:0,wins:0,losses:0,disputes:0,created:this.now()};
    this.players.set(p.id,p); this.names.set(n.toLowerCase(),p.id); this.savePlayer(p);
    return {...this.pub(p),token:p.token};
  }
  me(id,token){return this.pub(this.auth(id,token))}

  // --- file d'attente : le client appelle toutes les ~2 s ---
  tolerance(waitedMs){return 100+50*Math.floor(waitedMs/5000)}
  queuePoll(id,token,fresh){
    const p=this.auth(id,token), t=this.now();
    if(fresh)this.assigned.delete(p.id); // nouvelle recherche : on oublie l'ancien appariement
    const mine=this.assigned.get(p.id);
    // idempotent : si la réponse précédente s'est perdue, le joueur retrouve le même combat
    if(mine){const m=this.matches.get(mine); if(m&&!m.done&&t-m.created<ASSIGN_TTL_MS)return this.matchInfo(m,p.id); this.assigned.delete(p.id)}
    const old=this.queue.find(e=>e.id===p.id);
    this.queue=this.queue.filter(e=>e.id!==p.id&&t-e.last<=QUEUE_STALE_MS);
    let me=old&&t-old.last<=QUEUE_STALE_MS?old:null;
    me={id:p.id,elo:p.elo,since:me?me.since:t,last:t};
    // l'adversaire acceptable le plus proche en niveau ; la tolérance de chacun grandit avec l'attente
    let best=null;
    for(const e of this.queue){
      const diff=Math.abs(e.elo-me.elo), tol=Math.max(this.tolerance(t-e.since),this.tolerance(t-me.since));
      if(diff<=tol&&(!best||diff<best.diff))best={e,diff};
    }
    if(!best){this.queue.push(me); return {status:"waiting",waited:Math.round((t-me.since)/1000),range:this.tolerance(t-me.since),size:this.queue.length}}
    this.queue=this.queue.filter(e=>e!==best.e);
    const host=this.players.get(best.e.id), guest=p;
    const m={id:hex(6),code:rcode(),host:host.id,guest:guest.id,created:t,reports:{},done:false,result:null};
    this.matches.set(m.id,m); this.saveMatch(m);
    this.assigned.set(host.id,m.id); this.assigned.set(guest.id,m.id); // l'hôte l'apprend à son prochain appel
    return this.matchInfo(m,guest.id);
  }
  queueLeave(id,token){const p=this.auth(id,token); this.queue=this.queue.filter(e=>e.id!==p.id); this.assigned.delete(p.id); return {status:"left"}}
  matchInfo(m,forId){
    const oppId=m.host===forId?m.guest:m.host, o=this.players.get(oppId);
    return {status:"matched",matchId:m.id,code:m.code,role:m.host===forId?"host":"guest",opp:{name:o.name,elo:o.elo}};
  }

  // --- résultats ---
  report(id,token,matchId,result){
    const p=this.auth(id,token), m=this.matches.get(String(matchId||""));
    if(!m||(m.host!==p.id&&m.guest!==p.id))bad("Combat inconnu",404);
    if(result!=="win"&&result!=="loss")bad("Résultat invalide");
    if(m.done)return this.resultOf(m,p.id);
    const t=this.now();
    if(t-m.created<MIN_MATCH_MS)bad("Résultat trop tôt");
    if(!m.reports[p.id]){m.reports[p.id]=result; m.firstRep=m.firstRep||t; this.saveMatch(m)}
    this.settle(m);
    return this.resultOf(m,p.id);
  }
  result(id,token,matchId){
    const p=this.auth(id,token), m=this.matches.get(String(matchId||""));
    if(!m||(m.host!==p.id&&m.guest!==p.id))bad("Combat inconnu",404);
    if(!m.done)this.settle(m);
    return this.resultOf(m,p.id);
  }
  settle(m){
    if(m.done)return;
    const t=this.now(), r=m.reports, ids=Object.keys(r);
    let winner=null;
    if(ids.length===2){
      if(r[m.host]===r[m.guest]){ // deux victoires ou deux défaites : litige, aucun changement
        m.done=true; m.result="disputed";
        for(const i of ids){const p=this.players.get(i); p.disputes=(p.disputes||0)+1; this.savePlayer(p)}
        this.saveMatch(m); return;
      }
      winner=r[m.host]==="win"?m.host:m.guest;
    }else if(ids.length===1&&t-m.firstRep>=SOLO_REPORT_MS){
      winner=r[ids[0]]==="win"?ids[0]:(ids[0]===m.host?m.guest:m.host);
    }
    if(!winner)return;
    const loser=winner===m.host?m.guest:m.host, W=this.players.get(winner), L=this.players.get(loser);
    const dW=eloDelta(W.elo,W.games,L.elo,1), dL=eloDelta(L.elo,L.games,W.elo,0);
    m.done=true; m.result="done"; m.winner=winner; m.change={[winner]:{from:W.elo,to:W.elo+dW},[loser]:{from:L.elo,to:Math.max(ELO_FLOOR,L.elo+dL)}};
    W.elo+=dW; W.games++; W.wins++; L.elo=Math.max(ELO_FLOOR,L.elo+dL); L.games++; L.losses++;
    this.savePlayer(W); this.savePlayer(L); this.saveMatch(m);
  }
  resultOf(m,forId){
    if(!m.done)return {status:"pending"};
    if(m.result==="disputed")return {status:"disputed"};
    const c=m.change[forId];
    return {status:"done",won:m.winner===forId,from:c.from,to:c.to,delta:c.to-c.from};
  }

  leaderboard(limit=50){
    if(this.lbDirty){this.lb=[...this.players.values()].filter(p=>p.games>0).sort((a,b)=>b.elo-a.elo||b.games-a.games||a.name.localeCompare(b.name)); this.lbDirty=false}
    return this.lb.slice(0,Math.min(100,limit)).map((p,i)=>({rank:i+1,name:p.name,elo:p.elo,games:p.games,wins:p.wins}));
  }
  cleanup(){ // supprime les combats anciens sans résultat
    const t=this.now();
    for(const [id,m] of this.matches)if(t-m.created>MATCH_TTL_MS){this.matches.delete(id); this.persist("m:"+id,undefined)}
  }
}
