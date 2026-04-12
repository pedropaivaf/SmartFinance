import React, { useEffect, useState } from 'react';

function TransactionSuccessModal({ isOpen, transactionType, onClose }) {
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit'

  useEffect(() => {
    if (!isOpen) {
      setPhase('enter');
      return;
    }
    // Entrance animation
    setPhase('enter');
    const enterTimer = setTimeout(() => setPhase('visible'), 50);
    // Auto-close after 2s
    const closeTimer = setTimeout(() => {
      setPhase('exit');
      setTimeout(onClose, 400);
    }, 2000);
    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isIncome = transactionType === 'income';

  const bgClass = isIncome
    ? 'bg-gradient-to-b from-[#1B4965] to-[#143A52] dark:from-[#0F2B3D] dark:to-[#0A1F2D]'
    : 'bg-gradient-to-b from-[#D4726A] to-[#B84C4C] dark:from-[#7A2C2F] dark:to-[#3D1517]';

  const opacity = phase === 'visible' ? 'opacity-100' : 'opacity-0';
  const scale = phase === 'visible' ? 'scale-100' : phase === 'enter' ? 'scale-110' : 'scale-95';

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center transition-opacity duration-400 ${bgClass} ${opacity}`}
      style={{ transitionDuration: '400ms' }}
    >
      <div className={`text-center transition-transform duration-500 ${scale}`} style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {/* Animated check circle */}
        <div className="success-icon-animate mx-auto w-24 h-24 rounded-full bg-white/10 ring-2 ring-white/20 flex items-center justify-center mb-8">
          <div className="w-16 h-16 rounded-full bg-white/25 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">
          {isIncome ? 'Renda adicionada!' : 'Despesa adicionada!'}
        </h2>
        <p className="text-white/80 text-sm">
          {isIncome
            ? 'Sua renda foi registrada com sucesso.'
            : 'Sua despesa foi registrada com sucesso.'}
        </p>
      </div>
    </div>
  );
}

export default TransactionSuccessModal;
