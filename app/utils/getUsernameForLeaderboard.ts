import { formatAddress } from "./wallet";

export const getUsername = (user: {
  username?: string | null;
  wallets: { address?: string }[];
}): string => {
  if (user.username) {
    return `@${user.username}`;
  } else if (user.wallets.length > 0 && user.wallets[0]?.address) {
    return formatAddress(user.wallets[0].address);
  } else {
    return "mocked user";
  }
};
