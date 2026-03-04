# SmartFinance — Architecture

## Component Tree

```
App (src/App.jsx)
├── Header
├── Pages (controlled by activePage state)
│   ├── overview
│   │   ├── Header
│   │   ├── SummaryCards
│   │   ├── InsightsSection        [Premium]
│   │   └── UpcomingBillsSection   [Premium]
│   ├── graphs-goals
│   │   ├── ChartSection
│   │   ├── GoalsSection
│   │   ├── EnvelopesSection       [Premium]
│   │   └── AdvancedAnalytics      [Premium]
│   ├── history
│   │   ├── FilterBar
│   │   ├── PaymentTabs
│   │   ├── TransactionList
│   │   ├── CreditCardsSection     [Premium]
│   │   └── ExportSection          [Premium]
│   ├── new-transaction
│   │   └── TransactionForm
│   └── settings
│       └── SettingsSection
├── Navigation (NavTab × 4 + FAB)
└── Modals
    ├── EditTransactionModal
    ├── PaymentModal
    ├── ConfirmDeleteModal
    ├── DeleteChoiceModal
    ├── EditChoiceModal
    └── EditAllValueModal
```

## State Map (App.jsx)

| State | Type | Purpose |
|-------|------|---------|
| `activePage` | string | Current visible page |
| `transactions` | Transaction[] | Raw persisted transactions |
| `processedTransactions` | Transaction[] | With monthly projections |
| `goals` | Goals | Income/expense goals |
| `envelopes` | Envelope[] | Budget envelopes (Premium) |
| `cards` | Card[] | Credit cards (Premium) |
| `isDarkMode` | boolean | Dark/light theme |
| `summaryOrder` | string[] | Card drag-drop order |
| `currentFilter` | string | Month/all filter |
| `currentPaymentFilter` | string | Payment method filter |
| `editModalState` | object | Edit modal open/transaction |
| `paymentModalState` | object | Payment modal state |
| `confirmDeleteOpen` | boolean | Clear-all confirmation |
| `deleteChoiceState` | object | Single/all delete choice |
| `editChoiceState` | object | Single/all edit choice |
| `editAllValueState` | object | Edit all modal state |

All state lives in `App.jsx`. No Context or external store is used. Pattern: props-down, callbacks-up.

## Page Routing

`activePage` state controls page visibility via `hidden` CSS class on `<section>` elements. No URL routing — single-page experience optimized for PWA.

Valid values: `'overview'` | `'graphs-goals'` | `'history'` | `'new-transaction'` | `'settings'`

## localStorage Keys

Defined in `src/services/storageService.js`:

| Key | Content |
|-----|---------|
| `smartfinance_transactions` | Transaction[] |
| `smartfinance_goals` | { incomeGoal, expenseGoal } |
| `smartfinance_envelopes` | Envelope[] |
| `smartfinance_cards` | Card[] |
| `smartfinance_insights` | cached insights |
| `smartfinance_user_prefs` | { summaryOrder, notifications } |
| `color-theme` | `'dark'` \| `'light'` |

## Monthly Projection System

`generateProcessedTransactions()` in App.jsx creates virtual projections for `recurrence: 'monthly'` transactions up to 1 year ahead. Projections have `isProjection: true` and `paid: false`. They are NOT persisted — regenerated on each load from base transactions.

## Transaction Data Model

```typescript
{
  id: string                              // UUID or timestamp-based
  description: string
  amount: number                          // Positive for income, negative for expense
  type: 'income' | 'expense'
  createdAt: string                       // ISO 8601
  recurrence: 'single' | 'monthly' | 'installment'
  paid: boolean
  paymentMethod: 'pix' | 'debit' | 'credit' | 'cash' | null
  creditCardName: string | null
  category: string
  groupId?: string                        // Links installment group
  sourceOf?: string                       // Points to original for projections
  isProjection?: boolean                  // True for auto-generated monthly copies
}
```
