import { effects, type EffectId } from "@/data/effects";
import type { GameState, SkillOutput, Target } from "@/lib/types";

export const tickAuras = (state: GameState, targets: Target[]): SkillOutput[] => {
  if (!state.run.combat) return [];

  const effectIds = Object.keys(effects);

  const results: SkillOutput[] = [];
  state.run.combat.activeAuras.forEach((aura) => {
    if (!effectIds.includes(aura.effectId)) throw new Error(`Unregistered effect ID: ${aura.effectId}`);
    results.push(effects[aura.effectId as EffectId](state, targets));
  });
  return results;
};
