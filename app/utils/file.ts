import { GetObjectCommand } from "@aws-sdk/client-s3";
import { z, ZodError } from "zod";
import { getPreSignedURL } from "../actions/s3";
import { IMAGE_VALID_TYPES, MAX_IMAGE_UPLOAD_SIZE } from "../constants/images";
import s3Client from "../services/s3Client";

export async function processCsv<T extends object>(
  file: Blob,
  columns: Array<keyof T>,
  zodSchema: z.ZodType,
): Promise<{ values: Array<T>; errors: Array<ZodError> }> {
  const contentOfFile = await file.text();
  const rows = contentOfFile.split(/\r?\n/);
  rows.splice(0, 1);
  rows.pop();

  const objects = rows.map((row) => {
    // Split by comma, except values which are in double quotation marks
    const cells = row.split(/,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/);
    return columns.reduce(
      (acc, key, index) => {
        acc[key as string] = cells[index];
        return acc;
      },
      {} as { [key: string]: string },
    );
  });

  const results = objects.map((object) => {
    const result = zodSchema.safeParse(object);
    if (result.success) {
      return { value: result.data };
    }

    return { error: result.error };
  });

  return {
    values: results
      .filter((result) => result.value)
      .map((result) => result.value ?? ({} as T)),
    errors: results
      .filter((result) => result.error)
      .map((result) => result.error ?? ({} as ZodError)),
  };
}

export const computeSHA256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
};

export const uploadImageToS3Bucket = async (file: File) => {
  const url = await getPreSignedURL({
    fileSize: file.size,
    fileType: file.type,
    checksum: await computeSHA256(file),
    allowedFileTypes: IMAGE_VALID_TYPES,
    maxFileSize: MAX_IMAGE_UPLOAD_SIZE,
  });

  await fetch(url, {
    method: "PUT",
    body: file,
  });

  const imageUrl = url.split("?")[0];
  return imageUrl;
};

export const validateBucketImage = async (key: string, imageUrl: string) => {
  const getObjectCommand = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
  });

  const s3Object = await s3Client.send(getObjectCommand);

  if (!s3Object || !imageUrl.startsWith(process.env.AWS_S3_URL!)) return false;

  return true;
};
