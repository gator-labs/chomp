"use server";

import { revalidatePath } from "next/cache";

export default async function revalidateApplication() {
  revalidatePath("/application");
}

export async function revalidateRewards() {
  revalidatePath("/application/rewards");
}
