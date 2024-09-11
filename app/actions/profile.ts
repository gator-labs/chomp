"use server";
import AvatarPlaceholder from "@/public/images/avatar_placeholder.png";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { IMAGE_ACTION } from "../constants/images";
import { profileSchemaServer } from "../schemas/profile";
import prisma from "../services/prisma";
import s3Client from "../services/s3Client";
import { uploadImageToS3Bucket, validateBucketImage } from "../utils/file";
import { getJwtPayload } from "./jwt";

export async function updateProfile(formData: FormData) {
  const payload = await getJwtPayload();

  if (!payload) {
    return redirect("/application/profile");
  }

  const result = profileSchemaServer.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (!result.success) {
    return { error: "Something went wrong!" };
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.sub,
    },
  });

  if (!!result.data.username && user?.username !== result.data.username) {
    const user = await prisma.user.findFirst({
      where: {
        username: result.data.username,
      },
    });

    if (user) {
      return { error: "Username already exists" };
    }
  }

  let imageUrl = user!.profileSrc;

  if (
    result.data.image !== "undefined" &&
    result.data.image !== IMAGE_ACTION.REMOVE_IMAGE
  ) {
    imageUrl = await uploadImageToS3Bucket(result.data.image);

    const isBucketImageValid = await validateBucketImage(
      imageUrl.split("/").pop()!,
      imageUrl,
    );

    if (!isBucketImageValid) throw new Error("Invalid image");

    if (user?.profileSrc?.includes(process.env.AWS_S3_URL!)) {
      const deleteObject = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: user.profileSrc.split("/").pop(),
      });

      await s3Client.send(deleteObject);
    }
  }

  if (result.data.image === IMAGE_ACTION.REMOVE_IMAGE) {
    imageUrl = AvatarPlaceholder.src;
  }

  await prisma.user.update({
    data: {
      firstName: result.data.firstName ?? "",
      lastName: result.data.lastName ?? "",
      username: result.data.username ?? "",
      profileSrc: imageUrl,
    },
    where: {
      id: payload.sub,
    },
  });

  revalidatePath("/application/settings");
}
