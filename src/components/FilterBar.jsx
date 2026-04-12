import React from 'react';
import DateRangePicker from './DateRangePicker.jsx';
import { useTranslation } from '../i18n/index.jsx';

function FilterBar({ currentFilter, onChange, dateRange, onDateRangeChange, showTitle = true }) {
  const { t } = useTranslation();

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

  const filterBtnClass = (filter) =>
    `filter-btn px-3 py-1.5 text-sm font-medium rounded-lg transition ${
      currentFilter === filter
        ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm'
        : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
    }`;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      {showTitle && (
        <div>
          <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">{t('page.history.title')}</h2>
        </div>
      )}
      <div id="filter-container" className="flex items-center gap-2 flex-wrap">
        <button type="button" data-filter="month" onClick={handleClick} className={filterBtnClass('month')}>
          {t('filter.month')}
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
