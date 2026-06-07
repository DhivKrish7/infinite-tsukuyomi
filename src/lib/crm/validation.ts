import {
  ClientStatus,
  CommunicationDirection,
  CommunicationType,
  CrmCustomFieldType,
  CrmExtensionTarget,
  LeadStatus,
  OnboardingStage,
  RiskLevel,
  TaskPriority,
  TaskStatus
} from "@prisma/client";
import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  q: z.string().trim().optional(),
  assignedToId: z.string().uuid().optional(),
  tag: z.string().trim().optional()
});

export const clientListSchema = paginationSchema.extend({
  status: z.nativeEnum(ClientStatus).optional(),
  stage: z.nativeEnum(OnboardingStage).optional(),
  riskLevel: z.nativeEnum(RiskLevel).optional()
});

export const leadListSchema = paginationSchema.extend({
  status: z.nativeEnum(LeadStatus).optional(),
  stage: z.nativeEnum(OnboardingStage).optional()
});

export const createClientSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
  language: z.string().trim().optional(),
  assignedToId: z.string().uuid().optional(),
  platformId: z.string().uuid().optional(),
  status: z.nativeEnum(ClientStatus).default(ClientStatus.PENDING),
  onboardingStage: z.nativeEnum(OnboardingStage).default(OnboardingStage.APPROVED),
  riskLevel: z.nativeEnum(RiskLevel).default(RiskLevel.LOW),
  tags: z.array(z.string().trim().min(1)).default([])
});

export const updateClientSchema = createClientSchema.partial().extend({
  nextFollowUpAt: z.string().datetime().nullable().optional(),
  lastContactedAt: z.string().datetime().nullable().optional()
});

export const createLeadSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().email().transform((value) => value.toLowerCase()).optional(),
  phone: z.string().trim().optional(),
  country: z.string().trim().optional(),
  source: z.string().trim().optional(),
  campaign: z.string().trim().optional(),
  assignedToId: z.string().uuid().optional(),
  status: z.nativeEnum(LeadStatus).default(LeadStatus.NEW),
  onboardingStage: z.nativeEnum(OnboardingStage).default(OnboardingStage.NEW_LEAD),
  score: z.number().int().min(0).max(100).default(0),
  tags: z.array(z.string().trim().min(1)).default([])
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  nextFollowUpAt: z.string().datetime().nullable().optional(),
  lastContactedAt: z.string().datetime().nullable().optional(),
  convertedAt: z.string().datetime().nullable().optional()
});

export const createTagSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#00d4ff")
});

export const createNoteSchema = z.object({
  entityType: z.enum(["client", "lead"]),
  entityId: z.string().uuid(),
  body: z.string().trim().min(1),
  pinned: z.boolean().default(false)
});

export const createCommunicationSchema = z.object({
  entityType: z.enum(["client", "lead"]),
  entityId: z.string().uuid(),
  type: z.nativeEnum(CommunicationType),
  direction: z.nativeEnum(CommunicationDirection),
  subject: z.string().trim().optional(),
  body: z.string().trim().min(1),
  occurredAt: z.string().datetime().optional()
});

export const taskListSchema = paginationSchema.extend({
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(TaskPriority).optional(),
  entityType: z.enum(["client", "lead"]).optional(),
  entityId: z.string().uuid().optional()
});

export const createTaskSchema = z.object({
  entityType: z.enum(["client", "lead"]).optional(),
  entityId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  title: z.string().trim().min(2),
  description: z.string().trim().optional(),
  dueAt: z.string().datetime(),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.OPEN),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM)
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().nullable().optional()
});

const moduleKeySchema = z.enum(["saved-filters", "saved-views", "editable-columns", "custom-fields"]);
const jsonObjectSchema = z.record(z.unknown());

export const crmExtensionModuleSchema = z.object({
  isEnabled: z.boolean(),
  settings: jsonObjectSchema.optional().nullable()
});

export const crmSavedFilterSchema = z.object({
  moduleKey: z.literal("saved-filters").default("saved-filters"),
  target: z.nativeEnum(CrmExtensionTarget),
  name: z.string().trim().min(2).max(120),
  criteria: jsonObjectSchema,
  isShared: z.boolean().default(false)
});

export const crmSavedViewSchema = z.object({
  moduleKey: z.literal("saved-views").default("saved-views"),
  target: z.nativeEnum(CrmExtensionTarget),
  filterId: z.string().uuid().optional().nullable(),
  name: z.string().trim().min(2).max(120),
  columns: z.array(z.string().min(1)).optional().nullable(),
  sort: jsonObjectSchema.optional().nullable(),
  layout: jsonObjectSchema.optional().nullable(),
  isDefault: z.boolean().default(false),
  isShared: z.boolean().default(false)
});

export const crmColumnPreferenceSchema = z.object({
  moduleKey: z.literal("editable-columns").default("editable-columns"),
  target: z.nativeEnum(CrmExtensionTarget),
  columnKey: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(120),
  visible: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
  width: z.number().int().min(80).max(600).optional().nullable(),
  pinned: z.boolean().default(false)
});

export const crmCustomFieldSchema = z.object({
  moduleKey: z.literal("custom-fields").default("custom-fields"),
  target: z.nativeEnum(CrmExtensionTarget),
  key: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z][a-z0-9_]*$/),
  label: z.string().trim().min(2).max(120),
  type: z.nativeEnum(CrmCustomFieldType),
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).optional().nullable(),
  defaultValue: z.unknown().optional().nullable(),
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0)
});

export const crmExtensionListSchema = z.object({
  target: z.nativeEnum(CrmExtensionTarget).optional(),
  moduleKey: moduleKeySchema.optional()
});
