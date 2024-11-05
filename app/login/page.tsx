import verifyTelegramAuthToken from "../actions/bot";
import { getJwtPayload } from "../actions/jwt";
import { getDailyDeck } from "../queries/deck";
import LoginScreen from "../screens/LoginScreens/LoginScreen";

export type TelegramAuthDataProps = {
  authDate: number;
  firstName: string;
  lastName: string;
  username: string;
  id: number;
  photoURL: string;
  hash: string;
  iat: number;
};

export default async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [dailyDeck, payload] = await Promise.all([
    getDailyDeck(),
    getJwtPayload(),
  ]);

  const telegramAuthToken = searchParams.telegramAuthToken as string;
  let telegramAuthData: TelegramAuthDataProps | undefined;
  if (telegramAuthToken) {
    telegramAuthData = (await verifyTelegramAuthToken(
      telegramAuthToken,
    )) as TelegramAuthDataProps;
  }

  return (
    <LoginScreen
      hasDailyDeck={!!dailyDeck}
      payload={payload}
      telegramAuthData={telegramAuthData}
    />
  );
}
