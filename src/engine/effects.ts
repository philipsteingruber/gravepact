import type { GameState, Target } from "../lib/types";

type EffectRegistry = Record<string, (state: GameState, targets: Target[]) => GameState>;

export const effects: EffectRegistry = {};
