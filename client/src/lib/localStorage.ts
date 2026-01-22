import type { Asset, Liability, Settings, HistorySnapshot, Currency } from "@shared/schema";
import { convertToBaseCurrency } from "@shared/schema";

const STORAGE_KEYS = {
  ASSETS: "kira_assets",
  LIABILITIES: "kira_liabilities",
  SETTINGS: "kira_settings",
  HISTORY: "kira_history",
};

const defaultSettings: Settings = {
  baseCurrency: "USD",
  privacyMode: false,
  userName: "",
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

  addAsset(data: { name: string; value: number; category: string; currency: Currency; notes?: string }): Asset {
    const assets = this.getAssets();
    const now = new Date().toISOString();
    const newAsset: Asset = {
      id: generateId(),
      name: data.name,
      value: data.value,
      category: data.category as Asset["category"],
      currency: data.currency,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    assets.push(newAsset);
    this.setAssets(assets);
    this.updateHistory();
    return newAsset;
  },

  updateAsset(id: string, data: { name?: string; value?: number; category?: string; currency?: Currency; notes?: string }): Asset | null {
    const assets = this.getAssets();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return null;
    assets[index] = {
      ...assets[index],
      ...data,
      category: (data.category as Asset["category"]) || assets[index].category,
      updatedAt: new Date().toISOString(),
    };
    this.setAssets(assets);
    this.updateHistory();
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

  addLiability(data: { name: string; value: number; category: string; currency: Currency; notes?: string }): Liability {
    const liabilities = this.getLiabilities();
    const now = new Date().toISOString();
    const newLiability: Liability = {
      id: generateId(),
      name: data.name,
      value: data.value,
      category: data.category as Liability["category"],
      currency: data.currency,
      notes: data.notes,
      createdAt: now,
      updatedAt: now,
    };
    liabilities.push(newLiability);
    this.setLiabilities(liabilities);
    this.updateHistory();
    return newLiability;
  },

  updateLiability(id: string, data: { name?: string; value?: number; category?: string; currency?: Currency; notes?: string }): Liability | null {
    const liabilities = this.getLiabilities();
    const index = liabilities.findIndex((l) => l.id === id);
    if (index === -1) return null;
    liabilities[index] = {
      ...liabilities[index],
      ...data,
      category: (data.category as Liability["category"]) || liabilities[index].category,
      updatedAt: new Date().toISOString(),
    };
    this.setLiabilities(liabilities);
    this.updateHistory();
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

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.ASSETS);
    localStorage.removeItem(STORAGE_KEYS.LIABILITIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  },

  exportData(): string {
    const data = {
      assets: this.getAssets(),
      liabilities: this.getLiabilities(),
      settings: this.getSettings(),
      history: this.getHistory(),
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
      return true;
    } catch {
      return false;
    }
  },

  importCSV(csvString: string): { assets: number; liabilities: number } | null {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) return null;

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

        const isLiability = typeRaw.includes('liability') || typeRaw.includes('debt') || 
                           typeRaw.includes('loan') || typeRaw.includes('credit') || 
                           value < 0 || validLiabilityCategories.includes(categoryRaw);

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
};
