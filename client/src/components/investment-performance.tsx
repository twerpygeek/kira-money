import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Asset, currencySymbols, type Currency, assetCategoryLabels } from "@shared/schema";
import { convertToBase } from "@/lib/currencyService";
import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvestmentPerformanceProps {
  assets: Asset[];
  baseCurrency: Currency;
  isPrivate: boolean;
}

const investmentCategories = ["stocks", "crypto", "retirement"] as const;

function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  const absValue = Math.abs(value);
  return `${value < 0 ? "-" : ""}${symbol}${absValue.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function formatPercent(value: number): string {
  const absValue = Math.abs(value);
  return `${value >= 0 ? "+" : "-"}${absValue.toFixed(1)}%`;
}

export function InvestmentPerformance({ assets, baseCurrency, isPrivate }: InvestmentPerformanceProps) {
  const investmentAssets = assets.filter((a) => 
    investmentCategories.includes(a.category as typeof investmentCategories[number])
  );

  if (investmentAssets.length === 0) {
    return null;
  }

  const assetsWithPerformance = investmentAssets.map((asset) => {
    const currentValue = convertToBase(asset.value, asset.currency, baseCurrency);
    const previousValue = asset.previousValue 
      ? convertToBase(asset.previousValue, asset.currency, baseCurrency)
      : currentValue;
    
    const change = currentValue - previousValue;
    const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    return {
      ...asset,
      currentValue,
      previousValue,
      change,
      percentChange,
    };
  });

  const totalCurrentValue = assetsWithPerformance.reduce((sum, a) => sum + a.currentValue, 0);
  const totalPreviousValue = assetsWithPerformance.reduce((sum, a) => sum + a.previousValue, 0);
  const totalChange = totalCurrentValue - totalPreviousValue;
  const totalPercentChange = totalPreviousValue > 0 
    ? ((totalCurrentValue - totalPreviousValue) / totalPreviousValue) * 100 
    : 0;

  const categoryPerformance = investmentCategories.map((category) => {
    const categoryAssets = assetsWithPerformance.filter((a) => a.category === category);
    const currentValue = categoryAssets.reduce((sum, a) => sum + a.currentValue, 0);
    const previousValue = categoryAssets.reduce((sum, a) => sum + a.previousValue, 0);
    const change = currentValue - previousValue;
    const percentChange = previousValue > 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    
    return {
      category,
      currentValue,
      change,
      percentChange,
      count: categoryAssets.length,
    };
  }).filter((c) => c.count > 0);

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Investment Performance
          </CardTitle>
          <Badge 
            variant={totalChange >= 0 ? "secondary" : "destructive"}
          >
            {totalChange >= 0 ? (
              <ArrowUpRight className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-1" />
            )}
            {formatPercent(totalPercentChange)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-2">
          <p className="text-xs text-muted-foreground mb-1">Total Investment Value</p>
          <p className={`text-2xl font-bold tabular-nums tracking-tight ${isPrivate ? "privacy-blur" : ""}`}>
            {formatCurrency(totalCurrentValue, baseCurrency)}
          </p>
          <p className={`text-sm ${totalChange >= 0 ? "text-primary" : "text-destructive"} ${isPrivate ? "privacy-blur" : ""}`}>
            {totalChange >= 0 ? "+" : ""}{formatCurrency(totalChange, baseCurrency)} since last update
          </p>
        </div>

        <div className="space-y-3">
          {categoryPerformance.map((cat) => (
            <div
              key={cat.category}
              className="flex items-center justify-between p-3 rounded-xl bg-muted/30"
            >
              <div>
                <p className="text-sm font-medium">
                  {assetCategoryLabels[cat.category as keyof typeof assetCategoryLabels]}
                </p>
                <p className={`text-sm tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                  {formatCurrency(cat.currentValue, baseCurrency)}
                </p>
              </div>
              <div className="text-right">
                <div className={`flex items-center gap-1 ${cat.change >= 0 ? "text-primary" : "text-destructive"}`}>
                  {cat.change > 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : cat.change < 0 ? (
                    <TrendingDown className="h-4 w-4" />
                  ) : (
                    <Minus className="h-4 w-4" />
                  )}
                  <span className={`text-sm font-semibold tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                    {formatPercent(cat.percentChange)}
                  </span>
                </div>
                <p className={`text-xs text-muted-foreground tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                  {cat.change >= 0 ? "+" : ""}{formatCurrency(cat.change, baseCurrency)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {assetsWithPerformance.length > 0 && (
          <div className="pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground mb-2">Individual Holdings</p>
            <div className="space-y-2">
              {assetsWithPerformance.slice(0, 5).map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground truncate max-w-[50%]">{asset.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                      {formatCurrency(asset.currentValue, baseCurrency)}
                    </span>
                    <span className={`text-xs tabular-nums ${asset.change >= 0 ? "text-primary" : "text-destructive"} ${isPrivate ? "privacy-blur" : ""}`}>
                      {formatPercent(asset.percentChange)}
                    </span>
                  </div>
                </div>
              ))}
              {assetsWithPerformance.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{assetsWithPerformance.length - 5} more holdings
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
