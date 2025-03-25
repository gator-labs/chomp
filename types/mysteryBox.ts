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
  WEEK_1_Campaign = "Bis1",
}

export type MysteryBoxSkipAction = "Skip" | "Dismiss" | "Close";

export type MysteryBoxStatus = "Idle" | "Opening" | "Closing";

export interface MysteryBoxProps {
  isOpen: boolean;
  closeBoxDialog: () => void;
  mysteryBoxId: string | null;
  isDismissed: boolean;
  skipAction: MysteryBoxSkipAction;
  boxType?: EMysteryBoxType;
}

export type MysteryBoxDeckBreakdown = {
  id: number;
  name: string;
  creditsReceived: number;
  bonkReceived: number;
  revealedOn: string | null;
};

export type MysteryBox = {
  id: string;
  bonkReceived: string;
  creditsReceived: string;
  openedAt: string | null;
  category: EMysteryBoxCategory;
  deckBreakdown?: MysteryBoxDeckBreakdown[];
};
