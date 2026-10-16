// Cloudflare Worker + Durable Object (offre gratuite) : un seul objet "main" porte tout l'état du classement.
import {Ranked} from "./core.js";
import {route} from "./routes.js";
const CORS={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};

export class Arena{
  constructor(state){
    this.state=state; this.core=new Ranked({persist:(k,v)=>{v===undefined?state.storage.delete(k):state.storage.put(k,v)}});
    state.blockConcurrencyWhile(async()=>{this.core.load(await state.storage.list())});
  }
  async fetch(req){
    const out=route(this.core,req.method,new URL(req.url).pathname,req.method==="POST"?await req.text():"",req.headers.get("cf-connecting-ip")||"");
    if(Math.random()<.02)this.core.cleanup();
    return new Response(JSON.stringify(out.body),{status:out.status,headers:{...CORS,"content-type":"application/json"}});
  }
}
export default{
  async fetch(req,env){
    if(req.method==="OPTIONS")return new Response(null,{status:204,headers:CORS});
    const url=new URL(req.url);
    if(!url.pathname.startsWith("/api/"))return new Response("Aces Arena classement",{headers:CORS});
    return env.ARENA.get(env.ARENA.idFromName("main")).fetch(req);
  }
};
