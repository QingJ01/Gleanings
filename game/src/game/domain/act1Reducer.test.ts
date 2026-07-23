import { describe, expect, it } from "vitest";
import {
  ACT1_NOTE_ID,
  createInitialAct1State
} from "./act1State";
import { reduceAct1 } from "./act1Reducer";
import { InventorySystem } from "../systems/InventorySystem";
import { QuestSystem } from "../systems/QuestSystem";

describe("act one progression", () => {
  it("starts at ARRIVE with the movement tutorial", () => {
    const state = createInitialAct1State();

    expect(state.phase).toBe("ARRIVE");
    expect(state.questId).toBe("act1_move");
    expect(state.playerTile).toEqual({ x: 14, y: 15 });
  });

  it("advances to exploration after moving three tiles", () => {
    const first = reduceAct1(createInitialAct1State(), {
      type: "MOVED",
      distanceTiles: 2
    });
    const second = reduceAct1(first, {
      type: "MOVED",
      distanceTiles: 1
    });

    expect(first.phase).toBe("ARRIVE");
    expect(second.phase).toBe("EXPLORE");
    expect(second.questId).toBe("act1_find_box");
  });

  it("adds the note exactly once when the box is opened", () => {
    const exploring = reduceAct1(createInitialAct1State(), {
      type: "MOVED",
      distanceTiles: 3
    });

    const acquired = reduceAct1(exploring, { type: "ACQUIRE_NOTE" });
    const repeated = reduceAct1(acquired, { type: "ACQUIRE_NOTE" });

    expect(acquired.phase).toBe("NOTE_ACQUIRED");
    expect(repeated.inventory).toEqual([ACT1_NOTE_ID]);
    expect(repeated.questId).toBe("act1_read_note");
  });

  it("does not read a note that is absent from the inventory", () => {
    const exploring = reduceAct1(createInitialAct1State(), {
      type: "MOVED",
      distanceTiles: 3
    });

    const result = reduceAct1(exploring, { type: "READ_NOTE" });

    expect(result.phase).toBe("EXPLORE");
    expect(result.questId).toBe("act1_find_box");
  });

  it("blocks jar progression before the note is read", () => {
    const exploring = reduceAct1(createInitialAct1State(), {
      type: "MOVED",
      distanceTiles: 3
    });

    const result = reduceAct1(exploring, { type: "INSPECT_JAR" });

    expect(result.phase).toBe("EXPLORE");
    expect(result.senseChoice).toBeNull();
  });

  it.each(["aroma", "hongqu_red", "cold_clay"] as const)(
    "records the %s sensory choice",
    (choice) => {
      let state = reduceAct1(createInitialAct1State(), {
        type: "MOVED",
        distanceTiles: 3
      });
      state = reduceAct1(state, { type: "ACQUIRE_NOTE" });
      state = reduceAct1(state, { type: "READ_NOTE" });
      state = reduceAct1(state, { type: "MIA_ENTERED" });
      state = reduceAct1(state, { type: "INSPECT_JAR" });

      state = reduceAct1(state, { type: "CHOOSE_SENSE", choice });

      expect(state.phase).toBe("SENSE_CHOSEN");
      expect(state.senseChoice).toBe(choice);
      expect(state.questId).toBe("act1_open_jar");
    }
  );

  it("makes opening and completion idempotent", () => {
    let state = createInitialAct1State();
    state = reduceAct1(state, { type: "MOVED", distanceTiles: 3 });
    state = reduceAct1(state, { type: "ACQUIRE_NOTE" });
    state = reduceAct1(state, { type: "READ_NOTE" });
    state = reduceAct1(state, { type: "MIA_ENTERED" });
    state = reduceAct1(state, { type: "INSPECT_JAR" });
    state = reduceAct1(state, {
      type: "CHOOSE_SENSE",
      choice: "aroma"
    });

    const opening = reduceAct1(state, { type: "START_OPEN_JAR" });
    const repeatedOpening = reduceAct1(opening, {
      type: "START_OPEN_JAR"
    });
    const complete = reduceAct1(repeatedOpening, { type: "COMPLETE" });
    const repeatedComplete = reduceAct1(complete, { type: "COMPLETE" });

    expect(repeatedOpening).toEqual(opening);
    expect(repeatedComplete).toEqual(complete);
    expect(complete.phase).toBe("COMPLETE");
    expect(complete.act1Complete).toBe(true);
  });
});

describe("act one support systems", () => {
  it("keeps inventory entries unique", () => {
    const inventory = new InventorySystem([]);

    inventory.add(ACT1_NOTE_ID);
    inventory.add(ACT1_NOTE_ID);

    expect(inventory.items()).toEqual([ACT1_NOTE_ID]);
    expect(inventory.has(ACT1_NOTE_ID)).toBe(true);
  });

  it("maps progression phases to the approved quest", () => {
    const quests = new QuestSystem();

    expect(quests.forPhase("ARRIVE")).toBe("act1_move");
    expect(quests.forPhase("NOTE_ACQUIRED")).toBe("act1_read_note");
    expect(quests.forPhase("SENSE_CHOSEN")).toBe("act1_open_jar");
  });
});
