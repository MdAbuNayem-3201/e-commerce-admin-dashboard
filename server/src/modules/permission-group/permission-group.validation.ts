import { z } from "zod";

export const createPermissionGroupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Group name is required")
    .max(100),

  description: z
    .string()
    .trim()
    .optional(),

  actions: z
    .array(
      z.enum([
        "watch",
        "create",
        "read",
        "update",
        "delete",
      ])
    )
    .min(1, "At least one action is required"),
});

export const updatePermissionGroupSchema =
  createPermissionGroupSchema.partial();