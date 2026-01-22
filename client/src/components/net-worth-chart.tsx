import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { type HistorySnapshot, currencySymbols, type Currency } from "@shared/schema";
import { format, parseISO } from "date-fns";

interface NetWorthChartProps {
  history: HistorySnapshot[];
  baseCurrency: Currency;
  isPrivate: boolean;
}

function formatCompactCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  if (Math.abs(value) >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

export function NetWorthChart({
  history,
  baseCurrency,
  isPrivate,
}: NetWorthChartProps) {
  const chartData = history.map((snapshot) => ({
    ...snapshot,
    displayDate: format(parseISO(snapshot.date), "MMM"),
  }));

  if (chartData.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Add assets and liabilities to see your net worth history</p>
      </div>
    );
  }

  return (
    <div className={`h-48 w-full ${isPrivate ? "privacy-blur" : ""}`} data-testid="chart-net-worth">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="displayDate"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={(value) => formatCompactCurrency(value, baseCurrency)}
            width={55}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              boxShadow: "var(--shadow-lg)",
            }}
            labelStyle={{ color: "hsl(var(--foreground))", fontSize: 12 }}
            formatter={(value: number) => [
              `${currencySymbols[baseCurrency]}${value.toLocaleString()}`,
              "Net Worth",
            ]}
          />
          <Area
            type="monotone"
            dataKey="netWorth"
            stroke="hsl(160, 84%, 39%)"
            strokeWidth={2}
            fill="url(#netWorthGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
