import { locations } from "@/data/locations";
import { CARD_SPACING, CARD_WIDTH, SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import { addHoverStyle, renderCard } from "@/lib/scene-utils";
import { pickRandom } from "@/lib/utils";
import { addCardToDeck } from "@/state/actions/deck";
import { store } from "@/state/store";
import Phaser from "phaser";

const SKIP_BUTTON_COLOR = 0x3a2a2a;
const SKIP_BUTTON_HOVER_COLOR = 0x5a3a3a;

export class RewardScene extends Phaser.Scene {
  constructor() {
    super({ key: "REWARD" });
  }

  create() {
    const choices = pickRandom(locations[store.gameState.run.locationId].cardPool, 3);

    const totalWidth = choices.length * CARD_WIDTH + (choices.length - 1) * CARD_SPACING;
    const startX = (SCREEN_WIDTH - totalWidth) / 2;

    this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 3, "Choose a card to add to your Deck").setOrigin(0.5, 0);

    choices.forEach((card, i) => {
      renderCard(this, startX + i * (CARD_WIDTH + CARD_SPACING), SCREEN_HEIGHT / 3 + 40, card, () => {
        store.gameState = addCardToDeck(store.gameState, card);
        this.scene.start("MAP");
      });
    });

    addHoverStyle(
      this.add
        .rectangle(SCREEN_WIDTH / 2, (SCREEN_HEIGHT / 3) * 2, 150, 50, SKIP_BUTTON_COLOR)
        .setInteractive()
        .on("pointerdown", () => this.scene.start("MAP")),
      SKIP_BUTTON_COLOR,
      SKIP_BUTTON_HOVER_COLOR,
    );
    this.add.text(SCREEN_WIDTH / 2, (SCREEN_HEIGHT / 3) * 2, "Skip").setOrigin(0.5, 0.5);
  }
}
