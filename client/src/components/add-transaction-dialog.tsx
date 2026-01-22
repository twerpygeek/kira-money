import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  assetCategories,
  liabilityCategories,
  currencies,
  assetCategoryLabels,
  liabilityCategoryLabels,
  type Currency,
  type Asset,
  type Liability,
} from "@shared/schema";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required").refine(
    (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
    "Must be a positive number"
  ),
  category: z.string().min(1, "Category is required"),
  currency: z.enum(currencies),
});

type FormData = z.infer<typeof formSchema>;

interface AddTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAsset: (data: { name: string; value: number; category: string; currency: Currency }) => Promise<void>;
  onAddLiability: (data: { name: string; value: number; category: string; currency: Currency }) => Promise<void>;
  baseCurrency: Currency;
  editItem?: Asset | Liability | null;
  editType?: "asset" | "liability";
  onEditAsset?: (id: string, data: { name: string; value: number; category: string; currency: Currency }) => Promise<void>;
  onEditLiability?: (id: string, data: { name: string; value: number; category: string; currency: Currency }) => Promise<void>;
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
    },
  });

  useEffect(() => {
    if (open) {
      if (editItem && editType) {
        setType(editType);
        form.reset({
          name: editItem.name,
          value: editItem.value.toString(),
          category: editItem.category,
          currency: editItem.currency,
        });
      } else {
        setType("asset");
        form.reset({
          name: "",
          value: "",
          category: "",
          currency: baseCurrency,
        });
      }
    }
  }, [open, editItem, editType, baseCurrency, form]);

  const isEditing = !!editItem;

  const handleSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        value: parseFloat(data.value),
        category: data.category,
        currency: data.currency as Currency,
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
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = type === "asset" ? assetCategories : liabilityCategories;
  const categoryLabels = type === "asset" ? assetCategoryLabels : liabilityCategoryLabels;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit" : "Add"} {type === "asset" ? "Asset" : "Liability"}
          </DialogTitle>
        </DialogHeader>

        {!isEditing && (
          <Tabs
            value={type}
            onValueChange={(v) => {
              setType(v as "asset" | "liability");
              form.setValue("category", "");
            }}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="asset" data-testid="tab-asset" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Asset
              </TabsTrigger>
              <TabsTrigger value="liability" data-testid="tab-liability" className="data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
                Liability
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
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
                    <FormLabel>Currency</FormLabel>
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
                            {currency}
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
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

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              data-testid="button-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : (
                isEditing ? "Save Changes" : `Add ${type === "asset" ? "Asset" : "Liability"}`
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
