import { BASE_MAX_HEALTH } from "@/lib/constants";
import type { RunState } from "@/lib/types";

export const initialRunState = {
  deck: [],
  hand: [],
  discardPile: [],
  relics: [],
  activeAuras: [],
  playerHealth: BASE_MAX_HEALTH,
  playerMaxHealth: BASE_MAX_HEALTH,
  visitedNodes: [],
  combat: null,
  reservedEnergy: 0,
} satisfies RunState;
