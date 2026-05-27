import {
  MAX_ELITE_COUNT,
  MAX_LAYERS_PER_MAP,
  MAX_REST_COUNT,
  MAX_SHOP_COUNT,
  MAX_SPECIAL_NODE_LAYER,
  MIN_ELITE_COUNT,
  MIN_ELITE_LAYER,
  MIN_LAYERS_PER_MAP,
  MIN_REST_COUNT,
  MIN_SHOP_COUNT,
  MIN_SPECIAL_NODE_LAYER,
} from "@/lib/constants";
import type { Enemy, GeneratedMap, MapNode } from "@/lib/types";
import { pickRandom, randomBetween } from "@/lib/utils";

export const generateMap = (enemyPool: Enemy[], bossPool: Enemy[]): GeneratedMap => {
  const layersCount = randomBetween(MIN_LAYERS_PER_MAP, MAX_LAYERS_PER_MAP);

  const generatedMap = generateNodes(layersCount, bossPool);

  let groupedByLayer = groupNodesByLayer(generatedMap);
  assignConnections(groupedByLayer, layersCount);

  // Nodes are regrouped since connection assignment mutated the nodes in place
  groupedByLayer = groupNodesByLayer(generatedMap);
  ensureFullCoverage(groupedByLayer, layersCount);

  assignNodeTypes(generatedMap, enemyPool);

  return generatedMap;
};

// --- Node Generation Functions

const generateNodes = (layersCount: number, bossPool: Enemy[]): GeneratedMap => {
  const generatedMap: GeneratedMap = [];
  let generatedNodes = 0;

  for (let i = 0; i < layersCount - 1; i++) {
    for (let j = 0; j < randomBetween(2, 3); j++) {
      generatedMap.push({ id: generatedNodes.toString(), connections: [], kind: "combat", layer: i });
      generatedNodes += 1;
    }
  }
  generatedMap.push({
    id: generatedNodes.toString(),
    connections: [],
    kind: "boss",
    layer: layersCount - 1,
    assignedEnemyId: pickRandom(bossPool, 1)[0].id,
  });

  return generatedMap;
};

const assignConnections = (groupedByLayer: ReturnType<typeof groupNodesByLayer>, layersCount: number) => {
  for (let layer = 0; layer < layersCount - 1; layer++) {
    const sourceNodes = groupedByLayer[layer];
    const n = sourceNodes.length;
    const targetNodes = groupedByLayer[layer + 1];
    const m = targetNodes.length;

    sourceNodes.forEach((sourceNode, sourceIndex) => {
      const windowStart = Math.floor((sourceIndex * m) / n);
      const windowEnd = Math.floor(((sourceIndex + 1) * m) / n) + 1;

      const candidates = targetNodes.slice(windowStart, windowEnd);
      sourceNode.connections = pickRandom(candidates, randomBetween(1, Math.min(2, windowEnd - windowStart))).map((node) => node.id);
    });
  }
};

// Random connection assignment can leave later-layer nodes with no incoming connection (unreachable)
const ensureFullCoverage = (groupedByLayer: ReturnType<typeof groupNodesByLayer>, layersCount: number) => {
  for (let i = 1; i < layersCount; i++) {
    const n = groupedByLayer[i - 1].length;
    const m = groupedByLayer[i].length;

    const nodesWithIncomingConnection = new Set(
      groupedByLayer[i].reduce((acc, node) => {
        if (groupedByLayer[i - 1].some((previousLayerNode) => previousLayerNode.connections.includes(node.id))) {
          acc.push(node.id);
        }
        return acc;
      }, [] as string[]),
    );

    const nodesWithoutIncomingConnections = groupedByLayer[i].filter((node) => !nodesWithIncomingConnection.has(node.id));

    nodesWithoutIncomingConnections.forEach((node) => {
      const k = groupedByLayer[node.layer].findIndex((n) => n.id === node.id);
      const sourceIndex = Math.min(n - 1, Math.floor((k * n) / m));

      const nodeToAddConnectionTo = groupedByLayer[i - 1][sourceIndex];
      nodeToAddConnectionTo.connections.push(node.id);
    });
  }
};

const assignNodeTypes = (generatedMap: GeneratedMap, enemyPool: Enemy[]) => {
  const candidates = generatedMap.filter((node) => node.kind !== "boss");
  const reassignedCandidates: Set<string> = new Set();

  // Elites
  const eliteCandidates = candidates.filter((node) => node.layer >= MIN_ELITE_LAYER);
  pickRandom(eliteCandidates, randomBetween(MIN_ELITE_COUNT, MAX_ELITE_COUNT)).forEach((candidateNode) => {
    const index = generatedMap.findIndex((node) => node.id === candidateNode.id);
    generatedMap[index] = { ...candidateNode, kind: "elite", assignedEnemyId: pickRandom(enemyPool, 1)[0].id };
    reassignedCandidates.add(candidateNode.id);
  });

  // Shops
  const shopCandidates = candidates.filter(
    (node) => node.layer >= MIN_SPECIAL_NODE_LAYER && node.layer <= MAX_SPECIAL_NODE_LAYER && !reassignedCandidates.has(node.id),
  );
  pickRandom(shopCandidates, randomBetween(MIN_SHOP_COUNT, MAX_SHOP_COUNT)).forEach((node) => {
    node.kind = "shop";
    reassignedCandidates.add(node.id);
  });

  // Rest Sites
  const restCandidates = candidates.filter(
    (node) => node.layer >= MIN_SPECIAL_NODE_LAYER && node.layer <= MAX_SPECIAL_NODE_LAYER && !reassignedCandidates.has(node.id),
  );
  pickRandom(restCandidates, randomBetween(MIN_REST_COUNT, MAX_REST_COUNT)).forEach((node) => {
    node.kind = "rest";
    reassignedCandidates.add(node.id);
  });
};

// --- Helpers ---

export const calculateLayersCount = (generatedMap: GeneratedMap) => Array.from(new Set(generatedMap.map((node) => node.layer))).length;

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

export const getAllConnections = (generatedMap: GeneratedMap) => new Set(generatedMap.flatMap((node) => node.connections));

export const getNode = (nodes: MapNode[], id: string): MapNode => {
  const node = nodes.find((node) => node.id === id);

  if (!node) throw new Error(`No MapNode found with ${id}`);

  return node;
};
