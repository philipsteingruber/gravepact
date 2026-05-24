# Gravepact — Game Design Document

A dark fantasy deck-building roguelite played in the browser. The player runs through themed cursed locations, building a deck of skills and supports that compound into powerful synergies. Each run ends in death or a boss kill; meta-progression permanently expands the card pool, unlocks new archetypes, and adds passive bonuses.

---

## Section 1 — Core Loop

**A run:**

Each run takes place in a single themed location — a flooded cave, a collapsed dungeon, an abandoned prison, a desecrated church. The location is presented as a **node map**: branching paths of rooms to navigate, each room chosen by the player. Node types:

- **Standard combat** — a regular enemy encounter
- **Elite combat** — harder enemy, better rewards
- **Shop** — buy cards, remove cards, buy relics
- **Rest site** — heal or upgrade a card
- **Boss** — the run's final challenge; defeating it ends the run in victory

The visual identity of each location shapes its enemy pool, room names, and visual palette. You are not in "Act 2" — you are in *The Sunken Ossuary*.

**Between runs:**

A persistent hub — dark, liminal, atmospheric — is where meta-progression lives. Spend **Orbs** (earned during runs) to unlock new cards, purchase passive upgrades, or unlock new archetypes. No dialogue. No story. Just the upgrade screens and a prompt to begin the next run.

**Run end conditions:**

- **Death** — run ends, meta-currency is kept
- **Boss kill** — run ends in victory, additional rewards granted

---

## Section 2 — Combat System

**Turn structure:**

Each turn begins with **3 energy** (base) and drawing up to a **hand of 5 cards**. On their turn the player stages cards by clicking them — selected cards move visually to a pending zone. When ready, they click **Play Hand** to commit and resolve that combo (see below). A turn can contain multiple Play Hand actions as long as the player has energy and cards. When done, the player clicks **End Turn** — enemies act, a new turn begins.

**Combo resolution:**

A combo is the set of cards a player stages before clicking Play Hand. A valid combo contains exactly one skill or one aura, plus any number of supports. Supports cannot form a combo alone.

On Play Hand: the skill's effect fires via the registry, modified by any compatible supports in the combo. Supports with no matching skill in the combo are moved to discard with no effect. Aura path: the aura moves to the persistent zone and reduces `energyMax` by its reservation. All combo cards then move to the discard pile and the staging area clears.

**Support interaction:**

Support cards modify skills played in the same turn. Supports cannot be played alone — the UI prevents confirming a turn with an orphaned support. Each support declares which skill tags it is compatible with (e.g. *Attack*, *Spell*, *Curse*). Incompatible supports played alongside an incompatible skill have no effect; they are silently ignored.

When multiple supports are played alongside a skill in the same turn, all compatible ones apply. This stacking is the primary source of compounding damage and effects — the Balatro-style synergy layer.

**Auras:**

Aura cards are played once per combat. On play, the Aura leaves the hand and moves to a visible **persistent zone** (separate from the deck and discard pile). Its effect applies passively every subsequent turn.

Auras **reserve energy**: a 1-cost Aura permanently reduces your per-turn energy by 1 for the rest of that combat. Multiple Auras can be active simultaneously if energy budget allows. Auras do not interact with supports.

*Playtesting note: the reservation mechanic may change — test whether it creates interesting constraint or just feels punishing.*
*Future consideration: supports played alongside an Aura at cast time could modify the Aura's effect permanently for that combat (like linking support gems to an aura gem in PoE).*

**Enemies:**

Enemies telegraph their next action each turn — attack, defend, apply debuff — so combat is readable and plan-oriented, not reflex-based. This keeps focus on synergy decisions.

**Status effects:**

A small set of stackable statuses that skills, supports, and Auras can apply and interact with. Initial set: **Burn**, **Bleed**, **Weaken**, **Armor**. Statuses are tracked on each combatant as `{ kind: StatusEffectKind; stacks: number }`. Applying a status a second time adds stacks rather than resetting.

Status mechanics (Phase 1: enemies only — player statuses deferred):

- **Burn** — ticks at the start of the enemy's turn, dealing damage equal to its stack count. Stacks persist until combat ends.
- **Bleed** — ticks at the start of the enemy's turn, dealing `floor(stacks / BLEED_TICK_DIVISOR)` damage. When the enemy executes an attack, Bleed additionally deals bonus damage equal to its stack count (the wound reopens under exertion). Stacks persist until combat ends.
- **Weaken** — no tick damage. Reduces the enemy's attack damage by `stacks × WEAKEN_PER_STACK`, clamped so attack damage never goes below zero.
- **Armor** — no tick damage. Absorbs incoming damage 1-per-stack before HP is reduced; stacks deplete as damage consumes them. Enemies apply Armor to themselves via defend intents.

Some supports interact specifically with statuses (e.g. "if target is Burning, also apply Bleed") — this is where PoE's ailment-stacking depth emerges.

**Relics:**

Passive items held in a separate **relic slot** (max 4), not in the deck. Found in elite fights and shops. Relics modify combat rules globally for the entire run — e.g. "+1 energy on turns you play a Curse," "Bleed stacks deal double damage." These are the run-defining multipliers: the Balatro jokers.

---

## Section 3 — Card System

**Skill cards**

The active layer. Each skill has:

- One or more **tags** (*Attack*, *Spell*, *Curse*, *Block*, *Summon*)
- An **energy cost** (1–3)
- A **base effect** — one clear thing: deal damage, apply a status, gain armor, summon a minion

Skills are specific by design. A skill that does one thing makes supports meaningful.

**Support cards**

The modifier layer. Each support has:

- A declared list of **compatible tags** — only fires when played alongside a skill with a matching tag
- An **energy cost** (0–1)
- A **modification type**: scale (more damage), add effect (also apply Burn), change behavior (hits all enemies), reduce cost (next skill costs 1 less)
- Cannot be played alone

**Aura cards**

The persistence layer. Each Aura has:

- An **energy cost** (1–2, reserved for the rest of combat)
- A **passive effect** applied every turn
- No tag compatibility with supports (for now)

**Relic cards**

The run-modifier layer. Never in the deck. Held in a separate relic slot (max 4). Each relic has a passive effect that applies globally throughout the run.

**Card acquisition:**

After each combat, choose 1 of 3 cards from the current location's pool. Shops offer cards for purchase and **card removal** (trimming your deck is a real and powerful strategy). Card removal is limited — shops don't always offer it.

**Card rarity:** Common, Uncommon, Rare. Rarer cards have stronger or more unusual effects, not just bigger numbers.

---

## Section 4 — Meta-Progression

**Meta-currency: Orbs**

Earned during runs — from clearing rooms, defeating elites, defeating bosses, and hitting milestones. Kept on death. Spent in the hub.

**Three unlock layers:**

**1. Card pool unlocks**

The primary Orb spend. New cards (across all rarities and types) are added to the general pool and appear in future run offers and shops. Always something close to unlocking — primary "one more run" driver.

**2. Archetypes**

Starting identities that shape a run from turn one. Each archetype gives a fixed starter deck biased toward a playstyle:

- *The Invoker* — Spell-heavy starter, Spell-compatible supports, Aura that amplifies Spell damage
- *The Condemned* — Curse-heavy starter, Relic that buffs Curse effects
- *(More archetypes unlocked via run milestones — defeating a boss, clearing a specific location, etc.)*

Archetypes are unlocked via milestones, not Orb spend.

**3. Passive upgrade tree**

Small and focused — 15–20 nodes. Examples: +max health, start each run with a free card removal, shops have one extra item. Meaningful but not game-warping. The run is still won or lost by card choices.

**Hub:**

Visually sparse and atmospheric. Three screens: start run, spend Orbs, check unlocks. No clutter.

---

## Section 5 — Tech Stack & Architecture

**Stack:** TypeScript + Phaser.js, bundled with Vite. **Immer** for immutable state updates.

**Separation of concerns:**

Game logic (deck state, combat engine, meta-progression) lives in pure TypeScript with no Phaser dependency. Phaser handles rendering, input, and scene management. Logic is independently testable and reasonably decoupled from the display layer.

**Scene structure:**

| Scene         | Purpose                                 |
| ------------- | --------------------------------------- |
| `BootScene`   | Asset loading                           |
| `HubScene`    | Meta-progression, run start             |
| `MapScene`    | Node map navigation for the current run |
| `CombatScene` | Turn-based combat                       |
| `RewardScene` | Card selection after combat             |

**State shape:**

`GameState` is `{ run: RunState; meta: MetaState }` — always nested, never flat.

`RunState` holds: `deck`, `hand`, `discardPile`, `relics`, `activeAuras`, `playerHealth`, `playerMaxHealth`, `energyReservation`, and `combatState: CombatState | null`. `MetaState` holds: `orbs`, `unlockedCards`, `purchasedUpgrades`, `unlockedClasses`. Only `MetaState` is persisted to localStorage.

`CombatState` is non-null only during an active fight. It holds: `enemy: Enemy` (required — always present when combat is active; HP, maxHP, `intents: EnemyIntent[]` (the full cycle), `intentIndex: number` (current position in the cycle), status effects), `energyRemaining`, `energyMax` (base 3 minus current reservation), and `stagedCards: Card[]` (the cards the player has clicked but not yet committed — cleared on each Play Hand). `enemy` is required rather than optional because a `CombatState` only exists when there is an enemy — the outer `combat: CombatState | null` on `RunState` is the single nullability boundary. When combat ends, `combat` is set back to `null`.

Scenes read from state and never mutate it directly. All mutations go through dedicated action functions in `src/state/actions/`, organized by domain (`combat.ts`, `deck.ts`, `meta.ts`). Actions are pure functions — `(state: GameState, ...args) => GameState` — each calling Immer's `produce` internally and returning the new state.

**Combat actions** (`src/state/actions/combat.ts`):

- `startCombat(state, enemy)` — initializes a fresh `CombatState`; scene calls `drawHand` after
- `drawHand(state)` — draws up to 5 cards; auto-reshuffles discard into deck mid-draw if needed
- `playCard(state, cardId)` — moves card from hand to `stagedCards`, deducts `energyCost` from `energyRemaining`
- `commitHand(state)` — validates and resolves the staged bundle. A valid bundle requires exactly one skill or one aura card. If neither is present, returns state unchanged (no-op). If only an aura is staged, also a no-op until Phase 2 aura resolution is implemented. If a skill is staged, looks up `effectId` in the effect registry and calls the effect function with the current enemy as target; if `effectId` is not registered, throws — this is always a developer error. After resolution, moves all staged cards to discard and clears `stagedCards`. When a skill is staged, `commitHand` first filters staged support cards by tag compatibility — a support is compatible if any item in its `compatibleTags` intersects with the skill's `tags`. Compatible supports are collected into a `SupportModification[]` list. The skill's effect function (typed as `(state: GameState, targets: Target[]) => SkillOutput`) returns a `SkillOutput` object `{ damage: number; statuses: StatusEffect[]; targets: Target[] }` rather than a `GameState`. The engine then applies modifications to the output — `multiplicative` scales `damage`, `additive` appends to `statuses` — and writes the final result to state via `applySkillOutput`. Incompatible supports (no tag match) and the `changeBehavior` and `reduceCost` modification types are silently ignored until their prerequisites are in place (multi-enemy model and inter-turn cost tracking, respectively). Support resolution lives in `src/engine/supports.ts` as two pure functions: `filterCompatibleMods` and `resolveSupports({ skillOutput, mods })` — the parameter is named `skillOutput` (not `output`) to make clear it is the skill effect's result being passed in as input.
- `endTurn(state)` — discards remaining hand, resets `energyRemaining`, calls `drawHand`; scene calls `resolveEnemyTurn` after
- `resolveEnemyTurn(state)` — executes the enemy's turn in three steps: (1) ticks active statuses via `tickStatuses`, applying Burn and Bleed damage to the enemy; (2) executes the current intent — `attack` damages the player via `resolveEnemyAttack`, then also applies `getBleedAttackBonus(enemy)` damage back to the enemy via `resolveIncomingDamage` (the wound reopens under exertion), `defend` applies Armor to the enemy via `applyStatuses`, `debuff` is a no-op until player statuses are implemented; (3) advances `intentIndex` by 1, wrapping with modulo so the cycle repeats. Single-enemy only — multi-enemy combat is deferred.
- `endCombat(state)` — sets `run.combat` to `null`

**Status effects** (`src/engine/statuses.ts`):

Pure functions with no Phaser dependency, following the same pattern as `supports.ts`:

- `applyStatuses(enemy, incoming: StatusEffect[]): Enemy` — merges stacks onto the enemy; same-kind stacks add, different kinds coexist
- `tickStatuses(enemy): { enemy: Enemy; totalDamage: number }` — processes Burn and Bleed tick damage at the start of the enemy's turn; returns updated enemy and total damage dealt
- `resolveIncomingDamage(enemy, damage: number): Enemy` — depletes Armor stacks first, then reduces HP; replaces direct HP mutation in `applySkillOutput`
- `getWeakenMultiplier(enemy): number` — returns `1 - (stacks × WEAKEN_PER_STACK)`, clamped to `[0, 1]`; used in enemy turn resolution when computing attack damage
- `getBleedAttackBonus(enemy): number` — returns Bleed stack count as bonus damage dealt back to the enemy when it attacks; the wound reopens under exertion. Called from `resolveEnemyTurn` when the enemy executes an attack intent.

Constants `WEAKEN_PER_STACK` and `BLEED_TICK_DIVISOR` live in `src/lib/constants.ts`, flagged for playtesting.

**Enemy combat resolution** (`src/engine/combat.ts`):

- `resolveEnemyAttack(enemy, intent: AttackIntent): number` — computes damage dealt to the player: applies `getWeakenMultiplier` to scale down base damage and floors the result. Does not include Bleed bonus — that is applied separately to the enemy. Called internally by `resolveEnemyTurn`; pure and independently testable.

**State store:**

Game state is held in a single mutable container exported from `src/state/store.ts`:

```ts
export const store = { gameState: createInitialState() };
```

Scenes import `store` and reassign `store.gameState` after each action:

```ts
store.gameState = someAction(store.gameState, ...args);
```

Actions remain pure functions with no dependency on the store itself. The store is the only place state is held; there is no per-scene copy.

**Card type system:**

`Card` is a discriminated union: `SkillCard | SupportCard | AuraCard | RelicCard`, each with a `kind: "skill" | "support" | "aura" | "relic"` field. The hand is typed as `Card[]`; engine functions narrow on `kind`. Skill tags are a string union: `type SkillTag = "Attack" | "Spell" | "Curse" | "Block" | "Summon"`.

Card effects are stored as `effectId: string` on each card, resolved at runtime via an effect registry in `src/engine/effects.ts`. The registry maps IDs to functions with the signature `(state: GameState, targets: Target[]) => GameState`. This keeps card data files free of logic and makes adding new cards straightforward.

`Target` is `{ kind: "enemy"; enemyId: string }` — the `enemyId` field identifies which enemy is targeted, preparing for future multi-enemy combat. Effects that target all enemies (via a `changeBehavior` support) will receive the full list of active enemy IDs. The effect function signature will be extended to `(state, targets, modifications: SupportModification[]) => GameState` when support resolution is implemented.

Support cards carry a `compatibleTags: SkillTag[]` field and a `modificationKind` discriminated union covering the four modification types: `scale`, `addEffect`, `changeBehavior`, `reduceCost`.

Cards are defined as plain TypeScript data objects, not classes.

**Persistence:** `localStorage` for meta-progression (`MetaState`). Run state is session-only — runs do not survive browser close (standard for the genre).

---

## Open Questions

- Prestige currency award formula (when/if a prestige layer is added)
- Status effect tuning constants (`WEAKEN_PER_STACK`, `BLEED_TICK_DIVISOR`) and stack caps — flagged for playtesting
- Aura reservation playtesting — may change to pay-once model
- Support-on-Aura interaction (future consideration)
- `changeBehavior` support modification — deferred until multi-enemy model is in place; will modify the `targets` array in `SkillOutput` to include all active enemies
- `reduceCost` support modification — deferred until inter-turn cost tracking is in place; will reduce `energyCost` of the next skill played after the combo resolves
- Does Armor absorb Burn/Bleed tick damage? The Armor description ("absorbs incoming damage 1-per-stack") has no source qualifier, implying it applies to all damage including ticks — but making DoTs armor-piercing would add meaningful depth (DoTs as reliable armor bypass). Currently `tickStatuses` bypasses `resolveIncomingDamage`, so ticks ignore Armor. Resolve this before ticks and `resolveIncomingDamage` are considered settled.
