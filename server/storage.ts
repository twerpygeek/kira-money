import {
  type Asset,
  type Liability,
  type HistorySnapshot,
  type Settings,
  type Currency,
  type InsertAsset,
  type InsertLiability,
  convertToBaseCurrency,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getAssets(): Promise<Asset[]>;
  getAsset(id: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset | undefined>;
  deleteAsset(id: string): Promise<boolean>;

  getLiabilities(): Promise<Liability[]>;
  getLiability(id: string): Promise<Liability | undefined>;
  createLiability(liability: InsertLiability): Promise<Liability>;
  updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability | undefined>;
  deleteLiability(id: string): Promise<boolean>;

  getHistory(): Promise<HistorySnapshot[]>;
  addHistorySnapshot(): Promise<HistorySnapshot>;

  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private assets: Map<string, Asset>;
  private liabilities: Map<string, Liability>;
  private history: HistorySnapshot[];
  private settings: Settings;

  constructor() {
    this.assets = new Map();
    this.liabilities = new Map();
    this.history = [];
    this.settings = {
      baseCurrency: "USD",
      privacyMode: false,
      userName: undefined,
    };

    this.initializeDemoData();
  }

  private initializeDemoData() {
    const now = new Date().toISOString();

    const demoAssets: InsertAsset[] = [
      { name: "Savings Account", value: 25000, category: "cash", currency: "USD" },
      { name: "Stock Portfolio", value: 85000, category: "stocks", currency: "USD" },
      { name: "Bitcoin Holdings", value: 15000, category: "crypto", currency: "USD" },
      { name: "Primary Residence", value: 350000, category: "property", currency: "USD" },
      { name: "401(k) Retirement", value: 120000, category: "retirement", currency: "USD" },
    ];

    const demoLiabilities: InsertLiability[] = [
      { name: "Credit Card", value: 3500, category: "credit_card", currency: "USD" },
      { name: "Home Mortgage", value: 280000, category: "mortgage", currency: "USD" },
      { name: "Car Loan", value: 18000, category: "car_loan", currency: "USD" },
    ];

    demoAssets.forEach((asset) => {
      const id = randomUUID();
      this.assets.set(id, {
        ...asset,
        id,
        createdAt: now,
        updatedAt: now,
      });
    });

    demoLiabilities.forEach((liability) => {
      const id = randomUUID();
      this.liabilities.set(id, {
        ...liability,
        id,
        createdAt: now,
        updatedAt: now,
      });
    });

    const baseNetWorth = this.calculateNetWorth();
    const months = ["2025-07", "2025-08", "2025-09", "2025-10", "2025-11", "2025-12", "2026-01"];
    const growthFactors = [0.85, 0.88, 0.92, 0.95, 0.97, 0.99, 1.0];

    months.forEach((month, index) => {
      const factor = growthFactors[index];
      const totalAssets = this.calculateTotalAssets() * factor;
      const totalLiabilities = this.calculateTotalLiabilities() * (1.02 - factor * 0.02);
      const netWorth = totalAssets - totalLiabilities;

      this.history.push({
        id: randomUUID(),
        date: `${month}-15`,
        totalAssets,
        totalLiabilities,
        netWorth,
      });
    });
  }

  private calculateTotalAssets(): number {
    const baseCurrency = this.settings.baseCurrency;
    return Array.from(this.assets.values()).reduce((sum, asset) => {
      return sum + convertToBaseCurrency(asset.value, asset.currency, baseCurrency);
    }, 0);
  }

  private calculateTotalLiabilities(): number {
    const baseCurrency = this.settings.baseCurrency;
    return Array.from(this.liabilities.values()).reduce((sum, liability) => {
      return sum + convertToBaseCurrency(liability.value, liability.currency, baseCurrency);
    }, 0);
  }

  private calculateNetWorth(): number {
    return this.calculateTotalAssets() - this.calculateTotalLiabilities();
  }

  async getAssets(): Promise<Asset[]> {
    return Array.from(this.assets.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getAsset(id: string): Promise<Asset | undefined> {
    return this.assets.get(id);
  }

  async createAsset(asset: InsertAsset): Promise<Asset> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...asset,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.assets.set(id, newAsset);
    await this.addHistorySnapshot();
    return newAsset;
  }

  async updateAsset(id: string, asset: Partial<InsertAsset>): Promise<Asset | undefined> {
    const existing = this.assets.get(id);
    if (!existing) return undefined;

    const updated: Asset = {
      ...existing,
      ...asset,
      updatedAt: new Date().toISOString(),
    };
    this.assets.set(id, updated);
    await this.addHistorySnapshot();
    return updated;
  }

  async deleteAsset(id: string): Promise<boolean> {
    const deleted = this.assets.delete(id);
    if (deleted) {
      await this.addHistorySnapshot();
    }
    return deleted;
  }

  async getLiabilities(): Promise<Liability[]> {
    return Array.from(this.liabilities.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getLiability(id: string): Promise<Liability | undefined> {
    return this.liabilities.get(id);
  }

  async createLiability(liability: InsertLiability): Promise<Liability> {
    const id = randomUUID();
    const now = new Date().toISOString();
    const newLiability: Liability = {
      ...liability,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.liabilities.set(id, newLiability);
    await this.addHistorySnapshot();
    return newLiability;
  }

  async updateLiability(id: string, liability: Partial<InsertLiability>): Promise<Liability | undefined> {
    const existing = this.liabilities.get(id);
    if (!existing) return undefined;

    const updated: Liability = {
      ...existing,
      ...liability,
      updatedAt: new Date().toISOString(),
    };
    this.liabilities.set(id, updated);
    await this.addHistorySnapshot();
    return updated;
  }

  async deleteLiability(id: string): Promise<boolean> {
    const deleted = this.liabilities.delete(id);
    if (deleted) {
      await this.addHistorySnapshot();
    }
    return deleted;
  }

  async getHistory(): Promise<HistorySnapshot[]> {
    return [...this.history].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  async addHistorySnapshot(): Promise<HistorySnapshot> {
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];

    const existingIndex = this.history.findIndex((h) => h.date === dateStr);

    const snapshot: HistorySnapshot = {
      id: existingIndex >= 0 ? this.history[existingIndex].id : randomUUID(),
      date: dateStr,
      totalAssets: this.calculateTotalAssets(),
      totalLiabilities: this.calculateTotalLiabilities(),
      netWorth: this.calculateNetWorth(),
    };

    if (existingIndex >= 0) {
      this.history[existingIndex] = snapshot;
    } else {
      this.history.push(snapshot);
    }

    return snapshot;
  }

  async getSettings(): Promise<Settings> {
    return { ...this.settings };
  }

  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    this.settings = { ...this.settings, ...settings };
    return { ...this.settings };
  }
}

export const storage = new MemStorage();
