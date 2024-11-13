import * as nodeCrypto from "crypto";
import * as jwt from "jsonwebtoken";

const BOT_TOKEN = process.env.BOT_TOKEN ?? "";

// Helper function to encode the Telegram payload
export async function encodeTelegramPayload(TELEGRAM_USER_PAYLOAD: any) {
  // Filter out undefined or empty values from the data object
  const filteredUseData = Object.entries(TELEGRAM_USER_PAYLOAD).reduce(
    (acc: { [key: string]: any }, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    },
    {} as { [key: string]: any },
  );

  // Sort the entries and create the data check string
  const dataCheckArr = Object.entries(filteredUseData)
    .map(([key, value]) => `${key}=${String(value)}`)
    .sort((a, b) => a.localeCompare(b))
    .join("\n");

  // Create SHA-256 hash from the bot token
  const TELEGRAM_SECRET = nodeCrypto
    .createHash("sha256")
    .update(BOT_TOKEN)
    .digest();

  // Generate HMAC-SHA256 hash from the data check string
  const hash = nodeCrypto
    .createHmac("sha256", new Uint8Array(TELEGRAM_SECRET))
    .update(dataCheckArr)
    .digest("hex");

  // Create JWT with user data and hash
  const telegramAuthToken = jwt.sign(
    {
      ...TELEGRAM_USER_PAYLOAD,
      hash,
    },
    BOT_TOKEN, // Use the bot token to sign the JWT
    { algorithm: "HS256" },
  );

  return encodeURIComponent(telegramAuthToken);
}
