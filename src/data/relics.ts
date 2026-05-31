import type { Relic } from "@/lib/types";

export const relics: Relic[] = [
  { id: "doedres_damning", name: "Doedre's Damning", rarity: "Uncommon", triggerKind: "onCombatStart", effectId: "doedres_damning" },
  { id: "spreading_rot", name: "Spreading Rot", rarity: "Uncommon", triggerKind: "onTurnStart", effectId: "spreading_rot" },
  { id: "carnage_heart", name: "Carnage Heart", rarity: "Uncommon", triggerKind: "onSkillPlay", effectId: "carnage_heart" },
];
