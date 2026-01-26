import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Currency, currencySymbols } from "@shared/schema";
import { TrendingUp, TrendingDown, Calendar, ArrowRight } from "lucide-react";

interface RecapData {
  netWorthChange: number;
  percentChange: number;
  topCategories: { name: string; value: number }[];
  totalAssets: number;
  totalLiabilities: number;
  upcomingBills: any[];
  daysUntilNextBill: number | null;
}

interface WeeklyRecapProps {
  recap: RecapData;
  baseCurrency: Currency;
  isPrivate: boolean;
}

const categoryLabels: Record<string, string> = {
  cash: "Cash",
  stocks: "Stocks",
  crypto: "Crypto",
  property: "Property",
  vehicles: "Vehicles",
  retirement: "Retirement",
  other: "Other",
};

export function WeeklyRecap({ recap, baseCurrency, isPrivate }: WeeklyRecapProps) {
  const symbol = currencySymbols[baseCurrency];
  const isPositive = recap.netWorthChange >= 0;

  const formatValue = (value: number): string => {
    if (value >= 1000000) {
      return `${symbol}${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${symbol}${(value / 1000).toFixed(1)}K`;
    }
    return `${symbol}${value.toFixed(0)}`;
  };

  return (
    <Card className="rounded-2xl border-border/50 overflow-hidden" data-testid="card-weekly-recap">
      <div className={`h-1 ${isPositive ? "bg-primary" : "bg-destructive"}`} />
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Weekly Recap
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Net Worth Change</p>
            <p className={`text-xl font-bold tabular-nums ${isPrivate ? "privacy-blur" : ""} ${isPositive ? "text-primary" : "text-destructive"}`}>
              {isPositive ? "+" : ""}{formatValue(recap.netWorthChange)}
            </p>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${
            isPositive ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
          }`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {Math.abs(recap.percentChange).toFixed(1)}%
          </div>
        </div>

        {recap.topCategories.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Top Holdings</p>
            <div className="space-y-2">
              {recap.topCategories.slice(0, 3).map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm">{categoryLabels[cat.name] || cat.name}</span>
                  </div>
                  <span className={`text-sm font-medium tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                    {formatValue(cat.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {recap.upcomingBills.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Next Bill</p>
              {recap.daysUntilNextBill !== null && (
                <span className="text-xs text-muted-foreground">
                  in {recap.daysUntilNextBill} day{recap.daysUntilNextBill !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-sm font-medium">{recap.upcomingBills[0]?.name}</span>
              <span className={`text-sm tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                {symbol}{recap.upcomingBills[0]?.value?.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-xs text-muted-foreground">Total Assets</p>
            <p className={`text-lg font-bold text-primary tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
              {formatValue(recap.totalAssets)}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/10">
            <p className="text-xs text-muted-foreground">Total Debt</p>
            <p className={`text-lg font-bold text-destructive tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
              {formatValue(recap.totalLiabilities)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
