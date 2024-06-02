import { TransactionLogType } from "@prisma/client";

export const TRANSACTION_LABEL = {
  [TransactionLogType.AnswerDeck]: "Deck completed",
  [TransactionLogType.RevealAnswer]: "Answer revealed",
  [TransactionLogType.AnswerQuestion]: "Questions answered",
};
