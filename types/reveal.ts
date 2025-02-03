import { Wallet } from "@dynamic-labs/sdk-react-core";

export interface RevealProps {
  burnTx?: string;
  revealQuestionIds?: number[];
  pendingChompResults?: { id: number; burnTx: string }[];
}
export type UseRevealProps = {
  wallet: Wallet | null;
  address?: string;
  bonkBalance: number;
  solBalance: number;
};

interface RevealCallbackBaseProps {
  reveal: ({ burnTx, revealQuestionIds }: RevealProps) => Promise<void>;
  amount: number;
  dialogLabel?: string;
}

interface RevealCallbackMultipleQuestions extends RevealCallbackBaseProps {
  questionIds: number[];
  questionId?: never;
  questions: string[];
  isRevealAll: boolean;
}

interface RevealCallbackSingleQuestion extends RevealCallbackBaseProps {
  questionId: number;
  questionIds?: never;
  questions: string[];
  isRevealAll: boolean;
}

export type RevealCallbackProps =
  | RevealCallbackSingleQuestion
  | RevealCallbackMultipleQuestions;

export type RevealState = {
  amount: number;
  reveal: ({ burnTx }: RevealProps) => Promise<void>;
  questionIds: number[];
  questions: string[];
  dialogLabel?: string;
  isRevealAll: boolean;
};
