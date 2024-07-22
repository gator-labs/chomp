import { getDailyAnsweredQuestions, getDailyDeck } from "@/app/queries/deck";

import { redirect } from "next/navigation";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getCurrentUser } from "../queries/user";
import DailyDeckScreen from "../screens/DailyDeckScreen/DailyDeckScreen";
import { getBonkBalance, getSolBalance } from "../utils/solana";

export default async function Page() {
  const [dailyDeck, user, history, dailyAnsweredQuestions] = await Promise.all([
    getDailyDeck(),
    getCurrentUser(),
    getTransactionHistory(),
    getDailyAnsweredQuestions(),
  ]);

  const address = user?.wallets[0].address || "";

  const [bonkBalance, solBalance] = await Promise.all([
    getBonkBalance(address),
    getSolBalance(address),
  ]);

  if (!dailyAnsweredQuestions?.questions?.length) redirect("/application");

  return (
    <DailyDeckScreen
      date={dailyDeck?.date}
      id={dailyDeck?.id}
      isAdmin={!!user?.isAdmin}
      questions={dailyDeck?.questions}
      percentOfAnsweredQuestions={
        (dailyAnsweredQuestions.answers.length /
          dailyAnsweredQuestions.questions.length) *
        100
      }
      navBarData={{
        avatarSrc: user?.profileSrc || "",
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
