# SmartFinance — Feature Matrix

## Free vs Premium

| Feature | Free | Premium | Component |
|---------|------|---------|-----------|
| Transactions (CRUD) | Yes | Yes | TransactionForm, TransactionList |
| Basic filters (month/all) | Yes | Yes | FilterBar |
| Basic chart (bar/pie) | Yes | Yes | ChartSection |
| Income & expense goals | Yes | Yes | GoalsSection |
| History with payment filter | Yes | Yes | PaymentTabs |
| Dark mode | Yes | Yes | Header/Settings |
| Settings screen | Yes | Yes | SettingsSection |
| Budget envelopes by category | No | Yes | EnvelopesSection |
| Automatic insights | No | Yes | InsightsSection |
| Credit card tracking | No | Yes | CreditCardsSection |
| Invoice management | No | Yes | CreditCardsSection |
| Upcoming bills / reminders | No | Yes | UpcomingBillsSection |
| Import CSV | No | Yes | — (planned) |
| Export data (JSON + CSV) | Available in Settings | Full Premium | ExportSection, SettingsSection |
| File attachments | No | Yes | — (planned) |
| Advanced charts | No | Yes | AdvancedAnalytics |
| Weekly checkup | No | Yes | — (planned) |
| Emergency fund tracker | No | Yes | — (planned) |
| Category ranking | No | Yes | AdvancedAnalytics |
| Spending heatmap | No | Yes | — (planned) |

## Feature Flag System

Defined in `src/config.js`:

```javascript
SMARTFINANCE_CONFIG.plan = 'free' // or 'premium'
```

### Usage in Components

```javascript
import { hasFeature, isPremium } from '../config.js';

// Check specific feature
if (!hasFeature('envelopes')) {
  return <PremiumCard title="..." description="..." />;
}

// Check plan level
if (!isPremium()) {
  // show upgrade prompt
}
```

### PremiumCard Component

Use `<PremiumCard>` to wrap locked features. It shows an amber gradient lock UI.

```jsx
import PremiumCard from './PremiumCard';

if (!hasFeature('feature_name')) {
  return (
    <PremiumCard
      title="Feature Name"
      description="What this feature does and why to upgrade."
      icon={<svg>...</svg>}
    />
  );
}
```

### PremiumBadge Component

Use `<PremiumBadge>` inline next to section titles:

```jsx
import PremiumBadge from './PremiumBadge';
<PremiumBadge size="xs" />
```

## Pricing

- Monthly: R$ 12.90/mês
- Currency: BRL

## Testing Premium Mode

In `src/config.js`, change:
```javascript
plan: 'free'  →  plan: 'premium'
```

All premium sections will unlock immediately (no auth required — flag only).
