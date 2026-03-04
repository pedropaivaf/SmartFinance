# SmartFinance — Open Finance Integration Plan

## What is Open Finance BR?

Open Finance Brasil (formerly Open Banking) is a Central Bank of Brazil (BACEN) regulated initiative that mandates financial institutions to share customer data via standardized APIs — with explicit user consent. It enables third-party apps to read account balances, transactions, and other financial data directly from banks.

**Current Status in SmartFinance**: Planned future feature. Shown as "Em breve" badge in Settings > Integracoes.

## Why It Matters

- Users currently add transactions manually — high friction
- Open Finance would allow **automatic import** of bank transactions
- Eliminates duplicate/missed entries
- Enables real-time balance sync

## Planned Integration Architecture

### Phase 1 — Read-Only Balance (MVP)
- OAuth2 consent flow with participating bank
- Fetch current account balance
- Display as "Saldo sincronizado" in overview cards
- No transaction import yet

### Phase 2 — Transaction Import
- Pull transactions from last 30/90 days
- Map bank categories to SmartFinance categories
- Deduplicate against manually entered transactions (match by amount + date + ~description)
- User reviews and confirms imported batch

### Phase 3 — Auto-Categorization + Sync
- Continuous background sync (webhook or polling)
- ML-based category suggestion from merchant names
- User trains categories via feedback loop
- OpenFinance as primary source, manual as supplement

## OAuth2 Flow

```
User clicks "Conectar banco"
    → SmartFinance redirects to BACEN consent portal
    → User selects bank + grants permission
    → Bank redirects back with authorization_code
    → SmartFinance backend exchanges code for access_token
    → Tokens stored server-side (NEVER in localStorage)
    → App fetches data via backend proxy
```

## Data Model Extension

When OpenFinance is implemented, transactions gain additional fields:

```javascript
{
  // Existing fields...
  source: 'manual' | 'openfinance',    // New: data origin
  bankId: string | null,                // New: participating institution ID
  externalId: string | null,            // New: bank's transaction reference
  merchantName: string | null,          // New: raw merchant name from bank
  autoCategory: string | null,          // New: AI-suggested category
}
```

## Participating Institutions (Phase 1 targets)

- Nubank
- Itau Unibanco
- Bradesco
- Banco do Brasil
- Caixa Economica Federal
- Santander Brasil
- Inter
- C6 Bank

## Security Considerations

- Access tokens: stored server-side only, never in localStorage
- Refresh tokens: httpOnly cookies, SameSite=Strict
- PKCE required for all authorization flows
- Consent granularity: read-only scope (`accounts:read`, `transactions:read`)
- Revocation: user can disconnect any bank at any time from Settings
- Data residency: raw bank data not persisted — only mapped transactions

## Implementation Prerequisites

This feature requires:
1. A backend service (currently SmartFinance has none — runs fully client-side)
2. BACEN Open Finance participant registration
3. Security audit before handling bank credentials/tokens
4. Privacy Policy update

**Estimated effort**: Backend + OAuth flow = 3-4 weeks for a solo developer.
