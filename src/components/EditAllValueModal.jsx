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
      alert('Por favor, insira um valor valido.');
      return;
    }
    onSubmit(numericValue);
  };

  return (
    <div
      id="edit-all-value-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-xl p-6 md:p-8">
        <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF] mb-4">Alterar Valor das Parcelas Futuras</h2>
        <form id="edit-all-value-form" onSubmit={handleSubmit}>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mb-4">
            Digite o novo valor para cada uma das parcelas futuras que ainda nao foram pagas. Esta acao nao pode ser desfeita.
          </p>
          <label htmlFor="new-installment-value" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1 block">
            Novo valor (R$)
          </label>
          <input
            id="new-installment-value"
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            className="w-full p-2 mb-4 border border-[#E8E5E0] dark:border-[#2D2B28] bg-white dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] rounded-md focus:ring-2 focus:ring-[#1B4965] focus:border-[#1B4965] transition"
            required
          />
          <div className="flex gap-4">
            <button
              type="button"
              data-close-modal="edit-all-value-modal"
              onClick={onClose}
              className="w-full bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold py-2 px-4 rounded-lg hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full bg-[#1B4965] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#153B52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4965] transition"
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
