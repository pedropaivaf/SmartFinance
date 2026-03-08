import React, { useEffect, useMemo, useRef } from 'react';
import { useTranslation } from '../i18n/index.jsx';

function OverviewMiniChart({ transactions, isDarkMode, formatCurrency }) {
  const { t } = useTranslation();
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const totals = useMemo(() => {
    const income = transactions
      .filter((tx) => tx.type === 'income' && !tx.isProjection)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const paidExpense = transactions
      .filter((tx) => tx.type === 'expense' && tx.paid && !tx.isProjection)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const unpaidExpense = transactions
      .filter((tx) => tx.type === 'expense' && !tx.paid && !tx.isProjection)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    return {
      income,
      paidExpense,
      unpaidExpense,
      hasData: income !== 0 || paidExpense !== 0 || unpaidExpense !== 0,
    };
  }, [transactions]);

  useEffect(() => {
    if (!totals.hasData) {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      return;
    }

    if (!window.Chart || !canvasRef.current) return;

    const Chart = window.Chart;
    const context = canvasRef.current.getContext('2d');

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: [
          t('overview.miniChart.income'),
          t('overview.miniChart.paidExpenses'),
          t('overview.miniChart.unpaidExpenses'),
        ],
        datasets: [{
          data: [totals.income, totals.paidExpense, totals.unpaidExpense],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)',
          ],
          borderColor: isDarkMode ? '#1e293b' : '#f8fafc',
          borderWidth: 3,
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDarkMode ? '#cbd5e1' : '#475569',
              padding: 12,
              usePointStyle: true,
              font: { size: 11 },
            },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${formatCurrency(ctx.parsed)}`,
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [isDarkMode, totals, t, formatCurrency]);

  return (
    <div className="bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-5 sm:p-6">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
        {t('overview.miniChart.title')}
      </h3>
      <div className="h-48 sm:h-56">
        {totals.hasData ? (
          <canvas ref={canvasRef} className="w-full h-full" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center px-4">
              {t('overview.miniChart.empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OverviewMiniChart;
