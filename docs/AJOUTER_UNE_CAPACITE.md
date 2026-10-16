# Fiche de contrôle : ajouter une capacité

Objectif : une capacité doit **fonctionner comme dans le vrai jeu, se voir comme ce qu'elle est, s'entendre juste, et se ressentir** comme ce qu'elle fait.
Chaque capacité passe les 6 étapes. On ne pousse rien tant qu'une case n'est pas cochée.

## 1. Fidélité au vrai jeu
- [ ] Données officielles relevées : type, catégorie (physique/spécial/statut), puissance, effets secondaires, priorité, soin, recul...
- [ ] Ce qu'on garde, ce qu'on adapte à l'arène (temps réel, 1v1) et pourquoi : écrit dans le commit.
- [ ] Un coup puissant dans le vrai jeu coûte plus cher (PP, recharge) ici.

## 2. Archétype et sensation
Chaque capacité appartient à une famille de sensation. Le moteur doit savoir la jouer.

| Archétype | Sensation | Support moteur | Exemple |
|---|---|---|---|
| Mêlée | coup devant soi | `defMelee` (`moves.js`) | Plaquage, Mâchouille |
| Jet continu | flux qui sort du Pokémon pendant ~1 s, suit la visée, touche à chaque tick | `defStream` (`streams.js`) | Lance-Flammes |
| Projectile unique | un tir net | `PROJ` + `fireBolt` | Ball'Ombre |
| Rayon | trait instantané ou chargé | `beams` | Rayon Psy |
| Zone / onde | expansion autour de soi ou d'un point | `GZ` + `spawnGZ` | Séisme |
| Charge | le Pokémon se déplace | `RUSHES` | Aqua-Jet |
| Buff / statut | effet sur soi | `BUFF` | Danse-Lames |

- [ ] L'archétype est choisi **d'après ce que fait la capacité dans le vrai jeu** (ex. Lance-Flammes = jet continu, pas une boule).
- [ ] Une capacité qui n'a pas d'archétype dans le moteur : on crée l'archétype d'abord.

### Jet continu (`defStream`)
Le flux part de la bouche du Pokémon, suit la visée pendant `dur` secondes, touche toutes les `tick` secondes (`tickPower` par tick), peut brûler / ralentir. Il s'interrompt si le lanceur est étourdi. Styles : `fire` (blobs qui montent et s'étalent), `water` (blobs mous qui retombent en arc). Pour un nouveau rendu, ajouter un style dans `STREAM_STYLE`.

## 3. Comportement en jeu
- [ ] Portée, zone, durée, recharge et coût cohérents avec la puissance et les autres capacités du kit.
- [ ] Aperçu de portée (`PREV`) exact : ce qu'on voit est ce qui touche.
- [ ] Interactions : bouclier, obstacles (les murs bloquent les capacités de contact), étourdissement, intouchable, Flash.
- [ ] L'IA des bots sait l'utiliser (distance, moment).

## 4. Visuel
- [ ] La **forme** raconte la capacité (pas seulement la couleur). Aucun FX réutilisé d'une capacité visuellement différente.
- [ ] Départ lisible (d'où ça part), trajet, impact distinct.
- [ ] Palette du type.
- [ ] Vérifié sur la galerie : `python3 fxgallery.py` (mêlée) ou capture d'un combat de test.

Styles de mêlée (`MELEE_FX`) : `slam` (onde de choc), `bite` (mâchoires), `slash` (entaille unique), `wing` (arc d'aile), `kick` (arc de flammes). Les 3 griffes restent pour les griffures multiples.

## 5. Son
- [ ] Son de lancement et d'impact choisis pour le **type et la force** (id de son dans `SFX_MAP`).
- [ ] Un jet continu a un son qui dure autant que le jet (`noise` de `defStream`).
- [ ] Écouté en jeu, pas seulement branché.

## 6. Test et livraison
- [ ] Combat de test scripté : la capacité est lancée, dégâts, recharge et effet contrôlés, aucune erreur console.
- [ ] Texte FR, traduction EN, description présents.
- [ ] `node --check` passe, captures regardées.
- [ ] Commit avec la liste des écarts volontaires par rapport au vrai jeu.

---

# Référence technique

## Sources et build
- Sources : `src/` (modules `src/build/new/`, données Pokémon `src/<dossier>/`).
- Build : `cd src/build && python3 build.py`, copier `carchacrok_new.html` vers `index.html`.

## Mêlée en une ligne
```js
defMelee({ id:"crunch", name:"Mâchouille", type:"dark", power:24, cd:1.2, fx:"bite",
  desc:"Coup de croc puissant devant soi.", en:{name:"Crunch",desc:"Powerful bite in front of you."},
  sfx:{cast:678,hit:856}, sparks:(x,y,f)=>{}, after:(e,t)=>{} });
```
`keep:true` : ne remplace que le FX d'une capacité existante.

## Jet continu en une ligne
```js
defStream({ keep:true, id:"flame", style:"fire", pal:FLAMEC, dur:1, tick:.125, tickPower:3,
  reach:84, width:11, burn:true, noise:[.38,2600,900,1.2], desc:"...", en:"..." });
```

## Ajouter un Pokémon
1. `bash getmon.sh <numéro PMDCollab> <dossier> <préfixe>` (sprites + portrait).
2. Déclarer l'espèce dans `SPECIES` (voir `gen_e.py`) : stats, `kit` de 4 (1re = attaque de base), `pool`, `body`, `bar`, `shadow`, `hitFrame`.
3. Nom EN dans `i18n.js`, fichier de données dans `build.py`.
