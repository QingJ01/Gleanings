import Phaser from "phaser";

export type Facing = "down" | "left" | "right" | "up";

export type MovementKeys = {
  up: { readonly isDown: boolean };
  down: { readonly isDown: boolean };
  left: { readonly isDown: boolean };
  right: { readonly isDown: boolean };
};

const IDLE_FRAME: Record<Facing, number> = {
  down: 1,
  left: 4,
  right: 7,
  up: 10
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  readonly speed = 92;
  private currentFacing: Facing = "down";

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture = "actor-yi"
  ) {
    super(scene, x, y, texture, IDLE_FRAME.down);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setOrigin(0.5, 0.78);
    this.setDepth(20);
    this.setCollideWorldBounds(true);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(18, 16);
    body.setOffset(7, 29);
    this.createAnimations(texture);
  }

  get facing(): Facing {
    return this.currentFacing;
  }

  updateMovement(keys: MovementKeys, locked: boolean): boolean {
    if (locked) {
      this.stopAtIdle();
      return false;
    }

    let velocityX = 0;
    let velocityY = 0;
    if (keys.left.isDown) velocityX -= 1;
    if (keys.right.isDown) velocityX += 1;
    if (keys.up.isDown) velocityY -= 1;
    if (keys.down.isDown) velocityY += 1;

    const moving = velocityX !== 0 || velocityY !== 0;
    if (!moving) {
      this.stopAtIdle();
      return false;
    }

    const length = Math.hypot(velocityX, velocityY);
    this.setVelocity(
      Math.round((velocityX / length) * this.speed),
      Math.round((velocityY / length) * this.speed)
    );

    if (Math.abs(velocityX) > Math.abs(velocityY)) {
      this.currentFacing = velocityX < 0 ? "left" : "right";
    } else {
      this.currentFacing = velocityY < 0 ? "up" : "down";
    }
    this.play(`yi-${this.currentFacing}`, true);
    return true;
  }

  private stopAtIdle(): void {
    this.setVelocity(0, 0);
    this.stop();
    this.setFrame(IDLE_FRAME[this.currentFacing]);
  }

  private createAnimations(texture: string): void {
    const rows: Facing[] = ["down", "left", "right", "up"];
    rows.forEach((facing, row) => {
      const key = `yi-${facing}`;
      if (this.scene.anims.exists(key)) return;
      this.scene.anims.create({
        key,
        frames: this.scene.anims.generateFrameNumbers(texture, {
          start: row * 3,
          end: row * 3 + 2
        }),
        frameRate: 7,
        repeat: -1
      });
    });
  }
}
