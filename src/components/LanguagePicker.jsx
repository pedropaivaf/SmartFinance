import React from 'react';
import { useTranslation, LANGUAGES } from '../i18n/index.jsx';

export default function LanguagePicker({ isOpen, onClose }) {
  const { t, lang, setLang } = useTranslation();

  if (!isOpen) return null;

  const handleSelect = (code) => {
    setLang(code);
    onClose();
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-[#1E1D1C] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-[#D4D0C8] dark:bg-[#3A3835]" />
        </div>

        {/* Title */}
        <div className="px-6 pt-3 pb-4 border-b border-[#E8E5E0] dark:border-[#2D2B28]">
          <h2 className="text-lg font-serif text-[#1A1A1A] dark:text-[#E8E4DF] text-center">
            {t('language.picker.title')}
          </h2>
        </div>

        {/* Language options */}
        <ul className="divide-y divide-[#E8E5E0] dark:divide-[#2D2B28]">
          {Object.entries(LANGUAGES).map(([code, { flag, name }]) => {
            const isSelected = code === lang;
            return (
              <li key={code}>
                <button
                  type="button"
                  onClick={() => handleSelect(code)}
                  className="w-full flex items-center gap-4 px-6 py-4 hover:bg-[#F4F3EF] dark:hover:bg-[#1A1918] active:bg-[#E8E5E0] dark:active:bg-[#2D2B28] transition-colors text-left"
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

        {/* Close button */}
        <div className="px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-[#F4F3EF] dark:bg-[#1A1918] text-[#6B6B6B] dark:text-[#A09A92] text-sm font-medium hover:bg-[#E8E5E0] dark:hover:bg-[#2D2B28] transition-colors"
          >
            {t('common.cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}
