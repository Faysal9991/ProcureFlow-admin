import { z } from "zod";

export const departmentFormSchema = z.object({
  description: z.string().trim(),
  name: z.string().trim().min(1, "Department name is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
