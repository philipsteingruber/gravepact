import type { GameState } from "@/lib/types";
import { initialMetaState } from "./meta-state";
import { initialRunState } from "./run-state";

export const gameState: GameState = {
  run: { ...initialRunState },
  meta: { ...initialMetaState },
};
