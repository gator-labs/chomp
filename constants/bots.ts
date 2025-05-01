import { EThreatLevelType } from "@/types/bots";

export type BotCodes = { [K in EThreatLevelType]?: number };

export const BOT_STATUS_CODES: BotCodes = {
  [EThreatLevelType.AtaExploiter]: 290,
} as const;
