import { z } from "zod";

const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const statusSchema = z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE");
const settingsSchema = z.record(z.unknown()).optional().nullable();

export const brandInputSchema = z.object({
  name: z.string().min(2).max(120),
  slug: slugSchema,
  status: statusSchema,
  logoUrl: z.string().url().optional().nullable(),
  settings: settingsSchema
});

export const deskInputSchema = z.object({
  brandId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(120),
  slug: slugSchema,
  status: statusSchema,
  settings: settingsSchema
});

export const permissionGroupInputSchema = z.object({
  brandId: z.string().uuid().optional().nullable(),
  deskId: z.string().uuid().optional().nullable(),
  name: z.string().min(2).max(120),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  status: statusSchema,
  permissions: z.array(z.string().min(1)).optional().nullable(),
  settings: settingsSchema
});

const scopeSchema = z.array(z.string().min(1)).default([]);

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.string().uuid()).optional()
});

export const apiKeyInputSchema = z.object({
  userId: z.string().uuid(),
  name: z.string().min(2).max(120),
  scopes: scopeSchema,
  expiresAt: z.string().datetime().optional().nullable()
});

export const apiKeyUpdateSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  scopes: scopeSchema.optional(),
  status: z.enum(["ACTIVE", "DISABLED", "REVOKED"]).optional(),
  expiresAt: z.string().datetime().optional().nullable()
});

export const ipRestrictionInputSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  label: z.string().min(2).max(120),
  cidr: z
    .string()
    .min(3)
    .max(80)
    .regex(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$|^[0-9a-fA-F:]+(\/\d{1,3})?$/),
  mode: z.enum(["ALLOW", "DENY"]).default("ALLOW"),
  status: statusSchema,
  notes: z.string().max(500).optional().nullable()
});

export type BrandInput = z.infer<typeof brandInputSchema>;
export type DeskInput = z.infer<typeof deskInputSchema>;
export type PermissionGroupInput = z.infer<typeof permissionGroupInputSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type ApiKeyInput = z.infer<typeof apiKeyInputSchema>;
export type ApiKeyUpdateInput = z.infer<typeof apiKeyUpdateSchema>;
export type IpRestrictionInput = z.infer<typeof ipRestrictionInputSchema>;
