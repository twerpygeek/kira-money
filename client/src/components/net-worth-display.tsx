import { TrendingUp, TrendingDown } from "lucide-react";
import { currencySymbols, type Currency } from "@shared/schema";

interface NetWorthDisplayProps {
  netWorth: number;
  previousNetWorth?: number;
  baseCurrency: Currency;
  isPrivate: boolean;
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

export function NetWorthDisplay({
  netWorth,
  previousNetWorth = 0,
  baseCurrency,
  isPrivate,
}: NetWorthDisplayProps) {
  const change = calculateChange(netWorth, previousNetWorth);
  const isPositiveChange = change >= 0;
  const hasChange = previousNetWorth !== 0 && change !== 0;

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <p className="text-sm text-muted-foreground mb-2 tracking-wide uppercase">
        Net Worth
      </p>
      <h1
        className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight number-animate ${
          isPrivate ? "privacy-blur" : ""
        }`}
        data-testid="text-net-worth"
      >
        {formatCurrency(netWorth, baseCurrency)}
      </h1>
      {hasChange && (
        <div
          className={`flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full ${
            isPositiveChange
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive"
          } ${isPrivate ? "privacy-blur" : ""}`}
          data-testid="text-net-worth-change"
        >
          {isPositiveChange ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">
            {isPositiveChange ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        </div>
      )}
    </div>
  );
}
