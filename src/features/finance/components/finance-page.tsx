"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, BadgeCheck, BookOpenCheck, Landmark, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchFinanceOverview } from "../api";
import { demoFinanceOverview } from "../demo-data";
import type { FinanceTransaction } from "../types";
import { ApprovalQueuePanel } from "./approval-queue-panel";
import { FeeTrackingPanel } from "./fee-tracking-panel";
import { FinanceKpiGrid } from "./finance-kpi-grid";
import { FinancePageShell } from "./finance-page-shell";
import { GatewayArchitecturePanel } from "./gateway-architecture-panel";
import { LedgerEntriesPanel } from "./ledger-entries-panel";
import { SuspiciousFlagsPanel } from "./suspicious-flags-panel";
import { TransactionLedgerTable } from "./transaction-ledger-table";
import { WalletTrackingPanel } from "./wallet-tracking-panel";

export type FinanceView = "overview" | "deposits" | "withdrawals" | "approvals" | "ledger";

const viewLinks: Array<{ view: FinanceView; label: string; href: string; icon: LucideIcon }> = [
  { view: "overview", label: "Overview", href: "/finance", icon: Landmark },
  { view: "deposits", label: "Deposits", href: "/finance/deposits", icon: ArrowDownToLine },
  { view: "withdrawals", label: "Withdrawals", href: "/finance/withdrawals", icon: ArrowUpFromLine },
  { view: "approvals", label: "Approvals", href: "/finance/approvals", icon: BadgeCheck },
  { view: "ledger", label: "Ledger", href: "/finance/ledger", icon: BookOpenCheck }
];

export function FinancePage({ view = "overview" }: { view?: FinanceView }) {
  const query = useQuery({
    queryKey: ["finance", "overview"],
    queryFn: fetchFinanceOverview,
    retry: false
  });
  const data = query.data ?? demoFinanceOverview;
  const transactions = filterTransactions(data.transactions, view);

  return (
    <FinancePageShell
      title="Finance Management"
      subtitle="Deposits, withdrawals, approvals, wallets, fees, gateways, ledger controls, and risk flags."
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {viewLinks.map((item) => (
            <Button key={item.view} asChild variant={view === item.view ? "default" : "outline"} size="sm">
              <Link href={item.href as never}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm">
            <ArrowUpFromLine className="h-4 w-4" />
            Withdrawal
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Deposit
          </Button>
        </div>
      </div>

      {query.isError ? (
        <div className="rounded-lg border border-trading-amber/25 bg-trading-amber/10 px-4 py-3 text-sm text-trading-amber">
          Showing demo finance records until PostgreSQL is configured and migrated.
        </div>
      ) : null}

      <FinanceKpiGrid metrics={data.metrics} />

      {view === "approvals" ? (
        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
          <ApprovalQueuePanel transactions={data.transactions} />
          <SuspiciousFlagsPanel flags={data.suspiciousFlags} />
        </section>
      ) : null}

      {view === "ledger" ? <LedgerEntriesPanel entries={data.ledgerEntries} /> : null}

      {view !== "ledger" ? <TransactionLedgerTable transactions={transactions} /> : null}

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <WalletTrackingPanel wallets={data.wallets} />
        <ApprovalQueuePanel transactions={data.transactions} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <GatewayArchitecturePanel adapters={data.gatewayAdapters} connections={data.gateways} />
        <FeeTrackingPanel fees={data.fees} />
      </section>

      <SuspiciousFlagsPanel flags={data.suspiciousFlags} />
    </FinancePageShell>
  );
}

function filterTransactions(transactions: FinanceTransaction[], view: FinanceView) {
  if (view === "deposits") return transactions.filter((transaction) => transaction.type === "DEPOSIT");
  if (view === "withdrawals") return transactions.filter((transaction) => transaction.type === "WITHDRAWAL");
  if (view === "approvals") {
    return transactions.filter((transaction) => transaction.approvals?.some((approval) => approval.status === "PENDING"));
  }

  return transactions;
}
