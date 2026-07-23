import type { Act1Phase } from "../domain/act1State";

const QUEST_BY_PHASE: Record<Act1Phase, string> = {
  ARRIVE: "act1_move",
  EXPLORE: "act1_find_box",
  NOTE_ACQUIRED: "act1_read_note",
  NOTE_READ: "act1_find_jar",
  MIA_ENTERED: "act1_find_jar",
  JAR_INSPECTED: "act1_choose_sense",
  SENSE_CHOSEN: "act1_open_jar",
  JAR_OPENING: "act1_open_jar",
  COMPLETE: "act1_complete"
};

export class QuestSystem {
  forPhase(phase: Act1Phase): string {
    return QUEST_BY_PHASE[phase];
  }
}

export const questSystem = new QuestSystem();
