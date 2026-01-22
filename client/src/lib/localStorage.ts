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
};
