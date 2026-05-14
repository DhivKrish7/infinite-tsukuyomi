import { z } from "zod";

const positiveMoney = z
  .string()
  .regex(/^\d+(\.\d{1,2})?$/, "Amount must be a decimal string")
  .refine((value) => Number(value) > 0, "Amount must be positive");

export const financeTransactionListSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL", "TRANSFER", "FEE", "COMMISSION"]).optional(),
  status: z.enum(["PENDING", "APPROVED", "COMPLETED", "FAILED", "REJECTED", "CANCELLED"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25)
});

export const createFinanceTransactionSchema = z.object({
  clientId: z.string().uuid(),
  walletId: z.string().uuid().optional(),
  gatewayConnectionId: z.string().uuid().optional(),
  type: z.enum(["DEPOSIT", "WITHDRAWAL"]),
  amount: positiveMoney,
  currency: z.string().min(3).max(3).default("USD"),
  method: z.string().max(80).optional(),
  reference: z.string().max(120).optional()
});

export const approveFinanceTransactionSchema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  comment: z.string().max(500).optional()
});

export const flagFinanceTransactionSchema = z.object({
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("HIGH"),
  ruleCode: z.string().max(80).default("MANUAL_REVIEW"),
  reason: z.string().min(3).max(500)
});
