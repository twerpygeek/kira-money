import { type Currency, currencies } from "@shared/schema";

const FRANKFURTER_API = "https://api.frankfurter.dev/v1";
const CACHE_KEY = "kira_exchange_rates";
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in milliseconds

interface ExchangeRateCache {
  rates: Record<string, number>;
  baseCurrency: string;
  lastUpdated: string;
  fetchedAt: number;
}

export async function fetchExchangeRates(baseCurrency: Currency = "USD"): Promise<Record<string, number>> {
  try {
    // Check cache first
    const cached = getCachedRates(baseCurrency);
    if (cached) {
      return cached;
    }

    // Fetch fresh rates from Frankfurter API
    const response = await fetch(
      `${FRANKFURTER_API}/latest?base=${baseCurrency}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates: ${response.status}`);
    }

    const data = await response.json();
    
    // Include the base currency with rate 1
    const rates: Record<string, number> = {
      [baseCurrency]: 1,
      ...data.rates,
    };

    // Cache the rates
    const cache: ExchangeRateCache = {
      rates,
      baseCurrency,
      lastUpdated: data.date,
      fetchedAt: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

    return rates;
  } catch (error) {
    console.error("Error fetching exchange rates:", error);
    // Return fallback rates if API fails
    return getFallbackRates();
  }
}

function getCachedRates(baseCurrency: Currency): Record<string, number> | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: ExchangeRateCache = JSON.parse(cached);
    
    // Check if cache is still valid (less than 6 hours old) and same base currency
    const isValid = 
      data.baseCurrency === baseCurrency &&
      Date.now() - data.fetchedAt < CACHE_DURATION;

    if (isValid) {
      return data.rates;
    }

    return null;
  } catch {
    return null;
  }
}

export function getCachedRateInfo(): { lastUpdated: string; baseCurrency: string } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: ExchangeRateCache = JSON.parse(cached);
    return {
      lastUpdated: data.lastUpdated,
      baseCurrency: data.baseCurrency,
    };
  } catch {
    return null;
  }
}

// Fallback static rates (approximate) in case API is unavailable
function getFallbackRates(): Record<string, number> {
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50,
    CNY: 7.24,
    SGD: 1.34,
    MYR: 4.47,
    AUD: 1.53,
    CAD: 1.36,
    CHF: 0.88,
    INR: 83.12,
  };
}

export function convertCurrency(
  amount: number,
  fromCurrency: Currency,
  toCurrency: Currency,
  rates: Record<string, number>,
  ratesBaseCurrency: Currency = "USD"
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Rates are relative to ratesBaseCurrency (e.g., USD=1 means 1 USD = X other currency)
  // To convert from A to B: first convert A to the rates base, then to B
  const fromRate = rates[fromCurrency] || 1;
  const toRate = rates[toCurrency] || 1;
  
  // Convert: amount in fromCurrency -> base currency -> toCurrency
  // If rates are USD-based: amountInUSD = amount / fromRate, then amountInTo = amountInUSD * toRate
  return (amount / fromRate) * toRate;
}

// Initialize rates on app load
let cachedRates: Record<string, number> | null = null;
let cachedBaseCurrency: Currency = "USD";

export async function initializeRates(baseCurrency: Currency): Promise<void> {
  cachedBaseCurrency = baseCurrency;
  cachedRates = await fetchExchangeRates(baseCurrency);
}

export function getRates(): Record<string, number> {
  return cachedRates || getFallbackRates();
}

export function refreshCachedRates(): void {
  // Re-read from localStorage to sync in-memory cache
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const data: ExchangeRateCache = JSON.parse(cached);
      cachedRates = data.rates;
      cachedBaseCurrency = data.baseCurrency as Currency;
    }
  } catch {
    // Keep existing rates
  }
}

export function convertToBase(amount: number, fromCurrency: Currency, baseCurrency: Currency): number {
  if (fromCurrency === baseCurrency) return amount;
  
  const rates = getRates();
  
  // Determine the base currency of our rates
  // If using cached rates, they're relative to cachedBaseCurrency
  // If using fallback, they're USD-based
  const ratesBase: Currency = cachedRates ? cachedBaseCurrency : "USD";
  
  // If the rates base matches the target base currency, simple conversion
  if (ratesBase === baseCurrency) {
    // rates[X] = how many X per 1 baseCurrency
    // So to convert from X to baseCurrency: amount / rates[X]
    return amount / (rates[fromCurrency] || 1);
  }
  
  // Rates base differs from target base - need to rebase
  // First convert to ratesBase, then to target baseCurrency
  // rates[X] = how many X per 1 ratesBase
  const amountInRatesBase = amount / (rates[fromCurrency] || 1);
  
  // Now convert from ratesBase to target baseCurrency
  // rates[baseCurrency] = how many baseCurrency per 1 ratesBase
  // So to get baseCurrency: amountInRatesBase * rates[baseCurrency]
  const targetRate = rates[baseCurrency] || 1;
  return amountInRatesBase * targetRate;
}
