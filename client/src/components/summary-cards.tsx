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
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Assets</span>
          </div>
          <p
            className={`text-2xl font-bold text-primary tabular-nums tracking-tight ${
              isPrivate ? "privacy-blur" : ""
            }`}
            data-testid="text-total-assets"
          >
            {formatCurrency(totalAssets, baseCurrency)}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/50 bg-card overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 rounded-xl bg-destructive/10">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Liabilities</span>
          </div>
          <p
            className={`text-2xl font-bold text-destructive tabular-nums tracking-tight ${
              isPrivate ? "privacy-blur" : ""
            }`}
            data-testid="text-total-liabilities"
          >
            -{formatCurrency(totalLiabilities, baseCurrency)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
