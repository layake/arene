# Audit UI/UX (17/10/2026, v1.8x)

Méthode : `python tests/tools/audit_ui.py` capture 11 écrans (titre, sélection Solo / En ligne / Classé, Paramètres, VS 1v1, combat 1v1, pause, VS mêlée, combat mêlée, fin) à 1920x1080, 1366x768, 1280x720, 1024x600 et 800x500, puis contrôle débordements, cibles cliquables, contraste, textes minuscules, noms accessibles et textes français restants en mode anglais. Captures dans `tests/tools/out/audit/`, rapport JSON à côté. Limite : contrôle automatique et revue de captures, pas de test avec de vrais joueurs ni sur écran tactile.

## Corrigé pendant l'audit
- Pastilles de type illisibles (Sol 1,8:1 dans le combat, Spectre 3:1 dans la sélection) : le texte passe en sombre sur fond clair (`chipFg`).
- Pastilles de type de 9 px portées à 10 px, légende « Ordre d'entrée » à 11 px.
- « Salon 1v1 : 3 Aces demandés » s'affichait aussi dans l'onglet Classé : visible seulement dans En ligne.
- Case « Couper la musique » mal alignée dans Paramètres (texte collé à droite) : alignée à gauche.
- Cadre « Mêlée en ligne » resté en français après passage en anglais : il suit maintenant la langue.

## À corriger (par priorité)
1. ~~Onglet En ligne : hiérarchie floue.~~ **Fait** : un seul salon en ligne, 2 à 4 joueurs (voir JOURNAL). Constat d'origine : Deux formulaires empilés (cadre bleu « Mêlée en ligne » puis « Créer un salon / Rejoindre » sans titre ni cadre), puis la sélection d'équipe. Proposition : deux cartes de même style, titrées « Salon 1v1 (2 joueurs, 3 Aces) » et « Mêlée (3-4 joueurs, 2 Aces) », avec l'équipe attendue dans chaque carte.
2. ~~Écran titre : pied de page~~ **Fait** (bandeau sombre, 12 px, contraste net). Constat d'origine : (mentions légales) minuscule et à faible contraste, posé sur la ligne de sprites. Proposition : bandeau sombre translucide sous les sprites, texte à 12 px minimum.
3. **Combat en mêlée : superposition** des pseudos et des textes flottants quand plusieurs Pokémon se touchent (déjà atténué pour les pseudos et les chiffres, pas pour les décors de sorts). À surveiller avec 4 joueurs.
4. **Textes minuscules restants** (10 px) : pastilles de type dans les panneaux de vie. Lisibles sur grand écran, justes à 800x500.
5. **Contrôles de Paramètres** : curseurs de 16 px de haut et cases de 13 px, petits pour la souris. Proposition : cases de 18 px, zone cliquable sur toute la ligne.
6. **Bannière « ÉLIMINÉ »** (`#roundban.lose`) : contraste mesuré 1,4:1 à 800x500 (texte rouge sur fond sombre). À vérifier en jeu, le texte a un contour.
7. **Étoiles de manches** (mêlée, 2,5:1) : décoratives mais peu visibles.
8. **Tactile** : toujours non pris en charge (avertissement seulement), choix assumé.

## Constats positifs
- Aucun débordement horizontal ni élément de commande hors écran de 800x500 à 1920x1080 ; le menu défile et garde « Combattre » visible.
- Aucune erreur JavaScript sur tout le parcours.
- Tous les boutons ont un nom accessible.
- La taille de l'interface (70 à 150 %) s'applique au menu, à la barre de sorts, aux panneaux de vie et à la mêlée.
