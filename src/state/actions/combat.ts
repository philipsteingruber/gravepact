import { BASE_HAND_SIZE } from "@/lib/constants";
import type { Card, Enemy, GameState } from "@/lib/types";
import { produce } from "immer";
import { initialCombatState } from "../combat-state";
import { drawCards } from "./deck";

export const startCombat = (state: GameState, enemy: Enemy) => {
  return produce(state, (draft) => {
    draft.run.combat = { ...initialCombatState };
    draft.run.combat.enemy = enemy;
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
    if ("energyCost" in card) {
      draft.run.combat!.energyRemaining -= card.energyCost;
    }

    const cardIndex = draft.run.hand.findIndex((c) => c === card);
    draft.run.hand.splice(cardIndex, 1);
    draft.run.combat!.stagedCards.push(card);
  });
};

export const commitHand = (state: GameState) => {
  if (!state.run.combat) return state;
  return produce(state, (draft) => {
    draft.run.discardPile.push(...draft.run.combat!.stagedCards);
    draft.run.combat!.stagedCards = [];
  });
};

export const endTurn = (state: GameState) => {
  if (!state.run.combat) return state;

  state = produce(state, (draft) => {
    draft.run.discardPile.push(...draft.run.hand);
    draft.run.hand = [];
    draft.run.combat!.energyRemaining = draft.run.combat!.energyMax - draft.run.reservedEnergy;
  });

  return drawHand(state);
};

export const endCombat = (state: GameState) => {
  return produce(state, (draft) => {
    draft.run.combat = null;
  });
};
