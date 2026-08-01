import { BrandStatus } from "../../generated/prisma/enums.js";
import { z } from "zod";

export const createBrandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Brand name must be at least 2 characters.")
    .max(100),

  slug: z
    .string()
    .trim()
    .min(2)
    .max(100),

  description: z
    .string()
    .trim()
    .optional(),

  logoId: z
    .string()
    .cuid()
    .optional(),

  status: z
    .enum(BrandStatus)
    .optional(),
});

export const updateBrandSchema =
  createBrandSchema.partial();