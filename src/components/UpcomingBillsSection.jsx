/**
 * UpcomingBillsSection Component
 *
 * Exibe próximos lançamentos e lembretes de vencimento
 * Feature Premium
 */

import React, { useMemo } from 'react';
import PremiumBadge from './PremiumBadge';
import PremiumCard from './PremiumCard';
import { hasFeature } from '../config';
import { getUpcomingBills } from '../utils/calculations';

export default function UpcomingBillsSection({ transactions }) {
  const isPremium = hasFeature('recurring_bills');

  const upcomingBills = useMemo(() => {
    if (!isPremium) return [];
    return getUpcomingBills(transactions, 30);
  }, [transactions, isPremium]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Amanhã';
    if (diffDays > 1 && diffDays <= 7) return `Em ${diffDays} dias`;

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getDaysUntil = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getUrgencyColor = (days) => {
    if (days <= 3) return 'bg-red-100 dark:bg-red-950/30 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200';
    if (days <= 7) return 'bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200';
    return 'bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200';
  };

  if (!isPremium) {
    return (
      <PremiumCard
        title="Próximos Lançamentos"
        description="Veja todos os seus lançamentos futuros e receba lembretes de vencimento. Nunca mais atrase um pagamento!"
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
      />
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-slate-200/80 dark:border-slate-700">
      <div className="flex items-center gap-2 mb-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Próximos Lançamentos
        </h2>
        <PremiumBadge size="xs" />
      </div>

      {upcomingBills.length === 0 ? (
        <p className="text-center text-slate-500 dark:text-slate-400 py-8 text-sm">
          Nenhum lançamento futuro nos próximos 30 dias.
        </p>
      ) : (
        <div className="space-y-3">
          {upcomingBills.map((bill) => {
            const daysUntil = getDaysUntil(bill.createdAt);

            return (
              <div
                key={bill.id}
                className={`p-4 rounded-xl border-2 ${getUrgencyColor(daysUntil)} transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">
                        {bill.description}
                      </h3>
                      {bill.isProjection && (
                        <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                          Projeção
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-75">
                      Vence: {formatDate(bill.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">
                      R$ {Math.abs(bill.amount).toFixed(2)}
                    </p>
                    {daysUntil <= 3 && (
                      <p className="text-xs font-medium">
                        Urgente!
                      </p>
                    )}
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
