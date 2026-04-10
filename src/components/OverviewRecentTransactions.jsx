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
    <div className="bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-sm border border-[#E8E5E0] dark:border-[#2D2B28] p-5 sm:p-6">
      <h3 className="text-lg font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF] mb-3">
        {t('overview.recent.title')}
      </h3>

      {recentTransactions.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-[#9B9B9B] dark:text-[#6B6560] text-center">
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
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition-colors"
                >
                  <span className={`p-1.5 rounded-full flex-shrink-0 ${isIncome ? 'bg-[#E8F0F4] dark:bg-[#1B2B35]' : 'bg-red-100 dark:bg-red-900/40'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isIncome ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B2226] dark:text-[#E76F51]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      {isIncome
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                      }
                    </svg>
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] dark:text-[#E8E4DF] truncate">
                      {tx.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-[#6B6B6B] dark:text-[#A09A92]">
                      <span>{new Date(tx.createdAt).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : lang)}</span>
                      {catLabel && (
                        <>
                          <span className="text-[#D4D0C8] dark:text-[#3A3835]">·</span>
                          <span className="inline-flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${dot}`} />
                            {catLabel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <p className={`text-sm font-bold font-display flex-shrink-0 ${isIncome ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B2226] dark:text-[#E76F51]'}`}>
                    {sign} {formatCurrency(amount)}
                  </p>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="w-full mt-3 py-2.5 text-sm font-medium text-[#1B4965] dark:text-[#5FA8D3] hover:bg-[#E8F0F4] dark:hover:bg-[#1B2B35] rounded-xl transition-colors"
          >
            {t('overview.recent.viewAll')} →
          </button>
        </>
      )}
    </div>
  );
}

export default OverviewRecentTransactions;
