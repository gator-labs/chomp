import { z } from "zod";
import {
  IMAGE_VALID_TYPES,
  MAX_IMAGE_UPLOAD_SIZE,
} from "../../constants/images";

export const imageSchemaServer = z
  .any()
  .refine((file) => file.size !== 0, "File is required.")
  .refine(
    (file) => IMAGE_VALID_TYPES.includes(file?.type),
    "Invalid file. Choose either JPEG or PNG image.",
  )
  .refine(
    (file) => file?.size <= MAX_IMAGE_UPLOAD_SIZE,
    "Max file size allowed is 1MB.",
  );

export const imageSchemaServerOptional = z
  .any()
  .optional()
  .refine((file) => {
    if (file === "undefined") return true;

    return file.size !== 0;
  }, "File is required.")
  .refine((file) => {
    if (file === "undefined") return true;

    return IMAGE_VALID_TYPES.includes(file?.type);
  }, "Invalid file. Choose either JPEG or PNG image.")
  .refine((file) => {
    if (file === "undefined") return true;

    return file?.size <= MAX_IMAGE_UPLOAD_SIZE;
  }, "Max file size allowed is 1MB.");

export const imageSchemaClient = z
  .any()
  .refine((file) => file.length === 1, "File is required.")
  .refine(
    (file) => IMAGE_VALID_TYPES.includes(file[0]?.type),
    "Invalid file. Choose either JPEG or PNG image.",
  )
  .refine(
    (file) => file[0]?.size <= MAX_IMAGE_UPLOAD_SIZE,
    "Max file size allowed is 1MB.",
  );

export const imageSchemaClientOptional = z
  .any()
  .optional()
  .refine(
    (file) => {
      if (file === undefined || file.length === 0) {
        return true;
      }
      return file.length === 1;
    },
    { message: "File is required." },
  )
  .refine(
    (file) => {
      if (file === undefined || file.length === 0) {
        return true;
      }
      return IMAGE_VALID_TYPES.includes(file[0]?.type);
    },
    { message: "Invalid file. Choose either JPEG or PNG image." },
  )
  .refine(
    (file) => {
      if (file === undefined || file.length === 0) {
        return true;
      }
      return file[0]?.size <= MAX_IMAGE_UPLOAD_SIZE;
    },
    { message: "Max file size allowed is 1MB." },
  );
