import { z } from "zod";

export const purchaseOrderItemFormSchema = z.object({
  description: z.string().optional(),
  itemName: z.string().min(1),
  purchaseRequestItemId: z.string().min(1),
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  unit: z.string().min(1),
  unitPrice: z.number().gte(0, "Unit price cannot be negative"),
});

export const purchaseOrderFormSchema = z
  .object({
    items: z.array(purchaseOrderItemFormSchema),
    mode: z.enum(["direct", "quotation"]),
    notes: z.string().optional(),
    purchaseRequestId: z.string().optional(),
    quotationId: z.string().optional(),
    rfqId: z.string().optional(),
    vendorId: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    if (values.mode === "quotation") {
      if (!values.rfqId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Select a completed RFQ",
          path: ["rfqId"],
        });
      }
      if (!values.quotationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Selected quotation is required",
          path: ["quotationId"],
        });
      }
      return;
    }

    if (!values.purchaseRequestId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select an approved purchase request",
        path: ["purchaseRequestId"],
      });
    }
    if (!values.vendorId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a vendor",
        path: ["vendorId"],
      });
    }
    if (values.items.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one purchase request item is required",
        path: ["items"],
      });
    }
  });

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderFormSchema>;
