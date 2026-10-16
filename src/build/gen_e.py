import re
import os; S=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')+'/'
mons=[('snorlax','sno','SN','Ronflex',143,['normal'],dict(hp=160,atk=110,def_=65,spa=65,spd=110,spe=30),[12,5],26,52,3,1.8,['bodyslam','stomp','quake','recover'],'melee',['bodyslam','stomp','quake','recover','rwall','rslide']),
('tyranitar','tyr','TY','Tyranocif',248,['rock','dark'],dict(hp=100,atk=134,def_=110,spa=95,spd=100,spe=61),[12,5],26,52,4,1.6,['crunch','rslide','sedge','sandstorm'],'melee',['crunch','rslide','sedge','sandstorm','quake','trap','sucker','rwall']),
('zoroark','zor','ZO','Zoroark',571,['dark'],dict(hp=60,atk=105,def_=60,spa=120,spd=60,spe=105),[9,3],20,44,4,1.0,['nslash','shball','decoy','nplot'],'melee',['nslash','shball','decoy','nplot','hex','curse','sucker','scl']),
('staraptor','sta','ST','Étouraptor',398,['normal','flying'],dict(hp=85,atk=120,def_=70,spa=50,spd=60,spe=100),[9,3],18,42,3,1.1,['wingatk','fly','qatk','ccombat'],'melee',['wingatk','fly','qatk','ccombat','sdance','sucker'])]
o=['// ===== Ronflex, Tyranocif, Zoroark, Étouraptor ====='.replace('É','É')]
for k,d,P,n,num,t,b,sh,body,bar,hf,ar,kit,st,pool in mons:
    o.append('PORTRAITS.%s="data:image/png;base64,%s";'%(k,open(S+d+'/portrait.b64').read().strip()))
for k,d,P,n,num,t,b,sh,body,bar,hf,ar,kit,st,pool in mons:
    o.append(open(S+d+'/%s_data.js'%d,encoding='utf-8').read())
o.append(r'''
Object.assign(SPECIES,{''')
for k,d,P,n,num,t,b,sh,body,bar,hf,ar,kit,st,pool in mons:
    o.append('  %s:{name:"%s",num:%d,types:%s,base:{hp:%d,atk:%d,def:%d,spa:%d,spd:%d,spe:%d},sheets:%s_SHEETS,anch:%s_ANCH,shadow:%s,body:%d,bar:%d,hitFrame:%d,atkRate:%s,kit:%s,style:"%s",pool:%s,playable:true},'%(k,n,num,str(t).replace("'",'"'),b['hp'],b['atk'],b['def_'],b['spa'],b['spd'],b['spe'],P,P,sh,body,bar,hf,ar,str(kit).replace("'",'"'),st,str(pool).replace("'",'"')))
o.append('''});
["snorlax","tyranitar","zoroark","staraptor"].forEach(k=>{const sp=SPECIES[k]; sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1); Object.values(sp.sheets).forEach(s=>{s.img=new Image();s.img.src=s.src})});
buildMenu();
''')
open(S+'build/new/aces_e.js','w',encoding='utf-8').write('\n'.join(o))
