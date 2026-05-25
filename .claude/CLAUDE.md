# Gravepact

A dark fantasy deck-building roguelite played in the browser. The player runs through themed cursed locations (caves, dungeons, prisons, churches), building a deck of skills, supports, and auras that compound into powerful synergies. Meta-progression unlocks new cards, archetypes, and passive bonuses.

## Key Documents

- **Design doc:** `docs/gravepact-design.md` — full specification for all game systems: core loop, combat, card types, meta-progression, and architecture. Read the relevant section before making any implementation decision.
- **Terminology:** `docs/gravepact-terminology.md` — living glossary of all game terms. Use the language defined here consistently in code and conversation. Update it as terms are added, changed, or clarified. When the user uses different language than the current terminology, treat it as a naming decision and update the document to match — do not correct the user.
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
  data/
    cards/      # Skill, support, aura, and relic card data objects (one file per card type)
    enemies.ts  # Enemy data objects, organized by location
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

**Test runner:** Vitest — `pnpm test` (watch mode), `pnpm test:run` (single pass).

**Scope:** TDD applies to `src/engine/` and `src/state/` — pure TypeScript with no Phaser dependency. These modules are fully unit-testable. `src/scenes/` is Phaser code; test it manually and visually, not with unit tests.

**Process — red-green-refactor:**

1. **RED** — write a failing test describing the behavior you want. Run it and confirm it fails for the right reason (feature missing, not a typo or import error).
2. **GREEN** — write the minimal code to make it pass. Run the test again to confirm.
3. **REFACTOR** — clean up with tests still green. Don't add new behavior here.

For any non-trivial logic in `engine/` or `state/`, start with a failing test. Skipping TDD is allowed for exploratory or throwaway code, but must be stated explicitly. When guiding implementation, always ask "what test would prove this works?" before discussing how to implement it.

**Pacing:** RED and GREEN are two separate steps. Guide the user to write the test first, confirm it fails, then stop. Only move to implementation after the RED step is complete. Do not combine both steps in one response.

**Code in TDD guidance:** Describe what the test should assert and why in prose — do not write code blocks. The user writes the code themselves. Only provide code if they're stuck or explicitly ask.

**Fixtures and state:**

- Never mutate shared state. Construct a fresh state object per test using spreads: `{ ...gameState, run: { ...gameState.run, deck: [...] } }`.
- Extract fixture factory functions (e.g. `createMockSkillCard(overrides?)`) when the same shape is repeated across multiple tests. Wait until duplication is felt — don't create helpers preemptively.
- Keep factories in the test file unless they're needed across multiple test files.

**Assertions:**

- Assert on both sides of a contract. For `drawCards`, check that hand grew *and* deck shrank.
- Prefer specific assertions over broad ones — `toBe(1)` over `toEqual(entireStateObject)`.
- Avoid asserting on implementation details. Test what the function returns, not how it does it internally.

**Tests for non-deterministic functions:**

Tests that cover randomized or generative logic (e.g. `generateMap`) must run the function multiple times internally to rule out flukes. Wrap the test body in a `for` loop (50 iterations is a good default). Do not rely on running the test suite multiple times externally — the loop must be inside the test itself.

**Anti-patterns to avoid:**

- Mutating the `gameState` singleton directly in tests — state bleeds between tests.
- Nesting `produce` inside a test when the function under test already uses `produce` — just call the function and assert on the returned value.
- Discarding the return value of pure functions and asserting on the input instead.

## Naming Inspiration

When workshopping location names, enemy names, card names, or other thematic content, use PoE as the primary naming reference:

- **`docs/inspiration/skills.md`** — PoE skill gem names, organized by attribute (Strength/Attack, Dexterity/Ranged, Intelligence/Spell+Curse). Use for Gravepact skill card names.
- **`docs/inspiration/supports.md`** — PoE support gem names, organized by attribute. Use for Gravepact support card names.
- **[poewiki.net](https://www.poewiki.net)** — for area names, enemy names, monster lore, and anything not in the above files.

## Misc

- Read `.gitignore` before making commits — don't commit gitignored files
