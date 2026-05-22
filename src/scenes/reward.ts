import { SCREEN_HEIGHT, SCREEN_WIDTH } from "@/lib/constants";
import Phaser from "phaser";

export class RewardScene extends Phaser.Scene {
  constructor() {
    super({ key: "REWARD" });
  }

  create() {
    this.add.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, "Reward Scene", { align: "center", color: "#ff0000" });
    const nextButton = this.add
      .text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 25, "Next")
      .setInteractive()
      .on("pointerover", () => nextButton.setStyle({ color: "#ffff00" }))
      .on("pointerout", () => nextButton.setStyle({ color: "#ffffff" }))
      .on("pointerdown", () => this.scene.start("MAP"));
  }
}
