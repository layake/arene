// ===== Constantes de Lucario et Amphinobi (chargées avant les dessins et aperçus) =====
const FIGHT=["#8a1c18","#c03028","#ff8a60","#ffe0c0","#ffffff"]; // énergie Combat
const AURA=["#0a4a90","#2a8af0","#90d0ff","#e0f4ff","#ffffff"];  // aura de Lucario
const WATERC=["#1a4aa0","#4a8af0","#90c8ff","#e0f4ff","#ffffff"]; // énergie Eau
const ICEC=["#4a98c0","#98d8d8","#d8f4f8","#ffffff","#78b8e0"];
TYPE_PAL.water=WATERC; TYPE_PAL.fighting=FIGHT; TYPE_PAL.ice=ICEC;
const ACE2={}, ZONE2={}, ORB2={}, ZONE2D={}, ORBEND={}, ORBHIT={};
Object.assign(PROJ,{asph:{speed:245,range:235,hit:12,home:1.7},wshuri:{speed:310,range:205,hit:9},icebeam:{speed:300,range:215,hit:10},fwave:{speed:270,range:210,hit:11}});
const WP={range:115,r:24,delay:.45,push:34,slowT:1.8};
const RIPOSTE={dur:1.2,mult:1.6};
const FLURRY={n:3,gap:.09,reach:20};
const DECOY={dist:88,min:40,inv:.3,life:1.5};
Object.assign(RUSHES,{
  ccombat:{id:"ccombat",chan:0,min:50,dist:125,speed:560,hit:16,push:0,stun:0,rec:.2,cdHit:0,flurry:true},
  sucker:{id:"sucker",chan:0,min:40,dist:115,speed:620,hit:14,push:42,stun:0,rec:.25,cdHit:0,ghost:true,pal:"dark",punish:1.6}
});
RUSHES.ssneak.ghost=true;
// ---- Dracaufeu et Mammochon ----
const FLAMEC=["#a01808","#e8481c","#ff9a30","#ffe070","#ffffff"]; // énergie Feu
const SKYC=["#5880c0","#a0c0f0","#d8ecff","#ffffff","#90b0e0"];    // énergie Vol
TYPE_PAL.fire=FLAMEC; TYPE_PAL.flying=SKYC;
const FLAME={reach:75,cone:Math.cos(36*Math.PI/180)};
const BURN={dur:3,tick:.6,pct:.03};
const HEAT={range:110,r:26,delay:.5,life:2.6};
const AVAL={range:100,r:30,delay:.7,push:60,slowT:1.2};
const STOMP={r:44,delay:.4,push:80,stun:.3};
RUSHES.fly={id:"fly",chan:0,min:60,dist:180,speed:600,hit:16,push:50,stun:0,rec:.25,cdHit:0,pal:"flying",fly:true};
