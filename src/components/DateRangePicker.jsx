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
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const isFrom = isSameDay(date, rangeFrom);
    const isTo = isSameDay(date, rangeTo);
    const isSelected = isFrom || isTo;

    const effectiveTo = rangeTo || (rangeFrom && hoverDate && hoverDate > rangeFrom ? hoverDate : null);
    const inRange = isInRange(date, rangeFrom, effectiveTo);
    const isToday = isSameDay(date, today);

    cells.push(
      <button
        key={day}
        type="button"
        onClick={() => onDayClick(date)}
        onMouseEnter={() => onDayHover(date)}
        className={`relative h-10 w-full rounded-lg text-sm font-medium transition-all duration-150 min-h-[44px]
          ${isSelected ? 'bg-[#1B4965] dark:bg-[#5FA8D3] text-white shadow-sm' : ''}
          ${inRange && !isSelected ? 'bg-[#E8F0F4] dark:bg-[#1B2B35] text-[#1B4965] dark:text-[#5FA8D3]' : ''}
          ${!isSelected && !inRange ? 'hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF]' : ''}
          ${isToday && !isSelected ? 'ring-1 ring-[#1B4965] dark:ring-[#5FA8D3]' : ''}
        `}
      >
        {day}
      </button>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-[#1A1A1A] dark:text-[#E8E4DF] text-center mb-3">
        {MONTHS_PT[month]} {year}
      </h4>
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {WEEKDAYS_PT.map((wd) => (
          <div key={wd} className="text-center text-[10px] font-medium text-[#9B9B9B] dark:text-[#6B6560] py-1">
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
  const [selecting, setSelecting] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);
  const [viewDate, setViewDate] = useState(() => new Date());

  const secondMonth = useMemo(() => {
    const d = new Date(viewDate);
    d.setMonth(d.getMonth() + 1);
    return d;
  }, [viewDate]);

  const handleDayClick = (date) => {
    if (!selecting) {
      setSelecting({ from: date });
    } else {
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

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
      setSelecting(null);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition
          ${hasRange
            ? 'bg-[#E8F0F4] text-[#1B4965] dark:bg-[#1B2B35] dark:text-[#5FA8D3] ring-1 ring-[#1B4965]/30 dark:ring-[#5FA8D3]/30'
            : 'bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28]'
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
        <div
          className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
          onClick={handleOverlayClick}
        >
          <div className="modal-container animate-slide-up w-full sm:max-w-md bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-[#1E1D1C] z-10 flex justify-between items-center px-6 pt-6 pb-4 border-b border-[#E8E5E0] dark:border-[#2D2B28]">
              <div>
                <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF]">Selecionar Período</h2>
                <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560] mt-0.5">
                  {selecting ? 'Selecione a data final' : 'Selecione a data inicial'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setIsOpen(false); setSelecting(null); }}
                className="p-2 -mr-2 rounded-full text-[#9B9B9B] hover:text-[#1A1A1A] dark:hover:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
              {/* Month navigation */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <button type="button" onClick={prevMonth} className="p-2 rounded-xl hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B6B6B] dark:text-[#A09A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                {hasRange && (
                  <span className="text-xs text-[#1B4965] dark:text-[#5FA8D3] font-medium">
                    {formatShortDate(dateRange.from)} — {formatShortDate(dateRange.to)}
                  </span>
                )}
                <button type="button" onClick={nextMonth} className="p-2 rounded-xl hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition min-h-[44px] min-w-[44px] flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#6B6B6B] dark:text-[#A09A92]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Calendar grids */}
              <div className="px-6 pb-2">
                <div className="flex flex-col sm:flex-row gap-6">
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
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[#E8E5E0] dark:border-[#2D2B28]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
              <button
                type="button"
                onClick={handleClear}
                className="w-full py-3 rounded-xl bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold text-sm hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition min-h-[44px]"
              >
                Limpar Período
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DateRangePicker;
