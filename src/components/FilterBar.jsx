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
        <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-[#E8E4DF]">Histórico de transações</h2>
        <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
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
              ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm'
              : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
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
              ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm'
              : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
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
