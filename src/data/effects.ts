import type { GameState, SkillOutput, Target } from "@/lib/types";

export const effects = {
  // Skill effects
  exsanguinate: (_state, targets) => ({ damage: 8, statuses: [{ kind: "Bleed", stacks: 2 }], targets }),
  scorching_ray: (_state, targets) => ({ damage: 6, statuses: [{ kind: "Burn", stacks: 2 }], targets }),
  enfeeble: (_state, targets) => ({ damage: 0, statuses: [{ kind: "Weaken", stacks: 3 }], targets }),
  lacerate: (_state, targets) => ({ damage: 14, statuses: [{ kind: "Bleed", stacks: 3 }], targets }),

  // Aura tick effects
  sanguine_rite_tick: (_state, targets) => ({ damage: 0, statuses: [{ kind: "Bleed", stacks: 1 }], targets }),
} satisfies Record<string, (state: GameState, targets: Target[]) => SkillOutput>;

export type EffectId = keyof typeof effects;
