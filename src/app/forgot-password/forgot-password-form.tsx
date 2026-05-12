"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setResetUrl(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tenantSlug: formData.get("tenantSlug"),
        email: formData.get("email")
      })
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Unable to request password reset");
      return;
    }

    setMessage(data.message);
    setResetUrl(data.resetUrl ?? null);
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Tenant
        </label>
        <Input name="tenantSlug" defaultValue="default" autoComplete="organization" />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Email
        </label>
        <Input name="email" type="email" autoComplete="email" required />
      </div>

      {error ? <div className="rounded-md border border-trading-red/25 bg-trading-red/10 px-3 py-2 text-sm text-trading-red">{error}</div> : null}
      {message ? <div className="rounded-md border border-trading-green/25 bg-trading-green/10 px-3 py-2 text-sm text-trading-green">{message}</div> : null}
      {resetUrl ? (
        <div className="break-all rounded-md border border-white/10 bg-secondary px-3 py-2 font-mono text-xs text-muted-foreground">
          Dev reset link: {resetUrl}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Preparing..." : "Send reset instructions"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link className="text-primary hover:underline" href="/login">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
