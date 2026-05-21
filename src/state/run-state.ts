import { BASE_MAX_HEALTH } from "../lib/constants";
import type { RunState } from "../lib/types";

export const initialRunState = {
  deck: [],
  hand: [],
  discardPile: [],
  relics: [],
  activeAuras: [],
  health: BASE_MAX_HEALTH,
  maxHealth: BASE_MAX_HEALTH,
  visitedNodes: [],
  combat: null,
  reservedEnergy: 0,
} satisfies RunState;
