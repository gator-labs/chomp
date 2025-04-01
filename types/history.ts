export type DeckHistoryItem = {
  id: number;
  deck: string;
  imageUrl: string | null;
  revealAtDate: Date;
  total_reward_amount: number | null; // null if mystery box not opened
  total_potential_reward_amount: number;
  total_credit_cost: number;
  total_count: number;
};
