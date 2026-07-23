import { beforeEach, describe, expect, it } from "vitest";
import {
  ACT1_SPAWN_TILE,
  createInitialAct1State
} from "../domain/act1State";
import { reduceAct1 } from "../domain/act1Reducer";
import { SaveService } from "./SaveService";

describe("SaveService", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("round-trips a valid act one save", () => {
    const service = new SaveService(localStorage);
    const state = reduceAct1(createInitialAct1State(), {
      type: "MOVED",
      distanceTiles: 3
    });

    service.save(state);

    expect(service.load()).toEqual(state);
  });

  it("backs up corrupted JSON and returns a fresh save", () => {
    const service = new SaveService(localStorage);
    localStorage.setItem(SaveService.STORAGE_KEY, "{broken");

    const loaded = service.load();

    expect(loaded).toEqual(createInitialAct1State());
    expect(localStorage.getItem(SaveService.CORRUPT_KEY)).toBe("{broken");
  });

  it("rejects saves from an unknown version", () => {
    const service = new SaveService(localStorage);
    localStorage.setItem(
      SaveService.STORAGE_KEY,
      JSON.stringify({ ...createInitialAct1State(), version: 99 })
    );

    expect(service.load()).toEqual(createInitialAct1State());
  });

  it("normalizes JAR_OPENING to the last safe phase", () => {
    const service = new SaveService(localStorage);
    localStorage.setItem(
      SaveService.STORAGE_KEY,
      JSON.stringify({
        ...createInitialAct1State(),
        phase: "JAR_OPENING",
        questId: "act1_open_jar",
        senseChoice: "cold_clay",
        movementLocked: true
      })
    );

    const loaded = service.load();

    expect(loaded.phase).toBe("SENSE_CHOSEN");
    expect(loaded.movementLocked).toBe(false);
    expect(loaded.senseChoice).toBe("cold_clay");
  });

  it("recovers an out-of-bounds player tile to the spawn tile", () => {
    const service = new SaveService(localStorage);
    localStorage.setItem(
      SaveService.STORAGE_KEY,
      JSON.stringify({
        ...createInitialAct1State(),
        playerTile: { x: 999, y: -20 }
      })
    );

    expect(service.load().playerTile).toEqual(ACT1_SPAWN_TILE);
  });
});
