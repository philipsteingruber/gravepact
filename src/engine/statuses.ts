import { BLEED_TICK_MULTIPLIER, WEAKEN_PER_STACK } from "@/lib/constants";
import type { Enemy, StatusEffect, StatusEffectKind, StatusTickResult } from "@/lib/types";
import { produce } from "immer";

export const applyStatuses = (enemy: Enemy, statuses: StatusEffect[]): Enemy => {
  return produce(enemy, (draft) => {
    draft.statuses = mergeStatuses(draft.statuses, statuses);
  });
};

export const tickStatuses = (enemy: Enemy): StatusTickResult => {
  const totalDamage = getStatusStacks(enemy, "Burn") + Math.floor(getStatusStacks(enemy, "Bleed") * BLEED_TICK_MULTIPLIER);
  return {
    enemy: produce(enemy, (draft) => {
      draft.hp = Math.max(0, draft.hp - totalDamage);
    }),
    totalDamage,
  };
};

export const resolveIncomingDamage = (enemy: Enemy, damage: number): Enemy => {
  const armor = getStatusStacks(enemy, "Armor");
  const absorbed = Math.min(armor, damage);
  const overflow = damage - absorbed;
  const remainingArmor = armor - absorbed;

  return produce(enemy, (draft) => {
    if (hasStatus(enemy, "Armor")) {
      if (remainingArmor === 0) {
        draft.statuses.splice(
          draft.statuses.findIndex((status) => status.kind === "Armor"),
          1,
        );
      } else {
        const index = draft.statuses.findIndex((status) => status.kind === "Armor");
        draft.statuses.splice(index, 1, { kind: "Armor", stacks: draft.statuses[index].stacks - absorbed });
      }
    }
    draft.hp = Math.max(0, draft.hp - overflow);
  });
};

export const getWeakenMultiplier = (enemy: Enemy): number => {
  return Math.max(0, 1 - WEAKEN_PER_STACK * getStatusStacks(enemy, "Weaken"));
};

export const getBleedAttackBonus = (enemy: Enemy): number => {
  return getStatusStacks(enemy, "Bleed");
};

export const mergeStatuses = (existing: StatusEffect[], incoming: StatusEffect[]): StatusEffect[] => {
  const result: StatusEffect[] = [...existing];

  incoming.forEach((status) => {
    const index = existing.findIndex((s) => s.kind === status.kind);
    if (index !== -1) {
      result[index] = { kind: status.kind, stacks: status.stacks + existing[index].stacks };
    } else {
      result.push(status);
    }
  });
  return result;
};
// --- Internal Helpers ---

const getStatusStacks = (enemy: Enemy, kind: StatusEffectKind): number => {
  const status = enemy.statuses.find((status) => status.kind === kind);
  if (!status) return 0;
  return status.stacks;
};

const hasStatus = (enemy: Enemy, kind: StatusEffectKind): boolean => {
  return enemy.statuses.some((status) => status.kind === kind);
};
