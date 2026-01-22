import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  type Asset, 
  assetCategoryLabels, 
  type AssetCategory, 
  currencySymbols, 
  type Currency,
  convertToBaseCurrency 
} from "@shared/schema";
import { PieChartIcon } from "lucide-react";

interface AllocationChartProps {
  assets: Asset[];
  baseCurrency: Currency;
  isPrivate: boolean;
}

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(45, 93%, 58%)",
  "hsl(199, 89%, 48%)",
  "hsl(280, 65%, 60%)",
  "hsl(15, 80%, 55%)",
  "hsl(340, 75%, 55%)",
  "hsl(180, 60%, 45%)",
];

export function AllocationChart({ assets, baseCurrency, isPrivate }: AllocationChartProps) {
  if (assets.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            Asset Allocation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-center justify-center text-muted-foreground">
            <p>Add assets to see allocation breakdown</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const categoryTotals = assets.reduce((acc, asset) => {
    const category = asset.category as AssetCategory;
    const convertedValue = convertToBaseCurrency(asset.value, asset.currency, baseCurrency);
    acc[category] = (acc[category] || 0) + convertedValue;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const chartData = Object.entries(categoryTotals).map(([category, value]) => ({
    name: assetCategoryLabels[category as AssetCategory],
    value,
    category,
  }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / totalValue) * 100).toFixed(1);
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className={`text-sm ${isPrivate ? "privacy-blur" : ""}`}>
            {currencySymbols[baseCurrency]}{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-2">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalValue) * 100).toFixed(0);
          return (
            <li key={`legend-${index}`} className="flex items-center gap-1.5 text-sm">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">{entry.value}</span>
              <span className={`font-medium ${isPrivate ? "privacy-blur" : ""}`}>
                {percentage}%
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <Card data-testid="card-allocation">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-primary" />
          Asset Allocation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`h-64 ${isPrivate ? "privacy-blur" : ""}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="45%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
