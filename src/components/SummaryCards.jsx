import React, { useRef } from 'react';
import { useTranslation } from '../i18n/index.jsx';

function SummaryCards({ totalIncome, totalExpense, totalPaid, balance, formatCurrency, cardOrder = [], onReorder }) {
  const { t } = useTranslation();

  const cardsByKey = {
    income: {
      id: 'total-income',
      title: t('cards.income.title'),
      value: totalIncome,
      description: t('cards.income.desc'),
      containerClass: 'bg-gradient-to-br from-blue-50/90 to-blue-100/60 dark:from-blue-950/50 dark:to-blue-900/30',
      valueClass: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-400/60 dark:text-blue-500/40',
      glowClass: 'shadow-blue-200/50 dark:shadow-blue-800/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
        </svg>
      ),
    },
    expense: {
      id: 'total-expense',
      title: t('cards.expense.title'),
      value: totalExpense,
      description: t('cards.expense.desc'),
      containerClass: 'bg-gradient-to-br from-red-50/90 to-rose-100/60 dark:from-red-950/50 dark:to-red-900/30',
      valueClass: 'text-red-700 dark:text-red-300',
      iconColor: 'text-red-400/60 dark:text-red-500/40',
      glowClass: 'shadow-red-200/50 dark:shadow-red-800/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
        </svg>
      ),
    },
    paid: {
      id: 'total-paid',
      title: t('cards.paid.title'),
      value: totalPaid,
      description: t('cards.paid.desc'),
      containerClass: 'bg-gradient-to-br from-emerald-50/90 to-green-100/60 dark:from-emerald-950/50 dark:to-emerald-900/30',
      valueClass: 'text-emerald-700 dark:text-emerald-300',
      iconColor: 'text-emerald-400/60 dark:text-emerald-500/40',
      glowClass: 'shadow-emerald-200/50 dark:shadow-emerald-800/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    balance: {
      id: 'balance',
      title: t('cards.balance.title'),
      value: balance,
      description: t('cards.balance.desc'),
      containerClass: 'bg-gradient-to-br from-slate-50/90 to-slate-100/60 dark:from-slate-800/60 dark:to-slate-700/30',
      valueClass:
        balance < 0 ? 'text-red-600 dark:text-red-400' : 'text-slate-800 dark:text-slate-100',
      iconColor: 'text-slate-400/60 dark:text-slate-500/40',
      glowClass: 'shadow-slate-200/50 dark:shadow-slate-800/30',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const orderedKeys = cardOrder.length ? cardOrder : ['income', 'expense', 'paid', 'balance'];

  const activeDragKey = useRef(null);

  const reorderKeys = (sourceKey, targetKey) => {
    if (!onReorder || !sourceKey || !targetKey || sourceKey === targetKey) {
      return;
    }
    const current = orderedKeys.filter((item) => cardsByKey[item]);
    const sourceIndex = current.indexOf(sourceKey);
    const targetIndex = current.indexOf(targetKey);
    if (sourceIndex === -1 || targetIndex === -1) {
      return;
    }
    const next = [...current];
    next.splice(sourceIndex, 1);
    next.splice(targetIndex, 0, sourceKey);
    onReorder(next);
  };

  const handleDragStart = (event, key) => {
    activeDragKey.current = key;
    event.dataTransfer.setData('text/plain', key);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event, targetKey) => {
    event.preventDefault();
    const sourceKey = event.dataTransfer.getData('text/plain');
    reorderKeys(sourceKey, targetKey);
    activeDragKey.current = null;
  };

  const handleTouchStart = (key) => {
    activeDragKey.current = key;
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCard = element?.closest('[data-card-key]');
    const targetKey = targetCard?.dataset?.cardKey;
    if (activeDragKey.current && targetKey) {
      reorderKeys(activeDragKey.current, targetKey);
    }
  };

  const handleTouchEnd = () => {
    activeDragKey.current = null;
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {orderedKeys.map((key, index) => {
        const card = cardsByKey[key];
        if (!card) return null;
        return (
          <div
            key={card.id}
            data-card-key={key}
            className={`summary-card card-animate ${card.containerClass} p-4 rounded-2xl shadow-md ${card.glowClass} cursor-move backdrop-blur-sm`}
            style={{ animationDelay: `${index * 60}ms` }}
            draggable
            onDragStart={(event) => handleDragStart(event, key)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, key)}
            onTouchStart={() => handleTouchStart(key)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">{card.title}</h3>
                <p id={card.id} className={`text-2xl font-bold amount-value ${card.valueClass} tracking-tight`}>
                  {formatCurrency(card.value)}
                </p>
              </div>
              <div className={`${card.iconColor} flex-shrink-0 ml-2`}>
                {card.icon}
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
