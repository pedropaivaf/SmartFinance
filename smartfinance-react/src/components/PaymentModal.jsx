import React, { useEffect, useState } from 'react';

function PaymentModal({ isOpen, onClose, onConfirm }) {
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [creditCardName, setCreditCardName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPaymentMethod('pix');
      setCreditCardName('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target.id === 'payment-modal') {
      onClose();
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedCreditName = creditCardName.trim();
    onConfirm({
      paymentMethod,
      creditCardName: paymentMethod === 'credit' ? trimmedCreditName : null,
    });
  };

  return (
    <div
      id="payment-modal"
      role="dialog"
      aria-modal="true"
      className="modal-overlay fixed inset-0 bg-slate-900/50 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="modal-container w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Confirmar Pagamento</h2>
          <button
            id="close-payment-modal-btn"
            type="button"
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form id="payment-form" className="space-y-4" onSubmit={handleSubmit}>
          <p className="text-sm text-slate-600 dark:text-slate-400">Selecione como esta despesa foi paga:</p>
          <div className="space-y-2">
            <div className="custom-radio">
              <input
                id="payment-pix"
                type="radio"
                name="payment-method"
                value="pix"
                className="sr-only"
                checked={paymentMethod === 'pix'}
                onChange={() => setPaymentMethod('pix')}
              />
              <label
                htmlFor="payment-pix"
                className="w-full flex items-center gap-3 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Pix
              </label>
            </div>
            <div className="custom-radio">
              <input
                id="payment-debit"
                type="radio"
                name="payment-method"
                value="debit"
                className="sr-only"
                checked={paymentMethod === 'debit'}
                onChange={() => setPaymentMethod('debit')}
              />
              <label
                htmlFor="payment-debit"
                className="w-full flex items-center gap-3 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Cartão (Débito)
              </label>
            </div>
            <div className="custom-radio">
              <input
                id="payment-credit"
                type="radio"
                name="payment-method"
                value="credit"
                className="sr-only"
                checked={paymentMethod === 'credit'}
                onChange={() => setPaymentMethod('credit')}
              />
              <label
                htmlFor="payment-credit"
                className="w-full flex items-center gap-3 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Cartão (Crédito)
              </label>
            </div>
            <div
              id="credit-card-name-group"
              className={`pl-2 pt-2 ${paymentMethod === 'credit' ? '' : 'hidden'}`}
            >
              <label htmlFor="credit-card-name" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1 block">
                Nome do Cartão (Opcional)
              </label>
              <input
                id="credit-card-name"
                type="text"
                value={creditCardName}
                onChange={(event) => setCreditCardName(event.target.value)}
                placeholder="Ex: Nubank"
                className="w-full p-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
            </div>
            <div className="custom-radio">
              <input
                id="payment-cash"
                type="radio"
                name="payment-method"
                value="cash"
                className="sr-only"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
              />
              <label
                htmlFor="payment-cash"
                className="w-full flex items-center gap-3 p-3 border-2 border-slate-300 dark:border-slate-600 rounded-md cursor-pointer font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition duration-200"
              >
                Dinheiro
              </label>
            </div>
          </div>
          <div className="flex pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              Confirmar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PaymentModal;

