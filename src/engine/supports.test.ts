import { createMockSkillCard, createMockSupportCard } from "@/lib/test-helpers";
import type { SkillCard, SkillOutput, SupportCard, SupportModification } from "@/lib/types";
import { filterCompatibleMods, resolveSupports } from "./supports";

describe("supports", () => {
  describe("filterCompatibleMods", () => {
    it("returns only compatible mods", () => {
      const mockCard = createMockSkillCard({ tags: ["Attack"] });

      const mockSupports = [createMockSupportCard({ compatibleTags: ["Attack"] }), createMockSupportCard({ compatibleTags: ["Spell"] })];

      const result = filterCompatibleMods({ skill: mockCard as SkillCard, supports: mockSupports as SupportCard[] });

      expect(result.length).toBe(1);
      expect(result[0]).toEqual((mockSupports[0] as SupportCard).effect);
    });
  });

  describe("resolveSupports", () => {
    it("multiplies damage by the multiplier of a multiplicative mod", () => {
      const skillOutput: SkillOutput = { damage: 10, statuses: [], targets: [{ kind: "enemy", enemyId: "" }] };
      const mod: SupportModification = { kind: "multiplicative", multiplier: 1.5 };

      const result = resolveSupports({ skillOutput, mods: [mod] });

      expect(result.damage).toBe(15);
    });

    it("adds a status effect with the specified stack count", () => {
      const skillOutput: SkillOutput = { damage: 10, statuses: [], targets: [{ kind: "enemy", enemyId: "" }] };
      const mod: SupportModification = { kind: "additive", statusEffect: "Bleed", stacks: 1 };

      const result = resolveSupports({ skillOutput, mods: [mod] });

      expect(result.statuses[0].kind).toEqual("Bleed");
      expect(result.statuses[0].stacks).toBe(1);
    });

    it("chains two multiplicative mods by applying each to the running damage total", () => {
      const skillOutput: SkillOutput = { damage: 10, statuses: [], targets: [{ kind: "enemy", enemyId: "" }] };
      const modA: SupportModification = { kind: "multiplicative", multiplier: 2 };
      const modB: SupportModification = { kind: "multiplicative", multiplier: 3 };

      const result = resolveSupports({ skillOutput, mods: [modA, modB] });

      expect(result.damage).toBe(60);
    });
  });
});
