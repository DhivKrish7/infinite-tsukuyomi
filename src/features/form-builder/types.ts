export type DynamicFormKind = "SIGNUP" | "QUESTIONNAIRE";
export type DynamicFormStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type DynamicFormFieldType =
  | "TEXT"
  | "EMAIL"
  | "PHONE"
  | "NUMBER"
  | "DATE"
  | "SELECT"
  | "MULTI_SELECT"
  | "RADIO"
  | "CHECKBOX"
  | "TEXTAREA"
  | "CONSENT"
  | "HIDDEN";

export type DynamicFormField = {
  id: string;
  key: string;
  label: string;
  type: DynamicFormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  order: number;
};

export type DynamicFormDefinition = {
  fields: DynamicFormField[];
  submitLabel?: string;
  successMessage?: string;
};

export type DynamicFormVersion = {
  id: string;
  version: number;
  definition: DynamicFormDefinition;
  notes?: string | null;
  publishedAt?: string | null;
  createdAt: string;
};

export type DynamicFormRecord = {
  id: string;
  key: string;
  name: string;
  description?: string | null;
  kind: DynamicFormKind;
  status: DynamicFormStatus;
  currentVersionId?: string | null;
  settings?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  currentVersion?: DynamicFormVersion | null;
  versions: DynamicFormVersion[];
};

export type DynamicFormsOverview = {
  forms: DynamicFormRecord[];
};
