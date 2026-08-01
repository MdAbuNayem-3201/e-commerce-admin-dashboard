import { z } from "zod";

export const createPermissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Permission name is required"),

  description: z
    .string()
    .trim()
    .optional(),

  groupId: z
    .string()
    .trim()
    .min(1, "Permission group is required"),
});

export const updatePermissionSchema =
  createPermissionSchema.partial();