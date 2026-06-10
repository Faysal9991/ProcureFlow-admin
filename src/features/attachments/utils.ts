import type { Attachment, AttachmentEntityType } from "./types";

export const ATTACHMENT_MAX_SIZE_BYTES = 10 * 1024 * 1024;

export const allowedAttachmentExtensions = ["pdf", "jpg", "jpeg", "png", "docx", "xlsx"];

export const attachmentEntityOptions: {
  label: string;
  value: AttachmentEntityType;
}[] = [
  { label: "Purchase Request", value: "PURCHASE_REQUEST" },
  { label: "Purchase Order", value: "PURCHASE_ORDER" },
  { label: "Invoice", value: "INVOICE" },
  { label: "Payment", value: "PAYMENT" },
  { label: "Vendor", value: "VENDOR" },
];

export function canViewAttachments(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("attachment.view");
}

export function canUploadAttachments(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("attachment.upload");
}

export function canDeleteAttachments(permissions: string[], role?: string) {
  return role !== "SUPER_ADMIN" && permissions.includes("attachment.delete");
}

export function getAttachmentEntityLabel(entityType: string) {
  return (
    attachmentEntityOptions.find((option) => option.value === entityType)?.label ??
    entityType
  );
}

export function formatAttachmentSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

export function formatAttachmentDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function validateAttachmentFile(file: File | null) {
  if (!file) {
    return "Select a file to upload.";
  }

  if (file.size <= 0) {
    return "The selected file is empty.";
  }

  if (file.size > ATTACHMENT_MAX_SIZE_BYTES) {
    return "File size must be 10MB or less.";
  }

  const extension = getFileExtension(file.name);

  if (!allowedAttachmentExtensions.includes(extension)) {
    return "Allowed file types: PDF, JPG, PNG, DOCX, XLSX.";
  }

  return "";
}

export function getAttachmentMutationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("forbidden")) {
    return "You do not have permission to manage attachments for this record.";
  }

  if (normalized.includes("file exceeds")) {
    return "File size must be 10MB or less.";
  }

  if (normalized.includes("unsupported file")) {
    return "Allowed file types: PDF, JPG, PNG, DOCX, XLSX.";
  }

  if (normalized.includes("goods_receive")) {
    return "Goods receive attachments are not supported yet.";
  }

  return message;
}

export function getAttachmentDisplayName(attachment: Attachment) {
  return attachment.originalFileName || attachment.fileName;
}

function getFileExtension(fileName: string) {
  return fileName.split(".").pop()?.trim().toLowerCase() ?? "";
}
