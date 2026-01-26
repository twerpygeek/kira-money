import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Currency, currencySymbols } from "@shared/schema";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";

interface CashFlowData {
  month: string;
  assets: number;
  liabilities: number;
  netWorth: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
  baseCurrency: Currency;
  isPrivate: boolean;
}

export function CashFlowChart({ data, baseCurrency, isPrivate }: CashFlowChartProps) {
  const symbol = currencySymbols[baseCurrency];

  const formatValue = (value: number): string => {
    if (isPrivate) return "••••";
    if (value >= 1000000) return `${symbol}${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${symbol}${(value / 1000).toFixed(0)}K`;
    return `${symbol}${value.toFixed(0)}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || isPrivate) return null;
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-medium tabular-nums">{formatValue(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50" data-testid="card-cash-flow">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Cash Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Not enough data yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50" data-testid="card-cash-flow">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          Cash Flow (6 Months)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-64 ${isPrivate ? "privacy-blur" : ""}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorLiabilities" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => formatValue(value)}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                iconType="circle"
                iconSize={8}
              />
              <Area
                type="monotone"
                dataKey="assets"
                name="Assets"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#colorAssets)"
              />
              <Area
                type="monotone"
                dataKey="liabilities"
                name="Liabilities"
                stroke="#F43F5E"
                strokeWidth={2}
                fill="url(#colorLiabilities)"
              />
              <Area
                type="monotone"
                dataKey="netWorth"
                name="Net Worth"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorNetWorth)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
