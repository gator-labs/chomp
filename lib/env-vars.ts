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
