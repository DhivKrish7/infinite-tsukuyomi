import { BrokerSyncType } from "@prisma/client";
import { z } from "zod";

export const createBrokerConnectionSchema = z.object({
  adapterKey: z.string().min(1),
  displayName: z.string().min(2),
  platformName: z.string().min(2),
  platformType: z.string().min(2),
  credentials: z.record(z.unknown()).default({}),
  settings: z.record(z.unknown()).default({})
});

export const triggerBrokerSyncSchema = z.object({
  types: z.array(z.nativeEnum(BrokerSyncType)).min(1).optional()
});
