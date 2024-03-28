"use server";

import prisma from "../services/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getIsUserAdmin } from "../queries/user";
import { z } from "zod";
import { tagSchema } from "../schemas/tag";

export async function createTag(data: z.infer<typeof tagSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = tagSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  const tagData = {
    ...validatedFields.data,
    id: undefined,
  };

  await prisma.tag.create({
    data: tagData,
  });

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}

export async function editTag(data: z.infer<typeof tagSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = tagSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  if (!data.id) {
    return false;
  }

  const tagData = {
    ...validatedFields.data,
    id: undefined,
  };

  await prisma.tag.update({
    where: {
      id: data.id,
    },
    data: tagData,
  });

  revalidatePath("/admin/tags");
  redirect("/admin/tags");
}
