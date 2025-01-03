import { z } from "zod";

import {
  IMAGE_ACTION,
  IMAGE_UPLOAD_SIZES,
  IMAGE_UPLOAD_SIZE_STRINGS,
  IMAGE_VALID_TYPES,
} from "../../constants/images";

export const imageSchemaServer = z
  .any()
  .refine((file) => file.size !== 0, "File is required.")
  .refine(
    (file) => IMAGE_VALID_TYPES.includes(file?.type),
    "Invalid file. Choose either JPEG or PNG image.",
  )
  .refine(
    (file) => file?.size <= IMAGE_UPLOAD_SIZES.DEFAULT,
    `Max file size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`,
  );

export const imageSchemaServerOptional = z
  .any()
  .optional()
  .refine((file) => {
    if (file === "undefined" || file === IMAGE_ACTION.REMOVE_IMAGE) return true;

    return file.size !== 0;
  }, "File is required.")
  .refine((file) => {
    if (file === "undefined" || file === IMAGE_ACTION.REMOVE_IMAGE) return true;

    return IMAGE_VALID_TYPES.includes(file?.type);
  }, "Invalid file. Choose either JPEG or PNG image.")
  .refine((file) => {
    if (file === "undefined" || file === IMAGE_ACTION.REMOVE_IMAGE) return true;

    return file?.size <= IMAGE_UPLOAD_SIZES.DEFAULT;
  }, `Max file size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`);

export const imageSchemaClient = z
  .any()
  .refine((file) => file.length === 1, "File is required.")
  .refine(
    (file) => IMAGE_VALID_TYPES.includes(file[0]?.type),
    "Invalid file. Choose either JPEG or PNG image.",
  )
  .refine(
    (file) => file[0]?.size <= IMAGE_UPLOAD_SIZES.DEFAULT,
    `Max file size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`,
  );

export const imageSchemaClientOptional = z
  .any()
  .optional()
  .refine(
    (file) => {
      if (file === undefined || file === null || file.length === 0) {
        return true;
      }
      return file.length === 1;
    },
    { message: "File is required." },
  )
  .refine(
    (file) => {
      if (file === undefined || file === null || file.length === 0) {
        return true;
      }
      return IMAGE_VALID_TYPES.includes(file[0]?.type);
    },
    { message: "Invalid file. Choose either JPEG or PNG image." },
  )
  .refine(
    (file) => {
      if (file === undefined || file === null || file.length === 0) {
        return true;
      }
      return file[0]?.size <= IMAGE_UPLOAD_SIZES.DEFAULT;
    },
    {
      message: `Max file size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`,
    },
  );
