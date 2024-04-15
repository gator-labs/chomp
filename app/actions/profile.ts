"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { profileSchema } from "../schemas/profile";
import prisma from "../services/prisma";
import { getJwtPayload } from "./jwt";

export async function updateProfile(data: z.infer<typeof profileSchema>) {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/application/profile");
  }

  const validatedFields = profileSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  await prisma.user.update({
    data: {
      firstName: validatedFields.data.firstName ?? "",
      lastName: validatedFields.data.lastName ?? "",
      username: validatedFields.data.username ?? "",
    },
    where: {
      id: payload.sub,
    },
  });
}
