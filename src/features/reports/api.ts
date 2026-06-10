import { apiClient } from "@/lib/api/client";
import type { ApiResponse } from "@/types/api";
import type {
  ExportReportRequest,
  ExportReportResult,
  ReportFilters,
  ReportListData,
  ReportRow,
  ReportType,
} from "./types";
import {
  compactReportParams,
  getFallbackExportFilename,
  getReportConfig,
  normalizeReportList,
  parseContentDispositionFilename,
} from "./utils";

export async function getReportRows<TItem extends ReportRow>(
  reportType: ReportType,
  filters: ReportFilters,
) {
  const config = getReportConfig(reportType);
  const response = await apiClient.get<ApiResponse<ReportListData<TItem>>>(
    config.endpoint,
    {
      params: compactReportParams(filters),
    },
  );

  return normalizeReportList(response.data.data, filters);
}

export async function exportReport({
  filters,
  format,
  reportType,
}: ExportReportRequest): Promise<ExportReportResult> {
  const config = getReportConfig(reportType);
  const response = await apiClient.get<Blob>(`${config.endpoint}/export`, {
    params: compactReportParams({ ...filters, format }),
    responseType: "blob",
  });
  const filename =
    parseContentDispositionFilename(response.headers["content-disposition"]) ??
    getFallbackExportFilename(reportType, format);

  return {
    blob: response.data,
    filename,
  };
}
