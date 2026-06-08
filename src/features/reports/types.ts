export type ReportType = "CUSTOMER" | "TRADE" | "TRANSACTION";

export type ReportDefinition = {
  key: string;
  name: string;
  type: ReportType;
  description: string;
  columns: readonly string[];
  exportConfig: {
    formats: readonly string[];
    delivery: string;
    scheduler: boolean;
  };
};

export type ReportHistoryItem = {
  id: string;
  type: ReportType;
  status: string;
  exportFormat?: string | null;
  rowCount: number;
  exportLocation?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  createdAt: string;
  definition?: { id: string; key: string; name: string } | null;
  requestedBy?: { id: string; name: string; email: string } | null;
};

export type ReportViewerResponse = {
  type: ReportType;
  columns: readonly string[];
  exportConfig: ReportDefinition["exportConfig"];
  items: Array<Record<string, unknown>>;
};
