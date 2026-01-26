import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  assetCategories,
  liabilityCategories,
  currencies,
  assetCategoryLabels,
  liabilityCategoryLabels,
  currencySymbols,
  ownershipTypes,
  ownershipLabels,
  type Currency,
  type Asset,
  type Liability,
  type OwnershipType,
} from "@shared/schema";
import { Loader2, X, User, Users, Heart, Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Must be a positive number"
  ),
  category: z.string().min(1, "Category is required"),
  currency: z.enum(currencies),
  notes: z.string().optional(),
  tags: z.string().optional(),
  ownership: z.enum(ownershipTypes).optional(),
  isRecurring: z.boolean().optional(),
  recurringDay: z.number().min(1).max(31).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAsset: (data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }) => Promise<void>;
  onAddLiability: (data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }) => Promise<void>;
  baseCurrency: Currency;
  editItem?: Asset | Liability | null;
  editType?: "asset" | "liability";
  onEditAsset?: (id: string, data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }) => Promise<void>;
  onEditLiability?: (id: string, data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }) => Promise<void>;
}

export function AddTransactionDialog({
  open,
  onOpenChange,
  onAddAsset,
  onAddLiability,
  baseCurrency,
  editItem,
  editType,
  onEditAsset,
  onEditLiability,
}: AddTransactionDialogProps) {
  const [type, setType] = useState<"asset" | "liability">("asset");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
      category: "",
      currency: baseCurrency,
      notes: "",
      tags: "",
      ownership: "personal",
      isRecurring: false,
      recurringDay: undefined,
    },
  });

  const watchedValue = form.watch("value");
  const watchedCurrency = form.watch("currency");

  useEffect(() => {
    if (open) {
      if (editItem && editType) {
        setType(editType);
        form.reset({
          name: editItem.name,
          value: editItem.value.toString(),
          category: editItem.category,
          currency: editItem.currency,
          notes: editItem.notes || "",
          tags: editItem.tags?.join(", ") || "",
          ownership: editItem.ownership || "personal",
          isRecurring: editItem.isRecurring || false,
          recurringDay: editItem.recurringDay,
        });
      } else {
        setType("asset");
        form.reset({
          name: "",
          value: "",
          category: "",
          currency: baseCurrency,
          notes: "",
          tags: "",
          ownership: "personal",
          isRecurring: false,
          recurringDay: undefined,
        });
      }
    }
  }, [open, editItem, editType, baseCurrency, form]);

  const isEditing = !!editItem;

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const parsedTags = data.tags
        ? data.tags.split(",").map(t => t.trim()).filter(t => t.length > 0)
        : undefined;
      
      const payload = {
        name: data.name,
        value: parseFloat(data.value),
        category: data.category,
        currency: data.currency as Currency,
        notes: data.notes || undefined,
        tags: parsedTags && parsedTags.length > 0 ? parsedTags : undefined,
        ownership: data.ownership as OwnershipType,
        isRecurring: data.isRecurring,
        recurringDay: data.isRecurring ? data.recurringDay : undefined,
      };

      if (isEditing && editItem) {
        if (editType === "asset" && onEditAsset) {
          await onEditAsset(editItem.id, payload);
        } else if (editType === "liability" && onEditLiability) {
          await onEditLiability(editItem.id, payload);
        }
      } else {
        if (type === "asset") {
          await onAddAsset(payload);
        } else {
          await onAddLiability(payload);
        }
      }

      form.reset({
        name: "",
        value: "",
        category: "",
        currency: baseCurrency,
        notes: "",
        tags: "",
        ownership: "personal",
        isRecurring: false,
        recurringDay: undefined,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = type === "asset" ? assetCategories : liabilityCategories;
  const categoryLabels = type === "asset" ? assetCategoryLabels : liabilityCategoryLabels;

  const formatDisplayValue = (val: string, currency: Currency): string => {
    if (!val) return currencySymbols[currency] + "0";
    const num = parseFloat(val);
    if (isNaN(num)) return currencySymbols[currency] + "0";
    return currencySymbols[currency] + num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-full max-w-none sm:max-w-lg sm:h-auto sm:max-h-[90vh] rounded-none sm:rounded-2xl p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>
            {isEditing ? "Edit" : "Add"} {type === "asset" ? "Asset" : "Liability"}
          </DialogTitle>
          <DialogDescription>
            Enter the details for your {type === "asset" ? "asset" : "liability"}
          </DialogDescription>
        </DialogHeader>

        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            {isEditing ? "Edit" : "Add"} {type === "asset" ? "Asset" : "Liability"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            data-testid="button-close-dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!isEditing && (
            <Tabs
              value={type}
              onValueChange={(v) => {
                setType(v as "asset" | "liability");
                form.setValue("category", "");
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 rounded-2xl">
                <TabsTrigger 
                  value="asset" 
                  data-testid="tab-asset" 
                  className="rounded-xl text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Asset
                </TabsTrigger>
                <TabsTrigger 
                  value="liability" 
                  data-testid="tab-liability" 
                  className="rounded-xl text-sm font-medium data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground transition-all"
                >
                  Liability
                </TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="py-8 text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">
              {type === "asset" ? "Asset Value" : "Liability Amount"}
            </p>
            <p className={`text-5xl sm:text-6xl font-bold tracking-tight tabular-nums ${
              type === "asset" ? "text-primary" : "text-destructive"
            }`}>
              {formatDisplayValue(watchedValue, watchedCurrency)}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Value</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="text-lg tabular-nums"
                          {...field}
                          data-testid="input-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Currency</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-currency">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency} value={currency}>
                              {currencySymbols[currency]} {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={type === "asset" ? "e.g., Savings Account" : "e.g., Credit Card"}
                        {...field}
                        data-testid="input-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger data-testid="select-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {currentCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {categoryLabels[category as keyof typeof categoryLabels]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add any notes or details..."
                        className="resize-none"
                        rows={2}
                        {...field}
                        data-testid="input-notes"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Tag className="h-3 w-3" />
                      Tags (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter tags separated by commas (e.g., emergency, investment)"
                        {...field}
                        data-testid="input-tags"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">Separate multiple tags with commas</p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ownership"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Ownership</FormLabel>
                    <div className="flex gap-2">
                      {ownershipTypes.map((ownerType) => {
                        const Icon = ownerType === "personal" ? User : ownerType === "partner" ? Heart : Users;
                        return (
                          <button
                            key={ownerType}
                            type="button"
                            onClick={() => field.onChange(ownerType)}
                            className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                              field.value === ownerType
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="text-sm font-medium">{ownershipLabels[ownerType]}</span>
                          </button>
                        );
                      })}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between p-3 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <FormLabel className="text-sm font-medium">Recurring</FormLabel>
                        <p className="text-xs text-muted-foreground">Repeats monthly on a specific day</p>
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="switch-recurring"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch("isRecurring") && (
                <FormField
                  control={form.control}
                  name="recurringDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wide">Day of Month</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        value={field.value?.toString() || ""}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-recurring-day">
                            <SelectValue placeholder="Select day" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}{day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <Button
                type="submit"
                size="lg"
                className={`w-full ${type === "asset" ? "gradient-primary" : "bg-destructive"}`}
                disabled={isSubmitting}
                data-testid="button-submit"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {isEditing ? "Saving..." : "Adding..."}
                  </>
                ) : (
                  isEditing ? "Save Changes" : `Add ${type === "asset" ? "Asset" : "Liability"}`
                )}
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
