---
name: next-feature-design
description: >
  Gravepact project skill. Use when starting a new feature, planning the next task, or figuring out
  what to work on next. Reads the roadmap and current code to identify the best next task, then
  runs a collaborative brainstorm to resolve design questions, summarizes decisions, and updates
  gravepact-design.md. Trigger when the user says "what's next", "let's plan the next feature",
  "design the next thing", "what should we work on", or whenever starting a new implementation
  cycle on this game.
---

# next-feature-design

Prepares you and the user to start the next development task on Gravepact. Four stages:

1. **Identify** — find the best next task from the roadmap and code
2. **Brainstorm** — surface and resolve design questions collaboratively
3. **Update** — propose additions to the design doc, then write them on approval
4. **Summarize** — present decisions concisely in the conversation (no extra files)

---

## Stage 1: Identify the Next Task

Read `docs/gravepact-roadmap.md` and find the **first phase with unchecked items**. Within that phase, identify the **single most logical next task** — typically the first unchecked item or group that is unblocked and ready to implement.

Cross-reference with the source files to confirm what's actually implemented. The roadmap may lag behind the code or vice versa.

Look at:

- `src/state/` — GameState types, RunState, MetaState, Immer actions
- `src/engine/` — pure TS combat engine, deck management, map generation
- `src/data/` — static card and enemy data
- `src/scenes/` — Phaser scenes (Boot, Hub, Map, Combat, Reward)

Present the **one recommended task** to the user with a one-sentence rationale. Flag any mismatch between the roadmap and the actual code state.

---

## Stage 2: Brainstorm Design Decisions

Before brainstorming, read `docs/gravepact-design.md` to understand what's already decided. Do not re-litigate settled questions. Focus only on **open questions that would block or constrain implementation**.

Typical open questions to look for:

- Data shapes that aren't yet defined
- Card mechanics or interactions only vaguely described
- UX flows that need a concrete decision
- Interactions between the new task and existing systems (especially support tag compatibility, aura reservation, or relic effects)

Then invoke the `superpowers:brainstorming` skill to run a collaborative session on these questions. The goal is to reach actionable decisions, not just explore space. Keep it focused — a tight 3–5 question session beats an open-ended ramble.

**CRITICAL: When invoking the brainstorming skill, explicitly instruct it to stop after the user approves the design (step 5 of its checklist). It must NOT write a design doc, run a spec self-review, or invoke writing-plans. Those steps are handled by this skill in Stages 3 and 4.**

**Do not let the brainstorming skill (or any skill it invokes) create any new file.** The only file that should ever be updated is `docs/gravepact-design.md` — and only in Stage 3.

---

## Stage 3: Update the Design Doc

Open `docs/gravepact-design.md` and identify where the new decisions belong — either an update to an existing section or a new one.

Draft the proposed addition in the conversation as a quoted block so the user can review it. Ask for approval before writing. Then make the edit using the Edit tool.

Follow the existing doc's tone, heading style, and level of detail. Don't duplicate content that's already there.

**Never create a new file.** Only ever edit `docs/gravepact-design.md` in place. If a skill invoked earlier in this session produced a standalone design doc file, do not use or reference it — summarize the decisions directly here instead.

---

## Stage 4: Summarize Decisions

After updating the design doc, output a short summary directly in the conversation.

Format:

```
**[Task name] — Design Decisions**

- [Decision 1] — [brief rationale if non-obvious]
- [Decision 2]
- ...
```

Keep it tight. These are the decisions that will guide implementation.
