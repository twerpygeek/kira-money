import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { storage } from "@/lib/localStorage";
import { type Insight } from "@shared/schema";
import { Lightbulb, TrendingUp, AlertTriangle, Sparkles, Check, X, Bell } from "lucide-react";

interface InsightsPanelProps {
  insights: Insight[];
  onRefresh: () => void;
}

const insightIcons: Record<Insight["type"], any> = {
  milestone: Sparkles,
  warning: AlertTriangle,
  tip: Lightbulb,
  change: TrendingUp,
};

const insightColors: Record<Insight["type"], string> = {
  milestone: "text-yellow-500 bg-yellow-500/10",
  warning: "text-destructive bg-destructive/10",
  tip: "text-primary bg-primary/10",
  change: "text-blue-500 bg-blue-500/10",
};

export function InsightsPanel({ insights, onRefresh }: InsightsPanelProps) {
  const unreadCount = insights.filter((i) => !i.isRead).length;

  const handleMarkRead = (id: string) => {
    storage.markInsightRead(id);
    onRefresh();
  };

  const handleMarkAllRead = () => {
    storage.markAllInsightsRead();
    onRefresh();
  };

  const handleClearAll = () => {
    storage.clearInsights();
    onRefresh();
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="rounded-2xl border-border/50" data-testid="card-insights">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Insights
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="default" className="h-5 px-1.5 text-xs">
              {unreadCount}
            </Badge>
          )}
        </div>
        {insights.length > 0 && (
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
                <Check className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={handleClearAll}>
              <X className="h-3 w-3 mr-1" />
              Clear
              </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-8">
            <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No insights yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Track your finances to receive personalized insights
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {insights.slice(0, 10).map((insight) => {
              const Icon = insightIcons[insight.type];
              const colorClass = insightColors[insight.type];
              return (
                <div
                  key={insight.id}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    insight.isRead
                      ? "bg-muted/20 border-border/30 opacity-60"
                      : "bg-card border-border/50 hover:border-primary/30"
                  }`}
                  onClick={() => handleMarkRead(insight.id)}
                  data-testid={`insight-item-${insight.id}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${colorClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(insight.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
