export const MIX_PANEL_EVENTS = {
  WALLET_CONNECTED: "LoginWalletConnected",
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
  LOGIN_STARTED: "LoginStarted",
  Login_Wallet_Selected: "LoginWalletSelected",
  Login_Email_Submitted: "LoginEmailSubmitted",
  LOGIN_FAILED: "LoginFailed",
  LOGIN_SUCCEED: "LoginSucceed",
  DECK_STARTED: "DeckStarted",
  QUESTION_LOADED: "QuestionLoaded",
  FIRST_ORDER_SELECTED: "QuestionFirstOrderAnswerSelected",
  SECOND_ORDER_SELECTED: "QuestionSecondOrderAnswerSelected",
  QUESTION_ANSWERED_SUCCEEDED: "QuestionAnsweredSucceeded",
  QUESTION_ANSWERED_FAILED: "QuestionAnsweredFailed",
  DECK_COMPLETED: "DeckCompletionSucceeded",
} as const;

export const MIX_PANEL_METADATA = {
  REVEAL_TYPE: "RevealType",
  USER_WALLET_ADDRESS: "UserWalletAddress",
  USER_EMAIL: "UserEmail",
  USERNAME: "Username",
  USER_ID: "UserId",
  QUESTION_ID: "QuestionId",
  QUESTION_TEXT: "QuestionText",
  QUESTION_ANSWER_OPTIONS: "QuestionAnswerOptions",
  QUESTION_ANSWER_SELECTED: "QuestionAnswerSelected",
  QUESTION_ANSWER_SELECTED_PERCENTAGE: "QuestionAnswerSelectedPercentage",
  QUESTION_HAS_IMAGE: "QuestionHasImage",
  TRANSACTION_SIGNATURE: "TransactionSignature",
  CLAIMED_AMOUNT: "ClaimedAmount",
  REVEAL_DIALOG_TYPE: "RevealDialogType",
  LOGIN_FAILED_REASON: "LoginFailed",
  CONNECTOR_NAME: "ConnectorName",
  DECK_ID: "DeckId",
  DECK_NAME: "DeckName",
  IS_DAILY_DECK: "IsDailyDeck",
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
