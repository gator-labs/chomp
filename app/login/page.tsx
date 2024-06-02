import { getDailyDeck } from "../queries/deck";
import LoginScreen from "../screens/LoginScreens/LoginScreen";

export default async function Page() {
  const dailyDeck = await getDailyDeck();

  return <LoginScreen hasDailyDeck={!!dailyDeck} />;
}
