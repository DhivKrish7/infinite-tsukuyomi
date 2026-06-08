import { apiClient } from "@/lib/api/client";
import type { ReportDefinition, ReportHistoryItem, ReportType, ReportViewerResponse } from "./types";

export function fetchReportDefinitions() {
  return apiClient<{ items: ReportDefinition[] }>("/api/reports/definitions");
}

export function fetchReportHistory() {
  return apiClient<{ items: ReportHistoryItem[] }>("/api/reports/history");
}

export function fetchReportViewer(type: ReportType) {
  return apiClient<ReportViewerResponse>(`/api/reports/viewer?type=${type}`);
}
