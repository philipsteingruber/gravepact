import { effects } from "@/data/effects";
import { tickAuras } from "@/engine/aura";
import { resolveEnemyAttack } from "@/engine/combat";
import { applyStatuses, getBleedAttackBonus, resolveIncomingDamage, tickStatuses } from "@/engine/statuses";
import { filterCompatibleMods, resolveSupports } from "@/engine/supports";
import { BASE_HAND_SIZE } from "@/lib/constants";
import type { Card, Enemy, GameState, SkillOutput, SupportCard } from "@/lib/types";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { drawCards } from "./deck";

export const startCombat = (state: GameState, enemy: Enemy) => {
  return produce(state, (draft) => {
    draft.run.combat = { ...initialCombatState, enemy };
  });
};

export const drawHand = (state: GameState) => {
  if (!state.run.combat) return state;

  const combat = state.run.combat!;

  let drawAmount = BASE_HAND_SIZE - combat.hand.length;

  while (drawAmount > 0) {
    if (state.run.deck.length === 0 && combat.discardPile.length === 0) break;

    if (state.run.deck.length === 0)
      state = produce(state, (draft) => {
        draft.run.deck = [...draft.run.combat!.discardPile];
        draft.run.combat!.discardPile = [];
      });

    state = drawCards(state, 1);
    drawAmount -= 1;
  }

  return state;
};

export const stageCard = (state: GameState, card: Card) => {
  if (!state.run.combat || !state.run.combat!.hand.includes(card) || !state.run.combat) return state;

  return produce(state, (draft) => {
    const combat = draft.run.combat!;

    if (card.kind !== "aura") {
      combat.energyRemaining -= card.energyCost;
    }

    const cardIndex = combat.hand.findIndex((c) => c.id === card.id);

    if (combat.originalHandOrder.length === 0) {
      combat.originalHandOrder = [...combat.hand];
    }

    combat.hand.splice(cardIndex, 1);
    combat.stagedCards.push(card);
  });
};

export const unstageCard = (state: GameState, stagedCard: Card): GameState => {
  if (!state.run.combat || !state.run.combat.stagedCards.includes(stagedCard)) return state;

  return produce(state, (draft) => {
    const combat = draft.run.combat!;

    combat.stagedCards.splice(
      combat.stagedCards.findIndex((card) => card.id === stagedCard.id),
      1,
    );

    const stagedCardIndex = combat.originalHandOrder.findIndex((card) => card.id === stagedCard.id);
    const insertBefore = combat.hand.findIndex((card) => combat.originalHandOrder.findIndex((c) => c.id === card.id) > stagedCardIndex);

    combat.hand.splice(insertBefore > -1 ? insertBefore : combat.hand.length, 0, stagedCard);

    if (stagedCard.kind !== "aura") combat.energyRemaining += stagedCard.energyCost;
  });
};

export const playHand = (state: GameState) => {
  if (!state.run.combat || state.run.combat.stagedCards.filter((card) => card.kind === "aura" || card.kind === "skill").length !== 1)
    return state;

  const combat = state.run.combat!;

  if (combat.stagedCards.some((card) => card.kind === "skill")) {
    const skillCard = combat.stagedCards.find((card) => card.kind === "skill")!;

    const effect = effects[skillCard.effectId];
    if (!effect) throw new Error(`Unregistered effectId: ${skillCard.effectId}`);

    const mods = filterCompatibleMods({
      skill: skillCard,
      supports: combat.stagedCards.filter((card) => card !== skillCard) as SupportCard[],
    });
    const skillOutput = effect(state, [{ kind: "enemy", enemyId: combat.enemy.id }]);

    const modifiedSkillOutput = resolveSupports({ skillOutput, mods });
    state = applySkillOutput(state, modifiedSkillOutput);
  } else if (state.run.combat.stagedCards.some((card) => card.kind === "aura")) {
    state = produce(state, (draft) => {
      const combat = draft.run.combat!;

      const auraCard = combat.stagedCards.find((card) => card.kind === "aura")!;
      combat.activeAuras.push(auraCard);

      combat.reservedEnergy += auraCard.energyReservation;
      combat.energyRemaining -= auraCard.energyReservation;

      combat.discardPile.push(...combat.stagedCards.filter((card) => card.kind !== "aura"));

      combat.stagedCards = [];
      combat.originalHandOrder = [];
    });
  }

  return produce(state, (draft) => {
    const combat = draft.run.combat!;
    combat.discardPile.push(...combat.stagedCards);
    combat.stagedCards = [];
    combat.originalHandOrder = [];
  });
};

export const endTurn = (state: GameState) => {
  if (!state.run.combat) return state;

  state = produce(state, (draft) => {
    const combat = draft.run.combat!;
    combat.hand.push(...combat.stagedCards);
    combat.stagedCards = [];
    combat.originalHandOrder = [];
    combat.discardPile.push(...combat.hand);
    combat.hand = [];
    combat.energyRemaining = combat.energyMax - combat.reservedEnergy;
  });

  return drawHand(state);
};

export const endCombat = (state: GameState) => {
  if (!state.run.combat) return state;

  return produce(state, (draft) => {
    const combat = draft.run.combat!;

    combat.hand.push(...combat.stagedCards);
    combat.discardPile.push(...combat.hand);
    draft.run.deck.push(...combat.discardPile);

    draft.run.deck.push(...(combat.activeAuras as Card[]));

    draft.run.combat = null;
  });
};

export const applySkillOutput = (state: GameState, skillOutput: SkillOutput): GameState => {
  if (!state.run.combat) return state;

  return produce(state, (draft) => {
    const combat = draft.run.combat!;
    skillOutput.targets.forEach((target) => {
      if (target.enemyId === combat.enemy.id) {
        combat.enemy = applyStatuses(combat.enemy, skillOutput.statuses);
        combat.enemy = resolveIncomingDamage(combat.enemy, skillOutput.damage);
      }
    });
  });
};

export const resolveEnemyTurn = (state: GameState): GameState => {
  if (!state.run.combat) return state;

  const { enemy } = state.run.combat;
  const intent = enemy.intents[enemy.intentIndex];

  const auraResults = tickAuras(state, [{ kind: "enemy", enemyId: state.run.combat.enemy.id }]);
  auraResults.forEach((res) => (state = applySkillOutput(state, res)));

  return produce(state, (draft) => {
    const combat = draft.run.combat!;

    combat.enemy = tickStatuses(combat.enemy).enemy;

    if (intent.kind === "attack") {
      draft.run.playerHealth = Math.max(0, draft.run.playerHealth - resolveEnemyAttack(combat.enemy, intent));

      combat.enemy = resolveIncomingDamage(combat.enemy, getBleedAttackBonus(combat.enemy));
    } else if (intent.kind === "defend") {
      combat.enemy = applyStatuses(combat.enemy, [{ kind: "Armor", stacks: intent.amount }]);
    } else if (intent.kind === "debuff") {
      return; // TODO: Placeholder
    }

    combat.enemy.intentIndex = (combat.enemy.intentIndex + 1) % combat.enemy.intents.length;
  });
};
