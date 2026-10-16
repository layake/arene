// ---- Arènes : sol, forme, taille et obstacles (cosmétique seulement, pas d'effet de type pour l'instant) ----
const AB={x0:16,x1:434,y0:22,y1:265,rad:0}; // zone jouable (pieds des combattants) et rayon des coins
const OBST=[]; // obstacles circulaires {x,y,r,spr} : bloquent déplacements et projectiles
let ARENA_ID="colisee", ARENA_PICK="colisee", arenaDeco=null;
const mkCv=(w,h)=>{const c=document.createElement("canvas");c.width=w;c.height=h;return c};
const h2=(x,y,s)=>{let n=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263)+Math.imul(s|0,1274126177))|0;n=Math.imul(n^(n>>>13),1274126177);return(((n^(n>>>16))>>>0)/4294967296)};
const c32=h=>{const n=parseInt(h.slice(1),16);return(255<<24)|((n&255)<<16)|(((n>>8)&255)<<8)|((n>>16)&255)};
function sdAB(x,y,grow){ // distance signée au bord de la zone jouable (négative à l'intérieur)
  const x0=AB.x0-grow,x1=AB.x1+grow,y0=AB.y0-grow,y1=AB.y1+grow,r=AB.rad+grow, cx=(x0+x1)/2, cy=(y0+y1)/2;
  const qx=Math.abs(x-cx)-((x1-x0)/2-r), qy=Math.abs(y-cy)-((y1-y0)/2-r);
  return Math.hypot(Math.max(qx,0),Math.max(qy,0))+Math.min(Math.max(qx,qy),0)-r;
}
function eLine(g,cx,cy,rx,ry,col){g.fillStyle=col;const n=Math.max(16,Math.round(rx*6));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;g.fillRect(Math.round(cx+Math.cos(a)*rx),Math.round(cy+Math.sin(a)*ry),1,1)}}
function crack(g,x,y,len,col,seed,inside){let a=h2(x,y,seed)*Math.PI*2;for(let i=0;i<len;i++){if(inside&&!inside(x,y))break;g.fillStyle=col;g.fillRect(Math.round(x),Math.round(y),1,1);a+=(h2(x+i,y,seed+i)-.5)*.9;x+=Math.cos(a);y+=Math.sin(a)*.8}}
function paintGround(A,fn){const W=A.w,H=A.h,cv2=mkCv(W,H),g=cv2.getContext("2d"),im=g.createImageData(W,H),u=new Uint32Array(im.data.buffer);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)u[y*W+x]=fn(x,y,sdAB(x+.5,y+.5,4));
  g.putImageData(im,0,0);return cv2}

// ---------- obstacles : sprites (base centrée en 24,60), points de vie, fissures par paliers ----------
const OW=48,OH=72,OX=24,OY=60;
function oSh(g,r){g.fillStyle="rgba(0,0,0,.26)";const ry=Math.round(r*ISO);for(let dy=-ry;dy<=ry;dy++){const w=Math.round(r*Math.sqrt(1-dy*dy/(ry*ry+.5)));g.fillRect(OX-w,OY+dy,w*2+1,1)}}
const oR=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
function weather(g,box,col,stage){ // fissures (palier 1 et 2) et éclats manquants (palier 2)
  if(stage<1)return; const [x0,y0,x1,y1]=box;
  for(let i=0;i<stage*2+1;i++)crack(g,x0+2+h2(i,1,21)*(x1-x0-4),y0+4+h2(i,2,21)*(y1-y0)*.4,9+stage*8,col,i+stage*9,(x,y)=>g.getImageData(Math.round(x),Math.round(y),1,1).data[3]>200);
  if(stage>=2)for(let i=0;i<4;i++){const w=3+Math.floor(h2(i,5,22)*4),h=2+Math.floor(h2(i,6,22)*4),x=i%2?x1-w+1:x0-1,y=y0+Math.floor(h2(i,8,22)*(y1-y0)*.6);g.clearRect(x,y,w,h)}
}
function spike(g,cx,top,bot,hw,cols){for(let y=top;y<=bot;y++){const t=(y-top)/(bot-top),w=t<.3?Math.round(1+t/.3*hw):t>.88?Math.round(hw*(1-t)/.12)+1:hw;
  for(let dx=-w;dx<=w;dx++){let c=dx<-w+1?cols[0]:dx<0?cols[1]:dx===0?cols[2]:dx<w?cols[3]:cols[4];if(y===bot)c=dx<0?cols[1]:cols[4];g.fillStyle=c;g.fillRect(cx+dx,y,1,1)}}}
const OBK={
  pillar:{r:13,hp:170,deb:["#7c7464","#aaa18b","#d6cdb6","#ffffff","#4d473d"],crack:"#3a352d",draw(g,st,br){const L="#d6cdb6",M="#aaa18b",D="#7c7464",K="#4d473d";oSh(g,18);
    oR(g,OX-14,OY-5,28,5,M);oR(g,OX-14,OY-5,28,1,L);oR(g,OX-14,OY-1,28,1,K);
    const top=br?OY-30:OY-52;oR(g,OX-10,top,20,OY-5-top,M);oR(g,OX-10,top,4,OY-5-top,L);oR(g,OX+6,top,4,OY-5-top,D);
    for(const x of [OX-3,OX+1])oR(g,x,top,1,OY-5-top,D);for(let y=top+8;y<OY-5;y+=10)oR(g,OX-10,y,20,1,D);
    if(!br){oR(g,OX-14,top-6,28,6,M);oR(g,OX-14,top-6,28,1,L);oR(g,OX-14,top,28,1,K);oR(g,OX-14,top-6,3,6,L)}
    else{for(let x=OX-10;x<OX+10;x++){const j=x%4===0?4:x%3===0?2:1;oR(g,x,top-j,1,j,x<OX-5?L:x>OX+5?D:M)}oR(g,OX-20,OY-3,5,2,D);oR(g,OX+15,OY-4,4,3,M);oR(g,OX-17,OY-1,3,1,K)}
    weather(g,[OX-10,top,OX+10,OY-5],this.crack,st)}},
  rock:{r:14,hp:190,deb:["#6e7876","#9aa3a0","#bcc4c0","#ffffff","#4f5958"],crack:"#2e3534",pal:["#bcc4c0","#9aa3a0","#6e7876","#4f5958"],moss:"#5b8c3a",draw(g,st){oSh(g,19);const p=this.pal,cy=OY-11;
    for(let dy=-12;dy<=12;dy++){const w=Math.round(19*Math.sqrt(1-dy*dy/150));for(let dx=-w;dx<=w;dx++){const t=(dy+12)/24,n=h2(dx+30,dy+30,5);let c=t<.28?p[0]:t<.72?p[1]:p[2];if(dx<-w+4&&t<.6)c=p[0];if(n<.07)c=p[3];if(this.moss&&t<.3&&n>.35)c=this.moss;g.fillStyle=c;g.fillRect(OX+dx,cy+dy,1,1)}}
    oR(g,OX-6,cy-4,5,1,p[0]);oR(g,OX+3,cy+3,6,1,p[3]);weather(g,[OX-18,cy-12,OX+18,cy+12],this.crack,st)}},
  sandrock:{r:16,hp:190,deb:["#6e4222","#b9773a","#d8a064","#f2dca0","#8a5226"],crack:"#4a2c14",pal:["#d8a064","#b9773a","#8a5226","#6e4222"],moss:null,draw(g,st){OBK.rock.draw.call(this,g,st)}},
  cactus:{r:10,hp:110,deb:["#2d6a35","#3f8f46","#6cc070","#e8789a","#d8f0c0"],crack:"#1c4a24",draw(g,st){const M="#3f8f46",D="#2d6a35",L="#6cc070";oSh(g,13);
    oR(g,OX-5,OY-48,10,44,M);oR(g,OX-5,OY-48,3,44,L);oR(g,OX+3,OY-48,2,44,D);oR(g,OX-3,OY-51,6,3,M);
    oR(g,OX-17,OY-26,12,4,M);oR(g,OX-17,OY-38,4,16,M);oR(g,OX-17,OY-38,1,16,L);oR(g,OX-14,OY-38,1,16,D);
    oR(g,OX+5,OY-18,12,4,M);oR(g,OX+13,OY-30,4,16,M);oR(g,OX+13,OY-30,1,16,L);oR(g,OX+16,OY-30,1,16,D);
    oR(g,OX-1,OY-55,3,3,"#e8789a");oR(g,OX-1,OY-56,3,1,"#f6a8c0");
    for(const [x,y] of [[-3,-42],[2,-36],[-2,-28],[1,-20],[-3,-12],[-15,-34],[15,-26],[-1,-8]])oR(g,OX+x,OY+y,1,1,"#d8f0c0");
    weather(g,[OX-17,OY-48,OX+17,OY-4],this.crack,st)}},
  crystal:{r:11,hp:120,deb:["#4f90c8","#78b8e8","#bfe6fa","#ffffff","#3f78b0"],crack:"#2f5a88",draw(g,st){const C=["#eaf8ff","#bfe6fa","#ffffff","#78b8e8","#4f90c8"];oSh(g,15);
    spike(g,OX,OY-52,OY-3,11,C);spike(g,OX+14,OY-30,OY-3,6,C);spike(g,OX-14,OY-24,OY-3,5,C);oR(g,OX-2,OY-40,1,5,"#ffffff");oR(g,OX+13,OY-22,1,3,"#ffffff");
    weather(g,[OX-11,OY-50,OX+11,OY-4],this.crack,st)}},
  obsidian:{r:11,hp:210,deb:["#140c1c","#3a2848","#6a4a80","#ff7a2a","#ffd23a"],crack:"#ff7a2a",draw(g,st){const C=["#6a4a80","#3a2848","#4d3562","#241830","#140c1c"];
    g.fillStyle="rgba(255,110,30,.28)";for(let dy=-5;dy<=5;dy++){const w=Math.round(19*Math.sqrt(1-dy*dy/30));g.fillRect(OX-w,OY+dy,w*2+1,1)}
    oSh(g,14);spike(g,OX,OY-54,OY-3,9,C);spike(g,OX-12,OY-34,OY-3,5,C);spike(g,OX+12,OY-30,OY-3,5,C);
    oR(g,OX-8,OY-4,17,1,"#ff7a2a");oR(g,OX-2,OY-5,1,1,"#ffd23a");oR(g,OX+4,OY-5,1,1,"#ff7a2a");oR(g,OX,OY-30,1,6,"#c4501a");oR(g,OX-1,OY-24,1,3,"#ff7a2a");
    weather(g,[OX-9,OY-50,OX+9,OY-4],this.crack,st)}},
};
function rubble(K){const c=mkCv(OW,OH),g=c.getContext("2d");oSh(g,K.r+3);for(let i=0;i<14;i++){const x=OX-K.r+h2(i,1,31)*K.r*2,y=OY-6+h2(i,2,31)*8,w=2+Math.floor(h2(i,3,31)*4);oR(g,Math.round(x),Math.round(y),w,2,K.deb[i%3]);oR(g,Math.round(x),Math.round(y),w,1,K.deb[(i+1)%4])}return c}
// ---------- sols ----------
function genColisee(A){
  const SAND=c32("#dcc38c"),SD=c32("#cdb27a"),SL=c32("#ecd9a6"),SE=c32("#c4aa72"),ST=[c32("#b9b09a"),c32("#aaa18b")],SH=c32("#d8cfb8"),SK=c32("#5e584c"),DARK=c32("#2a2622"),R0=c32("#8a8272"),R1=c32("#5e584c"),SEAT=c32("#a39b88");
  const CR=["#a8403a","#3f63a8","#c8a84a","#d8d8d0","#4a8a54","#7a4a96"].map(c32), SKIN=["#f0c8a0","#d8a070","#a06a44","#6e4429","#3a2a1c","#e8d070"].map(c32);
  const cv2=paintGround(A,(x,y,d)=>{
    if(d<0){const n=h2(x,y,1),r=-d;let c=n<.07?SD:n>.95?SL:SAND;if(r<3)c=SE;else if(Math.floor(r)%14===0&&h2(x,y,2)<.55)c=SD;return c}
    if(d<5){if(d<1)return SH;if(d>=4)return SK;return(((x>>3)+(y>>2))&1)?ST[0]:ST[1]}
    const t=d-5; if(t>63)return DARK;
    const row=Math.floor(t)%7, tier=Math.floor(t/7);
    if(row<1)return R0; if(row<2)return R1;
    const v=h2(x>>1,y>>1,tier+7);
    if(v<.46){if(row<3)return SKIN[Math.floor(h2(x>>1,y>>1,9)*SKIN.length)];return CR[Math.floor(h2(x>>1,y>>1,11)*CR.length)]}
    return SEAT});
  const g=cv2.getContext("2d"),cx=(AB.x0+AB.x1)/2,cy=(AB.y0+AB.y1)/2;
  // emblème au centre
  eLine(g,cx,cy,46,Math.round(46*ISO),"#c4aa72");eLine(g,cx,cy,47,Math.round(47*ISO),"#c4aa72");eLine(g,cx,cy,26,Math.round(26*ISO),"#cdb27a");
  for(let i=0;i<8;i++){const a=i*Math.PI/4;g.fillStyle="#c4aa72";g.fillRect(Math.round(cx+Math.cos(a)*36),Math.round(cy+Math.sin(a)*36*ISO),2,2)}
  // portes voûtées gauche et droite
  for(const sx of [AB.x0-4-17,AB.x1+4+3]){oR(g,sx,cy-13,14,22,"#17130f");oR(g,sx+1,cy-15,12,2,"#17130f");oR(g,sx+3,cy-17,8,2,"#17130f");
    for(let k=0;k<3;k++)oR(g,sx+3+k*4,cy-13,1,22,"#3a3228");oR(g,sx-1,cy-17,1,26,"#d8cfb8");oR(g,sx+14,cy-17,1,26,"#5e584c")}
  // loge d'honneur en haut
  const ty=AB.y0-4-19;oR(g,cx-34,ty,68,15,"#2a1218");oR(g,cx-34,ty,68,2,"#d8b04a");oR(g,cx-34,ty+13,68,2,"#d8b04a");
  for(let i=0;i<68;i+=6){oR(g,cx-34+i,ty+2,3,11,"#7a2a3a");oR(g,cx-31+i,ty+2,3,11,"#9a3a4c")}
  oR(g,cx-4,ty+3,8,6,"#d8b04a");oR(g,cx-3,ty+4,6,4,"#8a6a20");
  return cv2}
function decoColisee(c,t){
  const cx=(AB.x0+AB.x1)/2,by=AB.y0-6,cols=["#c8322c","#e8c43a","#2e5fc4","#c8322c","#e8c43a","#2e5fc4"];
  [-150,-90,90,150].forEach((fx,k)=>{const x=Math.round(cx+fx),col=cols[k];
    c.fillStyle="#3b2e22";c.fillRect(x,by-34,2,36);c.fillStyle="#d8b04a";c.fillRect(x-1,by-36,4,3);c.fillStyle="#2a2622";c.fillRect(x-2,by+1,6,2);
    for(let i=0;i<16;i++){const wave=Math.round(Math.sin(t*4.2+i*.5+k)*1.8*(i/15)),h=Math.max(2,Math.round(9*(1-i/22)));c.fillStyle=col;c.fillRect(x+2+i,by-33+wave,1,h);c.fillStyle="rgba(255,255,255,.35)";c.fillRect(x+2+i,by-33+wave,1,1)}})
}
function genDesert(A){
  const cv2=paintGround(A,(x,y,d)=>{
    if(d<0){const r=-d,n=h2(x,y,1),v=Math.sin((x*.9+y*1.7)/6+Math.sin(x/23)*2.2);let c=v>.55?"#edcf8c":v<-.55?"#d1a55c":"#e3bd72";if(n<.05)c="#c89850";else if(n>.97)c="#f6e2a8";if(r<3)c="#b8884a";return c32(c)}
    if(d<3)return c32("#7a4a24");
    const band=Math.floor((y+d*.3)/5)%3,n=h2(x,y,3);let c=["#b9773a","#a1642f","#c98a4c"][band];if(n<.08)c="#8a5226";else if(n>.95)c="#d8a064";if(d>40)c="#6e4222";else if(d>22&&n<.4)c="#8a5226";return c32(c)});
  const g=cv2.getContext("2d");
  for(let i=0;i<26;i++){const x=AB.x0+8+h2(i,1,4)*(AB.x1-AB.x0-16),y=AB.y0+6+h2(i,2,4)*(AB.y1-AB.y0-12);g.fillStyle="#a98048";g.fillRect(Math.round(x),Math.round(y),2,1);g.fillStyle="#f2dca0";g.fillRect(Math.round(x),Math.round(y)-1,1,1)}
  return cv2}
function genGlace(A){
  const cv2=paintGround(A,(x,y,d)=>{
    if(d<0){const r=-d,n=h2(x,y,1),p=Math.sin(x/13)*Math.sin(y/9);let c=p>.5?"#d6f2fb":"#bfe4f2";if(n<.04)c="#ffffff";else if(n>.96)c="#a6d2e6";if(r<3)c="#a6d2e6";return c32(c)}
    const n=h2(x,y,3);
    if(d<8){let c=d<3?"#f2fafe":n<.3?"#dbeaf3":"#e8f4fa";if(d>=6)c="#c9dde9";return c32(c)}
    const v=Math.sin((x+y*2)/5);let c=v>.6?"#2f74b8":"#1f5a96";if(n<.12)c="#18487c";return c32(c)});
  const g=cv2.getContext("2d"),ins=(x,y)=>sdAB(x,y,2)<-2;
  for(let i=0;i<16;i++){const x=AB.x0+30+h2(i,1,6)*(AB.x1-AB.x0-60),y=AB.y0+20+h2(i,2,6)*(AB.y1-AB.y0-40);crack(g,x,y,22+h2(i,3,6)*30,"#f4fcff",i,ins);crack(g,x,y+1,14,"#8fc0d8",i+40,ins)}
  return cv2}
function genVolcan(A){
  const cv2=paintGround(A,(x,y,d)=>{
    if(d<0){const r=-d,n=h2(x,y,1);let c=n<.1?"#322b36":n>.93?"#463d4c":"#3b3340";if(r<3)c="#241d28";return c32(c)}
    const n=h2(x,y,3);
    if(d<4)return c32(n<.2?"#c4501a":"#2a2230");
    const v=Math.sin(x/7+Math.sin(y/5)*2)+Math.sin(y/6+Math.cos(x/9)*2);let c=v>1?"#ffb02e":v>.4?"#ff7a1a":v<-1?"#9c2a10":"#e04a14";if(d<9&&n<.5)c="#7a2410";return c32(c)});
  const g=cv2.getContext("2d"),ins=(x,y)=>sdAB(x,y,0)<-3;
  for(let i=0;i<12;i++){const x=AB.x0+20+h2(i,1,8)*(AB.x1-AB.x0-40),y=AB.y0+14+h2(i,2,8)*(AB.y1-AB.y0-28),len=26+h2(i,3,8)*30;crack(g,x,y,len,"#c4501a",i,ins);crack(g,x,y,len,"#ff7a1a",i,ins);crack(g,x+0.3,y,len*.5,"#ffd23a",i,ins)}
  return cv2}
// lueurs animées (eau scintillante, braises) : positions fixes, clignotement par phase
function glints(A,col,col2,n,ring){const P=[];for(let i=0;i<n;i++){const x=Math.floor(h2(i,1,9)*A.w),y=Math.floor(h2(i,2,9)*A.h);if(sdAB(x,y,0)>ring[0]&&sdAB(x,y,0)<ring[1])P.push([x,y,h2(i,3,9)*6.28,h2(i,4,9)<.5?col:col2])}return P}
function decoGlints(P,speed){return(c,t)=>{P.forEach(([x,y,ph,col])=>{const v=Math.sin(t*speed+ph);if(v>.55){c.fillStyle=col;c.fillRect(x,y,v>.9?2:1,1)}})}}

// ---------- catalogue ----------
const ARENAS={
  colisee:{id:"colisee",name:"Colisée",w:560,h:360,ab:{x0:52,x1:508,y0:66,y1:322,rad:60},gen:genColisee,deco:()=>decoColisee,
    obst:(cx,cy)=>[[cx-125,cy-62,8,"pillar"],[cx+125,cy-62,8,"pillar"],[cx-125,cy+62,8,"pillarB"],[cx+125,cy+62,8,"pillarB"]]},
  prairie:{id:"prairie",name:"Prairie",w:450,h:275,ab:{x0:16,x1:434,y0:22,y1:265,rad:0},c:[225,137.5],gen:A=>{const c=mkCv(A.w,A.h);genPrairie(c.getContext("2d"));return c},
    obst:(cx,cy)=>[[cx-100,cy-58,9,"rock"],[cx+100,cy-58,9,"rock"],[cx-100,cy+58,9,"rock"],[cx+100,cy+58,9,"rock"]]},
  desert:{id:"desert",name:"Désert",w:540,h:300,ab:{x0:20,x1:520,y0:30,y1:290,rad:44},gen:genDesert,
    obst:(cx,cy)=>[[cx-150,cy-52,6,"cactus"],[cx+150,cy-52,6,"cactus"],[cx-150,cy+52,6,"cactus"],[cx+150,cy+52,6,"cactus"],[cx,cy+15,11,"sandrock"]]},
  glace:{id:"glace",name:"Lac gelé",w:400,h:260,ab:{x0:20,x1:380,y0:28,y1:250,rad:100},gen:genGlace,
    deco:A=>decoGlints(glints(A,"#ffffff","#9fd0f0",60,[8,60]),2.4),
    obst:(cx,cy)=>[[cx-95,cy-48,7,"crystal"],[cx+95,cy-48,7,"crystal"],[cx-95,cy+48,7,"crystal"],[cx+95,cy+48,7,"crystal"]]},
  volcan:{id:"volcan",name:"Volcan",w:480,h:290,ab:{x0:18,x1:462,y0:26,y1:280,rad:56},gen:genVolcan,
    deco:A=>decoGlints(glints(A,"#ffe27a","#ffffff",70,[5,60]),3),
    obst:(cx,cy)=>[[cx,cy-64,7,"obsidian"],[cx,cy+66,7,"obsidian"],[cx-135,cy,7,"obsidian"],[cx+135,cy,7,"obsidian"]]},
};
const ARENA_IDS=["colisee","prairie","desert","glace","volcan"];
const SPR_CACHE={};
function obstSprites(k){return SPR_CACHE[k]||(SPR_CACHE[k]=[0,1,2].map(st=>{const c=mkCv(OW,OH);OBK[k].draw.call(OBK[k],c.getContext("2d"),st,k==="pillarB");return c}).concat([rubble(OBK[k])]))}
function setArena(id){
  const A=ARENAS[id]||ARENAS.colisee; ARENA_ID=A.id; WORLD.w=A.w; WORLD.h=A.h; Object.assign(AB,A.ab);
  ground=A.canvas||(A.canvas=A.gen(A));
  const cx=A.c?A.c[0]:(AB.x0+AB.x1)/2, cy=A.c?A.c[1]:(AB.y0+AB.y1)/2;
  OBST.length=0; A.obst(cx,cy).forEach(o=>{const kk=o[3]==="pillarB"?"pillar":o[3],K=OBK[kk];
    const spr=SPR_CACHE[o[3]]||(SPR_CACHE[o[3]]=[0,1,2].map(st=>{const c=mkCv(OW,OH);K.draw.call(K,c.getContext("2d"),st,o[3]==="pillarB");return c}).concat([rubble(K)]));
    OBST.push({x:o[0],y:o[1],r:K.r,k:kk,hp:K.hp,max:K.hp,dead:false,hurtAt:0,spr})});
  START_A[0]=cx-55; START_A[1]=cy+10; START_B[0]=cx+55; START_B[1]=cy+20;
  if(!A.decoF&&A.deco)A.decoF=A.deco(A); arenaDeco=A.decoF||null;
}
// ---------- dégâts sur les obstacles ----------
const obstStage=c=>c.dead?3:c.hp<c.max/3?2:c.hp<c.max*2/3?1:0;
function obstChips(c,n,big){const K=OBK[c.k];colorBurst(c.x,c.y-16,n,K.deb,25,big?150:95);
  for(let i=0;i<(big?14:4);i++){const a=rand(0,Math.PI*2);spark(c.x+Math.cos(a)*6,c.y-14,Math.cos(a)*rand(30,90),rand(-150,-60),rand(.35,.6),K.deb[i%5],380,3)}}
function obstBreak(c){c.hp=0;c.dead=true;c.hurtAt=performance.now();obstChips(c,24,true);rings.push({x:c.x,y:c.y,t:0,dur:.35,max:c.r*2.6,c:OBK[c.k].deb[2]});shake=Math.max(shake,.2);
  if(typeof sfx==="function")sfx(752,"fight",.8,.9+Math.random()*.15,c.x)}
function obstDamage(c,dmg){
  if(c.dead||NET.guest)return;
  c.hp-=dmg; c.hurtAt=performance.now();
  if(c.hp<=0)obstBreak(c); else{obstChips(c,6,false);if(typeof sfx==="function")sfx(735,"fight",.5,1.1+Math.random()*.2,c.x)}
}
function obstSet(i,h){const c=OBST[i]; if(!c)return; if(h<=0&&!c.dead){obstBreak(c)} else if(h<c.hp&&h>0){c.hurtAt=performance.now();obstChips(c,5,false)} c.hp=h; c.dead=h<=0}
function obstReset(){OBST.forEach(c=>{c.hp=c.max;c.dead=false;c.hurtAt=0})}
function obstMelee(e,id){ // un coup de mêlée visible devant le lanceur entame l'obstacle
  const S=SPL[id]; if(!S||!S.melee||NET.guest)return; const f=e.aim||FACE[e.dir];
  for(const c of OBST){if(c.dead)continue;const dx=c.x-e.x,dy=c.y-e.y;if(gdist(dx,dy)<c.r+34&&(f[0]*dx+f[1]*dy)/(Math.hypot(dx,dy)||1)>.35){obstDamage(c,Math.round((S.power||20)*1.1));break}}
}
function obstBlock(att,tgt,spell){ // un coup au contact ou un rayon est arrêté par un obstacle entre le lanceur et la cible
  const ax=att.x,ay=att.y/ISO,bx=tgt.x,by=tgt.y/ISO,vx=bx-ax,vy=by-ay,L2=vx*vx+vy*vy||1;
  for(const c of OBST){if(c.dead)continue;const px=c.x,py=c.y/ISO,t=clamp(((px-ax)*vx+(py-ay)*vy)/L2,0,1);
    if(t>0&&t<1&&Math.hypot(ax+vx*t-px,ay+vy*t-py)<c.r*.9){obstDamage(c,Math.round(((spell&&spell.power)||15)*.9));return true}}
  return false;
}
// ---------- collisions ----------
function arenaFix(e){
  for(let k=0;k<2;k++){
    if(AB.rad>0){const r=AB.rad,cx=clamp(e.x,AB.x0+r,AB.x1-r),cy=clamp(e.y,AB.y0+r,AB.y1-r),dx=e.x-cx,dy=e.y-cy,d=Math.hypot(dx,dy);if(d>r){e.x=cx+dx/d*r;e.y=cy+dy/d*r}}
    if(e.tunnel||e.ko>0||!e.sp)continue;
    OBST.forEach((c,i)=>{if(c.dead)return;const min=c.r+e.sp.body*.3+2;let dx=e.x-c.x,dy=(e.y-c.y)/ISO,d=Math.hypot(dx,dy);
      if(d<min){if(d<.01){dx=1;dy=0;d=1}e.x=c.x+dx/d*min;e.y=c.y+dy/d*min*ISO;
        const R=e.rush; if(R&&R.ph==="dash"){R.ho=R.ho||{}; if(!R.ho[i]){R.ho[i]=1;obstDamage(c,Math.round(((SPL[R.id]&&SPL[R.id].power)||40)*1.1))}}}});
    e.x=clampX(e.x); e.y=clampY(e.y);
  }
}
function arenaShot(o){ // vrai si le projectile quitte l'arène ou heurte un obstacle
  if(o.x<AB.x0-6||o.x>AB.x1+6||o.y<AB.y0-2||o.y>AB.y1)return true;
  if(AB.rad>0){const r=AB.rad+6,cx=clamp(o.x,AB.x0+AB.rad,AB.x1-AB.rad),cy=clamp(o.y,AB.y0+AB.rad,AB.y1-AB.rad);if(Math.hypot(o.x-cx,o.y-cy)>r)return true}
  for(const c of OBST)if(!c.dead&&gdist(o.x-c.x,o.y-c.y)<c.r+2){obstDamage(c,Math.max(10,(SPL[o.id]&&SPL[o.id].power)||12));return true}
  return false;
}
try{const s=localStorage.getItem("aceArena"); if(ARENAS[s])ARENA_PICK=s}catch(_){}
setArena(ARENA_PICK);
