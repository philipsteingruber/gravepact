# Gravepact

A dark fantasy deck-building roguelite played in the browser. The player runs through themed cursed locations (caves, dungeons, prisons, churches), building a deck of skills, supports, and auras that compound into powerful synergies. Meta-progression unlocks new cards, archetypes, and passive bonuses.

## Key Documents

- **Design doc:** `docs/gravepact-design.md` — full specification for all game systems: core loop, combat, card types, meta-progression, and architecture. Read the relevant section before making any implementation decision.
- **Terminology:** `docs/gravepact-terminology.md` — living glossary of all game terms. Use the language defined here consistently in code and conversation. Update it as terms are added, changed, or clarified.
- **Roadmap:** `docs/gravepact-roadmap.md` — phased implementation plan with checkboxes. Check this to understand what's in scope for the current phase and what's deferred.

## Tech Stack

- **Vite + TypeScript + Phaser.js (v4)** — Phaser handles rendering, input, and scenes
- **Immer** — immutable state updates with mutable-style API
- **LocalStorage** for meta-progression persistence (run state is session-only)

## Architecture

Game logic lives in pure TypeScript with no Phaser dependency. Phaser is the rendering and scene layer. State is managed via Immer — all mutations go through action functions using `produce`, never mutated directly in scenes.

```
src/
  state/        # GameState types (RunState, MetaState), Immer actions
  engine/       # Pure TS — combat resolution, deck management, map generation
  data/         # Static card and enemy data
  scenes/       # Phaser scenes (Boot, Hub, Map, Combat, Reward)
```

## Learning Approach

This is a learning project. When the user is implementing something:

- Explain the approach and reasoning — do NOT include code snippets or generated code unless the user explicitly asks
- Let the user write the code
- Only provide code if they're stuck or explicitly ask

## Design Doc & Roadmap

`gravepact-design.md` is a **living document**. Treat it as the authoritative guide for implementation decisions — always read the relevant section before making decisions. If a task results in something that differs from or adds to what's written, **update the design doc** before moving on.

When completing roadmap items, tick them off in `gravepact-roadmap.md`.

## Design Gaps

Design questions will come up during implementation. Handle them as follows:

- **Minor decisions** (a default constant, a small implementation detail): proceed with a sensible default and note it explicitly so the user can revisit
- **Significant decisions** (anything affecting architecture, game feel, or balance): flag and pause, present options, wait for a decision

## Balancing Constants

Magic numbers (energy costs, card rarity weights, Shard drop rates, status effect magnitudes, etc.) must live in constants files, not inline in logic. Flag constants that will need playtesting tuning with a comment.

## Test-Driven Development

**Test runner:** Vitest (not yet configured — set it up before writing the first test).

**Scope:** TDD applies to `src/engine/` and `src/state/` — pure TypeScript with no Phaser dependency. These modules are fully unit-testable. `src/scenes/` is Phaser code; test it manually and visually, not with unit tests.

**Process — red-green-refactor:**

1. **RED** — write a failing test that describes the behavior you want. Run it and confirm it fails for the right reason (feature missing, not a typo or import error).
2. **GREEN** — write the minimal code to make it pass. Run the test again to confirm.
3. **REFACTOR** — clean up with tests still green. Don't add new behavior here.

**Enforcement (guided but flexible):**

- For any non-trivial logic in `engine/` or `state/`, start with a failing test. This is the default — do not skip it silently.
- Exploratory or throwaway code is exempt. If skipping TDD for a piece of code, say so explicitly and explain why.
- When guiding implementation, always ask: "What test would prove this works?" before discussing how to implement it.
- Use the `superpowers:test-driven-development` skill for the full process guide.

**Vitest setup reminder:** Before writing any tests, install Vitest and add a `test` script to `package.json`. Config lives in `vite.config.ts` under the `test` key.

## Misc

- pnpm only
- Use Prettier for formatting
- Read `.gitignore` before making commits — don't commit gitignored files
