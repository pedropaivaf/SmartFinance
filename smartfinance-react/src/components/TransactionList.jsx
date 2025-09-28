import React, { useMemo } from 'react';

const monthNames = [
  'janeiro',
  'fevereiro',
  'marÃ§o',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

const paymentLabels = {
  pix: 'Pix',
  debit: 'DÃ©bito',
  credit: 'CrÃ©dito',
  cash: 'Dinheiro',
};

const monthFormatter = new Intl.DateTimeFormat('pt-BR', {
  month: 'long',
  year: 'numeric',
});

function normalizeMonthKey(label) {
  if (!label) return label;
  const [month, year] = label.split(' de ');
  const normalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
  return `${normalizedMonth} de ${year}`;
}

function TransactionList({ transactions, onTogglePaid, onEdit, onDelete, formatCurrency }) {
  const groupedTransactions = useMemo(() => {
    const groups = new Map();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      if (Number.isNaN(date.getTime())) {
        return;
      }
      const rawLabel = monthFormatter.format(date);
      const key = normalizeMonthKey(rawLabel);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(transaction);
    });

    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      const [monthA, yearA] = a.split(' de ');
      const [monthB, yearB] = b.split(' de ');
      const indexA = monthNames.indexOf(monthA.toLowerCase());
      const indexB = monthNames.indexOf(monthB.toLowerCase());
      const dateA = new Date(parseInt(yearA, 10), indexA === -1 ? 0 : indexA);
      const dateB = new Date(parseInt(yearB, 10), indexB === -1 ? 0 : indexB);
      return dateA - dateB;
    });

    return sortedKeys.map((key) => ({
      key,
      items: groups
        .get(key)
        .slice()
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
  }, [transactions]);

  if (!transactions.length) {
    return (
      <div id="transaction-list-container" className="flex-grow overflow-y-auto pr-2">
        <ul id="transaction-list" className="space-y-1">
          <li id="empty-state" className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-200">Nenhuma Transação</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Comece adicionando uma renda ou despesa</p>
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div id="transaction-list-container" className="flex-grow overflow-y-auto pr-2">
      <ul id="transaction-list" className="space-y-1">
        {groupedTransactions.map(({ key, items }) => (
          <React.Fragment key={key}>
            <li className="pt-4 pb-2">
              <h3 className="text-md font-semibold text-slate-500 dark:text-slate-400 tracking-wider">{key}</h3>
            </li>
            {items.map((transaction) => {
              const isIncome = transaction.type === 'income';
              const isProjection = Boolean(transaction.isProjection);
              const sign = isIncome ? '+' : '-';
              const amount = Math.abs(transaction.amount);
              const paymentLabel = transaction.paid && transaction.paymentMethod
                ? paymentLabels[transaction.paymentMethod] || 'N/A'
                : null;
              const creditInfo = transaction.paymentMethod === 'credit' && transaction.creditCardName
                ? ` (${transaction.creditCardName})`
                : '';

              const projectionDetails = isProjection ? JSON.stringify(transaction) : undefined;

              return (
                <li
                  key={transaction.id}
                  data-id={transaction.id}
                  data-projection-details={projectionDetails}
                  data-group-id={transaction.groupId || undefined}
                  className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg list-item-enter gap-x-2 gap-y-1 ${
                    transaction.paid ? 'transaction-paid' : ''
                  } ${isProjection ? 'transaction-projection' : ''}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {!isIncome ? (
                      <input
                        type="checkbox"
                        className="transaction-paid-checkbox h-5 w-5 rounded border-slate-400 dark:border-slate-500 text-blue-600 focus:ring-blue-500 cursor-pointer flex-shrink-0"
                        data-id={transaction.id}
                        checked={Boolean(transaction.paid)}
                        onChange={(event) => onTogglePaid(transaction, event.target.checked)}
                      />
                    ) : (
                      <div className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span
                      className={`p-2 rounded-full ${
                        isIncome ? 'bg-blue-200/70 dark:bg-blue-900/60' : 'bg-red-200/70 dark:bg-red-900/60'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-6 w-6 ${isIncome ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        {isIncome ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                        )}
                      </svg>
                    </span>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2 description-text truncate">
                        {transaction.description}
                        {transaction.recurrence === 'monthly' && !isProjection ? (
                          <span className="text-xs flex-shrink-0 font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-200 px-2 py-0.5 rounded-full">
                            Recorrente
                          </span>
                        ) : null}
                        {isProjection ? (
                          <span className="text-xs flex-shrink-0 font-medium bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                            Projeção
                          </span>
                        ) : null}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                      {paymentLabel ? (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Pago com: {paymentLabel}
                          {creditInfo}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <p
                      className={`font-semibold text-lg ${
                        isIncome ? 'text-blue-700 dark:text-blue-400' : 'text-red-700 dark:text-red-400'
                      } text-right whitespace-nowrap sm:text-right`}
                    >
                      {`${sign} ${formatCurrency(amount)}`}
                    </p>
                    <div className={`flex items-center ${isProjection ? 'invisible' : ''} gap-1`}>
                      <button
                        type="button"
                        className="edit-btn p-2 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => onEdit(transaction)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="delete-btn p-2 rounded-lg text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        onClick={() => onDelete(transaction)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
}

export default TransactionList;


