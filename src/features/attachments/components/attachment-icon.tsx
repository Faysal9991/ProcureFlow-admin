"use client";

import {
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  Paperclip,
} from "lucide-react";

type AttachmentIconProps = {
  className?: string;
  mimeType?: string;
  name?: string;
};

export function AttachmentIcon({
  className,
  mimeType = "",
  name = "",
}: AttachmentIconProps) {
  const normalized = `${mimeType} ${name}`.toLowerCase();

  if (normalized.includes("image") || /\.(jpg|jpeg|png)$/.test(normalized)) {
    return <FileImage className={className} />;
  }

  if (normalized.includes("spreadsheet") || normalized.includes(".xlsx")) {
    return <FileSpreadsheet className={className} />;
  }

  if (normalized.includes("pdf") || normalized.includes(".pdf")) {
    return <FileText className={className} />;
  }

  if (normalized.includes("zip") || /\.(docx|xlsx)$/.test(normalized)) {
    return <FileArchive className={className} />;
  }

  return <Paperclip className={className} />;
}
