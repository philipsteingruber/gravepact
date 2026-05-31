import {
  CARD_PRICE_COMMON,
  CARD_PRICE_RARE,
  CARD_PRICE_UNCOMMON,
  RELIC_PRICE_COMMON,
  RELIC_PRICE_RARE,
  RELIC_PRICE_UNCOMMON,
} from "@/lib/constants";
import { createMockRelic, createMockSkillCard, repeat } from "@/lib/test-helpers";
import { generateShopInventory, getCardPrice, getRelicPrice } from "./shop";

const cardPool = [
  createMockSkillCard({ id: "card-1", rarity: "Common" }),
  createMockSkillCard({ id: "card-2", rarity: "Common" }),
  createMockSkillCard({ id: "card-3", rarity: "Common" }),
  createMockSkillCard({ id: "card-4", rarity: "Common" }),
  createMockSkillCard({ id: "card-5", rarity: "Common" }),
  createMockSkillCard({ id: "card-6", rarity: "Common" }),
  createMockSkillCard({ id: "card-7", rarity: "Common" }),
  createMockSkillCard({ id: "card-8", rarity: "Common" }),
  createMockSkillCard({ id: "card-9", rarity: "Common" }),
  createMockSkillCard({ id: "card-10", rarity: "Common" }),
];

const relicPool = [
  createMockRelic({ id: "relic-1" }),
  createMockRelic({ id: "relic-2" }),
  createMockRelic({ id: "relic-3" }),
  createMockRelic({ id: "relic-4" }),
  createMockRelic({ id: "relic-5" }),
];

describe("shop", () => {
  describe("getCardPrice", () => {
    it("returns the Common price for a Common card", () => {
      const card = createMockSkillCard({ rarity: "Common" });

      const result = getCardPrice(card);

      expect(result).toBe(CARD_PRICE_COMMON);
    });

    it("returns the Uncommon price for an Uncommon card", () => {
      const card = createMockSkillCard({ rarity: "Uncommon" });

      const result = getCardPrice(card);

      expect(result).toBe(CARD_PRICE_UNCOMMON);
    });

    it("returns the Rare price for a Rare card", () => {
      const card = createMockSkillCard({ rarity: "Rare" });

      const result = getCardPrice(card);

      expect(result).toBe(CARD_PRICE_RARE);
    });
  });

  describe("getRelicPrice", () => {
    it("returns the Common price for a Common relic", () => {
      const relic = createMockRelic({ rarity: "Common" });

      const result = getRelicPrice(relic);

      expect(result).toBe(RELIC_PRICE_COMMON);
    });

    it("returns the Uncommon price for an Uncommon relic", () => {
      const relic = createMockRelic({ rarity: "Uncommon" });

      const result = getRelicPrice(relic);

      expect(result).toBe(RELIC_PRICE_UNCOMMON);
    });

    it("returns the Rare price for a Rare relic", () => {
      const relic = createMockRelic({ rarity: "Rare" });

      const result = getRelicPrice(relic);

      expect(result).toBe(RELIC_PRICE_RARE);
    });
  });

  describe("generateShopInventory", () => {
    it("returns between 4 and 5 cards", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        expect(shopInventory.cards.length).toBeGreaterThanOrEqual(4);
        expect(shopInventory.cards.length).toBeLessThanOrEqual(5);
      });
    });

    it("returns between 1 and 2 relics", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        expect(shopInventory.relics.length).toBeGreaterThanOrEqual(1);
        expect(shopInventory.relics.length).toBeLessThanOrEqual(2);
      });
    });

    it("never returns duplicate cards", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        const cardIds = new Set(shopInventory.cards.map((card) => card.id));

        expect(cardIds.size).toBe(shopInventory.cards.length);
      });
    });

    it("never returns duplicate relics", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        const relicIds = new Set(shopInventory.relics.map((relic) => relic.id));

        expect(relicIds.size).toBe(shopInventory.relics.length);
      });
    });

    it("never returns a card not in the location pool", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        const cardIds = new Set(cardPool.map((card) => card.id));

        shopInventory.cards.forEach((card) => {
          expect(cardIds.has(card.id)).toBe(true);
        });
      });
    });

    it("never returns a relic not in the location pool", () => {
      repeat(() => {
        const shopInventory = generateShopInventory([...cardPool], [...relicPool]);

        const relicIds = new Set(relicPool.map((relic) => relic.id));

        shopInventory.relics.forEach((relic) => {
          expect(relicIds.has(relic.id)).toBe(true);
        });
      });
    });
  });
});
