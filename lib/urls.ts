export const HISTORY_PATH = "/application/history";
export const getDeckPath = (deckId: string | number) =>
  `/application/decks/${deckId.toString()}`;
export const getOgShareClaimAllPath = (burnTx: string) =>
  `/api/og/share-claim-all?burnTx=${burnTx}`;
