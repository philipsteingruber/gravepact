import { skillCards } from "@/data/cards/skills";
import { relics as allRelics } from "@/data/relics";
import { getCardPrice, getRelicPrice } from "@/engine/shop";
import { CARD_HEIGHT, CARD_WIDTH, RELIC_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import { addHoverStyle, renderCard, renderRelic } from "@/lib/scene-utils";
import type { ShopInventory } from "@/lib/types";
import { buyCard, buyRelic } from "@/state/actions/deck";
import { store } from "@/state/store";
import { produce } from "immer";
import Phaser from "phaser";

const GOLD_Y = 40;

const SECTION_LABEL_X = 85;

const CARDS_LABEL_Y = 100;
const CARDS_ROW_Y = 140;

const RELICS_LABEL_Y = SCREEN_HEIGHT / 2;
const RELICS_ROW_Y = SCREEN_HEIGHT / 2 + 40;

const ITEM_SPACING_X = 20;
const ITEM_SPACING_Y = 20;
const ITEMS_START_X = 60;

const BUY_BUTTON_WIDTH = 80;
const BUY_BUTTON_HEIGHT = 30;

const LEAVE_BUTTON_WIDTH = 120;
const LEAVE_BUTTON_HEIGHT = 50;

const LEAVE_BUTTON_Y = SCREEN_HEIGHT - 60;

const BUY_BUTTON_COLOR = 0x2a4a2a;
const BUY_BUTTON_HOVER_COLOR = 0x3a6a3a;
const BUY_BUTTON_DISABLED_COLOR = 0x2a2a2a;
const BUY_BUTTON_DISABLED_TEXT_COLOR = "#888888";

const LEAVE_BUTTON_COLOR = 0x3a2a2a;
const LEAVE_BUTTON_HOVER_COLOR = 0x5a3a3a;

export class ShopScene extends Phaser.Scene {
  inventory!: ShopInventory;
  purchasedIds!: Set<string>;

  constructor() {
    super({ key: "SHOP" });
  }

  init(data: { inventory?: ShopInventory }) {
    if (data.inventory) {
      this.inventory = data.inventory;
      this.purchasedIds = new Set<string>();
    }
  }

  create() {
    if (!this.inventory) {
      this.inventory = { cards: skillCards.slice(0, 4), relics: allRelics.slice(0, 2) };
      this.purchasedIds = new Set();
      store.gameState = produce(store.gameState, (draft) => {
        draft.run.gold = 150;
      });
    }

    this.add.text(SCREEN_WIDTH / 2, GOLD_Y, "Gold: ").setOrigin(1, 0);
    this.add.text(SCREEN_WIDTH / 2, GOLD_Y, store.gameState.run.gold.toString()).setOrigin(0, 0);

    this.add.text(SECTION_LABEL_X, CARDS_LABEL_Y, "Cards").setOrigin(0.5, 0);
    this.inventory.cards.forEach((card, i) => {
      const canAfford = getCardPrice(card) <= store.gameState.run.gold;
      const isPurchased = this.purchasedIds.has(card.id);
      const isEnabled = canAfford && !isPurchased;

      renderCard(this, ITEMS_START_X + i * (CARD_WIDTH + ITEM_SPACING_X), CARDS_ROW_Y, card, () => {}, isPurchased ? 0x1a1a1a : undefined);

      const buyButton = this.add
        .rectangle(
          ITEMS_START_X + i * (CARD_WIDTH + ITEM_SPACING_X) + CARD_WIDTH / 2,
          CARDS_ROW_Y + CARD_HEIGHT + ITEM_SPACING_Y,
          BUY_BUTTON_WIDTH,
          BUY_BUTTON_HEIGHT,
          isEnabled ? BUY_BUTTON_COLOR : BUY_BUTTON_DISABLED_COLOR,
        )
        .setOrigin(0.5, 0)
        .setInteractive()
        .on("pointerdown", () => {
          if (isEnabled) {
            store.gameState = buyCard(store.gameState, card);
            this.purchasedIds.add(card.id);
            this.scene.restart();
          }
        });

      if (isEnabled) addHoverStyle(buyButton, BUY_BUTTON_COLOR, BUY_BUTTON_HOVER_COLOR);

      this.add
        .text(
          ITEMS_START_X + i * (CARD_WIDTH + ITEM_SPACING_X) + CARD_WIDTH / 2,
          CARDS_ROW_Y + CARD_HEIGHT + ITEM_SPACING_Y + BUY_BUTTON_HEIGHT / 2,
          "Buy",
          { color: isEnabled ? "#ffffff" : BUY_BUTTON_DISABLED_TEXT_COLOR },
        )
        .setOrigin(0.5);
    });

    this.add.text(SECTION_LABEL_X, RELICS_LABEL_Y, "Relics").setOrigin(0.5, 0);
    this.inventory.relics.forEach((relic, i) => {
      const canAfford = getRelicPrice(relic) <= store.gameState.run.gold;
      const isPurchased = this.purchasedIds.has(relic.id);
      const isEnabled = canAfford && !isPurchased;

      renderRelic(this, ITEMS_START_X + i * (RELIC_WIDTH + ITEM_SPACING_X), RELICS_ROW_Y, relic, () => {});

      const buyButton = this.add
        .rectangle(
          ITEMS_START_X + i * (RELIC_WIDTH + ITEM_SPACING_X) + RELIC_WIDTH / 2,
          RELICS_ROW_Y + CARD_HEIGHT + ITEM_SPACING_Y,
          BUY_BUTTON_WIDTH,
          BUY_BUTTON_HEIGHT,
          isEnabled ? BUY_BUTTON_COLOR : BUY_BUTTON_DISABLED_COLOR,
        )
        .setOrigin(0.5, 0)
        .setInteractive()
        .on("pointerdown", () => {
          if (isEnabled) {
            store.gameState = buyRelic(store.gameState, relic);
            this.purchasedIds.add(relic.id);
            this.scene.restart();
          }
        });

      if (isEnabled) addHoverStyle(buyButton, BUY_BUTTON_COLOR, BUY_BUTTON_HOVER_COLOR);

      this.add
        .text(
          ITEMS_START_X + i * (RELIC_WIDTH + ITEM_SPACING_X) + RELIC_WIDTH / 2,
          RELICS_ROW_Y + CARD_HEIGHT + ITEM_SPACING_Y + BUY_BUTTON_HEIGHT / 2,
          "Buy",
          { color: isEnabled ? "#ffffff" : BUY_BUTTON_DISABLED_TEXT_COLOR },
        )
        .setOrigin(0.5);
    });

    addHoverStyle(
      this.add
        .rectangle(SCREEN_WIDTH / 2, LEAVE_BUTTON_Y, LEAVE_BUTTON_WIDTH, LEAVE_BUTTON_HEIGHT, LEAVE_BUTTON_COLOR)
        .setInteractive()
        .on("pointerdown", () => {
          this.scene.start("MAP");
        }),
      LEAVE_BUTTON_COLOR,
      LEAVE_BUTTON_HOVER_COLOR,
    );
    this.add.text(SCREEN_WIDTH / 2, LEAVE_BUTTON_Y, "Leave").setOrigin(0.5, 0.5);
  }
}
