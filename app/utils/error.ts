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

export class AnswerError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "AnswerError";
  }
}

export class ClaimError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ClaimError";
  }
}
