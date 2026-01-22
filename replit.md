# Wealth Tracker - Net Worth Tracker

## Overview
A privacy-first, manual-entry net worth tracker inspired by "Worth It" app. Track your assets and liabilities to see your complete financial picture with beautiful visualizations and multi-currency support.

## Features
- **Net Worth Dashboard**: Large, prominent display of total net worth with percentage change
- **Assets & Liabilities Management**: Add, edit, delete financial accounts with categories
- **Multi-Currency Support**: Track assets in different currencies with automatic conversion to base currency
- **Net Worth History**: Visual chart showing wealth progression over time
- **Asset Allocation**: Pie chart breakdown by category
- **Privacy Mode**: Blur sensitive financial data when in public
- **Dark/Light Theme**: Beautiful dark mode design with light mode option
- **Mobile-First Design**: Optimized for mobile viewing

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI components
- **Charts**: Recharts
- **State Management**: TanStack React Query
- **Routing**: Wouter
- **Backend**: Express.js
- **Data Storage**: In-memory storage (MemStorage)

## Project Structure
```
client/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── theme-provider.tsx
│   │   ├── theme-toggle.tsx
│   │   ├── privacy-toggle.tsx
│   │   ├── net-worth-display.tsx
│   │   ├── net-worth-chart.tsx
│   │   ├── summary-cards.tsx
│   │   ├── account-item.tsx
│   │   ├── add-transaction-dialog.tsx
│   │   ├── allocation-chart.tsx
│   │   └── settings-dialog.tsx
│   ├── pages/
│   │   ├── dashboard.tsx    # Main dashboard page
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css            # Tailwind + theme variables
server/
├── routes.ts                # API endpoints
├── storage.ts               # In-memory data storage
└── index.ts                 # Express server setup
shared/
└── schema.ts                # Data models, types, utilities
```

## API Endpoints
- `GET /api/settings` - Get user settings
- `PATCH /api/settings` - Update settings
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset
- `PATCH /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/liabilities` - Get all liabilities
- `POST /api/liabilities` - Create liability
- `PATCH /api/liabilities/:id` - Update liability
- `DELETE /api/liabilities/:id` - Delete liability
- `GET /api/history` - Get net worth history

## Data Models
### Asset
- id, name, value, category (cash, stocks, crypto, property, vehicles, retirement, other), currency, createdAt, updatedAt

### Liability
- id, name, value, category (credit_card, mortgage, personal_loan, student_loan, car_loan, other), currency, createdAt, updatedAt

### Settings
- baseCurrency, userName, privacyMode

## Supported Currencies
USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, CAD, CHF, INR

## Design
- Dark theme primary with light mode option
- Primary color: Green (hsl 160 84% 39%) for wealth/assets
- Destructive color: Red for liabilities
- Apple-style minimalism with clean typography
- Large numbers, rounded cards, subtle shadows
