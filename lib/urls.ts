import { encrypt } from "@/app/utils/crypto-js";

export const HOME_PATH = "/application";
export const ADMIN_PATH = "/admin";
export const HISTORY_PATH = `${HOME_PATH}/history`;
export const getDeckPath = (deckId: string | number) =>
  `${HOME_PATH}/decks/${deckId.toString()}`;
export const STACKS_PATH = "/stacks";
export const LEADERBOARD_PATH = `${HOME_PATH}/leaderboard`;
export const ANSWER_PATH = `${HOME_PATH}/answer`;
export const getOgShareClaimAllPath = (txHash: string) =>
  `/api/og/share-claim-all?txHash=${txHash}`;
export const getClaimAllShareUrl = (txHash: string) => {
  const encryptedTxHash = encrypt(txHash);

  return `${process.env.NEXT_PUBLIC_APP_URL}/a/${encryptedTxHash}`;
};
