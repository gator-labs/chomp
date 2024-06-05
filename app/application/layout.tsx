import { ReactNode } from "react";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getJwtPayload } from "../actions/jwt";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { CollapsedContextProvider } from "../providers/CollapsedProvider";
import ConfettiProvider from "../providers/ConfettiProvider";
import MetadataProvider from "../providers/MetadataProvider";
import { RevealContextProvider } from "../providers/RevealProvider";
import { getProfileImage } from "../queries/profile";
import { getIsUserAdmin } from "../queries/user";
import { getBonkBalance, getSolBalance } from "../utils/solana";

type PageLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: PageLayoutProps) {
  const payload = await getJwtPayload();
  const history = await getTransactionHistory();
  const profile = await getProfileImage();
  const verifiedCredentials = payload?.verified_credentials.find(
    (vc) => vc.format === "blockchain",
  ) ?? { address: "" };

  let address = "";

  if ("address" in verifiedCredentials) {
    address = verifiedCredentials.address;
  }

  const bonkBalance = await getBonkBalance(address);
  const solBalance = await getSolBalance(address);

  const isAdmin = await getIsUserAdmin();

  return (
    <CollapsedContextProvider>
      <ConfettiProvider>
        <RevealContextProvider bonkBalance={bonkBalance}>
          <MetadataProvider profileSrc={profile}>
            <div className="flex flex-col h-full">
              <main className="flex-grow overflow-y-auto mb-2 w-full max-w-lg mx-auto flex flex-col px-4">
                <Navbar
                  avatarSrc={profile}
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
                {children}
              </main>
              <TabNavigation isAdmin={isAdmin} />
              <AuthRedirect />
              <DailyDeckRedirect />
            </div>
          </MetadataProvider>
        </RevealContextProvider>
      </ConfettiProvider>
    </CollapsedContextProvider>
  );
}
