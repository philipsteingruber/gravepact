# Gravepact — Roadmap

## Phase 1 — Foundation

- [x] Project setup: Vite + TypeScript + Phaser.js + Immer
- [x] ESLint setup
- [x] Game state types: `GameState`, `RunState`, `MetaState`, `CombatState`, full card discriminated union
- [x] Effect registry scaffold: `EffectRegistry` type, empty `effects` export in `src/engine/effects.ts`
- [x] Immer action pattern: `drawCards` action proving the `produce` wiring
- [x] Scene skeleton: Boot, Hub, Map, Combat, Reward stubs with scene transitions
- [x] Combat actions: `startCombat`, `drawHand`, `playCard` (energy deduction), `endTurn` (discard hand), `endCombat`
- [x] Skill resolution: look up `effectId` in registry, call effect function with targets
- [x] Support resolution: tag compatibility filter, apply `multiplicative` and `additive` modifications to skill output (`changeBehavior` and `reduceCost` deferred)
- [x] Status effect system: apply/stack Burn, Bleed, Weaken, Armor; per-turn tick logic
- [x] Enemy model: enemy data structure, intent cycling, enemy action resolution
- [x] First card set: 3–5 skill effects in registry + card data objects, 2–3 supports
- [x] First enemy set: 3 enemies with hp, intent cycles, for the first location
- [x] Node map generation: branching path structure, node types (combat, elite, shop, rest, boss), boss placement
- [x] `endCombat` card cleanup: merge `combat.hand + combat.discardPile + combat.stagedCards` back into `run.deck` before nulling combat (TDD — write test first)
- [x] Post-combat reward: sample 3 cards (uniform, no rarity weighting yet), add chosen card to deck
- [x] Minimal combat UI: hand display, staging zone, energy pips, player/enemy health bars (text only), enemy intent, Play Hand button, End Turn button
- [x] Minimal map UI: node rendering, available path highlighting, node selection

## Phase 2 — Full Card System

- [x] Aura play: move aura to persistent zone, apply `energyReservation` to `energyMax`
- [x] Aura per-turn effect: tick aura `effectId` at start of each turn
- [x] Relic slot: hold up to 4 relics, trigger relic effects at appropriate combat events
- [x] Shop node: buy cards, buy relics
- [x] Card/relic descriptions: surface card and relic text (name, type, cost, description) in the UI so the player doesn't need to memorize effects
- [ ] Basic starter cards: define generic Attack/Block starter cards; populate `initialRunState` with them (replaced by archetype starter decks in Phase 3)
- [ ] Card removal: remove a card from deck permanently (shop mechanic)
- [x] Resolve Armor vs. tick damage: decide whether Burn/Bleed ticks pierce Armor or are absorbed; update `tickStatuses` and `resolveIncomingDamage` accordingly
- [ ] Multi-enemy combat: support multiple active enemies per fight, update targeting model and combat UI
- [ ] Player status effects: apply Burn, Bleed, Weaken to the player; implement `debuff` enemy intent
- [ ] Support `changeBehavior`: multi-target skill modification (requires multi-enemy model)
- [ ] Support `reduceCost`: reduce next skill's energy cost (requires inter-turn cost tracking)
- [ ] Card rarity weights: rarity-weighted pool sampling for rewards and shops
- [ ] Rest site node: choose to heal or upgrade a card
- [ ] Card upgrade: each card has an upgraded variant with improved effect
- [ ] Elite combat: harder enemy with better post-fight reward
- [ ] First full location: complete enemy pool (6–8 enemies), boss, themed node names
- [ ] Runtime-generated card descriptions: derive description text from effect parameters automatically so balance changes don't require manual string updates

## Phase 3 — Meta-Progression

- [ ] Orb earn events: award Orbs for combat clears, elite kills, boss kill
- [ ] LocalStorage persistence: save/load `MetaState` on run end and hub entry
- [ ] Card pool unlock: spend Orbs to add cards to the general pool
- [ ] Passive upgrade tree: 15–20 nodes with small run-wide bonuses
- [ ] Archetype system: starter deck definitions, archetype selection at run start — replace hardcoded deck in `initialRunState`
- [ ] Second archetype: unlock via milestone (e.g. first boss kill)
- [ ] Hub scene: start run, spend Orbs, view unlocks — three distinct screens

## Phase 4 — UI Design & Polish

- [ ] Card hover feedback: highlight cards on hover in CombatScene (hand + staging zone) and RewardScene
- [ ] UI design session: visual language, card presentation, combat feedback
- [ ] UI implementation based on design
- [ ] Health bars: replace HP text with graphical bars for player and enemy
- [ ] Location theming: distinct palette and node flavor per location
- [ ] Second location: new enemy pool, boss, themed map
- [ ] Animated card play and status effect feedback
- [ ] Sound design pass

## Future Enhancements

- [ ] Additional locations (prison, church, etc.)
- [ ] Additional archetypes
- [ ] Support-on-Aura interaction at cast time
- [ ] More status effects and interactions
- [ ] Aura reservation playtesting — evaluate pay-once vs. reserve model
- [ ] Boss variety: unique mechanics per location boss
- [ ] Run modifiers / curses (harder run options for better rewards)
- [ ] Cloud save / account-based persistence
- [ ] Extract `enterNode` action from `MapScene` — move enemy-picking and combat-init logic out of the scene
- [ ] Mouse panning on map
