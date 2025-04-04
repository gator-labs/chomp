import { MAX_DECIMALS } from "@/constants/tokens";
import { EBoxPrizeType, EPrizeSize } from "@prisma/client";
import Decimal from "decimal.js";
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
      amount: new Decimal(reward.bonkRewardAmount)
        .toDP(MAX_DECIMALS.BONK, Decimal.ROUND_DOWN)
        .toString(),
      size: EPrizeSize.Hub,
      tokenAddress: tokenAddress, // Add the bonk address here
    },
  ];
};
