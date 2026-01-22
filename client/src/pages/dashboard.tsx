import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";
import { PrivacyToggle } from "@/components/privacy-toggle";
import { NetWorthDisplay } from "@/components/net-worth-display";
import { NetWorthChart } from "@/components/net-worth-chart";
import { SummaryCards } from "@/components/summary-cards";
import { AccountItem } from "@/components/account-item";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AllocationChart } from "@/components/allocation-chart";
import { SettingsDialog } from "@/components/settings-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  type Asset,
  type Liability,
  type HistorySnapshot,
  type Settings,
  type Currency,
  convertToBaseCurrency,
  currencySymbols,
} from "@shared/schema";
import {
  Plus,
  Settings as SettingsIcon,
  LayoutDashboard,
  Wallet,
  PieChart,
  Target,
} from "lucide-react";
import kiraLogo from "@assets/Kira_money_1769089620127.jpg";

function calculateMilestone(netWorth: number): { target: number; progress: number } {
  const milestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000];
  const target = milestones.find((m) => m > netWorth) || milestones[milestones.length - 1];
  const previousMilestone = milestones[milestones.indexOf(target) - 1] || 0;
  const progress = ((netWorth - previousMilestone) / (target - previousMilestone)) * 100;
  return { target, progress: Math.max(0, Math.min(100, progress)) };
}

function formatCompact(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  if (value >= 1000000) {
    return `${symbol}${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${symbol}${(value / 1000).toFixed(0)}K`;
  }
  return `${symbol}${value.toFixed(0)}`;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Asset | Liability | null>(null);
  const [editType, setEditType] = useState<"asset" | "liability">("asset");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: settings, isLoading: settingsLoading } = useQuery<Settings>({
    queryKey: ["/api/settings"],
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery<Asset[]>({
    queryKey: ["/api/assets"],
  });

  const { data: liabilities = [], isLoading: liabilitiesLoading } = useQuery<Liability[]>({
    queryKey: ["/api/liabilities"],
  });

  const { data: history = [] } = useQuery<HistorySnapshot[]>({
    queryKey: ["/api/history"],
  });

  const baseCurrency = settings?.baseCurrency || "USD";
  const isPrivate = settings?.privacyMode || false;
  const userName = settings?.userName;

  const totalAssets = assets.reduce((sum, asset) => {
    return sum + convertToBaseCurrency(asset.value, asset.currency, baseCurrency);
  }, 0);

  const totalLiabilities = liabilities.reduce((sum, liability) => {
    return sum + convertToBaseCurrency(liability.value, liability.currency, baseCurrency);
  }, 0);

  const netWorth = totalAssets - totalLiabilities;
  const previousNetWorth = history.length > 1 ? history[history.length - 2]?.netWorth : 0;
  const milestone = calculateMilestone(netWorth);

  const liquidCategories = ["cash", "stocks", "crypto"];
  const illiquidCategories = ["property", "vehicles", "retirement", "other"];

  const liquidAssets = assets.filter((a) => liquidCategories.includes(a.category));
  const illiquidAssets = assets.filter((a) => illiquidCategories.includes(a.category));

  const addAssetMutation = useMutation({
    mutationFn: async (data: { name: string; value: number; category: string; currency: Currency }) => {
      return apiRequest("POST", "/api/assets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Asset added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add asset", variant: "destructive" });
    },
  });

  const addLiabilityMutation = useMutation({
    mutationFn: async (data: { name: string; value: number; category: string; currency: Currency }) => {
      return apiRequest("POST", "/api/liabilities", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Liability added successfully" });
    },
    onError: () => {
      toast({ title: "Failed to add liability", variant: "destructive" });
    },
  });

  const updateAssetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; value: number; category: string; currency: Currency } }) => {
      return apiRequest("PATCH", `/api/assets/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Asset updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update asset", variant: "destructive" });
    },
  });

  const updateLiabilityMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; value: number; category: string; currency: Currency } }) => {
      return apiRequest("PATCH", `/api/liabilities/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Liability updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update liability", variant: "destructive" });
    },
  });

  const deleteAssetMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/assets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Asset deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete asset", variant: "destructive" });
    },
  });

  const deleteLiabilityMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/liabilities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/liabilities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/history"] });
      toast({ title: "Liability deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete liability", variant: "destructive" });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Settings) => {
      return apiRequest("PATCH", "/api/settings", newSettings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
    },
    onError: () => {
      toast({ title: "Failed to save settings", variant: "destructive" });
    },
  });

  const togglePrivacyMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PATCH", "/api/settings", {
        ...settings,
        privacyMode: !isPrivate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
  });

  const handleEdit = (item: Asset | Liability, type: "asset" | "liability") => {
    setEditItem(item);
    setEditType(type);
    setAddDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) {
      setEditItem(null);
    }
  };

  const isLoading = settingsLoading || assetsLoading || liabilitiesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 scrollbar-hide">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-9 rounded-md" />
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          </div>
          <div className="flex flex-col items-center py-8">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-16 w-64" />
          </div>
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background scrollbar-hide">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <header className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2" data-testid="text-greeting">
            <img src={kiraLogo} alt="KIRA" className="w-8 h-8 rounded-lg" />
            <h1 className="text-xl font-bold tracking-tight">
              {userName || "KIRA"}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <PrivacyToggle
              isPrivate={isPrivate}
              onToggle={() => togglePrivacyMutation.mutate()}
            />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsDialogOpen(true)}
              data-testid="button-settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-12 p-1 rounded-2xl bg-muted/50">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all" 
              data-testid="tab-overview"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="accounts" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all" 
              data-testid="tab-accounts"
            >
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Accounts</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all" 
              data-testid="tab-insights"
            >
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline text-sm">Insights</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <NetWorthDisplay
              netWorth={netWorth}
              previousNetWorth={previousNetWorth}
              baseCurrency={baseCurrency}
              isPrivate={isPrivate}
              history={history}
              userName={userName}
            />

            <Card className="rounded-2xl border-border/50" data-testid="card-milestone">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Next Milestone</span>
                  </div>
                  <span className={`text-sm font-semibold text-primary tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
                    {milestone.progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={milestone.progress} className="h-2 mb-2" />
                <p className={`text-xs text-muted-foreground ${isPrivate ? "privacy-blur" : ""}`}>
                  {formatCompact(netWorth, baseCurrency)} of {formatCompact(milestone.target, baseCurrency)}
                </p>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold tracking-tight">Net Worth History</CardTitle>
              </CardHeader>
              <CardContent>
                <NetWorthChart
                  history={history}
                  baseCurrency={baseCurrency}
                  isPrivate={isPrivate}
                />
              </CardContent>
            </Card>

            <SummaryCards
              totalAssets={totalAssets}
              totalLiabilities={totalLiabilities}
              baseCurrency={baseCurrency}
              isPrivate={isPrivate}
            />
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            {assets.length === 0 && liabilities.length === 0 ? (
              <Card className="rounded-2xl">
                <CardContent className="py-12 text-center">
                  <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No accounts yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Add your first asset or liability to start tracking your net worth
                  </p>
                  <Button onClick={() => setAddDialogOpen(true)} className="gradient-primary" data-testid="button-add-first">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Account
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {liquidAssets.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      Liquid Assets
                    </h2>
                    <div className="space-y-2">
                      {liquidAssets.map((asset) => (
                        <AccountItem
                          key={asset.id}
                          item={asset}
                          type="asset"
                          baseCurrency={baseCurrency}
                          isPrivate={isPrivate}
                          onEdit={() => handleEdit(asset, "asset")}
                          onDelete={() => deleteAssetMutation.mutate(asset.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {illiquidAssets.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-3" />
                      Illiquid Assets
                    </h2>
                    <div className="space-y-2">
                      {illiquidAssets.map((asset) => (
                        <AccountItem
                          key={asset.id}
                          item={asset}
                          type="asset"
                          baseCurrency={baseCurrency}
                          isPrivate={isPrivate}
                          onEdit={() => handleEdit(asset, "asset")}
                          onDelete={() => deleteAssetMutation.mutate(asset.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {liabilities.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
                      Liabilities
                    </h2>
                    <div className="space-y-2">
                      {liabilities.map((liability) => (
                        <AccountItem
                          key={liability.id}
                          item={liability}
                          type="liability"
                          baseCurrency={baseCurrency}
                          isPrivate={isPrivate}
                          onEdit={() => handleEdit(liability, "liability")}
                          onDelete={() => deleteLiabilityMutation.mutate(liability.id)}
                        />
                      ))}
                    </div>

                    <Card className="rounded-2xl border-border/50 mt-4">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Debt-to-Asset Ratio</span>
                          <span className={`text-sm font-semibold tabular-nums ${
                            totalAssets > 0 && (totalLiabilities / totalAssets) > 0.5 
                              ? "text-destructive" 
                              : "text-primary"
                          } ${isPrivate ? "privacy-blur" : ""}`}>
                            {totalAssets > 0 ? ((totalLiabilities / totalAssets) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={totalAssets > 0 ? Math.min((totalLiabilities / totalAssets) * 100, 100) : 0} 
                          className="h-2"
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AllocationChart
              assets={assets}
              baseCurrency={baseCurrency}
              isPrivate={isPrivate}
            />

            <Card className="rounded-2xl border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold tracking-tight">Summary Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Total Accounts</span>
                  <span className="font-medium tabular-nums">{assets.length + liabilities.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Liquid Assets</span>
                  <span className="font-medium tabular-nums">{liquidAssets.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Illiquid Assets</span>
                  <span className="font-medium tabular-nums">{illiquidAssets.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Total Liabilities</span>
                  <span className="font-medium tabular-nums">{liabilities.length}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-muted-foreground">History Snapshots</span>
                  <span className="font-medium tabular-nums">{history.length}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="fixed bottom-6 right-6">
        <Button
          size="icon"
          className="w-14 rounded-full shadow-lg gradient-primary"
          onClick={() => setAddDialogOpen(true)}
          data-testid="button-add"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <AddTransactionDialog
        open={addDialogOpen}
        onOpenChange={handleDialogClose}
        onAddAsset={async (data) => {
          await addAssetMutation.mutateAsync(data);
        }}
        onAddLiability={async (data) => {
          await addLiabilityMutation.mutateAsync(data);
        }}
        baseCurrency={baseCurrency}
        editItem={editItem}
        editType={editType}
        onEditAsset={async (id, data) => {
          await updateAssetMutation.mutateAsync({ id, data });
        }}
        onEditLiability={async (id, data) => {
          await updateLiabilityMutation.mutateAsync({ id, data });
        }}
      />

      <SettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        settings={settings || { baseCurrency: "USD", privacyMode: false }}
        onSave={async (newSettings) => {
          await updateSettingsMutation.mutateAsync(newSettings);
        }}
      />
    </div>
  );
}
