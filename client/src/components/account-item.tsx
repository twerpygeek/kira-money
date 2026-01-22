import { 
  Banknote, 
  TrendingUp, 
  Bitcoin, 
  Home, 
  Car, 
  Landmark, 
  CreditCard, 
  Building,
  GraduationCap,
  CircleDollarSign,
  Pencil,
  Trash2,
  MoreHorizontal
} from "lucide-react";
import {
  type Asset,
  type Liability,
  type AssetCategory,
  type LiabilityCategory,
  currencySymbols,
  type Currency,
  assetCategoryLabels,
  liabilityCategoryLabels,
  convertToBaseCurrency,
} from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountItemProps {
  item: Asset | Liability;
  type: "asset" | "liability";
  baseCurrency: Currency;
  isPrivate: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const assetIcons: Record<AssetCategory, typeof Banknote> = {
  cash: Banknote,
  stocks: TrendingUp,
  crypto: Bitcoin,
  property: Home,
  vehicles: Car,
  retirement: Landmark,
  other: CircleDollarSign,
};

const liabilityIcons: Record<LiabilityCategory, typeof CreditCard> = {
  credit_card: CreditCard,
  mortgage: Building,
  personal_loan: CircleDollarSign,
  student_loan: GraduationCap,
  car_loan: Car,
  other: CircleDollarSign,
};

function formatCurrency(value: number, currency: Currency): string {
  const symbol = currencySymbols[currency];
  return `${symbol}${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export function AccountItem({
  item,
  type,
  baseCurrency,
  isPrivate,
  onEdit,
  onDelete,
}: AccountItemProps) {
  const isAsset = type === "asset";
  const category = item.category as AssetCategory | LiabilityCategory;
  const Icon = isAsset
    ? assetIcons[category as AssetCategory]
    : liabilityIcons[category as LiabilityCategory];
  const categoryLabel = isAsset
    ? assetCategoryLabels[category as AssetCategory]
    : liabilityCategoryLabels[category as LiabilityCategory];

  const showConversion = item.currency !== baseCurrency;
  const convertedValue = convertToBaseCurrency(item.value, item.currency, baseCurrency);

  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/50 hover-elevate transition-all"
      data-testid={`item-${type}-${item.id}`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl ${
            isAsset ? "bg-primary/10" : "bg-destructive/10"
          }`}
        >
          <Icon
            className={`h-5 w-5 ${
              isAsset ? "text-primary" : "text-destructive"
            }`}
          />
        </div>
        <div>
          <p className="font-medium text-foreground tracking-tight">{item.name}</p>
          <p className="text-xs text-muted-foreground">{categoryLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-right">
          <p
            className={`font-semibold tabular-nums ${
              isAsset ? "text-primary" : "text-destructive"
            } ${isPrivate ? "privacy-blur" : ""}`}
          >
            {isAsset ? "" : "-"}
            {formatCurrency(convertedValue, baseCurrency)}
          </p>
          {showConversion && (
            <p className={`text-xs text-muted-foreground tabular-nums ${isPrivate ? "privacy-blur" : ""}`}>
              {formatCurrency(item.value, item.currency)}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" data-testid={`button-menu-${item.id}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-xl">
            <DropdownMenuItem onClick={onEdit} data-testid={`button-edit-${item.id}`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
