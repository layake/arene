// Routage HTTP commun à worker.js et dev.js : renvoie {status, body}.
import {HttpError} from "./core.js";
export const SERVER_VERSION="rank-2026.10.16b"; // à changer à chaque modification du serveur
export function route(core,method,path,raw){
  try{
    let b={}; if(method==="POST"){try{b=raw?JSON.parse(raw):{}}catch(_){throw new HttpError(400,"JSON invalide")}}
    const ok=body=>({status:200,body});
    if(method==="POST"&&path==="/api/register")return ok(core.register(b.name));
    if(method==="POST"&&path==="/api/me")return ok(core.me(b.id,b.token));
    if(method==="POST"&&path==="/api/queue")return ok(core.queuePoll(b.id,b.token,!!b.fresh));
    if(method==="POST"&&path==="/api/queue/leave")return ok(core.queueLeave(b.id,b.token));
    if(method==="POST"&&path==="/api/report")return ok(core.report(b.id,b.token,b.matchId,b.result));
    if(method==="POST"&&path==="/api/result")return ok(core.result(b.id,b.token,b.matchId));
    if(method==="GET"&&path==="/api/leaderboard")return ok(core.leaderboard(50));
    if(method==="GET"&&path==="/api/health")return ok({ok:true,version:SERVER_VERSION});
    return {status:404,body:{error:"Introuvable"}};
  }catch(e){
    if(e instanceof HttpError)return {status:e.status,body:{error:e.message}};
    return {status:500,body:{error:"Erreur serveur"}};
  }
}
