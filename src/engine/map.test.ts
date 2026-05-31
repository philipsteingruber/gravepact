import { MAX_REST_COUNT, MIN_REST_COUNT } from "@/lib/constants";
import { createMockMapNode, repeat } from "@/lib/test-helpers";
import type { Enemy, MapNode } from "@/lib/types";
import { calculateLayersCount, calculateMaxLayer, generateMap, getAllConnections, getNode, groupNodesByLayer } from "./map";

const enemies: Enemy[] = [
  { id: "enemy1", name: "Enemy1", maxHp: 1, hp: 1, intents: [{ kind: "attack", damage: 5 }], intentIndex: 0, statuses: [] },
  { id: "enemy2", name: "Enemy2", maxHp: 2, hp: 2, intents: [{ kind: "attack", damage: 5 }], intentIndex: 0, statuses: [] },
  { id: "enemy3", name: "Enemy3", maxHp: 3, hp: 3, intents: [{ kind: "attack", damage: 5 }], intentIndex: 0, statuses: [] },
];
const bosses: Enemy[] = [
  { id: "boss", name: "boss", maxHp: 1, hp: 1, intents: [{ kind: "attack", damage: 5 }], intentIndex: 0, statuses: [] },
];

describe("engine", () => {
  describe("getNode", () => {
    it("returns the node with the matching id", () => {
      const nodes: MapNode[] = [createMockMapNode({ id: "1" }), createMockMapNode({ id: "2" }), createMockMapNode({ id: "3" })];

      const result = getNode(nodes, "1");

      expect(result).toEqual(nodes[0]);
    });

    it("throws when no node with that ID exists", () => {
      const nodes: MapNode[] = [];

      expect(() => getNode(nodes, "1")).toThrow();
    });
  });

  describe("generateMap", () => {
    it("returns a non-empty array", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        expect(generatedMap.length).toBeGreaterThan(0);
      });
    });

    it("generates a map with 10-12 distinct layers", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const layersCount = calculateLayersCount(generatedMap);

        expect(layersCount).toBeGreaterThanOrEqual(10);
        expect(layersCount).toBeLessThanOrEqual(12);
      });
    });

    it("generates 2-3 nodes in every non-final layer", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const maxLayer = calculateMaxLayer(generatedMap);
        const nodesByLayer = groupNodesByLayer(generatedMap);

        Object.keys(nodesByLayer).forEach((layer) => {
          const layerNum = Number(layer);
          if (layerNum !== maxLayer) {
            expect(nodesByLayer[layerNum].length).toBeGreaterThanOrEqual(2);
            expect(nodesByLayer[layerNum].length).toBeLessThanOrEqual(3);
          }
        });
      });
    });

    it("generates exactly 1 node in the final layer", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.filter((node) => node.layer === maxLayer).length).toBe(1);
      });
    });

    it("generates nodes that all have a unique ID", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const nodeIds = Array.from(new Set(generatedMap.map((node) => node.id)));

        expect(nodeIds.length).toBe(generatedMap.length);
      });
    });

    it("generates a node on the last layer with kind: 'boss'", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.find((node) => node.layer === maxLayer)?.kind).toBe("boss");
      });
    });

    it("assigns an enemy from the boss pool to the boss node", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        expect(generatedMap.find((node) => node.kind === "boss")!.assignedEnemyId).toBe("boss");
      });
    });

    it("generates a node on the last layer with no connections", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.find((node) => node.layer === maxLayer)?.connections.length).toBe(0);
      });
    });

    it("ensures all nodes on non-final layers have at least 1 connection", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const maxLayer = calculateMaxLayer(generatedMap);
        const nonBossNodes = generatedMap.filter((node) => node.layer !== maxLayer);

        expect(nonBossNodes.every((node) => node.connections.length >= 1)).toBe(true);
      });
    });

    it("ensures all connection targets reference existing node IDs", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const nodeIds = new Set(generatedMap.map((node) => node.id));

        expect(generatedMap.every((node) => node.connections.every((connection) => nodeIds.has(connection)))).toBe(true);
      });
    });

    it("ensures every non-first-layer node has at least one incoming connection", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const allConnections = getAllConnections(generatedMap);
        const nonFirstLayerNodes = generatedMap.filter((node) => node.layer !== 0);

        expect(nonFirstLayerNodes.every((node) => allConnections.has(node.id))).toBe(true);
      });
    });

    it("only generates elite encounters in layer 6 or later", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const eliteNodes = generatedMap.filter((node) => node.kind === "elite");

        expect(eliteNodes.every((node) => node.layer >= 6)).toBe(true);
      });
    });

    it("assigns an enemyId from the pool to every elite node", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const eliteNodes = generatedMap.filter((node) => node.kind === "elite");

        expect(eliteNodes.every((node) => !!node.assignedEnemyId)).toBe(true);
      });
    });

    it("only generates shop encounters in layers 3-8", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const shopEncounters = generatedMap.filter((node) => node.kind === "shop");

        expect(shopEncounters.every((node) => node.layer >= 3 && node.layer <= 8)).toBe(true);
      });
    });

    it("only generates rest encounters in layers 3-8", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const shopEncounters = generatedMap.filter((node) => node.kind === "rest");

        expect(shopEncounters.every((node) => node.layer >= 3 && node.layer <= 8)).toBe(true);
      });
    });

    it("generates 2-3 elite encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const eliteNodes = generatedMap.filter((node) => node.kind === "elite");

        expect(eliteNodes.length).toBeGreaterThanOrEqual(2);
        expect(eliteNodes.length).toBeLessThanOrEqual(3);
      });
    });

    it("generates MIN_REST_COUNT-MAX_REST_COUNT rest encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const restNodes = generatedMap.filter((node) => node.kind === "rest");

        expect(restNodes.length).toBeGreaterThanOrEqual(MIN_REST_COUNT);
        expect(restNodes.length).toBeLessThanOrEqual(MAX_REST_COUNT);
      });
    });

    it("generates 2-3 shop encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const shopNodes = generatedMap.filter((node) => node.kind === "shop");

        expect(shopNodes.length).toBeGreaterThanOrEqual(2);
        expect(shopNodes.length).toBeLessThanOrEqual(3);
      });
    });

    it("generates non-crossing connections between layers", () => {
      repeat(() => {
        const generatedMap = generateMap(enemies, bosses);

        const groupedByLayer = groupNodesByLayer(generatedMap);
        const maxLayer = calculateMaxLayer(generatedMap);

        for (let layer = 0; layer < maxLayer; layer++) {
          const sourceNodes = groupedByLayer[layer];
          const targetNodes = groupedByLayer[layer + 1];

          const targetPosition: Record<string, number> = {};
          targetNodes.forEach((node, index) => {
            targetPosition[node.id] = index;
          });

          for (let i = 0; i < sourceNodes.length - 1; i++) {
            const maxTargetI = Math.max(...sourceNodes[i].connections.map((c) => targetPosition[c]));
            const minTargetJ = Math.min(...sourceNodes[i + 1].connections.map((c) => targetPosition[c]));
            expect(maxTargetI).toBeLessThanOrEqual(minTargetJ);
          }
        }
      });
    });
  });
});
