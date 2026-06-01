import type { Relic } from "@/lib/types";

export const relics: Relic[] = [
  {
    id: "doedres_damning",
    name: "Doedre's Damning",
    description: "Combat start:\nenemy gains 3 Bleed",
    rarity: "Uncommon",
    triggerKind: "onCombatStart",
    effectId: "doedres_damning",
  },
  {
    id: "spreading_rot",
    name: "Spreading Rot",
    description: "Turn start:\napply 1 Bleed to the enemy",
    rarity: "Uncommon",
    triggerKind: "onTurnStart",
    effectId: "spreading_rot",
  },
  {
    id: "carnage_heart",
    name: "Carnage Heart",
    description: "[Attack]\nDeal 2 bonus damage",
    rarity: "Uncommon",
    triggerKind: "onSkillPlay",
    effectId: "carnage_heart",
  },
];
