export const HOME_PATH = "/application";
export const ADMIN_PATH = "/admin";
export const HISTORY_PATH = `${HOME_PATH}/history`;
export const getDeckPath = (deckId: string | number) =>
  `${HOME_PATH}/decks/${deckId.toString()}`;
export const STACKS_PATH = "/stacks";
export const LEADERBOARD_PATH = `${HOME_PATH}/leaderboard`;
export const ANSWER_PATH = `${HOME_PATH}/answer`;
export const getOgShareClaimAllPath = (startOfTxHash: string) =>
  `/api/og/share-claim-all?startOfTxHash=${startOfTxHash}`;
export const getClaimAllShareUrl = (startOfTxHash: string) => {
  return `${window.location.origin}/a/${startOfTxHash}`;
};
