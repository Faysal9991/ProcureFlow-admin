import { z } from "zod";

const optionalText = z.string().trim().optional();
const optionalDate = z.string().trim().optional();
const numberFromInput = z.number();

export const invoiceFormSchema = z.object({
  dueDate: z.string().trim().min(1, "Due date is required"),
  invoiceAmount: numberFromInput.gt(0, "Amount must be greater than 0"),
  invoiceDate: z.string().trim().min(1, "Invoice date is required"),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  notes: optionalText,
  purchaseOrderId: z.string().trim().min(1, "Select a received purchase order"),
});

export const paymentFormSchema = z.object({
  amount: numberFromInput.gt(0, "Payment amount must be greater than 0"),
  notes: optionalText,
  paymentDate: optionalDate,
  paymentMethod: z.string().trim(),
  referenceNumber: optionalText,
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
