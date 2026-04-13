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

Single source of truth: [src/paywall/packages.js](../src/paywall/packages.js). Never hardcode BRL values in components.

| Tier | Web (Stripe) | Mobile (IAP) | Trial |
|------|--------------|--------------|-------|
| Premium Monthly | R$ 12,90 | R$ 14,90 | 7 days |
| Premium Annual | R$ 99,90 | R$ 119,90 | 7 days |

Mobile prices absorb the 15% App Store / Play Store fee. Platform is detected via `isNativeApp()` (`src/utils/platform.js`); the paywall picks `priceWeb` or `priceApp` automatically.

## Billing Architecture

- **Web**: `createCheckoutSession()` → `create-checkout-session` Edge Function → Stripe Checkout.
- **iOS / Android**: `purchasePackage()` → RevenueCat → StoreKit / Play Billing.
- **Source of truth**: `billing-webhook` Edge Function receives events from both providers and updates `user_preferences` (`plan`, `premium_expires_at`, `plan_source`, `plan_provider_id`).
- Client never writes the plan field directly on purchase — it polls prefs after checkout and reloads.

## Testing Premium Mode

For UI / feature-gate testing (no real payment):

```sql
update user_preferences
set plan = 'premium',
    premium_expires_at = now() + interval '1 month',
    plan_source = 'manual'
where user_id = '<uuid>';
```

`isPremiumActive(prefs)` in `src/config.js` respects the expiration — set `premium_expires_at = now() - interval '1 day'` to simulate an expired plan and verify the downgrade path.
