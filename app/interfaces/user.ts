interface EmailOrWallet {
  address: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface QuestionAnswer {
  id: string;
  questionOptionId: number;
  userId: string;
  percentage: number;
  hasViewedButNotSubmitted: boolean | null;
  selected: boolean;
  timeToAnswer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IChompUser {
  id: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  telegramId: string;
  firstName: string | null;
  lastName: string | null;
  username: string | null;
  profileSrc: string | null;
  tutorialCompletedAt: string | null;
  emails: EmailOrWallet[];
  wallets: EmailOrWallet[];
  questionAnswers: QuestionAnswer[] | [];
}

export interface IChompUserResponse {
  profile: IChompUser;
}
