import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { ReactNode } from "react";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getJwtPayload } from "../actions/jwt";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { CollapsedContextProvider } from "../providers/CollapsedProvider";
import ConfettiProvider from "../providers/ConfettiProvider";
import { RevealContextProvider } from "../providers/RevealProvider";
import { getBonkBalance, getSolBalance } from "../utils/solana";

type PageLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: PageLayoutProps) {
  const payload = await getJwtPayload();
  const history = await getTransactionHistory();
  const verifiedCredentials = payload?.verified_credentials.find(
    (vc) => vc.format === "blockchain",
  ) ?? { address: "" };

  let address = "";

  if ("address" in verifiedCredentials) {
    address = verifiedCredentials.address;
  }

  const bonkBalance = await getBonkBalance(address);
  const solBalance = await getSolBalance(address);

  return (
    <CollapsedContextProvider>
      <ConfettiProvider>
        <RevealContextProvider>
          <div className="flex flex-col h-full">
            <main className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col">
              <Navbar
                avatarSrc={AvatarPlaceholder.src}
                bonkBalance={bonkBalance}
                solBalance={solBalance}
                transactions={history.map((h) => ({
                  amount: h.change.toNumber(),
                  amountLabel: h.asset,
                  transactionType: h.type,
                  date: h.createdAt,
                  dollarAmount: 0,
                }))}
                address={address}
              />
              {children}
            </main>
            <TabNavigation />
            <AuthRedirect />
            <DailyDeckRedirect />
          </div>
        </RevealContextProvider>
      </ConfettiProvider>
    </CollapsedContextProvider>
  );
}
