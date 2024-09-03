import { getJwtPayload } from "../actions/jwt";
import { getDailyDeck } from "../queries/deck";
import LoginScreen from "../screens/LoginScreens/LoginScreen";

export default async function Page() {
  const [dailyDeck, payload] = await Promise.all([
    getDailyDeck(),
    getJwtPayload(),
  ]);

  return <LoginScreen hasDailyDeck={!!dailyDeck} payload={payload} />;
}
