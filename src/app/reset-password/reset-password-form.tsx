"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        token: formData.get("token"),
        password: formData.get("password")
      })
    });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(data?.error ?? "Unable to reset password");
      return;
    }

    setMessage("Password reset complete. You can sign in with the new password.");
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <input type="hidden" name="token" value={searchParams.get("token") ?? ""} />
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          New password
        </label>
        <Input name="password" type="password" autoComplete="new-password" minLength={12} required />
      </div>

      {error ? <div className="rounded-md border border-trading-red/25 bg-trading-red/10 px-3 py-2 text-sm text-trading-red">{error}</div> : null}
      {message ? <div className="rounded-md border border-trading-green/25 bg-trading-green/10 px-3 py-2 text-sm text-trading-green">{message}</div> : null}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Updating..." : "Update password"}
      </Button>

      <div className="text-center text-sm text-muted-foreground">
        <Link className="text-primary hover:underline" href="/login">
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
