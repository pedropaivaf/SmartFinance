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
      className="modal-overlay fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Excluir Parcela</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Você está excluindo uma transação parcelada. O que deseja fazer?
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <button
            id="delete-all-btn"
            type="button"
            onClick={onDeleteAll}
            className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
          >
            Excluir Todas as Parcelas
          </button>
          <button
            id="delete-single-btn"
            type="button"
            onClick={onDeleteSingle}
            className="w-full bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold py-2 px-4 rounded-lg hover:bg-red-300 dark:hover:bg-red-900/60 transition"
          >
            Excluir Apenas Esta Parcela
          </button>
          <button
            type="button"
            data-close-modal="delete-choice-modal"
            onClick={onClose}
            className="w-full text-center text-sm font-semibold text-slate-600 dark:text-slate-400 py-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteChoiceModal;

