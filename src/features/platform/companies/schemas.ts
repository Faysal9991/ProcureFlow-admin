import { z } from "zod";

const optionalDate = z.string().trim().optional();

export const platformCompanyCreateSchema = z
  .object({
    adminEmail: z.string().trim().email("Enter a valid admin email"),
    adminName: z.string().trim().min(1, "Admin name is required"),
    adminPhone: z.string().trim().optional(),
    companyAddress: z.string().trim().optional(),
    companyEmail: z.string().trim().email("Enter a valid company email"),
    companyName: z.string().trim().min(1, "Company name is required"),
    companyPhone: z.string().trim().optional(),
    planId: z.string().trim().min(1, "Plan is required"),
    subscriptionEndDate: optionalDate,
    subscriptionStartDate: optionalDate,
  })
  .superRefine((values, ctx) => {
    if (
      values.subscriptionStartDate &&
      values.subscriptionEndDate &&
      values.subscriptionEndDate < values.subscriptionStartDate
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "End date cannot be before start date",
        path: ["subscriptionEndDate"],
      });
    }
  });

export const platformCompanyEditSchema = z.object({
  address: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid company email"),
  name: z.string().trim().min(1, "Company name is required"),
  phone: z.string().trim().optional(),
  requireRfqBeforePo: z.boolean(),
});

export type PlatformCompanyCreateValues = z.infer<
  typeof platformCompanyCreateSchema
>;
export type PlatformCompanyEditValues = z.infer<
  typeof platformCompanyEditSchema
>;
