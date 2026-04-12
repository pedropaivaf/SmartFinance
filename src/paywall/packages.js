/**
 * Fonte única de verdade para SKUs e preços do Syros Premium.
 * Preços de app stores são ~15% maiores para absorver a comissão das lojas.
 */

export const PACKAGES = {
  monthly: {
    id: 'syros_premium_monthly',
    priceWeb: 12.90,
    priceApp: 14.90,
    trialDays: 7,
    period: 'month',
  },
  annual: {
    id: 'syros_premium_annual',
    priceWeb: 99.90,
    priceApp: 119.90,
    trialDays: 7,
    period: 'year',
  },
};

export const PREMIUM_FEATURES = [
  'envelopes',
  'insights',
  'credit_cards',
  'invoices',
  'recurring_bills',
  'import_csv',
  'export_data',
  'advanced_charts',
  'weekly_checkup',
  'emergency_fund',
  'category_ranking',
  'spending_heatmap',
  'attachments',
];

export function formatPrice(amount, lang = 'pt-BR') {
  const locale = lang === 'pt-BR' ? 'pt-BR' : lang === 'es' ? 'es-ES' : lang === 'fr' ? 'fr-FR' : 'en-US';
  return new Intl.NumberFormat(locale, { style: 'currency', currency: 'BRL' }).format(amount);
}

export function monthlyEquivalent(annualPrice) {
  return annualPrice / 12;
}

export function getPrice(pkg, isNative) {
  return isNative ? pkg.priceApp : pkg.priceWeb;
}
