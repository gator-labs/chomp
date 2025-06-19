import bs58 from "bs58";
import Decimal from "decimal.js";
import { z } from "zod";

const SolanaAddressSchema = z.string().refine(
  (address) => {
    try {
      const decoded = bs58.decode(address);
      return decoded.length === 32;
    } catch {
      return false;
    }
  },
  {
    message: "Invalid Solana wallet address",
  },
);

export const AnswerSchema = z.object({
  userAddress: SolanaAddressSchema,
  firstOrderOptionId: z.string().uuid(),
  secondOrderOptionId: z.string().uuid(),
  secondOrderOptionEstimate: z.coerce
    .number()
    .min(0)
    .max(1)
    .transform((v) => Math.round(new Decimal(v).mul(100).toNumber())),
  weight: z.coerce.number().min(0).optional(),
});

export const AnswerBatchSchema = z.array(
  z.object({
    userAddress: SolanaAddressSchema,
    firstOrderOptionId: z.string().uuid(),
    secondOrderOptionId: z.string().uuid(),
    secondOrderOptionEstimate: z.coerce
      .number()
      .min(0)
      .max(1)
      .transform((v) => Math.round(new Decimal(v).mul(100).toNumber())),
    weight: z.coerce.number().min(0).optional(),
  }),
);
