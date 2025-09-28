import React from 'react';

const tabs = [
  { value: 'all', label: 'Todos' },
  { value: 'pix', label: 'Pix' },
  { value: 'debit', label: 'Débito' },
  { value: 'credit', label: 'Crédito' },
  { value: 'cash', label: 'Dinheiro' },
];

function PaymentTabs({ currentPaymentFilter, onChange }) {
  const handleClick = (event) => {
    const filter = event.currentTarget.dataset.paymentFilter;
    onChange(filter);
  };

  return (
    <div id="payment-tabs-container" className="border-b border-slate-200 dark:border-slate-700 pb-2">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
        Explore os lançamentos por tipo de pagamento
      </p>
      <nav className="-mb-px flex gap-4 text-sm font-medium overflow-x-auto" aria-label="Filtro por método de pagamento">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            data-payment-filter={tab.value}
            onClick={handleClick}
            className={`payment-tab whitespace-nowrap py-2 px-1 border-b-2 font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 border-transparent ${
              currentPaymentFilter === tab.value ? 'active' : ''
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

export default PaymentTabs;