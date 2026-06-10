import { z } from "zod";

export const platformAssignPlanSchema = z
  .object({
    companyId: z.string().trim().min(1, "Company is required"),
    endDate: z.string().trim().optional(),
    planId: z.string().trim().min(1, "Plan is required"),
    startDate: z.string().trim().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.startDate && values.endDate && values.endDate < values.startDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date",
        path: ["endDate"],
      });
    }
  });

export type PlatformAssignPlanValues = z.infer<
  typeof platformAssignPlanSchema
>;
