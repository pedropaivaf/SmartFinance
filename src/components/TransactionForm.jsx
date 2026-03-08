import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '../i18n/index.jsx';
import CategoryPicker from './CategoryPicker';
import { getCategoryById } from '../data/categories';
import { dotBg } from './CategoryPicker';

const formatDate = (date) => date.toISOString().split('T')[0];

const inputBase =
  'w-full block text-sm px-3 py-3 rounded-xl border border-slate-300/80 dark:border-slate-700 ' +
  'bg-white/90 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ' +
  'placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 ' +
  'focus:ring-sky-500 focus:border-sky-500 transition leading-tight';

function TransactionForm({ onAddTransactions, onClearAll, customCategories = [], onAddCustomCategory }) {
  const { t } = useTranslation();
  const today = useMemo(() => formatDate(new Date()), []);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(today);
  const [recurrence, setRecurrence] = useState('single');
  const [installments, setInstallments] = useState('');
  const [installmentStartDate, setInstallmentStartDate] = useState(today);
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('');
  const [categoryPickerOpen, setCategoryPickerOpen] = useState(false);
  const [prepaidPaymentMethod, setPrepaidPaymentMethod] = useState('pix');

  useEffect(() => {
    setTransactionDate(today);
    setInstallmentStartDate(today);
  }, [today]);

  const isInstallment = recurrence === 'installment';
  const showPaidInstallments = isInstallment && type === 'expense';

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setType('income');
    setCategory('');
    setRecurrence('single');
    setInstallments('');
    setPaidInstallments('0');
    setPrepaidPaymentMethod('pix');
    const current = formatDate(new Date());
    setTransactionDate(current);
    setInstallmentStartDate(current);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) return;

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert(t('form.alert.invalidAmount'));
      return;
    }

    const selectedDate = new Date(`${transactionDate}T12:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      alert(t('form.alert.invalidDate'));
      return;
    }

    const newTransactions = [];

    if (isInstallment && type === 'expense') {
      const totalInstallments = parseInt(installments, 10);
      const paidInstallmentsCount = parseInt(paidInstallments, 10) || 0;
      const startDate = new Date(`${installmentStartDate}T12:00:00`);

      if (Number.isNaN(startDate.getTime())) {
        alert(t('form.alert.invalidInstallmentDate'));
        return;
      }
      if (!Number.isInteger(totalInstallments) || totalInstallments < 2) {
        alert(t('form.alert.minInstallments'));
        return;
      }
      if (paidInstallmentsCount > totalInstallments) {
        alert(t('form.alert.paidExceedsTotal'));
        return;
      }

      const installmentAmount = -Math.abs(numericAmount) / totalInstallments;
      const groupId = Date.now().toString();

      for (let index = 0; index < totalInstallments; index += 1) {
        const installmentDate = new Date(startDate);
        installmentDate.setMonth(installmentDate.getMonth() + index);
        const isPaid = index < paidInstallmentsCount;

        newTransactions.push({
          id: `${groupId}-${index}`,
          groupId,
          description: `${trimmedDescription} (${index + 1}/${totalInstallments})`,
          amount: installmentAmount,
          type: 'expense',
          category: category || '',
          createdAt: installmentDate.toISOString(),
          recurrence: 'installment',
          paid: isPaid,
          paymentMethod: isPaid ? prepaidPaymentMethod : null,
          creditCardName: null,
        });
      }
    } else {
      const transactionBaseDate = recurrence === 'single' ? selectedDate : new Date();
      const signedAmount = type === 'expense' ? -Math.abs(numericAmount) : Math.abs(numericAmount);

      newTransactions.push({
        id: Date.now().toString(),
        description: trimmedDescription,
        amount: signedAmount,
        type,
        category: category || '',
        createdAt: transactionBaseDate.toISOString(),
        recurrence,
        paid: false,
        paymentMethod: null,
        creditCardName: null,
      });
    }

    onAddTransactions(newTransactions);
    resetForm();
  };

  return (
    <>
      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('form.title')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('form.subtitle')}</p>
      </div>
      <form id="transaction-form" className="mt-4 space-y-3" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
            {t('form.description.label')}
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder={t('form.description.placeholder')}
            className={inputBase}
            required
            aria-describedby="description-helper"
          />
          <p id="description-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('form.description.helper')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
            {t('form.category.label')}
          </label>
          <button
            type="button"
            onClick={() => setCategoryPickerOpen(true)}
            className={`${inputBase} flex items-center gap-2 text-left`}
          >
            {category ? (() => {
              const cat = getCategoryById(category, customCategories);
              const dot = dotBg[cat?.color] || dotBg.slate;
              return (
                <>
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span>{cat?.label || t(`categories.${category}`)}</span>
                </>
              );
            })() : (
              <span className="text-slate-400 dark:text-slate-500">{t('form.category.placeholder')}</span>
            )}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('form.category.helper')}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('form.amount.label')}
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder={t('form.amount.placeholder')}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className={inputBase}
              required
              aria-describedby="amount-helper"
            />
            <p id="amount-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('form.amount.helper')}
            </p>
          </div>
          <div>
            <label htmlFor="transaction-date" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('form.date.label')}
            </label>
            <input
              id="transaction-date"
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              className={`${inputBase} text-left`}
              style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
              required
              aria-describedby="date-helper"
            />
            <p id="date-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('form.date.helper')}
            </p>
          </div>
        </div>
        <div>
          <label htmlFor="recurrence" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
            {t('form.recurrence.label')}
          </label>
          <select
            id="recurrence"
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value)}
            className={inputBase}
            aria-describedby="recurrence-helper"
          >
            <option value="single">{t('form.recurrence.single')}</option>
            <option value="monthly">{t('form.recurrence.monthly')}</option>
            <option value="installment">{t('form.recurrence.installment')}</option>
          </select>
          <p id="recurrence-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('form.recurrence.helper')}
          </p>
        </div>
        {isInstallment && (
          <div className="space-y-4">
            <div>
              <label htmlFor="installments" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                {t('form.installments.label')}
              </label>
              <input
                id="installments"
                type="number"
                min="2"
                value={installments}
                onChange={(event) => setInstallments(event.target.value)}
                placeholder="Ex.: 6"
                className={inputBase}
                required
              />
            </div>
            <div>
              <label htmlFor="installment-start-date" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                {t('form.installments.start')}
              </label>
              <input
                id="installment-start-date"
                type="date"
                value={installmentStartDate}
                onChange={(event) => setInstallmentStartDate(event.target.value)}
                className={`${inputBase} text-left`}
                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('form.installments.startHelper')}
              </p>
            </div>
          </div>
        )}
        {showPaidInstallments && (
          <div>
            <label htmlFor="paid-installments" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('form.installments.paid')}
            </label>
            <input
              id="paid-installments"
              type="number"
              min="0"
              value={paidInstallments}
              onChange={(event) => setPaidInstallments(event.target.value)}
              placeholder="Ex.: 2"
              className={inputBase}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('form.installments.paidHelper')}
            </p>
          </div>
        )}
        {showPaidInstallments && parseInt(paidInstallments, 10) > 0 && (
          <div>
            <label htmlFor="prepaid-payment-method" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              {t('form.installments.paymentMethod') || 'Metodo de pagamento das parcelas pagas'}
            </label>
            <select
              id="prepaid-payment-method"
              value={prepaidPaymentMethod}
              onChange={(event) => setPrepaidPaymentMethod(event.target.value)}
              className={inputBase}
            >
              <option value="pix">Pix</option>
              <option value="debit">{t('list.paymentMethods.debit') || 'Debito'}</option>
              <option value="credit">{t('list.paymentMethods.credit') || 'Credito'}</option>
              <option value="cash">{t('list.paymentMethods.cash') || 'Dinheiro'}</option>
            </select>
          </div>
        )}
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4" aria-label={t('form.type.legend')}>
          <legend className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {t('form.type.legend')}
          </legend>
          <div className="custom-radio custom-radio-expense">
            <input
              id="type-expense"
              type="radio"
              name="type"
              value="expense"
              className="sr-only"
              checked={type === 'expense'}
              onChange={() => setType('expense')}
            />
            <label
              htmlFor="type-expense"
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 12H6" />
              </svg>
              {t('form.type.expense')}
            </label>
          </div>
          <div className="custom-radio">
            <input
              id="type-income"
              type="radio"
              name="type"
              value="income"
              className="sr-only"
              checked={type === 'income'}
              onChange={() => setType('income')}
            />
            <label
              htmlFor="type-income"
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('form.type.income')}
            </label>
          </div>
          <p className="sm:col-span-2 text-xs text-slate-500 dark:text-slate-400">
            {t('form.type.helper')}
          </p>
        </fieldset>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
        >
          {t('form.submit')}
        </button>
      </form>
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          id="clean-all-btn"
          type="button"
          onClick={onClearAll}
          className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300"
        >
          {t('form.clearAll')}
        </button>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          {t('form.clearAll.helper')}
        </p>
      </div>
      <CategoryPicker
        isOpen={categoryPickerOpen}
        selected={category}
        onSelect={setCategory}
        onClose={() => setCategoryPickerOpen(false)}
        transactionType={type}
        customCategories={customCategories}
        onAddCustomCategory={onAddCustomCategory}
      />
    </>
  );
}

export default TransactionForm;
