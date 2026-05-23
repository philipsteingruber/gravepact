export type SkillTag = "Attack" | "Spell" | "Curse" | "Block" | "Summon";
export type CardRarity = "Common" | "Uncommon" | "Rare";

export type Target = { kind: "enemy"; enemyId: string };

export type StatusEffectKind = "Bleed" | "Weaken" | "Burn" | "Armor";
export type StatusEffect = { kind: StatusEffectKind; stacks: number };

export type MultiplicativeEffect = { kind: "multiplicative"; multiplier: number };
export type AdditiveEffect = { kind: "additive"; statusEffect: StatusEffectKind; stacks: number };
export type CostReductionEffect = { kind: "reduceCost"; amount: number };
export type ChangeBehaviorEffect = { kind: "changeBehavior"; behaviorId: string };
export type SupportModification = MultiplicativeEffect | AdditiveEffect | CostReductionEffect | ChangeBehaviorEffect;

export type SkillCard = {
  kind: "skill";
  tags: SkillTag[];
  target: Target;
  effectId: string;
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

export type MapNode = { id: string; name: string };

export type Upgrade = { id: string; name: string };

export type CharacterClass = { id: string; name: string };

export type AttackIntent = { kind: "attack"; damage: number };
export type BlockIntent = { kind: "defend"; amount: number };
export type DebuffIntent = { kind: "debuff"; effectKind: StatusEffectKind; stacks: number };
export type EnemyIntent = AttackIntent | BlockIntent | DebuffIntent;

export type Enemy = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  intent: EnemyIntent;
  statuses: StatusEffect[];
};

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
  health: number;
  visitedNodes: MapNode[];
  maxHealth: number;
  reservedEnergy: number;
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

export type SkillOutput = { damage: number; statuses: StatusEffect[]; targets: Target[] };
