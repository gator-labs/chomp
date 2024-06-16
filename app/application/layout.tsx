import { ReactNode } from "react";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getJwtPayload } from "../actions/jwt";
import { AuthRedirect } from "../components/AuthRedirect/AuthRedirect";
import { DailyDeckRedirect } from "../components/DailyDeckRedirect/DailyDeckRedirect";
import { Navbar } from "../components/Navbar/Navbar";
import { TabNavigation } from "../components/TabNavigation/TabNavigation";
import { ClaimingProvider } from "../providers/ClaimingProvider";
import ConfettiProvider from "../providers/ConfettiProvider";
import MetadataProvider from "../providers/MetadataProvider";
import { RevealContextProvider } from "../providers/RevealProvider";
import { getQuestionsForReadyToRevealSection } from "../queries/home";
import { getProfileImage } from "../queries/profile";
import { getIsUserAdmin } from "../queries/user";
import { getBonkBalance, getSolBalance } from "../utils/solana";
import { getAddressFromVerifiedCredentials } from "../utils/wallet";

type PageLayoutProps = {
  children: ReactNode;
};

export default async function Layout({ children }: PageLayoutProps) {
  const payload = await getJwtPayload();
  const history = await getTransactionHistory();
  const profile = await getProfileImage();
  const address = getAddressFromVerifiedCredentials(payload);
  const questionsForReveal = await getQuestionsForReadyToRevealSection();

  const bonkBalance = await getBonkBalance(address);
  const solBalance = await getSolBalance(address);

  const isAdmin = await getIsUserAdmin();

  return (
    <ConfettiProvider>
      <ClaimingProvider>
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
                  revealedQuestions={questionsForReveal}
                />
                {children}
              </main>
              <TabNavigation isAdmin={isAdmin} />
              <AuthRedirect />
              <DailyDeckRedirect />
            </div>
          </MetadataProvider>
        </RevealContextProvider>
      </ClaimingProvider>
    </ConfettiProvider>
  );
}
