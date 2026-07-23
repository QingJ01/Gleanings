import Phaser from "phaser";
import type { SenseChoice } from "../domain/act1State";

export type JarEffectProfile = {
  tint: number;
  particleCount: number;
  audioFilter: "warm-lowpass" | "pulse-bandpass" | "distant-lowpass";
  motif: "温情" | "工艺" | "时间";
};

const PROFILES: Record<SenseChoice, JarEffectProfile> = {
  aroma: {
    tint: 0xd4b46a,
    particleCount: 22,
    audioFilter: "warm-lowpass",
    motif: "温情"
  },
  hongqu_red: {
    tint: 0xa83b32,
    particleCount: 36,
    audioFilter: "pulse-bandpass",
    motif: "工艺"
  },
  cold_clay: {
    tint: 0xb7c2c0,
    particleCount: 14,
    audioFilter: "distant-lowpass",
    motif: "时间"
  }
};

export function effectProfileForChoice(
  choice: SenseChoice
): JarEffectProfile {
  return { ...PROFILES[choice] };
}

export class JarMemoryEffect {
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly choice: SenseChoice
  ) {}

  play(onComplete: () => void): void {
    const profile = effectProfileForChoice(this.choice);
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduceMotion ? 420 : 1_450;

    const veil = this.scene.add
      .rectangle(0, 0, 640, 360, 0x17110f, 0)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(30_000);
    const memory = this.scene.add
      .image(320, 180, "fx-jar-memory")
      .setScrollFactor(0)
      .setDepth(30_001)
      .setTint(profile.tint)
      .setAlpha(0);

    this.scene.tweens.add({
      targets: veil,
      alpha: 0.78,
      duration: Math.round(duration * 0.7),
      ease: "Cubic.easeOut"
    });
    this.scene.tweens.add({
      targets: memory,
      alpha: 0.76,
      duration,
      ease: "Cubic.easeOut"
    });

    if (!reduceMotion) {
      this.createParticles(profile);
    }

    this.scene.cameras.main.flash(240, 234, 221, 197);
    this.scene.time.delayedCall(duration, onComplete);
  }

  private createParticles(profile: JarEffectProfile): void {
    const random = new Phaser.Math.RandomDataGenerator([
      `gleanings-${this.choice}`
    ]);
    for (let index = 0; index < profile.particleCount; index += 1) {
      const size = random.pick([2, 2, 3, 4]);
      const particle = this.scene.add
        .rectangle(
          random.integerInRange(140, 500),
          random.integerInRange(190, 330),
          size,
          size,
          profile.tint,
          random.realInRange(0.35, 0.82)
        )
        .setScrollFactor(0)
        .setDepth(30_002);
      this.scene.tweens.add({
        targets: particle,
        y: particle.y - random.integerInRange(60, 170),
        x: particle.x + random.integerInRange(-28, 28),
        alpha: 0,
        duration: random.integerInRange(760, 1_380),
        delay: random.integerInRange(0, 260),
        ease: "Cubic.easeOut"
      });
    }
  }
}
