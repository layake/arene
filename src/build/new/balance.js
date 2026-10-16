// ===== Équilibrage (passe du 16/10, simulations bot contre bot) =====
// Stats de base : seul le Pokémon visé change. La valeur officielle est gardée dans sp.official et la fiche affiche une jauge jaune.
const BAL_STATS={staraptor:{atk:100},pikachu:{hp:60,def:55},zoroark:{spa:135},gardevoir:{spa:140}};
if(SPECIES.pikachu)SPECIES.pikachu.official={atk:55,spa:50}; // Orbe Lumière (voir aces_f_logic.js)
for(const k in BAL_STATS){const sp=SPECIES[k]; if(!sp)continue; sp.official=sp.official||{};
  for(const s in BAL_STATS[k]){if(sp.official[s]===undefined)sp.official[s]=sp.base[s]; sp.base[s]=BAL_STATS[k][s]}
  sp.stats=statsOf(sp.base); sp.maxHp=Math.round(sp.stats.hp/HP_SCALE); sp.spd=clamp(Math.pow(sp.stats.spe/122,.4),.8,1.1)}
// Capacités propres à un seul Pokémon
SPL.hjk.power=35;        // Braségali
SPL.bravebird.power=32;  // Corvaillus
SPL.nslash.power=22;     // Zoroark
