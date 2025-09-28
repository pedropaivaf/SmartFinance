import React, { useEffect, useState } from 'react';

function EditAllValueModal({ isOpen, onClose, onSubmit }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'edit-all-value-modal') {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const numericValue = parseFloat(value);
    if (Number.isNaN(numericValue) || numericValue < 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }
    onSubmit(numericValue);
  };

  return (
    <div
      id="edit-all-value-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Alterar Valor das Parcelas Futuras</h2>
        <form id="edit-all-value-form" onSubmit={handleSubmit}>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Digite o novo valor para cada uma das parcelas futuras que ainda não foram pagas. Esta ação não pode ser desfeita.
          </p>
          <label htmlFor="new-installment-value" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
            Novo valor (R$)
          </label>
          <input
            id="new-installment-value"
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full p-2 mb-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            required
          />
          <div className="flex gap-4">
            <button
              type="button"
              data-close-modal="edit-all-value-modal"
              onClick={onClose}
              className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Aplicar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditAllValueModal;

