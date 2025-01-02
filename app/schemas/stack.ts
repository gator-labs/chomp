import { z } from "zod";

import {
  IMAGE_UPLOAD_SIZES,
  IMAGE_UPLOAD_SIZE_STRINGS,
  IMAGE_VALID_TYPES,
} from "../constants/images";

export const stackSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().trim().min(1, "Name is required"),
    isActive: z.boolean(),
    isVisible: z.boolean(),
    file: z
      .custom<File[]>()
      .optional()
      .refine((files) => {
        if (files && files.length > 0) {
          return files[0].size <= IMAGE_UPLOAD_SIZES.DEFAULT;
        }
        return true;
      }, `Max image size allowed is ${IMAGE_UPLOAD_SIZE_STRINGS.DEFAULT}.`)
      .refine((files) => {
        if (files && files.length > 0) {
          return IMAGE_VALID_TYPES.includes(files[0].type);
        }
        return true;
      }, "Only .jpg, .jpeg, .png and .webp formats are supported."),
    image: z
      .string()
      .optional()
      .refine(
        (value) => {
          if (!value) return true;

          try {
            new URL(value);
            return true;
          } catch {
            return false;
          }
        },
        {
          message: "Invalid image source",
        },
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.image && (!data.file || data.file.length === 0)) {
      ctx.addIssue({
        path: ["file"],
        message: "Upload image.",
        code: z.ZodIssueCode.custom,
      });
    }
  });
