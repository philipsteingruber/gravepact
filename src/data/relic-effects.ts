import { applyStatuses, resolveIncomingDamage } from "@/engine/statuses";
import type { GameState, RelicContext } from "@/lib/types";
import { produce } from "immer";

export const relicEffects = {
  doedres_damning: (state, _context) =>
    produce(state, (draft) => {
      if (!draft.run.combat) return;
      draft.run.combat.enemy = applyStatuses(draft.run.combat.enemy, [{ kind: "Bleed", stacks: 3 }]);
    }),
  spreading_rot: (state, _context) =>
    produce(state, (draft) => {
      if (!draft.run.combat) return;
      draft.run.combat.enemy = applyStatuses(draft.run.combat.enemy, [{ kind: "Bleed", stacks: 1 }]);
    }),
  carnage_heart: (state, context) =>
    produce(state, (draft) => {
      if (!draft.run.combat || context.triggerKind !== "onSkillPlay") return;

      const triggerCard = context.card;
      if (triggerCard.tags.includes("Attack")) {
        draft.run.combat.enemy = resolveIncomingDamage(draft.run.combat.enemy, 2);
      }
    }),
} satisfies Record<string, (state: GameState, context: RelicContext) => GameState>;

export type RelicEffectId = keyof typeof relicEffects;
