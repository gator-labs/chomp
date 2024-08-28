export const MIX_PANEL_EVENTS = {
  WALLET_CONNECTED: "WalletConnected",
  QUESTION_ANSWER_REVEALED: "QuestionAnswerRevealed",
  QUESTION_REWARD_CLAIMED: "QuestionRewardClaimed",
} as const;

export type MixPanelEventType = keyof typeof MIX_PANEL_EVENTS;
