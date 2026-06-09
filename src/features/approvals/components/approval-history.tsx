"use client";

import { CheckCircle2, Clock, Inbox, ShieldAlert, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getApiErrorMessage } from "@/lib/api/client";
import { formatRequestDate } from "@/features/purchase-requests/utils";
import { useApprovalHistory } from "../hooks";

type ApprovalHistoryProps = {
  requestId: string;
};

export function ApprovalHistory({ requestId }: ApprovalHistoryProps) {
  const historyQuery = useApprovalHistory(requestId);
  const history = historyQuery.data ?? [];

  if (historyQuery.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-muted" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (historyQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Approval history unavailable
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {getApiErrorMessage(historyQuery.error)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Approval History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Inbox className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                No approval actions yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Actions will appear after a reviewer approves or rejects.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((item, index) => {
            const isApproved = item.action === "APPROVED";
            const isRejected = item.action === "REJECTED";

            return (
              <div
                key={`${item.actionById}-${item.createdAt}-${index}`}
                className="flex gap-3 rounded-lg border border-border bg-background p-4"
              >
                <div
                  className={
                    isApproved
                      ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
                      : isRejected
                        ? "flex size-9 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error"
                        : "flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info"
                  }
                >
                  {isApproved ? (
                    <CheckCircle2 className="size-4" />
                  ) : isRejected ? (
                    <XCircle className="size-4" />
                  ) : (
                    <Clock className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">
                      {item.actionByName || "Reviewer"}
                    </p>
                    <Badge variant={isApproved ? "success" : "error"}>
                      {isApproved ? "Approved" : "Rejected"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Step {item.stepOrder || 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.actionByRole}
                    {item.approverRole ? ` acting as ${item.approverRole}` : ""}
                    {" · "}
                    {formatRequestDate(item.createdAt)}
                  </p>
                  {item.comment ? (
                    <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-sm text-foreground">
                      {item.comment}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
