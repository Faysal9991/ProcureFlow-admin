"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Search, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/store/auth-store";
import {
  attachmentLookupSchema,
  type AttachmentLookupValues,
} from "../schemas";
import type { AttachmentFilters } from "../types";
import {
  attachmentEntityOptions,
  canViewAttachments,
  getAttachmentEntityLabel,
} from "../utils";
import { AttachmentSection } from "./attachment-section";

export function AttachmentsLookupPage() {
  const permissions = useAuthStore((state) => state.permissions);
  const user = useAuthStore((state) => state.user);
  const canView = canViewAttachments(permissions, user?.role);
  const [lookup, setLookup] = useState<AttachmentFilters | null>(null);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<AttachmentLookupValues>({
    defaultValues: {
      entityId: "",
      entityType: "PURCHASE_REQUEST",
    },
    resolver: zodResolver(attachmentLookupSchema),
  });

  function onSubmit(values: AttachmentLookupValues) {
    setLookup({
      entityId: values.entityId.trim(),
      entityType: values.entityType,
    });
  }

  if (!canView) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Management" title="Attachments">
          Look up files attached to procurement records.
        </PageHeader>
        <Card>
          <CardContent className="p-8">
            <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
              <div>
                <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">
                  Attachment access unavailable
                </p>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Attachment lookup is available to tenant users with attachment
                  view permission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Management" title="Attachments">
        Manually look up files attached to a specific procurement record.
      </PageHeader>

      <Card>
        <CardContent className="p-5">
          <div className="mb-5 flex gap-3 rounded-lg border border-info/20 bg-info/10 p-3 text-sm text-info">
            <ExternalLink className="mt-0.5 size-4 shrink-0" />
            <p>
              Open a record detail page to manage attachments more easily. This
              lookup requires both an entity type and the record UUID.
            </p>
          </div>

          <form
            className="grid gap-4 lg:grid-cols-[240px_minmax(260px,1fr)_auto]"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Label htmlFor="attachment-entity-type">Entity Type</Label>
              <select
                id="attachment-entity-type"
                className={selectClassName}
                {...register("entityType")}
              >
                {attachmentEntityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.entityType ? (
                <p className="text-sm text-error">
                  {errors.entityType.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachment-entity-id">Entity UUID</Label>
              <Input
                id="attachment-entity-id"
                aria-invalid={!!errors.entityId}
                placeholder="Paste record UUID"
                {...register("entityId")}
              />
              {errors.entityId ? (
                <p className="text-sm text-error">{errors.entityId.message}</p>
              ) : null}
            </div>

            <div className="flex items-end">
              <Button className="w-full lg:w-auto" type="submit">
                <Search className="size-4" />
                Load Attachments
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {lookup ? (
        <AttachmentSection
          description={`Files attached to ${getAttachmentEntityLabel(
            lookup.entityType,
          )} ${lookup.entityId}.`}
          entityId={lookup.entityId}
          entityType={lookup.entityType}
          title="Lookup Results"
        />
      ) : null}
    </div>
  );
}

const selectClassName = cn(
  "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2",
  "text-sm text-foreground outline-none transition-colors",
  "focus:border-primary focus:ring-4 focus:ring-ring",
);
