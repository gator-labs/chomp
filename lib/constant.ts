// CONSTANT VALUES

export const getTreasuryPublicKey = () => {
  if (!process.env.NEXT_PUBLIC_TREASURY_PUBLIC_ADDRESS) {
    return null;
  }
  return process.env.NEXT_PUBLIC_TREASURY_PUBLIC_ADDRESS;
};
