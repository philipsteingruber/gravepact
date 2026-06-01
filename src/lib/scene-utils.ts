import { CARD_HEIGHT, CARD_WIDTH, RELIC_WIDTH } from "./constants";
import type { Card, Relic } from "./types";

export const renderCard = (scene: Phaser.Scene, x: number, y: number, card: Card, onClick: () => void, color?: number) => {
  scene.add
    .rectangle(x, y, CARD_WIDTH, CARD_HEIGHT, color ?? (card.kind === "support" ? 0x4a2d6e : 0x2d4a6e))
    .setOrigin(0, 0)
    .setInteractive()
    .on("pointerdown", onClick);

  scene.add.text(x + CARD_WIDTH / 2, y + 10, card.name).setOrigin(0.5, 0);
  scene.add
    .text(
      x + CARD_WIDTH / 2,
      y + CARD_HEIGHT / 2,
      [...(card.kind === "support" ? card.compatibleTags : card.kind === "skill" ? card.tags : [])].join(" "),
    )
    .setOrigin(0.5, 0);
  scene.add
    .text(x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 20, "◆".repeat(card.kind === "aura" ? card.energyReservation : card.energyCost))
    .setOrigin(0.5, 0);

  return scene;
};

export const renderRelic = (scene: Phaser.Scene, x: number, y: number, relic: Relic, onClick: () => void) => {
  scene.add.rectangle(x, y, RELIC_WIDTH, CARD_HEIGHT, 0x6e4a2d).setOrigin(0, 0).setInteractive().on("pointerdown", onClick);

  scene.add.text(x + RELIC_WIDTH / 2, y + 10, relic.name).setOrigin(0.5, 0);

  return scene;
};

export const addHoverStyle = (obj: Phaser.GameObjects.Rectangle, defaultColor: number, hoverColor: number) => {
  obj.on("pointerover", () => obj.setFillStyle(hoverColor)).on("pointerout", () => obj.setFillStyle(defaultColor));
};
