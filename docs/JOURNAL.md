# Journal du projet (mémoire longue pour Claude Code)

Ce fichier garde le contexte qui ne tient pas dans `CLAUDE.md` : chronologie, raisons des choix, bugs rencontrés et leurs corrections, chiffres d'équilibrage. À compléter à chaque lot de travail (une ligne par changement notable, les plus récents en bas).

## Chronologie résumée
- Base : arène 1v1 en canvas, Pokémon PMDCollab, sons PMD, bots, entraînement, marathon.
- Équipes de 3 avec échange (Tab), mémoire des kits de sorts (`aceKits`), arènes avec obstacles destructibles.
- En ligne 1v1 : PeerJS (courtier public), hôte autoritaire, prédiction côté invité, poignée de main de version `GV`.
- Classé : Cloudflare Worker + Durable Object (`server/`), Elo, file d'attente idempotente, limites de débit, pseudos interdits.
- Partage public : disclaimer, crédits PMDCollab, `LICENSE`, `README.md`.
- 4 nouveaux Pokémon (Corvaillus, Lugulabre, Nymphali, Pikachu) avec 6 nouvelles capacités ; passes d'équilibrage 1 à 3.
- Paramètres (touches rebindables, son, langue, visée, souris, pseudo), curseur virtuel avec pointer lock.
- Mêlée 3-4 joueurs (v1.7x) : moteur multi-cibles, HUD dédié, pseudos, taunt, écran VS, spectateur, mêlée en ligne (étoile PeerJS).
- v1.77 (17/10/2026) : passe UI/UX : bug « ÉLIMINÉ », barres ennemies rouges, mêlée en manches BO1/3/5 avec 2 Aces max, ring, son d'action impossible, onglet Classé dédié, `CLAUDE.md`, `tests/tools/`.

## Décisions et leurs raisons
- Sons PMD uniquement : la cohérence sonore avec les sprites PMD est voulue, Lancelot a refusé deux fois les sons générés.
- Pas d'itch.io, pas de mobile : le site suffit, le jeu est conçu clavier + souris.
- Flash/échange séparés : la fusion rendait le Flash trop polyvalent. Flash réduit à 90 px avec 5 s de recharge pour compenser sa mobilité.
- Mêlée à 2 Pokémon par joueur (et non 3) : parties plus courtes à 4 joueurs.
- Ring à 75 s : 60 s jugé trop court, 90 s trop long (réponse de Lancelot). Uniquement en mêlée, proportionnel à la taille de l'arène (`AB`).
- BO en mêlée : le premier à N victoires de manche gagne (pas de points par place).
- Statistiques modifiées : `sp.official` garde la valeur officielle, jauge jaune dans la fiche pour que le joueur voie les écarts.

## Équilibrage (simulations bot contre bot, fin de passe 3)
- Étouraptor : environ 78 % de victoires, atk ramenée à 100 et recharge Cru-Aile x1,5, encore fort.
- Pikachu : faible, PV 60 / déf 55, Orbe Lumière (voir `aces_f_logic.js`).
- Zoroark : faible, atq spé 135, Tranche-Nuit puissance 22.
- Gardevoir : atq spé 140, kit de base avec Éclat Magique à la place de Gravité.
- Braségali : Vol Haut puissance 35. Corvaillus : Rapace puissance 32.
- Les scripts de simulation étaient des fichiers jetables (non gardés) : en refaire un si une nouvelle passe est demandée (bot contre bot, plusieurs centaines de combats par paire).

## Bugs notables et corrections (pour ne pas les réintroduire)
- Collisions de `const` globaux entre modules (`RUSH`, `EN`) : tout partage une portée, vérifier avant de nommer.
- `showResult` : le crochet de la mêlée doit être posé **après** les gestionnaires de `#eMenu`, sinon `onclick` nul. En classé, les boutons de fin remplacent `.ebtn`.
- Classé « un seul joueur se lance » : une équipe invalide était refusée en silence côté pair ; corrigé par pré-vérification, renvoi de `ready`, chien de garde, nouvel essai automatique et file idempotente (`queuePoll(id,token,fresh)`, `ASSIGN_TTL_MS`).
- Désynchronisation en ligne : due à des versions différentes entre joueurs ; ajout de la vérification `GV` (message « Ctrl+F5 »).
- Mêlée en ligne : le `bot`/`holdKey` d'un invité était écrasé par les snapshots (ajoutés à `OWN_SKIP`) ; onglet fermé non détecté (délai de présence de 6 s).
- Mémoire des kits : lue avant le chargement des Pokémon ajoutés plus tard (seuls les 4 premiers étaient restaurés) ; corrigé.
- HUD estompé : une règle de transition plus spécifique annulait l'opacité ; `.ht{transition:box-shadow .2s,opacity .2s}.ht.hdim{opacity:.3}`.
- Pointer lock : `setPointerCapture` peut lever `InvalidStateError`, entouré d'un `try/catch`.
- « ÉLIMINÉ » affiché à tort (v1.77) : `ffaOut` et `knockOut` pouvaient être rappelés sur un joueur déjà éliminé (zone ou projectile retardataire) : bannière relancée et doublon dans `FFA.out` (classement faux). Garde `if(t.out)return` ajoutée aux deux. Cause jamais observée en jeu réel, seulement déduite du code et testée artificiellement.
- Test « jet maintenu » intermittent : remplacé par `pressSpell(0)` direct + `wait_for_function`, échoue encore parfois.

## Détails du classé (serveur)
- Profil anonyme : pseudo + jeton dans `localStorage.aceRk`. File : tolérance Elo 100, +50 toutes les 5 s. Appariement : le serveur donne code de salle et rôle (hôte/invité), puis le combat démarre seul (BO3, 3 Aces, Colisée).
- Résultat déclaré par les deux joueurs ; issues identiques = match contesté, Elo inchangé. Abandon = défaite. Rapports refusés avant 20 s.
- Elo : départ 1200, K 40 pendant 20 parties puis K 20, plancher 100.
- Version serveur affichée dans le cadre Classé (« Serveur rank-... »). Au 17/10/2026 le dépôt est à `rank-2026.10.16c`.

## Idées proposées par Lancelot, pas encore faites
- Mode évolutif : 3 manches, une par niveau d'évolution du Pokémon.
- Objets équipables (baies, objets adaptés à l'espèce).
- Elo ou classement pour la mêlée (non demandé, juste noté comme absent).

## 17/10/2026 : 5 nouveaux Pokémon, 20 capacités, correctifs
- Luxray (assassin), Cizayox (duelliste), Lokhlass (artilleur), Nidoking (bruiser), Leuphorie (soutien) : `aces_g.js` (sprites générés depuis le clone local de SpriteCollab, pas de téléchargement) et `aces_g_logic.js` (capacités, IA `botAce7`, espèces).
- Écarts volontaires : Leuphorie Attaque 55 (officielle 10, jauge jaune). Écho = Echoed Voice (le palier monte à chaque tir réussi). Vœu soigne 40 % après 3 s. Danse Pluie = champ qui ralentit et soigne le lanceur. Pisto-Poing et Torgnoles frappent 3 fois (90 ms).
- Swap automatique après KO : 1,5 s d'invulnérabilité (`SWAP.prot`, clignote) pour éviter l'enchaînement au respawn.
- Mêlée en ligne : le décompte entre manches démarre en même temps chez l'hôte et les invités (les invités le lançaient 2,6 s trop tôt).
- Liens (Vampibaiser, Giga-Sangsue) : un coup reçu (étourdissement, recul) ne les rompt plus, seule la distance les rompt (`leash`, Vampibaiser 125).
- Paramètres : taille de l'interface 70 à 150 % (`aceUi`, zoom CSS sur la barre de sorts, les HUD, la mêlée et le menu).
- Salons en ligne : nombre d'Aces attendu affiché (3 en 1v1, 2 en mêlée) et message clair si l'équipe ne convient pas. Versus : 1 à 3 Aces.
- `tests/tools/sim_balance.py` : simulation bot contre bot rapide (boucle sans rendu), `ffa_revanche.py` et `duel_revanche.py` : parties d'affilée en salon.

## 17/10/2026 (soir) : un seul salon en ligne
- Demande : un seul écran en ligne pour le 1v1 et la mêlée. Le salon est maintenant unique (moteur de la mêlée, `netffa.js`) : à 2 joueurs, duel, 3 Aces chacun ; à 3 ou 4 joueurs, mêlée, 2 Aces chacun. Le choix d'équipe se verrouille en conséquence (2 premiers Aces gardés, les autres grisés mais conservés, le 3e redevient utilisable si on repasse à 2 joueurs). Toute équipe déjà validée est remise à « pas prêt » quand le nombre de joueurs change.
- Le 1v1 casual passe donc par le moteur de la mêlée (manches BO, pas de ring à 2 joueurs, annonce « DUEL »). Le moteur 1v1 de `net.js` ne sert plus que pour le classé.
- À vérifier avec de vrais joueurs : le duel à 2 joueurs sur le moteur de la mêlée (testé en local avec 2, 3 et 4 navigateurs).
