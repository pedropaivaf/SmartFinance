import React, { useMemo } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import { getCategoryById } from '../data/categories';
import { dotBg } from './CategoryPicker';

function TransactionList({ transactions, onTogglePaid, onEdit, onDelete, formatCurrency, customCategories = [] }) {
  const { t, lang } = useTranslation();

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(lang === 'pt-BR' ? 'pt-BR' : lang, { month: 'long', year: 'numeric' }),
    [lang]
  );

  const paymentLabels = {
    pix: t('list.paymentMethods.pix'),
    debit: t('list.paymentMethods.debit'),
    credit: t('list.paymentMethods.credit'),
    cash: t('list.paymentMethods.cash'),
  };

  const groupedTransactions = useMemo(() => {
    const groups = new Map();

    transactions.forEach((transaction) => {
      const date = new Date(transaction.createdAt);
      if (Number.isNaN(date.getTime())) return;
      const key = monthFormatter.format(date);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(transaction);
    });

    const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
      const dateA = new Date(groups.get(a)[0].createdAt);
      const dateB = new Date(groups.get(b)[0].createdAt);
      return new Date(dateA.getFullYear(), dateA.getMonth()) - new Date(dateB.getFullYear(), dateB.getMonth());
    });

    return sortedKeys.map((key) => ({
      key,
      items: groups.get(key).slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
    }));
  }, [transactions, monthFormatter]);

  if (!transactions.length) {
    return (
      <div id="transaction-list-container" className="flex-grow overflow-y-auto pr-2">
        <ul id="transaction-list" className="space-y-1">
          <li id="empty-state" className="text-center py-10">
            <svg className="mx-auto h-12 w-12 text-[#9B9B9B] dark:text-[#6B6560]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5 6.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium font-serif text-[#1A1A1A] dark:text-[#E8E4DF]">{t('list.empty.title')}</h3>
            <p className="mt-1 text-sm text-[#6B6B6B] dark:text-[#A09A92]">{t('list.empty.subtitle')}</p>
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
              <h3 className="text-md font-semibold font-serif text-[#6B6B6B] dark:text-[#A09A92] tracking-wider capitalize">{key}</h3>
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

              return (
                <li
                  key={transaction.id}
                  data-id={transaction.id}
                  data-group-id={transaction.groupId || undefined}
                  className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between p-3 bg-[#F4F3EF] dark:bg-[#1A1918] rounded-lg list-item-enter gap-x-2 gap-y-1 ${
                    transaction.paid ? 'transaction-paid' : ''
                  } ${isProjection ? 'transaction-projection' : ''}`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {!isIncome ? (
                      <input
                        type="checkbox"
                        className="transaction-paid-checkbox h-5 w-5 rounded border-[#D4D0C8] dark:border-[#3A3835] text-[#1B4965] focus:ring-[#1B4965] cursor-pointer flex-shrink-0"
                        data-id={transaction.id}
                        checked={Boolean(transaction.paid)}
                        onChange={(event) => onTogglePaid(transaction, event.target.checked)}
                      />
                    ) : (
                      <div className="h-5 w-5 flex-shrink-0" />
                    )}
                    <span className={`p-2 rounded-full ${isIncome ? 'bg-[#E8F0F4] dark:bg-[#1B2B35]' : 'bg-red-200/70 dark:bg-red-900/60'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isIncome ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B2226] dark:text-[#E76F51]'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        {isIncome
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
                        }
                      </svg>
                    </span>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-[#1A1A1A] dark:text-[#E8E4DF] flex items-center gap-2 description-text truncate">
                        {transaction.description}
                        {transaction.recurrence === 'monthly' && !isProjection && (
                          <span className="text-xs flex-shrink-0 font-medium bg-[#E8F0F4] text-[#1B4965] dark:bg-[#1B2B35] dark:text-[#5FA8D3] px-2 py-0.5 rounded-full">
                            {t('list.badge.recurring')}
                          </span>
                        )}
                        {isProjection && (
                          <span className="text-xs flex-shrink-0 font-medium bg-[#F4F3EF] text-[#6B6B6B] dark:bg-[#2D2B28] dark:text-[#A09A92] px-2 py-0.5 rounded-full">
                            {t('list.badge.projection')}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
                        {new Date(transaction.createdAt).toLocaleDateString(lang === 'pt-BR' ? 'pt-BR' : lang)}
                      </p>
                      {paymentLabel && (
                        <p className="text-xs text-[#6B6B6B] dark:text-[#A09A92] mt-0.5">
                          {t('list.paidWith')} {paymentLabel}{creditInfo}
                        </p>
                      )}
                      {transaction.category && (() => {
                        const cat = getCategoryById(transaction.category, customCategories);
                        if (!cat) return null;
                        const dot = dotBg[cat.color] || dotBg.slate;
                        return (
                          <span className="inline-flex items-center gap-1.5 text-xs text-[#6B6B6B] dark:text-[#A09A92] mt-0.5">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                            {cat.label || t(`categories.${transaction.category}`)}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                    <p className={`font-semibold font-serif text-lg ${isIncome ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B2226] dark:text-[#E76F51]'} text-right whitespace-nowrap`}>
                      {`${sign} ${formatCurrency(amount)}`}
                    </p>
                    <div className={`flex items-center ${isProjection ? 'hidden' : ''} gap-1`}>
                      <button
                        type="button"
                        className="edit-btn p-2 rounded-lg text-[#6B6B6B] hover:text-[#1B4965] dark:hover:text-[#5FA8D3] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition-colors"
                        onClick={() => onEdit(transaction)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="delete-btn p-2 rounded-lg text-[#6B6B6B] hover:text-[#9B2226] dark:hover:text-[#E76F51] hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] transition-colors"
                        onClick={() => onDelete(transaction)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
