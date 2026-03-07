/**
 * SmartFinance — Open Finance Service (Pluggy Integration)
 *
 * Architecture:
 *   Frontend → /api/pluggy/* → server/pluggy-proxy.js (Express) → Pluggy API
 *
 * SECURITY:
 *   - PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET NEVER leave the proxy server
 *   - connectToken lives only in React state (memory), never localStorage
 */

import { supabase } from './supabaseClient.js';
import { dbLoadConnectedBanks, dbSaveConnectedBank, dbDeleteConnectedBank } from './supabaseService.js';

const PROXY_BASE = '/api/pluggy';

// ── Connected state (Supabase + localStorage fallback) ───────────────────────

const CONNECTED_KEY = 'smartfinance_of_connected';

export async function loadConnectedBanks() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const banks = await dbLoadConnectedBanks();
      if (banks.length > 0) return banks;
    }
  } catch { /* fallback to localStorage */ }

  try {
    const raw = localStorage.getItem(CONNECTED_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveConnectedBanks(banks) {
  // Always save to localStorage as cache
  try {
    localStorage.setItem(CONNECTED_KEY, JSON.stringify(banks));
  } catch { /* noop */ }

  // Also save to Supabase if authenticated
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      for (const bank of banks) {
        await dbSaveConnectedBank(bank);
      }
    }
  } catch { /* noop — localStorage is the fallback */ }
}

export async function removeConnectedBank(itemId) {
  // Remove from localStorage
  try {
    const raw = localStorage.getItem(CONNECTED_KEY);
    const banks = raw ? JSON.parse(raw) : [];
    localStorage.setItem(CONNECTED_KEY, JSON.stringify(banks.filter((b) => b.itemId !== itemId)));
  } catch { /* noop */ }

  // Remove from Supabase
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await dbDeleteConnectedBank(itemId);
  } catch { /* noop */ }
}

// ── Proxy API calls ───────────────────────────────────────────────────────────

export async function getConnectToken() {
  const res = await fetch(`${PROXY_BASE}/connect-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Proxy error ${res.status}`);
  }
  return res.json();
}

export async function fetchAccounts(itemId) {
  const res = await fetch(`${PROXY_BASE}/accounts?itemId=${encodeURIComponent(itemId)}`);
  if (!res.ok) throw new Error(`Failed to fetch accounts: ${res.status}`);
  return res.json();
}

export async function fetchTransactions(accountId, from, to) {
  const defaultFrom = new Date();
  defaultFrom.setDate(defaultFrom.getDate() - 90);
  const fromStr = from ?? defaultFrom.toISOString().split('T')[0];
  const toStr = to ?? new Date().toISOString().split('T')[0];

  const url = `${PROXY_BASE}/transactions?accountId=${encodeURIComponent(accountId)}&from=${fromStr}&to=${toStr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch transactions: ${res.status}`);
  return res.json();
}

// ── Auto-categorization ──────────────────────────────────────────────────────

const CATEGORY_RULES = [
  { pattern: /ifood|uber\s*eats|rappi|restaurante|lanchonete|padaria|mercado|supermercado|hortifruti|a[cç]ougue|carrefour|atacad[aã]o|assa[ií]|p[aã]o\s*de\s*a[cç][uú]car|extra\s*hiper/i, category: 'Alimentação' },
  { pattern: /uber(?!\s*eats)|99\s*(?:pop|taxi)|cabify|posto|combust[ií]vel|gasolina|estacionamento|ped[aá]gio|sem\s*parar|shell|ipiranga/i, category: 'Transporte' },
  { pattern: /aluguel|condom[ií]nio|iptu|luz|energia|enel|cemig|copel|celpe|[aá]gua|sanepar|sabesp|g[aá]s|comgas|internet|fibra|vivo|claro|tim\b|oi\b/i, category: 'Moradia' },
  { pattern: /farm[aá]cia|drogaria|droga\s*raia|drogasil|panvel|hospital|cl[ií]nica|m[eé]dico|dentista|unimed|amil|sulamerica|hapvida|plano\s*sa[uú]de/i, category: 'Saúde' },
  { pattern: /escola|faculdade|universidade|curso|udemy|alura|rocketseat|mensalidade\s*escol/i, category: 'Educação' },
  { pattern: /netflix|spotify|disney|hbo|prime\s*video|amazon\s*prime|youtube\s*prem|cinema|teatro|ingresso|steam|playstation|xbox|game/i, category: 'Entretenimento' },
  { pattern: /amazon|mercado\s*livre|shopee|shein|magalu|magazine|casas\s*bahia|americanas|aliexpress|renner|riachuelo|c&a|zara/i, category: 'Compras' },
  { pattern: /assinatura|subscription|apple\.com|google\s*one|icloud|dropbox|chatgpt/i, category: 'Assinatura' },
  { pattern: /pix\s*(enviado|recebido)|ted\b|doc\b|transfer[eê]ncia/i, category: 'Transferência' },
  { pattern: /sal[aá]rio|pagamento\s*folha|holerite|freelance|dividendo|rendimento|juros\s*recebidos|cashback/i, category: 'Salário' },
];

function autoCategory(description, pluggyCategory) {
  const desc = (description || '').toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(desc)) return rule.category;
  }

  if (pluggyCategory) {
    const catMap = {
      'food': 'Alimentação',
      'groceries': 'Alimentação',
      'transportation': 'Transporte',
      'housing': 'Moradia',
      'health': 'Saúde',
      'education': 'Educação',
      'entertainment': 'Entretenimento',
      'shopping': 'Compras',
      'travel': 'Viagem',
      'financial': 'Financeiro',
      'transfer': 'Transferência',
      'income': 'Salário',
      'salary': 'Salário',
    };
    const lc = pluggyCategory.toLowerCase();
    for (const [key, val] of Object.entries(catMap)) {
      if (lc.includes(key)) return val;
    }
  }

  return 'Outros';
}

// ── Credit card detection ────────────────────────────────────────────────────

function isCreditCardAccount(account) {
  if (!account) return false;
  const t = (account.type || '').toUpperCase();
  const s = (account.subtype || '').toUpperCase();
  return t === 'CREDIT' || s === 'CREDIT_CARD' || s.includes('CREDIT');
}

// ── Data mapping ──────────────────────────────────────────────────────────────

export function mapPluggyTransaction(pluggyTx, bankName = '', accountInfo = null) {
  const isCredit = isCreditCardAccount(accountInfo);
  const isIncome = pluggyTx.amount > 0;
  const description = pluggyTx.description || pluggyTx.merchant?.name || 'Transação bancária';
  const category = autoCategory(description, pluggyTx.category);

  return {
    id: `of_${pluggyTx.id}`,
    description,
    amount: isIncome ? Math.abs(pluggyTx.amount) : -Math.abs(pluggyTx.amount),
    type: isIncome ? 'income' : 'expense',
    createdAt: new Date(pluggyTx.date).toISOString(),
    recurrence: 'single',
    // Credit card → unpaid (user marks when bill is paid). Checking → already settled.
    paid: !isCredit,
    paymentMethod: isCredit ? 'credit' : guessPaymentMethod(pluggyTx),
    creditCardName: isCredit ? (bankName || 'Cartão') : null,
    category,
    source: 'openfinance',
    externalId: pluggyTx.id,
    bankName,
    accountType: isCredit ? 'credit' : 'checking',
  };
}

function guessPaymentMethod(pluggyTx) {
  const desc = (pluggyTx.description || '').toLowerCase();
  if (desc.includes('pix')) return 'pix';
  if (desc.includes('débito') || desc.includes('debito')) return 'debit';
  if (pluggyTx.type === 'DEBIT') return 'debit';
  return null;
}

// ── Deduplication ─────────────────────────────────────────────────────────────

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

// ── Supported banks ──────────────────────────────────────────────────────────

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
