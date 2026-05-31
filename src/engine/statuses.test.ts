import { createMockEnemy } from "@/lib/test-helpers";
import type { StatusEffect } from "@/lib/types";
import { applyStatuses, getBleedAttackBonus, getWeakenMultiplier, resolveIncomingDamage, tickStatuses } from "./statuses";

describe("statuses", () => {
  describe("applyStatuses", () => {
    it("applies the specified number of status effect stacks", () => {
      let enemy = createMockEnemy();

      enemy = applyStatuses(enemy, [{ kind: "Burn", stacks: 3 }]);
      expect(enemy.statuses).toEqual([{ kind: "Burn", stacks: 3 }]);
    });

    it("adds new stacks onto existing ones of the same type", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Burn", stacks: 2 }] });

      enemy = applyStatuses(enemy, [{ kind: "Burn", stacks: 3 }]);
      expect(enemy.statuses).toEqual([{ kind: "Burn", stacks: 5 }]);
    });
  });

  describe("tickStatuses", () => {
    it("bypasses armor when dealing tick damage", () => {
      const enemy = createMockEnemy({
        hp: 10,
        statuses: [
          { kind: "Armor", stacks: 3 },
          { kind: "Burn", stacks: 3 },
        ],
      });

      const { totalDamage, enemy: updatedEnemy } = tickStatuses(enemy);
      expect(totalDamage).toEqual(3);
      expect(updatedEnemy.hp).toEqual(7);
      expect(updatedEnemy.statuses).toContainEqual({ kind: "Armor", stacks: 3 });
    });

    it("deals damage based on Burn stack count", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Burn", stacks: 3 }], hp: 10 });

      const { enemy: updatedEnemy, totalDamage } = tickStatuses(enemy);

      expect(updatedEnemy.hp).toBe(7);
      expect(totalDamage).toBe(3);
    });

    it("deals damage based on Bleed stack count", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Bleed", stacks: 3 }], hp: 10 });

      const { enemy: updatedEnemy, totalDamage } = tickStatuses(enemy);

      expect(updatedEnemy.hp).toBe(9);
      expect(totalDamage).toBe(1);
    });

    it("doesn't decrement stack counts", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Burn", stacks: 3 }], hp: 10 });

      const { enemy: updatedEnemy } = tickStatuses(enemy);

      expect(updatedEnemy.statuses).toEqual([{ kind: "Burn", stacks: 3 }] satisfies StatusEffect[]);
    });
  });

  describe("resolveIncomingDamage", () => {
    it("depletes armor stacks up to the amount of incoming damage", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Armor", stacks: 3 }], hp: 10 });

      enemy = resolveIncomingDamage(enemy, 3);

      expect(enemy.statuses).toEqual([]);
    });

    it("doesn't reduce HP when armor is >= damage", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Armor", stacks: 3 }], hp: 10 });

      enemy = resolveIncomingDamage(enemy, 1);

      expect(enemy.hp).toEqual(10);
    });

    it("reduces HP by the amount overflowing armor amount", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Armor", stacks: 3 }], hp: 10 });

      enemy = resolveIncomingDamage(enemy, 5);

      expect(enemy.hp).toBe(8);
    });

    it("deals full damage to enemies with no armor", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Armor", stacks: 0 }], hp: 10 });

      enemy = resolveIncomingDamage(enemy, 5);

      expect(enemy.hp).toBe(5);
    });

    it("doesn't allow damage to reduce HP to below 0", () => {
      let enemy = createMockEnemy({ statuses: [{ kind: "Armor", stacks: 0 }], hp: 10 });

      enemy = resolveIncomingDamage(enemy, 15);

      expect(enemy.hp).toBe(0);
    });
  });

  describe("getWeakenMultiplier", () => {
    it("returns 1 for an enemy with 0 stacks", () => {
      const enemy = createMockEnemy();

      const result = getWeakenMultiplier(enemy);

      expect(result).toBe(1);
    });

    it("reduces multiplier by WEAKEN_PER_STACK per stack", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Weaken", stacks: 1 }] });

      const result = getWeakenMultiplier(enemy);

      expect(result).toBe(0.95);
    });

    it("clamps multiplier to 0 if the number of stacks would otherwise cause it to be negative", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Weaken", stacks: 21 }] });

      const result = getWeakenMultiplier(enemy);

      expect(result).toBe(0);
    });
  });

  describe("getBleedAttackBonus", () => {
    it("returns 0 for an enemy with 0 Bleed stacks", () => {
      const enemy = createMockEnemy();

      const result = getBleedAttackBonus(enemy);

      expect(result).toBe(0);
    });

    it("returns STACK_COUNT if the enemy has Bleed stacks", () => {
      const enemy = createMockEnemy({ statuses: [{ kind: "Bleed", stacks: 3 }] });

      const result = getBleedAttackBonus(enemy);

      expect(result).toBe(3);
    });
  });
});
