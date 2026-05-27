import { skillCards } from "@/data/cards/skills";
import { supportCards } from "@/data/cards/supports";
import { bosses, enemies } from "@/data/enemies";
import { generateMap } from "@/engine/map";
import { BASE_MAX_HEALTH } from "@/lib/constants";
import type { RunState } from "@/lib/types";
import { shuffle } from "@/lib/utils";

export const initialRunState = {
  deck: shuffle([...skillCards, ...supportCards]), // TODO: Placeholder
  hand: [],
  discardPile: [],

  relics: [],
  activeAuras: [],

  playerHealth: BASE_MAX_HEALTH,
  playerMaxHealth: BASE_MAX_HEALTH,
  reservedEnergy: 0,

  visitedNodes: [],
  map: generateMap(enemies, bosses),
  currentNodeId: null,

  combat: null,
} satisfies RunState;
