export type MysteryBoxOpenMessageConfig = {
  subText: string[];
};

export type MysteryBoxOpenImage = "TreasureChest";
export type MysteryBoxOpenMessage = "REGULAR";

export const OPEN_MESSAGES: Record<
  MysteryBoxOpenMessage,
  MysteryBoxOpenMessageConfig
> = {
  REGULAR: {
    subText: ["You earned a mystery box!", "Open it to receive your rewards."],
  },
} as const;
