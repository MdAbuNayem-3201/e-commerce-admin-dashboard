import { MediaType } from "../../generated/prisma/enums.js";
import { z } from "zod";

export const uploadMediaSchema = z.object({
  title: z
    .string()
    .trim()
    .max(255)
    .optional(),

  altText: z
    .string()
    .trim()
    .max(255)
    .optional(),
});

export const updateMediaSchema = z.object({
  title: z.string().trim().max(255).optional(),

  altText: z.string().trim().max(255).optional(),
});