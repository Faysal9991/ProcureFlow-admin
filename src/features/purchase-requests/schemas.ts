import { z } from "zod";

export const purchaseRequestPrioritySchema = z.enum([
  "LOW",
  "NORMAL",
  "HIGH",
  "URGENT",
]);

const dateMessage = "Use YYYY-MM-DD format";

export const purchaseRequestItemFormSchema = z.object({
  description: z.string().trim().optional(),
  estimatedUnitPrice: z
    .number({ message: "Estimated unit price is required" })
    .min(0, "Estimated unit price cannot be negative"),
  itemName: z.string().trim().min(1, "Item name is required"),
  quantity: z
    .number({ message: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
  unit: z.string().trim().min(1, "Unit is required"),
});

export const purchaseRequestFormSchema = z.object({
  description: z.string().trim().optional(),
  items: z
    .array(purchaseRequestItemFormSchema)
    .min(1, "At least one item is required"),
  neededDate: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), {
      message: dateMessage,
    }),
  priority: purchaseRequestPrioritySchema,
  title: z.string().trim().min(1, "Title is required"),
});

export type PurchaseRequestFormValues = z.infer<
  typeof purchaseRequestFormSchema
>;
