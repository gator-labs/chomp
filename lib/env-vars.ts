import "server-only";

export const getTreasuryPrivateKey = () => {
  if (!process.env.CHOMP_TREASURY_PRIVATE_KEY) {
    return null;
  }

  return process.env.CHOMP_TREASURY_PRIVATE_KEY;
};
