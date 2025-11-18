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

export default function AdvancedAnalytics({ transactions }) {
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
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-slate-200/80 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Análises Avançadas
        </h2>
        <PremiumBadge size="xs" />
      </div>

      {/* Comparativo de Meses */}
      {comparison && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Mês Atual vs Anterior
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Receitas</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                R$ {comparison.current.income.toFixed(2)}
              </p>
              {comparison.diff.income !== 0 && (
                <p className={`text-xs mt-1 ${comparison.diff.income > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {comparison.diff.income > 0 ? '+' : ''}R$ {comparison.diff.income.toFixed(2)}
                </p>
              )}
            </div>

            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-800">
              <p className="text-xs text-red-600 dark:text-red-400 mb-1">Despesas</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                R$ {comparison.current.expense.toFixed(2)}
              </p>
              {comparison.diff.expense !== 0 && (
                <p className={`text-xs mt-1 ${comparison.diff.expense < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
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
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Top 5 Categorias de Gastos
          </h3>
          <div className="space-y-2">
            {topCategories.map((cat, index) => {
              const maxAmount = topCategories[0].amount;
              const percent = (cat.amount / maxAmount) * 100;

              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-slate-700 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        {cat.category}
                      </span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        R$ {cat.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
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
        <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
          Adicione categorias às suas transações para ver as análises.
        </p>
      )}
    </div>
  );
}
