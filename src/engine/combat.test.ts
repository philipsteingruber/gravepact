import { resolveEnemyAttack } from "@/engine/combat";
import { createMockEnemy } from "@/lib/test-helpers";
import type { AttackIntent } from "@/lib/types";

describe("engine/combat", () => {
  describe("resolveEnemyAttack", () => {
    it("returns base damage when enemy has no status effects", () => {
      const enemy = createMockEnemy({ intents: [{ kind: "attack", damage: 10 }], intentIndex: 0, statuses: [] });

      const result = resolveEnemyAttack(enemy, enemy.intents[enemy.intentIndex] as AttackIntent);

      expect(result).toBe(10);
    });

    it("reduces damage proportionally when enemy has Weaken stacks", () => {
      const enemy = createMockEnemy({
        intents: [{ kind: "attack", damage: 10 }],
        intentIndex: 0,
        statuses: [{ kind: "Weaken", stacks: 10 }],
      });

      const result = resolveEnemyAttack(enemy, enemy.intents[enemy.intentIndex] as AttackIntent);

      expect(result).toBe(5);
    });

    it("floors the result when Weaken produces a fractional value", () => {
      const enemy = createMockEnemy({
        intents: [{ kind: "attack", damage: 10 }],
        intentIndex: 0,
        statuses: [{ kind: "Weaken", stacks: 9 }],
      });

      const result = resolveEnemyAttack(enemy, enemy.intents[enemy.intentIndex] as AttackIntent);

      expect(result).toBe(5);
    });

    it("clamps damage to 0 when Weaken is large enough to nullify the attack", () => {
      const enemy = createMockEnemy({
        intents: [{ kind: "attack", damage: 10 }],
        intentIndex: 0,
        statuses: [{ kind: "Weaken", stacks: 25 }],
      });

      const result = resolveEnemyAttack(enemy, enemy.intents[enemy.intentIndex] as AttackIntent);

      expect(result).toBe(0);
    });
  });
});
