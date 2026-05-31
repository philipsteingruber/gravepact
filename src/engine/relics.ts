import { relicEffects, type RelicEffectId } from "@/data/relic-effects";
import type { GameState, RelicContext } from "@/lib/types";

export const fireRelicTrigger = (state: GameState, context: RelicContext): GameState => {
  const triggerKind = context.triggerKind;

  const relicsToTrigger = state.run.relics.filter((relic) => relic.triggerKind === triggerKind);
  relicsToTrigger.forEach((relic) => {
    state = relicEffects[relic.effectId as RelicEffectId](state, context);
  });

  return state;
};
