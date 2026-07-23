export const ACT1_NOTE_ID = "item_taipo_note";
export const ACT1_SPAWN_TILE = Object.freeze({ x: 14, y: 15 });

export type TilePosition = {
  x: number;
  y: number;
};

export type SenseChoice = "aroma" | "hongqu_red" | "cold_clay";

export type Act1Phase =
  | "ARRIVE"
  | "EXPLORE"
  | "NOTE_ACQUIRED"
  | "NOTE_READ"
  | "MIA_ENTERED"
  | "JAR_INSPECTED"
  | "SENSE_CHOSEN"
  | "JAR_OPENING"
  | "COMPLETE";

export type Act1State = {
  version: 1;
  phase: Act1Phase;
  questId: string;
  inventory: string[];
  inspectedObjects: string[];
  senseChoice: SenseChoice | null;
  playerTile: TilePosition;
  movementLocked: boolean;
  act1Complete: boolean;
  movedTiles: number;
};

export function createInitialAct1State(): Act1State {
  return {
    version: 1,
    phase: "ARRIVE",
    questId: "act1_move",
    inventory: [],
    inspectedObjects: [],
    senseChoice: null,
    playerTile: { ...ACT1_SPAWN_TILE },
    movementLocked: false,
    act1Complete: false,
    movedTiles: 0
  };
}
