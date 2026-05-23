import type { GameState, SkillOutput, Target } from "@/lib/types";

type EffectRegistry = Record<string, (state: GameState, targets: Target[]) => SkillOutput>;

export const effects: EffectRegistry = {};
