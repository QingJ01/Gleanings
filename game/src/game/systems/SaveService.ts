import {
  ACT1_SPAWN_TILE,
  createInitialAct1State,
  type Act1Phase,
  type Act1State,
  type SenseChoice
} from "../domain/act1State";
import { questSystem } from "./QuestSystem";

const VALID_PHASES: Act1Phase[] = [
  "ARRIVE",
  "EXPLORE",
  "NOTE_ACQUIRED",
  "NOTE_READ",
  "MIA_ENTERED",
  "JAR_INSPECTED",
  "SENSE_CHOSEN",
  "JAR_OPENING",
  "COMPLETE"
];

const VALID_CHOICES: SenseChoice[] = [
  "aroma",
  "hongqu_red",
  "cold_clay"
];

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function validTile(value: unknown): Act1State["playerTile"] {
  if (!isRecord(value)) {
    return { ...ACT1_SPAWN_TILE };
  }
  const x = value.x;
  const y = value.y;
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    !Number.isInteger(x) ||
    !Number.isInteger(y) ||
    x < 0 ||
    x >= 30 ||
    y < 0 ||
    y >= 20
  ) {
    return { ...ACT1_SPAWN_TILE };
  }
  return { x, y };
}

export class SaveService {
  static readonly STORAGE_KEY = "gleanings.act1.save.v1";
  static readonly CORRUPT_KEY = "gleanings.act1.corrupt";

  constructor(private readonly storage: StorageLike) {}

  save(state: Act1State): void {
    this.storage.setItem(SaveService.STORAGE_KEY, JSON.stringify(state));
  }

  load(): Act1State {
    const raw = this.storage.getItem(SaveService.STORAGE_KEY);
    if (raw === null) {
      return createInitialAct1State();
    }

    try {
      const parsed: unknown = JSON.parse(raw);
      const normalized = this.normalize(parsed);
      if (normalized === null) {
        this.backUpCorrupt(raw);
        return createInitialAct1State();
      }
      return normalized;
    } catch {
      this.backUpCorrupt(raw);
      return createInitialAct1State();
    }
  }

  clear(): void {
    this.storage.removeItem(SaveService.STORAGE_KEY);
  }

  private backUpCorrupt(raw: string): void {
    this.storage.setItem(SaveService.CORRUPT_KEY, raw);
  }

  private normalize(value: unknown): Act1State | null {
    if (!isRecord(value) || value.version !== 1) {
      return null;
    }

    const rawPhase = value.phase;
    if (
      typeof rawPhase !== "string" ||
      !VALID_PHASES.includes(rawPhase as Act1Phase)
    ) {
      return null;
    }

    let phase = rawPhase as Act1Phase;
    const rawChoice = value.senseChoice;
    const senseChoice =
      typeof rawChoice === "string" &&
      VALID_CHOICES.includes(rawChoice as SenseChoice)
        ? (rawChoice as SenseChoice)
        : null;

    if (phase === "JAR_OPENING") {
      phase = senseChoice === null ? "JAR_INSPECTED" : "SENSE_CHOSEN";
    }

    return {
      version: 1,
      phase,
      questId: questSystem.forPhase(phase),
      inventory: stringArray(value.inventory),
      inspectedObjects: stringArray(value.inspectedObjects),
      senseChoice,
      playerTile: validTile(value.playerTile),
      movementLocked: phase === "COMPLETE",
      act1Complete: phase === "COMPLETE" || value.act1Complete === true,
      movedTiles:
        typeof value.movedTiles === "number" && value.movedTiles >= 0
          ? value.movedTiles
          : 0
    };
  }
}
