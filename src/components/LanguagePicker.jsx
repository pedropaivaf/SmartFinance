import React from 'react';
import ReactDOM from 'react-dom';
import { useTranslation, LANGUAGES } from '../i18n/index.jsx';

export default function LanguagePicker({ isOpen, onClose }) {
  const { t, lang, setLang } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = (code) => {
    setLang(code);
    onClose();
  };

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
            {t('language.picker.title')}
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

        {/* Language options */}
        <ul className="flex-1 overflow-y-auto divide-y divide-[#E8E5E0] dark:divide-[#2D2B28]">
          {Object.entries(LANGUAGES).map(([code, { flag, name }]) => {
            const isSelected = code === lang;
            return (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] active:bg-[#E8E5E0] dark:active:bg-[#2D2B28] transition-colors text-left min-h-[52px]"
                >
                  <span className="text-2xl">{flag}</span>
                  <span className={`flex-1 text-sm font-medium ${isSelected ? 'text-[#1B4965] dark:text-[#5FA8D3]' : 'text-[#1A1A1A] dark:text-[#E8E4DF]'}`}>
                    {name}
                  </span>
                  {isSelected && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1B4965] dark:text-[#5FA8D3] flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-[#E8E5E0] dark:border-[#2D2B28]" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] text-sm font-medium hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28] transition-colors min-h-[44px]"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
