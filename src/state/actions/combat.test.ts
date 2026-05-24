import { effects } from "@/engine/effects";
import { BASE_MAX_ENERGY } from "@/lib/constants";
import { createMockAuraCard, createMockEnemy, createMockSkillCard, createMockSupportCard } from "@/lib/test-helpers";
import type { Enemy, GameState, SkillOutput, Target } from "@/lib/types";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { store } from "../store";
import { applySkillOutput, commitHand, drawHand, endCombat, endTurn, playCard, startCombat } from "./combat";

describe("combatActions", () => {
  describe("startCombat", () => {
    it("initializes a fresh CombatState", () => {
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
      expect(state.run.combat?.enemy.id).toBe("test_enemy");
    });
  });

  describe("drawHand", () => {
    it("moves HAND_SIZE cards from deck to hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard, mockCard, mockCard];
      });

      state = drawHand(state);

      expect(state.run.deck.length).toBe(2);
      expect(state.run.hand.length).toBe(5);
    });

    it("auto-reshuffles when deck empties mid-draw", () => {
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
    it("moves card to stagedCards", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.hand = [mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });

      state = playCard(state, mockCard);

      expect(state.run.hand.length).toBe(0);
      expect(state.run.combat?.stagedCards).toEqual([mockCard]);
    });

    it("deducts card cost from energyRemaining", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.reservedEnergy = 0;
        draft.run.hand = [mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });

      state = playCard(state, mockCard);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY - 1);
    });
  });

  describe("commitHand", () => {
    afterEach(() => {
      delete effects["test"];
    });
    it("moves all staged cards to an empty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });
      effects["test"] = (_state, targets) => ({ damage: 10, statuses: [], targets }) satisfies SkillOutput;

      state = commitHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.discardPile).toEqual([mockCard]);
    });

    it("moves all staged cards to a nonempty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
        draft.run.discardPile = [mockCard];
      });
      effects["test"] = (_state, targets) => ({ damage: 10, statuses: [], targets }) satisfies SkillOutput;

      state = commitHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.discardPile).toEqual([mockCard, mockCard]);
    });

    it("deals damage when commiting a damage dealing skill card", () => {
      const mockCard = createMockSkillCard({
        target: { kind: "enemy", enemyId: "test-enemy" },
        effectId: "test",
      });

      effects["test"] = (_state: GameState, targets: Target[]) =>
        ({ damage: 5, statuses: [], targets }) satisfies SkillOutput;

      let state = produce(store.gameState, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy" }),
          stagedCards: [mockCard],
        };
      });

      state = commitHand(state);

      expect(state.run.combat?.enemy.hp).toBe(5);
    });

    it("returns state unchanged when commiting a hand with no skill/aura cards", () => {
      const mockCard = createMockSupportCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });

      const modifiedState = commitHand(originalState);

      expect(modifiedState).toEqual(originalState);
    });

    it("returns state unchanged when commiting a hand with an aura card", () => {
      const mockCard = createMockAuraCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });

      const modifiedState = commitHand(originalState);

      expect(modifiedState).toEqual(originalState);
    });

    it("throws when commiting cards with unknown effectIds", () => {
      const mockCard = createMockSkillCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });

      expect(() => commitHand(originalState)).toThrow();
    });

    it("applies compatible support modifications when commiting a skill", () => {
      effects["test"] = (_state, targets) => ({ damage: 10, statuses: [], targets }) satisfies SkillOutput;

      const mockSkillCard = createMockSkillCard({ tags: ["Attack"], target: { kind: "enemy", enemyId: "test" } });
      const mockSupportCard = createMockSupportCard({
        compatibleTags: ["Attack"],
        effect: { kind: "multiplicative", multiplier: 1.5 },
      });

      const state = commitHand(
        produce({ ...store.gameState }, (draft) => {
          draft.run.combat = {
            ...initialCombatState,
            enemy: { hp: 20, maxHp: 20, id: "test", intent: { kind: "attack", damage: 5 }, name: "test", statuses: [] },
          };
          draft.run.combat.stagedCards = [mockSkillCard, mockSupportCard];
        }),
      );

      expect(state.run.combat!.enemy.hp).toBe(5);
    });
  });

  describe("endTurn", () => {
    it("moves all cards in hand to discardPile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.hand = [mockCard];
        draft.run.discardPile = [];
      });

      state = endTurn(state);

      expect(state.run.discardPile).toEqual([mockCard]);
    });

    it("draws a new hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
      });

      state = endTurn(state);

      expect(state.run.hand).toEqual([mockCard, mockCard, mockCard, mockCard, mockCard]);
      expect(state.run.deck).toEqual([]);
    });

    it("resets energyRemaining to energyMax with no reserved energy", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.energyRemaining = 2;
        draft.run.reservedEnergy = 0;
      });

      state = endTurn(state);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY);
    });

    it("resets energyRemaining to energyMax - reservedEnergy", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.energyRemaining = 2;
        draft.run.reservedEnergy = 1;
      });

      state = endTurn(state);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY - 1);
    });
  });

  describe("endCombat", () => {
    it("sets combat to null", () => {
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });

      state = endCombat(state);

      expect(state.run.combat).toBe(null);
    });
  });

  describe("applySkillOutput", () => {
    it("reduces hp by the damage value", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy" }),
        };
      });

      const skillOutput: SkillOutput = { damage: 5, statuses: [], targets: [{ enemyId: "test-enemy", kind: "enemy" }] };

      state = applySkillOutput(state, skillOutput);

      expect(state.run.combat!.enemy.hp).toBe(5);
    });

    it("transfers statuses to the targets", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy" }),
        };
      });

      const skillOutput: SkillOutput = {
        damage: 5,
        statuses: [{ kind: "Bleed", stacks: 3 }],
        targets: [{ enemyId: "test-enemy", kind: "enemy" }],
      };

      state = applySkillOutput(state, skillOutput);

      expect(state.run.combat?.enemy.statuses).toContainEqual({ kind: "Bleed", stacks: 3 });
    });

    it("only reduces HP by damage overflowing the target's armor", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy", statuses: [{ kind: "Armor", stacks: 5 }] }),
        };
      });

      const skillOutput: SkillOutput = {
        damage: 10,
        statuses: [],
        targets: [{ enemyId: "test-enemy", kind: "enemy" }],
      };

      state = applySkillOutput(state, skillOutput);

      expect(state.run.combat?.enemy.hp).toBe(5);
    });

    it("depletes armor stacks before reducing HP", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy", statuses: [{ kind: "Armor", stacks: 5 }] }),
        };
      });

      const skillOutput: SkillOutput = {
        damage: 5,
        statuses: [],
        targets: [{ enemyId: "test-enemy", kind: "enemy" }],
      };

      state = applySkillOutput(state, skillOutput);

      expect(state.run.combat?.enemy.statuses).toEqual([]);
    });
  });
});
