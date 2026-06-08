import { AlertCircle, Inbox } from "lucide-react";
import { getApiErrorMessage } from "@/lib/api/client";

type SectionStateProps = {
  message?: string;
  title: string;
  type: "empty" | "error" | "loading" | "unavailable";
};

export function SectionState({ message, title, type }: SectionStateProps) {
  if (type === "loading") {
    return (
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded-md bg-muted" />
        <div className="h-4 w-1/2 rounded-md bg-muted" />
        <div className="h-24 rounded-lg bg-muted" />
      </div>
    );
  }

  const Icon = type === "error" ? AlertCircle : Inbox;

  return (
    <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
      <div>
        <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-foreground">{title}</p>
        {message ? (
          <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        ) : null}
      </div>
    </div>
  );
}

export function getSectionErrorMessage(error: unknown) {
  const message = getApiErrorMessage(error);

  if (message.toLowerCase().includes("forbidden")) {
    return "Not available for this role.";
  }

  return message;
}
