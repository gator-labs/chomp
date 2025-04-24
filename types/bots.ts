export enum EThreatLevelType {
  // User marked as bot by automated process;
  // Not allowed to access the app.
  Bot = "bot",

  // User is an ATA exploiter and banned from app
  AtaExploiter = "ata-exploiter",

  // User previously marked as a bot who is
  // now pardoned but will be blocked again
  // by the bot checker if they misbehave.
  ManualAllow = "manual-allow",

  // As above, but block is for engineering
  // reasons
  EngAllow = "eng-allow",

  // User who has been blocked manually
  ManualBlock = "manual-block",

  // As above, but block is for engineering
  // reasons; a different error will be shown
  // to users so that complaints are easier to
  // triage.
  EngBlock = "eng-block",

  // User who is allowed to access the app
  // and won't be blocked by the bot checker.
  PermanentAllow = "permanent-allow",
}

export enum EThreatLevelAction {
  // User sees 204
  Unavailable = "unavailable",
  // User sees 403
  Forbidden = "forbidden",
}
