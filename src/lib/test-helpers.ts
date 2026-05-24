import type { AuraCard, Card, Enemy, SkillCard, SupportCard } from "./types";

export const createMockEnemy = (overrides?: Partial<Enemy>): Enemy => {
  return {
    id: "mock_enemy",
    name: "Mock Enemy",
    hp: 20,
    maxHp: 20,
    intents: [{ kind: "attack", damage: 5 }],
    intentIndex: 0,
    statuses: [],
    ...overrides,
  };
};

export const createMockSkillCard = (overrides?: Partial<SkillCard>): Card => {
  return {
    kind: "skill",
    effectId: "exsanguinate",
    energyCost: 1,
    tags: [],
    id: "mock_card",
    name: "Mock Card",
    rarity: "Common",
    target: { kind: "enemy", enemyId: "mock_enemy" },
    ...overrides,
  };
};

export const createMockSupportCard = (overrides?: Partial<SupportCard>): Card => {
  return {
    kind: "support",
    energyCost: 1,
    id: "mock_card",
    name: "Mock Card",
    rarity: "Common",
    compatibleTags: [],
    effect: { kind: "changeBehavior", behaviorId: "test" },
    ...overrides,
  };
};

export const createMockAuraCard = (overrides?: Partial<AuraCard>): Card => {
  return {
    kind: "aura",
    id: "mock_card",
    name: "Mock Card",
    rarity: "Common",
    effectId: "test-aura",
    energyReservation: 1,
    ...overrides,
  };
};
