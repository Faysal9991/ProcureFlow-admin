import { z } from "zod";

export const companyProfileSchema = z.object({
  address: z.string().trim().optional(),
  email: z.string().trim().email("Enter a valid company email"),
  logoUrl: z
    .string()
    .trim()
    .refine((value) => value === "" || isHttpUrl(value), {
      message: "Logo URL must be a valid URL",
    }),
  name: z.string().trim().min(1, "Company name is required"),
  phone: z.string().trim().optional(),
});

export const procurementSettingsSchema = z.object({
  budgetEnforcementEnabled: z.boolean(),
  defaultCurrency: z
    .string()
    .trim()
    .length(3, "Use a 3-letter currency code")
    .transform((value) => value.toUpperCase()),
  defaultWorkflowId: z.string().trim().optional(),
  fiscalYearStartMonth: z
    .number()
    .int()
    .min(1, "Month must be between 1 and 12")
    .max(12, "Month must be between 1 and 12"),
  requireRfqBeforePo: z.boolean(),
});

export const securitySettingsSchema = z
  .object({
    passwordMaxAgeDays: z.number().int().positive().optional(),
    passwordRotationEnabled: z.boolean(),
    sessionExpiryHours: z
      .number()
      .int()
      .positive("Session expiry must be positive"),
  })
  .superRefine((values, ctx) => {
    if (values.passwordRotationEnabled && !values.passwordMaxAgeDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password max age is required when rotation is enabled",
        path: ["passwordMaxAgeDays"],
      });
    }
  });

export type CompanyProfileValues = z.infer<typeof companyProfileSchema>;
export type ProcurementSettingsValues = z.infer<
  typeof procurementSettingsSchema
>;
export type SecuritySettingsValues = z.infer<typeof securitySettingsSchema>;

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
