import { createMockCombatState, createMockEnemy, createMockRelic } from "@/lib/test-helpers";
import { store } from "@/state/store";
import { produce } from "immer";
import { fireRelicTrigger } from "./relics";

describe("relics", () => {
  describe("fireRelicTrigger", () => {
    it("applies the effect of relics whose triggerKind matches the fired trigger", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.relics = [createMockRelic({ triggerKind: "onCombatStart" })];
        draft.run.combat = createMockCombatState({ enemy: createMockEnemy({ statuses: [] }) });
      });

      state = fireRelicTrigger(state, { triggerKind: "onCombatStart" });

      expect(state.run.combat!.enemy.statuses).toEqual([{ kind: "Bleed", stacks: 3 }]);
    });

    it("skips relics whose triggerKind doesn't match", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.relics = [createMockRelic({ triggerKind: "onCombatStart" })];
        draft.run.combat = createMockCombatState({ enemy: createMockEnemy({ statuses: [] }) });
      });

      state = fireRelicTrigger(state, { triggerKind: "onTurnStart" });

      expect(state.run.combat!.enemy.statuses).toEqual([]);
    });

    it("threads state through multiple matching relics in order", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.relics = [createMockRelic({ triggerKind: "onCombatStart" }), createMockRelic({ triggerKind: "onCombatStart" })];
        draft.run.combat = createMockCombatState({ enemy: createMockEnemy({ statuses: [] }) });
      });

      state = fireRelicTrigger(state, { triggerKind: "onCombatStart" });

      expect(state.run.combat!.enemy.statuses).toEqual([{ kind: "Bleed", stacks: 6 }]);
    });

    it("returns state unchanged when run.relics is empty", () => {
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.relics = [];
        draft.run.combat = createMockCombatState();
      });

      const updatedState = fireRelicTrigger(state, { triggerKind: "onCombatStart" });

      expect(updatedState).toBe(state);
    });
  });
});
