import { z } from "zod";

export const roleFormSchema = z.object({
  description: z.string().trim().optional(),
  isActive: z.boolean(),
  name: z.string().trim().min(1, "Role name is required"),
  permissionIds: z.array(z.string().trim()).optional(),
});

export const assignRoleSchema = z.object({
  roleId: z.string().trim().min(1, "Company role is required"),
  userId: z.string().trim().min(1, "User is required"),
});

export type RoleFormValues = z.infer<typeof roleFormSchema>;
export type AssignRoleValues = z.infer<typeof assignRoleSchema>;
