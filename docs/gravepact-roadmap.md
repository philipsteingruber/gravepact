# Gravepact — Roadmap

## Phase 1 — Foundation

- [x] Project setup: Vite + TypeScript + Phaser.js + Immer
- [ ] Game state model: `RunState` and `MetaState` types, Immer wiring
- [ ] Scene skeleton: Boot, Hub, Map, Combat, Reward
- [ ] Card data model: Skill, Support, Aura, Relic types
- [ ] Basic combat engine: energy system, hand/deck/discard cycle, turn resolution
- [ ] First card set: handful of Skills and Supports to test the loop
- [ ] Enemy model and first location (handful of enemies, telegraphed intents)
- [ ] Status effect system: Burn, Bleed, Weaken, Armor
- [ ] Node map generation: branching paths, node types, boss node
- [ ] Post-combat reward: choose 1 of 3 cards
- [ ] Functional minimal UI: map, combat display, hand, energy, health

## Phase 2 — Full Card System

- [ ] Support tag compatibility enforcement
- [ ] Aura cards: persistent zone, energy reservation
- [ ] Relic system: relic slot, run-wide passive effects
- [ ] Card removal at shops
- [ ] Card rarity (Common / Uncommon / Rare) and rarity-weighted pools
- [ ] Rest site: heal or upgrade a card
- [ ] Elite combat: harder fights, better rewards
- [ ] First full location: complete enemy pool, themed node flavor

## Phase 3 — Meta-Progression

- [ ] Orbs: earn during runs, persist on death
- [ ] Card pool unlock system: spend Orbs to expand the pool
- [ ] Passive upgrade tree: ~15–20 nodes
- [ ] Archetype system: starter decks with identity
- [ ] Second archetype unlock via milestone
- [ ] Hub screen: start run, spend Orbs, unlock review
- [ ] LocalStorage persistence for MetaState

## Phase 4 — UI Design & Polish

- [ ] UI design session: visual language, combat feedback, card presentation
- [ ] UI implementation based on design
- [ ] Location theming: distinct palettes and enemy flavor per location
- [ ] Second location
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
