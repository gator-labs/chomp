import Bot from "../components/Bot/Bot";
import verifyTelegramAuthToken from '../actions/bot';

export type TelegramAuthDataProps = {
  authDate: number,
  firstName: string,
  lastName: string,
  username: string,
  id: number,
  photoURL: string,
  hash: string,
  iat: number
}

export default async function BotPage({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const telegramAuthToken = searchParams.telegramAuthToken as string;
  const telegramAuthData = await verifyTelegramAuthToken(telegramAuthToken) as TelegramAuthDataProps;

  return (
    <Bot telegramAuthData={telegramAuthData} />
  );
}
