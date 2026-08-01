import { AttributeType } from "../../generated/prisma/enums.js";
import { z } from "zod";

export const createAttributeSchema = z.object({
  name: z.string().trim().min(2).max(100),

  slug: z.string().trim().min(2).max(100),

  type: z.enum(AttributeType),
});

export const updateAttributeSchema =
  createAttributeSchema.partial();

export const createAttributeValueSchema = z.object({
  value: z.string().trim().min(1).max(100),

  slug: z.string().trim().min(1).max(100),

  referenceValue: z.string().optional(),
});

export const updateAttributeValueSchema =
  createAttributeValueSchema.partial();