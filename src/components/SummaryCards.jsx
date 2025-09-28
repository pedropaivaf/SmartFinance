import React from 'react';

function SummaryCards({ totalIncome, totalExpense, totalPaid, balance, formatCurrency }) {
  const cards = [
    {
      id: 'total-income',
      title: 'Renda Total',
      value: totalIncome,
      description: 'Somatório de todas as entradas registradas no período atual.',
      containerClass: 'bg-blue-100/60 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800',
      valueClass: 'text-blue-900 dark:text-blue-100',
    },
    {
      id: 'total-expense',
      title: 'Despesa Total',
      value: totalExpense,
      description: 'Inclui despesas pagas e pendentes para que você saiba o custo total.',
      containerClass: 'bg-red-100/60 dark:bg-red-900/40 border border-red-200 dark:border-red-800',
      valueClass: 'text-red-900 dark:text-red-100',
    },
    {
      id: 'total-paid',
      title: 'Pagos',
      value: totalPaid,
      description: 'Tudo o que já saiu da conta considerando a forma de pagamento escolhida.',
      containerClass: 'bg-green-100/60 dark:bg-green-900/40 border border-green-200 dark:border-green-800',
      valueClass: 'text-green-900 dark:text-green-100',
    },
    {
      id: 'balance',
      title: 'Saldo Atual',
      value: balance,
      description: 'Resultado entre rendas e despesas pagas. Negativo indica atenção imediata.',
      containerClass: 'bg-slate-200/60 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600',
      valueClass:
        balance < 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map(({ id, title, value, description, containerClass, valueClass }) => (
        <div key={id} className={`${containerClass} p-4 rounded-lg shadow-sm`}>
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</h3>
          <p id={id} className={`text-2xl font-semibold ${valueClass}`}>
            {formatCurrency(value)}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;