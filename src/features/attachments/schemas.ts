import { z } from "zod";

export const attachmentEntityTypeSchema = z.enum([
  "PURCHASE_REQUEST",
  "PURCHASE_ORDER",
  "INVOICE",
  "PAYMENT",
  "VENDOR",
]);

export const attachmentLookupSchema = z.object({
  entityId: z.string().trim().min(1, "Entity UUID is required"),
  entityType: attachmentEntityTypeSchema,
});

export type AttachmentLookupValues = z.infer<typeof attachmentLookupSchema>;
