"use server";

import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getIsUserAdmin } from "../queries/user";
import {
  createBannerSchemaServer,
  updateBannerSchemaServer,
} from "../schemas/banner";
import prisma from "../services/prisma";
import s3Client from "../services/s3Client";
import { uploadImageToS3Bucket, validateBucketImage } from "../utils/file";

export async function createBanner(formData: FormData) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const result = createBannerSchemaServer.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!result.success) throw new Error(result.error.message);

  const { data } = result;

  const imageUrl = await uploadImageToS3Bucket(data.image);

  const isBucketImageValid = await validateBucketImage(
    imageUrl.split("/").pop()!,
    imageUrl,
  );

  if (!isBucketImageValid) throw new Error("Invalid image");

  await prisma.banner.create({
    data: {
      isActive: data.isActive,
      image: imageUrl,
      text: data.text,
      url: data.url || null,
    },
  });

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function updateBanner(formData: FormData) {
  const isAdmin = await getIsUserAdmin();

  if (!isAdmin) {
    redirect("/application");
  }

  const result = updateBannerSchemaServer.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!result.success) throw new Error(result.error.message);

  const { data } = result;

  const banner = await prisma.banner.findUnique({
    where: {
      id: data.id,
    },
  });

  if (!banner) throw new Error("Banner not found");

  let imageUrl = banner.image;

  if (data.image !== "undefined") {
    imageUrl = await uploadImageToS3Bucket(data.image);

    const isBucketImageValid = await validateBucketImage(
      imageUrl.split("/").pop()!,
      imageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");

    const deleteObject = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: banner!.image.split("/").pop(),
    });

    await s3Client.send(deleteObject);
  }

  await prisma.banner.update({
    where: {
      id: data.id,
    },
    data: {
      isActive: data.isActive,
      image: imageUrl,
      text: data.text,
      url: data.url || null,
    },
  });

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}
