import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  Attachment,
  AttachmentFilters,
  AttachmentListData,
  DownloadURLData,
  UploadAttachmentRequest,
} from "./types";

const emptyAttachmentList: AttachmentListData = {
  items: [],
  total: 0,
};

function normalizeAttachmentList(data?: AttachmentListData): AttachmentListData {
  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
  };
}

export async function getAttachments(filters: AttachmentFilters) {
  const response = await apiClient.get<ApiResponse<AttachmentListData>>(
    "/attachments",
    {
      params: filters,
    },
  );

  return normalizeAttachmentList(response.data.data ?? emptyAttachmentList);
}

export async function uploadAttachment({
  entityId,
  entityType,
  file,
}: UploadAttachmentRequest) {
  const formData = new FormData();
  formData.append("entityType", entityType);
  formData.append("entityId", entityId);
  formData.append("file", file);

  const response = await apiClient.post<ApiResponse<Attachment>>(
    "/attachments/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data.data;
}

export async function getAttachmentDownloadURL(id: string) {
  const response = await apiClient.get<ApiResponse<DownloadURLData>>(
    `/attachments/${id}/download-url`,
  );

  return response.data.data;
}

export async function deleteAttachment(id: string) {
  await apiClient.delete<ApiResponse<null>>(`/attachments/${id}`);
}
