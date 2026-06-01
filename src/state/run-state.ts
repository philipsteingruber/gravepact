import { skillCards } from "@/data/cards/skills";
import { supportCards } from "@/data/cards/supports";
import { bosses, enemies } from "@/data/enemies";
import { generateMap } from "@/engine/map";
import { BASE_MAX_HEALTH } from "@/lib/constants";
import type { RunState } from "@/lib/types";
import { shuffle } from "@/lib/utils";

export const initialRunState = {
  // Collection
  deck: shuffle([...skillCards, ...supportCards]), // TODO: Placeholder
  relics: [],
  gold: 0,

  // Player
  playerHealth: BASE_MAX_HEALTH,
  playerMaxHealth: BASE_MAX_HEALTH,

  // Map
  locationId: "rotting_strand",
  map: generateMap(enemies, bosses),
  visitedNodes: [],
  currentNodeId: null,

  // Combat
  combat: null,
} satisfies RunState;
