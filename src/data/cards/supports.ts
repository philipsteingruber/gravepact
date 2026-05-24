import type { Card } from "@/lib/types";

export const supportCards: Card[] = [
  {
    kind: "support",
    id: "bloodlust",
    name: "Bloodlust",
    rarity: "Common",
    compatibleTags: ["Attack"],
    energyCost: 1,
    effect: { kind: "multiplicative", multiplier: 1.5 },
  },
  {
    kind: "support",
    id: "combustion",
    name: "Combustion",
    rarity: "Common",
    compatibleTags: ["Spell"],
    energyCost: 0,
    effect: { kind: "additive", statusEffect: "Burn", stacks: 2 },
  },
  {
    kind: "support",
    id: "maim",
    name: "Maim",
    rarity: "Common",
    compatibleTags: ["Attack", "Curse"],
    energyCost: 0,
    effect: { kind: "additive", statusEffect: "Weaken", stacks: 1 },
  },
];
