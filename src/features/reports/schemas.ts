import { z } from "zod";

export const reportFiltersSchema = z.object({
  action: z.string().optional(),
  approverId: z.string().trim().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  departmentId: z.string().optional(),
  paymentMethod: z.string().optional(),
  requestedBy: z.string().trim().optional(),
  status: z.string().optional(),
  vendorId: z.string().optional(),
});

export type ReportFiltersFormValues = z.infer<typeof reportFiltersSchema>;
