import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation } from '../i18n/index.jsx';

function PrivacyPolicyModal({ isOpen, onClose }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="modal-overlay fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]"
      onClick={handleOverlayClick}
    >
      <div className="modal-container animate-slide-up w-[calc(100%-32px)] max-w-sm bg-white dark:bg-[#1E1D1C] rounded-2xl shadow-xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#E8E5E0] dark:border-[#2D2B28]">
          <h3 className="text-base font-bold font-display text-[#1A1A1A] dark:text-[#E8E4DF]">
            {t('privacy.title')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 rounded-full hover:bg-[#F4F3EF] dark:hover:bg-[#2D2B28] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#9B9B9B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-sm text-[#1A1A1A] dark:text-[#E8E4DF] leading-relaxed">
          <p className="text-xs text-[#9B9B9B] dark:text-[#6B6560]">
            {t('privacy.lastUpdated')}
          </p>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s1.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s1.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s2.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s2.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s3.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s3.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s4.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s4.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s5.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s5.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s6.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s6.body')}</p>
          </section>

          <section>
            <h4 className="font-semibold mb-1.5">{t('privacy.s7.title')}</h4>
            <p className="text-[#6B6B6B] dark:text-[#A09A92]">{t('privacy.s7.body')}</p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E8E5E0] dark:border-[#2D2B28]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#1B4965] text-white font-semibold text-sm hover:bg-[#153B52] transition min-h-[44px]"
          >
            {t('privacy.close')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default PrivacyPolicyModal;
