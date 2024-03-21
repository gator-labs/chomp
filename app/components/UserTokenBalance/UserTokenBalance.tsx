import { getUserTokenBalances } from "@/lib/web3";

export const UserTokenBalance = async () => {
  const { bonk } = await getUserTokenBalances();

  return <div>bonk balance: {bonk}</div>;
};
