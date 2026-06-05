import type { Card } from "@/lib/types";

export const starterCards: Card[] = [
  {
    kind: "skill",
    id: "strike",
    name: "Strike",
    energyCost: 1,
    tags: ["Attack"],
    rarity: "Common",
    target: { kind: "enemy", enemyId: "" },
    description: "6 damage",
    effectId: "strike",
  },
  {
    kind: "skill",
    id: "fortify",
    name: "Fortify",
    energyCost: 1,
    tags: ["Block"],
    rarity: "Common",
    target: { kind: "player" },
    description: "5 armor",
    effectId: "fortify",
  },
];
