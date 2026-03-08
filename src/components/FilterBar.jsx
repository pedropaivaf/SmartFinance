import React from 'react';
import DateRangePicker from './DateRangePicker.jsx';

function FilterBar({ currentFilter, onChange, dateRange, onDateRangeChange }) {
  const handleClick = (event) => {
    const filter = event.currentTarget.dataset.filter;
    onChange(filter);
    if (filter !== 'range' && onDateRangeChange) {
      onDateRangeChange({ from: null, to: null });
    }
  };

  const handleDateRangeChange = (range) => {
    if (onDateRangeChange) onDateRangeChange(range);
    if (range.from && range.to) {
      onChange('range');
    } else {
      onChange('month');
    }
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
          className={`filter-btn px-3 py-1.5 text-sm font-medium rounded-lg transition ${
            currentFilter === 'month'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Mês
        </button>
        <button
          type="button"
          data-filter="total"
          onClick={handleClick}
          className={`filter-btn px-3 py-1.5 text-sm font-medium rounded-lg transition ${
            currentFilter === 'total'
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          Total
        </button>
        <DateRangePicker
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
      </div>
    </div>
  );
}

export default FilterBar;
