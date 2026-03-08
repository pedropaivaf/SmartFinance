import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import { getCategoryById } from '../data/categories';
import { dotBg } from './CategoryPicker';

function OverviewRecentTransactions({ transactions, formatCurrency, onNavigate, customCategories = [] }) {
  const { t, lang } = useTranslation();

  const recentTransactions = useMemo(() => {
    return transactions
      .filter((tx) => !tx.isProjection)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [transactions]);

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
        {t('overview.recent.title')}
      </h3>

      {recentTransactions.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center">
            {t('overview.recent.empty')}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {recentTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const sign = isIncome ? '+' : '-';
              const amount = Math.abs(tx.amount);
              const cat = tx.category ? getCategoryById(tx.category, customCategories) : null;
              const dot = cat ? (dotBg[cat.color] || dotBg.slate) : null;
              const catLabel = cat ? (cat.label || t(`categories.${tx.category}`)) : null;

              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <span className={`p-1.5 rounded-full flex-shrink-0 ${isIncome ? 'bg-blue-100 dark:bg-blue-900/40' : 'bg-red-100 dark:bg-red-900/40'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isIncome ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {isIncome
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      }
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>{new Date(tx.createdAt).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : lang)}</span>
                      {catLabel && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">·</span>
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            {catLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm font-bold flex-shrink-0 ${isIncome ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
                    {sign} {formatCurrency(amount)}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="w-full mt-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-xl transition-colors"
          >
            {t('overview.recent.viewAll')} →
          </button>
        </>
      )}
    </div>
  );
}

export default OverviewRecentTransactions;
