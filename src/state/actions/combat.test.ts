import { effects } from "@/engine/effects";
import { BASE_MAX_ENERGY } from "@/lib/constants";
import { createMockAuraCard, createMockSkillCard, createMockSupportCard } from "@/lib/test-helpers";
import type { Enemy, GameState, Target } from "@/lib/types";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { store } from "../store";
import { commitHand, drawHand, endCombat, endTurn, playCard, startCombat } from "./combat";

describe("combatActions", () => {
  describe("startCombat", () => {
    it("should initialize a fresh CombatState", () => {
      let state = produce(store.gameState, (draft) => {
        draft.run.reservedEnergy = 0;
      });

      state = startCombat(state, {
        hp: 10,
        id: "test_enemy",
        intent: { kind: "attack", damage: 5 },
        maxHp: 10,
        name: "Test Enemy",
        statuses: [],
      } as Enemy);

      expect(state.run.combat).not.toBeNull();
      expect(state.run.combat?.energyMax).toBe(BASE_MAX_ENERGY);
      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY);
      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.combat?.enemy?.id).toBe("test_enemy");
    });
  });

  describe("drawHand", () => {
    it("should move HAND_SIZE cards from deck to hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard, mockCard, mockCard];
      });

      state = drawHand(state);

      expect(state.run.deck.length).toBe(2);
      expect(state.run.hand.length).toBe(5);
    });

    it("should auto-reshuffle when deck empties mid-draw", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard];
        draft.run.discardPile = [mockCard, mockCard, mockCard];
      });

      state = drawHand(state);

      expect(state.run.deck.length).toBe(1);
      expect(state.run.hand.length).toBe(5);
      expect(state.run.discardPile.length).toBe(0);
    });
  });

  describe("playCard", () => {
    it("should move card to stagedCards", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.hand = [mockCard];
        draft.run.combat = { ...initialCombatState };
      });

      state = playCard(state, mockCard);

      expect(state.run.hand.length).toBe(0);
      expect(state.run.combat?.stagedCards).toEqual([mockCard]);
    });

    it("should deduct card cost from energyRemaining", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.reservedEnergy = 0;
        draft.run.hand = [mockCard];
        draft.run.combat = { ...initialCombatState };
      });

      state = playCard(state, mockCard);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY - 1);
    });
  });

  describe("commitHand", () => {
    afterEach(() => {
      delete effects["test"];
    });
    it("should move all staged cards to an empty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.stagedCards = [mockCard];
      });
      effects["test"] = (state, _targets) => state;

      state = commitHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.discardPile).toEqual([mockCard]);
    });

    it("should move all staged cards to a nonempty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.stagedCards = [mockCard];
        draft.run.discardPile = [mockCard];
      });
      effects["test"] = (state, _targets) => state;

      state = commitHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.discardPile).toEqual([mockCard, mockCard]);
    });

    it("should correctly deal damage when commiting a damage dealing skill card", () => {
      const mockCard = createMockSkillCard({
        target: { kind: "enemy", enemyId: "test-enemy" },
        effectId: "test",
      });

      effects["test"] = (state: GameState, targets: Target[]) => {
        return produce(state, (draft) => {
          if (!draft.run.combat || !draft.run.combat.enemy) return state;
          targets.map((target) => {
            if (target.enemyId === draft.run.combat!.enemy!.id) {
              draft.run.combat!.enemy!.hp -= 5;
            }
          });
        });
      };

      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.enemy = {
          hp: 10,
          maxHp: 10,
          id: "test-enemy",
          intent: { kind: "attack", damage: 5 },
        } as Enemy;
        draft.run.combat.stagedCards = [mockCard];
      });

      state = commitHand(state);

      expect(state.run.combat?.enemy?.hp).toBe(5);
    });

    it("should return state unchanged when commiting a hand with no skill/aura cards", () => {
      const mockCard = createMockSupportCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.stagedCards = [mockCard];
      });

      const modifiedState = commitHand(originalState);

      expect(modifiedState).toEqual(originalState);
    });

    it("should return state unchanged when commiting a hand with an aura card", () => {
      const mockCard = createMockAuraCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.stagedCards = [mockCard];
      });

      const modifiedState = commitHand(originalState);

      expect(modifiedState).toEqual(originalState);
    });

    it("should throw when commiting cards with unknown effectIds", () => {
      const mockCard = createMockSkillCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.combat.stagedCards = [mockCard];
      });

      expect(() => commitHand(originalState)).toThrow();
    });
  });

  describe("endTurn", () => {
    it("should move all cards in hand to discardPile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.hand = [mockCard];
        draft.run.discardPile = [];
      });

      state = endTurn(state);

      expect(state.run.discardPile).toEqual([mockCard]);
    });

    it("should draw a new hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
      });

      state = endTurn(state);

      expect(state.run.hand).toEqual([mockCard, mockCard, mockCard, mockCard, mockCard]);
      expect(state.run.deck).toEqual([]);
    });

    it("should reset energyRemaining to energyMax with no reserved energy", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.energyRemaining = 2;
        draft.run.reservedEnergy = 0;
      });

      state = endTurn(state);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY);
    });

    it("should reset energyRemaining to energyMax - reservedEnergy", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.energyRemaining = 2;
        draft.run.reservedEnergy = 1;
      });

      state = endTurn(state);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY - 1);
    });
  });

  describe("endCombat", () => {
    it("should set combat to null", () => {
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState };
      });

      state = endCombat(state);

      expect(state.run.combat).toBe(null);
    });
  });
});
