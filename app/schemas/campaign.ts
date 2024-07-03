import { z } from "zod";
import { IMAGE_VALID_TYPES, MAX_IMAGE_UPLOAD_SIZE } from "../constants/images";

const validateFile = (file: File) => {
  if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
    return false;
  }

  if (!IMAGE_VALID_TYPES.includes(file.type)) {
    return false;
  }

  return true;
};

export const campaignSchema = z
  .object({
    id: z.number().optional(),
    name: z.string().trim().min(1, "Name is required"),
    isActive: z.boolean(),
    image: z.any().refine(
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
    file: z.any().refine(
      (value) => {
        if (!value?.[0]) return true;

        return validateFile(value[0]);
      },
      {
        message: "Image must be a PNG or JPG file and less than 1MB",
      },
    ),
  })
  .superRefine((data, ctx) => {
    if (!data.image && !data.file) {
      ctx.addIssue({
        path: ["file"],
        message: "File is required",
        code: z.ZodIssueCode.custom,
      });
    }
  });
