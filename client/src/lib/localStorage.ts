import type { Asset, Liability, Settings, HistorySnapshot, Currency, Goal, Insight, OwnershipType } from "@shared/schema";
import { convertToBaseCurrency as staticConvert } from "@shared/schema";
import { convertToBase, initializeRates, getCachedRateInfo } from "./currencyService";

// Use dynamic rates if available, otherwise fall back to static
function convertToBaseCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
  try {
    return convertToBase(amount, fromCurrency, toCurrency);
  } catch {
    return staticConvert(amount, fromCurrency, toCurrency);
  }
}

const STORAGE_KEYS = {
  ASSETS: "kira_assets",
  LIABILITIES: "kira_liabilities",
  SETTINGS: "kira_settings",
  HISTORY: "kira_history",
  GOALS: "kira_goals",
  INSIGHTS: "kira_insights",
  TAGS: "kira_tags",
};

const defaultSettings: Settings = {
  baseCurrency: "USD",
  privacyMode: false,
  userName: "",
  partnerName: "",
  showInsights: true,
  defaultOwnership: "personal",
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function safeJsonParse<T>(json: string | null, defaultValue: T): T {
  if (!json) return defaultValue;
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
}

export const storage = {
  getAssets(): Asset[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.ASSETS), []);
  },

  setAssets(assets: Asset[]): void {
    localStorage.setItem(STORAGE_KEYS.ASSETS, JSON.stringify(assets));
  },

  addAsset(data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }): Asset {
    const assets = this.getAssets();
    const now = new Date().toISOString();
    const newAsset: Asset = {
      id: generateId(),
      name: data.name,
      value: data.value,
      category: data.category as Asset["category"],
      currency: data.currency,
      notes: data.notes,
      tags: data.tags || [],
      ownership: data.ownership || this.getSettings().defaultOwnership || "personal",
      isRecurring: data.isRecurring,
      recurringDay: data.recurringDay,
      createdAt: now,
      updatedAt: now,
    };
    assets.push(newAsset);
    this.setAssets(assets);
    this.updateHistory();
    this.checkInsights();
    return newAsset;
  },

  updateAsset(id: string, data: { name?: string; value?: number; category?: string; currency?: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }): Asset | null {
    const assets = this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    const previousValue = assets[index].value;
    assets[index] = {
      ...assets[index],
      ...data,
      category: (data.category as Asset["category"]) || assets[index].category,
      previousValue,
      updatedAt: new Date().toISOString(),
    };
    this.setAssets(assets);
    this.updateHistory();
    this.checkInsights();
    return assets[index];
  },

  deleteAsset(id: string): boolean {
    const assets = this.getAssets();
    const filtered = assets.filter((a) => a.id !== id);
    if (filtered.length === assets.length) return false;
    this.setAssets(filtered);
    this.updateHistory();
    return true;
  },

  getLiabilities(): Liability[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.LIABILITIES), []);
  },

  setLiabilities(liabilities: Liability[]): void {
    localStorage.setItem(STORAGE_KEYS.LIABILITIES, JSON.stringify(liabilities));
  },

  addLiability(data: { name: string; value: number; category: string; currency: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }): Liability {
    const liabilities = this.getLiabilities();
    const now = new Date().toISOString();
    const newLiability: Liability = {
      id: generateId(),
      name: data.name,
      value: data.value,
      category: data.category as Liability["category"],
      currency: data.currency,
      notes: data.notes,
      tags: data.tags || [],
      ownership: data.ownership || this.getSettings().defaultOwnership || "personal",
      isRecurring: data.isRecurring,
      recurringDay: data.recurringDay,
      createdAt: now,
      updatedAt: now,
    };
    liabilities.push(newLiability);
    this.setLiabilities(liabilities);
    this.updateHistory();
    this.checkInsights();
    return newLiability;
  },

  updateLiability(id: string, data: { name?: string; value?: number; category?: string; currency?: Currency; notes?: string; tags?: string[]; ownership?: OwnershipType; isRecurring?: boolean; recurringDay?: number }): Liability | null {
    const liabilities = this.getLiabilities();
    const index = liabilities.findIndex((l) => l.id === id);
    if (index === -1) return null;
    const previousValue = liabilities[index].value;
    liabilities[index] = {
      ...liabilities[index],
      ...data,
      category: (data.category as Liability["category"]) || liabilities[index].category,
      previousValue,
      updatedAt: new Date().toISOString(),
    };
    this.setLiabilities(liabilities);
    this.updateHistory();
    this.checkInsights();
    return liabilities[index];
  },

  deleteLiability(id: string): boolean {
    const liabilities = this.getLiabilities();
    const filtered = liabilities.filter((l) => l.id !== id);
    if (filtered.length === liabilities.length) return false;
    this.setLiabilities(filtered);
    this.updateHistory();
    return true;
  },

  getSettings(): Settings {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.SETTINGS), defaultSettings);
  },

  setSettings(settings: Settings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  updateSettings(data: Partial<Settings>): Settings {
    const settings = this.getSettings();
    const updated = { ...settings, ...data };
    this.setSettings(updated);
    return updated;
  },

  getHistory(): HistorySnapshot[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.HISTORY), []);
  },

  setHistory(history: HistorySnapshot[]): void {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },

  updateHistory(): void {
    const assets = this.getAssets();
    const liabilities = this.getLiabilities();
    const settings = this.getSettings();
    const history = this.getHistory();

    const totalAssets = assets.reduce(
      (sum, asset) => sum + convertToBaseCurrency(asset.value, asset.currency, settings.baseCurrency),
      0
    );
    const totalLiabilities = liabilities.reduce(
      (sum, liability) => sum + convertToBaseCurrency(liability.value, liability.currency, settings.baseCurrency),
      0
    );
    const netWorth = totalAssets - totalLiabilities;

    const today = new Date().toISOString().split("T")[0];
    const existingIndex = history.findIndex((h) => h.date === today);

    const snapshot: HistorySnapshot = {
      id: today,
      date: today,
      totalAssets,
      totalLiabilities,
      netWorth,
    };

    if (existingIndex >= 0) {
      history[existingIndex] = snapshot;
    } else {
      history.push(snapshot);
    }

    history.sort((a, b) => a.date.localeCompare(b.date));
    this.setHistory(history);
  },

  // Goals CRUD
  getGoals(): Goal[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.GOALS), []);
  },

  setGoals(goals: Goal[]): void {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  },

  addGoal(data: { name: string; targetAmount: number; currentAmount: number; currency: Currency; deadline?: string; linkedAccountIds?: string[]; icon?: string; color?: string }): Goal {
    const goals = this.getGoals();
    const now = new Date().toISOString();
    const newGoal: Goal = {
      id: generateId(),
      name: data.name,
      targetAmount: data.targetAmount,
      currentAmount: data.currentAmount,
      currency: data.currency,
      deadline: data.deadline,
      linkedAccountIds: data.linkedAccountIds || [],
      icon: data.icon || "piggy-bank",
      color: data.color || "#10B981",
      createdAt: now,
      updatedAt: now,
    };
    goals.push(newGoal);
    this.setGoals(goals);
    return newGoal;
  },

  updateGoal(id: string, data: Partial<Omit<Goal, "id" | "createdAt" | "updatedAt">>): Goal | null {
    const goals = this.getGoals();
    const index = goals.findIndex((g) => g.id === id);
    if (index === -1) return null;
    goals[index] = {
      ...goals[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setGoals(goals);
    return goals[index];
  },

  deleteGoal(id: string): boolean {
    const goals = this.getGoals();
    const filtered = goals.filter((g) => g.id !== id);
    if (filtered.length === goals.length) return false;
    this.setGoals(filtered);
    return true;
  },

  // Insights CRUD
  getInsights(): Insight[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.INSIGHTS), []);
  },

  setInsights(insights: Insight[]): void {
    localStorage.setItem(STORAGE_KEYS.INSIGHTS, JSON.stringify(insights));
  },

  addInsight(data: { type: Insight["type"]; title: string; message: string; data?: Record<string, any> }): Insight {
    const insights = this.getInsights();
    const newInsight: Insight = {
      id: generateId(),
      type: data.type,
      title: data.title,
      message: data.message,
      isRead: false,
      data: data.data,
      createdAt: new Date().toISOString(),
    };
    insights.unshift(newInsight);
    // Keep only last 50 insights
    if (insights.length > 50) insights.pop();
    this.setInsights(insights);
    return newInsight;
  },

  markInsightRead(id: string): void {
    const insights = this.getInsights();
    const insight = insights.find((i) => i.id === id);
    if (insight) {
      insight.isRead = true;
      this.setInsights(insights);
    }
  },

  markAllInsightsRead(): void {
    const insights = this.getInsights();
    insights.forEach((i) => (i.isRead = true));
    this.setInsights(insights);
  },

  clearInsights(): void {
    this.setInsights([]);
  },

  // Tags management
  getTags(): string[] {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.TAGS), []);
  },

  setTags(tags: string[]): void {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  },

  addTag(tag: string): void {
    const tags = this.getTags();
    if (!tags.includes(tag)) {
      tags.push(tag);
      this.setTags(tags);
    }
  },

  removeTag(tag: string): void {
    const tags = this.getTags().filter((t) => t !== tag);
    this.setTags(tags);
  },

  // Check and generate insights based on financial changes
  checkInsights(): void {
    const settings = this.getSettings();
    if (!settings.showInsights) return;

    const history = this.getHistory();
    const assets = this.getAssets();
    const liabilities = this.getLiabilities();

    if (history.length < 2) return;

    const latest = history[history.length - 1];
    const previous = history[history.length - 2];
    const netWorthChange = latest.netWorth - previous.netWorth;
    const percentChange = previous.netWorth !== 0 ? (netWorthChange / Math.abs(previous.netWorth)) * 100 : 0;

    // Check for significant net worth changes (>5%)
    if (Math.abs(percentChange) >= 5) {
      const direction = netWorthChange > 0 ? "increased" : "decreased";
      this.addInsight({
        type: netWorthChange > 0 ? "milestone" : "warning",
        title: `Net Worth ${netWorthChange > 0 ? "Up" : "Down"} ${Math.abs(percentChange).toFixed(1)}%`,
        message: `Your net worth has ${direction} by ${settings.baseCurrency} ${Math.abs(netWorthChange).toLocaleString()}`,
        data: { change: netWorthChange, percent: percentChange },
      });
    }

    // Check milestones (every $10k, $25k, $50k, $100k, etc.)
    const milestones = [10000, 25000, 50000, 100000, 250000, 500000, 1000000];
    for (const milestone of milestones) {
      if (previous.netWorth < milestone && latest.netWorth >= milestone) {
        this.addInsight({
          type: "milestone",
          title: `Milestone Reached!`,
          message: `Congratulations! You've reached ${settings.baseCurrency} ${milestone.toLocaleString()} net worth!`,
          data: { milestone },
        });
        break;
      }
    }

    // Check debt reduction
    if (latest.totalLiabilities < previous.totalLiabilities) {
      const reduction = previous.totalLiabilities - latest.totalLiabilities;
      if (reduction >= 100) {
        this.addInsight({
          type: "tip",
          title: "Debt Reduced",
          message: `Great job! You've reduced your debt by ${settings.baseCurrency} ${reduction.toLocaleString()}`,
          data: { reduction },
        });
      }
    }
  },

  // Get weekly/monthly recap data
  getRecap(): { netWorthChange: number; percentChange: number; topCategories: { name: string; value: number }[]; totalAssets: number; totalLiabilities: number; upcomingBills: (Asset | Liability)[]; daysUntilNextBill: number | null } {
    const history = this.getHistory();
    const assets = this.getAssets();
    const liabilities = this.getLiabilities();
    const settings = this.getSettings();

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const currentSnapshot = history[history.length - 1];
    const weekAgoSnapshot = history.find((h) => h.date <= weekAgoStr) || history[0];

    const netWorthChange = currentSnapshot ? (currentSnapshot.netWorth - (weekAgoSnapshot?.netWorth || 0)) : 0;
    const percentChange = weekAgoSnapshot?.netWorth ? (netWorthChange / Math.abs(weekAgoSnapshot.netWorth)) * 100 : 0;

    // Group assets by category
    const categoryTotals: Record<string, number> = {};
    assets.forEach((a) => {
      const value = convertToBaseCurrency(a.value, a.currency, settings.baseCurrency);
      categoryTotals[a.category] = (categoryTotals[a.category] || 0) + value;
    });

    const topCategories = Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const totalAssets = currentSnapshot?.totalAssets || 0;
    const totalLiabilities = currentSnapshot?.totalLiabilities || 0;

    // Get upcoming recurring bills
    const currentDay = now.getDate();
    const allItems = [...assets, ...liabilities].filter((item) => item.isRecurring && item.recurringDay);
    const upcomingBills = allItems
      .filter((item) => item.recurringDay && item.recurringDay >= currentDay)
      .sort((a, b) => (a.recurringDay || 0) - (b.recurringDay || 0))
      .slice(0, 5);

    const nextBill = upcomingBills[0];
    const daysUntilNextBill = nextBill?.recurringDay ? nextBill.recurringDay - currentDay : null;

    return {
      netWorthChange,
      percentChange,
      topCategories,
      totalAssets,
      totalLiabilities,
      upcomingBills,
      daysUntilNextBill,
    };
  },

  // Get cash flow data (changes over time)
  getCashFlow(months: number = 6): { month: string; assets: number; liabilities: number; netWorth: number }[] {
    const history = this.getHistory();
    const settings = this.getSettings();

    const now = new Date();
    const result: { month: string; assets: number; liabilities: number; netWorth: number }[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = targetDate.toISOString().slice(0, 7);
      const monthName = targetDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      // Find the last snapshot for this month
      const monthSnapshots = history.filter((h) => h.date.startsWith(monthStr));
      const snapshot = monthSnapshots[monthSnapshots.length - 1];

      if (snapshot) {
        result.push({
          month: monthName,
          assets: snapshot.totalAssets,
          liabilities: snapshot.totalLiabilities,
          netWorth: snapshot.netWorth,
        });
      }
    }

    return result;
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.LIABILITIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
    localStorage.removeItem(STORAGE_KEYS.GOALS);
    localStorage.removeItem(STORAGE_KEYS.INSIGHTS);
    localStorage.removeItem(STORAGE_KEYS.TAGS);
  },

  exportData(): string {
    const data = {
      assets: this.getAssets(),
      liabilities: this.getLiabilities(),
      settings: this.getSettings(),
      history: this.getHistory(),
      goals: this.getGoals(),
      insights: this.getInsights(),
      tags: this.getTags(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.assets) this.setAssets(data.assets);
      if (data.liabilities) this.setLiabilities(data.liabilities);
      if (data.settings) this.setSettings(data.settings);
      if (data.history) this.setHistory(data.history);
      if (data.goals) this.setGoals(data.goals);
      if (data.insights) this.setInsights(data.insights);
      if (data.tags) this.setTags(data.tags);
      return true;
    } catch {
      return false;
    }
  },

  importCSV(csvString: string): { assets: number; liabilities: number } | null {
    try {
      let lines = csvString.trim().split('\n');
      if (lines.length < 2) return null;

      // Handle case where entire row is wrapped in quotes (common Excel/Sheets export issue)
      lines = lines.map(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('"') && trimmed.endsWith('"') && !trimmed.slice(1, -1).includes('","')) {
          // Entire row is one quoted string - unwrap it
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });

      const headers = lines[0].toLowerCase().split(',').map(h => h.trim().replace(/"/g, ''));
      
      const nameIdx = headers.findIndex(h => h === 'name' || h === 'account' || h === 'description');
      const valueIdx = headers.findIndex(h => h === 'value' || h === 'amount' || h === 'balance');
      const typeIdx = headers.findIndex(h => h === 'type' || h === 'account type');
      const categoryIdx = headers.findIndex(h => h === 'category');
      const currencyIdx = headers.findIndex(h => h === 'currency');
      const notesIdx = headers.findIndex(h => h === 'notes' || h === 'note' || h === 'memo');

      if (nameIdx === -1 || valueIdx === -1) return null;

      const validAssetCategories = ['cash', 'stocks', 'crypto', 'property', 'vehicles', 'retirement', 'other'];
      const validLiabilityCategories = ['credit_card', 'mortgage', 'personal_loan', 'student_loan', 'car_loan', 'other'];
      const validCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'SGD', 'MYR', 'AUD', 'CAD', 'CHF', 'INR'];

      let assetsAdded = 0;
      let liabilitiesAdded = 0;

      for (let i = 1; i < lines.length; i++) {
        const values = this.parseCSVLine(lines[i]);
        if (values.length <= Math.max(nameIdx, valueIdx)) continue;

        const name = values[nameIdx]?.trim();
        const valueStr = values[valueIdx]?.replace(/[$,"\s]/g, '');
        const value = parseFloat(valueStr);

        if (!name || isNaN(value)) continue;

        const typeRaw = typeIdx >= 0 ? values[typeIdx]?.toLowerCase().trim() : '';
        const categoryRaw = categoryIdx >= 0 ? values[categoryIdx]?.toLowerCase().trim().replace(/\s+/g, '_') : 'other';
        const currencyRaw = currencyIdx >= 0 ? values[currencyIdx]?.toUpperCase().trim() : 'USD';
        const notes = notesIdx >= 0 ? values[notesIdx]?.trim() : undefined;

        const currency = validCurrencies.includes(currencyRaw) ? currencyRaw as Currency : 'USD';

        // Check Type column first - it takes priority
        const isAssetType = typeRaw.includes('asset');
        const isLiabilityType = typeRaw.includes('liability') || typeRaw.includes('debt');
        
        // Only fall back to other heuristics if Type column is unclear
        const isLiability = isLiabilityType || 
                           (!isAssetType && (
                             typeRaw.includes('loan') || 
                             typeRaw.includes('credit') || 
                             value < 0 ||
                             (categoryRaw !== 'other' && validLiabilityCategories.includes(categoryRaw))
                           ));

        if (isLiability) {
          const category = validLiabilityCategories.includes(categoryRaw) ? categoryRaw : 'other';
          this.addLiability({ name, value: Math.abs(value), category, currency, notes });
          liabilitiesAdded++;
        } else {
          const category = validAssetCategories.includes(categoryRaw) ? categoryRaw : 'other';
          this.addAsset({ name, value: Math.abs(value), category, currency, notes });
          assetsAdded++;
        }
      }

      return { assets: assetsAdded, liabilities: liabilitiesAdded };
    } catch {
      return null;
    }
  },

  parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  },

  exportCSV(): string {
    const assets = this.getAssets();
    const liabilities = this.getLiabilities();
    
    let csv = 'Type,Name,Value,Category,Currency,Notes\n';
    
    assets.forEach(asset => {
      csv += `Asset,"${asset.name}",${asset.value},${asset.category},${asset.currency},"${asset.notes || ''}"\n`;
    });
    
    liabilities.forEach(liability => {
      csv += `Liability,"${liability.name}",${liability.value},${liability.category},${liability.currency},"${liability.notes || ''}"\n`;
    });
    
    return csv;
  },

  getCSVTemplate(): string {
    return `Type,Name,Value,Category,Currency,Notes
Asset,Checking Account,5000,cash,USD,Main bank account
Asset,Investment Portfolio,25000,stocks,USD,Vanguard S&P 500
Asset,Bitcoin Holdings,10000,crypto,USD,Cold wallet
Asset,Primary Residence,350000,property,USD,Home value
Asset,Car,15000,vehicles,USD,Toyota Camry 2022
Asset,401k,50000,retirement,USD,Employer match
Liability,Credit Card,2500,credit_card,USD,Chase Sapphire
Liability,Mortgage,280000,mortgage,USD,30-year fixed
Liability,Student Loan,35000,student_loan,USD,Federal loans
Liability,Car Loan,12000,car_loan,USD,Auto financing

---INSTRUCTIONS---
Fill in your data above following this format:

TYPE: Must be "Asset" or "Liability"

ASSET CATEGORIES: cash, stocks, crypto, property, vehicles, retirement, other

LIABILITY CATEGORIES: credit_card, mortgage, personal_loan, student_loan, car_loan, other

CURRENCIES: USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, CAD, CHF, INR

TIPS:
- Delete the example rows and add your own
- Delete these instructions before importing
- Value should be a positive number (no $ or commas)
- Notes are optional
`;
  },
};
