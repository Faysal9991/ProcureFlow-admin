import { z } from "zod";

export const createPlatformBillingInvoiceSchema = z
  .object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    billingPeriodEnd: z.string().trim().min(1, "Period end is required"),
    billingPeriodStart: z.string().trim().min(1, "Period start is required"),
    companyId: z.string().trim().min(1, "Company is required"),
    dueDate: z.string().trim().min(1, "Due date is required"),
    notes: z.string().trim().optional(),
    planId: z.string().trim().optional(),
    subscriptionId: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (
      values.billingPeriodStart &&
      values.billingPeriodEnd &&
      values.billingPeriodEnd < values.billingPeriodStart
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Period end cannot be before period start",
        path: ["billingPeriodEnd"],
      });
    }
    if (!values.subscriptionId && !values.planId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a subscription-backed company or choose a plan",
        path: ["planId"],
      });
    }
  });

export const recordPlatformBillingPaymentSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  notes: z.string().trim().optional(),
  paymentDate: z.string().trim().optional(),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  referenceNumber: z.string().trim().optional(),
});

export type CreatePlatformBillingInvoiceValues = z.infer<
  typeof createPlatformBillingInvoiceSchema
>;
export type RecordPlatformBillingPaymentValues = z.infer<
  typeof recordPlatformBillingPaymentSchema
>;
