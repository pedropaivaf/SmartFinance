import React from 'react';

function ConfirmDeleteModal({ isOpen, onCancel, onConfirm }) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'confirm-delete-modal') {
      onCancel();
    }
  };

  return (
    <div
      id="confirm-delete-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">Apagar Tudo?</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
            Tem certeza que deseja apagar todas as transações? Esta ação não pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onCancel}
            className="w-full bg-slate-200 dark:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition"
          >
            Cancelar
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            className="w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
          >
            Sim, Apagar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;

