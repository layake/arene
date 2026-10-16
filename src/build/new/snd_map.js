// ===== Passe sons : sorts des Aces récents et sorts de terrain (effets PMD) =====
Object.assign(SFX_MAP,{
  leafblade:{cast:707,hit:880},seedbomb:{cast:741,hit:831},megadrain:{cast:699,hit:725},qatk:{cast:402,hit:344},
  psystrike:{cast:773,hit:771},recover:{cast:768},
  wsteel:{cast:678,hit:819},hydrocanon:{cast:861,hit:862},aquajet:{cast:859,hit:344},whirl:{cast:657},steelwall:{cast:845},
  blazekick:{cast:873,hit:873},hjk:{cast:720,hit:841},bboost:{cast:884},firering:{cast:662,hit:669},embermine:{cast:827,hit:801},
  sandstorm:{cast:922},dmeteor:{cast:752,hit:752},psyterrain:{cast:766},lscreen:{cast:851},rwall:{cast:687},spikes:{cast:827,hit:735},
  shands:{cast:891,hit:856},curse:{cast:692,hit:891},awave:{cast:414,hit:664},amine:{cast:827,hit:818},tidal:{cast:798,hit:803},
  tspikes:{cast:827,hit:876},fwall:{cast:669},embers:{cast:711,hit:849},blizzard:{cast:783},icespike:{cast:827,hit:790},
  leech:{cast:807},thorns:{cast:745},mbarrier:{cast:850},epsy:{cast:771,hit:771}
});
// Gain par son : certains échantillons d'origine sont très faibles ou très forts
const SFX_GAIN={741:1.5,807:1.8,891:1.5,745:1.4,414:1.3,692:1.2,807:1.8,662:.8,876:.7,818:.8,711:.85,864:.8,766:.9,922:1.1};
