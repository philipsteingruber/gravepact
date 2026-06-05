// --- Primitives ---

import type { EffectId } from "@/data/effects";
import type { RelicEffectId } from "@/data/relic-effects";

export type SkillTag = "Attack" | "Spell" | "Curse" | "Block" | "Summon";
export type RewardRarity = "Common" | "Uncommon" | "Rare";
export type StatusEffectKind = "Bleed" | "Weaken" | "Burn" | "Armor";

// --- Status Effects ---

export type StatusEffect = { kind: StatusEffectKind; stacks: number };

// --- Cards ---

export type Target = { kind: "enemy"; enemyId: string } | { kind: "player" };

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

export type BaseCard = { id: string; name: string; description: string; rarity: RewardRarity };
export type Card = BaseCard & (SkillCard | SupportCard | AuraCard);

// --- Relics ---

export type RelicTriggerKind = "onCombatStart" | "onTurnStart" | "onSkillPlay";

export type RelicContext =
  | { triggerKind: "onCombatStart" }
  | { triggerKind: "onTurnStart" }
  | { triggerKind: "onSkillPlay"; card: SkillCard };
export type Relic = {
  id: string;
  name: string;
  description: string;
  rarity: RewardRarity;
  effectId: RelicEffectId;
  triggerKind: RelicTriggerKind;
};

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

export type MapNode = {
  id: string;
  kind: "combat" | "elite" | "shop" | "rest" | "boss";
  layer: number;
  connections: string[];
  assignedEnemyId?: string;
};
export type GeneratedMap = MapNode[];

export type LocationData = { cardPool: Card[] };

export type Upgrade = { id: string; name: string };
export type CharacterClass = { id: string; name: string };

// --- State ---

export type CombatState = {
  enemy: Enemy;
  energyRemaining: number;
  energyMax: number;
  activeAuras: AuraCard[];
  reservedEnergy: number;
  stagedCards: Card[];
  originalHandOrder: Card[];
  hand: Card[];
  discardPile: Card[];
  playerStatuses: StatusEffect[];
};
export type RunState = {
  deck: Card[];
  relics: Relic[];
  gold: number;

  playerHealth: number;
  playerMaxHealth: number;

  locationId: string;
  map: GeneratedMap;
  visitedNodes: MapNode[];
  currentNodeId: string | null;

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

// --- Shop ---

export type ShopInventory = { cards: Card[]; relics: Relic[] };
