import {
  MIN_ELITE_LAYER,
  MAX_ELITE_COUNT,
  MAX_LAYERS_PER_MAP,
  MAX_REST_COUNT,
  MAX_SHOP_COUNT,
  MAX_SPECIAL_NODE_LAYER,
  MIN_ELITE_COUNT,
  MIN_LAYERS_PER_MAP,
  MIN_REST_COUNT,
  MIN_SHOP_COUNT,
  MIN_SPECIAL_NODE_LAYER,
} from "@/lib/constants";
import type { GeneratedMap } from "@/lib/types";
import { pickRandom, randomBetween } from "@/lib/utils";

export const generateMap = (): GeneratedMap => {
  const layersCount = randomBetween(MIN_LAYERS_PER_MAP, MAX_LAYERS_PER_MAP);

  const generatedMap = generateNodes(layersCount);

  let groupedByLayer = groupNodesByLayer(generatedMap);
  assignConnections(groupedByLayer, layersCount);

  // Nodes are regrouped since connection assignment mutated the nodes in place
  groupedByLayer = groupNodesByLayer(generatedMap);
  ensureFullCoverage(groupedByLayer, layersCount);

  assignNodeTypes(generatedMap);

  return generatedMap;
};

// --- Node Generation Functions

const generateNodes = (layersCount: number): GeneratedMap => {
  const generatedMap: GeneratedMap = [];
  let generatedNodes = 0;

  for (let i = 0; i < layersCount - 1; i++) {
    generatedMap.push({ id: generatedNodes.toString(), connections: [], kind: "combat", layer: i });
    generatedMap.push({ id: (generatedNodes + 1).toString(), connections: [], kind: "combat", layer: i });
    generatedNodes += 2;
  }
  generatedMap.push({ id: generatedNodes.toString(), connections: [], kind: "boss", layer: layersCount - 1 });

  return generatedMap;
};

const assignConnections = (groupedByLayer: ReturnType<typeof groupNodesByLayer>, layersCount: number) => {
  for (let i = 0; i < layersCount - 1; i++) {
    const nodesInLayer = groupedByLayer[i];
    nodesInLayer.forEach((node) => {
      const numConnections = randomBetween(1, 2);
      node.connections = pickRandom(groupedByLayer[i + 1], numConnections).map((node) => node.id);
    });
  }
};

// Random connection assignment can leave later-layer nodes with no incoming connection (unreachable)
const ensureFullCoverage = (groupedByLayer: ReturnType<typeof groupNodesByLayer>, layersCount: number) => {
  for (let i = 1; i < layersCount; i++) {
    const nodesWithIncomingConnection = new Set(
      groupedByLayer[i].reduce((acc, node) => {
        if (groupedByLayer[i - 1].some((previousLayerNode) => previousLayerNode.connections.includes(node.id))) {
          acc.push(node.id);
        }
        return acc;
      }, [] as string[]),
    );

    const nodesWithoutIncomingConnections = groupedByLayer[i].filter(
      (node) => !nodesWithIncomingConnection.has(node.id),
    );

    nodesWithoutIncomingConnections.forEach((node) => {
      const nodeToAddConnectionTo = pickRandom(groupedByLayer[i - 1], 1)[0];
      nodeToAddConnectionTo.connections.push(node.id);
    });
  }
};

const assignNodeTypes = (generatedMap: GeneratedMap) => {
  const candidates = generatedMap.filter((node) => node.kind !== "boss");
  const reassignedCandidates: Set<string> = new Set();

  // Elites
  const eliteCandidates = candidates.filter((node) => node.layer >= MIN_ELITE_LAYER);
  pickRandom(eliteCandidates, randomBetween(MIN_ELITE_COUNT, MAX_ELITE_COUNT)).forEach((node) => {
    node.kind = "elite";
    reassignedCandidates.add(node.id);
  });

  // Shops
  const shopCandidates = candidates.filter(
    (node) =>
      node.layer >= MIN_SPECIAL_NODE_LAYER && node.layer <= MAX_SPECIAL_NODE_LAYER && !reassignedCandidates.has(node.id),
  );
  pickRandom(shopCandidates, randomBetween(MIN_SHOP_COUNT, MAX_SHOP_COUNT)).forEach((node) => {
    node.kind = "shop";
    reassignedCandidates.add(node.id);
  });

  // Rest Sites
  const restCandidates = candidates.filter(
    (node) =>
      node.layer >= MIN_SPECIAL_NODE_LAYER && node.layer <= MAX_SPECIAL_NODE_LAYER && !reassignedCandidates.has(node.id),
  );
  pickRandom(restCandidates, randomBetween(MIN_REST_COUNT, MAX_REST_COUNT)).forEach((node) => {
    node.kind = "rest";
    reassignedCandidates.add(node.id);
  });
};

// --- Helpers ---

export const calculateLayersCount = (generatedMap: GeneratedMap) =>
  Array.from(new Set(generatedMap.map((node) => node.layer))).length;

export const calculateMaxLayer = (generatedMap: GeneratedMap) => Math.max(...generatedMap.map((node) => node.layer));

export const groupNodesByLayer = (generatedMap: GeneratedMap) =>
  generatedMap.reduce(
    (acc, node) => {
      acc[node.layer] = acc[node.layer] ?? [];
      acc[node.layer].push(node);
      return acc;
    },
    {} as Record<number, GeneratedMap>,
  );

export const getAllConnections = (generatedMap: GeneratedMap) =>
  new Set(generatedMap.flatMap((node) => node.connections));
