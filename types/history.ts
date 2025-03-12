export type DeckHistoryItem = {
  id: number;
  deck: string;
  imageUrl: string | null;
  revealAtDate: Date;
  total_reward_amount: number;
  total_credit_cost: number;
};
