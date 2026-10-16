// ===== Jungko (Plante, assassin de la jungle) et Mewtwo (Psy, canon de verre) =====
const GRASSC=["#1a6a2a","#3aa83a","#8ae068","#e8ffd0","#ffffff"];
if(!TYPE_PAL.grass)TYPE_PAL.grass=GRASSC;
if(!TYPE_PAL.psychic)TYPE_PAL.psychic=PSYC;
PORTRAITS.sceptile="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAADmVYSWZNTQAqAAAACAAAAAAAAADSU5MAAATmSURBVHicrZhvSBtnHMe/yr2ptBBcIOJdocMqiI7g0sS9WeE0bZhdLYYIedExKCstDJbRVcaC+CJI3ihlbm86VoTCXggdCpYptdfmxfaiGu2QNSjNwga7cwZSCcy5N4HuxfV5cs/luctdzBfk/j353ee+v+d393ts+fKXF69h0OOJcbovJ0IQpAk0WxV1Bpm5DUf3EMxwUlikx3qQ8abC7jz6HKqiYSw9gnKxhMzcBi7MWI8XzCe6+0R4fF50tXcAser52Zvzx4Yl2SFwHp+37m9qAIkKB/vM8e271wAAWzsvqLNuQB9P6OM9Pi/KxRJzraLOWMZp4c3BsfSI5Y262jvoAywlVwAAUlhEb+Rr7niSUh6cx+dF9uk2uvtES0Cug3b2E2e72jtw++41Cqoq49zx5AFIXPN9gkN+LCVXLOchFzCf0xCsMz+sQAFgdPIiM3Z5eg2APr/dqtV84sLMA6iK5jhA4WAfhYN9CionQlieXsPzZzk6ZnTyIlRFQz7nPC4D6D+1CuMWqE2HU9BAbz8tqOXpNewWy9gtlutCVtQZhoFsW/2nVrH9zwcwbuVEiL5I3YqAxmMRyIkQXn6vx9ktltFzPVQDaTSCx8J1MNDbX/NjNyKVHujtZyABcCGlsEgNqXHQ6iaNulguljB7c/7Ni90ekig45LeMZwlIXHQrj8+LsfQI5ESIgZTCIgMJwFHRWH5JiOzeieViCfmcVlP1UlhEcMhPIafupxCPRTCrzOPoDw1tb4voua67Wu/VYwtI0mz3ZVEVDVPRHQTPxQEA2c0FDH56B5eGb9EYv2nP0NXeQeNJYVsmRpYpBkCdsyuWxQEZqcVedAYEdAYEBM/FcWn4Fh6m/XiY9jPzmKTa7DgpKkvAthNnwNu+I74HQJ8r5WKpBtTj8+Lb8/9icUBGILKFva0KOgMCpLCIzoCAy8ltyIkQgOqXJx6LcCGtOIS2E2dw9N+f4G2BaprJXCGQxF0dsoRFyLiczFTdMjQIROSLE49FUBjaR7lYYoqRxyHYOQgA77/7ITKofd0sJVdoMRBI+XyIcZenwoEBzNAZWTrIjcJRPqcxFUfSRFIlhUXa7NaTx+fFwo+PEI9F6o51BGhOs1GLAzIAIKpkGFieyPWx9AiCQ37qXPbptj3goHQS6+qh5daJCCgA4FV19/TZ4erBm5YxmJxkHkJVNEzdT3HvL9SDG5RO4ufneiBjmrv7+JVo1l+/P2GOT58dRnZ8GsEHk/ScFdy6eoiWv49WX5uDmnVvXaFFYU5zZm6Ddc+Bor9mIIVFfPfVF3XHOi4SO3321kt886rHERgA/PTkjuPYjgDt3vSkgKLQLJ0kYCSVbtQUB+VECPmchqiS4V5vBIyoKYCAXjTdfSLTQhmrs1E1DZDIWERuFl9Wsu1mjqNGVnA8OQI0/xvEiVRFgxQWj5VewKWDbhfejSzUzaqZg/fWFbr/yaDe+lo1rObGoNFVoJ0oIPlaGLWEFdpw1oMj55oNKRjhjGsLQF9fpOZgCcmTETyf04DRJgASuCs3rjIXrwSuAvgBqTm2hXLS8wF6oax/dHisQqFFYnSOgTRBOxFJ81R0B6mPpxy3bDy1Gotib6tSM8B8zql7gP5wBLJhQB6Q8Y+IrD3caG+rQjPQqIsUMLu5wB2Q3VywXbjXEy8rbvQ/zD2PNI224BcAAAAASUVORK5CYII=";
PORTRAITS.mewtwo="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAADmVYSWZNTQAqAAAACAAAAAAAAADSU5MAAAVTSURBVHicnZgrtPMoFIX3/KuiEolEIpHISGRkZWVk3URWRlZWXlkZGVk3SNwgkcjIuhlBoHlAH3ev1UXaJuTLPhxy4K+///n3PxR0P7UQkkNVCuPoAQCEUEghAQD14YDq0pUu38heOng3QtUKgnN03QVCcpDDsXjNn1cdCslhtH150/H28zFghFOyAiUUbXuC0fZlHy8Bc08WnQQ+e4B03QQhOIef+phDlrT7qPc3up/acHPJQSnDo6o2cEZbqFotfmeMwRuPV9oBAN2P8A+SbaMIock95xwYY6CUAbAJbOgHABboBwCAqhWM0Ytxt9Y8Irn7717B+QfJPpUfPRgYGA3/U8ogOIdonwDG2gkYWTjGGABAG1OE8w+C3Su4uYNrFwGAMwHg9nSA0HSsZDg2RsMYDQAbSOccjA4RKN1/FyFy7a3pIOSyUzKDYIxB1QpDPyzce0JWYJTA+XEBOX8QIESAFDiKWWx/+nCTSmX/d84lCCCElDGWPlGciRD+ae6cR8A6Ex5aiRJGPovtT5+sLymOQwDJRSWrBDeHhAMEX8J9qo2D42ASXMm9uRhjycVB34vnSCGnMfuU8+N7QDbFOrbeOwDl0FJC02eu9RxXAuVMLN2N/604YrtzDwK2HxHb24vQUkLznTMGheotYDw3HU/TFDEOTrAFR2x38y+mdwGEbiFKcLkbz0XIPh2P46N8fQbOPUgYg+vw5mb832gOl/sex2Qci7kwL5KklLnv3PtGa0gheXrj5LTJ4lx4f6tXIQWmsRuT0e6z5/yRE09sPw1v0zZo2gbDvV/8vnboHeTzPI81i2TAH+3CgXYf9ZN0PBzh3Yjr9Yb6cPgYcg1MCYWqFa7XG+Yssf0z/wEIr6xvpGoFVasEGQFykDk3GWMpamu4rIMxkz9V7Jwy8haypDjpFx2M9LGE/8ZFKSQE55D7MNjPl3OCjKCxsCgpLgGyY3B+4rmrwgUrF33mJR+fmpB9WuUBYaqKkFHWGTRtk4VzzmG4fzHNqFrBaLu56JULhOyhHwNqfshCrosC5xycc9BGw48eRls0zTLRojblVnNiANSzXC8UDbFYrVSN+9Bnz/HewViTvuupaAXCtDIHVweS7SNbsAZILJz0o9+4GF/2w/2O4+EI/Qjntu0JUogEZ4zGcbaEjXDeOwz9UHQPKBSs18sTJK5ZVaXCWHTPwkBwgf5WL+bBpjmkMamNxjj6BRzwDHkMbcm9IuDQD1C1AqME2pgiZHwt9rdbrhtIIVNY59DArO58AZcFHG7j6iYCwGsnX2me4fH7OHoMfTkx5tqMwev1ltwDlhn4bkx+q3fubQCje4yStLz0/rl27e9NghxHj1PbQhu9yM530kYvlq7vtAixNiZsh806iHBxEo9vGykEhAxbaEDIXGAb0vPl/NHiq6RNwZqrByPc+lgKAcoIKCPouguG+4Dr7Se5qo3G+XTeTPrfvEqzWTyOfpG9dXVN/8WKO26DUDoNBTdO51sMGEAZCXOj0QsH457NJwmSBQyTp00wMYuBkDDr8vzp+HN7Le5oxfCv9W7uewlotA1hozTBCR5aVYXazViLrrts1sLeu7DTJSQgwnza3/NFwqfaAEY4o20KsZAmhUlVFdgU1jihA8/tDyGR9rRVrVBX1/DqU5+V/kXAurou4OKx96Ha8N6jVgqUMnDOUQObuTLuA6pph9VOydB1F7T4HeTCwTnc8XAEoxTOewz3AUZb9EOscGpwzsE5h7UWorDO4pyjnSru30JmqxkhJBil4JMbx/oYNhndiH4YpiLgkSDWstYm9wCgbRqoWqHrLnCafQX4P9wCVq8A9rO4AAAAAElFTkSuQmCC";
Object.assign(SPL,{
  leafblade:{name:"Lame-Feuille",type:"grass",cat:"phys",power:22,cost:0,cd:1.1,ground:false,melee:true},
  seedbomb:{name:"Balle Graine",type:"grass",cat:"phys",power:20,cost:0,cd:3,ground:true},
  megadrain:{name:"Giga-Sangsue",type:"grass",cat:"spec",power:22,cost:0,cd:7,ground:true},
  qatk:{name:"Vive-Attaque",type:"normal",cat:"phys",power:16,cost:0,cd:4,ground:true},
  psystrike:{name:"Frappe Psy",type:"psychic",cat:"spec",power:42,cost:0,cd:10,ground:true},
  recover:{name:"Régénération",type:"psychic",cat:"status",power:0,cost:0,cd:16,self:true}
});
Object.values(SPL).forEach(s=>{if(s.pp0===undefined)s.pp0=0});
Object.assign(DESC,{
  leafblade:"Coup de lame devant soi. Très rapide.",
  seedbomb:"Graine explosive en ligne droite.",
  megadrain:"Spore aspirante en ligne droite : rend la moitié des dégâts infligés en PV.",
  qatk:"Fonce à travers l'adversaire sur une courte distance.",
  psystrike:"Énorme onde psychique en ligne droite. Très forte, longue recharge.",
  recover:"Rend 30 % des PV max. Longue recharge."
});
PROJ.seedbomb={speed:270,range:210,hit:10};
PROJ.megadrain={speed:240,range:215,hit:11};
PROJ.psystrike={speed:270,range:270,hit:15};
RUSHES.qatk={id:"qatk",chan:0,min:45,dist:150,speed:580,hit:15,push:30,stun:0,rec:.2,cdHit:0,pal:"normal"};
// Lame-Feuille
ACE2.leafblade={hit(e){
  const f=e.aim||FACE[e.dir], bx=e.x, by=e.y-e.sp.body, t=foeOf(e);
  const tx=t.x-bx, ty=(t.y-t.sp.body)-by, td=Math.hypot(tx,ty), ok=alive(t), along=tx*f[0]+ty*f[1];
  const assist=ok&&td>0&&td<CONF.assist&&along/td>=CONF.cone, reach=assist?clamp(along,22,CONF.reach):22;
  const px=bx+f[0]*reach, py=by+f[1]*reach;
  fx.push({k:"wave",x:px,y:py,sy:e.y+f[1]*reach+.01,f,t:0,pal:["#2a8a2a","#8ae068","#ffffff"]});
  fx.push({k:"claw",x:px,y:py,sy:e.y+f[1]*reach+.02,f,t:0,pal:["#2a8a2a","#8ae068","#ffffff"]});
  colorBurst(px,py+8,12,GRASSC,40,130);
  logFor(e,e.sp.name+" utilise Lame-Feuille !",1800);
  if(ok&&(assist||Math.hypot(tx-f[0]*22,ty-f[1]*22)<16))strike(e,t,SPL.leafblade,{from:e,push:CONF.push,contact:true});
}};
ACE2.seedbomb=ACE2.megadrain=ACE2.psystrike={hit(e,id){fireBolt(e,id)}};
ORBHIT.megadrain=(o,t,dmg)=>{
  const e=o.o; if(!(dmg>0)||!alive(e))return;
  const h=Math.round(dmg*.5); e.hp=Math.min(e.maxHp,e.hp+h);
  pops.push({x:e.x,y:e.y-e.sp.body-24,t:0,txt:"+"+h}); colorBurst(e.x,e.y-e.sp.body,14,GRASSC,30,90); rings.push({x:e.x,y:e.y,t:0,dur:.4,max:22,c:"#8ae068"});
};
ORBEND.seedbomb=o=>{rings.push({x:o.x,y:o.y-8,t:0,dur:.25,max:18,c:"#8ae068"});colorBurst(o.x,o.y-8,14,GRASSC,40,140)};
ORBEND.megadrain=o=>{rings.push({x:o.x,y:o.y-8,t:0,dur:.3,max:20,c:"#c0ff90"});colorBurst(o.x,o.y-8,12,GRASSC,30,100)};
ORBEND.psystrike=o=>{rings.push({x:o.x,y:o.y-10,t:0,dur:.4,max:34,c:"#ffa0e0"});rings.push({x:o.x,y:o.y-10,t:0,dur:.3,max:20,c:"#ffffff"});colorBurst(o.x,o.y-10,28,PSYC,60,200);fx.push({k:"star",x:o.x,y:o.y-12,sy:o.y+.7,t:0,life:.4,r:16,col:"#ffe0f8"});shake=Math.max(shake,.12)};
ORB2.seedbomb=o=>{
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-14+Math.round(Math.sin(o.t*20));
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-3,gy,7,1);
  for(let k=4;k>=1;k--){ctx.globalAlpha=1-k*.18; ctx.fillStyle=k%2?GRASSC[1]:GRASSC[2]; const w=Math.max(1,3-Math.floor(k/2)); ctx.fillRect(Math.round(x-o.vx*k*4)-w+1,Math.round(y-o.vy*k*4)-w+1,w*2-1,w*2-1)}
  ctx.globalAlpha=1; dsc(x,y,5,"#3a2a10"); dsc(x,y,4,"#8a6a30"); dsc(x,y,2,"#c8a050"); ctx.fillStyle="#8ae068"; ctx.fillRect(x-1,y-6,3,2);
};
ORB2.psystrike=o=>{
  const x=Math.round(o.x), gy=Math.round(o.y), y=gy-16+Math.round(Math.sin(o.t*12)*2), pul=Math.sin(o.t*24)>0?1:0;
  ctx.fillStyle="rgba(0,0,0,.28)"; ctx.fillRect(x-5,gy,11,1); ctx.fillRect(x-3,gy+1,7,1);
  for(let k=10;k>=1;k--){ctx.globalAlpha=1-k*.08; ctx.fillStyle=k>5?PSYC[0]:PSYC[1]; const w=Math.max(2,9-Math.floor(k*.7)); ctx.fillRect(Math.round(x-o.vx*k*5)-w+1,Math.round(y-o.vy*k*5)-w+1,w*2-1,w*2-1)}
  ctx.globalAlpha=1; pixelRing(x,y,15+pul,"rgba(255,160,224,.5)"); pixelRing(x,y,11,"rgba(176,96,255,.6)");
  dsc(x,y,9+pul,PSYC[3]); dsc(x,y,8,PSYC[0]); dsc(x,y,6,PSYC[1]); dsc(x,y,3,"#ffffff");
  for(let i=0;i<4;i++){const a=o.t*13+i*1.57; ctx.fillStyle=i%2?PSYC[2]:PSYC[4]; ctx.fillRect(Math.round(x+Math.cos(a)*13),Math.round(y+Math.sin(a)*10),2,2)}
};
// Régénération : soin de 35 % des PV max
function castRecover(e){
  const id="recover";
  if(e.stun>0||e.tunnel||e.rush||e.chan||(e.anim==="attack"&&!e.hit)||cdOf(e,id)>0||e.shieldOn)return;
  e.cd[id]=SPL[id].cd; gcd(e,.4); e.moveTarget=null; if(SND.pe===e&&SND.pend){sfxCast(e,SND.pend);SND.pend=null}
  const h=Math.round(e.maxHp*.3); e.hp=Math.min(e.maxHp,e.hp+h);
  rings.push({x:e.x,y:e.y,t:0,dur:.5,max:28,c:"#ffa0e0"}); colorBurst(e.x,e.y-e.sp.body,24,PSYC,30,110);
  fx.push({k:"up",x:e.x,y:e.y,sy:e.y+.5,h:e.sp.body+8,t:0,life:.9,pal:PSYC});
  pops.push({x:e.x,y:e.y-e.sp.body-26,t:0,txt:"+"+h});
  logFor(e,e.sp.name+" utilise Régénération !",1600);
}
// Aperçus de visée
PREV.leafblade={k:"melee",r:16,d:[22,CONF.reach]};
PREV.seedbomb={k:"shot",len:()=>PROJ.seedbomb.range,hw:PROJ.seedbomb.hit,from:14};
PREV.psystrike={k:"shot",len:()=>PROJ.psystrike.range,hw:PROJ.psystrike.hit,from:14};
PREV.qatk={k:"shot",len:v=>rushLen(v,RUSHES.qatk),hw:RUSHES.qatk.hit,from:0};
// IA
function botAce3(e,t,d,threat,go,ok,rnd){
  if(ok("recover")&&e.hp<e.maxHp*.5&&rnd(.6)){go("recover");return true}
  if(ok("psystrike")&&d>50&&d<PROJ.psystrike.range-25&&rnd(.5)){go("psystrike",false,.3);return true}
  if(ok("qatk")&&d>40&&d<RUSHES.qatk.dist-8&&(punishable(t)||rnd(.4))){go("qatk",false,.1);return true}
  if(ok("megadrain")&&d>40&&d<105&&(e.hp<e.maxHp*.7||rnd(.5))){go("megadrain",false,.25);return true}
  if(ok("seedbomb")&&d>40&&d<PROJ.seedbomb.range-15&&rnd(.6)){go("seedbomb",false,.25);return true}
  return false;
}
Object.assign(SPECIES,{
  sceptile:{name:"Jungko",num:254,types:["grass"],base:{hp:70,atk:85,def:65,spa:105,spd:85,spe:120},sheets:J_SHEETS,anch:J_ANCH,shadow:[8,3],body:16,bar:38,hitFrame:3,atkRate:1.1,kit:["leafblade","seedbomb","megadrain","qatk"],style:"melee",pool:["leafblade","seedbomb","megadrain","qatk"],playable:true},
  mewtwo:{name:"Mewtwo",num:150,types:["psychic"],base:{hp:106,atk:110,def:90,spa:154,spd:90,spe:130},sheets:M2_SHEETS,anch:M2_ANCH,shadow:[10,4],body:22,bar:48,hitFrame:4,atkRate:1,kit:["psy","asph","psystrike","recover"],style:"range",pool:["psy","asph","psystrike","recover","conf","tele"],playable:true}
});
["sceptile","mewtwo"].forEach(k=>{const sp=SPECIES[k]; sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1)});
["sceptile","mewtwo"].forEach(k=>Object.values(SPECIES[k].sheets).forEach(s=>{s.img=new Image();s.img.src=s.src}));
buildMenu();
