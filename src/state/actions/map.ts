import type { GameState, MapNode } from "@/lib/types";
import { produce } from "immer";

export const selectNode = (state: GameState, node: MapNode): GameState => {
  return produce(state, (draft) => {
    draft.run.currentNodeId = node.id;
    draft.run.visitedNodes.push(node);
  });
};
