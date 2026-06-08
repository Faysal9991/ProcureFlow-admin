import { z } from "zod";

const optionalEmailSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || z.string().email().safeParse(value).success,
    "Enter a valid email address",
  );

export const vendorFormSchema = z.object({
  address: z.string().trim(),
  contactPerson: z.string().trim(),
  email: optionalEmailSchema,
  name: z.string().trim().min(1, "Vendor name is required"),
  phone: z.string().trim(),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;
