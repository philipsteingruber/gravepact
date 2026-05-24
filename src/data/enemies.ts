import type { Enemy } from "@/lib/types";

const defaultFields: Pick<Enemy, "intentIndex" | "statuses"> = { intentIndex: 0, statuses: [] };

export const enemies: Enemy[] = [
  {
    id: "drowned_exile",
    name: "Drowned Exile",
    hp: 20,
    maxHp: 20,
    intents: [
      { kind: "attack", damage: 6 },
      { kind: "attack", damage: 6 },
      { kind: "attack", damage: 6 },
    ],
    ...defaultFields,
  },
  {
    id: "barnacled_revenant",
    name: "Barnacled Revenant",
    hp: 28,
    maxHp: 28,
    intents: [
      { kind: "attack", damage: 8 },
      { kind: "defend", amount: 4 },
      { kind: "attack", damage: 5 },
    ],
    ...defaultFields,
  },
  {
    id: "tide_hulk",
    name: "Tide Hulk",
    hp: 40,
    maxHp: 40,
    intents: [
      { kind: "attack", damage: 12 },
      { kind: "attack", damage: 5 },
      { kind: "defend", amount: 6 },
    ],
    ...defaultFields,
  },
];
