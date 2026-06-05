import { BASE_MAX_ENERGY } from "@/lib/constants";
import type { CombatState } from "@/lib/types";

export const initialCombatState = {
  energyRemaining: BASE_MAX_ENERGY,
  energyMax: BASE_MAX_ENERGY,
  activeAuras: [],
  reservedEnergy: 0,
  stagedCards: [],
  originalHandOrder: [],
  hand: [],
  discardPile: [],
  playerStatuses: [],
} satisfies Omit<CombatState, "enemy">;
