# Mode classé (matchmaking + Elo)

Le jeu reste un fichier HTML statique. Le classé ajoute un petit serveur gratuit (Cloudflare Workers) qui gère uniquement : profils, file d'attente, Elo, classement. Les combats restent en pair à pair (PeerJS), le serveur n'y participe pas.

## Fonctionnement
- Profil : pseudo + jeton anonyme stocké dans le navigateur (`localStorage.aceRk`). Pas de mot de passe ni d'email.
- File d'attente : le client interroge `/api/queue` toutes les 2 s. Tolérance d'Elo : 100, +50 toutes les 5 s d'attente.
- Appariement : le serveur donne un code de salle et un rôle (hôte/invité), puis le combat démarre tout seul (BO3, équipes de 3, arène Colisée).
- Résultat : les deux joueurs le déclarent. Si les deux déclarent la même issue, le match est contesté et l'Elo ne bouge pas. Un abandon (fermeture, retour au menu) compte comme défaite. Un seul rapport est accepté après 45 s. Rapports refusés avant 20 s.
- Elo : départ 1200, K=40 pour les 20 premières parties puis K=20, plancher 100.

## Déploiement
```
cd server
npm install
npx wrangler login
npx wrangler deploy
```
Puis mettre l'URL du Worker dans `RANKED_API` (haut de `src/build/new/ranked.js`), relancer `python3 build.py` et publier. En test : `?api=http://localhost:8787` avec `node server/dev.js`.

## Limites connues
- Triche possible (deux comptes complices, client modifié). Le serveur ne voit pas le combat.
- Si le pair à pair échoue (réseau strict), aucun Elo n'est modifié.
- Tests : `node tests/server.test.mjs` (serveur), `tests/run.py` (jeu).
