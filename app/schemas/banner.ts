import { z } from "zod";
import { colorSchema } from "./common/colorSchema";
import {
  imageSchemaClient,
  imageSchemaClientOptional,
  imageSchemaServer,
  imageSchemaServerOptional,
} from "./common/imageSchema";

const baseBannerSchema = z.object({
  title: z.string().trim().min(1, "Name is required"),
  description: z.string().trim().min(1, "Description is required"),
  url: z
    .string()
    .url({ message: "Invalid URL format." })
    .or(z.literal("").optional())
    .optional(),
  backgroundColor: colorSchema,
  isActive: z.coerce.string().transform((val) => val === "true"),
});

export const createBannerSchemaClient = baseBannerSchema.extend({
  image: imageSchemaClient,
});

export const createBannerSchemaServer = baseBannerSchema.extend({
  image: imageSchemaServer,
});

export const updateBannerSchemaClient = baseBannerSchema.extend({
  id: z.coerce.number(),
  image: imageSchemaClientOptional,
});

export const updateBannerSchemaServer = baseBannerSchema.extend({
  id: z.coerce.number(),
  image: imageSchemaServerOptional,
});
