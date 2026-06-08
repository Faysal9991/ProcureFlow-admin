import { z } from "zod";

export const userRoleSchema = z.enum([
  "COMPANY_ADMIN",
  "EMPLOYEE",
  "MANAGER",
  "PROCUREMENT",
  "FINANCE",
]);

export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

const departmentRequiredMessage = "Department is required for this role";

const baseUserFormSchema = z
  .object({
    companyRoleId: z.string().trim().optional(),
    departmentId: z.string().trim().optional(),
    name: z.string().trim().min(1, "Name is required"),
    phone: z.string().trim().optional(),
    role: userRoleSchema,
    status: userStatusSchema,
  })
  .superRefine((values, context) => {
    if (values.role !== "COMPANY_ADMIN" && !values.departmentId) {
      context.addIssue({
        code: "custom",
        message: departmentRequiredMessage,
        path: ["departmentId"],
      });
    }
  });

export const createUserFormSchema = baseUserFormSchema.extend({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
});

export const updateUserFormSchema = baseUserFormSchema;

export type CreateUserFormValues = z.infer<typeof createUserFormSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserFormSchema>;
export type UserFormValues = CreateUserFormValues | UpdateUserFormValues;
