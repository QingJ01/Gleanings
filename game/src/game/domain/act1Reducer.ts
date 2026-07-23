import {
  ACT1_NOTE_ID,
  type Act1State,
  type SenseChoice,
  type TilePosition
} from "./act1State";
import { InventorySystem } from "../systems/InventorySystem";
import { questSystem } from "../systems/QuestSystem";

export type Act1Event =
  | { type: "MOVED"; distanceTiles: number }
  | { type: "INSPECT_OBJECT"; objectId: string }
  | { type: "ACQUIRE_NOTE" }
  | { type: "READ_NOTE" }
  | { type: "MIA_ENTERED" }
  | { type: "INSPECT_JAR" }
  | { type: "CHOOSE_SENSE"; choice: SenseChoice }
  | { type: "START_OPEN_JAR" }
  | { type: "COMPLETE" }
  | { type: "SET_PLAYER_TILE"; tile: TilePosition };

function moveToPhase(
  state: Act1State,
  phase: Act1State["phase"],
  changes: Partial<Act1State> = {}
): Act1State {
  return {
    ...state,
    ...changes,
    phase,
    questId: questSystem.forPhase(phase)
  };
}

export function reduceAct1(
  state: Act1State,
  event: Act1Event
): Act1State {
  switch (event.type) {
    case "MOVED": {
      if (state.movementLocked || event.distanceTiles <= 0) {
        return state;
      }

      const movedTiles = state.movedTiles + event.distanceTiles;
      if (state.phase === "ARRIVE" && movedTiles >= 3) {
        return moveToPhase(state, "EXPLORE", { movedTiles });
      }
      return { ...state, movedTiles };
    }

    case "INSPECT_OBJECT": {
      if (state.inspectedObjects.includes(event.objectId)) {
        return state;
      }
      return {
        ...state,
        inspectedObjects: [...state.inspectedObjects, event.objectId]
      };
    }

    case "ACQUIRE_NOTE": {
      if (state.phase !== "EXPLORE" && state.phase !== "NOTE_ACQUIRED") {
        return state;
      }
      const inventory = new InventorySystem(state.inventory);
      inventory.add(ACT1_NOTE_ID);
      if (
        state.phase === "NOTE_ACQUIRED" &&
        state.inventory.includes(ACT1_NOTE_ID)
      ) {
        return state;
      }
      return moveToPhase(state, "NOTE_ACQUIRED", {
        inventory: inventory.items()
      });
    }

    case "READ_NOTE": {
      if (
        state.phase !== "NOTE_ACQUIRED" ||
        !state.inventory.includes(ACT1_NOTE_ID)
      ) {
        return state;
      }
      return moveToPhase(state, "NOTE_READ");
    }

    case "MIA_ENTERED":
      return state.phase === "NOTE_READ"
        ? moveToPhase(state, "MIA_ENTERED")
        : state;

    case "INSPECT_JAR":
      return state.phase === "NOTE_READ" || state.phase === "MIA_ENTERED"
        ? moveToPhase(state, "JAR_INSPECTED")
        : state;

    case "CHOOSE_SENSE":
      return state.phase === "JAR_INSPECTED"
        ? moveToPhase(state, "SENSE_CHOSEN", {
            senseChoice: event.choice
          })
        : state;

    case "START_OPEN_JAR":
      return state.phase === "SENSE_CHOSEN"
        ? moveToPhase(state, "JAR_OPENING", {
            movementLocked: true
          })
        : state;

    case "COMPLETE":
      return state.phase === "JAR_OPENING"
        ? moveToPhase(state, "COMPLETE", {
            movementLocked: true,
            act1Complete: true
          })
        : state;

    case "SET_PLAYER_TILE":
      return {
        ...state,
        playerTile: {
          x: Math.round(event.tile.x),
          y: Math.round(event.tile.y)
        }
      };
  }
}
