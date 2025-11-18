/**
 * InsightsSection Component
 *
 * Exibe insights automáticos baseados nas transações
 * Feature Premium
 */

import React, { useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import { hasFeature } from '../config';
import {
  calculateTotals,
  compareCurrentVsPreviousMonth,
  getUpcomingBills,
} from '../utils/calculations';

export default function InsightsSection({ transactions, envelopes = [] }) {
  const insights = useMemo(() => {
    if (!hasFeature('insights')) return [];

    const results = [];
    const comparison = compareCurrentVsPreviousMonth(transactions);
    const totals = calculateTotals(transactions);
    const upcoming = getUpcomingBills(transactions, 7);

    // Insight 1: Comparação com mês anterior
    if (comparison.diff.expense !== 0) {
      const diff = Math.abs(comparison.diff.expense);
      const type = comparison.diff.expense > 0 ? 'warning' : 'success';
      const message = comparison.diff.expense > 0
        ? `Você gastou R$ ${diff.toFixed(2)} a mais este mês em relação ao mês passado.`
        : `Parabéns! Você economizou R$ ${diff.toFixed(2)} este mês comparado ao anterior.`;

      results.push({ type, message, icon: type === 'warning' ? '⚠️' : '✅' });
    }

    // Insight 2: Meta de renda atingida
    if (totals.income > 0 && comparison.current.income > 0) {
      if (comparison.current.income >= comparison.previous.income * 1.1) {
        results.push({
          type: 'success',
          message: 'Sua renda aumentou mais de 10% este mês! Continue assim!',
          icon: '📈',
        });
      }
    }

    // Insight 3: Próximos vencimentos
    if (upcoming.length > 0) {
      const total = upcoming.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      results.push({
        type: 'info',
        message: `Você tem ${upcoming.length} conta(s) vencendo nos próximos 7 dias, totalizando R$ ${total.toFixed(2)}.`,
        icon: '📅',
      });
    }

    // Insight 4: Envelopes próximos do limite
    envelopes.forEach(env => {
      if (env.status === 'critical' || env.status === 'exceeded') {
        results.push({
          type: 'warning',
          message: `Atenção: envelope "${env.name}" está em ${env.percent.toFixed(0)}% do limite!`,
          icon: '💰',
        });
      }
    });

    return results.slice(0, 4); // Máximo de 4 insights
  }, [transactions, envelopes]);

  if (!hasFeature('insights')) {
    return null;
  }

  if (insights.length === 0) {
    return null;
  }

  const typeColors = {
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200',
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Insights Automáticos
        </h3>
        <PremiumBadge size="xs" />
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`
              p-4 rounded-xl border-2
              ${typeColors[insight.type]}
              transition-all hover:shadow-md
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{insight.icon}</span>
              <p className="text-sm font-medium flex-1">
                {insight.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
