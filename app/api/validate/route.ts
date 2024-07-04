// // pages/api/validate-initdata.js
import { NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

const BOT_TOKEN = process.env.BOT_TOKEN || "";

const validateTelegramData = (initData: any) => {
  const queryString = new URLSearchParams(initData);
  const data = Object.fromEntries(queryString.entries());

  const hash = data.hash;
  delete data.hash;

  const dataCheckString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  console.log(dataCheckString, "d");

  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(BOT_TOKEN)
    .digest();

  console.log(secretKey, "s");

  const computedHash = crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");

  console.log(computedHash, "c");

  // console.log(computedHash !== hash);

  if (computedHash !== hash) {
    return false;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  const authDate = parseInt(data.auth_date, 10);

  if (currentTime - authDate > 86400) {
    // 86400 seconds = 24 hours
    return false;
  }

  return true;
};

export async function POST(req: NextRequest, res: NextApiResponse) {
  const data = await req.json();
  // console.log(data, req.body);
  const resD = validateTelegramData(data?.initData);
  return NextResponse.json({ message: resD }, { status: 200 });
  // if () {

  // } else {
  //   return res.json({ valid: false });
  // }
}
