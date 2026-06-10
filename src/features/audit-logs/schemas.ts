import { z } from "zod";

export const auditLogFiltersSchema = z.object({
  action: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  entityId: z.string().trim().optional(),
  entityType: z.string().optional(),
  userId: z.string().trim().optional(),
});

export type AuditLogFiltersFormValues = z.infer<typeof auditLogFiltersSchema>;
