export const MIX_PANEL_EVENTS = {
  WALLET_CONNECTED: "WalletConnected",
  CLAIM_STARTED: "ClaimStarted",
  CLAIM_FAILED: "ClaimFailed",
  CLAIM_SUCCEEDED: "ClaimSucceeded",
  REVEAL_SUCCEEDED: "RevealSucceeded",
  REVEAL_DIALOG_CLOSED: "RevealDialogClosed",
  REVEAL_DIALOG_OPENED: "RevealDialogOpened",
  REVEAL_DIALOG_LOADED: "RevealDialogLoaded",
  REVEAL_STARTED: "RevealStarted",
  REVEAL_TRANSACTION_SIGNED: "RevealTransactionSigned",
  REVEAL_TRANSACTION_CANCELLED: "RevealTransactionCancelled",
  REVEAL_FAILED: "RevealFailed",
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
  REVEAL_DIALOG_TYPE: "RevealDialogType",
};

export const REVEAL_TYPE = {
  SINGLE: "Single",
  ALL: "All",
};

export const REVEAL_DIALOG_TYPE = {
  REVEAL_OR_CLOSE: "RevealOrClose",
  INSUFFICIENT_FUNDS: "InsufficientFunds",
};

export type MixPanelEventType = keyof typeof MIX_PANEL_EVENTS;
