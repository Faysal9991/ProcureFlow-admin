"use client";

import { UploadCloud, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import { cn } from "@/lib/utils/cn";
import { useUploadAttachment } from "../hooks";
import type { AttachmentFilters } from "../types";
import {
  formatAttachmentSize,
  getAttachmentMutationError,
  validateAttachmentFile,
} from "../utils";

type AttachmentUploadDialogProps = {
  filters: AttachmentFilters;
  isOpen: boolean;
  onClose: () => void;
};

export function AttachmentUploadDialog({
  filters,
  isOpen,
  onClose,
}: AttachmentUploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState("");
  const mutation = useUploadAttachment(filters);

  if (!isOpen) {
    return null;
  }

  function resetState() {
    setSelectedFile(null);
    setApiError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (!mutation.isPending) {
      resetState();
      onClose();
    }
  }

  function handleFile(file: File | null) {
    setApiError("");
    setSelectedFile(file);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    handleFile(event.dataTransfer.files.item(0));
  }

  function handleUpload() {
    const validationMessage = validateAttachmentFile(selectedFile);

    if (validationMessage || !selectedFile) {
      setApiError(validationMessage);
      return;
    }

    setApiError("");
    mutation.mutate(
      {
        ...filters,
        file: selectedFile,
      },
      {
        onError: (error) => {
          setApiError(getAttachmentMutationError(getApiErrorMessage(error)));
        },
        onSuccess: () => {
          resetState();
          onClose();
        },
      },
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Close upload attachment dialog"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={handleClose}
      />
      <div className="relative w-full max-w-lg rounded-lg border border-border bg-surface p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Upload attachment
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a supporting file to this record.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={mutation.isPending}
            size="icon"
            variant="ghost"
            onClick={handleClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          <button
            className={cn(
              "flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center transition-colors",
              "hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-4 focus:ring-ring",
            )}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UploadCloud className="size-6" />
            </span>
            <span className="mt-3 text-sm font-medium text-foreground">
              {selectedFile ? selectedFile.name : "Choose or drop a file"}
            </span>
            {selectedFile ? (
              <span className="mt-1 text-sm text-muted-foreground">
                {formatAttachmentSize(selectedFile.size)}
              </span>
            ) : (
              <span className="mt-1 text-sm text-muted-foreground">
                Allowed: PDF, JPG, PNG, DOCX, XLSX. Max size: 10MB.
              </span>
            )}
          </button>
          <input
            ref={fileInputRef}
            accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
            className="hidden"
            type="file"
            onChange={(event) => handleFile(event.target.files?.item(0) ?? null)}
          />

          {apiError ? (
            <div className="rounded-lg border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {apiError}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            disabled={mutation.isPending}
            type="button"
            variant="outline"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            disabled={!selectedFile}
            isLoading={mutation.isPending}
            type="button"
            onClick={handleUpload}
          >
            Upload file
          </Button>
        </div>
      </div>
    </div>
  );
}
