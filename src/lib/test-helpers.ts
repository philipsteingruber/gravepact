import { initialCombatState } from "@/state/combat-state";
import type { AuraCard, BaseCard, Card, CombatState, Enemy, MapNode, SkillCard, SupportCard } from "./types";

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

export const createMockSkillCard = (overrides?: Partial<BaseCard & SkillCard>): Card => {
  return {
    kind: "skill",
    effectId: "exsanguinate",
    energyCost: 1,
    tags: [],
    id: "mock_skill_card",
    name: "Mock Card",
    rarity: "Common",
    target: { kind: "enemy", enemyId: "mock_enemy" },
    ...overrides,
  };
};

export const createMockSupportCard = (overrides?: Partial<BaseCard & SupportCard>): Card => {
  return {
    kind: "support",
    energyCost: 1,
    id: "mock_support_card",
    name: "Mock Card",
    rarity: "Common",
    compatibleTags: [],
    effect: { kind: "changeBehavior", behaviorId: "test" },
    ...overrides,
  };
};

export const createMockAuraCard = (overrides?: Partial<BaseCard & AuraCard>): Card => {
  return {
    kind: "aura",
    id: "mock_aura_card",
    name: "Mock Card",
    rarity: "Common",
    effectId: "sanguine_rite_tick",
    energyReservation: 1,
    ...overrides,
  };
};

export const createMockMapNode = (overrides?: Partial<MapNode>): MapNode => {
  return {
    kind: "combat",
    id: "mock_node",
    connections: [],
    layer: 0,
    assignedEnemyId: undefined,
    ...overrides,
  };
};

export const createMockCombatState = (overrides?: Partial<CombatState>): CombatState => {
  return {
    ...initialCombatState,
    enemy: createMockEnemy(),
    ...overrides,
  };
};
