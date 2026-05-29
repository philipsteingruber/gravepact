import { createMockCombatState, createMockEnemy, createMockSkillCard } from "@/lib/test-helpers";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { store } from "../store";
import { addCardToDeck, drawCards } from "./deck";

describe("deckActions", () => {
  describe("drawCards", () => {
    it("moves cards from deck to hand", () => {
      const mockCard = createMockSkillCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });
      const result = drawCards(state, 1);

      expect(result.run.combat!.hand.length).toBe(1);
      expect(result.run.deck.length).toBe(2);
    });

    it("handles draw count greater than deck size", () => {
      const mockCard = createMockSkillCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });
      const result = drawCards(state, 2);

      expect(result.run.combat!.hand.length).toBe(1);
      expect(result.run.deck.length).toBe(0);
    });

    it("leaves state unchanged when drawing from an empty deck", () => {
      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });
      const result = drawCards(state, 1);

      expect(result.run.combat!.hand.length).toBe(0);
      expect(result.run.deck.length).toBe(0);
    });

    it("leaves state unchanged when drawing 0 cards", () => {
      const mockCard = createMockSkillCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });
      const result = drawCards(state, 0);

      expect(result.run.combat?.hand.length).toBe(0);
      expect(result.run.deck.length).toBe(1);
    });
  });

  describe("addCardToDeck", () => {
    it("appends the card to run.deck", () => {
      const card = createMockSkillCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [];
        draft.run.combat = createMockCombatState();
      });

      state = addCardToDeck(state, card);

      expect(state.run.deck).toEqual([card]);
    });
  });
});
