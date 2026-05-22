import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import Phaser from "phaser";

export class MapScene extends Phaser.Scene {
  constructor() {
    super({ key: "MAP" });
  }

  create() {
    this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "Map Scene", { align: "center", color: "#ff0000" });
    const combatButton = this.add
      .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 25, "Enter Combat")
      .setInteractive()
      .on("pointerover", () => combatButton.setStyle({ color: "#ffff00" }))
      .on("pointerout", () => combatButton.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => this.scene.start("COMBAT"));
    const mapButton = this.add
      .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50, "Return to Hub")
      .setInteractive()
      .on("pointerover", () => mapButton.setStyle({ color: "#ffff00" }))
      .on("pointerout", () => mapButton.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => this.scene.start("HUB"));
  }
}
