"use server";

import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

import s3Client from "../services/s3Client";
import { getJwtPayload } from "./jwt";

interface GetSignedURLParams {
  fileType: string;
  fileSize: number;
  checksum: string;
  allowedFileTypes: string[];
  maxFileSize: number;
}

export async function getPreSignedURL({
  fileType,
  fileSize,
  checksum,
  maxFileSize,
  allowedFileTypes,
}: GetSignedURLParams) {
  const payload = await getJwtPayload();

  if (!payload?.sub)
    throw new Error("You are not authenticated to do this action.");

  if (!allowedFileTypes.includes(fileType))
    throw new Error("Invalid file type");

  if (fileSize > maxFileSize) throw new Error("Max file size is 1MB");

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: uuidv4(),
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
  });

  const url = await getSignedUrl(s3Client, putObjectCommand, { expiresIn: 60 });

  return url;
}
