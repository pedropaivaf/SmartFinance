import React, { useRef } from 'react';

function SummaryCards({ totalIncome, totalExpense, totalPaid, balance, formatCurrency, cardOrder = [], onReorder }) {
  const cardsByKey = {
    income: {
      id: 'total-income',
      title: 'Renda Total',
      value: totalIncome,
      description: 'Somatório de todas as entradas registradas no período atual.',
      containerClass: 'bg-blue-100/60 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800',
      valueClass: 'text-blue-900 dark:text-blue-100',
    },
    expense: {
      id: 'total-expense',
      title: 'Despesa Total',
      value: totalExpense,
      description: 'Inclui despesas pagas e pendentes para que você saiba o custo total.',
      containerClass: 'bg-red-100/60 dark:bg-red-900/40 border border-red-200 dark:border-red-800',
      valueClass: 'text-red-900 dark:text-red-100',
    },
    paid: {
      id: 'total-paid',
      title: 'Pagos',
      value: totalPaid,
      description: 'Tudo o que já saiu da conta considerando a forma de pagamento escolhida.',
      containerClass: 'bg-green-100/60 dark:bg-green-900/40 border border-green-200 dark:border-green-800',
      valueClass: 'text-green-900 dark:text-green-100',
    },
    balance: {
      id: 'balance',
      title: 'Saldo Atual',
      value: balance,
      description: 'Resultado entre rendas e despesas pagas. Negativo indica atenção imediata.',
      containerClass: 'bg-slate-200/60 dark:bg-slate-700/60 border border-slate-300 dark:border-slate-600',
      valueClass:
        balance < 0 ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-slate-100',
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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {orderedKeys.map((key) => {
        const card = cardsByKey[key];
        if (!card) return null;
        return (
          <div
            key={card.id}
            data-card-key={key}
            className={`${card.containerClass} p-4 rounded-lg shadow-sm cursor-move active:scale-[0.99] transition`}
            draggable
            onDragStart={(event) => handleDragStart(event, key)}
            onDragOver={handleDragOver}
            onDrop={(event) => handleDrop(event, key)}
            onTouchStart={() => handleTouchStart(key)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">{card.title}</h3>
            <p id={card.id} className={`text-2xl font-semibold ${card.valueClass}`}>
              {formatCurrency(card.value)}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{card.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default SummaryCards;
