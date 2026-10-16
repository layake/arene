// Tests du cœur du classement : node tests/server.test.mjs
import assert from "node:assert/strict";
import {Ranked,eloDelta,expected,cleanName,START_ELO,MIN_MATCH_MS,SOLO_REPORT_MS,HttpError} from "../server/core.js";
import {route} from "../server/routes.js";
let t=1e6; const core=()=>new Ranked({now:()=>t});
let n=0; const ok=(name,f)=>{try{f();n++;console.log("OK   "+name)}catch(e){console.log("FAIL "+name+"\n"+e.stack);process.exitCode=1}};
const throws=(f,status)=>assert.throws(f,e=>e instanceof HttpError&&(!status||e.status===status));

ok("Elo : deux joueurs égaux, K=40, +20/-20",()=>{assert.equal(eloDelta(1200,0,1200,1),20);assert.equal(eloDelta(1200,0,1200,0),-20)});
ok("Elo : K=20 après 20 parties",()=>assert.equal(eloDelta(1200,20,1200,1),10));
ok("Elo : battre plus fort rapporte plus",()=>assert.ok(eloDelta(1200,30,1400,1)>eloDelta(1200,30,1200,1)));
ok("Elo : probabilité attendue 400 points d'écart ~ 0.91",()=>assert.ok(Math.abs(expected(1600,1200)-0.909)<.001));
ok("pseudo : refuse trop court, caractères spéciaux",()=>{throws(()=>cleanName("a"),400);throws(()=>cleanName("<script>"),400);assert.equal(cleanName("  Lay  Ake "),"Lay Ake")});

ok("inscription : pseudo unique (insensible à la casse)",()=>{const c=core();const a=c.register("Lancelot");assert.equal(a.elo,START_ELO);throws(()=>c.register("lancelot"),409)});
ok("authentification : mauvais jeton refusé",()=>{const c=core();const a=c.register("Alice");throws(()=>c.me(a.id,"faux"),401)});

ok("pseudo : mots interdits refusés (même déguisés)",()=>{throws(()=>cleanName("N4zi"),400);throws(()=>cleanName("xX_Hitler_Xx"),400);assert.equal(cleanName("Lancelot"),"Lancelot")});
ok("limite : 5 comptes par heure et par adresse, puis ça repasse",()=>{
  const c=core(); for(let i=0;i<5;i++)c.register("Joueur"+i,"1.2.3.4"); throws(()=>c.register("Joueur9","1.2.3.4"),429);
  c.register("Autre","5.6.7.8"); t+=3600001; c.register("Joueur9","1.2.3.4")});
ok("limite : 300 requêtes par minute et par adresse",()=>{const c=core(); for(let i=0;i<300;i++)c.limit("9.9.9.9","all",300,60000); throws(()=>c.limit("9.9.9.9","all",300,60000),429); t+=60001; c.limit("9.9.9.9","all",300,60000)});
function pair(c,a,b){ // a attend, b arrive, a récupère son appariement
  const w=c.queuePoll(a.id,a.token); assert.equal(w.status,"waiting");
  const mb=c.queuePoll(b.id,b.token); assert.equal(mb.status,"matched");
  const ma=c.queuePoll(a.id,a.token); assert.equal(ma.status,"matched");
  return {ma,mb};
}
ok("file : réponse perdue, l'appariement est redonné aux deux joueurs",()=>{
  const c=core(),a=c.register("Alice"),b=c.register("Bob"); const {ma,mb}=pair(c,a,b);
  const ma2=c.queuePoll(a.id,a.token), mb2=c.queuePoll(b.id,b.token);
  assert.equal(ma2.matchId,ma.matchId); assert.equal(mb2.matchId,mb.matchId); assert.equal(ma2.role,"host"); assert.equal(mb2.role,"guest");
});
ok("file : nouvelle recherche (fresh) oublie l'ancien appariement",()=>{
  const c=core(),a=c.register("Alice"),b=c.register("Bob"); pair(c,a,b);
  assert.equal(c.queuePoll(a.id,a.token,true).status,"waiting");
  assert.equal(c.queuePoll(b.id,b.token,true).status,"matched");
});
ok("file : deux joueurs proches sont appariés, hôte = celui qui attendait",()=>{
  const c=core(),a=c.register("Alice"),b=c.register("Bob"); const {ma,mb}=pair(c,a,b);
  assert.equal(ma.role,"host");assert.equal(mb.role,"guest");assert.equal(ma.code,mb.code);assert.equal(ma.matchId,mb.matchId);assert.equal(ma.opp.name,"Bob")});
ok("file : joueurs trop éloignés ne s'apparient pas tout de suite, puis la tolérance grandit",()=>{
  const c=core(),a=c.register("Alice"),b=c.register("Bob"); c.players.get(b.id).elo=1600;
  assert.equal(c.queuePoll(a.id,a.token).status,"waiting");
  for(let i=0;i<4;i++){t+=2000;assert.equal(c.queuePoll(b.id,b.token).status,"waiting");c.queuePoll(a.id,a.token)}
  let m=null; for(let i=0;i<40&&!m;i++){t+=2000;c.queuePoll(a.id,a.token);const r=c.queuePoll(b.id,b.token);if(r.status==="matched")m=r}
  assert.ok(m,"fini par apparier");assert.ok(t>1e6+20000)});
ok("file : prend l'adversaire le plus proche",()=>{
  const c=core(),a=c.register("Aa"),b=c.register("Bb"),d=c.register("Dd");
  c.players.get(a.id).elo=1200;c.players.get(b.id).elo=1350;c.players.get(d.id).elo=1270;
  c.queuePoll(a.id,a.token);c.queuePoll(b.id,b.token);const r=c.queuePoll(d.id,d.token);assert.equal(r.status,"matched");assert.equal(r.opp.name,"Aa")});
ok("file : un joueur absent depuis 6 s est retiré",()=>{
  const c=core(),a=c.register("Alice"),b=c.register("Bob"); c.queuePoll(a.id,a.token); t+=10000; assert.equal(c.queuePoll(b.id,b.token).status,"waiting")});
ok("file : on ne s'apparie pas avec soi-même",()=>{const c=core(),a=c.register("Alice");c.queuePoll(a.id,a.token);assert.equal(c.queuePoll(a.id,a.token).status,"waiting")});
ok("file : quitter la file",()=>{const c=core(),a=c.register("Alice"),b=c.register("Bob");c.queuePoll(a.id,a.token);c.queueLeave(a.id,a.token);assert.equal(c.queuePoll(b.id,b.token).status,"waiting")});

function match(c){const a=c.register("Alice"+Math.random().toString(36).slice(2,5)),b=c.register("Bob"+Math.random().toString(36).slice(2,5));const {ma}=pair(c,a,b);return {a,b,id:ma.matchId}}
ok("résultat : refusé avant 20 s",()=>{const c=core(),{a,id}=match(c);throws(()=>c.report(a.id,a.token,id,"win"),400)});
ok("résultat : deux rapports concordants appliquent l'Elo",()=>{
  const c=core(),{a,b,id}=match(c); t+=MIN_MATCH_MS+1;
  assert.equal(c.report(a.id,a.token,id,"win").status,"pending");
  const rb=c.report(b.id,b.token,id,"loss"); assert.equal(rb.status,"done");assert.equal(rb.delta,-20);
  const ra=c.result(a.id,a.token,id); assert.equal(ra.to,1220);assert.equal(c.me(a.id,a.token).wins,1);assert.equal(c.me(b.id,b.token).losses,1)});
ok("résultat : deux victoires déclarées = litige, rien ne change",()=>{
  const c=core(),{a,b,id}=match(c); t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"win"); const r=c.report(b.id,b.token,id,"win");
  assert.equal(r.status,"disputed");assert.equal(c.me(a.id,a.token).elo,1200);assert.equal(c.me(b.id,b.token).elo,1200)});
ok("résultat : un rapport seul n'est accepté qu'après 45 s",()=>{
  const c=core(),{a,b,id}=match(c); t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"win");
  assert.equal(c.result(b.id,b.token,id).status,"pending"); t+=SOLO_REPORT_MS;
  const r=c.result(b.id,b.token,id); assert.equal(r.status,"done");assert.equal(r.won,false)});
ok("résultat : un joueur qui déclare sa défaite seul est cru après 45 s",()=>{
  const c=core(),{a,b,id}=match(c); t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"loss"); t+=SOLO_REPORT_MS; assert.equal(c.result(b.id,b.token,id).won,true)});
ok("résultat : un tiers ne peut pas rapporter",()=>{const c=core(),{id}=match(c),z=c.register("Zed");t+=MIN_MATCH_MS+1;throws(()=>c.report(z.id,z.token,id,"win"),404)});
ok("résultat : rapport répété sans effet, Elo appliqué une seule fois",()=>{
  const c=core(),{a,b,id}=match(c); t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"win"); c.report(b.id,b.token,id,"loss"); c.report(a.id,a.token,id,"win"); c.report(b.id,b.token,id,"loss");
  assert.equal(c.me(a.id,a.token).elo,1220);assert.equal(c.me(a.id,a.token).games,1)});
ok("résultat : plancher à 100",()=>{
  const c=core(),{a,b,id}=match(c); c.players.get(b.id).elo=105; t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"win"); c.report(b.id,b.token,id,"loss"); assert.ok(c.me(b.id,b.token).elo>=100)});
ok("classement : trié par Elo, seulement ceux qui ont joué",()=>{
  const c=core(),{a,b,id}=match(c); c.register("Fantome"); t+=MIN_MATCH_MS+1; c.report(a.id,a.token,id,"win"); c.report(b.id,b.token,id,"loss");
  const lb=c.leaderboard(); assert.equal(lb.length,2);assert.equal(lb[0].rank,1);assert.ok(lb[0].elo>lb[1].elo)});
ok("persistance : l'état se recharge",()=>{
  const store=new Map(),c=new Ranked({now:()=>t,persist:(k,v)=>v===undefined?store.delete(k):store.set(k,structuredClone(v))});
  const a=c.register("Alice");const c2=new Ranked({now:()=>t});c2.load(store);assert.equal(c2.me(a.id,a.token).name,"Alice");throws(()=>c2.register("alice"),409)});
ok("routes : JSON invalide, route inconnue, erreurs HTTP",()=>{
  const c=core();assert.equal(route(c,"POST","/api/register","{").status,400);assert.equal(route(c,"GET","/nope","").status,404);
  const r=route(c,"POST","/api/register",JSON.stringify({name:"Zoé"}));assert.equal(r.status,200);assert.equal(route(c,"POST","/api/register",JSON.stringify({name:"zoé"})).status,409);
  assert.equal(route(c,"GET","/api/leaderboard","").status,200)});
console.log("\n"+n+" tests passés"+(process.exitCode?" (ÉCHECS)":""));
