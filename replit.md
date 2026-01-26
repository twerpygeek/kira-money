# KIRA - Net Worth Tracker

## Overview
KIRA is a privacy-first, manual-entry net worth tracker inspired by "Worth It" app. Track your assets and liabilities to see your complete financial picture with beautiful visualizations and multi-currency support.

## Branding
- **App Name**: KIRA / Kira Money
- **Logo**: Kira_logo_1769090328833.png (K arrow logo)
- **Deep Slate (BG)**: #0F172A
- **Lighter Slate (Card)**: #1E2938
- **Wealth Green (Primary)**: #10B981
- **Debt Rose (Negative)**: #F43F5E
- **Crisp White (Text)**: #F8FAFC

## Features
- **Net Worth Dashboard**: Large, prominent display of total net worth with percentage change
- **Assets & Liabilities Management**: Add, edit, delete financial accounts with categories
- **Multi-Currency Support**: Track assets in different currencies with automatic conversion to base currency
- **Net Worth History**: Visual chart showing wealth progression over time
- **Asset Allocation**: Pie chart breakdown by category
- **Privacy Mode**: Blur sensitive financial data when in public
- **Dark/Light Theme**: Beautiful dark mode design with light mode option
- **Mobile-First Design**: Optimized for mobile viewing
- **Savings Goals**: Create and track financial goals with progress visualization
- **Weekly Recap**: Summary of net worth changes, top categories, and upcoming bills
- **Smart Insights**: Automated alerts for milestones, significant changes, and tips
- **Cash Flow Chart**: 6-month visualization of assets, liabilities, and net worth trends
- **Bill Calendar**: Track recurring bills with due date tracking
- **Ownership Tracking**: Tag accounts as "Mine", "Partner's", or "Shared" for couples
- **Recurring Bills**: Mark accounts as recurring with specific payment dates

## Tech Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Shadcn UI components
- **Charts**: Recharts
- **State Management**: React useState/useEffect (local state)
- **Routing**: Wouter
- **Backend**: Express.js (for serving static files only)
- **Data Storage**: Browser localStorage (privacy-first, data stays on device)

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
│   │   ├── settings-dialog.tsx
│   │   ├── goals-card.tsx        # Savings goals with progress tracking
│   │   ├── weekly-recap.tsx      # Weekly summary card
│   │   ├── insights-panel.tsx    # Smart insights and alerts
│   │   ├── cash-flow-chart.tsx   # 6-month trend visualization
│   │   └── bill-calendar.tsx     # Recurring bills tracker
│   ├── lib/
│   │   └── localStorage.ts  # Local storage CRUD utilities
│   ├── pages/
│   │   ├── intro.tsx        # Landing page (/)
│   │   ├── dashboard.tsx    # Main dashboard (/dashboard)
│   │   ├── faq.tsx          # FAQ & help page (/faq)
│   │   └── not-found.tsx
│   ├── App.tsx
│   └── index.css            # Tailwind + theme variables
├── public/
│   └── manifest.json        # PWA manifest
server/
├── routes.ts                # Static file serving
├── storage.ts               # (Legacy - not used)
└── index.ts                 # Express server setup
shared/
└── schema.ts                # Data models, types, utilities
```

## Routes
- `/` - Intro/landing page explaining privacy-first approach
- `/dashboard` - Main net worth tracker
- `/faq` - FAQ, privacy info, and PWA install instructions

## Data Storage (localStorage)
All data is stored locally in the user's browser for maximum privacy:
- `kira_assets` - Array of asset objects
- `kira_liabilities` - Array of liability objects
- `kira_settings` - User settings (baseCurrency, privacyMode, userName)
- `kira_history` - Net worth history snapshots
- `kira_goals` - Array of savings goal objects
- `kira_insights` - Array of smart insight notifications

### Data Management Features
- **Backup Data**: Download all data as JSON file
- **Restore Data**: Upload JSON backup to restore
- **Clear All Data**: Delete all local data (with confirmation)

## Data Models
### Asset
- id, name, value, category (cash, stocks, crypto, property, vehicles, retirement, other), currency, createdAt, updatedAt, notes, ownership (personal/partner/shared), isRecurring, recurringDay, previousValue

### Liability
- id, name, value, category (credit_card, mortgage, personal_loan, student_loan, car_loan, other), currency, createdAt, updatedAt, notes, ownership (personal/partner/shared), isRecurring, recurringDay, previousValue

### Goal
- id, name, targetAmount, currentAmount, currency, icon, color, deadline, linkedAccountIds, createdAt, updatedAt

### Insight
- id, type (milestone/change/tip), title, message, createdAt, read

### Settings
- baseCurrency, userName, privacyMode

## Supported Currencies
USD, EUR, GBP, JPY, CNY, SGD, MYR, AUD, CAD, CHF, INR

## Design
- **Premium Fintech Aesthetic**: Apple Wallet/Robinhood-inspired UI
- **Dark theme primary**: Rich navy background (#0F172A), slate cards (#1E293B)
- **Primary color**: Emerald-to-teal gradient (hsl 160 84% 39%) for wealth/assets
- **Destructive color**: Soft rose (#F43F5E) for liabilities - less harsh than pure red
- **Typography**: Inter font with tracking-tight headers, tabular-nums for all financial values
- **Cards**: rounded-2xl with subtle border-border/50
- **Gradient Button**: gradient-primary class for emerald-to-teal gradient CTA buttons

## Key Features
- **Massive Net Worth Display**: text-6xl hero display with sparkline trend behind
- **Monthly Change**: Shows percentage change from last month below net worth
- **Milestone Progress**: Gamified progress tracking to next financial goal ($10K, $25K, $50K, etc.)
- **Asset Grouping**: Liquid Assets (cash, stocks, crypto) vs Illiquid Assets (property, retirement)
- **Debt-to-Asset Ratio**: Progress bar showing financial health
- **Full-Screen Add Modal**: Calculator-style input on mobile, constrained on desktop
- **Privacy Mode**: Blur sensitive financial data with privacy-blur CSS class
- **Notes on Accounts**: Optional notes field for each asset and liability
- **CSV Export**: Export all data to spreadsheet from settings

## Recent Changes (Jan 2026)
- Premium UI overhaul with rich navy/slate color palette
- Added milestone tracking with gamification
- Implemented asset grouping (liquid/illiquid)
- Full-screen mobile modal with calculator-style input
- Enhanced visual hierarchy with tabular-nums and tracking-tight
- Added Savings Goals with progress bars, icons, colors, and deadlines
- Implemented Weekly Recap showing net worth change and top categories
- Created Smart Insights panel with automated alerts and tips
- Built Cash Flow Chart with 6-month trend visualization
- Added Bill Calendar for recurring payments tracking
- Implemented Ownership filtering (Mine/Partner/Shared)
- Added recurring bill support with payment day tracking
- Fixed CSV import to properly handle Type column priority
- Integrated live currency exchange rates from Frankfurter API (European Central Bank data)
- Added Vercel and Netlify deployment configuration files
