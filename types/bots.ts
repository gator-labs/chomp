export enum EThreatLevelType {
  // User marked as bot by automated process;
  // Not allowed to access the app.
  Bot = "bot",

  // User previously marked as a bot who is
  // now pardoned but will be blocked again
  // by the bot checker if they misbehave.
  ManualAllow = "manual-allow",

  // User who has been blocked manually
  ManualBlock = "manual-block",

  // User who is allowed to access the app
  // and won't be blocked by the bot checker.
  PermanentAllow = "permanent-allow",
}
