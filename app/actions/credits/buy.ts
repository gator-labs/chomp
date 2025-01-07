"use server";

import { getJwtPayload } from "../jwt";

export async function buyInsufficientCreidts() {
  const payload = await getJwtPayload();

  if (!payload) return;

  try {
  } catch {}
}
