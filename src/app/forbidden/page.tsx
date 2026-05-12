import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="trading-surface max-w-md rounded-xl p-8 text-center">
        <ShieldAlert className="mx-auto h-10 w-10 text-trading-amber" />
        <h1 className="mt-4 font-display text-2xl font-bold">Access restricted</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your staff role does not have permission to open this backoffice area.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Return to dashboard</Link>
        </Button>
      </div>
    </main>
  );
}
