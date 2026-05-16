"use client";

import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TradingActivityPoint } from "../types";
import { formatMoney } from "../format";

export function TradingActivityChart({ data }: { data: TradingActivityPoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Trading Activity</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">Volume, realized PnL, and trade count</p>
        </div>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" stroke="#5a6a7a" tickLine={false} axisLine={false} />
            <YAxis stroke="#5a6a7a" tickLine={false} axisLine={false} tickFormatter={(value) => formatMoney(value, true)} />
            <Tooltip
              formatter={(value, name) => (name === "trades" ? value : formatMoney(Number(value)))}
              contentStyle={{
                background: "#0d1219",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#e8edf2"
              }}
            />
            <Bar dataKey="volume" fill="#00d4ff" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="pnl" stroke="#00e5a0" strokeWidth={2} dot={false} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
