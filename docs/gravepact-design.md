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

Passive items held in a separate **relic slot**, not in the deck. Found in elite fights and shops. Relics modify combat rules globally for the entire run — e.g. "+1 energy on turns you play a Curse," "Bleed stacks deal double damage." These are the run-defining multipliers: the Balatro jokers.

**Gold:**

Players earn gold after each combat. Award amounts are playtesting constants in `src/lib/constants.ts`: `GOLD_REWARD_STANDARD` (random draw from 20–30), `GOLD_REWARD_ELITE` (35–45), `GOLD_REWARD_BOSS` (50–60). Gold persists for the full run and is spent at shops. `RunState` holds a `gold: number` field, initialized to 0.

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

`RunState` holds: `deck`, `relics`, `playerHealth`, `playerMaxHealth`, `locationId: string` (the ID of the current location, used to look up the card pool for rewards), and `combat: CombatState | null`. `hand`, `discardPile`, `activeAuras`, and `reservedEnergy` all live inside `CombatState` — they are transient combat state and are meaningless between combats. At combat end, all cards (hand + discard + staged + activeAuras) are merged back into `deck` before `combat` is set to `null`.

`MetaState` holds: `orbs`, `unlockedCards`, `purchasedUpgrades`, `unlockedClasses`. Only `MetaState` is persisted to localStorage.

`CombatState` is non-null only during an active fight. It holds: `enemy: Enemy` (required — always present when combat is active; HP, maxHP, `intents: EnemyIntent[]` (the full cycle), `intentIndex: number` (current position in the cycle), status effects), `energyRemaining`, `energyMax` (base 3, unchanged by aura reservation — per-turn energy is computed as `energyMax - reservedEnergy`), `reservedEnergy` (total energy reserved by active auras — 0 at combat start, incremented when an aura is played), `activeAuras: AuraCard[]` (auras currently in the persistent zone — initialized to `[]`, cleared and returned to deck at combat end), `stagedCards: Card[]` (the cards the player has clicked but not yet committed — cleared on each Play Hand), `hand: Card[]`, and `discardPile: Card[]`. Both `hand` and `discardPile` are initialized to `[]` when combat starts and merged back into `run.deck` when combat ends. `enemy` is required rather than optional because a `CombatState` only exists when there is an enemy — the outer `combat: CombatState | null` on `RunState` is the single nullability boundary. When combat ends, `combat` is set back to `null`.

Scenes read from state and never mutate it directly. All mutations go through dedicated action functions in `src/state/actions/`, organized by domain (`combat.ts`, `deck.ts`, `meta.ts`). Actions are pure functions — `(state: GameState, ...args) => GameState` — each calling Immer's `produce` internally and returning the new state.

**Combat actions** (`src/state/actions/combat.ts`):

- `startCombat(state, enemy)` — initializes a fresh `CombatState`; scene calls `drawHand` after
- `drawHand(state)` — draws up to 5 cards; auto-reshuffles discard into deck mid-draw if needed
- `stageCard(state, card)` — moves card from hand to `stagedCards`, deducts `energyCost` from `energyRemaining` (or `energyReservation` for Aura cards)
- `unstageCard(state, card)` — moves card from `stagedCards` back to `hand`, refunds `energyCost` (or `energyReservation` for Aura cards) to `energyRemaining`
- `playHand(state)` — validates and resolves the staged bundle. A valid bundle requires exactly one skill or one aura card. If neither is present, returns state unchanged (no-op). If only an aura is staged: the aura moves to `combat.activeAuras`; `combat.reservedEnergy` is incremented by `aura.energyReservation`; `combat.energyRemaining` is immediately reduced by the same amount (the reservation bites in the turn you play it); remaining staged cards (any supports) move to discard; `stagedCards` and `originalHandOrder` are cleared. `combat.energyMax` is not modified — `endTurn` already uses `energyMax - reservedEnergy`, so the reservation is automatically reflected on every subsequent turn reset. If a skill is staged, looks up `effectId` in the effect registry and calls the effect function with the current enemy as target; if `effectId` is not registered, throws — this is always a developer error. After resolution, moves all staged cards to discard and clears `stagedCards`. When a skill is staged, `commitHand` first filters staged support cards by tag compatibility — a support is compatible if any item in its `compatibleTags` intersects with the skill's `tags`. Compatible supports are collected into a `SupportModification[]` list. The skill's effect function (typed as `(state: GameState, targets: Target[]) => SkillOutput`) returns a `SkillOutput` object `{ damage: number; statuses: StatusEffect[]; targets: Target[] }` rather than a `GameState`. The engine then applies modifications to the output — `multiplicative` scales `damage`, `additive` appends to `statuses` — and writes the final result to state via `applySkillOutput`. Incompatible supports (no tag match) and the `changeBehavior` and `reduceCost` modification types are silently ignored until their prerequisites are in place (multi-enemy model and inter-turn cost tracking, respectively). Support resolution lives in `src/engine/supports.ts` as two pure functions: `filterCompatibleMods` and `resolveSupports({ skillOutput, mods })` — the parameter is named `skillOutput` (not `output`) to make clear it is the skill effect's result being passed in as input.
- `endTurn(state)` — discards remaining hand, resets `energyRemaining`, calls `drawHand`; scene calls `resolveEnemyTurn` after
- `resolveEnemyTurn(state)` — executes the enemy's turn in four steps: (1) ticks active statuses via `tickStatuses` and active auras via `tickAuras` — `tickStatuses` applies Burn and Bleed damage; `tickAuras` calls each active aura's `effectId` via the registry and applies the resulting `SkillOutput` via `applySkillOutput`; both fire before the enemy acts; (2) executes the current intent — `attack` damages the player via `resolveEnemyAttack`, then also applies `getBleedAttackBonus(enemy)` damage back to the enemy via `resolveIncomingDamage` (the wound reopens under exertion), `defend` applies Armor to the enemy via `applyStatuses`, `debuff` is a no-op until player statuses are implemented; (3) advances `intentIndex` by 1, wrapping with modulo so the cycle repeats. Single-enemy only — multi-enemy combat is deferred.
- `endCombat(state)` — merges `combat.hand + combat.discardPile + combat.stagedCards` back into `run.deck`. Also pushes all cards in `combat.activeAuras` back into `run.deck`, clears `combat.activeAuras`, and resets `combat.reservedEnergy` to 0. Then sets `run.combat` to `null`. Combat-end is auto-detected in `CombatScene`: after `playHand` and after `resolveEnemyTurn`, if `combat.enemy.hp ≤ 0` the scene calls `endCombat` and transitions to `"REWARD"`.

**Reward flow** (`src/scenes/reward.ts`, `src/data/locations.ts`):

Location data lives in `src/data/locations.ts` as a `locationData` record keyed by `locationId`. Each entry holds `cardPool: Card[]` — the full set of skills and supports eligible to appear as rewards and in shops for that location.

After combat ends, `RewardScene` reads `locationData[run.locationId].cardPool` and calls `pickRandom(pool, 3)` from `src/lib/utils.ts` to sample 3 cards without replacement (fewer if the pool is smaller than 3). The scene renders the 3 options as clickable cards. Clicking one calls `addCardToDeck(state, card)` — an action in `src/state/actions/deck.ts` that appends the card to `run.deck` — then transitions to `"MAP"`. A **Skip** button is always present; it transitions to `"MAP"` without adding a card.

Both skills and supports are eligible reward cards. `sampleRewardCards(pool, count)` in `src/engine/rewards.ts` performs rarity-weighted sampling (weights: Common 60 / Uncommon 30 / Rare 10, constants in `src/lib/constants.ts`) without replacement, replacing the earlier `pickRandom` call. The shop uses the same function.

**Shop flow** (`src/scenes/shop.ts`, `src/engine/shop.ts`):

When the player selects a shop node, `MapScene` calls `generateShopInventory(locationCardPool, allRelics)` — defined in `src/engine/shop.ts` — then transitions via `this.scene.start('SHOP', { inventory })`. The inventory contains 4–5 rarity-weighted cards and 1–2 rarity-weighted relics sampled from the global relic pool (`src/data/relics.ts`). `ShopScene.init()` stores the inventory as a scene property; a separate `purchasedIds: Set<string>` scene property tracks bought items across scene restarts.

Two purchase actions in `src/state/actions/deck.ts`:

- `buyCard(state, card): GameState` — appends card to `run.deck`, deducts `getCardPrice(card.rarity)` from `run.gold`
- `buyRelic(state, relic): GameState` — appends relic to `run.relics`, deducts `getRelicPrice(relic.rarity)` from `run.gold`

`getCardPrice` and `getRelicPrice` in `src/engine/shop.ts` map `RewardRarity` to flat constants (flagged for playtesting). Card prices: Common 40g / Uncommon 60g / Rare 90g. Relic prices are one tier higher: Common 60g / Uncommon 90g / Rare 120g. After a purchase the item is added to `purchasedIds` and rendered non-interactive; a **Leave** button returns to `"MAP"`.

**Status effects** (`src/engine/statuses.ts`):

Pure functions with no Phaser dependency, following the same pattern as `supports.ts`:

- `applyStatuses(enemy, incoming: StatusEffect[]): Enemy` — merges stacks onto the enemy; same-kind stacks add, different kinds coexist
- `tickStatuses(enemy): { enemy: Enemy; totalDamage: number }` — processes Burn and Bleed tick damage at the start of the enemy's turn; returns updated enemy and total damage dealt
- `resolveIncomingDamage(enemy, damage: number): Enemy` — depletes Armor stacks first, then reduces HP; replaces direct HP mutation in `applySkillOutput`
- `getWeakenMultiplier(enemy): number` — returns `1 - (stacks × WEAKEN_PER_STACK)`, clamped to `[0, 1]`; used in enemy turn resolution when computing attack damage
- `getBleedAttackBonus(enemy): number` — returns Bleed stack count as bonus damage dealt back to the enemy when it attacks; the wound reopens under exertion. Called from `resolveEnemyTurn` when the enemy executes an attack intent.

Constants `WEAKEN_PER_STACK` and `BLEED_TICK_DIVISOR` live in `src/lib/constants.ts`, flagged for playtesting.

**Aura tick** (`src/engine/aura.ts`):

- `tickAuras(state: GameState, targets: Target[]): SkillOutput[]` — maps over `combat.activeAuras`, calls `effects[aura.effectId]` for each, returns the array of outputs. Throws on an unregistered `effectId` (always a developer error). Called from `resolveEnemyTurn`; the caller applies each output via `applySkillOutput`.

**Relic trigger system** (`src/engine/relics.ts`, `src/data/relic-effects.ts`, `src/data/relics.ts`):

Relics fire passive effects at specific combat events. Each `Relic` object carries a `triggerKind: RelicTriggerKind` field (`"onCombatStart" | "onTurnStart" | "onSkillPlay"`). A separate relic handler registry in `src/data/relic-effects.ts` maps `effectId → (state: GameState, context: RelicContext) => GameState`, typed with `satisfies` and exporting `RelicEffectId`. `RelicContext` is a discriminated union keyed by `triggerKind`; the `"onSkillPlay"` variant carries a `card: SkillCard` field so handlers can inspect the played skill's tags.

`fireRelicTrigger(state, triggerKind, context): GameState` in `src/engine/relics.ts` loops over `run.relics`, filters by `triggerKind`, and threads state through each matching handler.

Integration points in combat actions:

- `startCombat` calls `fireRelicTrigger(state, "onCombatStart", ...)` after initializing `CombatState`
- A new `startPlayerTurn(state)` action wraps `drawHand` followed by `fireRelicTrigger(state, "onTurnStart", ...)`. It replaces the bare `drawHand` call in `endTurn` and the scene's post-`startCombat` draw, ensuring `onTurnStart` fires consistently on every turn including the first
- `playHand`, after a skill resolves, calls `fireRelicTrigger(state, "onSkillPlay", { triggerKind: "onSkillPlay", card: skillCard })`

First relic set (`src/data/relics.ts`):

| Name             | Trigger       | effectId          | Effect                                                      |
| ---------------- | ------------- | ----------------- | ----------------------------------------------------------- |
| Doedre's Damning | onCombatStart | `doedres_damning` | Enemy begins combat with 3 Bleed                            |
| Spreading Rot    | onTurnStart   | `spreading_rot`   | Apply 1 Bleed to the enemy at the start of each player turn |
| Carnage Heart    | onSkillPlay   | `carnage_heart`   | If skill has Attack tag, deal 2 bonus damage                |

All three are Uncommon rarity. Effect values are flagged for playtesting.

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

`Card` is a discriminated union: `SkillCard | SupportCard | AuraCard`, each with a `kind: "skill" | "support" | "aura"` field. Relics are a separate `Relic` type — never part of `Card` — stored in `run.relics: Relic[]` and never drawn, staged, or discarded. The hand is typed as `Card[]`; engine functions narrow on `kind`. Skill tags are a string union: `type SkillTag = "Attack" | "Spell" | "Curse" | "Block" | "Summon"`.

Card effects are stored as `effectId: string` on each card, resolved at runtime via an effect registry in `src/engine/effects.ts`. The registry maps IDs to functions with the signature `(state: GameState, targets: Target[]) => GameState`. This keeps card data files free of logic and makes adding new cards straightforward.

`Target` is `{ kind: "enemy"; enemyId: string }` — the `enemyId` field identifies which enemy is targeted, preparing for future multi-enemy combat. Effects that target all enemies (via a `changeBehavior` support) will receive the full list of active enemy IDs. The effect function signature will be extended to `(state, targets, modifications: SupportModification[]) => GameState` when support resolution is implemented.

Support cards carry a `compatibleTags: SkillTag[]` field and a `modificationKind` discriminated union covering the four modification types: `scale`, `addEffect`, `changeBehavior`, `reduceCost`.

Cards are defined as plain TypeScript data objects, not classes.

**Map generation** (`src/engine/map.ts`):

The run map is a flat `MapNode[]` generated by a pure `generateMap(enemyPool: Enemy[]): GeneratedMap` function with no Phaser dependency. It takes the current location's enemy pool as a parameter to keep it pure and independently testable.

`MapNode` is a flat type with an optional `assignedEnemyId?: string` field. Elite and boss nodes have this field set at map generation time; combat, shop, and rest nodes do not. Elite nodes sample a random enemy from the pool and assign its `id` to `assignedEnemyId`; the boss node is assigned the highest-HP enemy in the pool (stand-in until boss-specific data exists).

```ts
type MapNode = { id: string; kind: "combat" | "elite" | "shop" | "rest" | "boss"; layer: number; connections: string[]; assignedEnemyId?: string };
```

Layout rules:

- 10–12 layers total (`MIN_LAYERS_PER_MAP`, `MAX_LAYERS_PER_MAP`); 2–3 nodes per layer; the final layer is always a single boss node
- Node type distribution per run: majority standard combat (~50%), 2–3 elites (`MIN_ELITE_COUNT`, `MAX_ELITE_COUNT`) locked to layer 6+ (`MIN_ELITE_LAYER`), 2–3 shops (`MIN_SHOP_COUNT`, `MAX_SHOP_COUNT`) and 2–3 rest sites (`MIN_REST_COUNT`, `MAX_REST_COUNT`) seeded in layers 3–8 (`MIN_SPECIAL_NODE_LAYER`, `MAX_SPECIAL_NODE_LAYER`), one boss
- Each non-boss node connects forward to 1–2 nodes in the next layer; every node is reachable and has at least one forward path
- All distribution values are flagged for playtesting tuning in `src/lib/constants.ts`

`RunState` additions for map tracking:

- `map: MapNode[]` — the full generated map for the current run
- `currentNodeId: string | null` — the node the player is currently at; `null` before the first node is selected
- `visitedNodes: MapNode[]` — ordered list of nodes the player has passed through; used by the map UI to highlight the path taken

**Map UI** (`src/scenes/map.ts`):

The map renders horizontally left-to-right. Each layer occupies a vertical band (~150px wide); nodes within a layer are distributed evenly along the screen height with top/bottom padding. Connections between nodes are drawn as straight lines using a Phaser `Graphics` object, rendered beneath nodes. The total world width is `layerCount × 150px`; the Phaser camera is bounded to this width and scrolls horizontally with arrow keys. On scene entry, the camera is centered on the last visited node (layer 0 at run start). Mouse panning is a future enhancement.

Nodes are rendered as circles with a single-letter label: C (combat), E (elite), S (shop), R (rest), B (boss). Node fill color by type: combat → dark grey, elite → dark red, shop → dark gold, rest → dark green, boss → dark purple. Each node is in one of four visual states:

- **Available** — full color, bright border, clickable; at run start all layer-0 nodes qualify; otherwise the forward connections of `currentNodeId`
- **Visited** — dimmed fill, "been here" marker (filled center); nodes on the player's path through the map
- **Skipped** — very dark fill, no interaction; nodes in past layers not on the player's path (the branch not taken)
- **Locked** — dark fill, no interaction; future nodes not yet reachable from the current position

`groupNodesByLayer` from `src/engine/map.ts` is reused to compute node positions.

When the player clicks an available node, `selectNode(state, nodeId)` is called (sets `currentNodeId`, appends to `visitedNodes`), then the scene transitions based on node kind — combat/elite/boss call `startCombat(state, enemy)` and transition to `"COMBAT"`; shop/rest display a placeholder text overlay with a button to return to the map. The scene rebuilds fully on re-entry (same `create()` pattern as CombatScene).

The MapScene samples enemies for regular combat nodes randomly from the location pool at encounter time. Elite and boss enemies use the `assignedEnemyId` stored on the node. The CombatScene retains its `if (!store.gameState.run.combat)` guard as a playtesting affordance for direct scene entry.

**Persistence:** `localStorage` for meta-progression (`MetaState`). Run state is session-only — runs do not survive browser close (standard for the genre).

**Combat UI** (`src/scenes/combat.ts`):

Layout (top to bottom): enemy panel (name, HP bar, current intent, active statuses); player status bar (HP, energy pips); staging zone (staged cards, click to return to hand); hand (cards spread horizontally, click to stage); action buttons (Play Hand, End Turn).

Cards are styled rectangles: background color by type (blue for skill, purple for support, gold border for aura), showing name, tag, energy cost, and effect text. Staged cards use a distinct highlight (lighter border or tint).

Scene updates via full restart: after each action, `store.gameState` is reassigned and `this.scene.restart()` is called. `create()` reads current store state and rebuilds all Phaser objects from scratch. This is intentionally simple — upgrade to tracked object mutation when animations are needed.

Staging is a toggle: clicking a hand card calls `playCard` (moves card to `stagedCards`, deducts energy); clicking a staged card calls `unstageCard` (moves card back to hand, refunds energy). `unstageCard` is a new action in `src/state/actions/combat.ts`. When a card is unstaged it is restored to its original position in the hand. `CombatState` tracks `originalHandOrder: Card[]`, snapshotted lazily on the first `stageCard` call of a turn and cleared when `stagedCards` is cleared (on `playHand` and `endTurn`). `unstageCard` inserts each card before the first hand card whose original index is greater than the unstaged card's, preserving order regardless of unstage sequence.

Play Hand is disabled (greyed out, non-interactive) when `stagedCards` contains no skill or aura. A hint label near the button ("Stage a skill to play") appears when the combo is invalid — button-disable alone may not be readable enough; revisit during playtesting.

---

## Section 6 — First Location: The Rotting Strand

A coastal flats location — drowned revenants, corrosive tide, things washed ashore that shouldn't be. The first location in a run and the source of Phase 1's card and enemy pool.

**Data files:**

- `src/data/cards/skills.ts` — skill card data objects
- `src/data/cards/supports.ts` — support card data objects
- `src/data/enemies.ts` — enemy data objects

Card effects are registered in `src/engine/effects.ts` by `effectId`.

**Skill cards:**

| Name          | Tag    | Cost | effectId        | Effect                   |
| ------------- | ------ | ---- | --------------- | ------------------------ |
| Exsanguinate  | Attack | 1    | `exsanguinate`  | 8 damage, apply 2 Bleed  |
| Scorching Ray | Spell  | 1    | `scorching_ray` | 6 damage, apply 2 Burn   |
| Enfeeble      | Curse  | 1    | `enfeeble`      | Apply 3 Weaken           |
| Lacerate      | Attack | 2    | `lacerate`      | 14 damage, apply 3 Bleed |

All skill cards are Common rarity. Damage values and status stack counts are flagged for playtesting.

**Support cards:**

| Name       | Compatible tags | Cost | Modification               |
| ---------- | --------------- | ---- | -------------------------- |
| Bloodlust  | Attack          | 1    | Multiplicative 1.5× damage |
| Combustion | Spell           | 0    | Additive +2 Burn stacks    |
| Maim       | Attack, Curse   | 0    | Additive +1 Weaken stack   |

All support cards are Common rarity.

**Aura cards:**

| Name          | Cost (reserved) | effectId             | Effect                                                |
| ------------- | --------------- | -------------------- | ----------------------------------------------------- |
| Sanguine Rite | 1               | `sanguine_rite_tick` | At the start of each turn, apply 1 Bleed to the enemy |

Sanguine Rite is Common rarity.

**Enemies:**

| Name               | HP  | Intent cycle                          |
| ------------------ | --- | ------------------------------------- |
| Drowned Exile      | 20  | attack 6 → attack 6 → attack 6        |
| Barnacled Revenant | 28  | attack 8 → defend 4 Armor → attack 5  |
| Tide Hulk          | 40  | attack 12 → attack 5 → defend 6 Armor |

HP values and intent damage are flagged for playtesting.

---

## Engineering Conventions

### Exhaustiveness checking with `assertNever`

When branching on a discriminated union's `kind` field, add an `assertNever` call in the final `else` branch:

```typescript
import { assertNever } from "@/lib/assert-never";

if (intent.kind === "attack") {
  // ...
} else if (intent.kind === "defend") {
  // ...
} else if (intent.kind === "debuff") {
  // ...
} else {
  assertNever(intent);
}
```

`assertNever` takes a `never`-typed argument. TypeScript narrows the union through each handled case; by the `else`, any remaining type is `never` if all cases are covered. If a new variant is added to the union without a corresponding branch, TypeScript emits a type error at the `assertNever` call, catching the omission at compile time rather than at runtime.

**Where to apply:** Any `if/else if` chain or `switch` that exhausts a discriminated union in `src/engine/` or `src/state/`. Current usages: `resolveEnemyTurn` (intent kinds), `resolveSupports` (mod kinds).

### Effect registry

Skill and aura effects are pure functions registered by string ID in `src/data/effects.ts`. Cards reference their effect via `effectId: EffectId` — a key of the `effects` object — rather than storing the function directly. This keeps card data serialisable and centralises all effect logic in one place.

Every effect must match the signature `(state: GameState, targets: Target[]) => SkillOutput`. The registry enforces this via `satisfies`:

```typescript
export const effects = {
  lacerate: (_state, targets) => ({ damage: 14, statuses: [{ kind: "Bleed", stacks: 3 }], targets }),
} satisfies Record<string, (state: GameState, targets: Target[]) => SkillOutput>;

export type EffectId = keyof typeof effects;
```

The relic handler registry in `src/data/relic-effects.ts` follows the same pattern with a different handler signature:

```typescript
export const relicEffects = {
  doedres_damning: (state, _context) => { /* apply 3 Bleed to enemy */ },
} satisfies Record<string, (state: GameState, context: RelicContext) => GameState>;

export type RelicEffectId = keyof typeof relicEffects;
```

**Adding a new skill card requires two things:** a card data object with a matching `effectId`, and the corresponding entry in `effects`. A missing registration throws at `playHand` time when the effect lookup fails.

### `SkillOutput` — the combat contract

`SkillOutput` is the value every effect returns and the only thing `applySkillOutput` consumes:

```typescript
type SkillOutput = { damage: number; statuses: StatusEffect[]; targets: Target[] };
```

- `damage` — raw damage before armor; `resolveIncomingDamage` applies armor absorption
- `statuses` — applied to each target via `applyStatuses` after damage
- `targets` — which combatants to apply the output to; currently always a single enemy

Support modifications (`resolveSupports`) transform a `SkillOutput` before it reaches `applySkillOutput` — multiplicative mods scale `damage`, additive mods append to `statuses`. Effects and supports never interact directly; `SkillOutput` is the boundary between them.

---

## Open Questions

- Prestige currency award formula (when/if a prestige layer is added)
- Status effect tuning constants (`WEAKEN_PER_STACK`, `BLEED_TICK_DIVISOR`) and stack caps — flagged for playtesting
- Aura reservation playtesting — may change to pay-once model
- Support-on-Aura interaction (future consideration)
- `changeBehavior` support modification — deferred until multi-enemy model is in place; will modify the `targets` array in `SkillOutput` to include all active enemies
- `reduceCost` support modification — deferred until inter-turn cost tracking is in place; will reduce `energyCost` of the next skill played after the combo resolves
- **Settled: ticks pierce Armor.** DoTs are armor-piercing by design — a reliable bypass for armored enemies. `tickStatuses` correctly bypasses `resolveIncomingDamage`. Covered by a test asserting that an enemy with Armor stacks loses HP from tick damage without Armor stacks depleting.
- **Settled: over-reservation prevented by `stageCard`.** The `stageCard` guard (`energyReservation > energyRemaining`) prevents staging an aura that would over-reserve. Since `energyRemaining` decrements as each aura is committed, total reservation is naturally capped at `energyMax`. Covered by a test asserting that `stageCard` rejects an aura whose cost exceeds current `energyRemaining`.
