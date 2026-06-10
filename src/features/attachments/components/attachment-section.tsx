"use client";

import { Paperclip, Plus, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import { useAttachmentDownloadURL, useAttachments } from "../hooks";
import type { Attachment, AttachmentEntityType } from "../types";
import {
  canDeleteAttachments,
  canUploadAttachments,
  canViewAttachments,
  getAttachmentMutationError,
} from "../utils";
import { AttachmentDeleteDialog } from "./attachment-delete-dialog";
import { AttachmentList } from "./attachment-list";
import { AttachmentUploadDialog } from "./attachment-upload-dialog";

type AttachmentSectionProps = {
  description?: string;
  entityId: string;
  entityType: AttachmentEntityType;
  title?: string;
};

export function AttachmentSection({
  description = "Upload and manage supporting files for this record.",
  entityId,
  entityType,
  title = "Attachments",
}: AttachmentSectionProps) {
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);
  const filters = useMemo(() => ({ entityId, entityType }), [entityId, entityType]);
  const canView = canViewAttachments(permissions, user?.role);
  const canUpload = canUploadAttachments(permissions, user?.role);
  const canDelete = canDeleteAttachments(permissions, user?.role);
  const attachmentsQuery = useAttachments(filters, canView);
  const downloadMutation = useAttachmentDownloadURL();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [deletingAttachment, setDeletingAttachment] =
    useState<Attachment | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const attachments = attachmentsQuery.data?.items ?? [];

  function handleDownload(attachment: Attachment) {
    setDownloadError("");
    setDownloadingId(attachment.id);
    downloadMutation.mutate(attachment.id, {
      onError: (error) => {
        setDownloadError(getAttachmentMutationError(getApiErrorMessage(error)));
        setDownloadingId(null);
      },
      onSuccess: (data) => {
        setDownloadingId(null);
        window.open(data.downloadUrl, "_blank", "noopener,noreferrer");
      },
    });
  }

  if (!canView) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Attachment access unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                You do not have permission to view attachments for this record.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="size-5 text-primary" />
            {title}
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {canUpload ? (
          <Button onClick={() => setIsUploadOpen(true)}>
            <Plus className="size-4" />
            Upload File
          </Button>
        ) : null}
      </CardHeader>

      {downloadError ? (
        <div className="mx-5 mb-4 rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
          {downloadError}
        </div>
      ) : null}

      {!canUpload ? (
        <div className="mx-5 mb-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
          You can view and download attachments, but upload is unavailable for
          this account.
        </div>
      ) : null}

      <AttachmentList
        attachments={attachments}
        canDelete={canDelete}
        downloadingId={downloadingId}
        error={attachmentsQuery.error}
        isError={attachmentsQuery.isError}
        isLoading={attachmentsQuery.isLoading}
        onDelete={setDeletingAttachment}
        onDownload={handleDownload}
      />

      <AttachmentUploadDialog
        filters={filters}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      <AttachmentDeleteDialog
        attachment={deletingAttachment}
        filters={filters}
        onClose={() => setDeletingAttachment(null)}
      />
    </Card>
  );
}
