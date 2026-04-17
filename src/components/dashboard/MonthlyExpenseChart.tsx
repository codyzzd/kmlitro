"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MonthlyExpensePoint } from "@/lib/calculations";

interface MonthlyExpenseChartProps {
  data: MonthlyExpensePoint[];
  decimalSeparator: "," | ".";
}

function ExpenseTooltip({ active, payload, label, fmt }: {
  active?: boolean;
  payload?: readonly { value?: string | number | readonly (string | number)[] }[];
  label?: string | number;
  fmt: (v: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const v = Number(payload[0].value);
  return (
    <div className="bg-popover border border-border shadow-md px-3 py-2 text-xs">
      <p className="text-muted-foreground mb-1">{label}</p>
      <p className="font-semibold">{fmt(v)}</p>
    </div>
  );
}

export function MonthlyExpenseChart({ data, decimalSeparator }: MonthlyExpenseChartProps) {
  if (data.length === 0) return null;

  const fmt = (v: number) =>
    `R$ ${v.toFixed(2).replace(".", decimalSeparator)}`;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Gastos com combustível — últimos {data.length} meses
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 11 }}
              className="fill-muted-foreground"
              tickFormatter={(v) => `R$${v}`}
            />
            <Tooltip content={(props) => <ExpenseTooltip {...props} fmt={fmt} />} />
            <Bar
              dataKey="total"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
