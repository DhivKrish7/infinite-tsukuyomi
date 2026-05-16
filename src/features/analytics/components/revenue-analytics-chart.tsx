"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RevenuePoint } from "../types";
import { formatMoney } from "../format";

export function RevenueAnalyticsChart({ data }: { data: RevenuePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Revenue Analytics</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Fee revenue against deposits and withdrawals</p>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id="analyticsRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="analyticsDeposits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" stroke="#5a6a7a" tickLine={false} axisLine={false} />
            <YAxis stroke="#5a6a7a" tickLine={false} axisLine={false} tickFormatter={(value) => formatMoney(value, true)} />
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              contentStyle={{
                background: "#0d1219",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#e8edf2"
              }}
            />
            <Area type="monotone" dataKey="deposits" stroke="#00e5a0" fill="url(#analyticsDeposits)" strokeWidth={2} />
            <Area type="monotone" dataKey="revenue" stroke="#a78bfa" fill="url(#analyticsRevenue)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
