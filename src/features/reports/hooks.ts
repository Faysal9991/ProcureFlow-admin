import { useMutation, useQuery } from "@tanstack/react-query";
import { exportReport, getReportRows } from "./api";
import type {
  ExportReportRequest,
  ReportFilters,
  ReportRow,
  ReportType,
} from "./types";

export const reportQueryKeys = {
  all: ["reports"] as const,
  list: (reportType: ReportType, filters: ReportFilters) =>
    ["reports", reportType, filters] as const,
};

export function useReportRows<TItem extends ReportRow>(
  reportType: ReportType,
  filters: ReportFilters,
  enabled = true,
) {
  return useQuery({
    enabled,
    queryFn: () => getReportRows<TItem>(reportType, filters),
    queryKey: reportQueryKeys.list(reportType, filters),
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: (request: ExportReportRequest) => exportReport(request),
  });
}
