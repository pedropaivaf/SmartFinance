/**
 * SmartFinance - Configuração Global
 *
 * Este arquivo centraliza as configurações do app, incluindo
 * o sistema de feature flags para freemium/premium.
 *
 * Para ativar modo Premium: altere plan para 'premium'
 * Para modo Free: altere plan para 'free'
 */

export const SMARTFINANCE_CONFIG = {
  // Plano atual do usuário: 'free' ou 'premium'
  plan: 'free', // Altere para 'premium' para liberar todos os recursos

  // Preço do plano premium
  pricing: {
    monthly: 12.90,
    currency: 'BRL',
  },

  // Versão do app
  version: '2.0.0',

  // Features disponíveis por plano
  features: {
    free: [
      'transactions',
      'basic_filters',
      'basic_chart',
      'basic_goals',
      'history',
      'dark_mode',
    ],
    premium: [
      'envelopes',
      'insights',
      'credit_cards',
      'invoices',
      'recurring_bills',
      'import_csv',
      'export_data',
      'attachments',
      'advanced_charts',
      'weekly_checkup',
      'emergency_fund',
      'category_ranking',
      'spending_heatmap',
    ],
  },
};

/**
 * Verifica se uma feature está disponível no plano atual
 * @param {string} featureName - Nome da feature
 * @returns {boolean}
 */
export function hasFeature(featureName) {
  const currentPlan = SMARTFINANCE_CONFIG.plan;

  // Features free estão sempre disponíveis
  if (SMARTFINANCE_CONFIG.features.free.includes(featureName)) {
    return true;
  }

  // Features premium só disponíveis se o plano for premium
  if (SMARTFINANCE_CONFIG.features.premium.includes(featureName)) {
    return currentPlan === 'premium';
  }

  return false;
}

/**
 * Retorna se o usuário tem plano premium
 * @returns {boolean}
 */
export function isPremium() {
  return SMARTFINANCE_CONFIG.plan === 'premium';
}

/**
 * Retorna mensagem de upgrade para premium
 * @returns {string}
 */
export function getPremiumMessage() {
  return `Disponível no plano Premium (R$ ${SMARTFINANCE_CONFIG.pricing.monthly.toFixed(2)}/mês)`;
}
