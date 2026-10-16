# Aces Arena

Jeu de combat d'arène en vue de dessus, 1v1 ou équipes de 3, sprites PMDCollab SpriteCollab. Usage privé.
Jouer : https://arena.lensslo.com (ou https://layake.github.io/arene/)

## Modes
- **Entraînement** : mannequin.
- **Versus** : contre un bot (facile, normal, difficile), en 1, 3 ou 5 rounds, équipes de 3.
- **Marathon** : les 16 Aces à la suite avec ton équipe (1 à 3), sans soin entre les duels, bots de plus en plus durs. Classement : adversaires vaincus, puis temps. Record sauvegardé dans le navigateur.
- **En ligne** : salon à code, hôte et invité.

## Commandes
Clic droit : se déplacer. Q, Z, E, R : les 4 sorts (clic gauche pour lancer). Espace : bouclier. Tab : changer d'Ace. F : Flash. Jets (Lance-Flammes, Hydrocanon, Blizzard) : maintenir la touche, on reste immobile, relâcher coupe.

## Développement
- Sources dans `src/` (modules dans `src/build/new/`). Construire : `cd src/build && python3 build.py`, puis copier `carchacrok_new.html` en `index.html` à la racine et supprimer les fichiers générés.
- Tests : `python3 tests/run.py` (playwright). À lancer avant chaque push.
- Ajouter une capacité, un archétype (mêlée, jet, rayon, vague, lien, volée) ou un Pokémon : `docs/AJOUTER_UNE_CAPACITE.md`. Sons : `docs/SONS.md`.
- Les archétypes enregistrent leur dessin dans `FX_DRAW` et leur mise à jour dans `FX_UPDATERS` (voir `src/build/new/moves.js`).
