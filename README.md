# Aces Arena

Jeu de combat d'arène en vue de dessus, 1v1 ou équipes de 3, sprites PMDCollab SpriteCollab.
Jouer : https://arena.lensslo.com (ou https://layake.github.io/arene/)

## Modes
- **Entraînement** : mannequin.
- **Versus** : contre un bot (facile, normal, difficile), en 1, 3 ou 5 rounds, équipes de 3.
- **Mêlée** : 4 combattants contre des bots, chacun pour soi, 2 Pokémon chacun. Le dernier debout gagne.
- **Mêlée en ligne** : 3 ou 4 joueurs (onglet En ligne, « Créer une mêlée »), même règles. L'hôte fait autorité.
- **Marathon** : tous les Aces à la suite avec ton équipe (1 à 3), sans soin entre les duels, bots de plus en plus durs. Classement : adversaires vaincus, puis temps. Record sauvegardé dans le navigateur.
- **En ligne** : salon à code, hôte et invité.

## Commandes
Clic droit : se déplacer. Q, Z, E, R : les 4 sorts (clic gauche pour lancer). Espace : bouclier. Tab : changer d'Ace. F : Flash. Jets (Lance-Flammes, Hydrocanon, Blizzard) : maintenir la touche, on reste immobile, relâcher coupe.

## Développement
- Sources dans `src/` (modules dans `src/build/new/`). Construire : `cd src/build && python3 build.py`, puis copier `carchacrok_new.html` en `index.html` à la racine et supprimer les fichiers générés.
- Tests : `python3 tests/run.py` (playwright). À lancer avant chaque push.
- Ajouter une capacité, un archétype (mêlée, jet, rayon, vague, lien, volée) ou un Pokémon : `docs/AJOUTER_UNE_CAPACITE.md`. Sons : `docs/SONS.md`.
- Les archétypes enregistrent leur dessin dans `FX_DRAW` et leur mise à jour dans `FX_UPDATERS` (voir `src/build/new/moves.js`).

## Classé en ligne
Matchmaking et Elo comme aux échecs : voir [docs/CLASSE.md](docs/CLASSE.md).

## Droits et crédits
Jeu de fans **non officiel et non commercial**, sans lien avec Nintendo, Game Freak, Creatures ni The Pokémon Company. Pokémon et ses personnages sont © Nintendo / Creatures / Game Freak.
- **Sprites et portraits :** [PMDCollab SpriteCollab](https://github.com/PMDCollab/SpriteCollab) (CC BY-NC 4.0), originaux Chunsoft. Merci aux artistes de la communauté. Usage commercial interdit.
- **Effets sonores :** extraits de Pokémon Donjon Mystère, © Chunsoft / The Pokémon Company. Ils ne sont pas couverts par la licence du code et peuvent être retirés à la demande des ayants droit.
- **Musique :** générée par le code.
- **Code :** MIT (fichier LICENSE), hors contenus tiers ci-dessus.
- Retrait de contenu : si vous êtes ayant droit, ouvrez une issue et le contenu sera retiré rapidement.
