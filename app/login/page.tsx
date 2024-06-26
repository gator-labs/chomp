import { getJwtPayload } from "../actions/jwt";
import { getDailyDeck } from "../queries/deck";
import LoginScreen from "../screens/LoginScreens/LoginScreen";

export default async function Page() {
  const dailyDeck = await getDailyDeck();
  const payload = await getJwtPayload();

  return <LoginScreen hasDailyDeck={!!dailyDeck} payload={payload} />;
}
