import type { DynamicFormDefinition, DynamicFormKind, DynamicFormsOverview, DynamicFormStatus } from "./types";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "include",
    cache: "no-store",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`Form builder request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchDynamicForms() {
  return fetchJson<DynamicFormsOverview>("/api/management/forms");
}

export function createDynamicForm(input: {
  name: string;
  key: string;
  description?: string;
  kind: DynamicFormKind;
  definition: DynamicFormDefinition;
}) {
  return fetchJson("/api/management/forms", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function createDynamicFormVersion(
  formId: string,
  input: { definition: DynamicFormDefinition; notes?: string; status?: DynamicFormStatus }
) {
  return fetchJson(`/api/management/forms/${formId}/versions`, {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function publishDynamicForm(formId: string) {
  return fetchJson(`/api/management/forms/${formId}/publish`, {
    method: "POST"
  });
}
