import type {
  ClientRecord,
  CrmColumnPreference,
  CrmCustomField,
  CrmExtensionModule,
  CrmSavedFilter,
  CrmSavedView,
  LeadRecord,
  PaginatedResponse,
  TaskRecord
} from "./types";

type ListFilters = {
  q?: string;
  status?: string;
  stage?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
};

function toQuery(filters: ListFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`CRM request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchClients(filters: ListFilters) {
  return fetchJson<PaginatedResponse<ClientRecord>>(`/api/crm/clients${toQuery(filters)}`);
}

export function fetchLeads(filters: ListFilters) {
  return fetchJson<PaginatedResponse<LeadRecord>>(`/api/crm/leads${toQuery(filters)}`);
}

export function fetchTasks(filters: ListFilters) {
  return fetchJson<PaginatedResponse<TaskRecord>>(`/api/crm/tasks${toQuery(filters)}`);
}

export function fetchCrmExtensions() {
  return fetchJson<{ items: CrmExtensionModule[] }>("/api/crm/extensions");
}

export function fetchSavedFilters() {
  return fetchJson<{ items: CrmSavedFilter[] }>("/api/crm/saved-filters");
}

export function fetchSavedViews() {
  return fetchJson<{ items: CrmSavedView[] }>("/api/crm/saved-views");
}

export function fetchColumnPreferences() {
  return fetchJson<{ items: CrmColumnPreference[] }>("/api/crm/columns");
}

export function fetchCustomFields() {
  return fetchJson<{ items: CrmCustomField[] }>("/api/crm/custom-fields");
}
