import { ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";

type PermissionStateProps = {
  description?: string;
  eyebrow?: string;
  title?: string;
};

export function PermissionState({
  description = "Reports are available only when your company role includes the matching report permission. Super admins use platform reporting separately.",
  eyebrow = "Reports",
  title = "Report access unavailable",
}: PermissionStateProps) {
  return (
    <div className="space-y-6">
      <PageHeader eyebrow={eyebrow} title={title}>
        Reporting screens use tenant report permissions from your current
        company role.
      </PageHeader>
      <Card>
        <CardContent className="p-8">
          <div className="flex min-h-52 items-center justify-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <div>
              <div className="mx-auto flex size-10 items-center justify-center rounded-lg bg-error/10 text-error">
                <ShieldAlert className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium text-foreground">
                Permission required
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
