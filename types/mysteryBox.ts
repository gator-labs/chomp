export enum EMysteryBoxType {
  Regular = "Regular",
  Tutorial = "Tutorial",
  Chompmas = "Chompmas",
}

export enum MysteryBoxEventsType {
  CLAIM_ALL_COMPLETED = "ClaimAllCompleted",
  DAILY_DECK_COMPLETED = "DailyDeckCompleted",
  CHOMPMAS = "Chompmas",
  TUTORIAL_COMPLETED = "TutorialCompleted",
}

export type MysteryBoxSkipAction = "Skip" | "Dismiss" | "Close";

export interface MysteryBoxProps {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string | null;
  isDismissed: boolean;
  skipAction: MysteryBoxSkipAction;
  boxType?: EMysteryBoxType;
}
