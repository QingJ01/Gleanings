import Phaser from "phaser";
import type {
  DialogueChoice
} from "../../content/act1/content";
import type { SenseChoice } from "../domain/act1State";

export class ChoicePanel {
  private readonly container: Phaser.GameObjects.Container;
  private readonly optionTexts: Phaser.GameObjects.Text[] = [];
  private choices: DialogueChoice[] = [];
  private selectedIndex = 0;

  constructor(scene: Phaser.Scene) {
    const shade = scene.add
      .rectangle(0, 0, 640, 360, 0x17110f, 0.62)
      .setOrigin(0);
    const panel = scene.add
      .rectangle(116, 54, 408, 252, 0x211a17, 0.99)
      .setOrigin(0)
      .setStrokeStyle(2, 0xc9873f);
    const eyebrow = scene.add.text(144, 78, "一眼之间", {
      fontFamily: '"Cascadia Mono", Consolas, monospace',
      fontSize: "9px",
      color: "#A83B32"
    });
    const title = scene.add.text(144, 100, "你最先注意到什么？", {
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontSize: "18px",
      color: "#F4EBDD"
    });
    const subtitle = scene.add.text(144, 130, "没有正确答案。", {
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontSize: "10px",
      color: "#B7C2C0"
    });

    for (let index = 0; index < 3; index += 1) {
      this.optionTexts.push(
        scene.add.text(154, 165 + index * 36, "", {
          fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
          fontSize: "13px",
          color: "#B7C2C0",
          backgroundColor: "#30231D",
          fixedWidth: 330,
          padding: { x: 12, y: 8 }
        })
      );
    }

    const controls = scene.add
      .text(496, 280, "↑↓ 选择    E 确认", {
        fontFamily: '"Cascadia Mono", Consolas, monospace',
        fontSize: "9px",
        color: "#B7C2C0"
      })
      .setOrigin(1, 0);

    this.container = scene.add
      .container(0, 0, [
        shade,
        panel,
        eyebrow,
        title,
        subtitle,
        ...this.optionTexts,
        controls
      ])
      .setScrollFactor(0)
      .setDepth(18_000)
      .setVisible(false);
  }

  get isOpen(): boolean {
    return this.container.visible;
  }

  open(choices: DialogueChoice[]): void {
    this.choices = choices;
    this.selectedIndex = 0;
    this.container.setVisible(true);
    this.render();
  }

  move(direction: -1 | 1): void {
    if (!this.isOpen || this.choices.length === 0) return;
    this.selectedIndex = Phaser.Math.Wrap(
      this.selectedIndex + direction,
      0,
      this.choices.length
    );
    this.render();
  }

  confirm(): SenseChoice | null {
    if (!this.isOpen) return null;
    return this.choices[this.selectedIndex]?.value ?? null;
  }

  selectedChoice(): DialogueChoice | null {
    return this.choices[this.selectedIndex] ?? null;
  }

  close(): void {
    this.container.setVisible(false);
  }

  private render(): void {
    this.optionTexts.forEach((text, index) => {
      const choice = this.choices[index];
      const selected = index === this.selectedIndex;
      text
        .setText(choice ? `${selected ? "◆" : "◇"}  ${choice.label}` : "")
        .setColor(selected ? "#F4EBDD" : "#B7C2C0")
        .setBackgroundColor(selected ? "#6E4932" : "#30231D");
    });
  }
}
