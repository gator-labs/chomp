import { Decimal } from "@prisma/client/runtime/library";

export interface IClaimedQuestion {
  id: number;
  userId: string;
  questionId: number | null;
  burnTransactionSignature: string | null;
  sendTransactionSignature: string | null;
  rewardTokenAmount: Decimal | null;
  result: string;
  createdAt: Date;
  updatedAt: Date;
  transactionStatus: string;
}
