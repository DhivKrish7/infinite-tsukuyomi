"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { volumeData } from "../data";

export function VolumeChart() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Volume & PnL</CardTitle>
          <p className="mt-1 text-xs text-muted-foreground">30 day trend across connected platforms</p>
        </div>
      </CardHeader>
      <CardContent className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="volume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="pnl" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00e5a0" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00e5a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="day" stroke="#5a6a7a" tickLine={false} axisLine={false} />
            <YAxis stroke="#5a6a7a" tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "#0d1219",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10,
                color: "#e8edf2"
              }}
            />
            <Area type="monotone" dataKey="volume" stroke="#00d4ff" fill="url(#volume)" strokeWidth={2} />
            <Area type="monotone" dataKey="pnl" stroke="#00e5a0" fill="url(#pnl)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
