import type { Card, GameState } from "@/lib/types";
import { produce } from "immer";

export const drawCards = (state: GameState, count: number): GameState => {
  if (!state.run.combat) return state;

  return produce(state, (draft) => {
    draft.run.combat!.hand.push(...draft.run.deck.splice(0, count));
  });
};

export const addCardToDeck = (state: GameState, card: Card): GameState => {
  return produce(state, (draft) => {
    draft.run.deck.push(card);
  });
};
