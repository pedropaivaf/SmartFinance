import React, { useRef, useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';

function SummaryCards({ totalIncome, totalExpense, totalPaid, balance, formatCurrency, cardOrder = [], onReorder }) {
  const { t } = useTranslation();
  const [draggingKey, setDraggingKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);

  const cardsByKey = {
    income: {
      id: 'total-income',
      title: t('cards.income.title'),
      value: totalIncome,
      description: t('cards.income.desc'),
      borderColor: 'border-l-[#1B4965] dark:border-l-[#5FA8D3]',
      valueClass: 'text-[#1B4965] dark:text-[#5FA8D3]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    expense: {
      id: 'total-expense',
      title: t('cards.expense.title'),
      value: totalExpense,
      description: t('cards.expense.desc'),
      borderColor: 'border-l-[#9B2226] dark:border-l-[#E76F51]',
      valueClass: 'text-[#9B2226] dark:text-[#E76F51]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
        </svg>
      ),
    },
    paid: {
      id: 'total-paid',
      title: t('cards.paid.title'),
      value: totalPaid,
      description: t('cards.paid.desc'),
      borderColor: 'border-l-[#2D6A4F] dark:border-l-[#52B788]',
      valueClass: 'text-[#2D6A4F] dark:text-[#52B788]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    balance: {
      id: 'balance',
      title: t('cards.balance.title'),
      value: balance,
      description: t('cards.balance.desc'),
      borderColor: 'border-l-[#1A1A1A] dark:border-l-[#E8E4DF]',
      valueClass:
        balance < 0 ? 'text-[#9B2226] dark:text-[#E76F51]' : 'text-[#1A1A1A] dark:text-[#E8E4DF]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const orderedKeys = cardOrder.length ? cardOrder : ['income', 'expense', 'paid', 'balance'];
  const activeDragKey = useRef(null);

  const reorderKeys = (sourceKey, targetKey) => {
    if (!onReorder || !sourceKey || !targetKey || sourceKey === targetKey) return;
    const current = orderedKeys.filter((item) => cardsByKey[item]);
    const sourceIndex = current.indexOf(sourceKey);
    const targetIndex = current.indexOf(targetKey);
    if (sourceIndex === -1 || targetIndex === -1) return;
    const next = [...current];
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, sourceKey);
    onReorder(next);
  };

  const handleDragStart = (event, key) => {
    activeDragKey.current = key;
    setDraggingKey(key);
    event.dataTransfer.setData('text/plain', key);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggingKey(null);
    setDragOverKey(null);
    activeDragKey.current = null;
  };

  const handleDragOver = (event, key) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (key !== draggingKey) setDragOverKey(key);
  };

  const handleDragLeave = () => setDragOverKey(null);

  const handleDrop = (event, targetKey) => {
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData('text/plain');
    reorderKeys(sourceKey, targetKey);
    setDraggingKey(null);
    setDragOverKey(null);
    activeDragKey.current = null;
  };

  const handleTouchStart = (key) => {
    activeDragKey.current = key;
    setDraggingKey(key);
    try { navigator.vibrate?.(10); } catch {}
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCard = element?.closest('[data-card-key]');
    const targetKey = targetCard?.dataset?.cardKey;
    if (targetKey && targetKey !== dragOverKey) setDragOverKey(targetKey);
    if (activeDragKey.current && targetKey) reorderKeys(activeDragKey.current, targetKey);
  };

  const handleTouchEnd = () => {
    activeDragKey.current = null;
    setDraggingKey(null);
    setDragOverKey(null);
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {orderedKeys.map((key, index) => {
        const card = cardsByKey[key];
        if (!card) return null;
        const isDragging = draggingKey === key;
        const isDragOver = dragOverKey === key && draggingKey !== key;

        return (
          <div
            key={card.id}
            data-card-key={key}
            className={`summary-card card-animate bg-white dark:bg-[#1E1D1C] border border-[#E8E5E0] dark:border-[#2D2B28] border-l-[3px] ${card.borderColor} p-4 rounded-2xl shadow-sm cursor-grab active:cursor-grabbing
              transition-all duration-300 ease-out
              ${isDragging ? 'scale-[1.06] opacity-50 shadow-lg rotate-[2deg] z-20 ring-2 ring-[#1B4965]/30 dark:ring-[#5FA8D3]/30' : ''}
              ${isDragOver ? 'ring-2 ring-[#1B4965]/40 dark:ring-[#5FA8D3]/40 ring-offset-2 dark:ring-offset-[#111110] scale-[1.02]' : ''}
              hover:shadow-md hover:-translate-y-0.5
            `}
            style={{ animationDelay: `${index * 60}ms` }}
            draggable
            onDragStart={(event) => handleDragStart(event, key)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => handleDragOver(event, key)}
            onDragLeave={handleDragLeave}
            onDrop={(event) => handleDrop(event, key)}
            onTouchStart={() => handleTouchStart(key)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            {/* Grip dots indicator */}
            <div className="flex justify-center mb-1.5 opacity-20 hover:opacity-40 transition-opacity">
              <div className="flex gap-[3px]">
                <div className="w-1 h-1 rounded-full bg-[#9B9B9B] dark:bg-[#6B6560]" />
                <div className="w-1 h-1 rounded-full bg-[#9B9B9B] dark:bg-[#6B6560]" />
                <div className="w-1 h-1 rounded-full bg-[#9B9B9B] dark:bg-[#6B6560]" />
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9B9B9B] dark:text-[#6B6560] mb-1">{card.title}</h3>
                <p id={card.id} className={`text-2xl font-display amount-value ${card.valueClass} tracking-tight`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={`${card.valueClass} opacity-30 flex-shrink-0 ml-2`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-[#9B9B9B] dark:text-[#6B6560] leading-relaxed">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
