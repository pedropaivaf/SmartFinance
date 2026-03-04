/**
 * SmartFinance — Open Finance Service (Pluggy Integration)
 *
 * Architecture:
 *   Frontend → /api/pluggy/* → server/pluggy-proxy.js (Express) → Pluggy API
 *
 * SECURITY:
 *   - PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET NEVER leave the proxy server
 *   - connectToken lives only in React state (memory), never localStorage
 *   - All API calls go through the proxy (no direct calls to api.pluggy.ai from browser)
 *
 * SETUP:
 *   1. Create account at https://pluggy.ai
 *   2. Copy clientId + clientSecret to .env.local
 *   3. Run: npm run server (starts proxy on port 3001)
 *   4. Run: npm run dev
 */

const PROXY_BASE = '/api/pluggy';

// ── Connected state (localStorage for UI, not tokens) ────────────────────────

const CONNECTED_KEY = 'smartfinance_of_connected';

export function loadConnectedBanks() {
  try {
    const raw = localStorage.getItem(CONNECTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveConnectedBanks(banks) {
  try {
    localStorage.setItem(CONNECTED_KEY, JSON.stringify(banks));
  } catch { /* noop */ }
}

export function removeConnectedBank(itemId) {
  const current = loadConnectedBanks();
  saveConnectedBanks(current.filter((b) => b.itemId !== itemId));
}

// ── Proxy API calls ───────────────────────────────────────────────────────────

/**
 * Get a connectToken from the proxy server.
 * The proxy authenticates with Pluggy using CLIENT_ID + SECRET server-side.
 * Returns { connectToken: string } or throws on error.
 */
export async function getConnectToken() {
  const res = await fetch(`${PROXY_BASE}/connect-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Proxy error ${res.status}`);
  }
  return res.json(); // { connectToken }
}

/**
 * Fetch accounts for a connected item.
 */
export async function fetchAccounts(itemId) {
  const res = await fetch(`${PROXY_BASE}/accounts?itemId=${encodeURIComponent(itemId)}`);
  if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.status}`);
  const data = await res.json();
  return data.results ?? data.accounts ?? [];
}

/**
 * Fetch transactions for an account.
 * @param {string} accountId
 * @param {string} from - ISO date string (30 days ago by default)
 * @param {string} to   - ISO date string (today by default)
 */
export async function fetchTransactions(accountId, from, to) {
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 90);
  const fromStr = from ?? defaultFrom.toISOString().split('T')[0];
  const toStr = to ?? new Date().toISOString().split('T')[0];

  const url = `${PROXY_BASE}/transactions?accountId=${encodeURIComponent(accountId)}&from=${fromStr}&to=${toStr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  const data = await res.json();
  return data.results ?? data.transactions ?? [];
}

// ── Data mapping ──────────────────────────────────────────────────────────────

/**
 * Map a Pluggy transaction to SmartFinance transaction format.
 * Pluggy amounts: positive = credit (income), negative = debit (expense)
 */
export function mapPluggyTransaction(pluggyTx, bankName = '') {
  const isIncome = pluggyTx.amount > 0;
  return {
    id: `of_${pluggyTx.id}`,
    description: pluggyTx.description || pluggyTx.merchant?.name || 'Transação bancária',
    amount: isIncome ? Math.abs(pluggyTx.amount) : -Math.abs(pluggyTx.amount),
    type: isIncome ? 'income' : 'expense',
    createdAt: new Date(pluggyTx.date).toISOString(),
    recurrence: 'single',
    paid: true, // Bank transactions are already settled
    paymentMethod: guessPaymentMethod(pluggyTx),
    creditCardName: null,
    category: pluggyTx.category || '',
    source: 'openfinance',
    externalId: pluggyTx.id,
    bankName,
  };
}

function guessPaymentMethod(pluggyTx) {
  const desc = (pluggyTx.description || '').toLowerCase();
  if (desc.includes('pix')) return 'pix';
  if (desc.includes('débito') || desc.includes('debito')) return 'debit';
  if (desc.includes('crédito') || desc.includes('credito')) return 'credit';
  if (pluggyTx.type === 'DEBIT') return 'debit';
  if (pluggyTx.type === 'CREDIT') return 'credit';
  return null;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

/**
 * Filter out transactions that already exist in SmartFinance.
 * Matches by externalId first, then by (amount + date within 1 day).
 */
export function deduplicateTransactions(incoming, existing) {
  const existingIds = new Set(existing.map((tx) => tx.externalId).filter(Boolean));
  const existingSignatures = new Set(
    existing.map((tx) => {
      const d = new Date(tx.createdAt);
      return `${tx.amount.toFixed(2)}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );

  return incoming.filter((tx) => {
    if (existingIds.has(tx.externalId)) return false;
    const d = new Date(tx.createdAt);
    const sig = `${tx.amount.toFixed(2)}_${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return !existingSignatures.has(sig);
  });
}

// ── Supported banks list (for display) ───────────────────────────────────────

export const SUPPORTED_BANKS = [
  { name: 'Nubank', logo: '🟣', connector: 'nubank' },
  { name: 'Itaú', logo: '🟠', connector: 'itau' },
  { name: 'Bradesco', logo: '🔴', connector: 'bradesco' },
  { name: 'Banco do Brasil', logo: '🟡', connector: 'bb' },
  { name: 'Caixa', logo: '🔵', connector: 'caixa' },
  { name: 'Santander', logo: '⚫', connector: 'santander' },
  { name: 'Inter', logo: '🟠', connector: 'inter' },
  { name: 'C6 Bank', logo: '⬛', connector: 'c6bank' },
];
