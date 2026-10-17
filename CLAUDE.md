# Aces Arena : guide de reprise pour Claude Code

Jeu d'arène en **un seul fichier HTML** (canvas 2D), combats en temps réel vue de dessus, Pokémon avec sprites PMDCollab, sons PMD.
Auteur : Lancelot (`layake` sur GitHub, game designer, francophone). Site : `arena.lensslo.com` (GitHub Pages, branche `main` de `layake/arene`, fichier `CNAME` et `index.html` à la racine).
Lis ce fichier en entier avant de toucher au code. L'historique détaillé, les pièges et les chiffres sont dans `docs/JOURNAL.md`.

## 1. Comment travailler avec Lancelot (priorité maximale)
- **Début de chaque session** : lancer toi-même `git pull` (Lancelot ne doit pas avoir à le faire), vérifier `git status` et `git log --oneline | head -5`, puis relire ce fichier. En fin de session : tests, build, commit, push.
- Réponses **courtes, en français**. **Jamais de tiret cadratin** (le caractère long). Utiliser `:`, `-`, parenthèses ou virgules.
- Esprit sceptique : il n'a pas toujours raison, toi non plus. Vérifier par test, simulation ou capture d'écran avant d'affirmer. Ne jamais dire « ça marche » sans l'avoir exécuté.
- Avant une décision de **game design** : poser **au plus 3 questions** (outil de questions à choix si disponible), puis agir. Pour un bug ou une évidence : ne pas demander, corriger.
- Envoyer des **messages d'avancement** réguliers pendant les longues tâches (il ne regarde pas toujours).
- Il est sous **Windows / PowerShell** : toute commande qu'il doit lancer lui-même doit être en PowerShell (`;` et non `&&`, chemins `D:\claudeCode\arene`).
- Il ne code pas : il décrit ce qu'il veut en langage naturel, tu fais tout (code, build, tests, commit, push). Expliquer sans jargon quand c'est lui qui doit agir.
- **Git** : une seule poussée par lot de travail. Version affichée `v1.N` = nombre de commits + 1 (calculée par `build.py`). Si le dépôt a des changements non commités, commit + push avant de finir. Si Lancelot a refusé quelque chose, pousser sur une branche `wip/...` et non sur `main` (`main` publie le site immédiatement).
- Messages de commit en français, descriptifs, terminés par les lignes d'attribution demandées par l'environnement.
- Captures d'écran : tester au moins 1280x720 et 1920x1080 pour tout changement d'interface. Lancelot a déjà signalé « plein de cas où le HUD ne s'adapte pas » : en cas de doute, demander une capture.

## 2. Décisions de design déjà prises (ne pas les rouvrir sans qu'il le demande)
- **Sons** : on garde les sons PMD d'origine. **Ne jamais générer de sons.** Le retour « action impossible » rejoue l'échantillon 307 plus grave (`sfxDeny` dans `snd.js`) : à valider à l'oreille avec lui.
- **Distribution** : le site seulement. Pas d'itch.io. **Mobile non pris en charge** (juste un avertissement).
- **Flash** : portée 90 px, recharge 5 s. **Échange** d'Ace sur la touche Tab. **La fusion Flash + échange a été refusée puis annulée.**
- **Mêlée** (chacun pour soi) : 3 ou 4 combattants, 2 Pokémon chacun, le dernier debout gagne la manche. BO1, BO3 ou BO5 (premier à 2 victoires en BO3), choisi dans l'onglet Solo (en ligne : réglage de l'hôte). Pas d'Elo en mêlée. Ring (zone qui se resserre) après 75 s, en 40 s, uniquement en mêlée, taille proportionnelle à l'arène, dégâts 5 % des PV max par seconde hors zone.
- **Classé** : 1v1, BO3, équipe de 3 Aces, arène Colisée, Elo départ 1200 (K 40 puis 20), onglet dédié « Classé ».
- **Statistiques** : les ajustements d'équilibrage gardent la valeur officielle dans `sp.official` et la fiche affiche une **jauge jaune** quand une stat a été changée (`balance.js`).
- Barres de vie : ennemis en rouge, joueur vert/jaune/rouge selon les PV.
- Textes : tout est bilingue FR/EN (`i18n.js`, `LANG`). Toute nouvelle chaîne visible doit avoir sa version anglaise.

## 3. Construire, tester, publier
```
cd src/build
python3 build.py && node --check s_new.js
cp carchacrok_new.html ../../index.html && rm -f s_new.js carchacrok_new.html
```
- `build.py` concatène les modules `src/build/new/*.js` dans l'ordre de sa liste. **Tout partage une seule portée globale** : un `const`/`let` redéclaré plante tout le jeu. Les fichiers chargés plus tard enveloppent les fonctions des précédents (`const _x=fn; fn=function(){...}`, souvent dans un `setTimeout(...,0)` quand la cible est définie plus tard).
- L'en-tête et le pied de page HTML viennent de `src/build/carchacrok_v58_backup.html` : **ne jamais le supprimer**. Le menu HTML est dans `build.py` (variable `menu`).
- `index.html` est un artefact généré **mais commité** (c'est lui que GitHub Pages sert). Toujours rebuilder avant de commiter.
- `src/SC/` (sprites PMDCollab, sparse checkout) est ignoré par git. Pour ajouter un Pokémon : `src/getmon.sh` puis `src/gen_sprite.py` (voir leurs en-têtes), puis déclarer l'espèce dans `aces_*.js`.

### Tests (à lancer avant chaque push)
- `python3 tests/run.py` : Playwright, environ 3 minutes. Lancer en arrière-plan et attendre la fin. Ne pas lancer d'autres tests lourds en parallèle (un test de bot a échoué une fois à cause de la charge, puis est repassé). Le test « jet maintenu » est parfois instable (Lancelot a confirmé que les jets marchent en jeu).
- `node tests/server.test.mjs` : 29 tests du serveur classé.
- `tests/tools/` : scénarios Playwright à lancer à la demande (`npm install` dans ce dossier d'abord, les captures vont dans `tests/tools/out/`) :
  - `duel_ffa_manches.py` : sélection 2 Aces, manches BO3 de mêlée, ring, anti-doublon d'élimination.
  - `ffa_reseau.py [N]` : mêlée en ligne à N navigateurs (serveur PeerJS local lancé par le script), manches, ring, fin de partie.
  - `ffa_captures.py` : captures VS / combat / spectateur / fin en 1280 et 1920.
  - `onglet_classe.py` : onglets Solo / En ligne / Classé.
  - `classe_reseau.py` : classé de bout en bout avec 2 navigateurs (lance `server/dev.js` + serveur PeerJS local).
- Réseau en local à la main : `node tests/tools/node_modules/peer/dist/bin/peerjs.js --host 127.0.0.1 --port 9000 --path /` puis ajouter `?peerhost=127.0.0.1&peerport=9000` à l'URL.

### Serveur classé (Cloudflare)
- Code dans `server/` (`core.js` logique pure testable, `routes.js` API, `worker.js` Durable Object). URL : `https://arene-ranked.lensslo.workers.dev` (`/api/health` donne la version). Constante `SERVER_VERSION` dans `routes.js` : **la changer à chaque modification du serveur**.
- **Tu ne peux pas déployer toi-même** (sauf si la session a un accès Cloudflare) : après une modification du serveur, dire à Lancelot de lancer (PowerShell) `cd D:\claudeCode\arene; git pull; cd server; npx wrangler deploy`, puis de vérifier la version dans le pied du cadre Classé du jeu.
- Détails dans `docs/CLASSE.md`.

## 4. Architecture (modules de `src/build/new/`)
| Fichier | Rôle |
|---|---|
| `base.js`, `a.js` | constantes monde (`WORLD` 450x275), types et table d'efficacité, stats, sorts (`SPL`), espèces (`SPECIES`) |
| `aces_a..g.js`, `aces_f_logic.js`, `aces_g_logic.js`, `alts.js` | données et logique des Pokémon et sorts (`aces_f.js` et `aces_g.js` : sprites générés, très gros, ne pas lire en entier ; `aces_g_logic.js` : Luxray, Cizayox, Lokhlass, Nidoking, Leuphorie et leurs 20 sorts) |
| `moves.js`, `archetypes.js`, `streams.js` | archétypes de sorts : `defMelee`, `defStream`, `defRay`, `defWave`, `defTether`, `defBurst` ; registres `FX_DRAW`, `FX_UPDATERS` |
| `c.js` | entités (`makeFighter`, `e.bot` = IA), `resetRound`, `foesOf/foeOf` (multi-cibles) ; l'IA des bots se trouve en cherchant `e.bot` et `botEquip` (`aces_c.js`, `f.js`, `team.js`) |
| `d.js` | dégâts (`applyDamage`, `strike`), `knockOut`, `spendPP`, collisions |
| `e.js` | `cast()` (aiguillage des sorts), Psyko, Téléport, ruées (`RUSHES`), tunnel |
| `f.js` | Tortipousse (mannequin d'entraînement) et IA associée |
| `g1.js` | fond pixel-art des arènes (sol généré une fois) |
| `h0.js`, `h.js`, `h2.js` | mécaniques et effets de Lucario, Amphinobi, Dracaufeu, Mammochon ; `castFlash` est dans `h2.js` |
| `arena.js` | arènes, obstacles (`OBST`), zone jouable `AB`, spawn |
| `g2.js` | rendu canvas (sprites, barres de vie, zones) |
| `g3.js` | HUD 1v1, menu de sélection, touches (`BIND`), `pressSpell`, `refreshMenu`, `teamNeed/teamCap` |
| `team.js` | équipes de Pokémon, échange (`startSwap`), `teamKO` |
| `ffa.js` | **mêlée** : `ffaStart`, `ffaOut`, manches (`ffaRoundEnd`), ring, HUD `#ffaBar`, écran VS, spectateur, classement |
| `taunt.js` | taunt (touche G), cercles de couleur, pseudos au-dessus des Pokémon |
| `net.js` | **en ligne 1v1** : PeerJS, hôte autoritaire, prédiction invité, version `GV`, hooks classé |
| `netffa.js` | **mêlée en ligne** : étoile PeerJS (hôte `arene-m-CODE`, 3 invités max), snapshots 20 Hz, `NET.ffa` |
| `ranked.js` | client du classé : profil, file d'attente, onglet Classé, classement |
| `ui2.js` | bannières, compte à rebours, écran VS, mémoire des kits, retour sonore « impossible » |
| `rush.js` | mode marathon |
| `settings.js`, `lock.js`, `i18n.js` | Paramètres (touches, son, langue, pseudo), curseur virtuel (pointer lock), traductions |
| `snd.js`, `snd_map.js`, `snd_fix.js`, `snd_data*.js` | audio, correspondance sorts/sons PMD (`docs/SONS.md`) |
| `balance.js` | passe d'équilibrage (stats, puissances, recharges par Pokémon `sp.cdMod`) |
| `menu.css` | styles du menu |

Concepts clés :
- Modes : `matchMode` vaut `"duel"`, `"train"`, `"rush"` ou `"ffa"`. `isMulti()` pour la mêlée. Ne jamais supposer un seul adversaire : utiliser `foesOf(e)` / `foeOf(e)`.
- Entités de mêlée : indicateurs `out` (éliminé), `gone` (sorti de l'arène), `col`, `pname`, `slotId`. État global `FFA={n,out,endT,w,round,need,nextT,t,...}`.
- Réseau : l'hôte simule, les invités envoient leurs ordres (`mv`, `cast`, `sh`, `hold`) et reçoivent des snapshots. Tout nouvel état de jeu synchronisé doit être ajouté au snapshot (`netffa.js` : champs `fw`, `fn`, `fr`, `ft`, `out`).
- Les incohérences de version entre joueurs sont bloquées par `GV` : recharger les deux avec Ctrl+F5 après une mise à jour.
- Buffs et débuffs ajoutés après coup : déclarer dans `BUFF` et dans `NEWBF` (`a.js`), champs `atk/spa/def/spd/spe` lus par `bfN` (dégâts et vitesse). `bfGive(cible,clé)` l'applique.
- Stockage local : `aceKeys`, `aceUi` (taille interface 70-150), `aceLock`, `aceName`, `aceKits`, `aceTeam`, `aceRk`, `aceBest`, `aceBo`, `aceMode`, `aceKey`, `aceDiff`, `aceFoe`, `aceArena`, `castMode`.
- Ajouter une capacité : suivre `docs/AJOUTER_UNE_CAPACITE.md` (fiche de contrôle en 6 étapes : fidélité au vrai jeu, archétype, visuel, son, ressenti, test).

## 5. État actuel (version v1.77, 17/10/2026)
Fait et testé : 25 Pokémon jouables, duel 1v1 et entraînement, marathon, équipes de 3 avec échange, en ligne 1v1 (PeerJS), classé (Cloudflare + Elo), mêlée 3-4 joueurs hors ligne et en ligne avec manches BO1/3/5, pseudos, taunt, HUD dédié, spectateur, ring, Paramètres et rebind des touches, curseur virtuel, passes d'équilibrage 1 à 3, retours sonores d'action impossible, onglet Classé, disclaimer/crédits/licence dans `README.md` et `LICENSE`.

Jamais testé avec de vrais joueurs distants : classé et mêlée en ligne (seulement en local avec plusieurs navigateurs).

## 6. À faire (ordre voulu par Lancelot)
Objectif déclaré : **jeu stable, UI sans incohérences, le moins de frictions possible** (passe UI/UX). Chantiers restants dans cet esprit :
1. Vérifier les écrans VS 3 et 4 joueurs en ligne et à toutes les tailles d'écran (l'écran d'annonce `ffaVersus` existe, couverture à confirmer visuellement).
2. Chasser les cas où le HUD ne s'adapte pas (demander des captures à Lancelot, tester 1280x720, 1920x1080, fenêtres étroites).
3. Retour de Lancelot attendu sur : le son « impossible » (307 plus grave), le timing du ring (75 s / 40 s), le texte « ÉLIMINÉ » (corrigé via anti-doublon dans `ffaOut` et `knockOut`, jamais reproduit en jeu réel : s'il revient, noter dans quelle situation).
4. Sons des sorts des autres invités en mêlée en ligne (non entendus aujourd'hui).
5. Équilibrage restant : Étouraptor encore fort (environ 78 % de victoires en simulation), Pikachu et Zoroark faibles (voir `docs/JOURNAL.md`).
6. Test instable « jet maintenu » dans `tests/run.py` : le stabiliser.
7. **Après** les corrections (propositions de Lancelot, à cadrer avec lui en 3 questions max) : **mode évolutif** (3 manches, une par niveau d'évolution) et **objets équipables** sur les Pokémon (baies, etc., adaptés à chaque espèce).
8. Redéploiement du serveur classé si `SERVER_VERSION` est en retard sur le dépôt (à faire par Lancelot, voir plus haut).

## 7. Pièges connus
- Un seul fichier de 4 Mo : ne jamais `Read` `index.html`, `aces_f.js` ni `snd_data*.js` en entier ; utiliser `Grep` et des lectures ciblées.
- Les hooks par enveloppement de fonction dépendent de l'ordre de `build.py` : ajouter un module = l'insérer au bon endroit dans la liste.
- `showResult` est enveloppé plusieurs fois (mêlée, réseau, classé) : l'ordre compte, ne pas réordonner sans tests.
- La sélection d'équipe (`picks`) est partagée entre modes : la mêlée n'utilise que les 2 premiers (`teamCap()`).
- Le pointer lock : `Esc` relâche et met en pause (comportement voulu).
- Les captures et scripts jetables vont dans le dossier temporaire de la session, jamais dans le dépôt (sauf `tests/tools/`).
