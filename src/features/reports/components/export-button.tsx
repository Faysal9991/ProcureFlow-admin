"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/client";
import type {
  ReportConfig,
  ReportExportFormat,
  ReportFilters,
} from "../types";
import { downloadBlob } from "../utils";
import { useExportReport } from "../hooks";

type ExportButtonProps = {
  config: ReportConfig;
  filters: ReportFilters;
};

const exportFormats: {
  label: string;
  value: ReportExportFormat;
}[] = [
  { label: "CSV", value: "csv" },
  { label: "XLSX", value: "xlsx" },
  { label: "PDF", value: "pdf" },
];

export function ExportButton({ config, filters }: ExportButtonProps) {
  const exportMutation = useExportReport();
  const [activeFormat, setActiveFormat] = useState<ReportExportFormat | null>(
    null,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const activeFormatLabel = exportFormats.find(
    (format) => format.value === activeFormat,
  )?.label;

  async function handleExport(format: ReportExportFormat) {
    setActiveFormat(format);
    setErrorMessage(null);

    try {
      const result = await exportMutation.mutateAsync({
        filters,
        format,
        reportType: config.type,
      });

      downloadBlob(result.blob, result.filename);
      setIsOpen(false);
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error));
    } finally {
      setActiveFormat(null);
    }
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen((value) => !value)}
      >
        <Download className="size-4" />
        {activeFormatLabel ? `Exporting ${activeFormatLabel}...` : "Export"}
      </Button>

      {isOpen ? (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-border bg-surface p-2 shadow-card">
          <div className="space-y-1">
            {exportFormats.map((format) => (
              <button
                key={format.value}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!!activeFormat}
                type="button"
                onClick={() => void handleExport(format.value)}
              >
                <span>{format.label}</span>
                {activeFormat === format.value ? (
                  <span className="text-xs text-muted-foreground">
                    Exporting...
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {errorMessage ? (
            <p className="mt-2 rounded-md bg-error/10 p-2 text-xs text-error">
              {errorMessage}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
