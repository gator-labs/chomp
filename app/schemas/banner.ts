import { z } from "zod";
import {
  imageSchemaClient,
  imageSchemaClientOptional,
  imageSchemaServer,
  imageSchemaServerOptional,
} from "./common/imageSchema";

const baseBannerSchema = z.object({
  url: z
    .string()
    .url({ message: "Invalid URL format." })
    .or(z.literal("").optional())
    .optional(),
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
