import { getDailyDeck } from "@/app/queries/deck";
import { getTransactionHistory } from "../actions/fungible-asset";
import { getJwtPayload } from "../actions/jwt";
import { getProfileImage } from "../queries/profile";
import { getIsUserAdmin } from "../queries/user";
import DailyDeckScreen from "../screens/DailyDeckScreen/DailyDeckScreen";
import { getBonkBalance, getSolBalance } from "../utils/solana";

export default async function Page() {
  const dailyDeck = await getDailyDeck();
  const isAdmin = await getIsUserAdmin();

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

  console.log({ date: dailyDeck?.date });

  return (
    <DailyDeckScreen
      date={dailyDeck?.date}
      id={dailyDeck?.id}
      questions={dailyDeck?.questions}
      isAdmin={isAdmin}
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
