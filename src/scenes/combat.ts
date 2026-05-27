import { skillCards } from "@/data/cards/skills";
import { supportCards } from "@/data/cards/supports";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import { createMockEnemy } from "@/lib/test-helpers";
import type { Card } from "@/lib/types";
import { endTurn, playHand, resolveEnemyTurn, stageCard, startCombat, unstageCard } from "@/state/actions/combat";
import { store } from "@/state/store";
import { produce } from "immer";
import Phaser from "phaser";

// --- Rendering Constants ---
const ENEMY_PANEL_HEIGHT = 220;
const PLAYER_STATUS_PANEL_HEIGHT = 50;
const STAGING_ZONE_PANEL_HEIGHT = 180;
const HAND_AREA_PANEL_HEIGHT = 180;
const ACTION_BUTTONS_PANEL_HEIGHT = SCREEN_HEIGHT - ENEMY_PANEL_HEIGHT - STAGING_ZONE_PANEL_HEIGHT - HAND_AREA_PANEL_HEIGHT - 80;
const PANEL_GAP = 5;

const ENEMY_PANEL_FILL_COLOR = 0x1a1a2e;
const PLAYER_STATUS_PANEL_FILL_COLOR = 0x252540;
const STAGING_ZONE_PANEL_FILL_COLOR = 0x1e1e38;
const HAND_AREA_PANEL_FILL_COLOR = 0x12121f;
const ACTION_BUTTONS_PANEL_FILL_COLOR = 0x0f0f1f;

const PLAY_HAND_BUTTON_COLOR = 0x2a4a2a;
const PLAY_HAND_BUTTON_HOVER_COLOR = 0x3a6a3a;
const PLAY_HAND_BUTTON_DISABLED_COLOR = 0x1a1a1a;

const END_TURN_BUTTON_COLOR = 0x4a2a2a;
const END_TURN_BUTTON_HOVER_COLOR = 0x6a3a3a;

const CARD_WIDTH = 140;
const CARD_HEIGHT = 160;
const CARD_SPACING = 10;

// --- Computed Y positions ---
const playerStatusY = ENEMY_PANEL_HEIGHT + PANEL_GAP;

const stagingZoneY = playerStatusY + PLAYER_STATUS_PANEL_HEIGHT + PANEL_GAP;
const stagedCardY = stagingZoneY + (STAGING_ZONE_PANEL_HEIGHT - CARD_HEIGHT) / 2;

const handAreaY = stagingZoneY + STAGING_ZONE_PANEL_HEIGHT + PANEL_GAP;
const handCardY = handAreaY + (HAND_AREA_PANEL_HEIGHT - CARD_HEIGHT) / 2;

const actionButtonsY = handAreaY + HAND_AREA_PANEL_HEIGHT + PANEL_GAP;

export class CombatScene extends Phaser.Scene {
  constructor() {
    super({ key: "COMBAT" });
  }

  private renderCard(x: number, y: number, card: Card, onClick: () => void) {
    this.add
      .rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, card.kind === "support" ? 0x4a2d6e : 0x2d4a6e)
      .setOrigin(0, 0)
      .setInteractive()
      .on("pointerdown", onClick);

    this.add.text(x + CARD_WIDTH / 2, y + 10, card.name).setOrigin(0.5, 0);
    this.add
      .text(
        x + CARD_WIDTH / 2,
        y + CARD_HEIGHT / 2,
        [...(card.kind === "support" ? card.compatibleTags : card.kind === "skill" ? card.tags : [])].join(" "),
      )
      .setOrigin(0.5, 0);
    this.add
      .text(x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 20, "◆".repeat(card.kind === "aura" ? card.energyReservation : card.energyCost))
      .setOrigin(0.5, 0);
  }

  create() {
    if (!store.gameState.run.combat) {
      store.gameState = startCombat(
        store.gameState,
        createMockEnemy({
          statuses: [
            { kind: "Burn", stacks: 2 },
            { kind: "Bleed", stacks: 3 },
            { kind: "Weaken", stacks: 3 },
            { kind: "Armor", stacks: 5 },
          ],
        }),
      );
      store.gameState = produce(store.gameState, (draft) => {
        draft.run.hand = [...skillCards.slice(0, 2), ...supportCards.slice(0, 2)];
      });
    }

    const combat = store.gameState.run.combat!;

    const enemy = combat.enemy;
    const intent = enemy.intents[enemy.intentIndex];
    const armor = enemy.statuses.find((status) => status.kind === "Armor");

    const hand = store.gameState.run.hand;
    const stagedCards = combat.stagedCards!;

    // --- ENEMY PANEL ---
    this.add.rectangle(0, 0, SCREEN_WIDTH, ENEMY_PANEL_HEIGHT, ENEMY_PANEL_FILL_COLOR).setOrigin(0, 0);

    this.add.text(SCREEN_WIDTH / 2, ENEMY_PANEL_HEIGHT / 5, `${enemy.name}`).setOrigin(0.5, 0);
    this.add.text(SCREEN_WIDTH / 2, ENEMY_PANEL_HEIGHT / 5 + 20, `${enemy.hp}/${enemy.maxHp} HP`).setOrigin(0.5, 0);
    this.add.text(SCREEN_WIDTH / 2, ENEMY_PANEL_HEIGHT / 5 + 40, armor ? `🛡️${armor.stacks}` : "").setOrigin(0.5, 0);
    this.add
      .text(
        SCREEN_WIDTH / 2,
        ENEMY_PANEL_HEIGHT / 5 + 80,
        `${enemy.statuses
          .filter((status) => status.kind !== "Armor")
          .map((status) => {
            return `${status.kind === "Bleed" ? "🩸" : status.kind === "Burn" ? "🔥" : "🌀"}${status.stacks}`;
          })
          .join(" ")}`,
      )
      .setOrigin(0.5, 0);
    this.add
      .text(
        SCREEN_WIDTH / 2,
        ENEMY_PANEL_HEIGHT / 5 + 120,
        `${intent.kind === "attack" ? "⚔️" : intent.kind === "defend" ? "🛡️" : "✨"}${intent.kind === "attack" ? intent.damage : intent.kind === "defend" ? intent.amount : ""}`,
      )
      .setOrigin(0.5, 0);

    // --- PLAYER STATUS PANEL ---
    this.add.rectangle(0, playerStatusY, SCREEN_WIDTH, PLAYER_STATUS_PANEL_HEIGHT, PLAYER_STATUS_PANEL_FILL_COLOR).setOrigin(0, 0);

    this.add
      .text(
        20,
        playerStatusY + PLAYER_STATUS_PANEL_HEIGHT / 2,
        `❤️ ${store.gameState.run.playerHealth}/${store.gameState.run.playerMaxHealth} HP`,
      )
      .setOrigin(0, 0.5);

    const energyPips = "◆".repeat(combat.energyRemaining) + "◇".repeat(combat.energyMax - combat.energyRemaining);
    this.add.text(SCREEN_WIDTH - 20, playerStatusY + PLAYER_STATUS_PANEL_HEIGHT / 2, energyPips).setOrigin(1, 0.5);

    // --- STAGING ZONE PANEL ---
    this.add.rectangle(0, stagingZoneY, SCREEN_WIDTH, STAGING_ZONE_PANEL_HEIGHT, STAGING_ZONE_PANEL_FILL_COLOR).setOrigin(0, 0);

    if (stagedCards.length === 0) {
      this.add
        .text(SCREEN_WIDTH / 2, stagingZoneY + STAGING_ZONE_PANEL_HEIGHT / 2, `${stagedCards.length === 0 ? "No cards staged" : ""}`)
        .setOrigin(0.5, 0.5);
    } else {
      const totalWidth = stagedCards.length * CARD_WIDTH + (stagedCards.length - 1) * CARD_SPACING;
      const startX = (SCREEN_WIDTH - totalWidth) / 2;

      stagedCards.forEach((card, i) => {
        this.renderCard(startX + i * (CARD_WIDTH + CARD_SPACING), stagedCardY, card, () => {
          store.gameState = unstageCard(store.gameState, card);
          this.scene.restart();
        });
      });
    }

    // --- HAND PANEL ---
    this.add.rectangle(0, handAreaY, SCREEN_WIDTH, HAND_AREA_PANEL_HEIGHT, HAND_AREA_PANEL_FILL_COLOR).setOrigin(0, 0);

    const totalWidth = hand.length * CARD_WIDTH + (hand.length - 1) * CARD_SPACING;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    hand.forEach((card, i) => {
      this.renderCard(startX + i * (CARD_WIDTH + CARD_SPACING), handCardY, card, () => {
        store.gameState = stageCard(store.gameState, card);
        this.scene.restart();
      });
    });

    // --- ACTION BUTTONS PANEL ---
    this.add.rectangle(0, actionButtonsY, SCREEN_WIDTH, ACTION_BUTTONS_PANEL_HEIGHT, ACTION_BUTTONS_PANEL_FILL_COLOR).setOrigin(0, 0);

    const buttonOffset = 100;
    const buttonHeight = 40;
    const buttonWidth = 140;

    const isHandValid = stagedCards.some((card) => card.kind === "skill" || card.kind === "aura");

    const playHandButtonColor = isHandValid ? PLAY_HAND_BUTTON_COLOR : PLAY_HAND_BUTTON_DISABLED_COLOR;

    const playHandButton = this.add
      .rectangle(
        SCREEN_WIDTH / 2 - buttonOffset,
        actionButtonsY + ACTION_BUTTONS_PANEL_HEIGHT / 2,
        buttonWidth,
        buttonHeight,
        playHandButtonColor,
      )
      .setInteractive()
      .on("pointerover", () => {
        if (isHandValid) playHandButton.setFillStyle(PLAY_HAND_BUTTON_HOVER_COLOR);
      })
      .on("pointerout", () => playHandButton.setFillStyle(playHandButtonColor))
      .on("pointerdown", () => {
        if (!isHandValid) return;

        store.gameState = playHand(store.gameState);
        this.scene.restart();
      });
    this.add.text(SCREEN_WIDTH / 2 - buttonOffset, actionButtonsY + ACTION_BUTTONS_PANEL_HEIGHT / 2, "Play Hand").setOrigin(0.5, 0.5);

    const endTurnButton = this.add
      .rectangle(
        SCREEN_WIDTH / 2 + buttonOffset,
        actionButtonsY + ACTION_BUTTONS_PANEL_HEIGHT / 2,
        buttonWidth,
        buttonHeight,
        END_TURN_BUTTON_COLOR,
      )
      .setInteractive()
      .on("pointerover", () => endTurnButton.setFillStyle(END_TURN_BUTTON_HOVER_COLOR))
      .on("pointerout", () => endTurnButton.setFillStyle(END_TURN_BUTTON_COLOR))
      .on("pointerdown", () => {
        store.gameState = resolveEnemyTurn(store.gameState);
        store.gameState = endTurn(store.gameState);
        this.scene.restart();
      });
    this.add.text(SCREEN_WIDTH / 2 + buttonOffset, actionButtonsY + ACTION_BUTTONS_PANEL_HEIGHT / 2, "End Turn").setOrigin(0.5, 0.5);
    /*
    this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "Combat Scene", { align: "center", color: "#ff0000" });
    const nextButton = this.add
      .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 25, "Next")
      .setInteractive()
      .on("pointerover", () => nextButton.setStyle({ color: "#ffff00" }))
      .on("pointerout", () => nextButton.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => this.scene.start("REWARD"));
    */
  }
}
