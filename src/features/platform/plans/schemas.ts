import { z } from "zod";

const optionalPositiveInteger = z
  .string()
  .trim()
  .refine((value) => value === "" || /^\d+$/.test(value), {
    message: "Enter a whole number or leave blank for unlimited",
  })
  .refine((value) => value === "" || Number(value) > 0, {
    message: "Limit must be greater than 0",
  });

export const platformPlanFormSchema = z.object({
  isActive: z.boolean(),
  maxDepartments: optionalPositiveInteger,
  maxRequestsPerMonth: optionalPositiveInteger,
  maxStorageMb: optionalPositiveInteger,
  maxUsers: optionalPositiveInteger,
  name: z.string().trim().min(1, "Plan name is required"),
  price: z.number().min(0, "Price cannot be negative"),
});

export type PlatformPlanFormValues = z.infer<typeof platformPlanFormSchema>;
