import type { MetaState } from "../lib/types";

export const initialMetaState = {
  orbs: 0,
  unlockedCards: [],
  purchasedUpgrades: [],
  unlockedClasses: [],
} satisfies MetaState;
