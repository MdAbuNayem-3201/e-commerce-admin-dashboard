import { z } from "zod";

import { $Enums } from "../../generated/prisma/client.js";

const genders = [
  $Enums.Gender.MALE,
  $Enums.Gender.FEMALE,
  $Enums.Gender.OTHER
] as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .toLowerCase(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),

  phone: z
    .string()
    .trim()
    .optional(),

  gender: z
    .enum(genders)
    .optional(),

  roleId: z
    .string()
    .cuid("Invalid role id"),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(100)
    .optional(),

  phone: z
    .string()
    .trim()
    .optional(),

  gender: z
    .enum(genders)
    .optional(),

  roleId: z
    .string()
    .cuid()
    .optional(),
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});