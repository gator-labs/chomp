import { z } from "zod";
import {
  imageSchemaClientOptional,
  imageSchemaServerOptional,
} from "./common/imageSchema";

export const profileSchema = z.object({
  firstName: z
    .string()
    .regex(/^[a-zA-Z0-9]*$/, {
      message:
        "Invalid first name. No spaces or special characters are allowed.",
    })
    .min(1, { message: "First name must be at least 1 character long." })
    .max(45, { message: "First name must be at most 45 characters long." })
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .regex(/^[a-zA-Z0-9]*$/, {
      message:
        "Invalid last name. No spaces or special characters are allowed.",
    })
    .min(1, { message: "Last name must be at least 1 character long." })
    .max(45, { message: "Last name must be at most 45 characters long." })
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message:
        "Invalid username. Can only contain letters, numbers, hyphens (-), and underscores (_).",
    })
    .min(5, { message: "Username must be at least 5 characters long." })
    .max(45, { message: "Username must be at most 45 characters long." })
    .optional()
    .or(z.literal("")),
});

export const profileSchemaClient = profileSchema.extend({
  image: imageSchemaClientOptional,
});

export const profileSchemaServer = profileSchema.extend({
  image: imageSchemaServerOptional,
});
