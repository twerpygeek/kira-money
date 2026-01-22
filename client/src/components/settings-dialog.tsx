import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies, currencySymbols, type Currency, type Settings } from "@shared/schema";
import { useState } from "react";
import { Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const [baseCurrency, setBaseCurrency] = useState<Currency>(settings.baseCurrency);
  const [userName, setUserName] = useState(settings.userName || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        ...settings,
        baseCurrency,
        userName: userName || undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export");
      if (!response.ok) throw new Error("Export failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kira-export-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({ title: "Data exported successfully" });
    } catch (error) {
      toast({ title: "Failed to export data", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">Settings</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Customize your KIRA preferences
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-xs text-muted-foreground uppercase tracking-wide">Display Name (Optional)</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              data-testid="input-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseCurrency" className="text-xs text-muted-foreground uppercase tracking-wide">Base Currency</Label>
            <Select
              value={baseCurrency}
              onValueChange={(value) => setBaseCurrency(value as Currency)}
            >
              <SelectTrigger id="baseCurrency" data-testid="select-base-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currencySymbols[currency]} {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All values will be converted to this currency for display
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Data Management</Label>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExport}
              disabled={isExporting}
              data-testid="button-export"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Download all your assets, liabilities, and history as a spreadsheet
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full gradient-primary"
          disabled={isSaving}
          data-testid="button-save-settings"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
