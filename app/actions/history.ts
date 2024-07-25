"use server";

import { getDecksHistory } from "../queries/history";
import { getJwtPayload } from "./jwt";

export const getHistoryDecks = async () => {
  const payload = await getJwtPayload();

  if (!payload?.sub) {
    return [];
  }

  return getDecksHistory(payload.sub);
};
