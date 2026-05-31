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

**Immer proxy identity:** Inside any `produce` callback, never use `===` or `.includes()` to find cards by reference — array elements accessed through a draft are Immer proxies. Always compare by `.id`.

**Map node lookup:** Never use `map.find(n => n.id === id)!`. Use `getNode(map, id)` from `src/engine/map.ts`, which throws on missing IDs.

**Rendering constants:** `src/constants.ts` is for game logic constants shared across modules. Scene-local constants (colors, dimensions, Y positions) belong in the scene file itself.

**Scenes as orchestrators:** Scenes may sequence actions (e.g. calling `startCombat` then `drawHand`). Extract to a named action only when the branching becomes hard to read. `store.gameState` is the source of truth across scene restarts — read it at the top of `create()` and write back to it after actions.

## Learning Approach

This is a learning project. When the user is implementing something:

- Explain the approach and reasoning — do NOT include code snippets or generated code unless the user explicitly asks
- Let the user write the code
- Only provide code if they're stuck or explicitly ask
- **Phaser exception:** For Phaser scene code, code snippets are acceptable since API usage is hard to describe in prose — describe intent first, then show the minimal pattern.

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

**Pacing:** RED and GREEN are two separate steps. Guide the user to write the test first, confirm it fails, then stop. Only move to implementation after the RED step is complete. Do not combine both steps in one response. Always guide one test at a time — never ask the user to write multiple tests at once. When listing test cases upfront as an overview at the start of a TDD session, present all cases — then guide through them one at a time in the red-green cycle.

**Test names:** When asking the user to write a test, always provide the exact test name. Never leave them to name it themselves.

**Minimal GREEN:** When guiding the GREEN step, describe only the code needed to make the current failing test pass — not the full feature. Do not reference the design doc or describe behaviors that aren't yet tested. If the user implements more than the current test requires, flag it — do not praise or approve extra implementation even if the code is correct. Future tests that cover that behavior will pass immediately without ever being RED, which breaks TDD.

**Immediate GREEN:** If a test passes immediately without a prior RED step, explain why (TypeScript constraint, or coincidentally covered by prior code) and note whether it still belongs as documentation.

**Code in TDD guidance:** Describe what the test should assert and why in prose — do not write code blocks. The user writes the code themselves. Only provide code if they're stuck or explicitly ask.

**Evaluate tests before GREEN:** Before telling the user to proceed to GREEN, read the test they wrote and evaluate: is the assertion tight, does it cover both sides of the contract, is the name correct, is it structured per the testing rules? State your findings explicitly before proceeding.

**Fixtures and state:**

- Never mutate shared state. Construct a fresh state object per test using spreads: `{ ...gameState, run: { ...gameState.run, deck: [...] } }`.
- Extract fixture factory functions (e.g. `createMockSkillCard(overrides?)`) when the same shape is repeated across multiple tests. Wait until duplication is felt — don't create helpers preemptively.
- Shared test helpers live in `src/lib/test-helpers.ts` — check there before creating new helper functions.
- Fixtures requiring active combat state must spread from `initialCombatState`. Never assume `store.gameState.run.combat` is non-null in tests.

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

## Engineering Conventions

- When handling all branches of a discriminated union `switch` or `if/else`, add `assertNever(value)` in the final `else` branch. See `src/lib/assert-never.ts`. This catches future union extensions at compile time and adds a runtime safety net.

## Misc

- Read `.gitignore` before making commits — don't commit gitignored files
