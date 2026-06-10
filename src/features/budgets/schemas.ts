import { z } from "zod";

export const budgetFormSchema = z
  .object({
    allocatedAmount: z
      .number({ error: "Allocated amount is required" })
      .positive("Allocated amount must be greater than zero"),
    departmentId: z.string().trim().min(1, "Department is required"),
    name: z.string().trim().min(1, "Budget name is required"),
    periodEndDate: z.string().trim().min(1, "Period end date is required"),
    periodStartDate: z.string().trim().min(1, "Period start date is required"),
    periodType: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
  })
  .refine((values) => values.periodEndDate >= values.periodStartDate, {
    message: "Period end date must be on or after start date",
    path: ["periodEndDate"],
  });

export const budgetAdjustmentSchema = z.object({
  amount: z
    .number({ error: "Adjustment amount is required" })
    .refine((value) => value !== 0, "Adjustment amount cannot be zero"),
  note: z.string().trim().optional(),
});

export const budgetAvailabilitySchema = z.object({
  amount: z
    .number({ error: "Amount is required" })
    .min(0, "Amount cannot be negative"),
  date: z.string().trim().min(1, "Date is required"),
});

export type BudgetAdjustmentValues = z.infer<typeof budgetAdjustmentSchema>;
export type BudgetAvailabilityValues = z.infer<typeof budgetAvailabilitySchema>;
export type BudgetFormValues = z.infer<typeof budgetFormSchema>;
