import { EBoxPrizeType, EPrizeSize } from "@prisma/client";
import "server-only";

import { getBonkAddress } from "../env-vars";

export const getPrizePerTrigger = (reward: {
  creditRewardAmount: number;
  bonkRewardAmount: number;
}) => {
  const tokenAddress = getBonkAddress();
  return [
    {
      prizeType: EBoxPrizeType.Credits,
      size: EPrizeSize.Hub,
      amount: reward.creditRewardAmount.toString(),
    },
    {
      prizeType: EBoxPrizeType.Token,
      amount: reward.bonkRewardAmount.toString(),
      size: EPrizeSize.Hub,
      tokenAddress: tokenAddress, // Add the bonk address here
    },
  ];
};
