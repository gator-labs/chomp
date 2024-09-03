export const MIX_PANEL_EVENTS = {
  WALLET_CONNECTED: "WalletConnected",
  QUESTION_ANSWER_REVEALED: "QuestionAnswerRevealed",
  CLAIM_STARTED: "ClaimStarted",
  CLAIM_FAILED: "ClaimFailed",
  CLAIM_SUCCEEDED: "ClaimSucceeded",
} as const;

export const MIX_PANEL_METADATA = {
  REVEAL_TYPE: "RevealType",
  USER_WALLET_ADDRESS: "UserWalletAddress",
  USER_EMAIL: "UserEmail",
  USERNAME: "Username",
  USER_ID: "UserId",
  QUESTION_ID: "QuestionId",
  QUESTION_TEXT: "QuestionText",
  TRANSACTION_SIGNATURE: "TransactionSignature",
  CLAIMED_AMOUNT: "ClaimedAmount",
};

export const REVEAL_TYPE = {
  SINGLE: "Single",
  ALL: "All",
};

export type MixPanelEventType = keyof typeof MIX_PANEL_EVENTS;
