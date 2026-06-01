import { assertNever } from "@/lib/assert-never";
import {
  CARD_PRICE_COMMON,
  CARD_PRICE_RARE,
  CARD_PRICE_UNCOMMON,
  RELIC_PRICE_COMMON,
  RELIC_PRICE_RARE,
  RELIC_PRICE_UNCOMMON,
} from "@/lib/constants";
import type { Card, Relic, ShopInventory } from "@/lib/types";
import { randomBetween } from "@/lib/utils";
import { sampleRewards } from "./rewards";

// --- Pricing ---

export const getCardPrice = (card: Card): number => {
  if (card.rarity === "Common") {
    return CARD_PRICE_COMMON;
  } else if (card.rarity === "Uncommon") {
    return CARD_PRICE_UNCOMMON;
  } else if (card.rarity === "Rare") {
    return CARD_PRICE_RARE;
  } else {
    return assertNever(card.rarity);
  }
};

export const getRelicPrice = (relic: Relic): number => {
  if (relic.rarity === "Common") {
    return RELIC_PRICE_COMMON;
  } else if (relic.rarity === "Uncommon") {
    return RELIC_PRICE_UNCOMMON;
  } else if (relic.rarity === "Rare") {
    return RELIC_PRICE_RARE;
  } else {
    return assertNever(relic.rarity);
  }
};

// --- Inventory Generation ---

export const generateShopInventory = (cardPool: Card[], relicPool: Relic[]): ShopInventory => {
  return {
    cards: sampleRewards(cardPool, randomBetween(4, 5)),
    relics: sampleRewards(relicPool, randomBetween(1, 2)),
  };
};
