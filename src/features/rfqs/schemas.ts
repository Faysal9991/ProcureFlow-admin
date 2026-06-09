import { z } from "zod";

export const rfqFormSchema = z.object({
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  purchaseRequestId: z.string().min(1, "Select an approved request"),
});

export const addVendorsSchema = z.object({
  vendorIds: z.array(z.string()).min(1, "Select at least one vendor"),
});

export const quotationItemSchema = z.object({
  itemName: z.string().min(1),
  quantity: z.number(),
  rfqItemId: z.string().min(1),
  unit: z.string().min(1),
  unitPrice: z.number().gte(0, "Unit price cannot be negative"),
});

export const quotationFormSchema = z.object({
  items: z.array(quotationItemSchema).min(1, "Quotation items are required"),
  notes: z.string().optional(),
  quotationDate: z.string().optional(),
  quotationNumber: z.string().optional(),
  validUntil: z.string().optional(),
  vendorId: z.string().min(1, "Select a vendor"),
});

export type RFQFormValues = z.infer<typeof rfqFormSchema>;
export type AddVendorsValues = z.infer<typeof addVendorsSchema>;
export type QuotationFormValues = z.infer<typeof quotationFormSchema>;
