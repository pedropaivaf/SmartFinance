/**
 * AdvancedAnalytics Component
 *
 * Análises avançadas: comparativo de meses, top categorias, etc.
 * Feature Premium
 */

import React, { useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { compareCurrentVsPreviousMonth, getTopCategories } from '../utils/calculations';
import { getCategoryById } from '../data/categories';
import { dotBg } from './CategoryPicker';
import { useTranslation } from '../i18n/index.jsx';

export default function AdvancedAnalytics({ transactions, customCategories = [] }) {
  const { t } = useTranslation();
  const isPremium = hasFeature('advanced_charts');

  const comparison = useMemo(() => {
    if (!isPremium) return null;
    return compareCurrentVsPreviousMonth(transactions);
  }, [transactions, isPremium]);

  const topCategories = useMemo(() => {
    if (!isPremium) return [];
    return getTopCategories(transactions, 5);
  }, [transactions, isPremium]);

  if (!isPremium) {
    return (
      <PremiumCard
        title="Análises Avançadas"
        description="Compare seus gastos mês a mês, veja ranking de categorias e identifique padrões de consumo."
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-sm border border-[#E8E5E0] dark:border-[#2D2B28] p-6">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
          Análises Avançadas
        </h2>
        <PremiumBadge size="xs" />
      </div>

      {/* Comparativo de Meses */}
      {comparison && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold font-display text-[#1A1A1A] dark:text-[#A09A92] mb-3">
            Mês Atual vs Anterior
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-[#E8F0F4] dark:bg-[#1B2B35] rounded-xl border border-[#1B4965]/20 dark:border-[#5FA8D3]/20">
              <p className="text-xs text-[#1B4965] dark:text-[#5FA8D3] mb-1">Receitas</p>
              <p className="text-2xl font-bold text-[#1B4965] dark:text-[#5FA8D3]">
                R$ {comparison.current.income.toFixed(2)}
              </p>
              {comparison.diff.income !== 0 && (
                <p className={`text-xs mt-1 ${comparison.diff.income > 0 ? 'text-[#2D6A4F] dark:text-[#52B788]' : 'text-[#9B2226] dark:text-[#E76F51]'}`}>
                  {comparison.diff.income > 0 ? '+' : ''}R$ {comparison.diff.income.toFixed(2)}
                </p>
              )}
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-xs text-[#9B2226] dark:text-[#E76F51] mb-1">Despesas</p>
              <p className="text-2xl font-bold text-[#9B2226] dark:text-[#E76F51]">
                R$ {comparison.current.expense.toFixed(2)}
              </p>
              {comparison.diff.expense !== 0 && (
                <p className={`text-xs mt-1 ${comparison.diff.expense < 0 ? 'text-[#2D6A4F] dark:text-[#52B788]' : 'text-[#9B2226] dark:text-[#E76F51]'}`}>
                  {comparison.diff.expense > 0 ? '+' : ''}R$ {comparison.diff.expense.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Categorias */}
      {topCategories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold font-display text-[#1A1A1A] dark:text-[#A09A92] mb-3">
            Top 5 Categorias de Gastos
          </h3>
          <div className="space-y-2">
            {topCategories.map((cat, index) => {
              const maxAmount = topCategories[0].amount;
              const percent = (cat.amount / maxAmount) * 100;

              return (
                <div key={index} className="flex items-center gap-3">
                  {(() => {
                    const catDef = getCategoryById(cat.category, customCategories);
                    const dot = dotBg[catDef?.color] || dotBg.slate;
                    return (
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${dot}`} />
                    );
                  })()}
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-[#1A1A1A] dark:text-[#A09A92] font-medium">
                        {(() => {
                          const catDef = getCategoryById(cat.category, customCategories);
                          return catDef?.label || (catDef ? t(`categories.${cat.category}`) : cat.category);
                        })()}
                      </span>
                      <span className="text-[#1A1A1A] dark:text-[#E8E4DF] font-bold">
                        R$ {cat.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-[#E8E5E0] dark:bg-[#2D2B28] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1B4965] to-[#5FA8D3] dark:from-[#5FA8D3] dark:to-[#4A93BD] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {topCategories.length === 0 && (
        <p className="text-center text-[#6B6B6B] dark:text-[#A09A92] py-8 text-sm">
          Adicione categorias às suas transações para ver as análises.
        </p>
      )}
    </div>
  );
}
