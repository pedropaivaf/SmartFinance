import React from 'react';

function FilterBar({ currentFilter, onChange }) {
  const handleClick = (event) => {
    const filter = event.currentTarget.dataset.filter;
    onChange(filter);
  };

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Histórico de transações</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analise os lançamentos do mês atual ou visualize todo o histórico registrado
        </p>
      </div>
      <div id="filter-container" className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          data-filter="month"
          onClick={handleClick}
          className={`filter-btn px-3 py-1 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition ${
            currentFilter === 'month' ? 'active' : ''
          }`}
        >
          Mês
        </button>
        <button
          type="button"
          data-filter="total"
          onClick={handleClick}
          className={`filter-btn px-3 py-1 text-sm font-medium rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 transition ${
            currentFilter === 'total' ? 'active' : ''
          }`}
        >
          Total
        </button>
      </div>
    </div>
  );
}

export default FilterBar;