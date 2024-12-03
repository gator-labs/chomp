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
