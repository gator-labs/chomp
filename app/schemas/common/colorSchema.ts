import { z } from "zod";

export const colorSchema = z.string().refine(
  (val) => {
    const isHexColor = /^#([0-9A-F]{3}){1,2}$/i.test(val);

    return isHexColor;
  },
  {
    message: "Invalid color. Must be a valid hex color code.",
  },
);
