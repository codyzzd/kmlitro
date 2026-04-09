"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KmLChartPoint } from "@/lib/calculations";

interface KmLChartProps {
  data: KmLChartPoint[];
  decimalSeparator: "," | ".";
}

function KmLTooltip({ active, payload, label, fmt }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  fmt: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border shadow-md px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{fmt(payload[0].value)} km/l</p>
    </div>
  );
}

export function KmLChart({ data, decimalSeparator }: KmLChartProps) {
  if (data.length < 2) return null;

  const fmt = (v: number) =>
    v.toFixed(2).replace(".", decimalSeparator);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Evolução km/l — últimos {data.length} abastecimentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              tickFormatter={fmt}
            />
            <Tooltip content={(props) => <KmLTooltip {...props} fmt={fmt} />} />
            <Line
              type="monotone"
              dataKey="kmL"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: "#3b82f6", strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#3b82f6" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
