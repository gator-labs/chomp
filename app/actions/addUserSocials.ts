"use server";

import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export async function addUserSocials(
  twitterUsername: string | null,
  telegramUsername: string | null,
) {
  const payload = await getJwtPayload();
  if (!payload?.sub) return null;

  await prisma.user.update({
    where: {
      id: payload.sub,
    },
    data: {
      twitterUsername: twitterUsername,
      telegramUsername: telegramUsername,
    },
  });
}
