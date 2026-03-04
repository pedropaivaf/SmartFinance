/**
 * SmartFinance — Notification Service
 *
 * Uses the Web Notifications API.
 * On iOS 16.4+ (added to Home Screen): native push-style notifications.
 * On desktop/Android: standard browser notifications.
 *
 * No push server required — notifications are triggered when the app opens.
 */

const PREFS_KEY = 'smartfinance_notifications';

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_PREFS = {
  enabled: false,
  upcomingBills: true,
  budgetAlerts: true,
  monthlyRecap: true,
  lastMonthlyRecap: null, // ISO date string
};

// ── Storage ───────────────────────────────────────────────────────────────────

export function loadNotificationPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : { ...DEFAULT_PREFS };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveNotificationPrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch { /* noop */ }
}

// ── Permission ────────────────────────────────────────────────────────────────

/**
 * Returns 'granted' | 'denied' | 'default' | 'unsupported'
 */
export function getNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  return Notification.permission;
}

/**
 * Requests permission. Returns the new permission state.
 */
export async function requestPermission() {
  if (typeof Notification === 'undefined') return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try {
    const result = await Notification.requestPermission();
    return result;
  } catch {
    return 'denied';
  }
}

// ── Show a notification ───────────────────────────────────────────────────────

export function showNotification(title, options = {}) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission !== 'granted') return;

  try {
    // eslint-disable-next-line no-new
    new Notification(title, {
      icon: '/icons/smartfinance-180.png',
      badge: '/icons/smartfinance-180.png',
      ...options,
    });
  } catch {
    // Some environments throw (e.g. iOS Safari without service worker)
    console.warn('Notification could not be shown:', title);
  }
}

// ── Upcoming bills check ──────────────────────────────────────────────────────

/**
 * Check if there are upcoming unpaid expense transactions in the next `days` days.
 * Fires one notification per due bill.
 */
export function checkUpcomingBills(transactions, days = 7, t) {
  if (!transactions?.length) return;
  const now = new Date();
  const cutoff = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const upcoming = transactions.filter((tx) => {
    if (tx.type !== 'expense' || tx.paid || tx.isProjection) return false;
    const txDate = new Date(tx.createdAt);
    return txDate >= now && txDate <= cutoff;
  });

  upcoming.forEach((tx) => {
    const daysUntil = Math.ceil((new Date(tx.createdAt) - now) / (1000 * 60 * 60 * 24));
    const title = t
      ? `⚠️ ${tx.description}`
      : `⚠️ ${tx.description}`;
    const body = t
      ? `Vence em ${daysUntil} dia(s)`
      : `Due in ${daysUntil} day(s)`;
    showNotification(title, { body, tag: `bill-${tx.id}` });
  });
}

// ── Budget alerts ─────────────────────────────────────────────────────────────

/**
 * Notify when an envelope has exceeded a given threshold of its monthly limit.
 */
export function checkBudgetAlerts(envelopes, transactions, threshold = 0.8) {
  if (!envelopes?.length || !transactions?.length) return;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  envelopes.forEach((envelope) => {
    const spent = transactions
      .filter((tx) => {
        const d = new Date(tx.createdAt);
        return (
          tx.type === 'expense' &&
          tx.category === envelope.category &&
          d.getMonth() === currentMonth &&
          d.getFullYear() === currentYear
        );
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const ratio = spent / envelope.monthlyLimit;
    if (ratio >= threshold) {
      const pct = Math.round(ratio * 100);
      showNotification(`📊 ${envelope.name}`, {
        body: `${pct}% do limite mensal utilizado`,
        tag: `budget-${envelope.id}-${currentYear}-${currentMonth}`,
      });
    }
  });
}

// ── Monthly recap ─────────────────────────────────────────────────────────────

/**
 * On first open of a new month, show a summary of the previous month.
 */
export function checkMonthlyRecap(transactions, prefs, onUpdatePrefs) {
  const now = new Date();
  const lastRecap = prefs.lastMonthlyRecap ? new Date(prefs.lastMonthlyRecap) : null;

  // Only show once per month
  if (lastRecap && lastRecap.getMonth() === now.getMonth() && lastRecap.getFullYear() === now.getFullYear()) {
    return;
  }

  // Calculate previous month stats
  const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();

  const prevMonthTxs = transactions.filter((tx) => {
    const d = new Date(tx.createdAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear && !tx.isProjection;
  });

  if (!prevMonthTxs.length) return;

  const income = prevMonthTxs.filter((tx) => tx.type === 'income').reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const expense = prevMonthTxs.filter((tx) => tx.type === 'expense').reduce((s, tx) => s + Math.abs(tx.amount), 0);
  const balance = income - expense;

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  showNotification(`📅 Resumo de ${monthNames[prevMonth]}/${prevYear}`, {
    body: `Receitas: R$ ${income.toFixed(2)} | Despesas: R$ ${expense.toFixed(2)} | Saldo: R$ ${balance.toFixed(2)}`,
    tag: `recap-${prevYear}-${prevMonth}`,
  });

  // Update last recap date
  const updated = { ...prefs, lastMonthlyRecap: now.toISOString() };
  saveNotificationPrefs(updated);
  if (onUpdatePrefs) onUpdatePrefs(updated);
}

// ── Run all checks ────────────────────────────────────────────────────────────

/**
 * Run all enabled notification checks. Call this once when the app loads.
 */
export function runNotificationChecks({ prefs, transactions, envelopes, onUpdatePrefs, t }) {
  if (!prefs.enabled || getNotificationPermission() !== 'granted') return;

  if (prefs.upcomingBills) checkUpcomingBills(transactions, 7, t);
  if (prefs.budgetAlerts) checkBudgetAlerts(envelopes, transactions, 0.8);
  if (prefs.monthlyRecap) checkMonthlyRecap(transactions, prefs, onUpdatePrefs);
}
