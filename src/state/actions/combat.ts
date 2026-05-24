import { resolveEnemyAttack } from "@/engine/combat";
import { effects } from "@/engine/effects";
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
  let drawAmount = BASE_HAND_SIZE - state.run.hand.length;

  while (drawAmount > 0) {
    if (state.run.deck.length === 0 && state.run.discardPile.length === 0) break;

    if (state.run.deck.length === 0)
      state = produce(state, (draft) => {
        draft.run.deck = [...draft.run.discardPile];
        draft.run.discardPile = [];
      });

    state = drawCards(state, 1);
    drawAmount -= 1;
  }

  return state;
};

export const playCard = (state: GameState, card: Card) => {
  if (!state.run.hand.includes(card) || !state.run.combat) return state;

  return produce(state, (draft) => {
    const combat = draft.run.combat!;

    if ("energyCost" in card) {
      combat.energyRemaining -= card.energyCost;
    }

    const cardIndex = draft.run.hand.findIndex((c) => c === card);
    draft.run.hand.splice(cardIndex, 1);
    combat.stagedCards.push(card);
  });
};

export const commitHand = (state: GameState) => {
  if (
    !state.run.combat ||
    state.run.combat.stagedCards.filter((card) => card.kind === "aura" || card.kind === "skill").length !== 1
  )
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
    // TODO: Resolve aura cards (Phase 2)
    return state;
  }

  return produce(state, (draft) => {
    const combat = draft.run.combat!;
    draft.run.discardPile.push(...combat.stagedCards);
    combat.stagedCards = [];
  });
};

export const endTurn = (state: GameState) => {
  if (!state.run.combat) return state;

  state = produce(state, (draft) => {
    const combat = draft.run.combat!;
    draft.run.discardPile.push(...draft.run.hand);
    draft.run.hand = [];
    combat.energyRemaining = combat.energyMax - draft.run.reservedEnergy;
  });

  return drawHand(state);
};

export const endCombat = (state: GameState) => {
  return produce(state, (draft) => {
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
  const intent = getCurrentEnemyIntent(state.run.combat.enemy);
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

const getCurrentEnemyIntent = (enemy: Enemy) => {
  return enemy.intents[enemy.intentIndex];
};
