import { createMockAuraCard, createMockCombatState } from "@/lib/test-helpers";
import type { AuraCard } from "@/lib/types";
import { store } from "@/state/store";
import { produce } from "immer";
import { tickAuras } from "./aura";

describe("aura", () => {
  describe("tickAuras", () => {
    it("returns a SkillOutput for each active aura", () => {
      const aura = createMockAuraCard({ effectId: "sanguine_rite_tick" });
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.combat.activeAuras = [aura as AuraCard];
      });

      const result = tickAuras(state, [{ kind: "enemy", enemyId: state.run.combat!.enemy.id }]);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject({ statuses: [{ kind: "Bleed", stacks: 1 }] });
    });

    it("returns an empty array when no auras are active", () => {
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.combat.activeAuras = [];
      });

      const result = tickAuras(state, [{ kind: "enemy", enemyId: state.run.combat!.enemy.id }]);

      expect(result).toEqual([]);
    });

    it("throws when an aura has an unregistered effectId", () => {
      const aura = createMockAuraCard({ effectId: "unregistered_id" });
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.combat.activeAuras = [aura as AuraCard];
      });

      expect(() => tickAuras(state, [{ kind: "enemy", enemyId: state.run.combat!.enemy.id }])).toThrow();
    });

    it("passes the provided targets to each aura's effect", () => {
      const aura = createMockAuraCard({ effectId: "sanguine_rite_tick" });
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.combat.activeAuras = [aura as AuraCard];
      });

      const result = tickAuras(state, [{ kind: "enemy", enemyId: "specific_enemy" }]);

      expect(result[0].targets.length).toBe(1);
      expect(result[0].targets[0]).toMatchObject({ enemyId: "specific_enemy" });
    });
  });
});
