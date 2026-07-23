import type { DialogueLine } from "../../content/act1/content";

export type DialogueAdvance = {
  line: DialogueLine | null;
  completed: boolean;
};

export class DialogueSystem {
  private lines: DialogueLine[] = [];
  private index = -1;
  private active = false;

  get isActive(): boolean {
    return this.active;
  }

  start(lines: DialogueLine[]): DialogueLine | null {
    this.lines = [...lines];
    this.index = lines.length > 0 ? 0 : -1;
    this.active = lines.length > 0;
    return this.current();
  }

  current(): DialogueLine | null {
    return this.active ? (this.lines[this.index] ?? null) : null;
  }

  advance(): DialogueAdvance {
    if (!this.active) {
      return { line: null, completed: false };
    }

    this.index += 1;
    const nextLine = this.lines[this.index] ?? null;
    if (nextLine !== null) {
      return { line: nextLine, completed: false };
    }

    this.lines = [];
    this.index = -1;
    this.active = false;
    return { line: null, completed: true };
  }
}
