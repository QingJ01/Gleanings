import Phaser from "phaser";
import type { SenseChoice } from "../domain/act1State";
import { JarMemoryEffect } from "../fx/JarMemoryEffect";

type TransitionData = {
  choice?: SenseChoice | null;
};

export class MemoryTransitionScene extends Phaser.Scene {
  constructor() {
    super("MemoryTransition");
  }

  create(data: TransitionData): void {
    const choice = data.choice ?? "aroma";
    const effect = new JarMemoryEffect(this, choice);
    effect.play(() => {
      this.scene.stop("Apartment");
      this.scene.start("ActOneComplete", { choice });
    });
  }
}
