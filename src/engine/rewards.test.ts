import { createMockSkillCard, repeat } from "@/lib/test-helpers";
import type { RewardRarity } from "@/lib/types";
import { sampleRewards } from "./rewards";

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

describe("engine/rewards", () => {
  describe("sampleRewardCards", () => {
    it("returns the requested number of cards", () => {
      const pool = [...cardPool];

      const result = sampleRewards(pool, 3);

      expect(result.length).toBe(3);
    });

    it("never returns duplicate cards", () => {
      repeat(() => {
        const pool = [...cardPool];

        const result = sampleRewards(pool, 5);
        const cardIds = new Set(result.map((card) => card.id));

        expect(cardIds.size).toBe(5);
      });
    });

    it("returns fewer cards than requested when pool is smaller than count", () => {
      const pool = [...cardPool.slice(0, 2)];

      const result = sampleRewards(pool, 5);
      const cardIds = new Set(result.map((card) => card.id));

      expect(cardIds.size).toBe(2);
    });

    it("samples proportionally to rarity weight across many draws", () => {
      repeat(() => {
        const pool = [
          createMockSkillCard({ rarity: "Common", id: "1" }),
          createMockSkillCard({ rarity: "Uncommon", id: "2" }),
          createMockSkillCard({ rarity: "Rare", id: "3" }),
        ];
        const results: Record<RewardRarity, number> = { Common: 0, Uncommon: 0, Rare: 0 };

        for (let i = 0; i < 200; i++) {
          const card = sampleRewards(pool, 1)[0];
          results[card.rarity] += 1;
        }

        expect(results["Common"]).toBeGreaterThan(results["Uncommon"]);
        expect(results["Uncommon"]).toBeGreaterThan(results["Rare"]);
      });
    });

    it("never returns a card not in the pool", () => {
      repeat(() => {
        const pool = [...cardPool];

        const result = sampleRewards(pool, 5);

        result.forEach((card) => expect(pool.includes(card)).toBe(true));
      });
    });
  });
});
