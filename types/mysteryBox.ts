export enum EMysteryBoxType {
  Regular = "Regular",
  Tutorial = "Tutorial",
  Chompmas = "Chompmas",
}

export enum EMysteryBoxCategory {
  Streaks = "Streaks",
  Validation = "Validation",
  Practice = "Practice",
  Campaign = "Campaign",
}

export enum MysteryBoxEventsType {
  CLAIM_ALL_COMPLETED = "ClaimAllCompleted",
  DAILY_DECK_COMPLETED = "DailyDeckCompleted",
  CHOMPMAS = "Chompmas",
  TUTORIAL_COMPLETED = "TutorialCompleted",
  REVEAL_ALL_COMPLETED = "RevealAllCompleted",
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

export type MysteryBox = {
  id: string;
  bonkReceived: string;
  creditsReceived: string;
  openedAt: string | null;
  category: EMysteryBoxCategory;
};
