export type AttachmentEntityType =
  | "PURCHASE_REQUEST"
  | "PURCHASE_ORDER"
  | "INVOICE"
  | "PAYMENT"
  | "VENDOR";

export type AttachmentUploader = {
  id: string;
  name: string;
  role: string;
};

export type Attachment = {
  createdAt: string;
  entityId: string;
  entityType: AttachmentEntityType | string;
  fileName: string;
  fileSize: number;
  id: string;
  mimeType: string;
  originalFileName: string;
  updatedAt: string;
  uploadedBy: AttachmentUploader;
};

export type AttachmentListData = {
  items: Attachment[];
  total: number;
};

export type AttachmentFilters = {
  entityId: string;
  entityType: AttachmentEntityType;
};

export type UploadAttachmentRequest = AttachmentFilters & {
  file: File;
};

export type DownloadURLData = {
  downloadUrl: string;
  expiresInSeconds: number;
};
