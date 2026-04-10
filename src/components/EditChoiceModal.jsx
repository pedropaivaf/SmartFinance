import React from 'react';

function EditChoiceModal({ isOpen, onClose, onEditSingle, onEditAll }) {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'edit-choice-modal') {
      onClose();
    }
  };

  return (
    <div
      id="edit-choice-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-xl p-6 md:p-8">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-[#1B4965] dark:text-[#5FA8D3]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          <h2 className="text-xl font-bold font-serif text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">Editar Parcela</h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-2">
            Voce esta editando uma transacao parcelada. O que deseja fazer?
          </p>
        </div>
        <div className="flex flex-col gap-3 mt-6">
          <button
            id="edit-all-choice-btn"
            type="button"
            onClick={onEditAll}
            className="w-full bg-[#1B4965] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#153B52] transition"
          >
            Alterar Valor das Futuras
          </button>
          <button
            id="edit-single-choice-btn"
            type="button"
            onClick={onEditSingle}
            className="w-full bg-[#E8F0F4] dark:bg-[#1B2B35] text-[#1B4965] dark:text-[#5FA8D3] font-semibold py-2 px-4 rounded-lg hover:bg-[#D4E6ED] dark:hover:bg-[#243845] transition"
          >
            Editar Apenas Esta Parcela
          </button>
          <button
            type="button"
            data-close-modal="edit-choice-modal"
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

export default EditChoiceModal;
