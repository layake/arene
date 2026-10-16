#!/bin/bash
# usage: getmon.sh 0395 emp EM  -> télécharge, copie dans scratchpad/<dir> et génère les données
cd "$(dirname "$0")/SC" && git sparse-checkout add sprite/$1 portrait/$1 >/dev/null 2>&1
cd .. && mkdir -p $2 && for f in AnimData.xml {Idle,Walk,Attack,Hurt,Charge}-{Anim,Shadow}.png; do cp SC/sprite/$1/$f $2/; done && cp SC/portrait/$1/Normal.png $2/portrait.png && python3 gen_sprite.py $2 $3 | tail -6
