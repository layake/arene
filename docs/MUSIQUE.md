# Musique par fichier

Le jeu a toujours sa musique synthétisée (chiptune : menu calme, combat rapide). Une piste en fichier la remplace pour un contexte donné.
Une musique = un fichier qui boucle. Pas de musique dynamique, rien n'est synchronisé en réseau (y compris en ligne et en classé).

## Pistes livrées
- `menu` : `music/lobby.ogg` (Do majeur, 108 BPM, 44,4 s, synthés et basse). Générée par `tools/music/gen_lobby.py`.
- `battle` : `music/donjon.ogg` (Mi mineur, 148 BPM, 45,4 s, cuivres, cordes staccato, timbales). Générée par `tools/music/gen_donjon.py`.
- Régénérer : `python tools/music/gen_lobby.py` et `gen_donjon.py` (numpy, scipy, soundfile). Les `.wav` intermédiaires ne sont pas versionnés. Les compositions sont originales, sans échantillon : aucune licence tierce.

## Ajouter une piste
1. Déposer le fichier dans `music/` à la racine du dépôt (à côté de `index.html`). Format conseillé : `.ogg` (la boucle est sans trou, contrairement au MP3).
2. Ajouter UNE ligne dans `MUSIC_TRACKS` (`src/build/new/music.js`), par exemple `battle:"music/combat_arene.ogg",`.
3. `cd src/build && python3 build.py`, copier `carchacrok_new.html` vers `index.html`, commit et push (le dossier `music/` aussi).

Clés : `battle` (tous les combats), `menu`, ou `battle:<id d'arène>` (ex. `battle:glace`) pour une arène précise ; sinon `battle`. Sans ligne, le contexte garde le chiptune.

## Comportement
- Boucle sans coupure (`AudioBufferSourceNode` en boucle), fondu d'entrée de 1 s (`MUSIC_FADE`).
- Entre deux manches : la musique continue. À l'écran de résultat : fondu de sortie de 1 s, puis silence ; au retour au menu, le chiptune du menu reprend.
- Pause / onglet masqué : la musique baisse à 30 % (comme avant).
- Réglages : curseur « Musique » (bus musique séparé des effets) et case « Couper la musique » dans Paramètres et dans la pause. Les bruitages ne sont jamais touchés.
- Le fichier se charge au premier combat. S'il est absent ou illisible (par exemple en `file://`), le chiptune continue sans erreur.

## Tests
`python tests/tools/music_test.py` : serveur local + piste de test jetable (générée, jamais livrée) : démarrage, boucle sur 7 s (niveau jamais nul), volume, coupure, fondu de sortie, repli, bruitages inchangés.

## Crédits
Les pistes livrées sont synthétisées par le code (aucune licence tierce). Pour une piste venant d'ailleurs : mettre à jour le README (ligne « Musique ») ; si elle est rendue avec la soundfont FluidR3_GM, vérifier sa licence avant publication et la noter dans les crédits.
