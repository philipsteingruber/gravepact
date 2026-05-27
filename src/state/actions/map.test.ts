import { createMockMapNode } from "@/lib/test-helpers";
import { produce } from "immer";
import { store } from "../store";
import { selectNode } from "./map";

describe("mapActions", () => {
  describe("selectNode", () => {
    it("sets currentNodeId to the selected node's id", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.currentNodeId = "";
      });
      const mockNode = createMockMapNode();

      state = selectNode(state, mockNode);

      expect(state.run.currentNodeId).toBe(mockNode.id);
    });

    it("appends the selected node to visitedNodes", () => {
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.visitedNodes = [];
      });
      const mockNode = createMockMapNode();

      state = selectNode(state, mockNode);

      expect(state.run.visitedNodes).toEqual([mockNode]);
    });

    it("appends to visitedNodes without replacing previous entries", () => {
      const mockNode1 = createMockMapNode({ id: "1" });
      const mockNode2 = createMockMapNode({ id: "2" });
      let state = produce({ ...store.gameState }, (draft) => {
        draft.run.visitedNodes = [mockNode1];
      });

      state = selectNode(state, mockNode2);

      expect(state.run.visitedNodes).toEqual([mockNode1, mockNode2]);
    });
  });
});
