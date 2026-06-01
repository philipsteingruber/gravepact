import { assertNever } from "@/lib/assert-never";
import { RARITY_WEIGHT_COMMON, RARITY_WEIGHT_RARE, RARITY_WEIGHT_UNCOMMON } from "@/lib/constants";
import type { RewardRarity } from "@/lib/types";
import { randomBetween } from "@/lib/utils";

// --- Internal Helpers ---

const mapRarity = (rarity: RewardRarity): number => {
  if (rarity === "Common") {
    return RARITY_WEIGHT_COMMON;
  } else if (rarity === "Uncommon") {
    return RARITY_WEIGHT_UNCOMMON;
  } else if (rarity === "Rare") {
    return RARITY_WEIGHT_RARE;
  } else {
    return assertNever(rarity);
  }
};

export const sampleRewards = <T extends { rarity: RewardRarity; id: string }>(pool: T[], count: number): T[] => {
  let weightedPool: T[] = [];
  pool.forEach((card) => {
    weightedPool.push(...Array.from({ length: mapRarity(card.rarity) }, () => card));
  });

  const result: T[] = [];
  for (let i = 0; i < Math.min(count, pool.length); i++) {
    const index = randomBetween(0, weightedPool.length - 1);
    result.push(weightedPool[index]);
    weightedPool = weightedPool.filter((card) => card.id !== weightedPool[index].id);
  }
  return result;
};
