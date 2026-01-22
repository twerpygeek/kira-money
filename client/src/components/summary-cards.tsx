import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { currencySymbols, type Currency } from "@shared/schema";

interface SummaryCardsProps {
  totalAssets: number;
  totalLiabilities: number;
  baseCurrency: Currency;
  isPrivate: boolean;
}

function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  const formatted = Math.abs(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${symbol}${formatted}`;
}

export function SummaryCards({
  totalAssets,
  totalLiabilities,
  baseCurrency,
  isPrivate,
}: SummaryCardsProps) {
  const debtToAssetRatio = totalAssets > 0 
    ? ((totalLiabilities / totalAssets) * 100).toFixed(1) 
    : "0";

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="border-l-4 border-l-primary bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Assets</span>
          </div>
          <p
            className={`text-2xl font-bold text-primary number-animate ${
              isPrivate ? "privacy-blur" : ""
            }`}
            data-testid="text-total-assets"
          >
            {formatCurrency(totalAssets, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-destructive bg-card">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-md bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-sm text-muted-foreground">Liabilities</span>
          </div>
          <p
            className={`text-2xl font-bold text-destructive number-animate ${
              isPrivate ? "privacy-blur" : ""
            }`}
            data-testid="text-total-liabilities"
          >
            -{formatCurrency(totalLiabilities, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      {totalAssets > 0 && (
        <Card className="col-span-2 bg-card">
          <CardContent className="pt-4 pb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Debt-to-Asset Ratio</span>
              <span
                className={`text-sm font-medium ${
                  parseFloat(debtToAssetRatio) > 50 ? "text-destructive" : "text-primary"
                } ${isPrivate ? "privacy-blur" : ""}`}
                data-testid="text-debt-ratio"
              >
                {debtToAssetRatio}%
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
