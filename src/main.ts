import Phaser from "phaser";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "./lib/constants";
import { BootScene } from "./scenes/boot";
import { CombatScene } from "./scenes/combat";
import { HubScene } from "./scenes/hub";
import { MapScene } from "./scenes/map";
import { RewardScene } from "./scenes/reward";
import { ShopScene } from "./scenes/shop";

new Phaser.Game({
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  backgroundColor: "#0d0d1a",
  type: Phaser.AUTO,
  scene: [BootScene, HubScene, MapScene, CombatScene, RewardScene, ShopScene],
});
