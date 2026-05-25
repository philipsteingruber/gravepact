import { generateMap } from "@/engine/map";
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
  reservedEnergy: 0,

  visitedNodes: [],
  map: generateMap(),
  currentNodeId: null,

  combat: null,
} satisfies RunState;
