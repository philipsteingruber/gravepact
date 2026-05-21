import { BASE_MAX_ENERGY } from "@/lib/constants";
import type { CombatState } from "@/lib/types";

export const initialCombatState = {
  enemy: undefined,
  energyRemaining: BASE_MAX_ENERGY,
  energyMax: BASE_MAX_ENERGY,
  playedThisTurn: [],
} satisfies CombatState;
