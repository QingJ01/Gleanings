import Phaser from "phaser";
import type { DialogueLine } from "../../content/act1/content";
import { DialogueSystem } from "../systems/DialogueSystem";

export class DialogueBox {
  private readonly container: Phaser.GameObjects.Container;
  private readonly speakerText: Phaser.GameObjects.Text;
  private readonly bodyText: Phaser.GameObjects.Text;
  private readonly dialogue = new DialogueSystem();
  private onComplete: (() => void) | null = null;

  constructor(scene: Phaser.Scene) {
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
    const advance = scene.add
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
        advance
      ])
      .setScrollFactor(0)
      .setDepth(20_000)
      .setVisible(false);
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
    const result = this.dialogue.advance();
    if (result.line !== null) {
      this.renderLine(result.line);
      return;
    }
    if (!result.completed) return;

    const completion = this.onComplete;
    this.onComplete = null;
    this.container.setVisible(false);
    completion?.();
  }

  private renderLine(line: DialogueLine): void {
    this.speakerText.setText(line.speakerName);
    this.bodyText.setText(line.text);
  }
}
