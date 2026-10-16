const DIR={"0,1":0,"1,1":1,"1,0":2,"1,-1":3,"0,-1":4,"-1,-1":5,"-1,0":6,"-1,1":7};
const FACE=[[0,1],[.7071,.7071],[1,0],[.7071,-.7071],[0,-1],[-.7071,-.7071],[-1,0],[-.7071,.7071]];
const WORLD={w:450,h:275}, SPEED=58, RUN_MULT=1.4, BG="#12171d";
const cv=document.getElementById("cv"), ctx=cv.getContext("2d"), stage=document.getElementById("stage"), logEl=document.getElementById("log");
let aiming=null; const keys=new Set(); let mouse=null, lastE=null, held=false, marker=null, PX=4, hitstop=0, shake=0, logTimer=0;
const cam={x:0,y:0};
const NET={on:false,host:false,guest:false,started:false,tick(){},send(){},sendCast(){},leave(){}};
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

// recharge d'une capacité pour un Pokémon donné (équilibrage par Pokémon, voir balance.js)
function spCd(key,id){const sp=SPECIES[key]; return (sp&&sp.cdMod&&sp.cdMod[id])||SPL[id].cd}
function cdFor(e,id){return e&&e.key?spCd(e.key,id):SPL[id].cd}
