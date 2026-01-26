import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Asset, type Liability, type Currency, currencySymbols } from "@shared/schema";
import { Calendar, CreditCard, Wallet } from "lucide-react";

interface BillCalendarProps {
  assets: Asset[];
  liabilities: Liability[];
  baseCurrency: Currency;
  isPrivate: boolean;
}

export function BillCalendar({ assets, liabilities, baseCurrency, isPrivate }: BillCalendarProps) {
  const symbol = currencySymbols[baseCurrency];
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  const recurringItems = [
    ...assets.filter((a) => a.isRecurring && a.recurringDay).map((a) => ({ ...a, type: "asset" as const })),
    ...liabilities.filter((l) => l.isRecurring && l.recurringDay).map((l) => ({ ...l, type: "liability" as const })),
  ].sort((a, b) => (a.recurringDay || 0) - (b.recurringDay || 0));

  const upcomingItems = recurringItems.filter((item) => (item.recurringDay || 0) >= currentDay);
  const pastItems = recurringItems.filter((item) => (item.recurringDay || 0) < currentDay);
  const sortedItems = [...upcomingItems, ...pastItems];

  const getDayLabel = (day: number): string => {
    const diff = day - currentDay;
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    if (diff < 0) return `${day}${getOrdinal(day)} (passed)`;
    if (diff <= 7) return `In ${diff} days`;
    return `${day}${getOrdinal(day)}`;
  };

  const getOrdinal = (n: number): string => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  if (recurringItems.length === 0) {
    return (
      <Card className="rounded-2xl border-border/50" data-testid="card-bill-calendar">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Bill Calendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No recurring items</p>
            <p className="text-xs text-muted-foreground mt-1">
              Mark accounts as recurring to track payment dates
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-border/50" data-testid="card-bill-calendar">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Bill Calendar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedItems.map((item) => {
            const isPast = (item.recurringDay || 0) < currentDay;
            const isToday = item.recurringDay === currentDay;
            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  isToday
                    ? "bg-primary/5 border-primary/30"
                    : isPast
                    ? "bg-muted/20 border-border/30 opacity-60"
                    : "bg-muted/30 border-border/30"
                }`}
                data-testid={`bill-item-${item.id}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    item.type === "asset" ? "bg-primary/10" : "bg-destructive/10"
                  }`}>
                    {item.type === "asset" ? (
                      <Wallet className="h-4 w-4 text-primary" />
                    ) : (
                      <CreditCard className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{getDayLabel(item.recurringDay || 0)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium tabular-nums ${isPrivate ? "privacy-blur" : ""} ${
                    item.type === "asset" ? "text-primary" : "text-destructive"
                  }`}>
                    {item.type === "liability" ? "-" : "+"}{symbol}{item.value.toLocaleString()}
                  </p>
                  {isToday && (
                    <Badge variant="default" className="text-xs h-5 px-1.5 mt-1">
                      Due Today
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Total</span>
            <span className={`font-medium tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
              {symbol}
              {recurringItems
                .filter((i) => i.type === "liability")
                .reduce((sum, i) => sum + i.value, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
