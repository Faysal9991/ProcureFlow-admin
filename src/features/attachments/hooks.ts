import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAttachment,
  getAttachmentDownloadURL,
  getAttachments,
  uploadAttachment,
} from "./api";
import type { AttachmentFilters } from "./types";

export const attachmentQueryKeys = {
  all: ["attachments"] as const,
  list: (filters: AttachmentFilters) => ["attachments", "list", filters] as const,
};

function invalidateAttachments(
  queryClient: ReturnType<typeof useQueryClient>,
  filters?: AttachmentFilters,
) {
  if (filters) {
    queryClient.invalidateQueries({
      queryKey: attachmentQueryKeys.list(filters),
    });
    return;
  }

  queryClient.invalidateQueries({ queryKey: attachmentQueryKeys.all });
}

export function useAttachments(filters: AttachmentFilters, enabled = true) {
  return useQuery({
    enabled: enabled && !!filters.entityId && !!filters.entityType,
    queryFn: () => getAttachments(filters),
    queryKey: attachmentQueryKeys.list(filters),
  });
}

export function useUploadAttachment(filters: AttachmentFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: () => {
      invalidateAttachments(queryClient, filters);
    },
  });
}

export function useAttachmentDownloadURL() {
  return useMutation({
    mutationFn: getAttachmentDownloadURL,
  });
}

export function useDeleteAttachment(filters: AttachmentFilters) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: () => {
      invalidateAttachments(queryClient, filters);
    },
  });
}
