import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storage } from "@/lib/localStorage";
import { type Goal, type Currency, currencies, currencySymbols, goalIcons, goalColors } from "@shared/schema";
import { Target, Plus, Trash2, Edit2, Home, Plane, Car, GemIcon, GraduationCap, PiggyBank, HeartPulse, Baby, PartyPopper, Smartphone, Laptop, Umbrella, LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  "home": Home,
  "plane": Plane,
  "car": Car,
  "ring": GemIcon,
  "graduation": GraduationCap,
  "piggy-bank": PiggyBank,
  "heart-pulse": HeartPulse,
  "baby": Baby,
  "party-popper": PartyPopper,
  "smartphone": Smartphone,
  "laptop": Laptop,
  "umbrella-beach": Umbrella,
};

function GoalIcon({ iconName, className, style }: { iconName: string; className?: string; style?: React.CSSProperties }) {
  const IconComponent = iconMap[iconName] || Target;
  return <IconComponent className={className} style={style} />;
}

interface GoalsCardProps {
  goals: Goal[];
  baseCurrency: Currency;
  isPrivate: boolean;
  onRefresh: () => void;
}

export function GoalsCard({ goals, baseCurrency, isPrivate, onRefresh }: GoalsCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("piggy-bank");
  const [selectedColor, setSelectedColor] = useState("#10B981");
  const [currency, setCurrency] = useState<Currency>(baseCurrency);

  const openAddDialog = () => {
    setEditGoal(null);
    setName("");
    setTargetAmount("");
    setCurrentAmount("0");
    setDeadline("");
    setSelectedIcon("piggy-bank");
    setSelectedColor("#10B981");
    setCurrency(baseCurrency);
    setDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditGoal(goal);
    setName(goal.name);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline || "");
    setSelectedIcon(goal.icon || "piggy-bank");
    setSelectedColor(goal.color || "#10B981");
    setCurrency(goal.currency);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name || !targetAmount) return;

    const data = {
      name,
      targetAmount: parseFloat(targetAmount),
      currentAmount: parseFloat(currentAmount) || 0,
      currency,
      deadline: deadline || undefined,
      icon: selectedIcon,
      color: selectedColor,
    };

    if (editGoal) {
      storage.updateGoal(editGoal.id, data);
    } else {
      storage.addGoal(data);
    }

    setDialogOpen(false);
    onRefresh();
  };

  const handleDelete = (id: string) => {
    storage.deleteGoal(id);
    onRefresh();
  };

  const formatValue = (value: number, curr: Currency): string => {
    return `${currencySymbols[curr]}${value.toLocaleString()}`;
  };

  const calculateTimeToGoal = (goal: Goal): string | null => {
    if (!goal.deadline) return null;
    const deadline = new Date(goal.deadline);
    const now = new Date();
    const diff = deadline.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0) return "Overdue";
    if (days === 0) return "Today";
    if (days === 1) return "1 day left";
    if (days < 30) return `${days} days left`;
    if (days < 365) return `${Math.floor(days / 30)} months left`;
    return `${Math.floor(days / 365)} years left`;
  };

  return (
    <>
      <Card className="rounded-2xl border-border/50" data-testid="card-goals">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Savings Goals
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={openAddDialog} data-testid="button-add-goal">
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {goals.length === 0 ? (
            <div className="text-center py-6">
              <Target className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-3">No goals yet</p>
              <Button size="sm" variant="outline" onClick={openAddDialog}>
                <Plus className="h-3 w-3 mr-1" />
                Create Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              const timeLeft = calculateTimeToGoal(goal);
              return (
                <div
                  key={goal.id}
                  className="p-3 rounded-xl bg-muted/30 border border-border/30 space-y-2"
                  data-testid={`goal-item-${goal.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GoalIcon iconName={goal.icon || "piggy-bank"} className="h-5 w-5" style={{ color: goal.color }} />
                      <span className="font-medium text-sm">{goal.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(goal)}>
                        <Edit2 className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <Progress value={Math.min(progress, 100)} className="h-2" style={{ "--progress-color": goal.color } as any} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span className={isPrivate ? "privacy-blur" : ""}>
                      {formatValue(goal.currentAmount, goal.currency)} / {formatValue(goal.targetAmount, goal.currency)}
                    </span>
                    <span className={`font-medium ${progress >= 100 ? "text-primary" : ""}`}>
                      {progress >= 100 ? "Complete!" : `${progress.toFixed(0)}%`}
                    </span>
                  </div>
                  {timeLeft && (
                    <p className="text-xs text-muted-foreground">{timeLeft}</p>
                  )}
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editGoal ? "Edit Goal" : "Create Goal"}</DialogTitle>
            <DialogDescription>Set a savings target to track your progress</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Goal Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Vacation Fund"
                data-testid="input-goal-name"
              />
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {goalIcons.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
                      selectedIcon === icon ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                  >
                    <GoalIcon iconName={icon} className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {goalColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      selectedColor === color ? "border-foreground scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Amount</Label>
                <Input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="10000"
                  data-testid="input-goal-target"
                />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((c) => (
                      <SelectItem key={c} value={c}>
                        {currencySymbols[c]} {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current Amount Saved</Label>
              <Input
                type="number"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                placeholder="0"
                data-testid="input-goal-current"
              />
            </div>

            <div className="space-y-2">
              <Label>Target Date (Optional)</Label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                data-testid="input-goal-deadline"
              />
            </div>

            <Button className="w-full gradient-primary" onClick={handleSave} data-testid="button-save-goal">
              {editGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
