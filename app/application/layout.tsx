import { ReactNode } from "react";
import { getTransactionHistory } from "../actions/fungible-asset";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import Main from "../components/Main/Main";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { ClaimingProvider } from "../providers/ClaimingProvider";
import ConfettiProvider from "../providers/ConfettiProvider";
import { RevealContextProvider } from "../providers/RevealProvider";
import { getCurrentUser } from "../queries/user";
import { getBonkBalance, getSolBalance } from "../utils/solana";

type PageLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: PageLayoutProps) {
  const [user, history] = await Promise.all([
    getCurrentUser(),
    getTransactionHistory(),
  ]);

  const address = user?.wallets[0].address || "";

  const [bonkBalance, solBalance] = await Promise.all([
    getBonkBalance(address),
    getSolBalance(address),
  ]);

  return (
    <ConfettiProvider>
      <ClaimingProvider>
        <RevealContextProvider bonkBalance={bonkBalance}>
          <div className="flex flex-col min-h-screen">
            <Main>
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
              />
              <div className="flex-grow">{children}</div>
            </Main>
            <div className="sticky bottom-0 left-0 right-0 z-50">
              <TabNavigation isAdmin={!!user?.isAdmin} />
            </div>
            <AuthRedirect />
            <DailyDeckRedirect />
          </div>
        </RevealContextProvider>
      </ClaimingProvider>
    </ConfettiProvider>
  );
}
