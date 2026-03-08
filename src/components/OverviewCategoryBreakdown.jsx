import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import { getTopCategories } from '../utils/calculations';
import { getCategoryById } from '../data/categories';
import { dotBg } from './CategoryPicker';

function OverviewCategoryBreakdown({ transactions, formatCurrency, customCategories = [] }) {
  const { t } = useTranslation();

  const topCategories = useMemo(
    () => getTopCategories(transactions, 5),
    [transactions]
  );

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
        {t('overview.categories.title')}
      </h3>

      {topCategories.length === 0 ? (
        <div className="flex items-center justify-center h-48 sm:h-56">
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center px-4">
            {t('overview.categories.empty')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {topCategories.map((cat, index) => {
            const maxAmount = topCategories[0].amount;
            const percent = (cat.amount / maxAmount) * 100;
            const catDef = getCategoryById(cat.category, customCategories);
            const dot = dotBg[catDef?.color] || dotBg.slate;
            const label = catDef?.label || (catDef ? t(`categories.${cat.category}`) : cat.category);

            return (
              <div key={index} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
                      {label}
                    </span>
                    <span className="text-slate-900 dark:text-white font-bold flex-shrink-0 ml-2">
                      {formatCurrency(cat.amount)}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OverviewCategoryBreakdown;
