import { createMockSkillCard, createMockSupportCard } from "@/lib/test-helpers";
import type { SkillCard, SkillOutput, SupportCard, SupportModification } from "@/lib/types";
import { filterCompatibleMods, resolveSupports } from "./supports";

describe("supports", () => {
  describe("filterCompatibleMods", () => {
    it("should only return compatible mods", () => {
      const mockCard = createMockSkillCard({ tags: ["Attack"] });

      const mockSupports = [
        createMockSupportCard({ compatibleTags: ["Attack"] }),
        createMockSupportCard({ compatibleTags: ["Spell"] }),
      ];

      const result = filterCompatibleMods({ skill: mockCard as SkillCard, supports: mockSupports as SupportCard[] });

      expect(result.length).toBe(1);
      expect(result[0]).toEqual((mockSupports[0] as SupportCard).effect);
    });
  });

  describe("resolveSupports", () => {
    it("should correctly calculate multiplicative mods", () => {
      const skillOutput: SkillOutput = { damage: 10, statuses: [], targets: [{ kind: "enemy", enemyId: "" }] };
      const mod: SupportModification = { kind: "multiplicative", multiplier: 1.5 };

      const result = resolveSupports({ output: skillOutput, mods: [mod] });

      expect(result.damage).toBe(15);
    });

    it("should correctly handle additive mods", () => {
      const skillOutput: SkillOutput = { damage: 10, statuses: [], targets: [{ kind: "enemy", enemyId: "" }] };
      const mod: SupportModification = { kind: "additive", statusEffect: "Bleed", stacks: 1 };

      const result = resolveSupports({ output: skillOutput, mods: [mod] });

      expect(result.statuses[0].kind).toEqual("Bleed");
      expect(result.statuses[0].stacks).toBe(1);
    });
  });
});
