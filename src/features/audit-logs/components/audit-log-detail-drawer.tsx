"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AuditLog } from "../types";
import {
  formatAuditDate,
  formatAuditLabel,
} from "../utils";
import { AuditJsonDiff } from "./audit-json-diff";

type AuditLogDetailDrawerProps = {
  log: AuditLog | null;
  onClose: () => void;
};

export function AuditLogDetailDrawer({
  log,
  onClose,
}: AuditLogDetailDrawerProps) {
  if (!log) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close audit log detail"
        className="absolute inset-0 bg-foreground/30"
        type="button"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-4xl flex-col bg-surface shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border p-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Audit Log Detail
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatAuditLabel(log.action)} on{" "}
              {formatAuditLabel(log.entityType)}
            </p>
          </div>
          <Button
            aria-label="Close"
            size="icon"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailItem label="Action" value={formatAuditLabel(log.action)} />
            <DetailItem
              label="Actor"
              value={log.user?.name || log.user?.email || "System"}
            />
            <DetailItem
              label="Actor Role"
              value={formatAuditLabel(log.user?.role)}
            />
            <DetailItem
              label="Entity"
              value={`${formatAuditLabel(log.entityType)} ${log.entityId || ""}`}
            />
            <DetailItem label="IP Address" value={log.ipAddress || "Not set"} />
            <DetailItem
              label="Timestamp"
              value={formatAuditDate(log.createdAt)}
            />
          </div>

          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-medium uppercase text-muted-foreground">
              User Agent
            </p>
            <p className="mt-2 break-words text-sm text-foreground">
              {log.userAgent || "Not set"}
            </p>
          </div>

          <AuditJsonDiff newData={log.newData} oldData={log.oldData} />
        </div>
      </aside>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="text-xs font-medium uppercase text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-medium text-foreground">
        {value || "Not set"}
      </p>
    </div>
  );
}
