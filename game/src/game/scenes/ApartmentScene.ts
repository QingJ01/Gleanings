import Phaser from "phaser";
import { act1Content } from "../../content/act1/content";
import { reduceAct1 } from "../domain/act1Reducer";
import type { Act1State, TilePosition } from "../domain/act1State";
import { Player, type MovementKeys } from "../entities/Player";
import { buildApartmentGeometry, tileToPixelCenter } from "../render/ApartmentRenderer";
import { SaveService } from "../systems/SaveService";

function sameTile(a: TilePosition, b: TilePosition): boolean {
  return a.x === b.x && a.y === b.y;
}

function phaseAtLeastMia(phase: Act1State["phase"]): boolean {
  return [
    "MIA_ENTERED",
    "JAR_INSPECTED",
    "SENSE_CHOSEN",
    "JAR_OPENING",
    "COMPLETE"
  ].includes(phase);
}

export class ApartmentScene extends Phaser.Scene {
  private player!: Player;
  private movementKeys!: MovementKeys;
  private state!: Act1State;
  private lastTile!: TilePosition;
  private readonly saveService = new SaveService(window.localStorage);

  constructor() {
    super("Apartment");
  }

  create(): void {
    const geometry = buildApartmentGeometry(
      act1Content.map,
      act1Content.interactables
    );
    this.state = this.saveService.load();
    this.physics.world.setBounds(0, 0, geometry.width, geometry.height);

    this.add.image(0, 0, "map-apartment").setOrigin(0).setDepth(0);
    this.createInteractionObjects();

    const spawn = tileToPixelCenter(
      this.state.playerTile,
      act1Content.map.tileSize
    );
    this.player = new Player(this, spawn.x, spawn.y);
    this.lastTile = { ...this.state.playerTile };

    for (const collision of geometry.collisions) {
      const zone = this.add.zone(
        collision.x + collision.width / 2,
        collision.y + collision.height / 2,
        collision.width,
        collision.height
      );
      this.physics.add.existing(zone, true);
      this.physics.add.collider(this.player, zone);
    }

    this.createMiaIfNeeded();
    this.configureInput();
    this.cameras.main
      .setBounds(0, 0, geometry.width, 17 * act1Content.map.tileSize)
      .startFollow(this.player, true, 1, 1);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setDeadzone(96, 64);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.saveService.save(this.state);
    });
  }

  update(): void {
    const moved = this.player.updateMovement(
      this.movementKeys,
      this.state.movementLocked
    );
    this.player.setDepth(Math.round(this.player.y));

    if (moved) {
      this.trackPlayerTile();
    }
  }

  private createInteractionObjects(): void {
    const boxPixel = tileToPixelCenter(
      { x: 6, y: 13 },
      act1Content.map.tileSize
    );
    this.add
      .image(boxPixel.x, boxPixel.y, "obj-box")
      .setName("obj_cardboard_box")
      .setDepth(boxPixel.y);

    const jarPixel = tileToPixelCenter(
      { x: 25, y: 8 },
      act1Content.map.tileSize
    );
    const texture =
      this.state?.phase === "COMPLETE" ? "obj-jar-open" : "obj-jar-sealed";
    this.add
      .image(jarPixel.x, jarPixel.y + 16, texture)
      .setOrigin(0.5, 1)
      .setName("obj_laojiu_jar")
      .setDepth(jarPixel.y);
  }

  private createMiaIfNeeded(): void {
    if (!phaseAtLeastMia(this.state.phase)) return;
    const spawn = tileToPixelCenter(
      act1Content.map.miaSpawn,
      act1Content.map.tileSize
    );
    this.add
      .sprite(spawn.x, spawn.y, "actor-mia", 4)
      .setOrigin(0.5, 0.78)
      .setName("actor_mia")
      .setDepth(spawn.y);
  }

  private configureInput(): void {
    const keyboard = this.input.keyboard;
    if (keyboard === null) {
      throw new Error("Keyboard input is unavailable");
    }
    const cursors = keyboard.createCursorKeys();
    const wasd = keyboard.addKeys("W,A,S,D") as Record<
      "W" | "A" | "S" | "D",
      Phaser.Input.Keyboard.Key
    >;
    this.movementKeys = {
      up: {
        get isDown() {
          return cursors.up.isDown || wasd.W.isDown;
        }
      },
      down: {
        get isDown() {
          return cursors.down.isDown || wasd.S.isDown;
        }
      },
      left: {
        get isDown() {
          return cursors.left.isDown || wasd.A.isDown;
        }
      },
      right: {
        get isDown() {
          return cursors.right.isDown || wasd.D.isDown;
        }
      }
    };
  }

  private trackPlayerTile(): void {
    const tile = {
      x: Math.floor(this.player.x / act1Content.map.tileSize),
      y: Math.floor(this.player.y / act1Content.map.tileSize)
    };
    if (sameTile(tile, this.lastTile)) return;

    const distance =
      Math.abs(tile.x - this.lastTile.x) + Math.abs(tile.y - this.lastTile.y);
    this.state = reduceAct1(this.state, {
      type: "MOVED",
      distanceTiles: distance
    });
    this.state = reduceAct1(this.state, {
      type: "SET_PLAYER_TILE",
      tile
    });
    this.lastTile = tile;
  }
}
