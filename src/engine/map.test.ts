import { MAX_REST_COUNT, MIN_REST_COUNT } from "@/lib/constants";
import { calculateLayersCount, calculateMaxLayer, generateMap, getAllConnections, groupNodesByLayer } from "./map";

const ITERATIONS = 50;
const repeat = (fn: () => void) => {
  for (let i = 0; i < ITERATIONS; i++) fn();
};

describe("engine", () => {
  describe("generateMap", () => {
    it("returns a non-empty array", () => {
      repeat(() => {
        const generatedMap = generateMap();

        expect(generatedMap.length).toBeGreaterThan(0);
      });
    });

    it("generates a map with 10-12 distinct layers", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const layersCount = calculateLayersCount(generatedMap);

        expect(layersCount).toBeGreaterThanOrEqual(10);
        expect(layersCount).toBeLessThanOrEqual(12);
      });
    });

    it("generates 2-3 nodes in every non-final layer", () => {
      repeat(() => {
        const generatedMap = generateMap();

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
        const generatedMap = generateMap();

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.filter((node) => node.layer === maxLayer).length).toBe(1);
      });
    });

    it("generates nodes that all have a unique ID", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const nodeIds = Array.from(new Set(generatedMap.map((node) => node.id)));

        expect(nodeIds.length).toBe(generatedMap.length);
      });
    });

    it("generates a node on the last layer with kind: 'boss'", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.find((node) => node.layer === maxLayer)?.kind).toBe("boss");
      });
    });

    it("generates a node on the last layer with no connections", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const maxLayer = calculateMaxLayer(generatedMap);

        expect(generatedMap.find((node) => node.layer === maxLayer)?.connections.length).toBe(0);
      });
    });

    it("ensures all nodes on non-final layers have at least 1 connection", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const maxLayer = calculateMaxLayer(generatedMap);
        const nonBossNodes = generatedMap.filter((node) => node.layer !== maxLayer);

        expect(nonBossNodes.every((node) => node.connections.length >= 1)).toBe(true);
      });
    });

    it("ensures all connection targets reference existing node IDs", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const nodeIds = new Set(generatedMap.map((node) => node.id));

        expect(generatedMap.every((node) => node.connections.every((connection) => nodeIds.has(connection)))).toBe(
          true,
        );
      });
    });

    it("ensures every non-first-layer node has at least one incoming connection", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const allConnections = getAllConnections(generatedMap);
        const nonFirstLayerNodes = generatedMap.filter((node) => node.layer !== 0);

        expect(nonFirstLayerNodes.every((node) => allConnections.has(node.id))).toBe(true);
      });
    });

    it("only generates elite encounters in layer 6 or later", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const eliteNodes = generatedMap.filter((node) => node.kind === "elite");

        expect(eliteNodes.every((node) => node.layer >= 6)).toBe(true);
      });
    });

    it("only generates shop encounters in layers 3-8", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const shopEncounters = generatedMap.filter((node) => node.kind === "shop");

        expect(shopEncounters.every((node) => node.layer >= 3 && node.layer <= 8)).toBe(true);
      });
    });

    it("only generates rest encounters in layers 3-8", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const shopEncounters = generatedMap.filter((node) => node.kind === "rest");

        expect(shopEncounters.every((node) => node.layer >= 3 && node.layer <= 8)).toBe(true);
      });
    });

    it("generates 2-3 elite encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const eliteNodes = generatedMap.filter((node) => node.kind === "elite");

        expect(eliteNodes.length).toBeGreaterThanOrEqual(2);
        expect(eliteNodes.length).toBeLessThanOrEqual(3);
      });
    });

    it("generates MIN_REST_COUNT-MAX_REST_COUNT rest encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const restNodes = generatedMap.filter((node) => node.kind === "rest");

        expect(restNodes.length).toBeGreaterThanOrEqual(MIN_REST_COUNT);
        expect(restNodes.length).toBeLessThanOrEqual(MAX_REST_COUNT);
      });
    });

    it("generates 2-3 shop encounters in every map", () => {
      repeat(() => {
        const generatedMap = generateMap();

        const shopNodes = generatedMap.filter((node) => node.kind === "shop");

        expect(shopNodes.length).toBeGreaterThanOrEqual(2);
        expect(shopNodes.length).toBeLessThanOrEqual(3);
      });
    });
  });
});
