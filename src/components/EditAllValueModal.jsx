import React, { useEffect, useState } from 'react';

const inputBase =
  'w-full block text-sm px-3.5 py-3 rounded-xl border border-[#E8E5E0] dark:border-[#2D2B28] ' +
  'bg-white dark:bg-[#1A1918] text-[#1A1A1A] dark:text-[#E8E4DF] ' +
  'placeholder:text-[#9B9B9B] dark:placeholder:text-[#6B6560] focus:outline-none focus:ring-2 ' +
  'focus:ring-[#1B4965] focus:border-[#1B4965] transition leading-tight';

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
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="modal-container animate-slide-up w-full sm:max-w-sm bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF]">Alterar Valor</h2>
            <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560] mt-0.5">Parcelas futuras não pagas</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 -mt-1 rounded-full text-[#9B9B9B] hover:text-[#1A1A1A] dark:hover:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92]">
            Digite o novo valor para cada parcela futura. Esta ação não pode ser desfeita.
          </p>
          <div>
            <label htmlFor="new-installment-value" className="text-sm font-medium text-[#6B6B6B] dark:text-[#A09A92] mb-1.5 block">
              Novo valor (R$)
            </label>
            <input
              id="new-installment-value"
              type="number"
              min="0"
              step="0.01"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              placeholder="0,00"
              className={inputBase}
              required
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold py-3 px-4 rounded-xl hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition min-h-[44px] text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#153B52] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1B4965] transition min-h-[44px] text-sm"
              style={{ background: 'var(--accent)' }}
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
