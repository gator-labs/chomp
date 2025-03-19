/**
 * Custom errors classes for the app
 */

export class LoginError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "LoginError";
  }
}

export class BurnError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "BurnError";
  }
}

export class RevealError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RevealError";
  }
}

export class DynamicRevealError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DynamicRevealError";
  }
}

export class AnswerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnswerError";
  }
}

export class RevealConfirmationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RevealConfirmationError";
  }
}

export class ClaimError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaimError";
  }
}

export class OpenMysteryBoxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OpenMysteryBoxError";
  }
}

export class OpenMysteryBoxHubError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "OpenMysteryBoxHubError";
  }
}
export class SendBonkError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SendBonkError";
  }
}
export class CreateMysteryBoxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CreateMysteryBoxError";
  }
}

export class RevealMysteryBoxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RevealMysteryBoxError";
  }
}

export class FindMysteryBoxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FindMysteryBoxError";
  }
}

export class DismissMysteryBoxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DismissMysteryBoxError";
  }
}

export class ShareClaimAllError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ShareClaimAllError";
  }
}

export class UserAllowlistError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UserAllowlistError";
  }
}

export class InvalidBurnTxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "InvalidBurnTxError";
  }
}

export class QuestionMultiDecksError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "QuestionMultiDecksError";
  }
}

export class ChainTxStatusUpdateError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ChainTxStatusUpdateError";
  }
}

export class CreateChainTxError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CreateChainTxError";
  }
}

export class TransactionFailedToConfirmError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransactionFailedToConfirmError";
  }
}

export class TransactionFailedError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "TransactionFailedError";
  }
}

export class VerifyPaymentError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "VerifyPaymentError";
  }
}

export class CreditTransactionValidationError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "CreditTransactionValidationError";
  }
}

export class SendTransactionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SendTransactionError";
  }
}

export class UserThreatLevelDetected extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UserThreatLevelDetected";
  }
}

export class DynamicRevokeSessionError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "DynamicRevokeSessionError";
  }
}

export class InsufficientCreditsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export class BonkRateLimitExceedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BonkRateLimitExceedError";
  }
}
