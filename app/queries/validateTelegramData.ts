import crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

export const validateTelegramData = (initData: string) => {
  const queryString = new URLSearchParams(initData);
  const dataEnteries = Object.fromEntries(queryString.entries());
  const hash = dataEnteries?.hash;

  delete dataEnteries?.hash;

  const dataCheckString = Object.keys(dataEnteries)
    .sort()
    .map((key) => `${key}=${dataEnteries[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  if (computedHash !== hash) {
    throw new Error("Hash not matched");
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const authDate = parseInt(dataEnteries.auth_date, 10);

  if (currentTime - authDate > 86400) {
    throw new Error("Req expired");
  }

  const verifiedData = JSON.parse(dataEnteries?.user);

  return verifiedData;
};
