import type { Card } from "@/lib/types";

export const skillCards: Card[] = [
  {
    kind: "skill",
    id: "exsanguinate",
    name: "Exsanguinate",
    rarity: "Common",
    tags: ["Attack"],
    energyCost: 1,
    effectId: "exsanguinate",
    target: { kind: "enemy", enemyId: "" },
  },
  {
    kind: "skill",
    id: "scorching_ray",
    name: "Scorching Ray",
    rarity: "Common",
    tags: ["Spell"],
    energyCost: 1,
    effectId: "scorching_ray",
    target: { kind: "enemy", enemyId: "" },
  },
  {
    kind: "skill",
    id: "enfeeble",
    name: "Enfeeble",
    rarity: "Common",
    tags: ["Curse"],
    energyCost: 1,
    effectId: "enfeeble",
    target: { kind: "enemy", enemyId: "" },
  },
  {
    kind: "skill",
    id: "lacerate",
    name: "Lacerate",
    rarity: "Common",
    tags: ["Attack"],
    energyCost: 2,
    effectId: "lacerate",
    target: { kind: "enemy", enemyId: "" },
  },
];
