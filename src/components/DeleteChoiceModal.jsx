import React from 'react';

function DeleteChoiceModal({ isOpen, onClose, onDeleteSingle, onDeleteAll }) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'delete-choice-modal') {
      onClose();
    }
  };

  return (
    <div
      id="delete-choice-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-[#9B2226]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Excluir Parcela</h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
            Voce esta excluindo uma transacao parcelada. O que deseja fazer?
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <button
            id="delete-all-btn"
            type="button"
            onClick={onDeleteAll}
            className="w-full bg-[#9B2226] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#7F1D1F] transition"
          >
            Excluir Todas as Parcelas
          </button>
          <button
            id="delete-single-btn"
            type="button"
            onClick={onDeleteSingle}
            className="w-full bg-[#9B2226]/10 dark:bg-[#E76F51]/15 text-[#9B2226] dark:text-[#E76F51] font-semibold py-2 px-4 rounded-lg hover:bg-[#9B2226]/20 dark:hover:bg-[#E76F51]/25 transition"
          >
            Excluir Apenas Esta Parcela
          </button>
          <button
            type="button"
            data-close-modal="delete-choice-modal"
            onClick={onClose}
            className="w-full text-center text-sm font-semibold text-[#6B6B6B] dark:text-[#A09A92] py-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChoiceModal;
