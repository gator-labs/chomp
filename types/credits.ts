import { EChainTxStatus, EChainTxType } from "@prisma/client";

export type VerificationResult = {
  success: boolean;
  wallet?: string;
  error?: string;
};

export type TransactionProcessingResult = {
  success: boolean;
  error?: string;
};

export type ChainTxResult = {
  hash: string;
  wallet: string;
  type: EChainTxType;
  solAmount: string;
  feeSolAmount: string | null;
  recipientAddress: string;
  status: EChainTxStatus;
  createdAt: Date;
  finalizedAt: Date | null;
  failedAt: Date | null;
};
