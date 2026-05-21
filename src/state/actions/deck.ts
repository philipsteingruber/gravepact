import { produce } from "immer";
import type { GameState } from "../../lib/types";

export const drawCards = (state: GameState, count: number): GameState => {
  return produce(state, (draft) => {
    draft.run.hand.push(...draft.run.deck.splice(0, count));
  });
};
