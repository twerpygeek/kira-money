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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { currencies, currencySymbols, type Currency, type Settings } from "@shared/schema";
import { storage } from "@/lib/localStorage";
import { useState, useEffect } from "react";
import { Loader2, Download, Upload, Trash2, FileSpreadsheet, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
  onClearData?: () => void;
  onDataRestored?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
  onClearData,
  onDataRestored,
}: SettingsDialogProps) {
  const { toast } = useToast();
  const [baseCurrency, setBaseCurrency] = useState<Currency>(settings.baseCurrency);
  const [userName, setUserName] = useState(settings.userName || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setBaseCurrency(settings.baseCurrency);
      setUserName(settings.userName || "");
    }
  }, [open, settings]);

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

  const handleExportJSON = () => {
    const jsonData = storage.exportData();
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kira-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: "Backup downloaded successfully" });
  };

  const handleImportFile = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,.csv";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        
        if (file.name.endsWith(".csv")) {
          const result = storage.importCSV(content);
          if (result) {
            toast({ 
              title: "CSV imported successfully!", 
              description: `Added ${result.assets} assets and ${result.liabilities} liabilities` 
            });
            onOpenChange(false);
            if (onDataRestored) {
              onDataRestored();
            }
          } else {
            toast({ title: "Failed to import CSV. Make sure it has 'name' and 'value' columns.", variant: "destructive" });
          }
        } else {
          if (storage.importData(content)) {
            toast({ title: "Data restored successfully" });
            onOpenChange(false);
            if (onDataRestored) {
              onDataRestored();
            }
          } else {
            toast({ title: "Failed to restore data", variant: "destructive" });
          }
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleExportCSV = () => {
    const csvData = storage.exportCSV();
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kira-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast({ title: "CSV exported successfully" });
  };

  const handleClearData = () => {
    if (onClearData) {
      onClearData();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl max-h-[90vh] overflow-y-auto">
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
              onClick={handleExportJSON}
              data-testid="button-backup"
            >
              <Download className="mr-2 h-4 w-4" />
              Backup Data (JSON)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleExportCSV}
              data-testid="button-export-csv"
            >
              <FileSpreadsheet className="mr-2 h-4 w-4" />
              Export to Spreadsheet (CSV)
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleImportFile}
              data-testid="button-restore"
            >
              <Upload className="mr-2 h-4 w-4" />
              Import Data (JSON or CSV)
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                const template = storage.getCSVTemplate();
                const blob = new Blob([template], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "kira_import_template.csv";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
                toast({ title: "Template downloaded - fill it in and import!" });
              }}
              data-testid="button-download-template"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Your data is stored locally. Download the template to see the expected format, then import your data.
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Danger Zone</Label>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  data-testid="button-clear-data"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all your assets, liabilities, and history. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClearData}
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
