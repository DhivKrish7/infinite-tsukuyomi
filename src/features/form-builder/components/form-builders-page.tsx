"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Eye, GripVertical, Plus, Save, Send, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ManagementNav } from "@/features/management/components/management-nav";
import { ManagementPageShell } from "@/features/management/components/management-page-shell";
import {
  createDynamicFormVersion,
  fetchDynamicForms,
  publishDynamicForm
} from "../api";
import { demoFormsOverview } from "../demo-data";
import type { DynamicFormDefinition, DynamicFormField, DynamicFormFieldType, DynamicFormKind } from "../types";

const fieldTypes: DynamicFormFieldType[] = [
  "TEXT",
  "EMAIL",
  "PHONE",
  "NUMBER",
  "DATE",
  "SELECT",
  "MULTI_SELECT",
  "RADIO",
  "CHECKBOX",
  "TEXTAREA",
  "CONSENT",
  "HIDDEN"
];

export function FormBuildersPage() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["management", "forms"],
    queryFn: fetchDynamicForms,
    retry: false
  });
  const data = query.data ?? demoFormsOverview;
  const [kind, setKind] = useState<DynamicFormKind>("SIGNUP");
  const visibleForms = data.forms.filter((form) => form.kind === kind);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedForm = useMemo(
    () => visibleForms.find((form) => form.id === selectedId) ?? visibleForms[0] ?? data.forms[0],
    [data.forms, selectedId, visibleForms]
  );
  const [definition, setDefinition] = useState<DynamicFormDefinition>({ fields: [] });
  const [draggedId, setDraggedId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedForm && selectedForm.id !== selectedId) {
      setSelectedId(selectedForm.id);
    }
  }, [selectedForm, selectedId]);

  useEffect(() => {
    const next = selectedForm?.currentVersion?.definition ?? { fields: [] };
    setDefinition({
      submitLabel: next.submitLabel ?? "Submit",
      successMessage: next.successMessage ?? "Form submitted.",
      fields: [...next.fields].sort((a, b) => a.order - b.order)
    });
  }, [selectedForm?.id, selectedForm?.currentVersion?.id]);

  const saveMutation = useMutation({
    mutationFn: () =>
      createDynamicFormVersion(selectedForm.id, {
        definition: normalizeOrders(definition),
        notes: "Saved from management form builder"
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["management", "forms"] });
    }
  });

  const publishMutation = useMutation({
    mutationFn: () => publishDynamicForm(selectedForm.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["management", "forms"] });
    }
  });

  function updateField(id: string, patch: Partial<DynamicFormField>) {
    setDefinition((current) => ({
      ...current,
      fields: current.fields.map((field) => (field.id === id ? { ...field, ...patch } : field))
    }));
  }

  function addField() {
    setDefinition((current) => {
      const order = current.fields.length + 1;
      const field: DynamicFormField = {
        id: `field-${Date.now()}`,
        key: `field_${order}`,
        label: "New field",
        type: "TEXT",
        required: false,
        order
      };

      return { ...current, fields: [...current.fields, field] };
    });
  }

  function removeField(id: string) {
    setDefinition((current) => normalizeOrders({ ...current, fields: current.fields.filter((field) => field.id !== id) }));
  }

  function moveField(id: string, direction: -1 | 1) {
    setDefinition((current) => {
      const fields = [...current.fields].sort((a, b) => a.order - b.order);
      const index = fields.findIndex((field) => field.id === id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= fields.length) return current;
      const [field] = fields.splice(index, 1);
      fields.splice(nextIndex, 0, field);
      return normalizeOrders({ ...current, fields });
    });
  }

  function dropField(targetId: string) {
    if (!draggedId || draggedId === targetId) return;
    setDefinition((current) => {
      const fields = [...current.fields].sort((a, b) => a.order - b.order);
      const dragged = fields.find((field) => field.id === draggedId);
      if (!dragged) return current;
      const withoutDragged = fields.filter((field) => field.id !== draggedId);
      const targetIndex = withoutDragged.findIndex((field) => field.id === targetId);
      withoutDragged.splice(targetIndex, 0, dragged);
      return normalizeOrders({ ...current, fields: withoutDragged });
    });
    setDraggedId(null);
  }

  return (
    <ManagementPageShell
      title="Dynamic Form Builders"
      subtitle="Standalone signup and questionnaire schema tools with versioning, preview, and drag ordering."
    >
      <ManagementNav />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["SIGNUP", "QUESTIONNAIRE"] as DynamicFormKind[]).map((item) => (
            <Button key={item} variant={kind === item ? "default" : "outline"} size="sm" onClick={() => setKind(item)}>
              {item === "SIGNUP" ? "Signup Form Builder" : "Questionnaire Builder"}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            <Eye className="h-4 w-4" />
            Refresh
          </Button>
          <Button size="sm" onClick={() => saveMutation.mutate()} disabled={!selectedForm || saveMutation.isPending}>
            <Save className="h-4 w-4" />
            Save Version
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => publishMutation.mutate()}
            disabled={!selectedForm || publishMutation.isPending}
          >
            <Send className="h-4 w-4" />
            Publish
          </Button>
        </div>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo form schemas until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1.25fr)_minmax(340px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schemas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {visibleForms.map((form) => (
              <button
                key={form.id}
                type="button"
                onClick={() => setSelectedId(form.id)}
                className={`w-full rounded-md border px-3 py-3 text-left transition ${
                  form.id === selectedForm?.id
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-white/10 bg-secondary/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-sm font-medium">{form.name}</span>
                  <Badge variant="muted">{form.status}</Badge>
                </div>
                <div className="mt-2 font-mono text-[10px] uppercase tracking-wide">
                  v{form.currentVersion?.version ?? 0} / {form.key}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="text-base">{selectedForm?.name ?? "Form schema"}</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">{selectedForm?.description}</p>
            </div>
            <Button size="sm" onClick={addField}>
              <Plus className="h-4 w-4" />
              Field
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-1 text-xs text-muted-foreground">
                Submit button
                <Input
                  value={definition.submitLabel ?? ""}
                  onChange={(event) => setDefinition((current) => ({ ...current, submitLabel: event.target.value }))}
                />
              </label>
              <label className="space-y-1 text-xs text-muted-foreground">
                Success message
                <Input
                  value={definition.successMessage ?? ""}
                  onChange={(event) => setDefinition((current) => ({ ...current, successMessage: event.target.value }))}
                />
              </label>
            </div>

            {definition.fields.map((field, index) => (
              <div
                key={field.id}
                draggable
                onDragStart={() => setDraggedId(field.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => dropField(field.id)}
                className="rounded-md border border-white/10 bg-secondary/40 p-3"
              >
                <div className="grid gap-3 lg:grid-cols-[32px_minmax(140px,1fr)_130px_120px_160px]">
                  <div className="flex items-center justify-center rounded-md border border-white/10 bg-background/60">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Label
                    <Input value={field.label} onChange={(event) => updateField(field.id, { label: event.target.value })} />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Key
                    <Input value={field.key} onChange={(event) => updateField(field.id, { key: event.target.value })} />
                  </label>
                  <label className="space-y-1 text-xs text-muted-foreground">
                    Type
                    <select
                      value={field.type}
                      onChange={(event) => updateField(field.id, { type: event.target.value as DynamicFormFieldType })}
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-end gap-2">
                    <label className="flex h-10 flex-1 items-center gap-2 rounded-md border border-white/10 px-3 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(event) => updateField(field.id, { required: event.target.checked })}
                      />
                      Required
                    </label>
                    <Button variant="ghost" size="icon" onClick={() => moveField(field.id, -1)} disabled={index === 0}>
                      <ArrowUp className="h-4 w-4" />
                      <span className="sr-only">Move up</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => moveField(field.id, 1)}
                      disabled={index === definition.fields.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                      <span className="sr-only">Move down</span>
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Remove field</span>
                    </Button>
                  </div>
                </div>

                {usesOptions(field.type) ? (
                  <label className="mt-3 block space-y-1 text-xs text-muted-foreground">
                    Options
                    <Input
                      value={field.options?.join(", ") ?? ""}
                      onChange={(event) =>
                        updateField(field.id, {
                          options: event.target.value
                            .split(",")
                            .map((option) => option.trim())
                            .filter(Boolean)
                        })
                      }
                      placeholder="Option A, Option B, Option C"
                    />
                  </label>
                ) : null}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 rounded-md border border-white/10 bg-background/50 p-4">
              {definition.fields.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">Add fields to preview this schema.</div>
              ) : (
                definition.fields.map((field) => <PreviewField key={field.id} field={field} />)
              )}
              <Button className="w-full">{definition.submitLabel ?? "Submit"}</Button>
              <p className="text-center text-xs text-muted-foreground">{definition.successMessage}</p>
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-secondary/30 p-3">
              <div className="font-mono text-[10px] uppercase tracking-wide text-muted-foreground">Version history</div>
              <div className="mt-3 space-y-2">
                {(selectedForm?.versions ?? []).map((version) => (
                  <div key={version.id} className="flex items-center justify-between gap-2 text-xs">
                    <span>Version {version.version}</span>
                    <span className="text-muted-foreground">
                      {version.publishedAt ? "Published" : "Draft"} / {new Date(version.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </ManagementPageShell>
  );
}

function PreviewField({ field }: { field: DynamicFormField }) {
  const label = (
    <span>
      {field.label}
      {field.required ? <span className="text-trading-red"> *</span> : null}
    </span>
  );

  if (field.type === "CHECKBOX" || field.type === "CONSENT") {
    return (
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" />
        {label}
      </label>
    );
  }

  if (field.type === "RADIO") {
    return (
      <div className="space-y-2 text-sm">
        <div className="text-muted-foreground">{label}</div>
        {(field.options ?? ["Option"]).map((option) => (
          <label key={option} className="flex items-center gap-2">
            <input type="radio" name={field.id} />
            {option}
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "SELECT" || field.type === "MULTI_SELECT") {
    return (
      <label className="space-y-1 text-sm">
        <div className="text-muted-foreground">{label}</div>
        <select className="h-10 w-full rounded-md border border-input bg-background px-3">
          {(field.options ?? ["Option"]).map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <label className="space-y-1 text-sm">
        <div className="text-muted-foreground">{label}</div>
        <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2" placeholder={field.placeholder} />
      </label>
    );
  }

  if (field.type === "HIDDEN") return null;

  return (
    <label className="space-y-1 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <Input type={inputType(field.type)} placeholder={field.placeholder} />
    </label>
  );
}

function normalizeOrders(definition: DynamicFormDefinition): DynamicFormDefinition {
  return {
    ...definition,
    fields: definition.fields.map((field, index) => ({ ...field, order: index + 1 }))
  };
}

function usesOptions(type: DynamicFormFieldType) {
  return type === "SELECT" || type === "MULTI_SELECT" || type === "RADIO";
}

function inputType(type: DynamicFormFieldType) {
  if (type === "EMAIL") return "email";
  if (type === "PHONE") return "tel";
  if (type === "NUMBER") return "number";
  if (type === "DATE") return "date";
  return "text";
}
