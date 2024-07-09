import { NextRequest } from "next/server";

import crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

export async function POST(req: NextRequest) {
  const data = await req.json();

  const initData = data?.initData;

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
    return new Response(`Hash not matched`, {
      status: 400,
    });
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const authDate = parseInt(dataEnteries.auth_date, 10);

  if (currentTime - authDate > 86400) {
    return new Response(`Req expired`, {
      status: 400,
    });
  }

  return Response.json({ message: dataEnteries?.user }, { status: 200 });
}
