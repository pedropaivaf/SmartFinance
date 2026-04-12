# Syros — Claude Code Context

## Project Overview

Syros (formerly SmartFinance) is a mobile-first personal finance React PWA designed for the iOS iPhone 16 / Safari "Add to Home Screen" experience. It uses Supabase for auth and data persistence, with localStorage as fallback.

**Freemium model**: Free plan with core features. Premium at R$12.90/mês unlocks envelopes, insights, credit cards, and more.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18.3.1 |
| Build | Vite 7 |
| Styling | Tailwind CSS (CDN — no PostCSS/npm package) |
| Charts | Chart.js (CDN) |
| Font | Inter (Google Fonts) |
| State | React useState/useEffect (no Redux, no Context) |
| Auth & DB | Supabase (auth + persistence) |
| Persistence | Supabase + localStorage fallback via storageService.js |
| Icons | Inline SVG (no icon library) |

## Commands

```bash
npm run dev      # Start dev server (Vite, port 5173)
npm run build    # Production build → /dist
npm run preview  # Preview production build
```

## Key Files

| File | Purpose |
|------|---------|
| [src/App.jsx](src/App.jsx) | All global state, page routing, bottom nav |
| [src/config.js](src/config.js) | Feature flags, plan detection, hasFeature(), isPremium() |
| [src/components/Header.jsx](src/components/Header.jsx) | App header — SVG logo + title, exports `SyrosLogo` |
| [src/components/SummaryCards.jsx](src/components/SummaryCards.jsx) | 4 draggable financial metric cards |
| [src/components/SettingsSection.jsx](src/components/SettingsSection.jsx) | Full settings screen (theme, data, integrations) |
| [src/components/TransactionForm.jsx](src/components/TransactionForm.jsx) | Add transaction form with integrated payment method |
| [src/components/TransactionList.jsx](src/components/TransactionList.jsx) | Transaction history grouped by month |
| [src/services/storageService.js](src/services/storageService.js) | localStorage abstraction (Promise-based) |
| [src/utils/calculations.js](src/utils/calculations.js) | Financial calculation helpers |
| [src/index.css](src/index.css) | Global styles, scrollbar, animations, safe area |
| [index.html](index.html) | Tailwind CDN config, PWA meta, viewport |

## Design Principles

- **iOS iPhone 16 PWA aesthetic** — no harsh borders, use shadows + background opacity for elevation
- **No borders on cards** — `shadow-sm` + tinted backgrounds replace `border border-*`
- All components require `dark:` Tailwind variants
- Mobile-first, `max-w-md` (448px) centered layout
- Minimum touch target: **44px** (`min-h-[44px]`)
- **Tailwind CDN only** — do not install Tailwind as npm package; config is in `index.html`

See [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) for full design token reference.

## Data Flow — Overview vs History

The app has **two independent data pipelines** for calculations:

| Pipeline | Scope | Used by |
|----------|-------|---------|
| `overviewTransactions` / `overviewValues` | Controlled by `overviewFilter` (`'month'` / `'range'`) | Overview page: SummaryCards, MiniChart, CategoryBreakdown, RecentTransactions, Insights |
| `summaryTransactions` / `summaryValues` | Controlled by `currentFilter` (`'month'` / `'range'`) | History/Transações page (FilterBar, TransactionList), Graphs & Goals page |

Both pipelines default to current month via `filterByCurrentMonth(transactions, billingCycleDay)`. The FilterBar shows "Mês Atual" + DateRangePicker (no "Total" button).

### Calculation formulas (same for both pipelines)

```javascript
income       = Σ(tx.amount)           where type === 'income'   && !isProjection  // positive
totalExpense = Math.abs(Σ(tx.amount)) where type === 'expense'  && !isProjection  // positive for display
paidExpense  = Math.abs(Σ(tx.amount)) where type === 'expense'  && paid && !isProjection
balance      = income + paidExpenseRaw  // income minus paid expenses (paidExpenseRaw is negative)
```

## Navigation System

`activePage` state in App.jsx controls which page is visible via `hidden` class on `<section>` elements.

Pages: `'overview'` | `'graphs-goals'` | `'history'` | `'new-transaction'` | `'settings'`

Bottom nav: 4 `NavTab` items + 1 central inline "+" button for "Nova" (solid `var(--accent)` color). The `wallet` page was removed — its content (CreditCardsSection, ExportSection) now lives inside SettingsSection. A fallback redirects `activePage === 'wallet'` → `'settings'`.

Tab labels (pt-BR): Início | Gráfico | **Nova** | Transações | Ajustes

## Premium Feature System

Feature flags live in `src/config.js`:

```javascript
// Toggle here for dev/test:
SMARTFINANCE_CONFIG.plan = 'free'  // or 'premium'
```

Check features in components:

```javascript
import { hasFeature, isPremium } from '../config.js';

if (!hasFeature('envelopes')) {
  return <PremiumCard title="..." description="..." />;
}
```

See [docs/FEATURES.md](docs/FEATURES.md) for the full feature matrix.

## Data Model

```javascript
// Transaction
{
  id: string,
  description: string,
  amount: number,           // positive = income, negative = expense
  type: 'income' | 'expense',
  createdAt: string,        // ISO 8601
  recurrence: 'single' | 'monthly' | 'installment',
  paid: boolean,
  paymentMethod: 'pix' | 'debit' | 'credit' | 'cash' | null,
  creditCardName: string | null,
  category: string,
  groupId?: string,         // links installment group
  sourceOf?: string,        // original ID for projection copies
  isProjection?: boolean,   // auto-generated monthly copies
}
```

## Transaction Creation Flow

When adding a new **expense**, payment method is selected directly in the form (not in a separate modal):

| Payment Method | `paid` on creation | Card name |
|----------------|-------------------|-----------|
| Pix | `true` | — |
| Débito | `true` | Optional (saved to localStorage) |
| Crédito | `false` | Optional (saved to localStorage) |
| Dinheiro | `true` | — |

- Card names are persisted in `localStorage` key `syros_saved_card_names` for future auto-complete
- If Premium cards exist (from CreditCardsSection), they appear as a dropdown instead of text input
- **Success feedback**: fullscreen overlay — blue (#1B4965) for income, red (#9B2226) for expense — auto-closes after 2s

The separate `PaymentModal` still exists for marking existing unpaid transactions as paid (toggle paid checkbox in history).

## Coding Conventions

- Functional components only (no class components)
- Props drilling (no Context or Redux)
- All monetary values: signed numbers (positive = income, negative = expense)
- `formatCurrency()` uses `Intl.NumberFormat('pt-BR', BRL)`
- Date strings: ISO 8601 via `toISOString()`
- Component files: `PascalCase.jsx`
- Service/util files: `camelCase.js`
- SVG icons: `fill="none" stroke="currentColor" strokeWidth={2}`, sized `h-5 w-5` or `h-4 w-4`

## Documentation

| Doc | Purpose |
|-----|---------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Component tree, state map, localStorage keys |
| [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) | Colors, typography, spacing, shadows, iOS patterns |
| [docs/FEATURES.md](docs/FEATURES.md) | Free vs Premium feature matrix |
| [docs/OPENFINANCE.md](docs/OPENFINANCE.md) | Open Finance integration plan |
| [docs/WORKFLOWS.md](docs/WORKFLOWS.md) | Main user flow documentation |
| [IMPLEMENTACAO_PREMIUM.md](IMPLEMENTACAO_PREMIUM.md) | Detailed premium implementation notes |
