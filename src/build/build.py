import os
import re
src=open('carchacrok_v58_backup.html',encoding='utf-8').read().split('\n')
head='\n'.join(src[:108]); data=src[108:132]
head=head.replace('<h1>Carchacrok <span>#445</span></h1>','<h1>Aces <span>Arena</span></h1><span id="score"></span>')
head=head.replace('<div class="tools"><button id="pauseBtn"','<div class="tools"><button id="menuBtn" type="button">Changer d\'Ace</button><button id="pauseBtn"')
menu='''<div id="menu" role="dialog" aria-label="Choix de l'Ace"><div class="mbox"><h2>Sélection d'équipe</h2><div class="tabs" role="group" aria-label="Mode"><button type="button" data-tab="solo" aria-pressed="true">Solo</button><button type="button" data-tab="online" aria-pressed="false">En ligne</button></div><div id="onl" class="online" role="group" aria-label="En ligne"><div id="netRow"><button id="netCreate" type="button">Créer un salon</button><span>ou</span><input id="netCode" maxlength="4" placeholder="CODE" autocomplete="off" spellcheck="false" aria-label="Code du salon"><button id="netJoin" type="button">Rejoindre</button></div><div id="netRoom" hidden><div class="lbcode">Salon <b id="netRoomCode"></b><button id="netCopy" type="button">Copier</button></div><div class="lbduo"><div class="lbslot" id="slotMe"></div><div class="lbvs">VS</div><div class="lbslot" id="slotOpp"></div></div><div class="lbbtns"><button id="netReady" type="button">Prêt</button><button id="netQuit" type="button">Quitter le salon</button></div></div><div id="netStatus" aria-live="polite"></div></div><div id="cards"></div><div id="equip"></div><div class="bar"><div class="modes" role="group" aria-label="Mode de jeu"><button type="button" data-mode="train" aria-pressed="true">Entraînement<small>mannequin d'entraînement</small></button><button type="button" data-mode="duel" aria-pressed="false">Versus<small>contre un adversaire</small></button><button type="button" data-mode="rush" aria-pressed="false">Marathon<small>Tous les Pokémon d'affilée, au chrono</small></button></div><div class="diffs" role="group" aria-label="Difficulté"><button type="button" data-diff="easy">Facile</button><button type="button" data-diff="normal" aria-pressed="true">Normal</button><button type="button" data-diff="hard">Difficile</button></div><div class="rounds" role="group" aria-label="Rounds"><span>Rounds</span><button type="button" data-r="1">1</button><button type="button" data-r="3" aria-pressed="true">3</button><button type="button" data-r="5">5</button></div><div class="foes" role="group" aria-label="Adversaire"><span>Adversaire</span><div id="foeBtns"></div></div><button id="go" type="button">Combattre</button></div></div></div>
'''
marker='</div>\n</div>\n<footer>'
assert marker in head
head=head.replace(marker,'</div>\n'+menu+'</div>\n<footer>')
vol='<div class="vols"><h3>Volume</h3><label for="vMaster">Général<output id="vMasterV"></output></label><input id="vMaster" type="range" min="0" max="100" step="1"><label for="vMusic">Musique<output id="vMusicV"></output></label><input id="vMusic" type="range" min="0" max="100" step="1"><label for="vFight">Combat<output id="vFightV"></output></label><input id="vFight" type="range" min="0" max="100" step="1"><label for="vUi">Interface<output id="vUiV"></output></label><input id="vUi" type="range" min="0" max="100" step="1"></div>'
assert '<div class="pk">' in head
AIMHTML='<div class="vols aimsel"><h3>Visée (touche T)</h3><div id="aimModes"><button type="button" data-m="off">Manuelle</button><button type="button" data-m="assist">Assistée</button><button type="button" data-m="lock">Verrouillée</button></div><p>Manuelle : tu vises toi-même. Assistée : le sort cible l\'ennemi si le curseur est proche. Verrouillée : tous les sorts ciblent l\'ennemi.</p></div>'
head=head.replace('<div class="pk">',vol+AIMHTML+'<div class="pk">',1)
head=head.replace('footer{color:var(--muted)',open('new/menu.css',encoding='utf-8').read()+'footer{color:var(--muted)',1)
import subprocess,datetime
try: N=int(subprocess.check_output(['git','-C',os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..'),'rev-list','--count','HEAD']).decode())+1
except Exception: N=0
VER='v1.%d'%N
head=head.replace('musique générée par le code.</footer>','musique générée par le code. <b id="ver">'+VER+' · '+datetime.date.today().strftime('%d/%m/%Y')+'</b></footer>',1)
open('VERSION','w').write(VER)
head=head.replace('<title>Carchacrok Arena</title>','<title>Aces Arena</title>')
head=head.replace("Changer d'Ace",'Menu')
head='<meta charset="utf-8">\n'+head
parts=[head,'\n'.join(data)]
for f in ['../gv/gv_data.js','../ag/ag_data.js','../eg/eg_data.js','../pt/pt_data.js','../luc/luc_data.js','../ami/ami_data.js','../chz/chz_data.js','../mam/mam_data.js','../jun/jun_data.js','../mew/mew_data.js','../emp/emp_data.js','../blz/blz_data.js','new/base.js','new/a.js','new/snd_data.js','new/snd_data2.js','new/snd_data3.js','new/snd.js','new/music.js','new/c.js','new/d.js','new/h0.js','new/e.js','new/f.js','new/g1.js','new/arena.js','new/g2.js','new/g3.js','new/h.js','new/h2.js','new/aces_b.js','new/aces_c.js','new/alts.js','new/aces_d.js','new/moves.js','new/streams.js','new/archetypes.js','new/aces_e.js','new/aces_f.js','new/aces_f_logic.js','new/aces_g.js','new/aces_g_logic.js','new/balance.js','new/snd_map.js','new/snd_fix.js','new/team.js','new/ffa.js','new/taunt.js','new/net.js','new/ui2.js','new/rush.js','new/ranked.js','new/netffa.js','new/lock.js','new/settings.js','new/i18n.js']:
    t=open(f,encoding='utf-8').read()
    if f=='new/a.js': t=t.replace('/*ACES_A*/',open('new/aces_a.js',encoding='utf-8').read())
    parts.append(t)
out='\n'.join(parts)+'\n</script>\n'
open('carchacrok_new.html','w',encoding='utf-8').write(out)
m=re.search(r'<script>(.*)</script>',out,re.S)
open('s_new.js','w',encoding='utf-8').write(m.group(1))
print(len(out))
