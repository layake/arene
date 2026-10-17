# Aces Arena : guide pour Claude Code

Jeu d'arène en un seul fichier HTML (canvas), sprites PMDCollab. Site : `arena.lensslo.com` (GitHub Pages, branche `main` de `layake/arene`).
Auteur : Lancelot (game designer, francophone).

## Préférences de travail (à respecter)
- Réponses courtes, en français, jamais de tiret cadratin.
- Avant une décision de game design : au plus 3 questions. Messages d'avancement réguliers.
- Esprit sceptique : vérifier par test ou capture avant d'affirmer.
- Utilisateur sous Windows/PowerShell (donner les commandes en PowerShell).
- Commits : une seule poussée par lot. Si l'utilisateur a refusé quelque chose, pousser sur une branche `wip/...`, pas sur `main`.
- Messages de commit terminés par les lignes d'attribution demandées par l'environnement.

## Décisions déjà prises
- Garder les sons PMD d'origine, ne jamais générer de sons (l'unique retour « action impossible » rejoue le son 307 plus grave).
- Pas d'itch.io : le site seulement. Mobile non pris en charge.
- Pas de fusion Flash + échange (refusée, annulée). Flash : 90 px de portée, 5 s de recharge. Échange sur Tab.
- Mêlée : 3 ou 4 combattants, 2 Pokémon chacun, chacun pour soi, BO1/BO3/BO5 (points par manche), ring qui se resserre après 75 s.

## Construire
```
cd src/build && python3 build.py && node --check s_new.js
cp carchacrok_new.html ../../index.html && rm -f s_new.js carchacrok_new.html
```
- Les modules `src/build/new/*.js` sont concaténés dans l'ordre de `build.py` : tout partage une seule portée globale (un `const` redéclaré plante).
- Ne pas supprimer `src/build/carchacrok_v58_backup.html` (en-tête/pied de page).
- La version affichée (`v1.N`) vient du nombre de commits + 1.

## Tests
- `python3 tests/run.py` (Playwright, environ 3 min). Le test « jet maintenu » est parfois instable.
- `node tests/server.test.mjs` (serveur classé).
- Réseau en local : `node pj/node_modules/peer/dist/bin/peerjs.js --host 127.0.0.1 --port 9000 --path /` puis `?peerhost=127.0.0.1&peerport=9000`.

## Architecture rapide
- Moteur : `c.js` (entités, `foesOf/foeOf`), `d.js` (dégâts, KO), `e.js` (lancement des sorts), `g2.js` (rendu), `g3.js` (HUD, menu, touches), `ui2.js` (bannières, compte à rebours, sauvegardes).
- Sorts : `moves.js`, `archetypes.js`, `streams.js`, `aces_*.js`, équilibrage dans `balance.js`.
- Équipes et échange : `team.js`. Mêlée : `ffa.js` (moteur, HUD, ring, manches), `netffa.js` (réseau PeerJS en étoile), `taunt.js`.
- En ligne 1v1 : `net.js` (hôte autoritaire, version `GV`). Classé : `ranked.js` (client) et `server/` (Cloudflare Worker + Durable Object, voir `docs/CLASSE.md`). Après toute modification du serveur : `git pull` puis `npx wrangler deploy` dans `server/`.
- Réglages : `settings.js` (touches, son, langue, pseudo), `lock.js` (curseur virtuel), `i18n.js`.
- Docs : `docs/AJOUTER_UNE_CAPACITE.md`, `docs/SONS.md`, `docs/CLASSE.md`.

## Pistes en attente
- Mode évolutif (3 manches, une par niveau d'évolution), objets équipables (baies, etc.), après la passe UI/UX.
- Tester le classé et la mêlée avec de vrais joueurs distants ; sons des sorts des autres invités en mêlée ; équilibrage Étouraptor/Pikachu/Zoroark.
