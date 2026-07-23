import Phaser from "phaser";
import type { DialogueLine } from "../../content/act1/content";
import { DialogueSystem } from "../systems/DialogueSystem";

export class DialogueBox {
  private readonly scene: Phaser.Scene;
  private readonly container: Phaser.GameObjects.Container;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly advanceText: Phaser.GameObjects.Text;
  private readonly dialogue = new DialogueSystem();
  private currentVoice: Phaser.Sound.BaseSound | null = null;
  private waitForVoiceUnlock = false;
  private onComplete: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const panel = scene.add
      .rectangle(20, 238, 600, 106, 0x211a17, 0.97)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9873f);
    const innerRule = scene.add
      .rectangle(29, 247, 582, 88)
      .setOrigin(0)
      .setStrokeStyle(1, 0x6e4932);
    const accent = scene.add.rectangle(30, 248, 5, 86, 0xa83b32).setOrigin(0);
    this.speakerText = scene.add.text(46, 251, "", {
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontSize: "12px",
      fontStyle: "bold",
      color: "#D4B46A"
    });
    this.bodyText = scene.add.text(46, 276, "", {
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontSize: "13px",
      color: "#F4EBDD",
      lineSpacing: 6,
      wordWrap: { width: 530 }
    });
    this.advanceText = scene.add
      .text(594, 320, "E 继续 ▾", {
        fontFamily: '"Cascadia Mono", Consolas, monospace',
        fontSize: "9px",
        color: "#B7C2C0"
      })
      .setOrigin(1, 0);

    this.container = scene.add
      .container(0, 0, [
        panel,
        innerRule,
        accent,
        this.speakerText,
        this.bodyText,
        this.advanceText
      ])
      .setScrollFactor(0)
      .setDepth(20_000)
      .setVisible(false);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.stopVoice();
    });
  }

  get isActive(): boolean {
    return this.container.visible;
  }

  play(lines: DialogueLine[], onComplete?: () => void): void {
    const firstLine = this.dialogue.start(lines);
    if (firstLine === null) {
      onComplete?.();
      return;
    }
    this.onComplete = onComplete ?? null;
    this.container.setVisible(true);
    this.renderLine(firstLine);
  }

  advance(): void {
    if (!this.isActive) return;
    if (this.waitForVoiceUnlock) {
      // Do not let a browser that refuses audio autoplay block the story.
      this.waitForVoiceUnlock = false;
      this.advanceText.setText("E 继续 ▾");
      return;
    }

    this.stopVoice();
    const result = this.dialogue.advance();
    if (result.line !== null) {
      this.renderLine(result.line);
      return;
    }
    if (!result.completed) return;

    const completion = this.onComplete;
    this.onComplete = null;
    this.container.setVisible(false);
    this.advanceText.setText("E 继续 ▾");
    completion?.();
  }

  private renderLine(line: DialogueLine): void {
    this.speakerText.setText(line.speakerName);
    this.bodyText.setText(line.text);
    this.playVoice(line);
  }

  private playVoice(line: DialogueLine): void {
    this.stopVoice();
    this.waitForVoiceUnlock = false;
    this.advanceText.setText("E 继续 ▾");
    if (
      line.voiceKey === undefined ||
      !this.scene.cache.audio.exists(line.voiceKey)
    ) {
      return;
    }
    if (this.scene.sound.locked) {
      this.waitForVoiceUnlock = true;
      this.advanceText.setText("E 开启声音 ▾");
      this.playVoiceWhenUnlocked(line.voiceKey);
      return;
    }
    this.startVoice(line.voiceKey);
  }

  private playVoiceWhenUnlocked(voiceKey: string): void {
    this.scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
      if (
        this.isActive &&
        this.dialogue.current()?.voiceKey === voiceKey
      ) {
        this.waitForVoiceUnlock = false;
        this.advanceText.setText("E 继续 ▾");
        this.startVoice(voiceKey);
      }
    });
  }

  private startVoice(voiceKey: string): void {
    this.stopVoice();
    const voice = this.scene.sound.add(voiceKey, { volume: 0.9 });
    this.currentVoice = voice;
    voice.once(Phaser.Sound.Events.COMPLETE, () => {
      if (this.currentVoice !== voice) return;
      voice.destroy();
      this.currentVoice = null;
    });
    voice.play();
  }

  private stopVoice(): void {
    if (this.currentVoice === null) return;
    this.currentVoice.stop();
    this.currentVoice.destroy();
    this.currentVoice = null;
  }
}
