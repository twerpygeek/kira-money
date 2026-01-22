import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencies, currencySymbols, type Currency, type Settings } from "@shared/schema";
import { useState } from "react";
import { Loader2 } from "lucide-react";

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
  const [baseCurrency, setBaseCurrency] = useState<Currency>(settings.baseCurrency);
  const [userName, setUserName] = useState(settings.userName || "");
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName">Display Name (Optional)</Label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              data-testid="input-username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseCurrency">Base Currency</Label>
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
            <p className="text-sm text-muted-foreground">
              All values will be converted to this currency for display
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full"
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
