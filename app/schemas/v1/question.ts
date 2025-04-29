import { z } from "zod";

const OptionSchema = z.object({
  title: z.string().min(1),
  index: z.number().int().positive(),
});

export const questionSchema = z
  .object({
    title: z.string().min(1),
    options: z
      .array(OptionSchema)
      .length(2)
      .or(z.array(OptionSchema).length(4)),
    rules: z.string().optional(),
    description: z.string().optional(),
    imageUrl: z.string().url().optional(),
    startTimestamp: z.date().optional(),
    endTimestamp: z.date().optional(),
    onChainAddress: z.string().optional(),
  })
  .refine(
    (data) =>
      !(data.endTimestamp && data.startTimestamp) ||
      data.endTimestamp > data.startTimestamp,
    {
      message: "endTimestamp must be after startTimestamp",
      path: ["endTimestamp"],
    },
  );
