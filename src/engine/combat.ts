import type { AttackIntent, Enemy } from "@/lib/types";
import { getWeakenMultiplier } from "./statuses";

export const resolveEnemyAttack = (enemy: Enemy, intent: AttackIntent): number => {
  return Math.floor(intent.damage * getWeakenMultiplier(enemy));
};
