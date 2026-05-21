# Gravepact — Terminology

A living reference for the language used in Gravepact's design and code. Update this file as terms are added, changed, or clarified — both in response to explicit changes and proactively when new concepts emerge during implementation.

---

## Card Types

**Skill**
An active card with one or more tags, an energy cost (1–3), and a single base effect (damage, status application, armor gain, minion summon). The primary action layer in combat.

**Support**
A modifier card (cost 0–1) that fires when played in the same turn as a compatible Skill. Cannot be played alone. Each Support declares which Skill tags it is compatible with — incompatible pairings are silently ignored. Multiple Supports played alongside a Skill in the same turn all apply, enabling compounding synergies.

**Aura**
A persistence card played once per combat. On play it leaves the hand and moves to the Persistent Zone. Its effect applies passively every subsequent turn. Auras *reserve* their energy cost — permanently reducing per-turn energy for the rest of that combat. Multiple Auras can be active simultaneously if budget allows. Auras do not interact with Supports (may change in a future update).

**Relic**
A passive item that lives in the Relic Slot, never in the deck. Found in Elite fights and Shops. Its effect modifies combat rules globally for the entire run. Up to 4 Relics can be held at once.

---

## Skill Tags

Tags determine which Supports are compatible with which Skills.

| Tag | Meaning |
| --- | --- |
| **Attack** | Physical or melee offensive skill |
| **Spell** | Elemental or arcane offensive skill |
| **Curse** | Debuff or hex applied to an enemy |
| **Block** | Defensive skill — generates armor or mitigates damage |
| **Summon** | Creates a minion or construct |

A Skill may have more than one tag (e.g. *Attack/Spell*). Supports match any of a Skill's tags.

---

## Combat Terms

**Energy**
The per-turn resource spent to play cards. Base value: 3 per turn.

**Energy Reservation**
The reduction to per-turn energy caused by an active Aura. A 1-cost Aura reserves 1 energy — the player effectively has 2 energy per turn for the rest of that combat. Multiple Auras stack their reservations.

**Hand**
The set of cards available to play each turn. Maximum hand size: 5.

**Deck / Discard Pile**
Standard draw-from-top, discard-on-play cycle. When the deck is empty, the discard pile is reshuffled.

**Persistent Zone**
A visible area separate from the hand and discard pile where active Auras sit for the duration of combat.

**Status Effect**
A stackable combat condition applied to a combatant. Current set: **Burn**, **Bleed**, **Weaken**, **Armor**. Some Supports interact specifically with statuses (e.g. applying a second status if a first is already present).

**Telegraph**
An enemy's declared next action, made visible to the player before their turn. Enemies always telegraph — combat is plan-oriented, not reflex-based.

**Tag Compatibility**
The rule that a Support only modifies a Skill if the Skill has at least one tag matching the Support's declared compatible tags.

---

## Run Terms

**Run**
A single playthrough. Begins at the Hub, takes place in one Location, ends on death or boss kill.

**Location**
The themed environment of a run — a flooded cave, a collapsed dungeon, an abandoned prison, a desecrated church. Determines the enemy pool, node flavor, and visual palette.

**Node Map**
The branching map of rooms presented at the start of a run. The player chooses their path through it.

**Node**
A single room or encounter on the Node Map. Types: Standard Combat, Elite Combat, Shop, Rest Site, Boss.

**Elite**
A harder combat encounter offering better rewards (cards, Relics).

**Boss**
The final node of a run. Defeating it ends the run in victory.

---

## Meta Terms

**Hub**
The persistent space between runs. Used for meta-progression: starting a new run, spending Orbs, and reviewing unlocks.

**Orbs**
The meta-currency earned during runs (from clearing rooms, defeating Elites, defeating bosses, and milestones). Kept on death. Spent in the Hub.

**Archetype**
A starting identity that shapes a run from turn one. Each Archetype provides a fixed starter deck biased toward a playstyle. Examples: *The Invoker* (Spell-focused), *The Condemned* (Curse-focused). Unlocked via run milestones, not Orb spend.

**Card Pool**
The full set of cards eligible to appear in post-combat offers and Shops. Expanded by spending Orbs in the Hub.

**Passive Upgrade Tree**
A small permanent upgrade tree (~15–20 nodes) purchased with Orbs. Provides minor persistent bonuses (e.g. +max health, extra card removal, extra Shop slot).

**Meta-Progression**
The collective system of persistent unlocks and upgrades that carry over between runs: Card Pool expansion, Archetype unlocks, and the Passive Upgrade Tree.
