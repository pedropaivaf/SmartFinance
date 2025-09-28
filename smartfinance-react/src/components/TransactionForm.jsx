import React, { useEffect, useMemo, useState } from 'react';

const formatDate = (date) => date.toISOString().split('T')[0];

function TransactionForm({ onAddTransactions, onClearAll }) {
  const today = useMemo(() => formatDate(new Date()), []);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(today);
  const [recurrence, setRecurrence] = useState('single');
  const [installments, setInstallments] = useState('');
  const [installmentStartDate, setInstallmentStartDate] = useState(today);
  const [paidInstallments, setPaidInstallments] = useState('0');
  const [type, setType] = useState('income');

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
    setRecurrence('single');
    setInstallments('');
    setPaidInstallments('0');
    const current = formatDate(new Date());
    setTransactionDate(current);
    setInstallmentStartDate(current);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      return;
    }

    const numericAmount = parseFloat(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, informe um valor válido.');
      return;
    }

    const selectedDate = new Date(`${transactionDate}T12:00:00`);
    if (Number.isNaN(selectedDate.getTime())) {
      alert('Por favor, informe uma data válida.');
      return;
    }

    const newTransactions = [];

    if (isInstallment && type === 'expense') {
      const totalInstallments = parseInt(installments, 10);
      const paidInstallmentsCount = parseInt(paidInstallments, 10) || 0;
      const startDate = new Date(`${installmentStartDate}T12:00:00`);

      if (Number.isNaN(startDate.getTime())) {
        alert('Informe uma data válida para o início das parcelas.');
        return;
      }

      if (!Number.isInteger(totalInstallments) || totalInstallments < 2) {
        alert('O número de parcelas deve ser maior ou igual a 2.');
        return;
      }

      if (paidInstallmentsCount > totalInstallments) {
        alert('Parcelas pagas não podem ser maiores que o total de parcelas.');
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
          createdAt: installmentDate.toISOString(),
          recurrence: 'installment',
          paid: isPaid,
          paymentMethod: isPaid ? 'cash' : null,
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
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Nova Transação</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Registre aqui suas movimentações financeiras, sejam elas entradas ou despesas.
        </p>
      </div>
      <form id="transaction-form" className="mt-4 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="description" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
            Descrição
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Salário, aluguel, supermercado"
            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
            aria-describedby="description-helper"
          />
          <p id="description-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Nome para identificar a transação
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="amount" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Valor (R$)
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              placeholder="250,50"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
              aria-describedby="amount-helper"
            />
            <p id="amount-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Informe o Valor da transação
            </p>
          </div>
          <div>
            <label htmlFor="transaction-date" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Data
            </label>
            <input
              id="transaction-date"
              type="date"
              value={transactionDate}
              onChange={(event) => setTransactionDate(event.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
              aria-describedby="date-helper"
            />
            <p id="date-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Use a data de ocorrência da transação. Ela define em qual mês o lançamento aparecerá.
            </p>
          </div>
        </div>
        <div>
          <label htmlFor="recurrence" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
            Tipo de Recorrência
          </label>
          <select
            id="recurrence"
            value={recurrence}
            onChange={(event) => setRecurrence(event.target.value)}
            className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            aria-describedby="recurrence-helper"
          >
            <option value="single">Única</option>
            <option value="monthly">Mensal (recorrente)</option>
            <option value="installment">Parcelada</option>
          </select>
          <p id="recurrence-helper" className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Escolha "Mensal" para lançamentos recorrentes (ex.: salário) ou "Parcelada" para dividir uma despesa em parcelas.
          </p>
        </div>
        {isInstallment && (
          <div className="space-y-4">
            <div>
              <label htmlFor="installments" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Número de Parcelas
              </label>
              <input
                id="installments"
                type="number"
                min="2"
                value={installments}
                onChange={(event) => setInstallments(event.target.value)}
                placeholder="Ex.: 6"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="installment-start-date" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
                Início da Contagem das Parcelas
              </label>
              <input
                id="installment-start-date"
                type="date"
                value={installmentStartDate}
                onChange={(event) => setInstallmentStartDate(event.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Defina quando a primeira parcela vence. As próximas serão geradas automaticamente mês a mês.
              </p>
            </div>
          </div>
        )}
        {showPaidInstallments && (
          <div>
            <label htmlFor="paid-installments" className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">
              Parcelas já pagas (opcional)
            </label>
            <input
              id="paid-installments"
              type="number"
              min="0"
              value={paidInstallments}
              onChange={(event) => setPaidInstallments(event.target.value)}
              placeholder="Ex.: 2"
              className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Informe quantas parcelas dessa compra já foram quitadas para manter o histórico coerente.
            </p>
          </div>
        )}
        <fieldset className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4" aria-label="Tipo de lançamento">
          <legend className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            Este lançamento é:
          </legend>
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
              Renda
            </label>
          </div>
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
              Despesa
            </label>
          </div>
          <p className="sm:col-span-2 text-xs text-slate-500 dark:text-slate-400">
            Rendas aumentam o saldo; despesas reduzem. Você pode alterar o tipo a qualquer momento na lista de lançamentos.
          </p>
        </fieldset>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300"
        >
          Adicionar transação
        </button>
      </form>
      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          id="clean-all-btn"
          type="button"
          onClick={onClearAll}
          className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-300"
        >
          Limpar todos os lançamentos
        </button>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          remove todas as transações salvas
        </p>
      </div>
    </>
  );
}

export default TransactionForm;