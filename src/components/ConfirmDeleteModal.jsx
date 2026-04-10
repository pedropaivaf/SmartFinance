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
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-[#9B2226]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Apagar Tudo?</h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
            Tem certeza que deseja apagar todas as transacoes? Esta acao nao pode ser desfeita.
          </p>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            id="cancel-delete-btn"
            type="button"
            onClick={onCancel}
            className="w-full bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold py-2 px-4 rounded-lg hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition"
          >
            Cancelar
          </button>
          <button
            id="confirm-delete-btn"
            type="button"
            onClick={onConfirm}
            className="w-full bg-[#9B2226] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#7F1D1F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#9B2226] transition"
          >
            Sim, Apagar Tudo
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDeleteModal;
