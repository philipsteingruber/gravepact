import type { GameState } from "@/lib/types";
import { produce } from "immer";

export const drawCards = (state: GameState, count: number): GameState => {
  return produce(state, (draft) => {
    draft.run.hand.push(...draft.run.deck.splice(0, count));
  });
};
