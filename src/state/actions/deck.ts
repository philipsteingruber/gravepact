import { getCardPrice, getRelicPrice } from "@/engine/shop";
import type { Card, GameState, Relic } from "@/lib/types";
import { produce } from "immer";

// --- Draw ---

export const drawCards = (state: GameState, count: number): GameState => {
  if (!state.run.combat) return state;

  return produce(state, (draft) => {
    draft.run.combat!.hand.push(...draft.run.deck.splice(0, count));
  });
};

// --- Collection Management ---

export const addCardToDeck = (state: GameState, card: Card): GameState => {
  return produce(state, (draft) => {
    draft.run.deck.push(card);
  });
};

// --- Shop Purchases ---

export const buyCard = (state: GameState, card: Card): GameState => {
  return produce(state, (draft) => {
    draft.run.deck.push(card);
    draft.run.gold -= getCardPrice(card);
  });
};

export const buyRelic = (state: GameState, relic: Relic): GameState => {
  return produce(state, (draft) => {
    draft.run.relics.push(relic);
    draft.run.gold -= getRelicPrice(relic);
  });
};
