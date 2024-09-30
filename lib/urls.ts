export const HOME_PATH = "/application";
export const HISTORY_PATH = `${HOME_PATH}/history`;
export const getDeckPath = (deckId: string | number) =>
  `${HOME_PATH}/decks/${deckId.toString()}`;
export const getOgShareClaimAllPath = (burnTx: string) =>
  `/api/og/share-claim-all?burnTx=${burnTx}`;
