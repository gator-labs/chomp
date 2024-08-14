"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getIsUserAdmin } from "../queries/user";
import { campaignSchema } from "../schemas/campaign";
import prisma from "../services/prisma";
import s3Client from "../services/s3Client";
import { validateBucketImage } from "../utils/file";

export async function createCampaign(data: z.infer<typeof campaignSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = campaignSchema.safeParse(data);

  if (!validatedFields.success) {
    return false;
  }

  if (!validatedFields.data.image) return false;

  const isBucketImageValid = await validateBucketImage(
    validatedFields.data.image.split("/").pop()!,
    validatedFields.data.image,
  );

  if (!isBucketImageValid) throw new Error("Invalid image");

  await prisma.campaign.create({
    data: {
      name: validatedFields.data.name,
      isActive: validatedFields.data.isActive,
      isVisible: validatedFields.data.isVisible,
      image: validatedFields.data.image,
    },
  });

  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}

export async function editCampaign(data: z.infer<typeof campaignSchema>) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const validatedFields = campaignSchema.safeParse(data);

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

  const currentCampaign = await prisma.campaign.findUnique({
    where: {
      id: data.id,
    },
  });

  if (currentCampaign?.image !== validatedFields.data.image) {
    const deleteObject = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: currentCampaign!.image.split("/").pop(),
    });

    await s3Client.send(deleteObject);
  }

  await prisma.campaign.update({
    where: {
      id: data.id,
    },
    data: {
      name: validatedFields.data.name,
      isActive: validatedFields.data.isActive,
      isVisible: validatedFields.data.isVisible,
      image: validatedFields.data.image,
    },
  });

  revalidatePath("/admin/campaigns");
  redirect("/admin/campaigns");
}
