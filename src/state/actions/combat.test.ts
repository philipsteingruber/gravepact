import { BASE_MAX_ENERGY, BASE_MAX_HEALTH } from "@/lib/constants";
import {
  createMockAuraCard,
  createMockCombatState,
  createMockEnemy,
  createMockRelic,
  createMockSkillCard,
  createMockSupportCard,
} from "@/lib/test-helpers";
import type { AuraCard, SkillOutput } from "@/lib/types";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { store } from "../store";
import {
  applySkillOutput,
  awardGold,
  drawHand,
  endCombat,
  endTurn,
  playHand,
  resolveEnemyTurn,
  stageCard,
  startCombat,
  startPlayerTurn,
  unstageCard,
} from "./combat";

describe("combatActions", () => {
  describe("startCombat", () => {
    it("initializes a fresh CombatState", () => {
      let state = store.gameState;

      state = startCombat(state, createMockEnemy());

      expect(state.run.combat).not.toBeNull();
      expect(state.run.combat?.energyMax).toBe(BASE_MAX_ENERGY);
      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY);
      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.combat?.enemy.id).toBe("mock_enemy");
    });

    it("fires onCombatStart relics", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.relics = [createMockRelic({ triggerKind: "onCombatStart", effectId: "doedres_damning" })];
      });

      state = startCombat(state, createMockEnemy());

      expect(state.run.combat?.enemy.statuses).toEqual([{ kind: "Bleed", stacks: 3 }]);
    });
  });

  describe("drawHand", () => {
    it("moves HAND_SIZE cards from deck to hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
      });

      state = drawHand(state);

      expect(state.run.deck.length).toBe(2);
      expect(state.run.combat!.hand.length).toBe(5);
    });

    it("auto-reshuffles when deck empties mid-draw", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.deck = [mockCard, mockCard, mockCard];
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.discardPile = [mockCard, mockCard, mockCard];
      });

      state = drawHand(state);

      expect(state.run.deck.length).toBe(1);
      expect(state.run.combat!.hand.length).toBe(5);
      expect(state.run.combat!.discardPile.length).toBe(0);
    });
  });

  describe("stageCard", () => {
    it("returns state unchanged when staging an aura with energyReservation exceeding current energyRemaining", () => {
      const mockCard = createMockAuraCard({ energyReservation: 1 });
      const state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy(), energyRemaining: 0, hand: [mockCard] };
      });

      const updatedState = stageCard(state, mockCard);

      expect(updatedState).toBe(state);
    });

    it("moves card to stagedCards", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.hand = [mockCard];
      });

      state = stageCard(state, mockCard);

      expect(state.run.combat!.hand.length).toBe(0);
      expect(state.run.combat?.stagedCards).toEqual([mockCard]);
    });

    it("deducts card cost from energyRemaining", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.hand = [mockCard];
      });

      state = stageCard(state, mockCard);

      expect(state.run.combat?.energyRemaining).toBe(BASE_MAX_ENERGY - 1);
    });

    it("returns state unchanged when the card's energy cost exceeds energyRemaining", () => {
      const mockCard = createMockSkillCard({ energyCost: 1 });
      const state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy(), energyRemaining: 0 };
        draft.run.combat!.hand = [mockCard];
      });

      const updatedState = stageCard(state, mockCard);

      expect(updatedState).toEqual(state);
    });
  });

  describe("playHand", () => {
    it("moves all staged cards to an empty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });

      state = playHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.combat?.discardPile).toEqual([mockCard]);
    });

    it("moves all staged cards to a nonempty discard pile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
        draft.run.combat.discardPile = [mockCard];
      });

      state = playHand(state);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.combat?.discardPile).toEqual([mockCard, mockCard]);
    });

    it("deals damage when commiting a damage dealing skill card", () => {
      const mockCard = createMockSkillCard({
        target: { kind: "enemy", enemyId: "test-enemy" },
      });

      let state = produce(store.gameState, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, maxHp: 10, id: "test-enemy" }),
          stagedCards: [mockCard],
        };
      });

      state = playHand(state);

      expect(state.run.combat?.enemy.hp).toBe(2);
    });

    it("returns state unchanged when commiting a hand with no skill/aura cards", () => {
      const mockCard = createMockSupportCard();
      const originalState = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat.stagedCards = [mockCard];
      });

      const modifiedState = playHand(originalState);

      expect(modifiedState).toEqual(originalState);
    });

    it("applies compatible support modifications when commiting a skill", () => {
      const mockSkillCard = createMockSkillCard({ tags: ["Attack"], target: { kind: "enemy", enemyId: "test" } });
      const mockSupportCard = createMockSupportCard({
        compatibleTags: ["Attack"],
        effect: { kind: "multiplicative", multiplier: 1.5 },
      });

      const state = playHand(
        produce({ ...store.gameState }, (draft) => {
          draft.run.combat = {
            ...initialCombatState,
            enemy: createMockEnemy({ id: "test", hp: 20 }),
          };
          draft.run.combat.stagedCards = [mockSkillCard, mockSupportCard];
        }),
      );

      expect(state.run.combat!.enemy.hp).toBe(8);
    });

    it("moves a staged aura to combat.activeAuras", () => {
      const card = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], activeAuras: [] });
      });

      state = playHand(state);

      expect(state.run.combat?.activeAuras).toEqual([card]);
    });

    it("increments combat.reservedEnergy by the aura's energyReservation", () => {
      const card = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], reservedEnergy: 0 });
      });

      state = playHand(state);

      expect(state.run.combat!.reservedEnergy).toBe(1);
    });

    it("immediately reduces combat.energyRemaining by the aura's energyReservation", () => {
      const card = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], energyRemaining: 1 });
      });

      state = playHand(state);

      expect(state.run.combat!.energyRemaining).toBe(0);
    });

    it("leaves combat.energyMax unchanged when an aura is played", () => {
      const card = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], energyMax: 3 });
      });

      state = playHand(state);

      expect(state.run.combat!.energyMax).toBe(3);
    });

    it("moves staged supports to the discard pile when an aura is played", () => {
      const auraCard = createMockAuraCard();
      const supportCard = createMockSupportCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [auraCard, supportCard], discardPile: [] });
      });

      state = playHand(state);

      expect(state.run.combat!.discardPile).toEqual([supportCard]);
    });

    it("does not move the aura to the discard pile when played", () => {
      const auraCard = createMockAuraCard();
      const supportCard = createMockSupportCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [auraCard, supportCard], discardPile: [] });
      });

      state = playHand(state);

      expect(state.run.combat!.discardPile.includes(auraCard)).toBe(false);
    });

    it("clears stagedCards and originalHandOrder after an aura is played", () => {
      const auraCard = createMockAuraCard();
      const supportCard = createMockSupportCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [auraCard, supportCard], discardPile: [], originalHandOrder: [auraCard] });
      });

      state = playHand(state);

      expect(state.run.combat!.stagedCards).toEqual([]);
      expect(state.run.combat!.originalHandOrder).toEqual([]);
    });

    it("returns state unchanged when two skill cards are staged", () => {
      const cardA = createMockSkillCard();
      const cardB = createMockSkillCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [cardA, cardB] });
      });

      const updatedState = playHand(state);

      expect(updatedState).toEqual(state);
    });

    it("fires onSkillPlay relics after a skill resolves", () => {
      const card = createMockSkillCard({ tags: ["Attack"], effectId: "exsanguinate" });

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], enemy: createMockEnemy({ hp: 50, statuses: [] }) });
        draft.run.relics = [createMockRelic({ triggerKind: "onSkillPlay", effectId: "carnage_heart" })];
      });

      state = playHand(state);

      expect(state.run.combat?.enemy.hp).toBe(40);
    });

    it("doesn't fire onSkillPlay relics when an aura is committed", () => {
      const card = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ stagedCards: [card], enemy: createMockEnemy({ hp: 50, statuses: [] }) });
        draft.run.relics = [createMockRelic({ triggerKind: "onSkillPlay", effectId: "carnage_heart" })];
      });

      state = playHand(state);

      expect(state.run.combat?.enemy.hp).toBe(50);
    });
  });

  describe("endTurn", () => {
    it("moves all cards in hand to discardPile", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.hand = [mockCard];
        draft.run.combat.discardPile = [];
      });

      state = endTurn(state);

      expect(state.run.combat!.discardPile).toEqual([mockCard]);
    });

    it("draws a new hand", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
      });

      state = endTurn(state);

      expect(state.run.combat!.hand).toEqual([mockCard, mockCard, mockCard, mockCard, mockCard]);
      expect(state.run.deck).toEqual([]);
    });

    it("resets energyRemaining to energyMax with no reserved energy", () => {
      const mockCard = createMockSkillCard();
      let state = produce(store.gameState, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.deck = [mockCard, mockCard, mockCard, mockCard, mockCard];
        draft.run.combat.energyRemaining = 2;
        draft.run.combat.reservedEnergy = 0;
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
        draft.run.combat.reservedEnergy = 1;
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

    it("merges hand, discardPile and stagedCards into deck", () => {
      const handCard = createMockAuraCard();
      const discardCard = createMockSkillCard();
      const stagedCard = createMockSupportCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [];
        draft.run.combat = createMockCombatState({
          hand: [handCard],
          discardPile: [discardCard],
          stagedCards: [stagedCard],
        });
      });

      state = endCombat(state);

      expect(state.run.deck).toEqual([discardCard, handCard, stagedCard]);
    });

    it("returns active auras to run.deck", () => {
      const auraCard = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.deck = [];
        draft.run.combat = createMockCombatState({ activeAuras: [auraCard as AuraCard] });
      });

      state = endCombat(state);

      expect(state.run.deck).toEqual([auraCard]);
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

  describe("resolveEnemyTurn", () => {
    it("reduces enemy HP by Burn stack count at start of turn", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ hp: 10, statuses: [{ kind: "Burn", stacks: 3 }] }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat?.enemy.hp).toBe(7);
    });

    it("reduces enemy HP by floored Bleed tick damage at start of turn", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            hp: 10,
            statuses: [{ kind: "Bleed", stacks: 3 }],
            intents: [{ kind: "defend", amount: 1 }],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat?.enemy.hp).toBe(9);
    });

    it("reduces player health by attack damage", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({ intents: [{ kind: "attack", damage: 5 }] }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.playerHealth).toBe(BASE_MAX_HEALTH - 5);
    });

    it("deals Bleed stack count as bonus damage to the enemy when it attacks", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            hp: 10,
            intents: [{ kind: "attack", damage: 5 }],
            statuses: [{ kind: "Bleed", stacks: 2 }],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.hp).toBe(7);
    });

    it("applies Armor stack to an enemy with defend intent", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            hp: 10,
            intents: [{ kind: "defend", amount: 5 }],
            statuses: [],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.statuses).toContainEqual({ kind: "Armor", stacks: 5 });
    });

    it("adds to existing Armor if the enemy already has some", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            hp: 10,
            intents: [{ kind: "defend", amount: 5 }],
            statuses: [{ kind: "Armor", stacks: 2 }],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.statuses).toContainEqual({ kind: "Armor", stacks: 7 });
    });

    it("leaves player HP unchanged on a debuff intent", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            hp: 10,
            intents: [{ kind: "debuff", effectKind: "Bleed", stacks: 5 }],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.playerHealth).toBe(BASE_MAX_HEALTH);
    });

    it("advances intentIndex by 1 after executing", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            intentIndex: 0,
            intents: [
              { kind: "attack", damage: 1 },
              { kind: "attack", damage: 1 },
            ],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.intentIndex).toBe(1);
    });

    it("wraps intentIndex back to 0 after last intent", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = {
          ...initialCombatState,
          enemy: createMockEnemy({
            intentIndex: 1,
            intents: [
              { kind: "attack", damage: 1 },
              { kind: "attack", damage: 1 },
            ],
          }),
        };
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.intentIndex).toBe(0);
    });

    it("applies active aura effects at the start of the enemy turn", () => {
      const auraCard = createMockAuraCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState({ activeAuras: [auraCard as AuraCard] });
        draft.run.combat.enemy.statuses = [];
      });

      state = resolveEnemyTurn(state);

      expect(state.run.combat!.enemy.statuses).toEqual([{ kind: "Bleed", stacks: 1 }]);
    });
  });

  describe("unstageCard", () => {
    it("moves the card from stagedCards to hand", () => {
      const card = createMockSkillCard();

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.stagedCards = [card];
        draft.run.combat!.hand = [];
      });

      state = unstageCard(state, card);

      expect(state.run.combat?.stagedCards).toEqual([]);
      expect(state.run.combat?.hand).toEqual([card]);
    });

    it("refunds the energy cost of the unstaged card", () => {
      const card = createMockSkillCard({ energyCost: 1 });

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy(), energyRemaining: 2 };
        draft.run.combat!.stagedCards = [card];
        draft.run.combat!.hand = [];
      });

      state = unstageCard(state, card);

      expect(state.run.combat?.energyRemaining).toBe(3);
    });

    it("returns state unchanged when the card is not in stagedCards", () => {
      const stagedCard = createMockSkillCard();
      const nonStagedCard = createMockSupportCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy(), energyRemaining: 2 };
        draft.run.combat!.stagedCards = [stagedCard];
        draft.run.combat!.hand = [];
      });

      const updatedState = unstageCard(state, nonStagedCard);

      expect(updatedState).toEqual(state);
    });

    it("returns state unchanged when combat is null", () => {
      const stagedCard = createMockSkillCard();

      const state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.hand = [];
      });

      const updatedState = unstageCard(state, stagedCard);

      expect(updatedState).toEqual(state);
    });

    it("preserves original hand order when cards are staged and unstaged out of order", () => {
      const cardA = createMockSkillCard({ id: "A" });
      const cardB = createMockSkillCard({ id: "B" });
      const cardC = createMockSkillCard({ id: "C" });
      const cardD = createMockSkillCard({ id: "D" });

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy() };
        draft.run.combat!.hand = [cardA, cardB, cardC, cardD];
        draft.run.combat.stagedCards = [];
      });

      state = stageCard(state, cardB);
      state = stageCard(state, cardC);
      state = unstageCard(state, cardB);
      state = unstageCard(state, cardC);

      expect(state.run.combat!.hand).toEqual([cardA, cardB, cardC, cardD]);
    });

    it("does not change energyRemaining when an aura is unstaged", () => {
      const card = createMockAuraCard({ energyReservation: 1 });

      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = { ...initialCombatState, enemy: createMockEnemy(), energyRemaining: 3 };
        draft.run.combat!.stagedCards = [card];
        draft.run.combat!.hand = [];
      });

      state = unstageCard(state, card);

      expect(state.run.combat?.energyRemaining).toBe(3);
    });
  });

  describe("startPlayerTurn", () => {
    it("draws cards up to a full hand", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.deck = [
          createMockSkillCard(),
          createMockSkillCard(),
          createMockSkillCard(),
          createMockSkillCard(),
          createMockSkillCard(),
          createMockSkillCard(),
          createMockSkillCard(),
        ];
      });

      state = startPlayerTurn(state);

      expect(state.run.deck.length).toBe(2);
      expect(state.run.combat?.hand.length).toBe(5);
    });

    it("fires onTurnStart relics after drawing", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.combat = createMockCombatState();
        draft.run.relics = [createMockRelic({ triggerKind: "onTurnStart", effectId: "spreading_rot" })];
      });

      state = startPlayerTurn(state);

      expect(state.run.combat!.enemy.statuses).toEqual([{ kind: "Bleed", stacks: 1 }]);
    });
  });

  describe("awardGold", () => {
    it("adds amount to run.gold", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.gold = 0;
      });

      state = awardGold(state, 25);

      expect(state.run.gold).toBe(25);
    });

    it("adds to existing gold balance", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.gold = 25;
      });

      state = awardGold(state, 25);

      expect(state.run.gold).toBe(50);
    });
  });
});
