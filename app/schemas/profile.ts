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
    .max(20, { message: "First name must be at most 20 characters long." })
    .optional()
    .or(z.literal("")),
  lastName: z
    .string()
    .regex(/^[a-zA-Z0-9]*$/, {
      message:
        "Invalid last name. No spaces or special characters are allowed.",
    })
    .min(1, { message: "Last name must be at least 1 character long." })
    .max(20, { message: "Last name must be at most 20 characters long." })
    .optional()
    .or(z.literal("")),
  username: z
    .string()
    .regex(/^[a-zA-Z0-9-_]+$/, {
      message:
        "Invalid username. Can only contain letters, numbers, hyphens (-), and underscores (_).",
    })
    .min(5, { message: "Username must be at least 5 characters long." })
    .max(20, { message: "Username must be at most 20 characters long." })
    .optional()
    .or(z.literal("")),
});

export const profileSchemaClient = profileSchema
  .extend({
    image: imageSchemaClientOptional,
  })
  .refine(
    (data) => {
      const { firstName, lastName } = data;
      return (!firstName && !lastName) || (firstName && lastName);
    },
    {
      message: "Both firstName and lastName are required if one is provided.",
      path: ["firstName"],
    },
  );

export const profileSchemaServer = profileSchema
  .extend({
    image: imageSchemaServerOptional,
  })
  .refine(
    (data) => {
      const { firstName, lastName } = data;
      return (!firstName && !lastName) || (firstName && lastName);
    },
    {
      message: "Both firstName and lastName are required if one is provided.",
      path: ["firstName"],
    },
  );
