import React, { useState, useMemo, useRef, useEffect } from 'react';

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date, from, to) {
  if (!from || !to) return false;
  const time = date.getTime();
  return time > from.getTime() && time < to.getTime();
}

function MonthGrid({ year, month, rangeFrom, rangeTo, hoverDate, onDayClick, onDayHover }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isFrom = isSameDay(date, rangeFrom);
    const isTo = isSameDay(date, rangeTo);
    const isSelected = isFrom || isTo;

    // For highlighting range preview during selection
    const effectiveTo = rangeTo || (rangeFrom && hoverDate && hoverDate > rangeFrom ? hoverDate : null);
    const inRange = isInRange(date, rangeFrom, effectiveTo);
    const isToday = isSameDay(date, today);

    cells.push(
      <button
        key={day}
        type="button"
        onClick={() => onDayClick(date)}
        onMouseEnter={() => onDayHover(date)}
        className={`relative h-9 w-full rounded-lg text-sm font-medium transition-all duration-150
          ${isSelected ? 'bg-sky-500 text-white shadow-sm' : ''}
          ${inRange && !isSelected ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' : ''}
          ${!isSelected && !inRange ? 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300' : ''}
          ${isToday && !isSelected ? 'ring-1 ring-sky-400' : ''}
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 text-center mb-3">
        {MONTHS_PT[month]} {year}
      </h4>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS_PT.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500 py-1">
            {wd}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells}
      </div>
    </div>
  );
}

function DateRangePicker({ dateRange, onDateRangeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selecting, setSelecting] = useState(null); // null | { from: Date }
  const [hoverDate, setHoverDate] = useState(null);
  const [viewDate, setViewDate] = useState(() => new Date());
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
        setSelecting(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const secondMonth = useMemo(() => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [viewDate]);

  const handleDayClick = (date) => {
    if (!selecting) {
      // First click — set start date
      setSelecting({ from: date });
    } else {
      // Second click — set end date
      let from = selecting.from;
      let to = date;
      if (to < from) {
        [from, to] = [to, from];
      }
      onDateRangeChange({ from, to });
      setSelecting(null);
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    onDateRangeChange({ from: null, to: null });
    setSelecting(null);
    setIsOpen(false);
  };

  const prevMonth = () => {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() - 1);
      return n;
    });
  };

  const nextMonth = () => {
    setViewDate((d) => {
      const n = new Date(d);
      n.setMonth(n.getMonth() + 1);
      return n;
    });
  };

  const rangeFrom = selecting ? selecting.from : dateRange?.from || null;
  const rangeTo = selecting ? null : dateRange?.to || null;
  const hasRange = dateRange?.from && dateRange?.to;

  const formatShortDate = (d) => {
    if (!d) return '';
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition
          ${hasRange
            ? 'bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300 ring-1 ring-sky-300 dark:ring-sky-700'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
          }
        `}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {hasRange ? (
          <span>{formatShortDate(dateRange.from)} — {formatShortDate(dateRange.to)}</span>
        ) : (
          <span>Período</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 w-[300px] sm:w-[580px]">
          {/* Header nav */}
          <div className="flex items-center justify-between mb-4">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {selecting ? 'Selecione a data final' : 'Selecione a data inicial'}
            </p>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar grids */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex-1">
              <MonthGrid
                year={viewDate.getFullYear()}
                month={viewDate.getMonth()}
                rangeFrom={rangeFrom}
                rangeTo={rangeTo}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
              />
            </div>
            <div className="hidden sm:block flex-1">
              <MonthGrid
                year={secondMonth.getFullYear()}
                month={secondMonth.getMonth()}
                rangeFrom={rangeFrom}
                rangeTo={rangeTo}
                hoverDate={hoverDate}
                onDayClick={handleDayClick}
                onDayHover={setHoverDate}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
            >
              Limpar
            </button>
            {hasRange && (
              <span className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                {formatShortDate(dateRange.from)} — {formatShortDate(dateRange.to)}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
