import { TrendingUp, TrendingDown } from "lucide-react";
import { currencySymbols, type Currency, type HistorySnapshot } from "@shared/schema";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface NetWorthDisplayProps {
  netWorth: number;
  previousNetWorth?: number;
  baseCurrency: Currency;
  isPrivate: boolean;
  history?: HistorySnapshot[];
  userName?: string;
}

function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return value < 0 ? `-${symbol}${formatted}` : `${symbol}${formatted}`;
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function NetWorthDisplay({
  netWorth,
  previousNetWorth = 0,
  baseCurrency,
  isPrivate,
  history = [],
  userName,
}: NetWorthDisplayProps) {
  const change = calculateChange(netWorth, previousNetWorth);
  const isPositiveChange = change >= 0;
  const hasChange = previousNetWorth !== 0 && change !== 0;

  const chartData = history.slice(-12).map((h) => ({
    value: h.netWorth,
  }));

  return (
    <div className="relative flex flex-col items-center justify-center py-10 px-4 fade-in">
      {chartData.length > 1 && (
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="sparklineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(160, 84%, 39%)"
                strokeWidth={2}
                fill="url(#sparklineGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative z-10 text-center">
        <p className="text-sm text-muted-foreground mb-1">
          {getGreeting()}{userName ? `, ${userName}` : ""}
        </p>
        <p className="text-xs text-muted-foreground/70 mb-4 tracking-widest uppercase">
          Your Net Worth
        </p>
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight tabular-nums transition-all duration-300 ${
            isPrivate ? "privacy-blur" : ""
          }`}
          data-testid="text-net-worth"
        >
          {formatCurrency(netWorth, baseCurrency)}
        </h1>
        {hasChange && (
          <div
            className={`inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full font-medium ${
              isPositiveChange
                ? "bg-primary/15 text-primary"
                : "bg-destructive/15 text-destructive"
            } ${isPrivate ? "privacy-blur" : ""}`}
            data-testid="text-net-worth-change"
          >
            {isPositiveChange ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            <span className="text-sm tabular-nums">
              {isPositiveChange ? "+" : ""}
              {change.toFixed(2)}% from last month
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
