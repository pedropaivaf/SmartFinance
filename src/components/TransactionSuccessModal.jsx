import React, { useEffect } from 'react';

function TransactionSuccessModal({ isOpen, transactionType, onClose, onGoToHistory }) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isIncome = transactionType === 'income';

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50"
      onClick={handleOverlayClick}
    >
      <div className="modal-container animate-slide-up w-full sm:max-w-sm bg-white dark:bg-[#1E1D1C] rounded-t-2xl sm:rounded-2xl shadow-xl p-6 relative">
        {/* Close button */}
        <div className="flex justify-end -mt-1 -mr-1 mb-2">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[#9B9B9B] hover:text-[#1A1A1A] dark:hover:text-[#E8E4DF] hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="text-center">
          {/* Success icon */}
          <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
            isIncome
              ? 'bg-[#E8F0F4] dark:bg-[#1B2B35]'
              : 'bg-red-50 dark:bg-red-950/30'
          }`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-8 w-8 ${isIncome ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#9B2226] dark:text-[#E76F51]'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-[#1A1A1A] dark:text-[#E8E4DF] mt-4">
            {isIncome ? 'Renda adicionada!' : 'Despesa adicionada!'}
          </h2>
          <p className="text-sm text-[#6B6B6B] dark:text-[#A09A92] mt-1.5">
            {isIncome
              ? 'Sua renda foi registrada com sucesso.'
              : 'Sua despesa foi registrada com sucesso.'}
          </p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-[#F4F3EF] dark:bg-[#2D2B28] text-[#1A1A1A] dark:text-[#E8E4DF] font-semibold text-sm hover:bg-[#E8E5E0] dark:hover:bg-[#3A3835] transition min-h-[44px]"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={onGoToHistory}
            className="flex-1 py-3 px-4 rounded-xl text-white font-semibold text-sm transition min-h-[44px]"
            style={{ background: 'var(--accent)' }}
          >
            Ver Histórico
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionSuccessModal;
