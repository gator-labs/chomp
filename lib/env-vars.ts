import "server-only";

export const getTreasuryPrivateKey = () => {
  if (!process.env.CHOMP_TREASURY_PRIVATE_KEY) {
    return null;
  }

  return process.env.CHOMP_TREASURY_PRIVATE_KEY;
};

export const getBonkAddress = () => {
  if (!process.env.NEXT_PUBLIC_BONK_ADDRESS) {
    return null;
  }
  return process.env.NEXT_PUBLIC_BONK_ADDRESS;
};

export const getBonkOneTimeLimit = () => {
  if (!process.env.BONK_ONE_TIME_LIMIT) {
    return 3_000_000;
  }
  return Number(process.env.BONK_ONE_TIME_LIMIT);
};

export const getCreditOneTimeLimit = () => {
  if (!process.env.CREDITS_ONE_TIME_LIMIT) {
    return 1000;
  }
  return Number(process.env.CREDITS_ONE_TIME_LIMIT);
};
