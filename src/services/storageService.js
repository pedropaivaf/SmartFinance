/**
 * SmartFinance - Storage Service
 *
 * Camada de abstração para persistência de dados.
 * Atualmente usa localStorage, mas preparado para migração futura
 * para API/backend sem reescrever o código.
 *
 * Padrão: Todas as funções retornam Promises para facilitar migração
 * para API assíncrona no futuro.
 */

// Chaves do localStorage
const STORAGE_KEYS = {
  TRANSACTIONS: 'smartfinance_transactions',
  GOALS: 'smartfinance_goals',
  ENVELOPES: 'smartfinance_envelopes',
  CARDS: 'smartfinance_cards',
  INSIGHTS: 'smartfinance_insights',
  THEME: 'color-theme',
  USER_PREFS: 'smartfinance_user_prefs',
};

// ============================================
// TRANSACTIONS
// ============================================

export async function loadTransactions() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
}

export async function saveTransactions(transactions) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    return true;
  } catch (error) {
    console.error('Error saving transactions:', error);
    return false;
  }
}

// ============================================
// GOALS
// ============================================

export async function loadGoals() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GOALS);
    return data ? JSON.parse(data) : { incomeGoal: '', expenseGoal: '' };
  } catch (error) {
    console.error('Error loading goals:', error);
    return { incomeGoal: '', expenseGoal: '' };
  }
}

export async function saveGoals(goals) {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
    return true;
  } catch (error) {
    console.error('Error saving goals:', error);
    return false;
  }
}

// ============================================
// ENVELOPES (Premium)
// ============================================

export async function loadEnvelopes() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ENVELOPES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading envelopes:', error);
    return [];
  }
}

export async function saveEnvelopes(envelopes) {
  try {
    localStorage.setItem(STORAGE_KEYS.ENVELOPES, JSON.stringify(envelopes));
    return true;
  } catch (error) {
    console.error('Error saving envelopes:', error);
    return false;
  }
}

// ============================================
// CREDIT CARDS (Premium)
// ============================================

export async function loadCards() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CARDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
}

export async function saveCards(cards) {
  try {
    localStorage.setItem(STORAGE_KEYS.CARDS, JSON.stringify(cards));
    return true;
  } catch (error) {
    console.error('Error saving cards:', error);
    return false;
  }
}

// ============================================
// THEME
// ============================================

export async function loadTheme() {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    if (theme) return theme;

    // Fallback para preferência do sistema
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  } catch (error) {
    console.error('Error loading theme:', error);
    return 'light';
  }
}

export async function saveTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    return true;
  } catch (error) {
    console.error('Error saving theme:', error);
    return false;
  }
}

// ============================================
// USER PREFERENCES
// ============================================

export async function loadUserPreferences() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PREFS);
    return data ? JSON.parse(data) : {
      summaryOrder: ['income', 'totalExpense', 'paidExpense', 'balance'],
      notifications: true,
    };
  } catch (error) {
    console.error('Error loading user preferences:', error);
    return {
      summaryOrder: ['income', 'totalExpense', 'paidExpense', 'balance'],
      notifications: true,
    };
  }
}

export async function saveUserPreferences(prefs) {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PREFS, JSON.stringify(prefs));
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    return false;
  }
}

// ============================================
// EXPORT / BACKUP
// ============================================

/**
 * Exporta todos os dados do usuário
 * @returns {Object} Objeto com todos os dados
 */
export async function exportAllData() {
  try {
    return {
      transactions: await loadTransactions(),
      goals: await loadGoals(),
      envelopes: await loadEnvelopes(),
      cards: await loadCards(),
      userPreferences: await loadUserPreferences(),
      exportedAt: new Date().toISOString(),
      version: '2.0.0',
    };
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}

/**
 * Importa dados (backup restore)
 * @param {Object} data - Dados para importar
 * @returns {boolean}
 */
export async function importAllData(data) {
  try {
    if (data.transactions) await saveTransactions(data.transactions);
    if (data.goals) await saveGoals(data.goals);
    if (data.envelopes) await saveEnvelopes(data.envelopes);
    if (data.cards) await saveCards(data.cards);
    if (data.userPreferences) await saveUserPreferences(data.userPreferences);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

/**
 * Limpa todos os dados (cuidado!)
 * @returns {boolean}
 */
export async function clearAllData() {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
}
