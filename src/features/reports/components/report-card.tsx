import Link from "next/link";
import { ArrowRight, FileSpreadsheet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { ReportConfig } from "../types";

type ReportCardProps = {
  config: ReportConfig;
};

export function ReportCard({ config }: ReportCardProps) {
  return (
    <Link className="group block" href={config.route}>
      <Card className="h-full transition-colors group-hover:border-primary/60">
        <CardContent className="flex h-full flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="size-5" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div className="mt-5">
            <h2 className="text-base font-semibold text-foreground">
              {config.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {config.description}
            </p>
          </div>
          <p className="mt-auto pt-5 text-xs font-medium uppercase text-muted-foreground">
            {config.viewPermission}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
