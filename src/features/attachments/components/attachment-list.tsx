"use client";

import { Download, Inbox, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api/client";
import type { Attachment } from "../types";
import {
  formatAttachmentDate,
  formatAttachmentSize,
  getAttachmentDisplayName,
} from "../utils";
import { AttachmentIcon } from "./attachment-icon";

type AttachmentListProps = {
  attachments: Attachment[];
  canDelete: boolean;
  downloadingId?: string | null;
  error?: unknown;
  isError: boolean;
  isLoading: boolean;
  onDelete: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
};

export function AttachmentList({
  attachments,
  canDelete,
  downloadingId,
  error,
  isError,
  isLoading,
  onDelete,
  onDownload,
}: AttachmentListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-5">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[1.4fr_120px_160px_160px_120px]"
          >
            <div className="h-4 rounded-md bg-muted" />
            <div className="h-4 rounded-md bg-muted" />
            <div className="h-4 rounded-md bg-muted" />
            <div className="h-4 rounded-md bg-muted" />
            <div className="h-4 rounded-md bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <CardContent className="p-8">
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
              <ShieldAlert className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              Attachments unavailable
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {getApiErrorMessage(error)}
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  if (attachments.length === 0) {
    return (
      <CardContent className="p-8">
        <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
          <div>
            <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <p className="mt-3 text-sm font-medium text-foreground">
              No attachments
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload supporting files for this record.
            </p>
          </div>
        </div>
      </CardContent>
    );
  }

  return (
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => (
            <TableRow key={attachment.id}>
              <TableCell className="min-w-64">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <AttachmentIcon
                      className="size-5"
                      mimeType={attachment.mimeType}
                      name={attachment.originalFileName}
                    />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">
                      {getAttachmentDisplayName(attachment)}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {attachment.fileName}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="min-w-24 text-muted-foreground">
                {formatAttachmentSize(attachment.fileSize)}
              </TableCell>
              <TableCell className="min-w-40 text-muted-foreground">
                {attachment.mimeType || "Not set"}
              </TableCell>
              <TableCell className="min-w-40 text-muted-foreground">
                {attachment.uploadedBy.name || "Unknown"}
              </TableCell>
              <TableCell className="min-w-32 text-muted-foreground">
                {formatAttachmentDate(attachment.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    isLoading={downloadingId === attachment.id}
                    size="sm"
                    variant="outline"
                    onClick={() => onDownload(attachment)}
                  >
                    <Download className="size-4" />
                    Download
                  </Button>
                  {canDelete ? (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => onDelete(attachment)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  );
}
