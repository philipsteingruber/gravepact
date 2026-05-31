import { bosses, enemies } from "@/data/enemies";
import { getNode, groupNodesByLayer } from "@/engine/map";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import type { Enemy, GameState, MapNode } from "@/lib/types";
import { pickRandom } from "@/lib/utils";
import { startCombat, startPlayerTurn } from "@/state/actions/combat";
import { selectNode } from "@/state/actions/map";
import { store } from "@/state/store";
import Phaser from "phaser";

const LAYER_WIDTH = 150;
const NODE_RADIUS = 20;

type NodePositions = Record<string, { x: number; y: number }>;

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MAP" });
  }

  create() {
    const state = store.gameState;
    const nodesByLayer = groupNodesByLayer(state.run.map);
    const availableIds = new Set(
      state.run.visitedNodes.length > 0 ? state.run.visitedNodes.at(-1)?.connections : nodesByLayer[0].map((node) => node.id),
    );
    const visitedIds = new Set(state.run.visitedNodes.map((node) => node.id));

    const nodePositions = this.computeNodePositions(nodesByLayer);
    const layerCount = Object.keys(nodesByLayer).length;
    this.setupCamera(nodePositions, layerCount, state);
    this.drawConnections(nodePositions, state);
    this.renderNodes(nodePositions, availableIds, visitedIds, state);
  }

  private computeNodePositions(nodesByLayer: ReturnType<typeof groupNodesByLayer>): NodePositions {
    const nodePositions: NodePositions = {};
    Object.entries(nodesByLayer).forEach(([layer, nodes]) => {
      nodes.forEach((node, i) => {
        nodePositions[node.id] = {
          x: Number(layer) * LAYER_WIDTH + LAYER_WIDTH / 2,
          y: (SCREEN_HEIGHT / (nodes.length + 1)) * (i + 1),
        };
      });
    });
    return nodePositions;
  }

  private setupCamera(nodePositions: NodePositions, layerCount: number, state: GameState) {
    const worldWidth = layerCount * LAYER_WIDTH;
    this.cameras.main.setBounds(0, 0, worldWidth, SCREEN_HEIGHT);

    if (state.run.visitedNodes.length === 0) {
      this.cameras.main.setScroll(0, 0);
    } else {
      const lastNode = state.run.visitedNodes[state.run.visitedNodes.length - 1];
      const xScroll = nodePositions[lastNode.id].x - SCREEN_WIDTH / 2;
      this.cameras.main.setScroll(xScroll, 0);
    }
  }

  private drawConnections(nodePositions: NodePositions, state: GameState) {
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x444444);

    state.run.map.forEach((node) => {
      node.connections.forEach((connectionNodeId) => {
        const startPos = nodePositions[node.id];
        const endPos = nodePositions[connectionNodeId];

        graphics.beginPath();
        graphics.moveTo(startPos.x, startPos.y);
        graphics.lineTo(endPos.x, endPos.y);
        graphics.strokePath();
      });
    });
  }

  private renderNodes(nodePositions: NodePositions, availableIds: Set<string>, visitedIds: Set<string>, state: GameState) {
    Object.entries(nodePositions).forEach(([id, { x, y }]) => {
      const nodeColor = visitedIds.has(id) ? 0x888888 : availableIds.has(id) ? 0xffffff : 0x333333;
      const nodeButton = this.add.circle(x, y, NODE_RADIUS, nodeColor);

      if (availableIds.has(id)) {
        nodeButton
          .setInteractive()
          .on("pointerover", () => this.input.setDefaultCursor("pointer"))
          .on("pointerout", () => this.input.setDefaultCursor("default"))
          .on("pointerdown", () => this.handleNodeSelect(getNode(state.run.map, id), state));
      }
    });
  }

  private handleNodeSelect(node: MapNode, state: GameState) {
    store.gameState = selectNode(state, node);
    if (["combat", "elite", "boss"].includes(node.kind)) {
      let enemy: Enemy;
      if (node.kind === "combat") {
        enemy = pickRandom(enemies, 1)[0];
      } else if (node.kind === "elite") {
        enemy = enemies.find((e) => e.id === node.assignedEnemyId)!;
      } else {
        enemy = bosses.find((boss) => boss.id === node.assignedEnemyId)!;
      }
      store.gameState = startCombat(store.gameState, enemy);
      store.gameState = startPlayerTurn(store.gameState);
      this.scene.start("COMBAT");
    } else {
      this.scene.restart();
    }
  }
}
