import { dbAddTransactions, dbSaveGoals, dbSaveEnvelopes, dbSaveCards, dbSaveUserPreferences } from './supabaseService.js';

export async function migrateLocalStorageToSupabase() {
  let migrated = false;

  try {
    // Transactions
    const txRaw = localStorage.getItem('smartfinance_transactions');
    if (txRaw) {
      const transactions = JSON.parse(txRaw);
      if (transactions.length > 0) {
        // Filter out projections — they are generated client-side
        const realTransactions = transactions.filter((t) => !t.isProjection);
        await dbAddTransactions(realTransactions);
        migrated = true;
      }
    }

    // Goals
    const goalsRaw = localStorage.getItem('smartfinance_goals');
    if (goalsRaw) {
      const goals = JSON.parse(goalsRaw);
      if (goals.incomeGoal || goals.expenseGoal) {
        await dbSaveGoals({
          incomeGoal: goals.incomeGoal !== undefined && goals.incomeGoal !== null ? String(goals.incomeGoal) : '',
          expenseGoal: goals.expenseGoal !== undefined && goals.expenseGoal !== null ? String(goals.expenseGoal) : '',
        });
        migrated = true;
      }
    }

    // Envelopes
    const envRaw = localStorage.getItem('smartfinance_envelopes');
    if (envRaw) {
      const envelopes = JSON.parse(envRaw);
      if (envelopes.length > 0) {
        await dbSaveEnvelopes(envelopes);
        migrated = true;
      }
    }

    // Credit Cards
    const cardsRaw = localStorage.getItem('smartfinance_cards');
    if (cardsRaw) {
      const cards = JSON.parse(cardsRaw);
      if (cards.length > 0) {
        await dbSaveCards(cards);
        migrated = true;
      }
    }

    // User Preferences
    const theme = localStorage.getItem('color-theme') || 'light';
    const language = localStorage.getItem('smartfinance_language') || 'pt-BR';
    const notifRaw = localStorage.getItem('smartfinance_notifications');
    const notificationPrefs = notifRaw ? JSON.parse(notifRaw) : { enabled: false };

    await dbSaveUserPreferences({
      theme,
      language,
      plan: 'free',
      summaryOrder: ['income', 'expense', 'paid', 'balance'],
      notificationPrefs,
    });

    // Clear localStorage after migration
    if (migrated) {
      localStorage.removeItem('smartfinance_transactions');
      localStorage.removeItem('smartfinance_goals');
      localStorage.removeItem('smartfinance_envelopes');
      localStorage.removeItem('smartfinance_cards');
      localStorage.removeItem('smartfinance_notifications');
      localStorage.removeItem('smartfinance_of_connected');
    }
  } catch (error) {
    console.error('Migration error:', error);
  }

  return migrated;
}

export function hasLocalData() {
  const txRaw = localStorage.getItem('smartfinance_transactions');
  if (txRaw) {
    try {
      const txs = JSON.parse(txRaw);
      return txs.length > 0;
    } catch {
      return false;
    }
  }
  return false;
}
