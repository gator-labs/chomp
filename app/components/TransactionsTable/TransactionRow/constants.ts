import { TransactionLogType } from "@prisma/client";

export const TRANSACTION_LABEL = {
  [TransactionLogType.AnswerDeck]: "Deck completed",
  [TransactionLogType.RevealAnswer]: "Answer revealed",
  [TransactionLogType.AnswerQuestion]: "Questions answered",
  [TransactionLogType.AskQuestionAnswered]: "Your question answered",
  [TransactionLogType.AskQuestionAccepted]: "Your question accepted",
  [TransactionLogType.CorrectFirstOrder]: "First question answered correctly",
  [TransactionLogType.CorrectSecondOrder]: "Second question answered correctly",
  [TransactionLogType.ConnectTelegram]: "Connected telegram",
  [TransactionLogType.ConnectX]: "Connected X",
};
