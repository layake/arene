# Sons des capacités

Les sons viennent de la banque PMD (fichiers `songNNN.mp3`). `src/snd/labels.json` donne, pour chaque numéro, ce que c'est (ex. `"828": "PMD: Blizzard, Ice Beam"`).
`src/snd/features.json` donne les caractéristiques audio (durée, brillance, bruit) pour choisir à défaut de nom.

## Choisir le son d'une capacité
1. Chercher dans `labels.json` le nom PMD de la capacité (ou d'une capacité de même sensation).
2. Lancement (`cast`) et impact (`hit`) différents. Pas de son partagé entre capacités de nature différente.
3. Si le son n'est pas embarqué : ajouter le mp3 dans `src/build/new/snd_data3.js` (`Object.assign(SND_B64,{"id":"base64"})`).
4. Déclarer dans `src/build/new/snd_fix.js` : `id:{cast:N,hit:N}`.
5. Écouter en jeu.

## Réaffectations (passe du 16/10)
Plaquage, Mâchouille, Tranche-Nuit, Cru-Aile, Vol, Ombre Portée, Coup Bas, Close Combat, Forte-Paume, Poing Glace, Piétinement, Luminocanon, Aurasphère, Laser Glace, Métal Burst, Riposte, Mur d'Acier, Mur de Glace, Onde Fée, Lance-Flammes, Bomb Beurk, Vibraqua, Canicule, Pointes de Glace.
Certains numéros voulus (838 Water Pulse, 816 Sludge Bomb, 743 Icicle Spear, 661 Air Cutter) n'existent pas dans les fichiers fournis : remplacés par le meilleur voisin.
