import { ReactNode } from "react";

import { getTransactionHistory } from "../actions/fungible-asset";
import Main from "../components/Main/Main";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { getCurrentUser } from "../queries/user";
import { getBonkBalance, getSolBalance } from "../utils/solana";

type PageLayoutProps = {
  children: ReactNode;
};

const StacksLayout = async ({ children }: PageLayoutProps) => {
  const [user, history] = await Promise.all([
    getCurrentUser(),
    getTransactionHistory(),
  ]);

  const address = user?.wallets[0].address || "";

  const isUserLoggedIn = !!user?.id;

  const [bonkBalance, solBalance] = await Promise.all([
    getBonkBalance(address),
    getSolBalance(address),
  ]);

  return (
    <div className="flex flex-col h-full">
      <Main className="px-0" userId={user?.id}>
        {!!user && (
          <Navbar
            avatarSrc={user?.profileSrc || ""}
            bonkBalance={bonkBalance}
            solBalance={solBalance}
            transactions={history.map((h) => ({
              amount: h.change.toNumber(),
              amountLabel: h.asset + "s",
              transactionType: h.type,
              date: h.createdAt,
            }))}
            address={address}
            isUserLoggedIn={isUserLoggedIn}
          />
        )}
        {children}
      </Main>
      {<TabNavigation isAdmin={!!user?.isAdmin} />}
    </div>
  );
};

export default StacksLayout;
