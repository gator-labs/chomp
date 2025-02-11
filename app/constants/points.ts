import { TransactionLogType } from "@prisma/client";

export const pointsPerAction = {
  [TransactionLogType.RevealAnswer]: 42,
  [TransactionLogType.CorrectFirstOrder]: 6.9,
  [TransactionLogType.CorrectSecondOrder]: 15,
  [TransactionLogType.AnswerDeck]: 20,
  [TransactionLogType.AnswerQuestion]: 10,
  [TransactionLogType.AnswerPaidQuestion]: 42,
  [TransactionLogType.ConnectX]: 20,
  [TransactionLogType.ConnectTelegram]: 20,
};
