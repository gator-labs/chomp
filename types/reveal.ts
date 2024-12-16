import { Wallet } from "@dynamic-labs/sdk-react-core";
import { NftType } from "@prisma/client";

export interface RevealProps {
  burnTx?: string;
  nftAddress?: string;
  nftType?: NftType;
  revealQuestionIds?: number[];
  pendingChompResults?: { id: number; burnTx: string }[];
}
export type UseRevealProps = {
  wallet: Wallet | null;
  address?: string;
  bonkBalance: number;
};

interface RevealCallbackBaseProps {
  reveal: ({
    burnTx,
    nftAddress,
    nftType,
    revealQuestionIds,
  }: RevealProps) => Promise<void>;
  amount: number;
  dialogLabel?: string;
}

interface RevealCallbackMultipleQuestions extends RevealCallbackBaseProps {
  questionIds: number[];
  questionId?: never;
  questions: string[];
}

interface RevealCallbackSingleQuestion extends RevealCallbackBaseProps {
  questionId: number;
  questionIds?: never;
  questions: string[];
}

export type RevealCallbackProps =
  | RevealCallbackSingleQuestion
  | RevealCallbackMultipleQuestions;

export type RevealState = {
  amount: number;
  reveal: ({ burnTx, nftAddress, nftType }: RevealProps) => Promise<void>;
  questionIds: number[];
  questions: string[];
  genesisNft?: string;
  dialogLabel?: string;
};
