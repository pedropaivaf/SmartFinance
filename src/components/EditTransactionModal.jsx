import React, { useEffect, useState } from 'react';

const formatDateInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

function EditTransactionModal({ isOpen, transaction, onClose, onSubmit }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [type, setType] = useState('income');
  const [recurrence, setRecurrence] = useState('single');

  useEffect(() => {
    if (!transaction) {
      setDescription('');
      setAmount('');
      setDate('');
      setType('income');
      setRecurrence('single');
      return;
    }

    const sanitizedDescription = transaction.recurrence === 'installment'
      ? transaction.description.replace(/\s\(\d+\/\d+\)$/u, '')
      : transaction.description;

    setDescription(sanitizedDescription);
    setAmount(Math.abs(transaction.amount).toString());
    setDate(formatDateInput(transaction.createdAt));
    setType(transaction.type);
    setRecurrence(transaction.recurrence);
  }, [transaction, isOpen]);

  if (!isOpen || !transaction) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'edit-modal') {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedDescription = description.trim();
    const numericAmount = parseFloat(amount);

    if (!trimmedDescription || Number.isNaN(numericAmount) || numericAmount <= 0) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    if (!date) {
      alert('Por favor, selecione uma data válida.');
      return;
    }

    onSubmit({
      id: transaction.id,
      description: trimmedDescription,
      amount: numericAmount,
      type,
      date,
      recurrence,
    });
  };

  return (
    <div
      id="edit-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Editar Transação</h2>
          <button
            id="close-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="edit-transaction-form" className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="edit-description" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Descrição
            </label>
            <input
              id="edit-description"
              type="text"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-amount" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Valor (R$)
              </label>
              <input
                id="edit-amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
            <div>
              <label htmlFor="edit-date" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Data
              </label>
              <input
                id="edit-date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="custom-radio">
              <input
                id="edit-type-income"
                type="radio"
                name="edit-type"
                value="income"
                className="sr-only"
                checked={type === 'income'}
                onChange={() => setType('income')}
              />
              <label
                htmlFor="edit-type-income"
                className="w-full text-center p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Renda
              </label>
            </div>
            <div className="custom-radio custom-radio-expense">
              <input
                id="edit-type-expense"
                type="radio"
                name="edit-type"
                value="expense"
                className="sr-only"
                checked={type === 'expense'}
                onChange={() => setType('expense')}
              />
              <label
                htmlFor="edit-type-expense"
                className="w-full text-center p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Despesa
              </label>
            </div>
          </div>
          <div>
            <label htmlFor="edit-recurrence" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
              Tipo de Recorrência
            </label>
            <select
              id="edit-recurrence"
              value={recurrence}
              onChange={(event) => setRecurrence(event.target.value)}
              className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
            >
              <option value="single">Única</option>
              <option value="monthly">Mensal (Recorrente)</option>
              <option value="installment">Parcelada</option>
            </select>
          </div>
          <div className="flex gap-4 pt-2">
            <button
              id="cancel-edit-btn"
              type="button"
              onClick={onClose}
              className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-3 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;

