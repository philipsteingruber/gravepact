import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BOOT" });
  }

  preload() {
    // Load assets here
  }

  create() {
    this.scene.start("COMBAT");
  }
}
