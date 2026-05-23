import type { Card, SkillCard } from "./types";

export const createMockSkillCard = (overrides?: Partial<SkillCard>): Card => {
  return {
    kind: "skill",
    effectId: "test",
    energyCost: 1,
    tags: [],
    id: "mock_card",
    name: "Mock Card",
    rarity: "Common",
    target: { kind: "enemy" },
    ...overrides,
  };
};
