// Serveur local pour développer et tester : node server/dev.js [port]   (mêmes routes que worker.js, état en mémoire)
import http from "node:http";
import {Ranked,HttpError} from "./core.js";
import {route} from "./routes.js";
const core=new Ranked();
setInterval(()=>core.cleanup(),60000).unref();
http.createServer((req,res)=>{
  const cors={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"GET,POST,OPTIONS"};
  if(req.method==="OPTIONS"){res.writeHead(204,cors);return res.end()}
  let body=""; req.on("data",c=>body+=c); req.on("end",()=>{
    const out=route(core,req.method,new URL(req.url,"http://x").pathname,body);
    res.writeHead(out.status,{...cors,"content-type":"application/json"}); res.end(JSON.stringify(out.body));
  });
}).listen(+process.argv[2]||8787,()=>console.log("classement local sur le port",+process.argv[2]||8787));
