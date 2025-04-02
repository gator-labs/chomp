"use server";

import { ADMIN_PATH, STACKS_PATH } from "@/lib/urls";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getIsUserAdmin } from "../queries/user";
import { stackSchema } from "../schemas/stack";
import prisma from "../services/prisma";
import s3Client from "../services/s3Client";
import { validateBucketImage } from "../utils/file";

export async function createStack(data: z.infer<typeof stackSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = stackSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  if (!validatedFields.data.image) return false;

  const isBucketImageValid = await validateBucketImage(
    validatedFields.data.image.split("/").pop()!,
    validatedFields.data.image,
  );

  if (!isBucketImageValid) throw new Error("Invalid image");

  await prisma.stack.create({
    data: {
      name: validatedFields.data.name,
      isActive: validatedFields.data.isActive,
      isVisible: validatedFields.data.isVisible,
      hideDeckFromHomepage: validatedFields.data.hideDeckFromHomepage,
      image: validatedFields.data.image,
    },
  });

  revalidatePath(`${ADMIN_PATH}${STACKS_PATH}`);
  redirect(`${ADMIN_PATH}${STACKS_PATH}`);
}

export async function editStack(data: z.infer<typeof stackSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = stackSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  if (!data.id) {
    return false;
  }

  if (!validatedFields.data.image) return false;

  const isBucketImageValid = await validateBucketImage(
    validatedFields.data.image.split("/").pop()!,
    validatedFields.data.image,
  );

  if (!isBucketImageValid) throw new Error("Invalid image");

  const currentStack = await prisma.stack.findUnique({
    where: {
      id: data.id,
    },
  });

  if (
    currentStack?.image !== validatedFields.data.image &&
    !!currentStack?.image
  ) {
    const deleteObject = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: currentStack!.image.split("/").pop(),
    });

    await s3Client.send(deleteObject);
  }

  await prisma.stack.update({
    where: {
      id: data.id,
    },
    data: {
      name: validatedFields.data.name,
      isActive: validatedFields.data.isActive,
      isVisible: validatedFields.data.isVisible,
      hideDeckFromHomepage: validatedFields.data.hideDeckFromHomepage,
      image: validatedFields.data.image,
    },
  });

  revalidatePath(`${ADMIN_PATH}${STACKS_PATH}`);
  redirect(`${ADMIN_PATH}${STACKS_PATH}`);
}
