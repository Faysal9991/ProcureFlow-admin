import { z } from "zod";

export const workflowApproverRoleSchema = z.enum([
  "MANAGER",
  "PROCUREMENT",
  "FINANCE",
  "COMPANY_ADMIN",
]);

const optionalAmountSchema = z
  .string()
  .trim()
  .optional()
  .refine((value) => value == null || value === "" || Number(value) >= 0, {
    message: "Amount cannot be negative",
  });

export const workflowFormSchema = z
  .object({
    departmentId: z.string().trim().optional(),
    isActive: z.boolean(),
    isDefault: z.boolean(),
    maxAmount: optionalAmountSchema,
    minAmount: optionalAmountSchema,
    name: z.string().trim().min(1, "Name is required"),
    priority: z.number().int("Priority must be a whole number"),
  })
  .superRefine((values, context) => {
    const min = values.minAmount ? Number(values.minAmount) : null;
    const max = values.maxAmount ? Number(values.maxAmount) : null;

    if (min != null && max != null && max < min) {
      context.addIssue({
        code: "custom",
        message: "Max amount must be greater than or equal to min amount",
        path: ["maxAmount"],
      });
    }
  });

export const workflowStepFormSchema = z.object({
  departmentId: z.string().trim().optional(),
  isRequired: z.literal(true),
  role: workflowApproverRoleSchema,
  stepOrder: z.number().int("Step order must be a whole number").min(1),
});

export type WorkflowFormValues = z.infer<typeof workflowFormSchema>;
export type WorkflowStepFormValues = z.infer<typeof workflowStepFormSchema>;
