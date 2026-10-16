# Ajouter une capacité (pipeline VFX)

Règle d'or : **un FX doit raconter la capacité**. Pas de "3 griffes" pour une morsure, un coup d'aile ou un coup de pied.

## Sources et build

- Sources : `src/` (modules dans `src/build/new/`, données Pokémon dans `src/<dossier>/`).
- Build : `cd src/build && python3 build.py`, puis copier `carchacrok_new.html` vers `index.html` à la racine.
- `node --check s_new.js` doit passer (le build l'écrit à côté).
- Galerie des FX : `python3 fxgallery.py` produit `fxgallery.png` (une case par capacité de mêlée). **À regarder avant chaque commit.**

## Capacité de mêlée (cas courant)

Un seul appel dans `src/build/new/moves.js` :

```js
defMelee({
  id:"crunch", name:"Mâchouille", type:"dark", power:24, cd:1.2,
  fx:"bite",                       // style de MELEE_FX
  pal:["#201020","#705848","#a08070","#403030"],   // optionnel, sinon palette du type
  desc:"Coup de croc puissant devant soi.",
  en:{name:"Crunch", desc:"Powerful bite in front of you."},
  sfx:{cast:678, hit:856},         // ids de sons existants (snd_map.js)
  sparks:(x,y,f)=>{ /* étincelles propres au coup */ },
  after:(e,t)=>{ /* effet secondaire : brûlure, étourdissement... */ }
});
```

`defMelee` enregistre tout seul : stats (`SPL`), description, son, aperçu de portée (`PREV`), FX, traduction EN.
Pour changer **uniquement le FX** d'une capacité déjà en jeu : `keep:true` (stats et textes conservés).

### Styles de FX disponibles (`MELEE_FX`)

| style | rendu | pour |
|---|---|---|
| `slam` | onde de choc au sol + lignes d'impact | plaquage, écrasement, coup de poing lourd |
| `bite` | deux mâchoires de crocs qui se referment | morsures |
| `slash` | une seule entaille en croissant | lames, griffe unique, sabre |
| `wing` | grand balayage en arc avec plumes | ailes, queue, balayage |
| `kick` | arc bas et épais + langues de flamme | coups de pied, coups enflammés |

Les 3 griffes (`claw`) restent réservées à Draco-Griffe et aux griffures multiples.

### Ajouter un nouveau style

1. Écrire `nomDuStyle(k){...}` dans `MELEE_FX` (`k` = `{x,y,P,f,n,T,u}` : position, palette, visée, normale, temps, progression 0..1).
2. Dessiner en pixel art avec `ctx.fillRect` (helpers `mfxLine`, `mfxDisc`), durée totale 0,34 s, fondu automatique en fin.
3. L'utiliser via `fx:"nomDuStyle"`, vérifier avec `fxgallery.py`.

## Capacité à distance, zone, buff, charge

Ces types ont leurs propres mécanismes (voir `aces_d.js` pour des exemples complets) :

- projectile : `PROJ`, `ACE2.id={hit(e,id){fireBolt(e,id)}}`, `ORB2` (dessin), `ORBEND` (impact), `ORBHIT`
- zone : `GZ` (types `field`, `wall`, `impacts`, `mine`), `spawnGZ`
- charge : `RUSHES`
- buff : `BUFF`

Toujours ajouter : `SPL`, `DESC`, `PREV`, `SFX_MAP`, et la traduction EN dans `i18n.js`.
Chaque capacité doit avoir une **identité visuelle propre** : forme (pas seulement la couleur), mouvement, et un impact distinct.

## Ajouter un Pokémon

1. `bash getmon.sh <numéro PMDCollab à 4 chiffres> <dossier> <préfixe>` génère `<dossier>/<dossier>_data.js` (sprites) et `portrait.b64`.
2. Déclarer l'espèce dans `SPECIES` (voir `gen_e.py` : stats de base, `kit` de 4 capacités dont la 1re est l'attaque de base, `pool`, `body`, `bar`, `shadow`, `hitFrame`).
3. Ajouter son nom EN dans `i18n.js` et le fichier de données dans la liste de `build.py`.
4. `python3 fxgallery.py` puis un combat de test (`startMatch([...])`).

## Check-list avant commit

- [ ] Le FX est lisible et cohérent avec le nom de la capacité
- [ ] Aucune capacité ne réutilise le FX d'une capacité visuellement différente
- [ ] Son, description FR, traduction EN, aperçu de portée présents
- [ ] `node --check` passe, `fxgallery.py` sans erreur
