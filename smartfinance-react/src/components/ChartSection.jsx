import React, { useEffect, useMemo, useRef } from 'react';

function ChartSection({ transactions, isDarkMode }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'income' && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + transaction.amount, 0);

    const paidExpense = transactions
      .filter((transaction) => transaction.type === 'expense' && transaction.paid && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + Math.abs(transaction.amount), 0);

    const unpaidExpense = transactions
      .filter((transaction) => transaction.type === 'expense' && !transaction.paid && !transaction.isProjection)
      .reduce((accumulator, transaction) => accumulator + Math.abs(transaction.amount), 0);

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

    if (!window.Chart || !canvasRef.current) {
      return;
    }

    const Chart = window.Chart;
    const context = canvasRef.current.getContext('2d');

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: ['Renda', 'Despesas pagas', 'Despesas a pagar'],
        datasets: [
          {
            label: 'Valor',
            data: [totals.income, totals.paidExpense, totals.unpaidExpense],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(34, 197, 94, 0.8)',
              'rgba(239, 68, 68, 0.8)',
            ],
            borderColor: isDarkMode ? '#1e293b' : '#f8fafc',
            borderWidth: 4,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: isDarkMode ? '#cbd5e1' : '#475569',
              padding: 20,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.parsed;
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(value);
              },
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
  }, [isDarkMode, totals]);

  const containerClasses = `min-h-[14rem] sm:min-h-[18rem] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg${
    totals.hasData ? '' : ' flex items-center justify-center'
  }`;

  return (
    <section className="space-y-2">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Visão Gráfica</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Observe a proporção entre entradas, despesas pagas e o que ainda falta quitar
        </p>
      </div>
      <div id="chart-container" className={containerClasses}>
        {totals.hasData ? (
          <canvas id="financial-chart" ref={canvasRef} className="w-full h-full" />
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-center px-4">
            Sem dados por enquanto. Adicione uma renda ou despesa para ver a distribuição financeira.
          </p>
        )}
      </div>
    </section>
  );
}

export default ChartSection;