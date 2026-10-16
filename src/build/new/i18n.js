// ---- Langue : le code reste en français, une couche de traduction (DOM + texte canvas) bascule en anglais ----
var LANG="fr"; try{const l=localStorage.getItem("aceLang"); LANG=l==="en"||l==="fr"?l:((navigator.language||"").toLowerCase().startsWith("fr")?"fr":"en")}catch(_){}
const EN={
// noms des Aces
"Carchacrok":"Garchomp","Galeking":"Aggron","Ectoplasma":"Gengar","Tortipousse":"Turtwig","Amphinobi":"Greninja","Dracaufeu":"Charizard","Mammochon":"Mamoswine","Jungko":"Sceptile","Pingoléon":"Empoleon","Braségali":"Blaziken",
// types et catégories
"Feu":"Fire","Eau":"Water","Électrik":"Electric","Plante":"Grass","Glace":"Ice","Combat":"Fighting","Sol":"Ground","Vol":"Flying","Psy":"Psychic","Insecte":"Bug","Roche":"Rock","Spectre":"Ghost","Ténèbres":"Dark","Acier":"Steel","Fée":"Fairy","Physique":"Physical","Spécial":"Special","Statut":"Status",
// statistiques
"PV":"HP","Atq":"Atk","Déf":"Def","Atq. Spé":"Sp. Atk","Déf. Spé":"Sp. Def","Vit":"Speed","Atq. Spé ++":"Sp. Atk ++","Atq. Spé et Déf. Spé +":"Sp. Atk and Sp. Def +","Atq. et Vit. +":"Atk and Speed +","Défense +":"Defense +","Défenses +":"Defenses +","Défenses -":"Defenses -",
// noms des sorts
"Draco-Griffe":"Dragon Claw","Tir de Boue":"Mud Shot","Tunnel":"Dig","Draco-Charge":"Dragon Rush","Choc Mental":"Confusion","Pouvoir Lunaire":"Moonblast","Psyko":"Psychic","Éclat Magique":"Dazzling Gleam","Gravité":"Gravity","Plénitude":"Calm Mind","Tête de Fer":"Iron Head","Éboulement":"Rock Slide","Séisme":"Earthquake","Métal Burst":"Metal Burst","Danse-Lames":"Swords Dance","Mur de Fer":"Iron Defense","Téléport":"Teleport","Prescience":"Future Sight","Piège de Roc":"Stealth Rock","Luminocanon":"Flash Cannon","Lame de Roc":"Stone Edge","Griffe Ombre":"Shadow Claw","Ball'Ombre":"Shadow Ball","Bomb Beurk":"Sludge Bomb","Ombre Portée":"Shadow Sneak","Hypnose":"Hypnosis","Machination":"Nasty Plot","Tonnerre":"Thunderbolt","Charge":"Tackle","Forte-Paume":"Force Palm","Aurasphère":"Aura Sphere","Riposte":"Counter","Sheauriken":"Water Shuriken","Coup Bas":"Sucker Punch","Vibraqua":"Water Pulse","Laser Glace":"Ice Beam","Onde Fée":"Fairy Wind","Clonage":"Substitute","Lance-Flammes":"Flamethrower","Canicule":"Heat Wave","Danse Draco":"Dragon Dance","Poing Glace":"Ice Punch","Piétinement":"Stomp","Mur de Glace":"Ice Wall","Lame-Feuille":"Leaf Blade","Balle Graine":"Bullet Seed","Giga-Sangsue":"Giga Drain","Vive-Attaque":"Quick Attack","Frappe Psy":"Psystrike","Régénération":"Recover","Tempête de Sable":"Sandstorm","Draco-Météore":"Draco Meteor","Champ Psychique":"Psychic Terrain","Mur Lumière":"Light Screen","Rempart de Roc":"Rock Wall","Picots d'Acier":"Steel Spikes","Mains d'Ombre":"Shadow Hands","Marque Funeste":"Doom Mark","Vague d'Aura":"Aura Wave","Mine d'Aura":"Aura Mine","Vague Déferlante":"Tidal Wave","Pics Toxik":"Toxic Spikes","Mur de Flammes":"Flame Wall","Pluie de Braises":"Ember Rain","Pointes de Glace":"Ice Spikes","Vampigraine":"Leech Seed","Ronces":"Thorn Wall","Barrière":"Barrier","Éclat Psy":"Psy Burst","Aile d'Acier":"Steel Wing","Hydrocanon":"Hydro Cannon","Tourbillon":"Whirlpool","Mur d'Acier":"Steel Wall","Pied Brûleur":"Blaze Kick","Pied Voltige":"High Jump Kick","Boost Flamme":"Flame Boost","Cercle de Feu":"Fire Ring","Mine de Braises":"Ember Mine",
// arènes
"Colisée":"Colosseum","Prairie":"Meadow","Désert":"Desert","Lac gelé":"Frozen Lake","Volcan":"Volcano",
// interface
"Jouer":"Play","Entrée : jouer":"Enter: play","Combat 3 contre 3":"3 vs 3 battle","Menu":"Menu","Pause":"Pause","Pause (Échap)":"Pause (Esc)","Reprendre":"Resume","Commandes":"Controls","Échap ou P pour reprendre":"Esc or P to resume","Volume":"Volume","Général":"Master","Musique":"Music","Interface":"Interface","Visée (touche T)":"Aim (T key)","Manuelle":"Manual","Assistée":"Assisted","Verrouillée":"Locked",
"Manuelle : tu vises toi-même. Assistée : le sort cible l'ennemi si le curseur est proche. Verrouillée : tous les sorts ciblent l'ennemi.":"Manual: you aim yourself. Assisted: the spell targets the enemy if the cursor is close. Locked: every spell targets the enemy.",
"Sélection d'équipe":"Team select","Solo":"Solo","En ligne":"Online","Multijoueur":"Multiplayer","Créer un salon":"Create room","Rejoindre":"Join","Salon":"Room","Copier":"Copy","Prêt":"Ready","Quitter le salon":"Leave room","Retour au salon":"Back to lobby","Entraînement":"Training","mannequin d'entraînement":"training dummy","Versus":"Versus","contre un adversaire":"against an opponent","Facile":"Easy","Normal":"Normal","Difficile":"Hard","Rounds":"Rounds","Adversaire":"Opponent","Aléatoire":"Random","Arène":"Arena","Combattre":"Fight","Réinitialiser":"Reset","← Accueil":"← Home","Retour":"Back","Revanche":"Rematch","Choix de l'Ace":"Ace select","Mode":"Mode","Mode de jeu":"Game mode","Mode de lancer des sorts":"Spell cast mode","Difficulté":"Difficulty","Code du salon":"Room code","CODE":"CODE","Sorts":"Moves","Bouclier":"Shield","Esp":"Space","Espace":"Space","Échap":"Esc","Clic gauche":"Left click","Clic droit":"Right click","clic gauche":"left click","se déplacer":"move","se déplacer (maintenir pour suivre)":"move (hold to follow)","Survoler l'ennemi":"Hover the enemy","+ clic droit : le poursuivre":"+ right click: chase him","bouclier (maintenir)":"shield (hold)","lance le sort visé ·":"casts the aimed spell ·","ou":"or","annule":"cancel","sorts,":"spells,","pour lancer":"to cast","Langue":"Language","Français":"Français","choix de l'hôte":"host's choice",
"Le mode de lancer (clic, rapide, visée) se change avec le bouton à côté.":"The cast mode (click, quick, aim) is changed with the button next to it.",
"Sorts : lancer instantané":"Spells: instant cast","Sorts : relâcher pour lancer":"Spells: release to cast","Sorts : visée au clic":"Spells: click to aim",
"Flash (F) : blink vers le curseur":"Flash (F): blink toward the cursor","Survoler l'ennemi + clic droit : le poursuivre":"Hover the enemy + right click: chase him",
"libère la souris (bloquée en combat)":"frees the mouse (locked during fights)","Souris":"Mouse",": bloquée dans la fenêtre pendant le combat,":": locked in the window during fights,","la libère et met en pause":"frees it and pauses",
"Jeu prévu pour ordinateur : souris + clavier":"Made for computer: mouse + keyboard",
"Jeu de fans non officiel et non commercial, sans lien avec Nintendo, Game Freak, Creatures ni The Pokémon Company. Pokémon et ses personnages © Nintendo / Creatures / Game Freak. Sprites : PMDCollab SpriteCollab (CC BY-NC 4.0), originaux Chunsoft. Effets sonores : Pokémon Donjon Mystère © Chunsoft / The Pokémon Company ; musique générée par le code.":"Unofficial, non-commercial fan game, not affiliated with Nintendo, Game Freak, Creatures or The Pokémon Company. Pokémon and its characters © Nintendo / Creatures / Game Freak. Sprites: PMDCollab SpriteCollab (CC BY-NC 4.0), originals Chunsoft. Sound effects: Pokémon Mystery Dungeon © Chunsoft / The Pokémon Company; music generated by code.",
"Sélectionne ton équipe puis valide avec Prêt.":"Pick your team, then confirm with Ready.","Sélectionne 4 sorts. Les plus puissants ont un temps de recharge plus long.":"Select 4 moves. The most powerful ones have a longer cooldown.","4 sorts maximum : retire-en un d'abord.":"4 moves maximum: remove one first.","Pas assez de PP !":"Not enough PP!",
"Choisit son Ace…":"Choosing an Ace…","En attente":"Waiting","En attente…":"Waiting…","Choisir un Ace":"Pick an Ace","Retirer":"Remove",
"Ordre d'entrée 1, 2, 3 · Tab : changer d'Ace en combat":"Entry order 1, 2, 3 · Tab: switch Ace in battle",
"Connecté":"Connected","Connexion…":"Connecting…","Connexion perdue":"Connection lost","Serveur injoignable":"Server unreachable","Bibliothèque PeerJS injoignable":"PeerJS library unreachable","Code copié":"Code copied","Salon quitté":"Room left","Saisis le code du salon (4 lettres)":"Enter the room code (4 letters)",
"L'adversaire a quitté le salon":"The opponent left the room","L'adversaire a quitté le salon. Le salon reste ouvert.":"The opponent left the room. The room stays open.","L'adversaire est de retour. Valide ton équipe avec Prêt.":"The opponent is back. Confirm your team with Ready.","Équipe de l'adversaire invalide":"Invalid opponent team",
// combat
"COMBAT !":"FIGHT!","VICTOIRE":"VICTORY","DÉFAITE":"DEFEAT","ROUND GAGNÉ":"ROUND WON","ROUND PERDU":"ROUND LOST","Bloqué":"Blocked","Brûlé":"Burned","Clonage !":"Substitute!","Endormi":"Asleep","Ralenti":"Slowed","Renvoyé !":"Reflected!","Riposte !":"Counter!","Réveillé":"Woke up","Métal Burst !":"Metal Burst!","Super efficace !":"Super effective!","Très efficace !!":"Very effective!!","Pas très efficace":"Not very effective","Bouclier brisé, étourdi !":"Shield broken, stunned!","x1,6 !":"x1.6!","Éclat Magique annulé":"Dazzling Gleam cancelled","Poison":"Poison","Étourdi":"Stunned","Gelé":"Frozen",
// descriptions des sorts
"Barrière psychique 3 s : renvoie les projectiles ennemis vers leur lanceur.":"Psychic barrier for 3 s: sends enemy projectiles back to their caster.",
"Blizzard 4 s sur une grande zone : dégâts et ralentissement.":"Blizzard for 4 s over a wide area: damage and slow.",
"Bonus d'Atq. Spé et de Déf. Spé pendant 8 s.":"Sp. Atk and Sp. Def boost for 8 s.","Bonus d'Attaque et de Vitesse pendant 8 s.":"Attack and Speed boost for 8 s.","Bonus de Défense et Déf. Spé pendant 8 s.":"Defense and Sp. Def boost for 8 s.","Bonus de Défense pendant 8 s.":"Defense boost for 8 s.","Bonus de Vitesse pendant 6 s.":"Speed boost for 6 s.","Gros bonus d'Atq. Spé pendant 8 s.":"Big Sp. Atk boost for 8 s.",
"Canalise sur place, puis rayon long qui traverse tout et étourdit.":"Channels in place, then a long beam that pierces everything and stuns.",
"Canalise, puis charge longue qui étourdit le premier touché. Interrompue si on est touché pendant la canalisation.":"Channels, then a long charge that stuns the first target hit. Interrupted if you are hit while channeling.",
"Cinq météores s'abattent au hasard autour de la zone visée. Chacun touche séparément.":"Five meteors fall at random around the targeted area. Each one hits separately.",
"Coup d'aile devant soi, large et rapide.":"Wing strike in front of you, wide and fast.","Coup de lame devant soi. Très rapide.":"Blade strike in front of you. Very fast.","Coup de pied enflammé devant soi. Peut brûler.":"Flaming kick in front of you. May burn.","Coup de poing glacé devant soi : rapide, ralentit la cible 1,4 s.":"Icy punch in front of you: fast, slows the target for 1.4 s.",
"Deux cercles de flammes autour de toi, le second plus large. Brûle et repousse.":"Two rings of flames around you, the second wider. Burns and knocks back.","Deux ondes d'aura s'étendent autour de toi, la seconde plus large. Repousse.":"Two aura waves spread around you, the second wider. Knocks back.",
"Esquive éclair dans la direction visée (intouchable 0,3 s), laisse un clone et remet Coup Bas à zéro.":"Lightning dodge toward the aimed direction (untouchable for 0.3 s), leaves a clone and resets Sucker Punch.",
"Fonce en jet d'eau à travers l'adversaire et le repousse.":"Dashes as a water jet through the opponent and knocks them back.","Fonce sous terre (intouchable) et surgit pour frapper autour du trou. Remet le corps à corps à zéro.":"Burrows underground (untouchable) and pops out to strike around the hole. Resets melee cooldowns.","Fonce à travers l'adversaire sur une courte distance.":"Dashes through the opponent over a short distance.","Fonce à travers l'adversaire. Dégâts x1,6 s'il est en train de lancer un sort.":"Dashes through the opponent. Damage x1.6 if they are casting a spell.","Fonce à travers l'ombre sur une courte distance et frappe le premier touché.":"Dashes through the shadows over a short distance and strikes the first target hit.","Fonce, puis 3 coups en rafale (armure pendant la rafale). Baisse tes défenses 4 s. Un bouclier arrête la rafale.":"Dashes, then 3 rapid hits (armor during the flurry). Lowers your defenses for 4 s. A shield stops the flurry.",
"Frappe de la paume devant soi : rapide, ralentit la cible 1,4 s.":"Palm strike in front of you: fast, slows the target for 1.4 s.","Graines 6 s sur la zone visée : drainent l'ennemi et te rendent des PV.":"Seeds for 6 s on the targeted area: drain the enemy and restore your HP.",
"Ligne de pointes qui jaillit après un court délai.":"A line of spikes that bursts out after a short delay.","Marque posée au sol : empoisonne et ralentit l'ennemi qui la touche.":"Mark set on the ground: poisons and slows the enemy who touches it.","Mine d'aura : explose au contact et projette l'ennemi au loin.":"Aura mine: explodes on contact and sends the enemy flying.","Mine de braises : explose au contact, brûle et étourdit brièvement.":"Ember mine: explodes on contact, burns and briefly stuns.",
"Mur d'acier 4 s : bloque projectiles et déplacements de tous.":"Steel wall for 4 s: blocks projectiles and movement for everyone.","Mur de flammes 4 s : enflamme qui le traverse. Ne bloque pas.":"Flame wall for 4 s: sets fire to whoever crosses it. Does not block.","Mur de lumière 4,5 s : arrête les projectiles ennemis. Tu peux passer.":"Light wall for 4.5 s: stops enemy projectiles. You can walk through.","Mur de ronces 5 s : bloque l'ennemi et le blesse au contact.":"Thorn wall for 5 s: blocks the enemy and hurts on contact.",
"Onde centrée sur soi, forte poussée et étourdissement.":"Wave centered on you, strong knockback and stun.","Onde féerique en ligne droite. Counter naturel de Carchacrok (Dragon).":"Fairy wave in a straight line. Natural counter to Garchomp (Dragon).","Onde psychique devant soi, légèrement plus longue que les griffes.":"Psychic wave in front of you, slightly longer than the claws.","Orbe féerique en ligne droite.":"Fairy orb in a straight line.","Orbe lent : endort la cible 1,4 s. Un coup la réveille.":"Slow orb: puts the target to sleep for 1.4 s. Any hit wakes it.",
"Petit élan et coup au front qui étourdit.":"Short run-up and a headbutt that stuns.","Pics empoisonnés : poison 4 s et ralentissement au contact.":"Poison spikes: poison for 4 s and slow on contact.","Piège invisible à moitié : étourdit et ralentit le premier qui marche dessus. Un seul à la fois.":"Half-hidden trap: stuns and slows the first one to step on it. Only one at a time.","Piétine le sol : onde autour de soi qui repousse et étourdit brièvement. Pas besoin de viser.":"Stomps the ground: a wave around you that knocks back and briefly stuns. No aiming needed.",
"Pointes de glace : gèlent un instant l'ennemi qui marche dessus.":"Ice spikes: briefly freeze the enemy who steps on them.","Pose un piège qui reste 9 s. Le premier qui marche dessus est blessé et ralenti. Un seul à la fois.":"Sets a trap that lasts 9 s. The first one to step on it is hurt and slowed. Only one at a time.","Posture de 1,2 s : le prochain coup reçu, même à distance, est rendu à 160 %.":"1.2 s stance: the next hit received, even from range, is returned at 160%.","Posture de riposte : le prochain coup reçu est rendu à 150 %.":"Counter stance: the next hit received is returned at 150%.",
"Projectile d'acier rapide et précis.":"Fast and accurate steel projectile.","Projectile de boue en ligne droite.":"Mud projectile in a straight line.","Projectile lobé : explose sur la zone visée puis laisse une flaque qui empoisonne 3 s.":"Lobbed projectile: explodes on the targeted area then leaves a puddle that poisons for 3 s.",
"Quatre ondes en croix, puis un éclat central plus fort. Repousse.":"Four waves in a cross, then a stronger central burst. Knocks back.","Rayon de glace rapide. Counter naturel de Carchacrok (Dragon/Sol).":"Fast ice beam. Natural counter to Garchomp (Dragon/Ground).","Rend 30 % des PV max. Longue recharge.":"Restores 30% of max HP. Long cooldown.",
"S'envole puis plonge sur la cible. Intouchable pendant l'élan.":"Takes off then dives onto the target. Untouchable during the run-up.","Saut et coup de pied très puissant. Si le coup rate, il se blesse.":"Jump and a very powerful kick. If it misses, he hurts himself.","Se téléporte à l'endroit visé (portée 130). Aucun dégât.":"Teleports to the targeted spot (range 130). No damage.","Sept braises tombent autour de la zone visée. Chaque touche enflamme.":"Seven embers fall around the targeted area. Each one that hits sets fire.",
"Souffle un cône de flammes court devant soi. Brûle la cible 3 s.":"Blows a short cone of flames in front of you. Burns the target for 3 s.","Sphère d'aura rapide qui infléchit sa course vers la cible. Difficile à esquiver de face.":"Fast aura sphere that bends toward the target. Hard to dodge head on.","Sphère d'ombre en ligne droite.":"Shadow sphere in a straight line.","Spore aspirante en ligne droite : rend la moitié des dégâts infligés en PV.":"Draining spore in a straight line: restores half the damage dealt as HP.",
"Tempête de sable sur la zone visée 4,5 s : dégâts et gros ralentissement.":"Sandstorm on the targeted area for 4.5 s: damage and heavy slow.","Terrain psychique 5 s : ralentit l'ennemi et te soigne tant que tu y restes.":"Psychic terrain for 5 s: slows the enemy and heals you while you stay in it.","Tourbillon d'eau 4 s sur la zone visée : dégâts et gros ralentissement.":"Water whirlpool for 4 s on the targeted area: damage and heavy slow.",
"Trois griffures devant soi. Rapide, enchaîne après Tunnel.":"Three slashes in front of you. Fast, chains after Dig.","Trois gros rochers 5 s : bloquent tout, projectiles et déplacements.":"Three big rocks for 5 s: block everything, projectiles and movement.","Trois mains d'ombre jaillissent en triangle autour de la zone visée et ralentissent.":"Three shadow hands burst out in a triangle around the targeted area and slow.","Trois shurikens d'eau en éventail. Chacun touche séparément.":"Three water shurikens in a fan. Each one hits separately.",
"Un bloc de glace s'écrase sur la zone visée après un court délai : dégâts, recul et ralentissement.":"An ice block crashes onto the targeted area after a short delay: damage, knockback and slow.","Une vague déferle en ligne vers la cible : six impacts qui ralentissent.":"A wave rolls in a line toward the target: six slowing impacts.",
"Zone d'eau qui jaillit après un court délai : dégâts et ralentit 1,8 s.":"Water zone that bursts out after a short delay: damage and slows for 1.8 s.","Zone visée qui explose après un court délai.":"Targeted area that explodes after a short delay.","Zone visée qui explose puis reste en feu 2,6 s : brûle ceux qui y restent.":"Targeted area that explodes then stays on fire for 2.6 s: burns anyone who stays.","Zone visée qui n'explose qu'après 1,5 s : il faut anticiper l'adversaire.":"Targeted area that only explodes after 1.5 s: you must predict the opponent.","Zone visée, dégâts x1,6 si la cible est empoisonnée, ralentie, étourdie ou endormie.":"Targeted area, damage x1.6 if the target is poisoned, slowed, stunned or asleep.",
"Éclair rapide en ligne droite.":"Fast lightning bolt in a straight line.","Énorme jet d'eau lent en ligne droite. Dégâts très élevés, ralentit.":"Huge slow water jet in a straight line. Very high damage, slows.","Énorme onde psychique en ligne droite. Très forte, longue recharge.":"Huge psychic wave in a straight line. Very strong, long cooldown."
};
// motifs pour les textes dynamiques
const PAT=[
 [/^(.+) utilise (.+) !$/,"$1 uses $2!"],[/^(.+) est K\.O\. !$/,"$1 fainted!"],[/^(.+) entre en jeu !$/,"$1 enters the battle!"],[/^(.+) annulée?$/,"$1 cancelled"],
 [/^Premier à (\d+) rounds?$/,"First to $1 rounds"],[/^Match en 1 round$/,"1-round match"],[/^Sélectionne (\d) Aces?$/,"Select $1 Aces"],[/^Sélectionne (\d) sorts?$/,"Select $1 moves"],
 [/^Donne-lui le code (\w+)$/,"Give him the code $1"],[/^Arène avec (.+)$/,"Arena with $1"],[/^Visée : (.+)$/,"Aim: $1"],[/^: (.+)$/,": $1"],[/^(.+) \((.+), (physique|spécial|statut)\)$/,"$1 ($2, $3)"],
 [/^(Physique|Spécial|Statut) · (.+?)(?: · Puiss\. (\d+))? · Recharge (.+) s$/,"$1 · $2 · Power $3 · Cooldown $4 s"]
];
Object.assign(typeof I18N_EXTRA!=="undefined"?I18N_EXTRA:(I18N_EXTRA={}),{"Griffures spectrales devant soi. Rapide.":"Spectral claws in front of you. Fast.","Trois rochers tombent en ligne devant soi.":"Three rocks fall in a line ahead.","Bonus d'Attaque pendant 8 s.":"Attack boost for 8 s.","Zone qui aspire l'adversaire pendant 2,4 s.":"Zone that pulls the opponent in for 2.4 s.","Graine explosive en ligne droite.":"Explosive seed in a straight line."});
Object.assign(EN,I18N_EXTRA,{"Marathon":"Marathon","16 adversaires d'affilée, au chrono":"16 opponents in a row, against the clock","Rejouer":"Play again","Jets (Lance-Flammes, Hydrocanon, Blizzard)":"Streams (Flamethrower, Hydro Cannon, Blizzard)"," : maintenir la touche, on reste immobile, relâcher coupe":": hold the key, you stand still, release to stop",": maintenir la touche, on reste immobile, relâcher coupe":": hold the key, you stand still, release to stop","Sélection d'équipe":"Team select"});
Object.assign(EN,{"Ronflex":"Snorlax","Tyranocif":"Tyranitar","Zoroark":"Zoroark","Étouraptor":"Staraptor"});
Object.assign(EN,{"TOI":"YOU","ADVERSAIRE":"OPPONENT","Toi":"You","BOT FACILE":"BOT EASY","BOT NORMAL":"BOT NORMAL","BOT DIFFICILE":"BOT HARD","Hôte":"Host","physique":"physical","spécial":"special","statut":"status","Puiss.":"Power","Clic droit sur l'ennemi":"Right click on the enemy","le poursuivre":"chase him","se déplacer (maintenir pour suivre)":"move (hold to follow)","changer d'Ace (0,5 s)":"switch Ace (0.5 s)","Flash, téléportation vers le curseur (recharge 12 s)":"Flash, teleport to the cursor (12 s cooldown)","lancer le sort ·":"cast the spell ·","Le mode de lancer se règle dans le menu Pause.":"The cast mode is set in the Pause menu.","Tab":"Tab","annuler":"cancel","Changer d'Ace (Tab)":"Switch Ace (Tab)"});
let _names=null; const names=()=>_names||(_names=[].concat(Object.values(SPL).map(s=>s.name),Object.values(SPECIES).map(s=>s.name)).filter(n=>EN[n]&&EN[n]!==n).sort((a,b)=>b.length-a.length));
const L_=/[\p{L}]/u;
const _tc=new Map();
function tr(s){
  if(LANG!=="en"||typeof s!=="string"||!s)return s;
  if(_tc.has(s))return _tc.get(s);
  const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/); const core=m[2]; let out=core;
  if(core){
    if(EN[core]!==undefined)out=EN[core];
    else{
      let hit=false;
      for(const [re,rep] of PAT){if(re.test(core)){out=core.replace(re,(...a)=>rep.replace(/\$(\d)/g,(_,i)=>tr(a[+i])));hit=true;break}}
      if(!hit){ // remplace les noms connus à l'intérieur d'une phrase
        out=core;
        for(const n of names()){let i=out.indexOf(n);while(i>=0){const b=out[i-1],a=out[i+n.length];if(!(b&&L_.test(b))&&!(a&&L_.test(a))){out=out.slice(0,i)+EN[n]+out.slice(i+n.length);i=out.indexOf(n,i+EN[n].length)}else i=out.indexOf(n,i+1)}}
      }
    }
  }
  out=out.replace(/(\d),(\d)/g,'$1.$2'); const r=m[1]+out+m[3]; if(_tc.size>4000)_tc.clear(); _tc.set(s,r); return r;
}
// --- texte dessiné sur les canvas ---
(function(){const P=CanvasRenderingContext2D.prototype,f=P.fillText,st=P.strokeText;
  P.fillText=function(t,...a){return f.call(this,LANG==="en"?tr(String(t)):t,...a)};
  P.strokeText=function(t,...a){return st.call(this,LANG==="en"?tr(String(t)):t,...a)};
})();
// --- DOM : chaque noeud garde son texte français d'origine (__o) ---
const ATTRS=["title","aria-label","placeholder"];
function doText(n){
  if(n.__t!==undefined&&n.nodeValue===n.__t)return;
  n.__o=n.nodeValue; let t=tr(n.__o); if(t==="Fighting"&&n.parentElement&&n.parentElement.tagName==="LABEL")t="Battle"; n.__t=t; if(t!==n.nodeValue)n.nodeValue=t;
}
function doEl(el){
  for(const a of ATTRS){if(!el.hasAttribute||!el.hasAttribute(a))continue;const v=el.getAttribute(a); el.__a=el.__a||{};
    if(el.__a[a]&&el.__a[a][1]===v)continue; const t=tr(v); el.__a[a]=[v,t]; if(t!==v)el.setAttribute(a,t)}
}
function walk(root){
  if(root.nodeType===3){doText(root);return}
  if(root.nodeType!==1)return;
  if(root.tagName==="SCRIPT"||root.tagName==="STYLE")return;
  doEl(root);
  for(let c=root.firstChild;c;c=c.nextSibling)walk(c);
}
function retranslateAll(){
  const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);
  let n; while((n=w.nextNode())){
    if(n.nodeType===3){ const o=(n.__o!==undefined&&n.nodeValue===n.__t)?n.__o:n.nodeValue; n.__o=o; let t=tr(o); if(t==="Fighting"&&n.parentElement&&n.parentElement.tagName==="LABEL")t="Battle"; n.__t=t; if(t!==n.nodeValue)n.nodeValue=t }
    else if(n.__a){for(const a in n.__a){const [o,t]=n.__a[a];if(n.getAttribute(a)===t){const nt=tr(o);n.__a[a]=[o,nt];n.setAttribute(a,nt)}}}
    else doEl(n);
  }
  document.title=tr("Aces Arena"); document.documentElement.lang=LANG;
}
function setLang(l){LANG=l; try{localStorage.setItem("aceLang",l)}catch(_){} _tc.clear(); retranslateAll(); document.querySelectorAll(".langbtn").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.l===l)));
  try{if(typeof refreshMenu==="function")refreshMenu()}catch(_){}}
(function(){
  let busy=false;
  const mo=new MutationObserver(ms=>{if(busy||LANG!=="en")return;busy=true;try{for(const m of ms){if(m.type==="characterData")doText(m.target);else if(m.type==="attributes")doEl(m.target);else m.addedNodes.forEach(walk)}}finally{busy=false}});
  mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
  // sélecteur de langue : dans les options (pause) et en haut de la sélection d'équipe
  const mk=()=>{const d=document.createElement("div");d.className="langrow";d.innerHTML='<span>Langue</span><button type="button" class="langbtn" data-l="fr">Français</button><button type="button" class="langbtn" data-l="en">English</button>';d.querySelectorAll("button").forEach(b=>{b.setAttribute("aria-pressed",String(b.dataset.l===LANG));b.onclick=e=>{e.stopPropagation();setLang(b.dataset.l)}});return d};
  const pb=document.querySelector("#pause .pbox"); if(pb){const v=pb.querySelector(".vols"); pb.insertBefore(mk(),v||null)}
  const mb=document.querySelector("#menu .mbox"); if(mb){const d=mk();d.classList.add("langtop");mb.appendChild(d)}
  if(LANG==="en")retranslateAll();
})();
