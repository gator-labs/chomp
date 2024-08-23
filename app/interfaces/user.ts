interface EmailOrWallet {
  address: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// enum AnswerStatus {
//   Viewed,
//   Submitted,
// }

interface QuestionAnswer {
  id: number;
  questionOptionId: number;
  userId: string;
  percentage: number | null;
  // status: AnswerStatus;
  selected: boolean;
  timeToAnswer: bigint | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChompUser {
  id: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  telegramId: string | null;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileSrc: string | null;
  tutorialCompletedAt: Date | null;
  emails: EmailOrWallet[];
  wallets: EmailOrWallet[];
  questionAnswers: QuestionAnswer[];
}

export interface IChompUserResponse {
  profile: IChompUser;
}
