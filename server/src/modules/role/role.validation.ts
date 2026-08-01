import { z } from "zod";
import { $Enums } from "../../generated/prisma/client.js";

const roleStatuses = [$Enums.RoleStatus.ACTIVE, $Enums.RoleStatus.INACTIVE] as const;

export const createRoleSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Role name must be at least 2 characters")
    .max(50),

  description: z
    .string()
    .trim()
    .max(255)
    .optional(),

  status: z
    .enum(roleStatuses)
    .default($Enums.RoleStatus.ACTIVE),

  permissionIds: z
    .array(z.string().cuid())
    .min(1, "At least one permission is required"),
});



export const updateRoleSchema = createRoleSchema.partial();
