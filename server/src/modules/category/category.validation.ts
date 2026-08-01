import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z.string().trim().min(2).max(100),

  description: z.string().trim().optional(),

  imageId: z.string().cuid().optional(),

  parentId: z.string().cuid().optional(),

  sortOrder: z.number().optional(),

  isActive: z.boolean().optional(),
});

export const updateCategorySchema =
  createCategorySchema.partial();