// --- Primitives ---

import type { EffectId } from "@/engine/effects";

export type SkillTag = "Attack" | "Spell" | "Curse" | "Block" | "Summon";
export type CardRarity = "Common" | "Uncommon" | "Rare";
export type StatusEffectKind = "Bleed" | "Weaken" | "Burn" | "Armor";

// --- Status Effects ---

export type StatusEffect = { kind: StatusEffectKind; stacks: number };

// --- Cards ---

export type Target = { kind: "enemy"; enemyId: string };

export type MultiplicativeEffect = { kind: "multiplicative"; multiplier: number };
export type AdditiveEffect = { kind: "additive"; statusEffect: StatusEffectKind; stacks: number };
export type CostReductionEffect = { kind: "reduceCost"; amount: number };
export type ChangeBehaviorEffect = { kind: "changeBehavior"; behaviorId: string };
export type SupportModification = MultiplicativeEffect | AdditiveEffect | CostReductionEffect | ChangeBehaviorEffect;

export type SkillCard = {
  kind: "skill";
  tags: SkillTag[];
  target: Target;
  effectId: EffectId;
  energyCost: number;
};
export type SupportCard = {
  kind: "support";
  effect: SupportModification;
  compatibleTags: SkillTag[];
  energyCost: number;
};
export type AuraCard = { kind: "aura"; effectId: string; energyReservation: number };
export type RelicCard = { kind: "relic"; effectId: string };

export type Card = { id: string; name: string; rarity: CardRarity } & (SkillCard | SupportCard | AuraCard | RelicCard);

// --- Enemies ---

export type AttackIntent = { kind: "attack"; damage: number };
export type BlockIntent = { kind: "defend"; amount: number };
export type DebuffIntent = { kind: "debuff"; effectKind: StatusEffectKind; stacks: number };
export type EnemyIntent = AttackIntent | BlockIntent | DebuffIntent;

export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  intents: EnemyIntent[];
  intentIndex: number;
  statuses: StatusEffect[];
};

// --- Entities ---

export type MapNode = { id: string; name: string };
export type Upgrade = { id: string; name: string };
export type CharacterClass = { id: string; name: string };

// --- State ---

export type CombatState = {
  enemy: Enemy;
  energyRemaining: number;
  energyMax: number;
  stagedCards: Card[];
};
export type RunState = {
  deck: Card[];
  hand: Card[];
  discardPile: Card[];
  relics: RelicCard[];
  activeAuras: AuraCard[];
  playerHealth: number;
  playerMaxHealth: number;
  reservedEnergy: number;
  visitedNodes: MapNode[];
  combat: CombatState | null;
};
export type MetaState = {
  orbs: number;
  unlockedCards: Card[];
  purchasedUpgrades: Upgrade[];
  unlockedClasses: CharacterClass[];
};

export type GameState = { meta: MetaState; run: RunState };
export type Store = { gameState: GameState };

// --- Engine Outputs ---

export type SkillOutput = { damage: number; statuses: StatusEffect[]; targets: Target[] };
export type StatusTickResult = { enemy: Enemy; totalDamage: number };
