import { getDailyAnsweredQuestions, getDailyDeck } from "@/app/queries/deck";

import { redirect } from "next/navigation";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getJwtPayload } from "../actions/jwt";
import { getProfileImage } from "../queries/profile";
import { getIsUserAdmin } from "../queries/user";
import DailyDeckScreen from "../screens/DailyDeckScreen/DailyDeckScreen";
import { getBonkBalance, getSolBalance } from "../utils/solana";
import { getAddressFromVerifiedCredentials } from "../utils/wallet";

export default async function Page() {
  const dailyDeck = await getDailyDeck();

  const isAdmin = await getIsUserAdmin();

  const payload = await getJwtPayload();
  const history = await getTransactionHistory();
  const profile = await getProfileImage();
  const address = getAddressFromVerifiedCredentials(payload);

  const bonkBalance = await getBonkBalance(address);
  const solBalance = await getSolBalance(address);

  const dailyAnsweredQuestions = await getDailyAnsweredQuestions();

  if (!dailyAnsweredQuestions?.questions?.length) redirect("/application");

  return (
    <DailyDeckScreen
      date={dailyDeck?.date}
      id={dailyDeck?.id}
      questions={dailyDeck?.questions}
      isAdmin={isAdmin}
      percentOfAnsweredQuestions={
        (dailyAnsweredQuestions.answers.length /
          dailyAnsweredQuestions.questions.length) *
        100
      }
      navBarData={{
        avatarSrc: profile,
        bonkBalance: bonkBalance,
        solBalance: solBalance,
        transactions: history.map((h) => ({
          amount: h.change.toNumber(),
          amountLabel: h.asset,
          transactionType: h.type,
          date: h.createdAt,
          dollarAmount: 0,
        })),
        address: address,
      }}
    />
  );
}
