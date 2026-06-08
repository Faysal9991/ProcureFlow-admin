import { ArrowUpRight, Clock3, LayoutGrid } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PlaceholderPageConfig } from "@/lib/constants/page-placeholders";

type AdminPlaceholderPageProps = {
  page: PlaceholderPageConfig;
};

export function AdminPlaceholderPage({ page }: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-muted-foreground">
            {page.eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal text-foreground">
            {page.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {page.description}
          </p>
        </div>
        <Badge variant={page.badgeVariant}>{page.status}</Badge>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        {page.metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardDescription>{metric.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">
                {metric.value}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {metric.caption}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Preview</CardTitle>
            <CardDescription>{page.previewDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {page.focusAreas.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <LayoutGrid className="size-4" />
                    </div>
                    <p className="truncate text-sm font-medium text-foreground">
                      {item}
                    </p>
                  </div>
                  <ArrowUpRight className="size-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phase Status</CardTitle>
            <CardDescription>Placeholder prepared for feature work</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <Clock3 className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    UI shell ready
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Data wiring and workflows come in later phases.
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Route: {page.route}</p>
              <p>Owner: {page.owner}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
