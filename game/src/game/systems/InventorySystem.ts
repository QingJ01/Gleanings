export class InventorySystem {
  private readonly values: string[];

  constructor(initialItems: string[]) {
    this.values = [...new Set(initialItems)];
  }

  add(itemId: string): void {
    if (!this.has(itemId)) {
      this.values.push(itemId);
    }
  }

  remove(itemId: string): void {
    const index = this.values.indexOf(itemId);
    if (index >= 0) {
      this.values.splice(index, 1);
    }
  }

  has(itemId: string): boolean {
    return this.values.includes(itemId);
  }

  items(): string[] {
    return [...this.values];
  }
}
